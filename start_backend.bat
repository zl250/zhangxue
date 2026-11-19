@echo off
chcp 65001 >nul
rem 姓名：张雪 ^| 学号：24001010727 ^| 时间：2026-11-19 ^| 大模型：DeepSeek-V4.1-Flash
rem 说明：一键启动后端服务（Express，端口 727）
title Zhihu Backend - Port 727

cd /d "%~dp0backend"

where node >nul 2>nul
if errorlevel 1 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js 后再运行本脚本。
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [提示] 未检测到依赖，开始安装...
    where cnpm >nul 2>nul
    if errorlevel 1 (
        call npm install
    ) else (
        call cnpm install
    )
    if errorlevel 1 (
        echo [错误] 依赖安装失败，请检查网络后重试。
        pause
        exit /b 1
    )
)

echo [信息] 正在启动后端服务：http://localhost:727
echo [信息] 按 Ctrl+C 可停止服务。
echo.
node app.js

echo.
echo [信息] 服务已退出。
pause
