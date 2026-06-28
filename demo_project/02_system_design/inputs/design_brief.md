# 設計簡報 (Design Brief)

> Phase 02 Input | 2026-06-28

## 設計範圍
基於 Phase 01 的正規需求，設計 Employee Management System 的完整系統架構。

## 核心設計決策

| 決策點 | 選擇 | 理由 |
|:---|:---|:---|
| 後端框架 | Flask 3.x (Python) | 輕量、快速開發內部工具 |
| 資料庫 | SQLite | 零配置、適合小規模內部工具 |
| 前端 | Jinja2 SSR + 內嵌 CSS | 無需前端構建工具，簡化部署 |
| 認證 | Session-based (Flask session) | 簡單實作，server-side 管理 |
| 密碼儲存 | SHA-256 + Salt | 內部工具適用，未來可升級 bcrypt |
| 安全基準 | General (普級) | 適用內部工具，90%+ 覆蓋率 |
| UI 設計 | frontend-app-builder 風格 | 漸層背景、圓角卡片、SVG 圖標、RWD |
| 測試 | pytest + Playwright | 單元/整合/UI 測試全覆蓋 |

## 設計約束
- 單一檔案部署 (app.py + templates/)
- 無需外部服務 (DB/Redis/etc.)
- 支援 Windows 環境 (run.bat)
- 離線可用 (CDN fonts 除外)
