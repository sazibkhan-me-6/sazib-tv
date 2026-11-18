import http from 'node:http';
import os from 'node:os';

interface PlayerState {
  activeChannel: any | null;
  isPlaying: boolean;
  isFullscreen: boolean;
}

let storedChannels: any[] = [];
let currentState: PlayerState = {
  activeChannel: null,
  isPlaying: true,
  isFullscreen: false
};

const sseClients: http.ServerResponse[] = [];

function broadcastEvent(eventType: string, data: any) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].write(payload);
    } catch {
      sseClients.splice(i, 1);
    }
  }
}

function getLocalIpAddress(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const ifaceList = interfaces[name];
    if (!ifaceList) continue;
    for (const iface of ifaceList) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

export function startMobileServer(port = 8989): { ip: string; port: number; url: string } {
  const ip = getLocalIpAddress();
  const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    // SSE Events endpoint
    if (url.pathname === '/api/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      });
      res.write(': connected\n\n');
      sseClients.push(res);
      req.on('close', () => {
        const idx = sseClients.indexOf(res);
        if (idx !== -1) sseClients.splice(idx, 1);
      });
      return;
    }

    // Get Info endpoint
    if (url.pathname === '/api/info') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ip,
        port,
        url: `http://${ip}:${port}`,
        state: currentState,
        channelsCount: storedChannels.length
      }));
      return;
    }

    // Get Channels endpoint
    if (url.pathname === '/api/channels' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(storedChannels));
      return;
    }

    // Sync Channels from PC app
    if (url.pathname === '/api/channels' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          storedChannels = JSON.parse(body);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, count: storedChannels.length }));
        } catch {
          res.writeHead(400);
          res.end('Invalid JSON');
        }
      });
      return;
    }

    // Sync Player State from PC app
    if (url.pathname === '/api/state' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          currentState = JSON.parse(body);
          broadcastEvent('state_updated', currentState);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
        } catch {
          res.writeHead(400);
          res.end('Invalid JSON');
        }
      });
      return;
    }

    // Receive Remote Command from Mobile Phone
    if (url.pathname === '/api/command' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const cmd = JSON.parse(body);
          broadcastEvent('command', cmd);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, executed: cmd.type }));
        } catch {
          res.writeHead(400);
          res.end('Invalid command format');
        }
      });
      return;
    }

    // Serve Mobile Web Remote HTML Page
    if (url.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(getMobileRemoteHtml());
      return;
    }

    res.writeHead(404);
    res.end('Not Found');
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`Sazib TV Mobile Remote Server running at http://${ip}:${port}`);
  });

  return { ip, port, url: `http://${ip}:${port}` };
}

