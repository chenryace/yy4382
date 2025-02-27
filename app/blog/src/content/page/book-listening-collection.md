---
title: 我的听书方法汇总
tags:
  - 听书
date: 2024-03-10T23:47:43+08:00
updated: 2025-02-22T16:11:53+08:00
slug: book-listening-collection
---

自从 23 年 4 月，我发了数篇关于听书的介绍&教程。但是，由于这些方法散落在各篇文章中，而且有些已经失效，可能会迷惑的某些人。因此，我决定新开一个页面专门用来汇总我介绍过的听书方法，并且持续更新。

## 一表流

|       名称       |  状态   | 链接 🔗                                                                                                                   |
| :--------------: | :-----: | :------------------------------------------------------------------------------------------------------------------------ |
| Azure 文本转语音 | ✅ 可用 | [创建资源教程][tts-importer-reg] \| [导入器][tts-importer-web]                                                            |
|  Edge 大声朗读   | ✅ 可用 | 新版 [CF Workers 版][read-aloud-github] <br> 旧版教程 [Vercel版][ra-vercel-tutorial] \| [Docker 版][ra-selfhost-tutorial] |
|   星铁语音导入   | ❌ 失效 | [油猴脚本](https://github.com/yy4382/genshinvoice-import) \| [语音网站](https://bv2.firefly.matce.cn/)                    |
|  Azure 试用接口  | ❌ 失效 | [教程](/post/azure-tts-trial)                                                                                             |

## 有哪些语音？

我主要研究的是微软的语音，也就是 Azure 的 Text to Speech 服务，它的代表语音是晓晓和云希。可以试着点击一下下方的播放按钮，我觉得你大概率对这些语音比较耳熟。

同时，我也制作过 [这个星铁语音](https://bv2.firefly.matce.cn/) 网站的语音导入，使用了油猴脚本。详见 [yy4382/genshinvoice-import: 将 https://bv2.firefly.matce.cn 中的原神语音导入到小说软件中用于听书。](https://github.com/yy4382/genshinvoice-import)

## 有哪些方法能用？

星铁语音导入~~已经失效~~ ~~又复活了，现在可用~~又失效了。

对于微软语音，现在来看，还可以正常使用的方法有两种：

1. 微软给它的不少服务（比如 Edge 和 Word）提供了一个叫“大声朗读 (Read Aloud)”的功能，它的背后就是 Azure 的 TTS 服务；我们可以使用这个接口来合成语音。
2. 注册 Azure，使用它每月赠送的 50 万字符合成量。这是最正统的方法，我主要是为数个常用的小说阅读器制作了[一键导入器][tts-importer-web]。只要注册好了 Azure 并获得了 API Key，就可以一键将自己喜欢的语音导入自己喜欢的阅读器了。

## 方法的优劣如何？

简单的表格对比：

|      | 大声朗读 API                                                                           | Azure 官方 API                         |
| ---- | -------------------------------------------------------------------------------------- | -------------------------------------- |
| 优点 | - 不用 Azure 账号                                                                      | - 稳定的访问和使用<br>- 完整的功能     |
| 缺点 | - 较为严格的请求频率限制<br>- 只可用部分声音（热门的那几个）<br>- 无声音风格等高级功能 | - 需要注册一个账号（需要非银联银行卡） |

## 教程链接

> 不要害怕，都很简单！除了爱阅书香（因为不支持），我基本上都做了一键导入，点点点就好。

首先，根据上面的表格选择合适的方法。虽然我自认为两种方法的教程都是新手友好的，但是似乎大家都更喜欢大声朗读 API 一些。因此，如果你还在犹豫，不如选择第一种方法吧！

### 大声朗读（Read Aloud）

[Cloudflare / 自建服务器上的 Read Aloud][read-aloud-github]

新方法。可以部署在 Cloudflare Workers 或者自己的服务器上。适用于爱阅记、阅读、源阅读。

🔗 [微软TTS Vercel部署教程][ra-vercel-tutorial]

最受欢迎的教程。可能也是最简单的教程。适用于（安卓的）阅读、爱阅书香、爱阅记。

🔗 [配置微软 TTS 听书 - Docker 自建版][ra-selfhost-tutorial]

~~和上文基本相同，适合有自己服务器的人。~~ 现在不再推荐这样。请使用上面的第一个方法。

🔗 [源阅读配置微软 TTS 听书][ra-sourcereader-tutorial]

方法和上文相同，只是写了一些关于源阅读的导入方法

### Azure API

实际上不需要教程，只要你拿到了 API 凭据，直接打开 <https://tts.yfi.moe>，就能一键导入到爱阅记、阅读、源阅读了。在导入网站上我也写了一些教程，不会的话可以看看。

如果你已经注册了 Azure，但是不知道从那里获取 API 凭据，我也写了一些教程。但是，还请你在读完本段剩下的话之后再打开下一段的链接，以免产生不必要的疑惑。下一段给出的链接原本介绍的方法已经失效，因此我将它“废物利用”，在它的前半部分添加了获取 Azure API 凭据的教程。所以，如果点开后看到“该方法已失效”，不要慌张，因为失效的不是你想用的方法😊。

[更方便地导入微软TTS听书：阅读、爱阅书香、源阅读][tts-importer-reg]

[read-aloud-github]: https://github.com/yy4382/read-aloud
[tts-importer-web]: https://tts.yfi.moe
[tts-importer-reg]: https://tts.yfi.moe/help/reg
[ra-vercel-tutorial]: /post/ifreetime-mstts-vercel
[ra-selfhost-tutorial]: /post/ifreetime-mstts-selfhost
[ra-sourcereader-tutorial]: /post/sourcereader-mstts
