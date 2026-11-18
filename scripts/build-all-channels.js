// scripts/build-all-channels.js
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Fetching BDIX Playlist for BD & Indian channels...');
  const bdixRes = await fetch('https://raw.githubusercontent.com/saeidrahmanbd/BDIX-IPTV/main/IPTV-Playlist.m3u');
  const bdixText = await bdixRes.text();
  const bdixLines = bdixText.split(/\r?\n/);

  const rawBdChannels = [];
  const rawIndianChannels = [];
  let meta = '';

  for (const line of bdixLines) {
    const l = line.trim();
    if (l.startsWith('#EXTINF')) {
      meta = l;
    } else if (l && !l.startsWith('#')) {
      const gMatch = meta.match(/group-title="([^"]*)"/i);
      const group = gMatch ? gMatch[1] : '';
      const name = meta.split(',')[1]?.trim() || '';
      const logoMatch = meta.match(/tvg-logo="([^"]*)"/i);
      const logo = logoMatch ? logoMatch[1] : '';

      if (group === 'Bangladesh' || meta.includes('tvg-country="BD"')) {
        rawBdChannels.push({ name, url: l, logo });
      } else if (
        group.startsWith('Indian') ||
        /jalsha|zee|colors|star sports|b4u|9x|goldmines|dd sports|aaj tak|abp|ndtv/i.test(name)
      ) {
        rawIndianChannels.push({ name, url: l, logo, group: group || 'Indian TV' });
      }
      meta = '';
    }
  }

  console.log(`Raw channels parsed: BD=${rawBdChannels.length}, Indian=${rawIndianChannels.length}`);

  // 1. Curate BD Channels
  const bdPriority = [
    'Somoy TV', 'Jamuna TV', 'Channel 24', 'Independent TV', 'DBC News',
    'Ekattor TV', 'T Sports', 'BTV National', 'BTV News', 'Channel I',
    'NTV', 'RTV', 'Deepto TV', 'Maasranga TV', 'G TV', 'Nagorik TV',
    'Bangla Vision', 'ATN Bangla', 'ATN News', 'Boishakhi TV', 'Ekushey TV',
    'Desh TV', 'Duronto TV', 'Ekhon TV', 'Global TV', 'Asian TV',
    'Ananda TV', 'Bijoy TV', 'Mohona TV', 'My TV', 'Nexus TV',
    'Channel 9', 'Channel S', 'Green TV', 'SA TV', 'Bangla TV'
  ];

  const seenBd = new Set();
  const finalBd = [];

  for (const pName of bdPriority) {
    const match = rawBdChannels.find(c => c.name.toLowerCase().includes(pName.toLowerCase()));
    if (match) {
      finalBd.push({
        id: `bd-${finalBd.length}-${pName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        name: pName,
        url: match.url,
        group: 'Bangladesh',
        logo: match.logo || `https://raw.githubusercontent.com/saeidrahmanbd/BDIX-IPTV/main/logos/${pName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`
      });
      seenBd.add(pName.toLowerCase());
    }
  }

  for (const c of rawBdChannels) {
    const cleanName = c.name.replace(/\s*\(\d+p\)/gi, '').trim();
    const key = cleanName.toLowerCase();
    if (!seenBd.has(key) && cleanName.length > 2) {
      seenBd.add(key);
      finalBd.push({
        id: `bd-${finalBd.length}-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15)}`,
        name: cleanName,
        url: c.url,
        group: 'Bangladesh',
        logo: c.logo || undefined
      });
    }
  }

  console.log(`Curated unique BD channels: ${finalBd.length}`);

  // 2. Curate Indian Channels
  const indianPriority = [
    'Colors Bangla', 'Jalsha Movies', 'Zee 24 Ghanta', 'Aakaash Aath', 'Sangeet Bangla',
    'Ruposhi Bangla', 'Dhoom Music', 'Enter10 Bangla', 'DD Bangla', 'Amar Bangla',
    'Star Sports 1 Hindi', 'Star Sports 2', 'Star Sports Select 1', 'Star Sports Select 2', 'DD Sports',
    '&TV', 'Colors', 'Goldmines', 'Goldmines 2', 'B4U Movies',
    'B4U Kadak', 'Colors Cineplex', 'Bollywood OLD', 'Bollygold', 'All Time Movies',
    '9XM', '9X Jalwa', '9X Tashan', 'B4U Music', 'E24', 'Hindi Hits', 'Boogle Bollywood',
    'NDTV Good Times', 'Asianet', 'Asianet Movies'
  ];

  const seenIn = new Set();
  const finalIndian = [];

  for (const pName of indianPriority) {
    const match = rawIndianChannels.find(c => c.name.toLowerCase().includes(pName.toLowerCase()));
    if (match) {
      finalIndian.push({
        id: `in-${finalIndian.length}-${pName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        name: pName,
        url: match.url,
        group: 'Indian TV',
        logo: match.logo || `https://raw.githubusercontent.com/saeidrahmanbd/BDIX-IPTV/main/logos/${pName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`
      });
      seenIn.add(pName.toLowerCase());
    }
  }

  // Add more popular Indian movies & music from raw list
  for (const c of rawIndianChannels) {
    const cleanName = c.name.replace(/\s*\(\d+p\)/gi, '').trim();
    const key = cleanName.toLowerCase();
    if (!seenIn.has(key) && cleanName.length > 2 && finalIndian.length < 75) {
      seenIn.add(key);
      finalIndian.push({
        id: `in-${finalIndian.length}-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15)}`,
        name: cleanName,
        url: c.url,
        group: 'Indian TV',
        logo: c.logo || undefined
      });
    }
  }

  console.log(`Curated unique Indian channels: ${finalIndian.length}`);

  // 3. International sports, news, and movies
  const internationalChannels = [
    {
      id: 'prem-redbull',
      name: 'Red Bull TV Live HD',
      url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
      group: 'Sports',
      logo: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=200&auto=format&fit=crop&q=60'
    },
    {
      id: 'prem-nasa',
      name: 'NASA TV Live HD',
      url: 'https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8',
      group: 'Science & World',
      logo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&auto=format&fit=crop&q=60'
    },
    {
      id: 'prem-mux',
      name: 'StreamBox Cinema HD (Mux)',
      url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      group: 'Movies',
      logo: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&auto=format&fit=crop&q=60'
    },
    {
      id: 'prem-bbb',
      name: 'Big Buck Bunny (Animation HD)',
      url: 'https://test-streams.mux.dev/test_001/stream.m3u8',
      group: 'Movies',
      logo: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=200&auto=format&fit=crop&q=60'
    }
  ];

  // Fetch verified top international sports & news
  try {
    const sportsRes = await fetch('https://iptv-org.github.io/iptv/categories/sports.m3u');
    const sportsText = await sportsRes.text();
    const sLines = sportsText.split(/\r?\n/);
    let sMeta = '';
    let sCount = 0;
    for (const l of sLines) {
      if (l.startsWith('#EXTINF')) sMeta = l;
      else if (l && !l.startsWith('#') && sCount < 20) {
        const name = sMeta.split(',')[1]?.trim() || '';
        const logoMatch = sMeta.match(/tvg-logo="([^"]*)"/i);
        internationalChannels.push({
          id: `intl-sports-${sCount}`,
          name: name.replace(/\s*\(\d+p\)/gi, '').trim(),
          url: l.trim(),
          group: 'Sports',
          logo: logoMatch ? logoMatch[1] : undefined
        });
        sCount++;
        sMeta = '';
      }
    }
  } catch (e) {
    console.log('Skipping intl sports fetch');
  }

  // Combine All Channels:
  // 1. Bangladesh Channels (~75)
  // 2. Indian Channels (~75)
  // 3. International Sports, Movies, Science (~25)
  const combinedAll = [...finalBd, ...finalIndian, ...internationalChannels];
  console.log(`Total final channels in application: ${combinedAll.length}`);

  const outPath = path.join(__dirname, '../src/defaultChannels.json');
  fs.writeFileSync(outPath, JSON.stringify(combinedAll, null, 2), 'utf8');
  console.log('Successfully wrote', outPath);
}

main();
