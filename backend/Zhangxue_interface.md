# 接口文档（Zhangxue_interface.md）

> 记录规则：每次创建或修改接口后按序追加，字段为
> `接口路径 | HTTP 方法 | 请求参数（含示例） | 响应格式（含 JSON 示例） | 修改时间`。
>
> 统一响应格式：`{ "code": 0, "msg": "提示信息", "data": {} }`，`code = 0` 表示成功，非 `0` 表示失败。

---

## 1. 服务健康检查

- **接口路径**：`/api/health`
- **HTTP 方法**：`GET`
- **请求参数**：无（不需要请求体、查询参数或请求头）

  示例：

  ```http
  GET http://localhost:727/api/health
  ```

- **响应格式**：

  成功示例：

  ```json
  {
    "code": 0,
    "msg": "服务运行正常",
    "data": {
      "service": "zhangxue-zhihu-backend",
      "version": "1.0.0",
      "port": 727,
      "database": "MySQL",
      "time": "2026-11-19T10:00:00.000Z"
    }
  }
  ```

- **修改时间**：2026-11-19

---

## 2. 获取数据库默认配置

- **接口路径**：`/api/database/defaults`
- **HTTP 方法**：`GET`
- **请求参数**：无

  示例：

  ```http
  GET http://localhost:727/api/database/defaults
  ```

- **响应格式**：

  ```json
  {
    "code": 0,
    "msg": "获取默认配置成功",
    "data": {
      "username": "root",
      "password": "******",
      "host": "localhost",
      "port": 3306
    }
  }
  ```

  > 说明：`username`、`password` 读取自 `backend/.env` 的 `DB_USER`、`DB_PASSWORD`，不在代码中硬编码。

- **修改时间**：2026-11-19

---

## 3. 测试 MySQL 数据库连接

- **接口路径**：`/api/database/connect`
- **HTTP 方法**：`POST`
- **请求参数**：`Content-Type: application/json`

  | 参数 | 类型 | 必填 | 说明 |
  | --- | --- | --- | --- |
  | username | string | 是 | MySQL 用户名 |
  | password | string | 是 | MySQL 密码 |

  示例：

  ```json
  {
    "username": "root",
    "password": "******"
  }
  ```

- **响应格式**：

  连接成功：

  ```json
  {
    "code": 0,
    "msg": "数据库连接成功",
    "data": {
      "version": "8.0.30",
      "hostname": "LAPTOP-XXXX",
      "port": 3306
    }
  }
  ```

  用户名或密码错误：

  ```json
  {
    "code": 5001,
    "msg": "用户名或密码错误，请重新输入。",
    "data": {
      "errorCode": "ER_ACCESS_DENIED_ERROR"
    }
  }
  ```

  参数为空：

  ```json
  {
    "code": 400,
    "msg": "用户名和密码不能为空。",
    "data": null
  }
  ```

- **修改时间**：2026-11-19

---

## 4. 获取科技新闻列表

- **接口路径**：`/api/news`
- **HTTP 方法**：`GET`
- **请求参数**：无

  示例：

  ```http
  GET http://localhost:727/api/news
  ```

- **响应格式**：

  成功示例（列表按发布时间倒序，节选 1 条）：

  ```json
  {
    "code": 0,
    "msg": "获取科技新闻列表成功",
    "data": {
      "total": 10,
      "list": [
        {
          "Zhang_id": 1,
          "Zhang_title": "多模态大模型走进课堂，个性化辅导开始规模化落地",
          "Zhang_summary": "多家教育科技企业在本周公布新一代多模态教学模型……",
          "Zhang_source": "量子位",
          "Zhang_category": "人工智能",
          "Zhang_time": "2026-11-19 09:20",
          "Zhang_views": 15842
        }
      ]
    }
  }
  ```

  数据库查询失败：

  ```json
  {
    "code": 5002,
    "msg": "新闻数据查询失败，请检查数据库是否已初始化。",
    "data": {
      "errorCode": "ER_NO_SUCH_TABLE"
    }
  }
  ```

- **修改时间**：2026-11-19

---

## 5. 获取科技图文列表

- **接口路径**：`/api/gallery`
- **HTTP 方法**：`GET`
- **请求参数**：无

  示例：

  ```http
  GET http://localhost:727/api/gallery
  ```

- **响应格式**：

  成功示例（按创建时间倒序，节选 1 条）：

  ```json
  {
    "code": 0,
    "msg": "获取科技图文列表成功",
    "data": {
      "total": 8,
      "list": [
        {
          "Zhang_id": 1,
          "Zhang_title": "AI 算力中心的一天",
          "Zhang_desc": "成排的机柜在蓝色冷光中持续运转……",
          "Zhang_image": "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=...&image_size=landscape_4_3",
          "Zhang_tag": "人工智能",
          "Zhang_likes": 1286,
          "Zhang_time": "2026-11-19"
        }
      ]
    }
  }
  ```

  数据库查询失败：

  ```json
  {
    "code": 5003,
    "msg": "图文数据查询失败，请检查数据库是否已初始化。",
    "data": {
      "errorCode": "ER_NO_SUCH_TABLE"
    }
  }
  ```

- **修改时间**：2026-11-19

---

## 6. AI 聊天（转发 DeepSeek）

- **接口路径**：`/api/ai/chat`
- **HTTP 方法**：`POST`
- **请求参数**：JSON 请求体

  | 字段 | 类型 | 必填 | 说明 |
  | --- | --- | --- | --- |
  | messages | Array | 是 | 对话消息数组，1–20 条，最后一条必须是 user |
  | messages[].role | String | 是 | `user` 或 `assistant` |
  | messages[].content | String | 是 | 消息内容，单条不超过 2000 字符 |

  示例：

  ```json
  {
    "messages": [
      { "role": "user", "content": "你好，请介绍一下你自己" }
    ]
  }
  ```

