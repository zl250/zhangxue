# 知乎的模仿与创作

- 学号：24001010727
- 姓名：张雪

## 项目说明

本项目以知乎为原型进行模仿与创作，前端使用原生 HTML、CSS、JavaScript（无第三方库与框架），后端使用 Node.js + Express（RESTful + MVC），数据库使用 MySQL。

## 技术栈

| 层次 | 技术 |
| --- | --- |
| 前端 | 原生 HTML / CSS / JavaScript，Canvas 背景动画 |
| 后端 | Node.js + Express，端口 727，接口前缀 `/api/` |
| 数据库 | MySQL |
| AI | SiliconFlow：DeepSeek-V4-Flash（对话/抽取）、BAAI/bge-m3（向量）、Qwen3-VL（图像） |

## 功能模块

- 首页、数据库连接、科技新闻、科技图文
- AI 对话：后端转发 DeepSeek，控制台输出发送与接收的完整数据
- 知识库问答（RAG）：上传 doc / docx / ppt / pptx / pdf / txt / md 文件，自动解析、分块、向量化，
  提问时按余弦相似度检索 Top 4 片段，再交给大模型生成带引用来源的回答；支持文档列表与删除
- AI 结构化抽取（Harness Engineering）：商业评论转固定结构 JSON（情感、方面词、实体、关键词、投诉），
  以及图片上传后的图像识别与 OCR，全部结果输出到控制台

## 目录结构

```
.
├─ AGENTS.md                 # 项目开发规范
├─ README.md
├─ Cheney_prompt.md          # AI 指令记录
├─ frontend/                 # 前端
│  ├─ index.html             # 首页（项目信息 + 页面导航）
│  ├─ database.html          # 数据库连接测试页
│  ├─ news.html              # 科技新闻列表页
│  ├─ gallery.html           # 科技图文列表页
│  ├─ chat.html              # AI 聊天页
│  ├─ kb.html                # 知识库问答页（上传 / 管理 / 问答）
│  ├─ harness.html           # AI 结构化抽取页（评论抽取 / 图像识别 OCR）
│  ├─ css/                   # 样式
│  ├─ js/                    # 脚本
│  ├─ fonts/                 # iconfont 图标文件
│  └─ images/                # 图片资源
└─ backend/                  # 后端
   ├─ app.js                 # 服务入口（727，托管 frontend）
   ├─ config/                # 数据库连接池
   ├─ controllers/           # 控制器
   ├─ models/                # 数据模型
   ├─ routes/                # 路由
   ├─ samples/               # 知识库示例文件与 OCR 示例图片
   ├─ uploads/               # 知识库上传文件（不提交）
   ├─ .env                   # 数据库与 API 密钥（不提交）
   ├─ Zhangxue_interface.md  # 接口文档
   └─ Zhangxue_database.md   # 数据库文档
```

## 运行方式

1. 安装依赖（后端依赖安装优先 `cnpm i 包名`，失败或超时再用 `npm i 包名`）：

   ```bash
   cd backend
   cnpm install
   ```

2. 在 `backend/.env` 中配置数据库连接与 API 密钥：

   ```
   DB_USER=你的用户名
   DB_PASSWORD=你的密码
   DB_HOST=localhost
   DB_NAME=你的数据库名
   SILICONFLOW_API_KEY=你的密钥
   SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1
   SILICONFLOW_MODEL=deepseek-ai/DeepSeek-V4-Flash
   SILICONFLOW_EMBED_MODEL=BAAI/bge-m3
   SILICONFLOW_VISION_MODEL=Qwen/Qwen3-VL-30B-A3B-Instruct
   ```

3. 启动服务：

   ```bash
   cd backend
   npm start
   ```

4. 浏览器访问：<http://localhost:727>

## 接口约定

统一响应格式：

```json
{ "code": 0, "msg": "提示信息", "data": {} }
```

`code = 0` 表示成功，非 `0` 表示失败。
