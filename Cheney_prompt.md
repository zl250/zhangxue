# AI 开发指令记录

> 记录规则：每次向 AI 发出开发指令后追加一条，格式为 `时间 | 提示词全文 | 大模型名称`，只追加不覆盖。

---

## 2026-11-19

**时间**：2026-11-19

**提示词全文**：

```text
请初始化本项目：
1、 git init + .gitignore（排除 node_modules、.env）+ 首次提交
2、按 AGENTS.md 规则创建前后端目录骨架、安装依赖、
3、创建前端首页index.html，包括姓名:张雪、学号:24001010727、项目名称：知乎的模仿与创作、项目类别（模仿），所有完成的html页面的超链接。有canvas背景动画。主体是页面链接导航。页面美观。
4、创建readme.md，在根目录下，包括学号、姓名。
```

**大模型名称**：DeepSeek-V4.1-Flash

---

## 2026-11-19

**时间**：2026-11-19

**提示词全文**：

```text
创建运行后台的bat文件，在根目录下。
```

**大模型名称**：DeepSeek-V4.1-Flash

---

## 2026-11-19

**时间**：2026-11-19

**提示词全文**：

```text
创建database.html页面，输入用户名，密码，链接数据库，数据库使用mysql，成功和错误都有提示，默认用户名root，密码zx060225。
```

**大模型名称**：DeepSeek-V4.1-Flash

---

## 2026-11-19

**时间**：2026-11-19

**提示词全文**：

```text
完成科技新闻列表页面，新闻的数据存在数据库表里。网页显示后端接口链接和数据内容。
```

**大模型名称**：DeepSeek-V4.1-Flash

---

## 2026-11-19

**时间**：2026-11-19

**提示词全文**：

```text
完成图文列表，图片可以使用网络图片或创建图片，创建一个新的表，网页显示后端接口链接和数据内容
```

**大模型名称**：DeepSeek-V4.1-Flash

---

## 2026-11-19

**时间**：2026-11-19

**提示词全文**：

```text
创建技能 skill：提交到 GitHub，将本项目提交 commit 并 push 到 `https://github.com/zl250/zhangxue.git` ，使用已设置公钥。
```

**大模型名称**：DeepSeek-V4.1-Flash

---

## 2026-11-19（重试，push 成功）

**时间**：2026-11-19

**提示词全文**：同上（重复触发）

**大模型名称**：DeepSeek-V4.1-Flash

---

## 2026-11-23

**时间**：2026-11-23

**提示词全文**：

```text
创建AI聊天页面。
Api-key：sk-dfifvwhmwjoihbwnjqanbjrimjgudavpagxyfzrhztcnhtnt
curl --request POST \
  --url `https://api.siliconflow.cn/v1/chat/completions` \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "deepseek-ai/DeepSeek-V4-Flash",
    "messages": [
      {"role": "system", "content": "你是一个有用的助手"},
      {"role": "user", "content": "你好，请介绍一下你自己"}
    ]
  }'
在控制台里输出发送给大模型的数据和从大模型接收到的数据。
```

**大模型名称**：DeepSeek-V4.1-Flash

---

## 2026-11-23

**时间**：2026-11-23 14:13

**提示词全文**：

```text
完成知识库文件上传功能，构建2个知识库文件，完成基于知识库的问答，支持doc和docx，ppt，完成知识库管理(RAG): 基于本地文件(如 PDF/TXT) 上传、解析，构建专属自动客服或问答系统，包括知识库文件上传模块。在控制台输出发送给大模型的数据和接受自大模型的数据。
```

**大模型名称**：DeepSeek-V4.1-Flash

---