- **响应格式**：

  成功示例：

  ```json
  {
    "code": 0,
    "msg": "AI 回复成功",
    "data": {
      "reply": "你好，我是知乎风格的 AI 助手……",
      "model": "deepseek-ai/DeepSeek-V4-Flash",
      "usage": {
        "prompt_tokens": 32,
        "completion_tokens": 48,
        "total_tokens": 80
      }
    }
  }
  ```

  参数错误：

  ```json
  {
    "code": 400,
    "msg": "最后一条消息必须来自用户。",
    "data": null
  }
  ```

  密钥无效：

  ```json
  {
    "code": 5004,
    "msg": "API 密钥无效，请检查 backend/.env 中的 SILICONFLOW_API_KEY。",
    "data": null
  }
  ```

- **说明**：服务端在调用大模型前后分别用 `console.log` 输出完整请求体与返回体；密钥只保存在 `backend/.env`，不下发到前端。
- **修改时间**：2026-11-23

---

## 知识库 RAG 接口

### 1. 上传知识库文件

- **接口路径**：`/api/kb/upload`
- **HTTP 方法**：`POST`
- **请求参数**：`multipart/form-data`，表单字段名 `file`，支持 `.doc`、`.docx`、`.ppt`、`.pptx`、`.pdf`、`.txt`、`.md`，单个文件不超过 20MB。

  示例：

  ```bash
  curl -X POST http://localhost:727/api/kb/upload \
    -F "file=@backend/samples/张雪知乎项目技术说明书.docx"
  ```

- **响应格式**：

  成功示例：

  ```json
  {
    "code": 0,
    "msg": "上传并入库成功",
    "data": {
      "id": 1,
      "name": "张雪知乎项目技术说明书.docx",
      "ext": ".docx",
      "size": 39441,
      "charCount": 2274,
      "chunkCount": 6,
      "preview": "张雪知乎全栈项目技术说明书…"
    }
  }
  ```

  类型不支持：

  ```json
  {
    "code": 4002,
    "msg": "不支持的文件类型：.xlsx。仅支持 doc、docx、ppt、pptx、pdf、txt、md。",
    "data": null
  }
  ```

- **说明**：后端依次完成文件文本解析、约 480 字/块（重叠 80 字）分块、调用 `BAAI/bge-m3` 向量化，
  并把文档与分块写入 `Zhang_kb_document`、`Zhang_kb_chunk`。
- **修改时间**：2026-11-23

### 2. 获取知识库文档列表

- **接口路径**：`/api/kb/documents`
- **HTTP 方法**：`GET`
- **请求参数**：无

  示例：

  ```http
  GET http://localhost:727/api/kb/documents
  ```

- **响应格式**：

  ```json
  {
    "code": 0,
    "msg": "获取知识库文档成功",
    "data": {
      "total": 2,
      "totalChunks": 8,
      "documents": [
        {
          "id": 2,
          "name": "知乎社区运营与内容规范.pptx",
          "ext": ".pptx",
          "size": 38048,
          "charCount": 737,
          "chunkCount": 2,
          "time": "2026-11-23 14:07"
        }
      ]
    }
  }
  ```

- **修改时间**：2026-11-23

### 3. 删除知识库文档

- **接口路径**：`/api/kb/documents/:id`
- **HTTP 方法**：`DELETE`
- **请求参数**：路径参数 `id` 为文档 ID。

  示例：

  ```http
  DELETE http://localhost:727/api/kb/documents/2
  ```

- **响应格式**：

  成功示例：

  ```json
  {
    "code": 0,
    "msg": "文档及其分块已删除",
    "data": { "id": 2 }
  }
  ```

  不存在：

  ```json
  {
    "code": 4041,
    "msg": "文档不存在或已被删除。",
    "data": null
  }
  ```

- **说明**：删除文档记录、全部关联分块，并清理 `backend/uploads/` 中的原始文件。
- **修改时间**：2026-11-23

### 4. 基于知识库的问答

- **接口路径**：`/api/kb/ask`
- **HTTP 方法**：`POST`
- **请求参数**：JSON 请求体。

  | 字段 | 类型 | 必填 | 说明 |
  | --- | --- | --- | --- |
  | question | string | 是 | 用户问题，最长 500 字符 |
  | topK | number | 否 | 检索片段数量，默认 4，范围 1–8 |

  示例：

  ```json
  {
    "question": "知识库问答的检索流程是怎样的？",
    "topK": 4
  }
  ```

- **响应格式**：

  成功示例：

  ```json
  {
    "code": 0,
    "msg": "知识库问答成功",
    "data": {
      "answer": "先对问题向量化，再与全部分块计算余弦相似度，取最相似的 4 段资料注入提示词，最后由 DeepSeek 生成回答。",
      "model": "deepseek-ai/DeepSeek-V4-Flash",
      "usage": { "prompt_tokens": 1035, "completion_tokens": 493, "total_tokens": 1528 },
      "sources": [
        {
          "docId": 1,
          "name": "张雪知乎项目技术说明书.docx",
          "chunkIndex": 4,
          "score": 0.5967,
          "content": "文本分块参数：每块约 480 个字符…"
        }
      ]
    }
  }
  ```

  知识库为空：

  ```json
  { "code": 4004, "msg": "知识库中还没有任何内容，请先上传文件。", "data": null }
  ```

- **说明**：服务端在调用大模型前后分别用 `console.log` 输出 `[发送给大模型]` 的完整请求体与 `[大模型返回]` 的完整响应体，
  便于核对提示词与引用资料。
- **修改时间**：2026-11-23
