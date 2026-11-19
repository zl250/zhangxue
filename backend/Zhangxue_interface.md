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
