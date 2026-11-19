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

## 目录结构

```
.
├─ AGENTS.md                 # 项目开发规范
├─ README.md
├─ Cheney_prompt.md          # AI 指令记录
├─ frontend/                 # 前端
│  ├─ index.html             # 首页（项目信息 + 页面导航）
│  ├─ database.html          # 数据库连接测试页
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
   ├─ .env                   # 数据库凭据（不提交）
   ├─ Zhangxue_interface.md  # 接口文档
   └─ Zhangxue_database.md   # 数据库文档
```

## 运行方式

1. 安装依赖（后端依赖安装优先 `cnpm i 包名`，失败或超时再用 `npm i 包名`）：

   ```bash
   cd backend
   cnpm install
   ```

2. 在 `backend/.env` 中配置数据库连接：

   ```
   DB_USER=你的用户名
   DB_PASSWORD=你的密码
   DB_HOST=localhost
   DB_NAME=你的数据库名
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
