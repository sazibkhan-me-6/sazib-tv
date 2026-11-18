// test-bd.js
async function run() {
  const res = await fetch('https://raw.githubusercontent.com/saeidrahmanbd/BDIX-IPTV/main/IPTV-Playlist.m3u');
  const text = await res.text();
  const lines = text.split(/\r?\n/);
  const bdChannels = [];
  let meta = '';
  for (const line of lines) {
    const l = line.trim();
    if (l.startsWith('#EXTINF')) {
      meta = l;
    } else if (l && !l.startsWith('#')) {
      if (meta.includes('group-title="Bangladesh"') || meta.includes('tvg-country="BD"')) {
        const name = meta.split(',')[1] || '';
        const logoMatch = meta.match(/tvg-logo="([^"]*)"/i);
        const logo = logoMatch ? logoMatch[1] : '';
        bdChannels.push({ name: name.trim(), url: l, logo });
      }
      meta = '';
    }
  }
  console.log('Total BD Channels found:', bdChannels.length);
  bdChannels.forEach((c, i) => console.log(`${i + 1}. ${c.name} -> ${c.url}`));
}
run();
