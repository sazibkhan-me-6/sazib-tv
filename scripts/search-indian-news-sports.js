// scripts/search-indian-news-sports.js
async function check() {
  const res = await fetch('https://raw.githubusercontent.com/saeidrahmanbd/BDIX-IPTV/main/IPTV-Playlist.m3u');
  const text = await res.text();
  const lines = text.split(/\r?\n/);
  const hits = [];

  let meta = '';
  for (const line of lines) {
    const l = line.trim();
    if (l.startsWith('#EXTINF')) {
      meta = l;
    } else if (l && !l.startsWith('#')) {
      if (/aaj tak|abp news|abp ananda|zee 24|zee news|india today|ndtv|republic|star sports|sony sports|ten 1|ten 2|ten 3|sports18|dd sports/i.test(meta)) {
        const name = meta.split(',')[1]?.trim() || '';
        const gMatch = meta.match(/group-title="([^"]*)"/i);
        const group = gMatch ? gMatch[1] : '';
        const logoMatch = meta.match(/tvg-logo="([^"]*)"/i);
        hits.push({ name, url: l, logo: logoMatch ? logoMatch[1] : '', group });
      }
      meta = '';
    }
  }

  console.log(`Found ${hits.length} Indian News & Sports channels:`);
  hits.forEach((c, i) => console.log(`${i + 1}. [${c.group}] ${c.name} -> ${c.url}`));
}

check();
