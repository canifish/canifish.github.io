const crypto = require('crypto');

hexo.extend.filter.register('after_post_render', function (data) {
  if (data.encrypted === true || data.encrypted === 'true') {
    // Pre-encrypted by admin SPA: parse cipher data from JSON code block in body
    var m = data.content.match(/```(?:json)?\s*\n([\s\S]*?)```/);
    if (m) {
      try {
        data.encrypted = JSON.parse(m[1]);
      } catch (e) {
        data.encrypted = { error: 'parse_failed' };
      }
    }
    data.content = '';
    data.excerpt = '';
    data.more = '';
    data.password = true;
    return data;
  }

  if (!data.password) return data;

  // Legacy: build-time encryption from plaintext password
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = crypto.pbkdf2Sync(data.password, salt, 100000, 32, 'sha256');

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let ciphertext = cipher.update(data.content, 'utf8', 'base64');
  ciphertext += cipher.final('base64');
  const authTag = cipher.getAuthTag();

  data.encrypted = {
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    ciphertext: ciphertext,
    authTag: authTag.toString('base64')
  };

  data.content = '';
  data.excerpt = '';
  data.more = '';
  data.password = true;

  return data;
});
