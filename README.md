# 📺 Sazib TV — Smart Android TV & Web Player

A modern, responsive Android TV-inspired Web & Desktop IPTV Player. Built with **React 18**, **TypeScript**, **Vite**, **Hls.js**, and optional **Electron** support for Windows desktop.

![Sazib TV](public/sazib-tv-logo.png)

---

## ✨ Features

- **🌐 Cross-Platform:** Runs seamlessly on any modern web browser (Web App) and Windows desktop (Electron).
- **📺 Live TV Channels:** Built-in curated channels (News, Sports, Entertainment, Movies) with HLS (.m3u8) adaptive streaming.
- **🎬 OTT Platforms Hub:** Integrated In-App web experience for top OTT platforms (YouTube, Netflix, Prime Video, Chorki, Toffee, Hoichoi, SonyLIV, Zee5, Hotstar).
- **🛍️ Sazib TV Store:** Android TV-style Store catalog to discover, install, launch, or add custom web apps and stream URLs.
- **📱 Smartphone Remote & Air Mouse:** Real-time web remote with Virtual D-Pad, Air Mouse Touchpad, Left-Click, and Quick Actions.
- **🎙️ Voice Control & Search:** Voice commands to launch OTT apps, switch channels, toggle play/pause, volume, and return to Home.
- **🏠 One-Click Home Navigation:** Universal Home button access from live TV, OTT overlays, modals, and remote controllers.
- **📁 Custom Playlist Support:** Import custom M3U/M3U8 playlists from files or URLs, and Xtream Codes API support.

---

## 🚀 Run Locally (Web Mode)

To run Sazib TV in your web browser:

```bash
# 1. Install dependencies
npm install

# 2. Start the development web server
npm run dev
```

Open your browser at `http://localhost:5173` (or the URL printed in the terminal).

---

## 📦 Build for Web Deployment (Vercel, Netlify, GitHub Pages)

```bash
npm run build
```

The optimized static production files will be output to the `dist/` directory.

### Deploy to Vercel:
```bash
npx vercel
```
*Vite is automatically detected with build command `npm run build` and output directory `dist`.*

### Deploy to Netlify:
```bash
npx netlify deploy --prod --dir=dist
```

---

## 🖥️ Desktop (Windows Electron App)

To run or build the standalone Windows desktop application:

```bash
# Run desktop dev environment
npm run dev

# Build Windows NSIS installer
npm run dist
```

The installer will be generated in `release/Sazib-TV-Setup-1.0.0.exe`.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Custom Android TV Leanback CSS & Glassmorphism UI
- **Streaming:** Hls.js
- **Icons:** Lucide React
- **Desktop Packaging:** Electron 33, Electron-Builder

---

## 📄 License

MIT License. Designed with ❤️ by [Sazib](https://github.com/sazibkhan-me-6).
