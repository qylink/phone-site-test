# Xiaomi Pro 14 官网 · 埋码测试站

一个用于测试埋码（tracking / pixel）的多页面静态官网。模拟小米手机产品站。

## 页面

| 路径 | 说明 |
|---|---|
| `/index.html` | 首页 · Hero Banner + 特性 + 配色 |
| `/product.html` | 产品详情 · 相机/性能/屏幕 |
| `/specs.html` | 完整规格参数表 |
| `/buy.html` | 预订页（含下单表单） |
| `/support.html` | 技术支持 · FAQ · 客服入口 |

## 埋码追踪能力

打开页面右下角会出现 **「埋码事件 / Events」** 实时面板，所有事件可视化打印，无需打开 DevTools。

### 自动追踪
- `page_view` — 每次页面加载触发
- `scroll_depth` — 滚动 25 / 50 / 75 / 100%
- `page_dwell` — 页面停留时长（离开时上报）
- `utm_capture` — 自动捕获 UTM 参数

### 数据属性绑定
任何带 `data-event` 的元素被点击都会触发 `event` 事件，支持以下属性：

```html
data-event="事件名"
data-event-cat="分类"
data-event-act="动作"
data-event-label="标签"
data-event-value="数值"
data-event-pos="位置"
```

### 转化事件
- `submit_order` — 提交订单（conversion 类，自动附带 CNY 货币）

### 平台适配（mock）
`js/tracker.js` 内置 4 套平台适配器，**正式上线时**只需把注释里的 `gtag / fbq / ttq / _hmt` 调用启用即可：

- GA4
- Facebook Pixel
- TikTok Pixel
- Baidu Tongji

### 切换真实 SDK
打开 `js/tracker.js`，搜索注释：
```js
/* window.gtag('event','page_view',{page_location:p}) */
```
取消注释并在 `<head>` 引入对应官方 SDK 即可。

## 部署到 Vercel

### 方式 A：拖拽部署（最快）
1. 打开 https://vercel.com/new
2. 把 `phone-site/` 文件夹拖进页面
3. 点击 Deploy

### 方式 B：CLI
```bash
npm i -g vercel
cd phone-site
vercel
```

### 方式 C：GitHub
1. push 到 GitHub
2. Vercel Dashboard → New Project → 选仓库 → Deploy

## 本地预览
```bash
# 任选其一
python -m http.server 8080
npx serve .
```

打开 http://localhost:8080

## 目录结构
```
phone-site/
├── index.html
├── product.html
├── specs.html
├── buy.html
├── support.html
├── css/style.css
├── js/tracker.js   ← 埋码 SDK
├── js/main.js      ← UI 交互
├── vercel.json
└── README.md
```