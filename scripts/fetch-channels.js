// scripts/fetch-channels.js
const fs = require('fs');
const path = require('path');

async function fetchM3U(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return [];
    const text = await res.text();
    const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
    const channels = [];
    let meta = '';
    let group = 'General';

    for (const line0 of lines) {
      const line = line0.trim();
      if (!line) continue;
      if (line.startsWith('#EXTINF')) {
        meta = line;
        const gMatch = line.match(/group-title="([^"]*)"/i);
        if (gMatch) group = gMatch[1];
      } else if (line.startsWith('#EXTGRP:')) {
        group = line.replace('#EXTGRP:', '').trim();
      } else if (!line.startsWith('#') && /^https?:\/\//i.test(line)) {
        let name = meta.split(',')[1]?.trim() || '';
        const logoMatch = meta.match(/tvg-logo="([^"]*)"/i);
        const logo = logoMatch ? logoMatch[1] : '';

        if (!name) {
          try { name = new URL(line).hostname; } catch { name = 'Live Channel'; }
        }

        channels.push({
          id: `ch-${channels.length}-${Math.random().toString(36).slice(2, 7)}`,
          name: name.replace(/\s*\(\d+p\)/gi, '').trim(),
          url: line,
          group: group || 'General',
          logo: logo || undefined
        });
        meta = '';
        group = 'General';
      }
    }
    return channels;
  } catch (e) {
    console.error('Error fetching ' + url, e.message);
    return [];
  }
}

async function main() {
  console.log('Fetching Bangladesh channels...');
  const bdChannels = await fetchM3U('https://iptv-org.github.io/iptv/countries/bd.m3u');
  console.log('Found BD channels:', bdChannels.length);

  console.log('Fetching Sports channels...');
  const sportsChannels = await fetchM3U('https://iptv-org.github.io/iptv/categories/sports.m3u');
  console.log('Found Sports channels:', sportsChannels.length);

  console.log('Fetching News channels...');
  const newsChannels = await fetchM3U('https://iptv-org.github.io/iptv/categories/news.m3u');
  console.log('Found News channels:', newsChannels.length);

  console.log('Fetching Movies channels...');
  const moviesChannels = await fetchM3U('https://iptv-org.github.io/iptv/categories/movies.m3u');
  console.log('Found Movies channels:', moviesChannels.length);

  console.log('Fetching Music channels...');
  const musicChannels = await fetchM3U('https://iptv-org.github.io/iptv/categories/music.m3u');
  console.log('Found Music channels:', musicChannels.length);

  // Curate top channels from each
  const curated = [];

  // BD: take all
  bdChannels.forEach(c => {
    c.group = 'Bangladesh';
    curated.push(c);
  });

  // Sports: take top 20
  sportsChannels.slice(0, 25).forEach(c => {
    c.group = 'Sports';
    if (!curated.some(x => x.url === c.url)) curated.push(c);
  });

  // News: take top 25
  newsChannels.slice(0, 25).forEach(c => {
    c.group = 'News';
    if (!curated.some(x => x.url === c.url)) curated.push(c);
  });

  // Movies: take top 20
  moviesChannels.slice(0, 20).forEach(c => {
    c.group = 'Movies';
    if (!curated.some(x => x.url === c.url)) curated.push(c);
  });

  // Music: take top 15
  musicChannels.slice(0, 15).forEach(c => {
    c.group = 'Music';
    if (!curated.some(x => x.url === c.url)) curated.push(c);
  });

  // Add guaranteed reliable test streams at the top
  const premiumDefaults = [
    {
      id: 'prem-redbull',
      name: 'Red Bull TV Live',
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
      name: 'StreamBox Demo Cinema (Mux HD)',
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

  const finalChannels = [...premiumDefaults, ...curated];
  console.log('Total curated channels:', finalChannels.length);

  const outPath = path.join(__dirname, '../src/defaultChannels.json');
  fs.writeFileSync(outPath, JSON.stringify(finalChannels, null, 2), 'utf8');
  console.log('Saved to', outPath);
}

main();