function getMobileRemoteHtml(): string {
  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Sazib TV Remote</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&family=Space+Grotesk:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    body {
      margin: 0;
      padding: 0;
      background: radial-gradient(circle at 50% 0%, #151e3a 0%, #080c18 60%, #04060c 100%);
      color: #f1f5fd;
      font-family: 'DM Sans', sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      user-select: none;
      -webkit-user-select: none;
    }
    header {
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(11, 16, 32, 0.9);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(46, 62, 100, 0.5);
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      display: grid;
      place-items: center;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
      color: #fff;
    }
    .brand-meta {
      display: flex;
      flex-direction: column;
    }
    .brand-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.3px;
      color: #fff;
      line-height: 1.1;
    }
    .brand-sub {
      font-size: 10px;
      font-weight: 700;
      color: #60a5fa;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .head-mic-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid rgba(59, 130, 246, 0.4);
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      display: grid;
      place-items: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .head-mic-btn:active {
      transform: scale(0.92);
      background: #3b82f6;
      color: #fff;
    }
    .status-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(39, 174, 96, 0.15);
      border: 1px solid rgba(39, 174, 96, 0.35);
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 800;
      color: #4cd98b;
      letter-spacing: 0.5px;
    }
    .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #4cd98b;
      box-shadow: 0 0 8px #4cd98b;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse { 0% { transform: scale(0.9); opacity: 0.7; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(0.9); opacity: 0.7; } }

    /* Navigation Tabs */
    .tabs {
      display: flex;
      background: rgba(14, 21, 38, 0.7);
      margin: 10px 14px;
      border-radius: 14px;
      padding: 4px;
      border: 1px solid #1f2c4b;
      gap: 4px;
    }
    .tab {
      flex: 1;
      height: 40px;
      border-radius: 10px;
      border: 0;
      background: transparent;
      color: #8da2c8;
      font-size: 12.5px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .tab.active {
      background: linear-gradient(100deg, #3b82f6, #7c3aed);
      color: #fff;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
    }

    .view { display: none; padding: 10px 14px 40px; flex: 1; }
    .view.active { display: block; }

    /* Now Playing Card */
    .now-playing {
      background: linear-gradient(135deg, #152244, #261947);
      border: 1px solid #2d3e69;
      border-radius: 16px;
      padding: 14px 16px;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    }
    .now-playing-info { flex: 1; min-width: 0; }
    .now-playing-info small { color: #8fa5cf; font-size: 10px; font-weight: 800; letter-spacing: 1.5px; display: block; margin-bottom: 3px; }
    .now-playing-info b { font-size: 15px; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff; }

    /* Dedicated Circular Voice Button (Only button, no text) */
    .voice-btn-row {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 8px 0 16px 0;
    }
    .voice-btn-circle {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, #3b82f6, #8b5cf6 85%);
      border: 2px solid rgba(255, 255, 255, 0.45);
      color: #ffffff;
      display: grid;
      place-items: center;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(59, 130, 246, 0.5), 0 0 14px rgba(139, 92, 246, 0.4);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .voice-btn-circle:active {
      transform: scale(0.92);
      box-shadow: 0 2px 10px rgba(59, 130, 246, 0.8);
      background: radial-gradient(circle at 30% 30%, #2563eb, #7c3aed 85%);
    }

    /* D-PAD REMOTE */
    .dpad-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 10px 0 20px;
    }
    .dpad {
      width: 210px;
      height: 210px;
      border-radius: 50%;
      background: #101930;
      border: 2px solid #253761;
      position: relative;
      box-shadow: 0 15px 40px rgba(0,0,0,0.6), inset 0 0 20px rgba(0,0,0,0.5);
    }
    .dpad-btn {
      position: absolute;
      background: transparent;
      border: 0;
      color: #9db5e6;
      cursor: pointer;
      display: grid;
      place-items: center;
      transition: all 0.1s;
    }
    .dpad-btn:active { color: #fff; filter: drop-shadow(0 0 8px #5c8bff); transform: scale(0.95); }
    .dpad-up { top: 6px; left: 70px; width: 70px; height: 50px; }
    .dpad-down { bottom: 6px; left: 70px; width: 70px; height: 50px; }
    .dpad-left { top: 70px; left: 6px; width: 50px; height: 70px; }
    .dpad-right { top: 70px; right: 6px; width: 50px; height: 70px; }
    .dpad-ok {
      top: 60px;
      left: 60px;
      width: 90px;
      height: 90px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      border: 2px solid #60a5fa;
      color: #fff;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 18px;
      font-weight: 800;
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
    }
    .dpad-ok:active { transform: scale(0.94); background: #1d4ed8; }

    /* Remote Action Grid */
    .action-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .btn-act {
      height: 52px;
      border-radius: 13px;
      background: #121c36;
      border: 1px solid #233660;
      color: #c7d8f9;
      font-size: 12px;
      font-weight: 700;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-act:active {
      transform: scale(0.95);
      background: #25396b;
      color: #fff;
      border-color: #60a5fa;
    }
    .btn-act.highlight {
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.25), rgba(124, 58, 237, 0.25));
      border-color: #3b82f6;
      color: #93c5fd;
    }
    .btn-act.theater {
      background: linear-gradient(135deg, rgba(234, 88, 12, 0.2), rgba(217, 70, 239, 0.2));
      border-color: #f97316;
      color: #fed7aa;
    }
    .btn-act.fullscreen {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2));
      border-color: #10b981;
      color: #a7f3d0;
    }

    /* MOUSE TOUCHPAD VIEW */
    .touchpad-box {
      background: #0d1527;
      border: 2px solid #22355e;
      border-radius: 18px;
      height: 310px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      touch-action: none;
      box-shadow: inset 0 0 40px rgba(0,0,0,0.6), 0 10px 30px rgba(0,0,0,0.4);
      background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
      background-size: 20px 20px;
    }
    .touchpad-hint {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: #64748b;
      pointer-events: none;
    }
    .touchpad-hint span {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: #94a3b8;
    }
    .mouse-actions-bar {
      display: grid;
      grid-template-columns: 1.4fr 1fr 1fr;
      gap: 10px;
      margin-top: 14px;
    }
    .btn-mouse-left {
      height: 52px;
      border-radius: 13px;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      border: 1px solid #60a5fa;
      color: #fff;
      font-weight: 800;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
    }
    .btn-mouse-left:active { transform: scale(0.96); background: #1e40af; }
    .btn-mouse-back {
      height: 52px;
      border-radius: 13px;
      background: #182442;
      border: 1px solid #2d3e69;
      color: #cbd5e1;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
    }
    .btn-mouse-back:active { transform: scale(0.96); background: #233660; }
    .mouse-scroll-bar {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 10px;
    }

    /* Channel Browser View */
    .search-bar {
      margin-bottom: 12px;
      position: relative;
    }
    .search-bar input {
      width: 100%;
      height: 46px;
      border-radius: 13px;
      background: #0f1629;
      border: 1px solid #26365b;
      padding: 0 42px 0 16px;
      color: #fff;
      font-size: 14px;
      outline: 0;
    }
    .search-bar input:focus { border-color: #3b82f6; }
    .search-clear-btn {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: 0;
      color: #94a3b8;
      cursor: pointer;
      font-size: 16px;
    }

    .cat-chips {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .cat-chip {
      padding: 6px 14px;
      border-radius: 20px;
      background: #111a31;
      border: 1px solid #23345c;
      color: #9cb1da;
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
      cursor: pointer;
    }
    .cat-chip.active {
      background: #2563eb;
      border-color: #60a5fa;
      color: #fff;
    }

    .channel-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .ch-item {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #10182e;
      border: 1px solid #1f2f54;
      border-radius: 12px;
      padding: 10px 14px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .ch-item:active {
      background: #203159;
      border-color: #3b82f6;
      transform: scale(0.98);
    }
    .ch-thumb {
      width: 44px;
      height: 32px;
      border-radius: 6px;
      background: #1b2644;
      display: grid;
      place-items: center;
      overflow: hidden;
      flex-shrink: 0;
    }
    .ch-thumb img { width: 100%; height: 100%; object-fit: contain; }
    .ch-meta { flex: 1; min-width: 0; }
    .ch-meta b { font-size: 13px; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff; }
    .ch-meta small { color: #7f93bb; font-size: 10px; }
    .cast-btn {
      padding: 6px 12px;
      border-radius: 8px;
      background: #2563eb;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      border: 0;
    }

    /* SEARCH MODAL OVERLAY */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(4, 6, 12, 0.92);
      backdrop-filter: blur(14px);
      z-index: 100;
      display: none;
      flex-direction: column;
      padding: 16px;
    }
    .modal-overlay.open { display: flex; }
    .modal-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .modal-head h3 { margin: 0; font-size: 16px; color: #fff; display: flex; align-items: center; gap: 8px; }
    .modal-close { background: #1e293b; border: 0; color: #fff; width: 34px; height: 34px; border-radius: 50%; font-size: 16px; cursor: pointer; }

    /* VOICE MODAL OVERLAY */
    .voice-modal {
      position: fixed;
      inset: 0;
      background: rgba(4, 6, 12, 0.94);
      backdrop-filter: blur(18px);
      z-index: 150;
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;
    }
    .voice-modal.open { display: flex; }
    .voice-wave {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: radial-gradient(circle, #3b82f6 0%, #ec4899 100%);
      display: grid;
      place-items: center;
      box-shadow: 0 0 40px rgba(59, 130, 246, 0.8);
      animation: voice-pulse 1.4s infinite;
      margin-bottom: 24px;
      color: #fff;
    }
    @keyframes voice-pulse {
      0% { transform: scale(0.9); box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
      50% { transform: scale(1.15); box-shadow: 0 0 50px rgba(236, 72, 153, 0.8); }
      100% { transform: scale(0.9); box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
    }
    .voice-status { font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 8px; }
    .voice-sub { font-size: 13px; color: #94a3b8; max-width: 280px; margin-bottom: 24px; line-height: 1.4; }
    .voice-transcript {
      background: #101a33;
      border: 1px solid #2a3c68;
      border-radius: 12px;
      padding: 12px 20px;
      font-size: 15px;
      color: #60a5fa;
      font-weight: 700;
      margin-bottom: 20px;
      min-width: 260px;
    }
    .voice-close-btn {
      padding: 10px 24px;
      border-radius: 20px;
      background: #1e293b;
      border: 1px solid #334155;
      color: #cbd5e1;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="brand-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="20" height="15" x="2" y="7" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>
      </div>
      <div class="brand-meta">
        <span class="brand-title">Sazib TV</span>
        <span class="brand-sub">Smart Remote</span>
      </div>
    </div>
    <div class="header-actions">
      <button class="head-mic-btn" onclick="openVoiceModal()" title="Voice Control">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
      </button>
      <div class="status-badge">
        <span class="dot"></span>
        <span>CONNECTED</span>
      </div>
    </div>
  </header>

  <div class="tabs">
    <button class="tab active" onclick="switchTab('remote')">🎮 Remote</button>
    <button class="tab" onclick="switchTab('mouse')">🖱️ Mouse</button>
    <button class="tab" onclick="switchTab('channels')">📺 Channels</button>
  </div>

  <!-- TAB 1: REMOTE CONTROLLER VIEW -->
  <div id="view-remote" class="view active">
    <div class="now-playing" id="nowPlayingCard">
      <div class="now-playing-info">
        <small>NOW PLAYING ON SAZIB TV</small>
        <b id="nowPlayingTitle">Sazib TV Live</b>
      </div>
      <button class="btn-act" style="width: auto; height: 38px; padding: 0 14px;" onclick="sendCmd('play_pause')">
        ⏯️ Play/Pause
      </button>
    </div>

    <!-- DEDICATED VOICE CONTROLLER BUTTON (ONLY THE BUTTON, NO TEXT) -->
    <div class="voice-btn-row">
      <button class="voice-btn-circle" onclick="openVoiceModal()" aria-label="Voice Control" title="Voice Control">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" x2="12" y1="19" y2="22"/>
        </svg>
      </button>
    </div>

    <!-- VIRTUAL D-PAD -->
    <div class="dpad-container">
      <div class="dpad">
        <button class="dpad-btn dpad-up" onclick="sendCmd('nav', 'ArrowUp')" aria-label="Up">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"/></svg>
        </button>
        <button class="dpad-btn dpad-left" onclick="sendCmd('nav', 'ArrowLeft')" aria-label="Left">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button class="dpad-btn dpad-ok" onclick="sendCmd('nav', 'Enter')">OK</button>
        <button class="dpad-btn dpad-right" onclick="sendCmd('nav', 'ArrowRight')" aria-label="Right">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="dpad-btn dpad-down" onclick="sendCmd('nav', 'ArrowDown')" aria-label="Down">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>
    </div>

    <!-- ACTION BUTTONS -->
    <div class="action-grid">
      <button class="btn-act" style="background:#059669; border-color:#34d399; font-weight:800;" onclick="sendCmd('home')">🏠 Home</button>
      <button class="btn-act" onclick="sendCmd('play_pause')">⏯️ Play / Pause</button>
      <button class="btn-act" onclick="sendCmd('nav', 'Escape')">🔙 Back / Exit</button>

      <button class="btn-act" onclick="sendCmd('prev')">⏮️ Prev CH</button>
      <button class="btn-act" onclick="sendCmd('menu')">📺 Quick Guide</button>
      <button class="btn-act" onclick="sendCmd('next')">⏭️ Next CH</button>

      <button class="btn-act" onclick="sendCmd('volume_down')">🔉 Vol -</button>
      <button class="btn-act" onclick="sendCmd('mute')">🔇 Mute</button>
      <button class="btn-act" onclick="sendCmd('volume_up')">🔊 Vol +</button>

      <!-- TWO FULLSCREEN OPTIONS: Theater Mode (T) & Full Screen (F) -->
      <button class="btn-act theater" onclick="sendCmd('theater')" title="Theater Mode">🎬 Theater (T)</button>
      <button class="btn-act fullscreen" onclick="sendCmd('fullscreen')" title="Full Display Mode">⛶ Fullscreen (F)</button>
      <button class="btn-act highlight" onclick="openSearchModal()" title="Search Channels">🔍 Search</button>
    </div>
  </div>

  <!-- TAB 2: MOUSE TOUCHPAD / AIR MOUSE VIEW -->
  <div id="view-mouse" class="view">
    <div class="touchpad-box" id="touchpad">
      <div class="touchpad-hint">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2.5"><path d="M3 3l7 18 3-7 7-3L3 3z"/></svg>
        <span>Touchpad • Drag finger to move mouse</span>
        <small style="color:#64748b; font-size:11px;">Single tap to Left Click</small>
      </div>
    </div>

    <div class="mouse-actions-bar">
      <button class="btn-mouse-left" onclick="sendCmd('mouse_click', { button: 'left' })">
        🔘 Left Click
      </button>
      <button class="btn-act" style="background:#059669; border-color:#34d399; font-weight:800; height:52px;" onclick="sendCmd('home')">
        🏠 Home
      </button>
      <button class="btn-mouse-back" onclick="sendCmd('nav', 'Escape')">
        🔙 Back
      </button>
    </div>

    <div class="mouse-scroll-bar">
      <button class="btn-act" onclick="sendCmd('mouse_scroll', { dy: -220 })">⬆️ Scroll Up</button>
      <button class="btn-act" onclick="sendCmd('mouse_scroll', { dy: 220 })">⬇️ Scroll Down</button>
      <button class="btn-act highlight" onclick="openVoiceModal()">🎤 Voice</button>
    </div>
  </div>

  <!-- TAB 3: CHANNEL GUIDE VIEW -->
  <div id="view-channels" class="view">
    <div class="search-bar">
      <input id="searchInput" placeholder="Search channels..." oninput="filterChannels()">
      <button class="search-clear-btn" onclick="clearChannelSearch()">✕</button>
    </div>
    <div class="cat-chips">
      <button class="cat-chip active" onclick="setCat('all')">All</button>
      <button class="cat-chip" onclick="setCat('bd')">🇧🇩 Bangla</button>
      <button class="cat-chip" onclick="setCat('india')">🇮🇳 Indian</button>
      <button class="cat-chip" onclick="setCat('sports')">🏏 Sports</button>
      <button class="cat-chip" onclick="setCat('movies')">🎬 Movies</button>
      <button class="cat-chip" onclick="setCat('news')">📰 News</button>
    </div>

    <div class="channel-list" id="channelList">
      <!-- Populated via JS -->
    </div>
  </div>

  <!-- INTERACTIVE SEARCH MODAL -->
  <div class="modal-overlay" id="searchModal">
    <div class="modal-head">
      <h3>🔍 Search Sazib TV</h3>
      <button class="modal-close" onclick="closeSearchModal()">✕</button>
    </div>
    <div class="search-bar" style="margin-bottom: 12px;">
      <input id="modalSearchInput" placeholder="Type or speak channel name..." oninput="onModalSearchInput(this.value)">
      <button class="search-clear-btn" onclick="document.getElementById('modalSearchInput').value=''; onModalSearchInput('');">✕</button>
    </div>
    <div style="display:flex; gap:8px; margin-bottom:12px;">
      <button class="btn-act" style="flex:1; height:40px;" onclick="openVoiceModal()">🎤 Speak by Voice</button>
      <button class="btn-act" style="flex:1; height:40px;" onclick="sendCmd('menu')">📺 TV Guide Drawer</button>
    </div>
    <div class="channel-list" id="modalChannelList" style="overflow-y:auto; flex:1;">
      <!-- Populated via JS -->
    </div>
  </div>

  <!-- VOICE CONTROL MODAL -->
  <div class="voice-modal" id="voiceModal">
    <div class="voice-wave" onclick="restartVoice()" style="cursor:pointer;" title="ট্যাপ করে আবার বলুন">
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
    </div>
    <div class="voice-status" id="voiceStatus">Listening... / শুনছি...</div>
    <div class="voice-transcript" id="voiceTranscript">কথা বলুন...</div>
    <div style="width:100%; max-width:320px; margin: 14px 0 10px 0;">
      <input type="text" id="voiceFallbackInput" placeholder="বা এখানে টাইপ করে Enter চাপুন..." style="width:100%; box-sizing:border-box; padding:12px 14px; border-radius:12px; background:#1e293b; border:1px solid #3b82f6; color:#fff; font-size:14px; text-align:center; outline:none;" onkeydown="if(event.key==='Enter'&&this.value.trim()){sendCmd('voice_command', this.value.trim()); closeVoiceModal();}">
    </div>
    <div style="display:flex; gap:10px;">
      <button class="voice-close-btn" style="background:#2563eb; color:#fff;" onclick="restartVoice()">🔄 Retry / আবার বলুন</button>
      <button class="voice-close-btn" onclick="closeVoiceModal()">✕ Close</button>
    </div>
  </div>

  <script>
    let allChannels = [];
    let currentCat = 'all';

    async function loadData() {
      try {
        const r1 = await fetch('/api/info');
        const info = await r1.json();
        if (info.state && info.state.activeChannel) {
          document.getElementById('nowPlayingTitle').textContent = info.state.activeChannel.name;
        }

        const r2 = await fetch('/api/channels');
        allChannels = await r2.json();
        renderChannels();
      } catch (e) {
        console.error(e);
      }
    }

    function switchTab(name) {
      document.querySelectorAll('.tab').forEach((t, i) => {
        t.classList.toggle('active', (name === 'remote' && i === 0) || (name === 'mouse' && i === 1) || (name === 'channels' && i === 2));
      });
      document.getElementById('view-remote').classList.toggle('active', name === 'remote');
      document.getElementById('view-mouse').classList.toggle('active', name === 'mouse');
      document.getElementById('view-channels').classList.toggle('active', name === 'channels');
    }

    function setCat(cat) {
      currentCat = cat;
      document.querySelectorAll('.cat-chip').forEach(c => {
        c.classList.toggle('active', c.textContent.toLowerCase().includes(cat.toLowerCase()) || (cat === 'all' && c.textContent === 'All'));
      });
      renderChannels();
    }

    function renderChannels() {
      const q = (document.getElementById('searchInput').value || '').toLowerCase();
      const list = document.getElementById('channelList');
      list.innerHTML = '';

      const filtered = allChannels.filter(c => {
        const matchesQuery = !q || c.name.toLowerCase().includes(q) || (c.group && c.group.toLowerCase().includes(q));
        if (!matchesQuery) return false;
        if (currentCat === 'all') return true;
        if (currentCat === 'bd') return c.group === 'Bangladesh' || c.name.toLowerCase().includes('tv');
        if (currentCat === 'india') return c.group === 'Indian TV';
        if (currentCat === 'sports') return c.group === 'Sports' || c.name.toLowerCase().includes('sport');
        if (currentCat === 'movies') return c.group === 'Movies' || c.name.toLowerCase().includes('movie') || c.name.toLowerCase().includes('cinema');
        if (currentCat === 'news') return c.group === 'News' || c.name.toLowerCase().includes('news');
        return true;
      });

      filtered.slice(0, 100).forEach(c => {
        const el = document.createElement('div');
        el.className = 'ch-item';
        el.innerHTML = \`
          <div class="ch-thumb">
            \${c.logo ? \`<img src="\${c.logo}" onerror="this.style.display='none'">\` : '📺'}
          </div>
          <div class="ch-meta">
            <b>\${c.name}</b>
            <small>\${c.group || 'Live TV'}</small>
          </div>
          <button class="cast-btn">Cast</button>
        \`;
        el.onclick = () => castChannel(c);
        list.appendChild(el);
      });
    }

    function filterChannels() { renderChannels(); }
    function clearChannelSearch() {
      document.getElementById('searchInput').value = '';
      renderChannels();
    }

    async function castChannel(c) {
      document.getElementById('nowPlayingTitle').textContent = c.name;
      switchTab('remote');
      closeSearchModal();
      await sendCmd('play_channel', c);
    }

    async function sendCmd(type, payload = null) {
      if (navigator.vibrate) navigator.vibrate(25);
      try {
        await fetch('/api/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, payload })
        });
      } catch (e) {
        console.error(e);
      }
    }

    // SEARCH MODAL LOGIC
    function openSearchModal() {
      sendCmd('search');
      const modal = document.getElementById('searchModal');
      modal.classList.add('open');
      const input = document.getElementById('modalSearchInput');
      input.focus();
      onModalSearchInput(input.value);
    }

    function closeSearchModal() {
      document.getElementById('searchModal').classList.remove('open');
    }

    function onModalSearchInput(val) {
      sendCmd('search_query', val);
      const q = (val || '').toLowerCase().trim();
      const list = document.getElementById('modalChannelList');
      list.innerHTML = '';

      const filtered = allChannels.filter(c => {
        if (!q) return true;
        return c.name.toLowerCase().includes(q) || (c.group && c.group.toLowerCase().includes(q));
      });

      filtered.slice(0, 60).forEach(c => {
        const el = document.createElement('div');
        el.className = 'ch-item';
        el.innerHTML = \`
          <div class="ch-thumb">
            \${c.logo ? \`<img src="\${c.logo}" onerror="this.style.display='none'">\` : '📺'}
          </div>
          <div class="ch-meta">
            <b>\${c.name}</b>
            <small>\${c.group || 'Live TV'}</small>
          </div>
          <button class="cast-btn">Play</button>
        \`;
        el.onclick = () => castChannel(c);
        list.appendChild(el);
      });
    }

    // MOUSE TOUCHPAD IMPLEMENTATION
    const touchpad = document.getElementById('touchpad');
    let lastX = 0, lastY = 0;
    let touchStartTime = 0;
    let isTouching = false;
    let movedDistance = 0;

    touchpad.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const t = e.touches[0];
        lastX = t.clientX;
        lastY = t.clientY;
        touchStartTime = Date.now();
        isTouching = true;
        movedDistance = 0;
      }
    }, { passive: false });

    let lastMoveTime = 0;
    touchpad.addEventListener('touchmove', (e) => {
      if (!isTouching || e.touches.length !== 1) return;
      e.preventDefault();
      const t = e.touches[0];
      const now = performance.now();
      if (now - lastMoveTime < 24) return;
      lastMoveTime = now;
      const dx = (t.clientX - lastX) * 1.5;
      const dy = (t.clientY - lastY) * 1.5;
      lastX = t.clientX;
      lastY = t.clientY;
      movedDistance += Math.abs(dx) + Math.abs(dy);

      sendCmd('mouse_move', { dx, dy });
    }, { passive: false });

    touchpad.addEventListener('touchend', () => {
      const duration = Date.now() - touchStartTime;
      if (duration < 280 && movedDistance < 12) {
        // Tap detected -> Left Click
        sendCmd('mouse_click', { button: 'left' });
      }
      isTouching = false;
    });

    // VOICE RECOGNITION IMPLEMENTATION
    let recognition = null;

    function openVoiceModal() {
      const modal = document.getElementById('voiceModal');
      modal.classList.add('open');
      const fallbackInp = document.getElementById('voiceFallbackInput');
      if (fallbackInp) fallbackInp.value = '';
      document.getElementById('voiceStatus').textContent = 'Listening... / শুনছি...';
      document.getElementById('voiceTranscript').textContent = 'কথা বলুন...';
      startSpeech();
    }

    function closeVoiceModal() {
      if (recognition) {
        try { recognition.stop(); } catch {}
      }
      document.getElementById('voiceModal').classList.remove('open');
    }

    function restartVoice() {
      startSpeech();
    }

    function startSpeech() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        document.getElementById('voiceStatus').textContent = 'ভয়েস সার্চ ইনপুট';
        const inp = document.getElementById('voiceFallbackInput');
        if (inp) {
          inp.focus();
        } else {
          const txt = prompt('কী দেখতে চান লিখুন (যেমন: YouTube, Sports, Somoy TV):');
          if (txt) {
            sendCmd('voice_command', txt);
            closeVoiceModal();
          }
        }
        return;
      }

      try {
        if (recognition) {
          try { recognition.abort(); } catch {}
        }
        recognition = new SpeechRecognition();
        recognition.lang = 'bn-BD';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          document.getElementById('voiceStatus').textContent = 'Listening... / শুনছি...';
        };

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          document.getElementById('voiceTranscript').textContent = '"' + transcript + '"';
          if (event.results[0].isFinal) {
            document.getElementById('voiceStatus').textContent = 'Processing / কাজ হচ্ছে...';
            sendCmd('voice_command', transcript);
            setTimeout(() => {
              closeVoiceModal();
            }, 1000);
          }
        };

        recognition.onerror = (e) => {
          console.warn('Speech error:', e);
          document.getElementById('voiceStatus').textContent = 'শুনতে সমস্যা হয়েছে / নিচে লিখুন';
          document.getElementById('voiceTranscript').textContent = 'আবার বলুন বা লিখে সেন্ড করুন';
          const inp = document.getElementById('voiceFallbackInput');
          if (inp) inp.focus();
        };

        recognition.start();
      } catch (err) {
        console.error('Speech recognition start failed:', err);
        const inp = document.getElementById('voiceFallbackInput');
        if (inp) inp.focus();
      }
    }

    // Auto load data on open
    loadData();
    setInterval(async () => {
      try {
        const res = await fetch('/api/info');
        const info = await res.json();
        if (info.state && info.state.activeChannel) {
          document.getElementById('nowPlayingTitle').textContent = info.state.activeChannel.name;
        }
      } catch {}
    }, 4000);
  </script>
</body>
</html>`;
}
