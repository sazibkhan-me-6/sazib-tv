// scripts/list-indian-groups.js
async function check() {
  const res = await fetch('https://raw.githubusercontent.com/saeidrahmanbd/BDIX-IPTV/main/IPTV-Playlist.m3u');
  const text = await res.text();
  const lines = text.split(/\r?\n/);
  const byGroup = {};

  let meta = '';
  for (const line of lines) {
    const l = line.trim();
    if (l.startsWith('#EXTINF')) {
      meta = l;
    } else if (l && !l.startsWith('#')) {
      const gMatch = meta.match(/group-title="([^"]*)"/i);
      const group = gMatch ? gMatch[1] : 'Other';
      if (['Indian Bangla', 'Indian Movies', 'Indian Entertainment', 'Indian Music'].includes(group)) {
        if (!byGroup[group]) byGroup[group] = [];
        const name = meta.split(',')[1]?.trim() || '';
        const logoMatch = meta.match(/tvg-logo="([^"]*)"/i);
        byGroup[group].push({ name, url: l, logo: logoMatch ? logoMatch[1] : '' });
      }
      meta = '';
    }
  }

  for (const [grp, items] of Object.entries(byGroup)) {
    console.log(`\n=== GROUP: ${grp} (${items.length} channels) ===`);
    items.slice(0, 20).forEach((c, i) => console.log(`${i + 1}. ${c.name} -> ${c.url.slice(0, 50)}`));
  }
}

check();
