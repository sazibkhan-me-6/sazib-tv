import { app, BrowserWindow, shell, session, ipcMain } from 'electron';
import path from 'node:path';
import { startMobileServer } from './mobileServer';

const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

app.userAgentFallback = CHROME_UA;

// Ultra Zero-Buffering & High-Capacity Hardware Video Acceleration Flags
app.commandLine.appendSwitch('enable-quic');
app.commandLine.appendSwitch('enable-accelerated-video-decode');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('disk-cache-size', '1610612736'); // 1.5 GB Disk Cache for High-Speed Media Chunks
app.commandLine.appendSwitch('media-cache-size', '536870912'); // 512 MB High-Speed RAM Media Cache
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder,WebRtcHideLocalIpsWithMdns,CanvasOopRasterization');

let serverInfo = { ip: '127.0.0.1', port: 8989, url: 'http://127.0.0.1:8989' };
let ottWin: BrowserWindow | null = null;
let googleWin: BrowserWindow | null = null;

function applySessionRules(ses: Electron.Session) {
  ses.setUserAgent(CHROME_UA);
  ses.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(true); // Allow media playback, audio autoplay, notifications, fullscreen, DRM
  });

  // Strip or set permissive CORS headers on all network requests so IPTV & OTT streams load without errors
  ses.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = { ...details.responseHeaders };
    responseHeaders['Access-Control-Allow-Origin'] = ['*'];
    responseHeaders['Access-Control-Allow-Methods'] = ['GET, HEAD, POST, OPTIONS'];
    responseHeaders['Access-Control-Allow-Headers'] = ['*'];
    responseHeaders['access-control-allow-origin'] = ['*'];
    responseHeaders['access-control-allow-methods'] = ['GET, HEAD, POST, OPTIONS'];
    responseHeaders['access-control-allow-headers'] = ['*'];
    delete responseHeaders['x-frame-options'];
    delete responseHeaders['X-Frame-Options'];
    delete responseHeaders['content-security-policy'];
    delete responseHeaders['Content-Security-Policy'];
    delete responseHeaders['frame-ancestors'];
    delete responseHeaders['Frame-Ancestors'];

    // High-Capacity Segment Cache Control (Prevents buffer starvation for millions of viewers)
    if (details.url.includes('.ts') || details.url.includes('.m4s') || details.url.includes('.aac') || details.url.includes('.mp4')) {
      responseHeaders['Cache-Control'] = ['public, max-age=31536000, immutable'];
    }

    callback({ responseHeaders });
  });

  // Set standard Chrome User-Agent so OTT providers do not block requests
  ses.webRequest.onBeforeSendHeaders((details, callback) => {
    const requestHeaders = { ...details.requestHeaders };
    requestHeaders['User-Agent'] = CHROME_UA;
    if (requestHeaders['Origin'] === 'null' || requestHeaders['Origin']?.startsWith('file://')) {
      delete requestHeaders['Origin'];
    }
    if (requestHeaders['origin'] === 'null' || requestHeaders['origin']?.startsWith('file://')) {
      delete requestHeaders['origin'];
    }
    if (details.url.includes('aynaott.com') || details.url.includes('aynascope.net')) {
      requestHeaders['Referer'] = 'https://aynaott.com/';
    }
    callback({ requestHeaders });
  });
}

function createWindow() {
  const iconPath = path.join(__dirname, '../public/icon.png');
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 980,
    minHeight: 620,
    backgroundColor: '#070a14',
    title: 'Sazib TV',
    icon: iconPath,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false,
      webviewTag: true
    }
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    win.loadURL(`${devUrl}?mobileUrl=${encodeURIComponent(serverInfo.url)}&mobileIp=${encodeURIComponent(serverInfo.ip)}`);
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'), {
      query: {
        mobileUrl: serverInfo.url,
        mobileIp: serverInfo.ip,
        mobilePort: String(serverInfo.port)
      }
    });
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes('accounts.google.com') || url.includes('/login') || url.includes('/auth') || url.includes('/signin')) {
      return { action: 'allow' };
    }
    if (url.startsWith('https://') || url.startsWith('http://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });
}

// IPC Handlers for Dedicated OTT Player Window and Google Login
ipcMain.handle('open-ott-window', (_event, data: { url: string; title?: string }) => {
  if (ottWin && !ottWin.isDestroyed()) {
    ottWin.loadURL(data.url);
    ottWin.setTitle(data.title || 'Sazib TV - OTT Player');
    ottWin.focus();
    return;
  }
  ottWin = new BrowserWindow({
    width: 1320,
    height: 800,
    title: data.title || 'Sazib TV - OTT Player',
    backgroundColor: '#070a14',
    icon: path.join(__dirname, '../public/icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      partition: 'persist:sazib_tv_ott',
      contextIsolation: true,
      webSecurity: false,
      plugins: true
    }
  });
  ottWin.loadURL(data.url);
  ottWin.on('closed', () => {
    ottWin = null;
  });
});

ipcMain.handle('open-google-login', () => {
  if (googleWin && !googleWin.isDestroyed()) {
    googleWin.focus();
    return;
  }
  googleWin = new BrowserWindow({
    width: 540,
    height: 720,
    title: 'Google Account Sign In - Sazib TV',
    backgroundColor: '#ffffff',
    icon: path.join(__dirname, '../public/icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      partition: 'persist:google_account',
      contextIsolation: true,
      webSecurity: false
    }
  });
  googleWin.loadURL('https://accounts.google.com/signin');
  googleWin.on('closed', () => {
    googleWin = null;
  });
});

ipcMain.handle('open-external', (_event, url: string) => {
  if (url) shell.openExternal(url);
});

app.whenReady().then(() => {
  try {
    serverInfo = startMobileServer(8989);
  } catch (err) {
    console.error('Could not start mobile server:', err);
  }

  // Apply session rules to default and persistent partitions
  applySessionRules(session.defaultSession);
  applySessionRules(session.fromPartition('persist:sazib_tv_ott'));
  applySessionRules(session.fromPartition('persist:google_account'));

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
