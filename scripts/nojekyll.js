const fs = require('fs');
const path = require('path');

hexo.extend.filter.register('after_generate', function () {
  fs.mkdirSync(hexo.public_dir, { recursive: true });
  fs.writeFileSync(path.join(hexo.public_dir, '.nojekyll'), '');
});
