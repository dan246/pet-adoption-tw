# 浪浪找家 2.0 - 台灣流浪動物領養平台

一個精美的流浪動物領養平台，透過溫馨療癒的設計風格、互動式功能與 AI 推薦系統，提升貓狗的曝光度與領養率。

## 功能特色

### 🐾 動物瀏覽系統
- 卡片式展示，支援無限滾動
- 多維度篩選（類型/縣市/性別/體型/年齡）
- 動物詳情彈窗（大圖、完整資訊、收容所聯絡）
- 列表/網格視圖切換

### 🗺️ 互動式地圖
- 台灣地圖顯示所有收容所位置
- 點擊標記顯示該收容所動物數量
- 依區域快速篩選
- 收容所導航路線（連結 Google Maps）

### ✨ AI 配對推薦
- 用戶填寫生活型態問卷（5 題）
- 根據居住空間、活動量、經驗等因素評分
- 推薦最適合的毛孩類型
- 顯示匹配度百分比

### 🎋 每日抽籤功能
- 每日可抽一次「今日幸運毛孩」
- 籤詩風格呈現（大吉/中吉/小吉/吉）
- 顯示該動物的「幸運物語」
- 精美抽籤動畫（翻牌效果）
- 可分享到社群媒體

### 📱 社群分享
- 一鍵分享動物資訊到 FB/LINE
- 支援 Web Share API
- 分享專屬連結

## 技術架構

### 前端
- **React 18 + Vite** - 快速開發、效能優異
- **TailwindCSS** - 溫馨療癒風格設計
- **Framer Motion** - 流暢動畫效果
- **React Leaflet** - 互動式地圖
- **React Query** - 資料快取與狀態管理

### 後端
- **Cloudflare Workers** - Serverless API
- **Hono** - 輕量級 Web 框架
- **政府開放資料 API** - 即時同步動物資料

## 專案結構

```
pet-adoption/
├── frontend/                # React 前端
│   ├── src/
│   │   ├── components/      # UI 元件
│   │   ├── pages/           # 頁面
│   │   ├── hooks/           # 自訂 Hooks
│   │   └── services/        # API 服務
│   └── ...
│
├── backend/                 # Cloudflare Workers
│   ├── src/
│   │   ├── routes/          # API 路由
│   │   └── index.ts         # 主進入點
│   └── ...
│
└── README.md
```

## 快速開始

### 前端開發

```bash
# 進入前端目錄
cd frontend

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

前端將在 http://localhost:3000 啟動

### 後端開發

```bash
# 進入後端目錄
cd backend

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

後端將在 http://localhost:8787 啟動

## 部署

### 前端部署到 GitHub Pages

```bash
cd frontend
npm run deploy
```

### 後端部署到 Cloudflare Workers

```bash
cd backend
npm run deploy
```

## 配色方案

| 顏色 | 用途 | 色碼 |
|------|------|------|
| 柔和珊瑚橘 | 主色 | `#FFB4A2` |
| 薄荷綠 | 輔色 | `#B5E2D8` |
| 奶油黃 | 強調色 | `#FFE5B4` |
| 米白色 | 背景 | `#FFF9F5` |
| 溫暖灰 | 文字 | `#5D5D5D` |

## API 資料來源

**農業部動物認領養開放資料**
- 端點：`https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=QcbUEzN6E6DL`
- 資料集：https://data.gov.tw/dataset/85903
- 授權：政府開放資料授權

## 授權

MIT License
