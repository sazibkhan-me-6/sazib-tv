// scripts/find-indian.js
async function check() {
  console.log('Checking BDIX playlist for Indian channels...');
  const res = await fetch('https://raw.githubusercontent.com/saeidrahmanbd/BDIX-IPTV/main/IPTV-Playlist.m3u');
  const text = await res.text();
  const lines = text.split(/\r?\n/);
  const groups = new Set();
  const indianChannels = [];
  let meta = '';

  for (const line of lines) {
    const l = line.trim();
    if (l.startsWith('#EXTINF')) {
      meta = l;
      const gMatch = l.match(/group-title="([^"]*)"/i);
      if (gMatch) groups.add(gMatch[1]);
    } else if (l && !l.startsWith('#')) {
      const gMatch = meta.match(/group-title="([^"]*)"/i);
      const group = gMatch ? gMatch[1] : '';
      const countryMatch = meta.match(/tvg-country="([^"]*)"/i);
      const country = countryMatch ? countryMatch[1] : '';

      if (
        /india|hindi|sports|movies|entertainment/i.test(group) ||
        /IN/i.test(country) ||
        /jalsha|zee|colors|star|sony|aaj tak|abp|ndtv|republic|b4u|9xm|ten/i.test(meta)
      ) {
        const name = meta.split(',')[1] || '';
        const logoMatch = meta.match(/tvg-logo="([^"]*)"/i);
        indianChannels.push({ name: name.trim(), url: l, logo: logoMatch ? logoMatch[1] : '', group });
      }
      meta = '';
    }
  }

  console.log('All Groups:', Array.from(groups));
  console.log('Total Indian/subcontinent channels in BDIX:', indianChannels.length);
  console.log('Sample channels:');
  indianChannels.slice(0, 30).forEach((c, i) => console.log(`${i + 1}. [${c.group}] ${c.name} -> ${c.url.slice(0, 45)}`));
}

check();
