---
title: 一篇加密的私密日记
date: 2026-07-19 12:30:00
tags: [日记]
categories: [生活]
password: test123
password_hint: 测试密码
---

## 这是加密文章的内容

如果你能看到这段文字，说明你已经成功输入了正确的密码。

### 加密原理

1. 你在 `_posts/*.md` 文章的 frontmatter 中设置 `password` 字段
2. 构建时，Node.js 使用 **AES-256-GCM** 加密文章内容
3. 密码通过 **PBKDF2**（100,000 次迭代）派生为加密密钥
4. 加密后的数据（salt + IV + 密文 + 认证标签）内嵌在 HTML 中
5. 浏览器端使用 **Web Crypto API** 解密，密码从不离开浏览器

### 使用方法

在文章 frontmatter 中添加：

```yaml
---
title: 你的文章标题
password: your_password_here
password_hint: 可选的密码提示
---
```

然后正常 `hexo generate` 构建即可，一切自动完成。
