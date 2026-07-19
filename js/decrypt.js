(async function () {
  const el = document.getElementById('encrypted-data');
  const form = document.getElementById('decrypt-form');
  const input = document.getElementById('password-input');
  const error = document.getElementById('error-msg');
  const prompt = document.getElementById('password-prompt');
  const content = document.getElementById('decrypted-content');
  if (!el || !form || !input || !error || !prompt || !content) return;

  var encData;
  try { encData = JSON.parse(el.textContent); } catch (e) { return; }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    error.textContent = '';

    try {
      var enc = new TextEncoder();
      var salt = Uint8Array.from(atob(encData.salt), function (c) { return c.charCodeAt(0); });
      var iv = Uint8Array.from(atob(encData.iv), function (c) { return c.charCodeAt(0); });
      var ct = Uint8Array.from(atob(encData.ciphertext), function (c) { return c.charCodeAt(0); });
      var tag = Uint8Array.from(atob(encData.authTag), function (c) { return c.charCodeAt(0); });

      var keyMaterial = await crypto.subtle.importKey('raw', enc.encode(input.value), 'PBKDF2', false, ['deriveKey']);
      var key = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );

      var combined = new Uint8Array(ct.length + tag.length);
      combined.set(ct);
      combined.set(tag, ct.length);

      var decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, combined);
      content.innerHTML = new TextDecoder().decode(decrypted);
      prompt.style.display = 'none';
      content.style.display = '';

      if (history.replaceState) {
        history.replaceState(null, '', location.pathname + '#unlocked');
      }
    } catch (err) {
      error.textContent = '密码错误，请重试。';
      input.value = '';
      input.focus();
    }
  });

  input.focus();
})();
