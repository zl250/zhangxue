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
