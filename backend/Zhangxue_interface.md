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
