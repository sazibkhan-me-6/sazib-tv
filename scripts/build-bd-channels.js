// scripts/build-bd-channels.js
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Fetching Bangladeshi IPTV repository...');
  const res = await fetch('https://raw.githubusercontent.com/saeidrahmanbd/BDIX-IPTV/main/IPTV-Playlist.m3u');
  const text = await res.text();
  const lines = text.split(/\r?\n/);

  const rawBdChannels = [];
  let meta = '';

  for (const line of lines) {
    const l = line.trim();
    if (l.startsWith('#EXTINF')) {
      meta = l;
    } else if (l && !l.startsWith('#')) {
      if (meta.includes('group-title="Bangladesh"') || meta.includes('tvg-country="BD"')) {
        let name = meta.split(',')[1]?.trim() || '';
        const logoMatch = meta.match(/tvg-logo="([^"]*)"/i);
        const logo = logoMatch ? logoMatch[1] : '';
        rawBdChannels.push({ name, url: l, logo });
      }
      meta = '';
    }
  }

  console.log('Total raw BD channels:', rawBdChannels.length);

  // Clean and deduplicate by channel name
  const seenNames = new Set();
  const curatedBdChannels = [];

  // Popular channel priority ordering
  const priority = [
    'Somoy TV', 'Jamuna TV', 'Channel 24', 'Independent TV', 'DBC News',
    'Ekattor TV', 'T Sports', 'BTV National', 'BTV News', 'Channel I',
    'NTV', 'RTV', 'Deepto TV', 'Maasranga TV', 'G TV', 'Nagorik TV',
    'Bangla Vision', 'ATN Bangla', 'ATN News', 'Boishakhi TV', 'Ekushey TV',
    'Desh TV', 'Duronto TV', 'Ekhon TV', 'Global TV', 'Asian TV',
    'Ananda TV', 'Bijoy TV', 'Mohona TV', 'My TV', 'Nexus TV',
    'Channel 9', 'Channel S', 'Green TV', 'SA TV', 'Bangla TV'
  ];

  // First pick priority channels
  for (const pName of priority) {
    const matches = rawBdChannels.filter(c => c.name.toLowerCase().includes(pName.toLowerCase()));
    if (matches.length > 0) {
      // Pick first or best URL (prefer https or gpcdn/aynaott/stream)
      const best = matches.find(m => m.url.startsWith('https://')) || matches[0];
      curatedBdChannels.push({
        id: `bd-${curatedBdChannels.length}-${pName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        name: pName,
        url: best.url,
        group: 'Bangladesh',
        logo: best.logo || `https://raw.githubusercontent.com/saeidrahmanbd/BDIX-IPTV/main/logos/${pName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`
      });
      seenNames.add(pName.toLowerCase());
    }
  }

  // Then add remaining unique BD channels
  for (const c of rawBdChannels) {
    const cleanName = c.name.replace(/\s*\(\d+p\)/gi, '').trim();
    const key = cleanName.toLowerCase();
    if (!seenNames.has(key) && cleanName.length > 2) {
      seenNames.add(key);
      curatedBdChannels.push({
        id: `bd-${curatedBdChannels.length}-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15)}`,
        name: cleanName,
        url: c.url,
        group: 'Bangladesh',
        logo: c.logo || undefined
      });
    }
  }

  console.log('Curated unique BD channels:', curatedBdChannels.length);

  // Now read existing sports, news, movie channels from defaultChannels.json
  const existingPath = path.join(__dirname, '../src/defaultChannels.json');
  let existingChannels = [];
  try {
    existingChannels = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
  } catch (e) {
    existingChannels = [];
  }

  // Keep non-BD channels from existing
  const nonBdChannels = existingChannels.filter(c => c.group !== 'Bangladesh');

  // Combine: All curated BD channels first, then sports, news, movies, music!
  const finalChannelList = [...curatedBdChannels, ...nonBdChannels];
  console.log('Total combined channels in app:', finalChannelList.length);

  fs.writeFileSync(existingPath, JSON.stringify(finalChannelList, null, 2), 'utf8');
  console.log('Successfully updated', existingPath);
}

main();
