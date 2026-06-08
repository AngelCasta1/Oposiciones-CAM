(function () {
  'use strict';

  const SALT_LENGTH = 16;
  const IV_LENGTH = 12;
  const ITERATIONS = 100000;
  const KEY_LENGTH = 256;


  function strToBytes(str) {
    return new TextEncoder().encode(str);
  }


  function bytesToStr(bytes) {
    return new TextDecoder().decode(bytes);
  }

 
  function bytesToBase64(bytes) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /* Convertir base64 -> Uint8Array */
  function base64ToBytes(b64) {
    const binary = atob(b64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  async function deriveKey(password, salt) {
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      strToBytes(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: ITERATIONS,
        hash: 'SHA-256'
      },
      passwordKey,
      { name: 'AES-GCM', length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /* CIFRAR */
  async function encrypt(plaintext, password) {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const key = await deriveKey(password, salt);

    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      strToBytes(plaintext)
    );

    // Combinar: salt + iv + ciphertext en un solo Uint8Array
    const combined = new Uint8Array(SALT_LENGTH + IV_LENGTH + ciphertext.byteLength);
    combined.set(salt, 0);
    combined.set(iv, SALT_LENGTH);
    combined.set(new Uint8Array(ciphertext), SALT_LENGTH + IV_LENGTH);

    return bytesToBase64(combined);
  }

  /* DESCIFRAR */
  async function decrypt(ciphertextB64, password) {
    const combined = base64ToBytes(ciphertextB64);

    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH);

    const key = await deriveKey(password, salt);

    try {
      const plaintext = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        ciphertext
      );
      return bytesToStr(new Uint8Array(plaintext));
    } catch (e) {
      throw new Error('Clave incorrecta o contenido corrupto');
    }
  }

  /* CARGAR Y DESCIFRAR contenido de un .json cifrado */
  async function loadEncrypted(url, password) {
    const resp = await fetch(url, { cache: 'no-cache' });
    if (!resp.ok) throw new Error('No se pudo cargar: ' + url);
    const json = await resp.json();
    if (!json.data) throw new Error('Formato de archivo cifrado inválido');
    return decrypt(json.data, password);
  }

  window.CAM_Crypto = {
    encrypt: encrypt,
    decrypt: decrypt,
    loadEncrypted: loadEncrypted
  };
})();
