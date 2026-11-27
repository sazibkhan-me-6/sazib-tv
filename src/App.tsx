import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import QRCode from 'qrcode';
import {
  Tv, Search, Settings, Heart, Play, Pause, Plus, Upload, Globe2, Radio,
  Film, Trophy, Newspaper, X, ChevronLeft, ChevronRight, Volume2, VolumeX,
  Maximize, Minimize, RefreshCw, ListVideo, Link2, MonitorPlay, Trash2,
  Download, Sparkles, Music, Wifi, Clock, Star, Flame, Smartphone, QrCode,
  Copy, Check, Cast, Compass, RadioTower, Grid, LogIn, Bell, SlidersHorizontal,
  ExternalLink, Home, Tablet, Laptop, Monitor, User, LogOut, Lock, Mail, ShieldCheck, UserPlus
} from 'lucide-react';
import type { Channel, XtreamConfig } from './types';
import defaultChannelsData from './defaultChannels.json';
import sazibTvLogo from './assets/sazib-tv-logo.png';

const DEFAULT_CHANNELS: Channel[] = defaultChannelsData as Channel[];

// Authentic Google Play Store SVG Icon
function PlayStoreIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
      <path d="M48.7 13.1C44.3 17.6 41.7 24.3 41.7 33.1v445.8c0 8.8 2.6 15.5 7 20l242-242.9L48.7 13.1z" fill="#00D2FF" />
      <path d="M372.4 329.8l-81.7-81.8L48.7 498.9c5.3 2.9 12.1 3.3 19.8-1.2l303.9-167.9z" fill="#FF3A44" />
      <path d="M372.4 182.2L68.5 14.3C60.8 9.8 54 10.2 48.7 13.1l242 250.7 81.7-81.6z" fill="#00E676" />
      <path d="M464.3 234.8l-91.9-52.6-81.7 81.7 81.7 81.7 92.1-52.7c15.8-9 24.5-22.1 24.5-39 0-16.9-8.7-30.1-24.7-39.1z" fill="#FFC800" />
    </svg>
  );
}

// Authentic Google 'G' 4-color SVG Icon
function GoogleGIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

// Featured OTT & Android TV Apps
export interface TVApp {
  id: string;
  name: string;
  subtitle?: string;
  logo: string;
  bgColor?: string;
  textColor?: string;
  url?: string;
  webUrl?: string;
  type?: 'channel' | 'ott' | 'tool';
  developer?: string;
  category?: 'ott' | 'live' | 'music' | 'tools';
  categoryLabel?: string;
  rating?: number;
  downloads?: string;
  size?: string;
  description?: string;
  row?: 'apps' | 'widgets';
}

export interface StoreCatalogApp extends TVApp {
  developer: string;
  category: 'ott' | 'live' | 'music' | 'tools';
  categoryLabel: string;
  rating: number;
  downloads: string;
  size: string;
  description: string;
  row: 'apps' | 'widgets';
}

const PLAY_STORE_APP: TVApp = {
  id: 'app-playstore',
  name: 'Google Play Store',
  subtitle: 'Official App Store',
  logo: '',
  bgColor: '#ffffff',
  textColor: '#01875f',
  url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  webUrl: 'https://play.google.com/store/apps',
  type: 'ott'
};

const ALL_STORE_APPS: StoreCatalogApp[] = [
  {
    id: 'app-chorki',
    name: 'Chorki',
    subtitle: 'Film, Fun, Foorti',
    developer: 'Chorki Official',
    category: 'ott',
    categoryLabel: 'ওটিটি ও সিনেমা',
    rating: 4.8,
    downloads: '10M+',
    size: '22 MB',
    logo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=200&auto=format&fit=crop&q=60',
    bgColor: '#ffffff',
    textColor: '#e81c5a',
    url: 'https://vods2.aynaott.com/gseriesDrama/tracks-v1a1/mono.ts.m3u8',
    webUrl: 'https://www.chorki.com',
    description: 'জনপ্রিয় বাংলা সিনেমা, ওয়েব সিরিজ ও অরিজিনাল নাটক দেখার সেরা প্ল্যাটফর্ম।',
    row: 'widgets'
  },
  {
    id: 'app-toffee',
    name: 'Toffee',
    subtitle: 'Live Sports & Dramas',
    developer: 'Banglalink Digital',
    category: 'ott',
    categoryLabel: 'ওটিটি ও সিনেমা',
    rating: 4.7,
    downloads: '50M+',
    size: '28 MB',
    logo: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=200&auto=format&fit=crop&q=60',
    bgColor: '#1d132b',
    textColor: '#f43f5e',
    url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8',
    webUrl: 'https://toffeelive.com',
    description: 'সরাসরি লাইভ ক্রিকেট, ফুটবল এবং শত শত টিভি চ্যানেল ও নাটক ফ্রিতে উপভোগ করুন।',
    row: 'widgets'
  },
  {
    id: 'app-netflix',
    name: 'Netflix',
    subtitle: 'Movies & TV Series',
    developer: 'Netflix, Inc.',
    category: 'ott',
    categoryLabel: 'ওটিটি ও সিনেমা',
    rating: 4.9,
    downloads: '1B+',
    size: '36 MB',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
    bgColor: '#ffffff',
    textColor: '#e50914',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    webUrl: 'https://www.netflix.com',
    description: 'বিশ্ববিখ্যাত ব্লকবাস্টার সিনেমা, সিরিজ ও ডকুমেন্টারির বিশ্বসেরা ওটিটি।',
    row: 'apps'
  },
  {
    id: 'app-youtube',
    name: 'YouTube',
    subtitle: 'Live Videos & Music',
    developer: 'Google LLC',
    category: 'ott',
    categoryLabel: 'ভিডিও ও মিউজিক',
    rating: 4.9,
    downloads: '5B+',
    size: '42 MB',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg',
    bgColor: '#ffffff',
    textColor: '#ff0000',
    url: 'https://tv-trtworld.medya.trt.com.tr/master.m3u8',
    webUrl: 'https://www.youtube.com',
    description: 'অফিসিয়াল ইউটিউব টিভি অ্যাপ - হাই ডেফিনিশন ভিডিও, লাইভ নিউজ ও গান।',
    row: 'apps'
  },
  {
    id: 'app-prime',
    name: 'Prime Video',
    subtitle: 'Amazon Originals & Movies',
    developer: 'Amazon Mobile LLC',
    category: 'ott',
    categoryLabel: 'ওটিটি ও সিনেমা',
    rating: 4.6,
    downloads: '500M+',
    size: '34 MB',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Amazon_Prime_Video_logo.svg',
    bgColor: '#00050d',
    textColor: '#00a8e1',
    url: 'https://amg00877-b4unew-amg00877c2-xiaomi-in-5489.playouts.now.amagi.tv/playlist.m3u8',
    webUrl: 'https://www.primevideo.com',
    description: 'অ্যামাজন অরিজিনালস, হিন্দি ও হলিউড সিনেমার প্রিমিয়াম কালেকশন।',
    row: 'apps'
  },
  {
    id: 'app-disney',
    name: 'Disney+ Hotstar',
    subtitle: 'Blockbuster Cinema & Cricket',
    developer: 'Novi Digital',
    category: 'ott',
    categoryLabel: 'ওটিটি ও সিনেমা',
    rating: 4.7,
    downloads: '500M+',
    size: '30 MB',
    logo: '',
    bgColor: '#040d29',
    textColor: '#1055ea',
    url: 'https://samitaorigin.tangotv.in/ALLTIMEMOVIES/SAMITAORIGIN/index.m3u8',
    webUrl: 'https://www.hotstar.com',
    description: 'ডিজনি প্লাস, মার্ভেল, স্টার প্লাস সিরিয়াল এবং সরাসরি লাইভ ক্রিকেট।',
    row: 'apps'
  },
  {
    id: 'app-hoichoi',
    name: 'Hoichoi',
    subtitle: 'Best of Bangla Movies',
    developer: 'Hoichoi Technologies',
    category: 'ott',
    categoryLabel: 'ওটিটি ও সিনেমা',
    rating: 4.6,
    downloads: '10M+',
    size: '25 MB',
    logo: '',
    bgColor: '#e31b23',
    textColor: '#ffffff',
    url: 'https://box.bbaria.net:8083/Jalsha_Movie/tracks-v1a1/mono.m3u8',
    webUrl: 'https://www.hoichoi.tv',
    description: 'সর্ববৃহৎ বাংলা বিনোদন প্ল্যাটফর্ম - ১০০+ এক্সক্লুসিভ সিরিজ ও সিনেমা।',
    row: 'widgets'
  },
  {
    id: 'app-zee5',
    name: 'Zee5',
    subtitle: 'Colors Bangla & Serials',
    developer: 'Zee Entertainment',
    category: 'ott',
    categoryLabel: 'ওটিটি ও সিনেমা',
    rating: 4.5,
    downloads: '100M+',
    size: '31 MB',
    logo: '',
    bgColor: '#170c2d',
    textColor: '#f58220',
    url: 'https://tvsen6.aynaott.com/ZeeBangla/index.m3u8',
    webUrl: 'https://www.zee5.com',
    description: 'জি বাংলা, জি সিনেমা ও জনপ্রিয় বাংলা সিরিয়াল লাইভ ও অন-ডিমান্ড।',
    row: 'widgets'
  },
  {
    id: 'app-bongo',
    name: 'Bongo BD',
    subtitle: 'All Entertainment',
    developer: 'Stellar Digital Ltd',
    category: 'ott',
    categoryLabel: 'ওটিটি ও সিনেমা',
    rating: 4.4,
    downloads: '10M+',
    size: '18 MB',
    logo: '',
    bgColor: '#d4145a',
    textColor: '#ffffff',
    url: 'http://alvetv.com/moviebanglatv/8080/index.m3u8',
    webUrl: 'https://bongobd.com',
    description: 'বাংলা নাটক, তামিল ডাব্বড মুভি এবং আকর্ষণীয় ওয়েব সিরিজ।',
    row: 'widgets'
  },
  {
    id: 'app-sonyliv',
    name: 'Sony LIV',
    subtitle: 'Live Sports & Premium TV',
    developer: 'Culver Max Entertainment',
    category: 'ott',
    categoryLabel: 'লাইভ ও স্পোর্টস',
    rating: 4.5,
    downloads: '100M+',
    size: '29 MB',
    logo: '',
    bgColor: '#0c0f1d',
    textColor: '#00e5ff',
    url: 'https://starsportshindiii.pages.dev/index.m3u8',
    webUrl: 'https://www.sonyliv.com',
    description: 'সনি টিভি, উয়েফা চ্যাম্পিয়ন্স লিগ ফুটবল ও লাইভ স্পোর্টস।',
    row: 'apps'
  },
  {
    id: 'app-tsports',
    name: 'T Sports',
    subtitle: 'Live Sports & Cricket',
    developer: 'Bashundhara Group',
    category: 'live',
    categoryLabel: 'লাইভ টিভি ও স্পোর্টস',
    rating: 4.8,
    downloads: '10M+',
    size: '16 MB',
    logo: '',
    bgColor: '#b91c1c',
    textColor: '#ffffff',
    url: 'https://raw.githubusercontent.com/iptv-org/iptv/master/streams/bd.m3u8',
    webUrl: 'https://tsports.com',
    description: 'বাংলাদেশের প্রথম ও একমাত্র স্পোর্টস চ্যানেল - BPL ও আন্তর্জাতিক খেলা।',
    row: 'widgets'
  },
  {
    id: 'app-spotify',
    name: 'Spotify TV',
    subtitle: 'Bangla & Global Music',
    developer: 'Spotify AB',
    category: 'music',
    categoryLabel: 'মিউজিক ও গান',
    rating: 4.8,
    downloads: '1B+',
    size: '27 MB',
    logo: '',
    bgColor: '#121212',
    textColor: '#1db954',
    url: 'https://mumt05.tangotv.in/87NeALx2SANGEETBANGLA/index.m3u8',
    webUrl: 'https://open.spotify.com',
    description: 'কোটি কোটি গান, পডকাস্ট ও বাংলা অ্যালবাম ব্যাকগ্রাউন্ডে শুনুন।',
    row: 'apps'
  },
  {
    id: 'app-ytmusic',
    name: 'YouTube Music',
    subtitle: 'Official Music & Playlists',
    developer: 'Google LLC',
    category: 'music',
    categoryLabel: 'মিউজিক ও গান',
    rating: 4.7,
    downloads: '1B+',
    size: '26 MB',
    logo: '',
    bgColor: '#000000',
    textColor: '#ff0000',
    webUrl: 'https://music.youtube.com',
    description: 'ইউটিউব এর অফিসিয়াল মিউজিক স্ট্রিমিং অ্যাপ।',
    row: 'apps'
  },
  {
    id: 'app-jiocinema',
    name: 'JioCinema',
    subtitle: 'Movies, Cricket & HBO',
    developer: 'Viacom18 Media',
    category: 'ott',
    categoryLabel: 'ওটিটি ও সিনেমা',
    rating: 4.6,
    downloads: '500M+',
    size: '35 MB',
    logo: '',
    bgColor: '#1a0933',
    textColor: '#d946ef',
    webUrl: 'https://www.jiocinema.com',
    description: 'আইপিএল লাইভ, ভারতীয় সিনেমা এবং এইচবিও অরিজিনালস।',
    row: 'widgets'
  },
  {
    id: 'app-bioscope',
    name: 'Bioscope',
    subtitle: 'GP Live TV & Series',
    developer: 'Grameenphone',
    category: 'ott',
    categoryLabel: 'ওটিটি ও সিনেমা',
    rating: 4.5,
    downloads: '10M+',
    size: '19 MB',
    logo: '',
    bgColor: '#005b94',
    textColor: '#ffffff',
    url: 'https://byphdgllyk.gpcdn.net/hls/deeptotv/index.m3u8',
    webUrl: 'https://www.bioscopelive.com',
    description: 'গ্রামীণফোনের অফিসিয়াল ওটিটি - লাইভ টিভি ও এক্সক্লুসিভ নাটক।',
    row: 'widgets'
  },
  {
    id: 'app-iscreen',
    name: 'iScreen',
    subtitle: 'Channel I OTT Hub',
    developer: 'Impress Telefilm Ltd',
    category: 'ott',
    categoryLabel: 'ওটিটি ও সিনেমা',
    rating: 4.3,
    downloads: '5M+',
    size: '15 MB',
    logo: '',
    bgColor: '#0f381e',
    textColor: '#22c55e',
    url: 'https://tvsen6.aynaott.com/FNHpYvGZ7FkCE10PwTHm/index.m3u8',
    webUrl: 'https://iscreen.com.bd',
    description: 'চ্যানেল আই এর সমস্ত অনুষ্ঠান, নাটক ও সিনেমা।',
    row: 'widgets'
  },
  {
    id: 'app-vlc',
    name: 'VLC for Android',
    subtitle: 'Powerful 4K/HDR Player',
    developer: 'VideoLAN',
    category: 'tools',
    categoryLabel: 'টুলস ও প্লেয়ার',
    rating: 4.9,
    downloads: '100M+',
    size: '38 MB',
    logo: '',
    bgColor: '#ff8800',
    textColor: '#ffffff',
    webUrl: 'https://www.videolan.org/vlc/',
    description: 'সব ধরণের ভিডিও ও অডিও ফরম্যাট এবং নেটওয়ার্ক স্ট্রিম চালানোর সেরা প্লেয়ার।',
    row: 'apps'
  },
  {
    id: 'app-mxplayer',
    name: 'MX Player TV',
    subtitle: 'Web Series & HD Video',
    developer: 'MX Media',
    category: 'tools',
    categoryLabel: 'টুলস ও প্লেয়ার',
    rating: 4.6,
    downloads: '500M+',
    size: '32 MB',
    logo: '',
    bgColor: '#0284c7',
    textColor: '#ffffff',
    webUrl: 'https://www.mxplayer.in',
    description: 'অনলাইন ওয়েব সিরিজ, সিনেমা এবং হাই কোয়ালিটি টিভি প্লেয়ার।',
    row: 'apps'
  },
  {
    id: 'app-kodi',
    name: 'KODI Media Center',
    subtitle: 'Home Theater Media Hub',
    developer: 'XBMC Foundation',
    category: 'tools',
    categoryLabel: 'টুলস ও প্লেয়ার',
    rating: 4.7,
    downloads: '50M+',
    size: '65 MB',
    logo: '',
    bgColor: '#1793d1',
    textColor: '#ffffff',
    webUrl: 'https://kodi.tv',
    description: 'সম্পূর্ণ ওপেন-সোর্স হোম থিয়েটার সফটওয়্যার।',
    row: 'widgets'
  },
  {
    id: 'app-tvweb',
    name: 'TVWeb Browser',
    subtitle: 'High Speed TV Browser',
    developer: 'TVWeb Team',
    category: 'tools',
    categoryLabel: 'টুলস ও প্লেয়ার',
    rating: 4.5,
    downloads: '10M+',
    size: '12 MB',
    logo: '',
    bgColor: '#ffffff',
    textColor: '#0284c7',
    url: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8',
    webUrl: 'https://www.google.com',
    description: 'টিভির জন্য স্পেশালি অপ্টিমাইজড ব্রাউজার।',
    row: 'widgets'
  },
  {
    id: 'app-crunchyroll',
    name: 'Crunchyroll',
    subtitle: 'Anime & Manga Series',
    developer: 'Crunchyroll, LLC',
    category: 'ott',
    categoryLabel: 'ওটিটি ও সিনেমা',
    rating: 4.7,
    downloads: '100M+',
    size: '33 MB',
    logo: '',
    bgColor: '#23252b',
    textColor: '#f47521',
    url: 'https://test-streams.mux.dev/test_001/stream.m3u8',
    webUrl: 'https://www.crunchyroll.com',
    description: 'বিশ্বের বৃহত্তম এনিমে লাইব্রেরি - ডাব্বড ও সাবটাইটেলসহ।',
    row: 'apps'
  },
  {
    id: 'app-appletv',
    name: 'Apple TV+',
    subtitle: 'Apple Originals & Cinema',
    developer: 'Apple Inc.',
    category: 'ott',
    categoryLabel: 'ওটিটি ও সিনেমা',
    rating: 4.6,
    downloads: '50M+',
    size: '28 MB',
    logo: '',
    bgColor: '#000000',
    textColor: '#ffffff',
    url: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8',
    webUrl: 'https://tv.apple.com',
    description: 'পুরস্কারপ্রাপ্ত অ্যাপল অরিজিনাল সিরিজ ও চলচ্চিত্র।',
    row: 'apps'
  },
  {
    id: 'app-fastcast',
    name: 'FastCast',
    subtitle: 'Mobile Cast & Remote',
    developer: 'Sazib TV',
    category: 'tools',
    categoryLabel: 'টুলস ও প্লেয়ার',
    rating: 5.0,
    downloads: '1M+',
    size: '8 MB',
    logo: '',
    bgColor: '#00a8e8',
    textColor: '#ffffff',
    type: 'tool',
    webUrl: '',
    description: 'স্মার্টফোনকে রিমোট ও এয়ার মাউস হিসেবে কানেক্ট করার টুল।',
    row: 'apps'
  },
  {
    id: 'app-player',
    name: 'Sazib Player',
    subtitle: '4K Ultra HD Player',
    developer: 'Sazib TV',
    category: 'tools',
    categoryLabel: 'টুলস ও প্লেয়ার',
    rating: 5.0,
    downloads: '1M+',
    size: '10 MB',
    logo: '',
    bgColor: '#0072ce',
    textColor: '#ffffff',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    type: 'ott',
    webUrl: '',
    description: 'বিল্ট-ইন ৪কে আল্ট্রা এইচডি প্লেয়ার এবং অডিও ইকুইলাইজার।',
    row: 'apps'
  }
];

function classifyCategory(c: Channel): string {
  const s = (c.group + ' ' + c.name).toLowerCase();
  if (c.group === 'Indian TV' || /colors|jalsha|zee 24|aakaash|sangeet bangla|ruposhi|goldmines|b4u|9x|star sports|dd sports|&tv|asianet|cineplex|bolly|dd bangla|amar bangla/i.test(s)) {
    return 'india';
  }
  if (/bangla|bd|bangladesh|dhaka|chittagong|somoy|jamuna|ekattor|dbc|independent|ntv|rtv|deepto|gtv|btv|maasranga|nagorik|atn|channel s|bijoy|ananda|desh|duronto|global tv|asian tv|mohana|my tv|nexus|channel 9|green tv|sa tv/.test(s)) return 'bd';
  if (/sport|cricket|football|tennis|espn|fifa|racing|red bull|combat|fight/.test(s)) return 'sports';
  if (/movie|cinema|film|hbo|cinemax|blockbuster|animation|bunny|mux/.test(s)) return 'movies';
  if (/news|bbc|cnn|al.?jazeera|sky news|reuters|euronews|cna|wion|trt|nhk|france 24|dw|24/.test(s)) return 'news';
  if (/music|song|mtv|vh1|radio|clubbing|trace/.test(s)) return 'music';
  return 'general';
}

// 🚀 ULTRA ZERO-BUFFERING HIGH-CONCURRENCY HLS STREAM ENGINE (10M+ USERS CAPACITY)
const getUltraHlsConfig = () => ({
  enableWorker: true,
  lowLatencyMode: true,
  backBufferLength: 90,             // 90s backbuffer prevents freeze and allows smooth scrubbing
  maxBufferLength: 60,              // Keep 60 seconds of video pre-buffered ahead
  maxMaxBufferLength: 180,          // Forward buffer capacity up to 180 seconds
  maxBufferSize: 120 * 1024 * 1024, // 120MB high-throughput buffer memory per stream
  maxBufferHole: 0.8,               // Auto-jump over micro-gaps up to 0.8s without freezing
  highBufferWatchdogPeriod: 1,      // Watchdog checks buffer health every second
  nudgeOffset: 0.15,                // Micro-nudge past frame drops
  nudgeMaxRetry: 10,                // 10 auto-retries before stalling
  maxFragLookUpTolerance: 0.25,
  liveSyncDurationCount: 3,         // Target 3 live segments ahead of edge
  liveMaxLatencyDurationCount: 10,  // Max tolerable latency window
  liveDurationInfinity: true,

  // CDN Congestion Defense & Ultra Retries (Survives CDN Traffic Spikes)
  manifestLoadingTimeOut: 25000,
  manifestLoadingMaxRetry: 10,
  manifestLoadingRetryDelay: 500,
  manifestLoadingMaxRetryTimeout: 10000,

  levelLoadingTimeOut: 25000,
  levelLoadingMaxRetry: 10,
  levelLoadingRetryDelay: 500,
  levelLoadingMaxRetryTimeout: 10000,

  fragLoadingTimeOut: 30000,
  fragLoadingMaxRetry: 12,
  fragLoadingRetryDelay: 400,
  fragLoadingMaxRetryTimeout: 15000,

  // Smooth Dynamic Adaptive Bitrate (ABR) - Prevents stalling on congested networks
  abrEwmaFastLive: 2.0,
  abrEwmaSlowLive: 6.0,
  abrBandWidthFactor: 0.9,
  abrBandWidthUpFactor: 0.7,
  abrMaxWithRealBitrate: true,
  capLevelToPlayerSize: true,
  startLevel: -1,                   // Auto-detect optimal startup bitrate
  testBandwidth: true,
  progressive: true,
  xhrSetup: (xhr: XMLHttpRequest) => {
    xhr.withCredentials = false;
    try {
      xhr.timeout = 30000;
    } catch {}
  }
});

const CHANNELS_VERSION = 'sazib-tv-v6';
const ADMIN_CONTROL_URL = 'https://sazib-tv-admin.vercel.app/site-control.json';
const ADMIN_CHANNELS_URL = 'https://sazib-tv-admin.vercel.app/channels.json';

export type AppLanguage = 'bn' | 'en' | 'hi' | 'ar' | 'ur';

const APP_LANGUAGES: { code: AppLanguage; label: string; native: string; flag: string }[] = [
  { code: 'bn', label: 'Bengali', native: 'বাংলা', flag: '🇧🇩' },
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', label: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'ur', label: 'Urdu', native: 'اردو', flag: '🇵🇰' },
];

const APP_COUNTRIES: { code: string; name: string; flag: string }[] = [
  { code: 'BD', name: 'Bangladesh (বাংলাদেশ)', flag: '🇧🇩' },
  { code: 'IN', name: 'India (ভারত)', flag: '🇮🇳' },
  { code: 'PK', name: 'Pakistan (পাকিস্তান)', flag: '🇵🇰' },
  { code: 'SA', name: 'Saudi Arabia (সৌদি আরব)', flag: '🇸🇦' },
  { code: 'AE', name: 'UAE (সংযুক্ত আরব আমিরাত)', flag: '🇦🇪' },
  { code: 'QA', name: 'Qatar (কাতার)', flag: '🇶🇦' },
  { code: 'KW', name: 'Kuwait (কুয়েত)', flag: '🇰🇼' },
  { code: 'MY', name: 'Malaysia (মালয়েশিয়া)', flag: '🇲🇾' },
  { code: 'SG', name: 'Singapore (সিঙ্গাপুর)', flag: '🇸🇬' },
  { code: 'GB', name: 'United Kingdom (যুক্তরাজ্য)', flag: '🇬🇧' },
  { code: 'US', name: 'United States (যুক্তরাষ্ট্র)', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada (কানাডা)', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia (অস্ট্রেলিয়া)', flag: '🇦🇺' },
  { code: 'GLOBAL', name: 'Global / International', flag: '🌍' },
];

const UI_TEXT: Record<AppLanguage, {
  searchPlaceholder: string;
  login: string;
  back: string;
  home: string;
  tv: string;
  ott: string;
  remote: string;
  settings: string;
  settingsTitle: string;
  langCountryTitle: string;
  selectCountry: string;
  selectLanguage: string;
  seeAll: string;
}> = {
  bn: {
    searchPlaceholder: 'চ্যানেল, খেলা বা মুভি খুঁজুন...',
    login: 'লগইন',
    back: 'ফিরে যান',
    home: 'হোম',
    tv: 'টিভি',
    ott: 'ওটিটি',
    remote: 'রিমোট',
    settings: 'সেটিংস',
    settingsTitle: 'সেটিংস, ভাষা ও চ্যানেল সেটআপ',
    langCountryTitle: 'ভাষা ও দেশ সেটআপ (LANGUAGE & COUNTRY)',
    selectCountry: 'দেশ নির্বাচন করুন (Country)',
    selectLanguage: 'ভাষা নির্বাচন করুন (Language)',
    seeAll: 'সব দেখুন',
  },
  en: {
    searchPlaceholder: 'Search channels, sports or movies...',
    login: 'Login',
    back: 'Back',
    home: 'Home',
    tv: 'Live TV',
    ott: 'OTT',
    remote: 'Remote',
    settings: 'Settings',
    settingsTitle: 'Settings, Language & Channels',
    langCountryTitle: 'LANGUAGE & COUNTRY SETUP',
    selectCountry: 'Select Country',
    selectLanguage: 'Select Language',
    seeAll: 'See All',
  },
  hi: {
    searchPlaceholder: 'चैनल, स्पोर्ट्स या मूवी खोजें...',
    login: 'लॉगिन',
    back: 'वापस',
    home: 'होम',
    tv: 'टीवी',
    ott: 'ओटीटी',
    remote: 'रिमोट',
    settings: 'सेटिंग्स',
    settingsTitle: 'सेटिंग्स, भाषा और चैनल सेटअप',
    langCountryTitle: 'भाषा और देश सेटअप (LANGUAGE & COUNTRY)',
    selectCountry: 'देश चुनें (Country)',
    selectLanguage: 'भाषा चुनें (Language)',
    seeAll: 'सभी देखें',
  },
  ar: {
    searchPlaceholder: 'ابحث عن القنوات أو الرياضة أو الأفلام...',
    login: 'دخول',
    back: 'رجوع',
    home: 'الرئيسية',
    tv: 'تلفاز',
    ott: 'منصات',
    remote: 'ريموت',
    settings: 'الإعدادات',
    settingsTitle: 'الإعدادات واللغة والقنوات',
    langCountryTitle: 'إعداد اللغة والدولة (LANGUAGE & COUNTRY)',
    selectCountry: 'اختر الدولة (Country)',
    selectLanguage: 'اختر اللغة (Language)',
    seeAll: 'عرض الكل',
  },
  ur: {
    searchPlaceholder: 'چینلز، کھیل یا فلمیں تلاش کریں...',
    login: 'لاگ ان',
    back: 'واپس',
    home: 'ہوم',
    tv: 'ٹی وی',
    ott: 'او ٹی ٹی',
    remote: 'ریموٹ',
    settings: 'سیٹنگز',
    settingsTitle: 'سیٹنگز، زبان اور چینل سیٹ اپ',
    langCountryTitle: 'زبان اور ملک سیٹ اپ (LANGUAGE & COUNTRY)',
    selectCountry: 'ملک منتخب کریں (Country)',
    selectLanguage: 'زبان منتخب کریں (Language)',
    seeAll: 'سب دیکھیں',
  },
};

export type DeviceMode = 'auto' | 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'tv';
export type ActiveDeviceType = 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'tv';

function useDeviceLayout() {
  const [deviceOverride, setDeviceOverride] = useState<DeviceMode>(() => {
    try {
      const saved = localStorage.getItem('sazib_device_mode');
      if (saved && ['auto', 'mobile', 'tablet', 'laptop', 'desktop', 'tv'].includes(saved)) {
        return saved as DeviceMode;
      }
    } catch {}
    return 'auto';
  });

  const [autoRotate, setAutoRotate] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sazib_auto_rotate');
      if (saved !== null) return saved === 'true';
    } catch {}
    return true; // Default ON for phones and tablets
  });

  const [windowWidth, setWindowWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1280));
  const [windowHeight, setWindowHeight] = useState(() => (typeof window !== 'undefined' ? window.innerHeight : 720));

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });
    if (typeof window !== 'undefined' && window.screen && window.screen.orientation) {
      window.screen.orientation.addEventListener('change', handleResize);
    }

    // When auto-rotate is enabled, unlock orientation lock so phone/tablet rotates freely
    if (autoRotate && typeof screen !== 'undefined' && screen.orientation && screen.orientation.unlock) {
      try {
        screen.orientation.unlock();
      } catch {}
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (typeof window !== 'undefined' && window.screen && window.screen.orientation) {
        window.screen.orientation.removeEventListener('change', handleResize);
      }
    };
  }, [autoRotate]);

  const toggleAutoRotate = useCallback(() => {
    setAutoRotate(prev => {
      const next = !prev;
      try {
        localStorage.setItem('sazib_auto_rotate', String(next));
      } catch {}
      if (next && typeof screen !== 'undefined' && screen.orientation && screen.orientation.unlock) {
        try {
          screen.orientation.unlock();
        } catch {}
      }
      return next;
    });
  }, []);

  const manualRotate = useCallback(() => {
    try {
      if (typeof screen !== 'undefined' && screen.orientation) {
        const isCurrentPortrait = window.innerHeight > window.innerWidth;
        if (isCurrentPortrait) {
          if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().then(() => {
              (screen.orientation as any).lock?.('landscape').catch(() => {});
            }).catch(() => {
              (screen.orientation as any).lock?.('landscape').catch(() => {});
            });
          } else {
            (screen.orientation as any).lock?.('landscape').catch(() => {});
          }
        } else {
          (screen.orientation as any).lock?.('portrait').catch(() => {
            screen.orientation.unlock?.();
          });
        }
      }
    } catch {}
  }, []);

  const detectedType = useMemo((): ActiveDeviceType => {
    if (typeof window === 'undefined') return 'desktop';
    const ua = navigator.userAgent.toLowerCase();
    const isTV = ua.includes('googletv') || ua.includes('android tv') || ua.includes('smarttv') || 
                 ua.includes('tizen') || ua.includes('webos') || ua.includes('netcast') || 
                 ua.includes('large screen') || ua.includes('appletv') || ua.includes('mibox') || ua.includes('firetv');
    if (isTV) return 'tv';
    
    const minDim = Math.min(windowWidth, windowHeight);
    const maxDim = Math.max(windowWidth, windowHeight);

    if (minDim < 600 && maxDim < 960) return 'mobile';
    if (minDim <= 840 && maxDim <= 1366) return 'tablet';
    if (windowWidth <= 1440) return 'laptop';
    if (windowWidth >= 1680) return 'tv';
    return 'desktop';
  }, [windowWidth, windowHeight]);

  const activeDevice = deviceOverride === 'auto' ? detectedType : deviceOverride;

  const updateDeviceMode = useCallback((mode: DeviceMode) => {
    setDeviceOverride(mode);
    try {
      localStorage.setItem('sazib_device_mode', mode);
    } catch {}
  }, []);

  return {
    activeDevice,
    detectedType,
    deviceOverride,
    updateDeviceMode,
    autoRotate,
    toggleAutoRotate,
    manualRotate,
    windowWidth,
    windowHeight,
    isMobile: activeDevice === 'mobile',
    isTablet: activeDevice === 'tablet',
    isLaptop: activeDevice === 'laptop',
    isDesktop: activeDevice === 'desktop',
    isTV: activeDevice === 'tv',
  };
}

export default function App() {
  const [channels, setChannels] = useState<Channel[]>(() => {
    try {
      const storedVersion = localStorage.getItem('sb-channels-version');
      const stored = localStorage.getItem('sb-channels');
      if (stored && storedVersion === CHANNELS_VERSION) {
        const parsed = JSON.parse(stored);
        if (
          Array.isArray(parsed) &&
          parsed.length >= 20 &&
          parsed.some((c: Channel) => c.name.toLowerCase().includes('somoy'))
        ) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    try {
      localStorage.setItem('sb-channels-version', CHANNELS_VERSION);
      localStorage.setItem('sb-channels', JSON.stringify(DEFAULT_CHANNELS));
    } catch {}
    return DEFAULT_CHANNELS;
  });

  // Live Admin Control Panel Sync (https://sazib-tv-admin.vercel.app/)
  const [adminControl, setAdminControl] = useState<{
    maintenanceMode: boolean;
    maintenanceMessage: string;
    masterStreaming: boolean;
    announcementEnabled: boolean;
    announcementText: string;
    supportContact: string;
  }>({
    maintenanceMode: false,
    maintenanceMessage: 'Sazib TV is under scheduled maintenance. We will be back shortly!',
    masterStreaming: true,
    announcementEnabled: false,
    announcementText: '',
    supportContact: ''
  });

  useEffect(() => {
    let cancelled = false;
    const syncFromAdminPanel = async () => {
      const ts = Date.now();
      try {
        const ctrlRes = await fetch(`${ADMIN_CONTROL_URL}?t=${ts}`, { cache: 'no-store' });
        if (ctrlRes.ok && !cancelled) {
          const ctrlData = await ctrlRes.json();
          if (ctrlData && typeof ctrlData === 'object') {
            setAdminControl(prev => ({ ...prev, ...ctrlData }));
          }
        }
      } catch {
        // offline fallback
      }
      try {
        const chRes = await fetch(`${ADMIN_CHANNELS_URL}?t=${ts}`, { cache: 'no-store' });
        if (chRes.ok && !cancelled) {
          const chData = await chRes.json();
          if (Array.isArray(chData) && chData.length > 0) {
            const activeOnly: Channel[] = chData
              .filter((c: any) => c && c.active !== false && c.url)
              .map((c: any, idx: number) => ({
                id: c.id || `admin-ch-${idx}`,
                name: c.name || 'Unnamed Channel',
                url: c.url,
                group: c.group || c.category || 'General',
                logo: c.logo || '',
                ...(c.webUrl ? { webUrl: c.webUrl } : {})
              }));
            if (activeOnly.length > 0) {
              setChannels(activeOnly);
              try {
                localStorage.setItem('sb-channels-version', CHANNELS_VERSION);
                localStorage.setItem('sb-channels', JSON.stringify(activeOnly));
              } catch {}
            }
          }
        }
      } catch {
        // offline fallback
      }
    };
    syncFromAdminPanel();
    const interval = setInterval(syncFromAdminPanel, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('sb-favs') || '[]');
    } catch {
      return [];
    }
  });

  const [active, setActive] = useState<Channel | null>(null);
  const [query, setQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showMobileConnect, setShowMobileConnect] = useState(false);

  // Sazib TV Activation-Code Account Authentication System State
  type SazibAccount = {
    id: string;
    name: string;
    identifier: string;
    email: string;
    phone: string;
    address: string;
    nid: string;
    activationCode: string;
    plan?: string;
    expiresAt?: string;
    createdAt: string;
  };
  const [currentUser, setCurrentUser] = useState<SazibAccount | null>(() => {
    try {
      const saved = localStorage.getItem('sazib_tv_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [activeCategoryRail, setActiveCategoryRail] = useState<string | null>(null);
  const [appLanguage, setAppLanguage] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem('sazib_tv_language') as AppLanguage | null;
      if (saved && ['bn', 'en', 'hi', 'ar', 'ur'].includes(saved)) return saved;
    } catch {}
    return 'bn';
  });
  const [appCountry, setAppCountry] = useState<string>(() => {
    try {
      return localStorage.getItem('sazib_tv_country') || 'BD';
    } catch {
      return 'BD';
    }
  });
  const t = UI_TEXT[appLanguage];
  const activeCountryObj = useMemo(() => APP_COUNTRIES.find(c => c.code === appCountry) || APP_COUNTRIES[0], [appCountry]);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authAddress, setAuthAddress] = useState('');
  const [authNid, setAuthNid] = useState('');
  const [authIdentifier, setAuthIdentifier] = useState('');
  const [authActivationCode, setAuthActivationCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSending, setAuthSending] = useState(false);
  const [signupResult, setSignupResult] = useState<{
    name: string;
    email: string;
    phone: string;
    activationCode: string;
    emailDispatched: boolean;
    smsDispatched: boolean;
  } | null>(null);

  const device = useDeviceLayout();
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [xtream, setXtream] = useState<XtreamConfig>({ host: '', username: '', password: '' });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [copied, setCopied] = useState(false);

  // Mobile Remote Connection info (Initialized immediately with LAN IP from URL params or default)
  const queryParams = new URLSearchParams(window.location.search);
  const initialMobileUrl = queryParams.get('mobileUrl') || 'http://192.168.0.4:8989';
  const initialMobileIp = queryParams.get('mobileIp') || '192.168.0.4';

  const [mobileInfo, setMobileInfo] = useState<{ ip: string; port: number; url: string }>({
    ip: initialMobileIp,
    port: 8989,
    url: initialMobileUrl
  });
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const generateQR = useCallback(async (targetUrl: string) => {
    try {
      const qr = await QRCode.toDataURL(targetUrl, {
        width: 340,
        margin: 2,
        color: { dark: '#060b18', light: '#ffffff' },
        errorCorrectionLevel: 'M'
      });
      setQrCodeDataUrl(qr);
    } catch {
      setQrCodeDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=340x340&data=${encodeURIComponent(targetUrl)}`);
    }
  }, []);

  // Player state
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [streamError, setStreamError] = useState(false);
  const [isLoadingStream, setIsLoadingStream] = useState(false);
  const [playerOsd, setPlayerOsd] = useState<{ title: string; sub?: string; logo?: string } | null>(null);
  const [showQuickDrawer, setShowQuickDrawer] = useState(false);
  const [drawerQuery, setDrawerQuery] = useState('');
  const osdTimerRef = useRef<any>(null);

  const showOsd = useCallback((title: string, sub?: string, logo?: string) => {
    setPlayerOsd({ title, sub, logo });
    if (osdTimerRef.current) clearTimeout(osdTimerRef.current);
    osdTimerRef.current = setTimeout(() => setPlayerOsd(null), 3000);
  }, []);

  // Virtual Air Mouse Cursor (controlled via Smartphone Remote)
  const [virtualCursor, setVirtualCursor] = useState<{ x: number; y: number; visible: boolean; isClicking: boolean }>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 600,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 400,
    visible: false,
    isClicking: false
  });
  const cursorHideTimerRef = useRef<any>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const playerOverlayRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus item for Leanback Keyboard / Remote Navigation
  const [focusedId, setFocusedId] = useState<string>('app-playstore');

  // Google Account & Authentication State
  const [googleUser, setGoogleUser] = useState<{ name: string; email: string } | null>(() => {
    try {
      const saved = localStorage.getItem('sazib_tv_google_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleInputEmail, setGoogleInputEmail] = useState('');
  const [googleInputName, setGoogleInputName] = useState('');

  // Google Play Store Hub State & Direct App Installation Engine
  const [showPlayStoreHub, setShowPlayStoreHub] = useState(false);
  const [storeCategory, setStoreCategory] = useState<string>('all');
  const [storeSearch, setStoreSearch] = useState<string>('');
  const [installingAppId, setInstallingAppId] = useState<string | null>(null);
  const [installProgress, setInstallProgress] = useState<number>(0);

  const [installedAppIds, setInstalledAppIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sazib_tv_installed_apps');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      'app-netflix', 'app-youtube', 'app-prime', 'app-spotify',
      'app-fastcast', 'app-player', 'app-chorki', 'app-toffee',
      'app-hoichoi', 'app-zee5', 'app-bongo'
    ];
  });

  const [customApps, setCustomApps] = useState<StoreCatalogApp[]>(() => {
    try {
      const saved = localStorage.getItem('sazib_tv_custom_apps');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Custom App Form inputs
  const [customAppName, setCustomAppName] = useState('');
  const [customAppUrl, setCustomAppUrl] = useState('');
  const [customAppCategory, setCustomAppCategory] = useState<'ott' | 'live' | 'music' | 'tools'>('ott');
  const [customAppRow, setCustomAppRow] = useState<'apps' | 'widgets'>('apps');

  // All store apps + custom installed apps
  const allStoreAndCustom = useMemo(() => [...ALL_STORE_APPS, ...customApps], [customApps]);

  const featuredAppsRow1 = useMemo(() => {
    return [PLAY_STORE_APP, ...allStoreAndCustom.filter(a => a.row === 'apps' && installedAppIds.includes(a.id))];
  }, [allStoreAndCustom, installedAppIds]);

  const featuredAppsRow2 = useMemo(() => {
    return allStoreAndCustom.filter(a => a.row === 'widgets' && installedAppIds.includes(a.id));
  }, [allStoreAndCustom, installedAppIds]);

  // Actions for Store Installation
  const installStoreApp = useCallback((app: StoreCatalogApp) => {
    setInstallingAppId(app.id);
    setInstallProgress(25);
    setTimeout(() => {
      setInstallProgress(65);
      setTimeout(() => {
        setInstallProgress(100);
        setInstalledAppIds(prev => {
          const next = prev.includes(app.id) ? prev : [...prev, app.id];
          localStorage.setItem('sazib_tv_installed_apps', JSON.stringify(next));
          return next;
        });
        setInstallingAppId(null);
        setInstallProgress(0);
        showOsd('✓ ' + app.name + ' ইনস্টল হয়েছে', 'টিভি হোমস্ক্রিনে যুক্ত করা হয়েছে', app.logo);
      }, 500);
    }, 400);
  }, [showOsd]);

  const uninstallStoreApp = useCallback((appId: string, appName: string) => {
    setInstalledAppIds(prev => {
      const next = prev.filter(id => id !== appId);
      localStorage.setItem('sazib_tv_installed_apps', JSON.stringify(next));
      return next;
    });
    showOsd('🗑️ ' + appName + ' আনইনস্টল হয়েছে', 'টিভি হোমস্ক্রিন থেকে সরানো হয়েছে');
  }, [showOsd]);

  const handleInstallCustomApp = useCallback(() => {
    if (!customAppName.trim() || !customAppUrl.trim()) return;
    const newId = 'custom-' + Date.now();
    const newApp: StoreCatalogApp = {
      id: newId,
      name: customAppName.trim(),
      subtitle: 'Custom Installed App',
      developer: 'User Installed',
      category: customAppCategory,
      categoryLabel: customAppCategory === 'ott' ? 'ওটিটি' : customAppCategory === 'music' ? 'মিউজিক' : 'টুলস',
      rating: 5.0,
      downloads: 'Custom',
      size: '15 MB',
      logo: '',
      bgColor: '#162447',
      textColor: '#ffffff',
      webUrl: customAppUrl.trim().startsWith('http') ? customAppUrl.trim() : 'https://' + customAppUrl.trim(),
      description: 'ব্যবহারকারী কর্তৃক ইনস্টলকৃত কাস্টম ওয়েব অ্যাপ।',
      row: customAppRow
    };
    setCustomApps(prev => {
      const next = [...prev, newApp];
      localStorage.setItem('sazib_tv_custom_apps', JSON.stringify(next));
      return next;
    });
    setInstalledAppIds(prev => {
      const next = [...prev, newId];
      localStorage.setItem('sazib_tv_installed_apps', JSON.stringify(next));
      return next;
    });
    setCustomAppName('');
    setCustomAppUrl('');
    setStoreCategory('installed');
    showOsd('✓ ' + newApp.name + ' ইনস্টল হয়েছে', 'টিভি হোমস্ক্রিনে যুক্ত করা হয়েছে');
  }, [customAppName, customAppUrl, customAppCategory, customAppRow, showOsd]);

  const handleGoogleLogout = useCallback(() => {
    setGoogleUser(null);
    localStorage.removeItem('sazib_tv_google_user');
    showOsd('গুগল অ্যাকাউন্ট সাইন আউট', 'প্লে স্টোর থেকে সাইন আউট সম্পন্ন');
    setShowGoogleModal(false);
  }, [showOsd]);

  const handleSaveGoogleUser = useCallback(() => {
    const email = googleInputEmail.trim() || 'user@gmail.com';
    const name = googleInputName.trim() || email.split('@')[0];
    const user = { name, email };
    setGoogleUser(user);
    localStorage.setItem('sazib_tv_google_user', JSON.stringify(user));
    setShowGoogleModal(false);
    showOsd('✓ গুগল প্লে কানেক্টেড', email);
  }, [googleInputEmail, googleInputName, showOsd]);

  const handleAccountSignup = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError('');
    const name = authName.trim();
    const email = authEmail.trim().toLowerCase();
    const phone = authPhone.trim();
    const address = authAddress.trim();
    const nid = authNid.trim();

    if (!name || !email || !phone || !address || !nid) {
      setAuthError('অনুগ্রহ করে নাম, ইমেইল, ফোন নাম্বার, অ্যাড্রেস এবং এনআইডি কার্ড নাম্বার পূরণ করুন।');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setAuthError('অনুগ্রহ করে একটি সঠিক ইমেইল অ্যাড্রেস দিন।');
      return;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      setAuthError('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন।');
      return;
    }
    if (nid.replace(/\D/g, '').length < 10 || nid.replace(/\D/g, '').length > 17) {
      setAuthError('সঠিক এনআইডি কার্ড নাম্বার দিন (১০ থেকে ১৭ ডিজিট)।');
      return;
    }

    setAuthSending(true);
    try {
      const existingRaw = localStorage.getItem('sazib_tv_accounts_v2');
      const accounts: SazibAccount[] = existingRaw ? JSON.parse(existingRaw) : [];
      if (accounts.some(acc => acc.email === email || acc.phone === phone)) {
        setAuthError('এই ইমেইল বা ফোন নাম্বার দিয়ে ইতিমধ্যেই অ্যাকাউন্ট আছে। অ্যাক্টিভেশন কোড দিয়ে লগইন করুন।');
        setAuthSending(false);
        return;
      }

      const activationCode = `SZB-${Math.floor(100000 + Math.random() * 900000)}`;
      const newAcc: SazibAccount = {
        id: 'usr-' + Date.now(),
        name,
        identifier: phone,
        email,
        phone,
        address,
        nid,
        activationCode,
        plan: 'Active Member',
        createdAt: new Date().toLocaleDateString()
      };

      accounts.push(newAcc);
      localStorage.setItem('sazib_tv_accounts_v2', JSON.stringify(accounts));

      // Register customer in unified /api/customers endpoint & dispatch Email/SMS
      let emailDispatched = false;
      let smsDispatched = false;
      try {
        const res = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: newAcc.id, name, email, phone, address, nid, activationCode })
        });
        if (res.ok) {
          const d = await res.json();
          emailDispatched = !!d.emailDispatched;
          smsDispatched = !!d.smsDispatched;
        }
      } catch {
        // fallback handled cleanly in confirmation card
      }

      setSignupResult({ name, email, phone, activationCode, emailDispatched, smsDispatched });
      setAuthName('');
      setAuthEmail('');
      setAuthPhone('');
      setAuthAddress('');
      setAuthNid('');
      showOsd('✓ অ্যাক্টিভেশন কোড পাঠানো হয়েছে', `${email} ও ${phone}`);
    } catch {
      setAuthError('অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setAuthSending(false);
    }
  }, [authName, authEmail, authPhone, authAddress, authNid, showOsd]);

  const handleAccountLogin = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError('');
    const identifier = authIdentifier.trim().toLowerCase();
    const code = authActivationCode.trim().toUpperCase();
    if (!identifier || !code) {
      setAuthError('অনুগ্রহ করে আপনার ইমেইল/ফোন নাম্বার এবং অ্যাক্টিভেশন কোড দিন।');
      return;
    }

    setAuthSending(true);
    try {
      // 1. Check Live Admin Panel Customers first (https://sazib-tv-admin.vercel.app/customers.json)
      try {
        const res = await fetch(`https://sazib-tv-admin.vercel.app/customers.json?t=${Date.now()}`, { cache: 'no-store' });
        if (res.ok) {
          const adminCustomers = await res.json();
          if (Array.isArray(adminCustomers)) {
            const adminMatch = adminCustomers.find((c: any) =>
              ((c.phone && String(c.phone).toLowerCase() === identifier) ||
               (c.email && String(c.email).toLowerCase() === identifier)) &&
              c.code && String(c.code).toUpperCase() === code
            );
            if (adminMatch) {
              const today = new Date().toISOString().split('T')[0];
              if (adminMatch.status === 'blocked') {
                setAuthError('আপনার অ্যাকাউন্টটি অ্যাডমিন কর্তৃক ব্লক করা হয়েছে। অনুগ্রহ করে অ্যাডমিনের সাথে যোগাযোগ করুন।');
                setAuthSending(false);
                return;
              }
              if (adminMatch.expiresAt && adminMatch.expiresAt < today) {
                setAuthError(`আপনার সাবস্ক্রিপশনের মেয়াদ (${adminMatch.expiresAt}) শেষ হয়ে গেছে। রিনিউ করতে অ্যাডমিনের সাথে যোগাযোগ করুন।`);
                setAuthSending(false);
                return;
              }
              const sessionUser: SazibAccount = {
                id: adminMatch.id,
                name: adminMatch.name,
                identifier: adminMatch.phone || adminMatch.email,
                email: adminMatch.email || '',
                phone: adminMatch.phone || '',
                address: adminMatch.address || '',
                nid: adminMatch.nid || '',
                activationCode: adminMatch.code,
                plan: adminMatch.plan || 'VIP',
                expiresAt: adminMatch.expiresAt || '',
                createdAt: adminMatch.createdAt || new Date().toLocaleDateString()
              };
              setCurrentUser(sessionUser);
              localStorage.setItem('sazib_tv_current_user', JSON.stringify(sessionUser));
              setAuthIdentifier('');
              setAuthActivationCode('');
              setSignupResult(null);
              setShowAccountModal(false);
              showOsd(`✓ লগইন সফল • ${sessionUser.name}`, `${sessionUser.plan} অ্যাক্টিভেশন কোড ভেরিফাইড`);
              setAuthSending(false);
              return;
            }
          }
        }
      } catch {
        // continue to local accounts check
      }

      // 2. Check Locally Signed-Up Accounts (sazib_tv_accounts_v2)
      const existingRaw = localStorage.getItem('sazib_tv_accounts_v2');
      const accounts: SazibAccount[] = existingRaw ? JSON.parse(existingRaw) : [];
      const matched = accounts.find(
        acc => (acc.email === identifier || acc.phone.toLowerCase() === identifier) && acc.activationCode.toUpperCase() === code
      );
      if (!matched) {
        setAuthError('ইমেইল/ফোন নাম্বার অথবা অ্যাক্টিভেশন কোড সঠিক নয়। নতুন হলে Sign Up করে অ্যাক্টিভেশন কোড নিন।');
        setAuthSending(false);
        return;
      }

      setCurrentUser(matched);
      localStorage.setItem('sazib_tv_current_user', JSON.stringify(matched));
      setAuthIdentifier('');
      setAuthActivationCode('');
      setSignupResult(null);
      setShowAccountModal(false);
      showOsd(`✓ লগইন সফল • ${matched.name}`, 'অ্যাক্টিভেশন কোড ভেরিফাই হয়েছে');
    } catch {
      setAuthError('লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setAuthSending(false);
    }
  }, [authIdentifier, authActivationCode, showOsd]);

  const handleAccountLogout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('sazib_tv_current_user');
    setShowAccountModal(false);
    showOsd('লগআউট সম্পন্ন', 'আপনি সফলভাবে সাইন আউট করেছেন');
  }, [showOsd]);

  const filteredStoreApps = useMemo(() => {
    let list = allStoreAndCustom;
    if (storeCategory === 'installed') {
      list = list.filter(a => installedAppIds.includes(a.id));
    } else if (storeCategory !== 'all' && storeCategory !== 'custom' && storeCategory !== 'web') {
      list = list.filter(a => a.category === storeCategory);
    }
    if (storeSearch.trim()) {
      const q = storeSearch.toLowerCase();
      list = list.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.developer.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allStoreAndCustom, storeCategory, storeSearch, installedAppIds]);

  // In-App OTT Experience Platform state (YouTube, Netflix, Chorki, Toffee, Play Store, etc.)
  const [activeOtt, setActiveOtt] = useState<TVApp | null>(null);
  const [ottMode, setOttMode] = useState<'web' | 'stream'>('web');
  const [isOttIframeLoading, setIsOttIframeLoading] = useState(true);
  const [ytEmbedUrl, setYtEmbedUrl] = useState('https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&rel=0');
  const [ytInput, setYtInput] = useState('');
  const [ottCustomLink, setOttCustomLink] = useState('');
  const ottVideoRef = useRef<HTMLVideoElement>(null);
  const ottHlsRef = useRef<Hls | null>(null);

  const extractYoutubeEmbed = useCallback((input: string): string | null => {
    const trimmed = input.trim();
    if (!trimmed) return null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return `https://www.youtube.com/embed/${trimmed}?autoplay=1&rel=0`;
    }
    try {
      const u = new URL(trimmed.startsWith('http') ? trimmed : 'https://' + trimmed);
      if (u.hostname.includes('youtu.be')) {
        const id = u.pathname.replace('/', '').split('/')[0];
        if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
      }
      if (u.hostname.includes('youtube.com')) {
        const v = u.searchParams.get('v');
        if (v) return `https://www.youtube.com/embed/${v}?autoplay=1&rel=0`;
        const parts = u.pathname.split('/').filter(Boolean);
        if ((parts[0] === 'shorts' || parts[0] === 'live' || parts[0] === 'embed') && parts[1]) {
          return `https://www.youtube.com/embed/${parts[1]}?autoplay=1&rel=0`;
        }
        const list = u.searchParams.get('list');
        if (list) return `https://www.youtube.com/embed/videoseries?list=${list}&autoplay=1`;
      }
    } catch {}
    return null;
  }, []);

  const launchOttExternal = useCallback((url: string, title?: string) => {
    if (!url) return;
    if (window.sazibApi?.openOttWindow) {
      window.sazibApi.openOttWindow({ url, title: title || 'OTT Player' });
      showOsd(`📺 ${title || 'OTT'} ওপেন হয়েছে`, 'আলাদা ফুল-ফিচারড উইন্ডোতে চালু হয়েছে');
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
      showOsd(`🚀 ${title || 'OTT'} চালু হয়েছে`, 'অফিসিয়াল প্ল্যাটফর্মে লগইন করে দেখুন');
    }
  }, [showOsd]);

  const openOttApp = useCallback((app: TVApp, preferredMode: 'web' | 'stream' = 'web') => {
    if (app.id === 'app-playstore') {
      setShowPlayStoreHub(true);
      return;
    }
    if (app.id === 'app-fastcast') {
      setShowMobileConnect(true);
      return;
    }
    if (app.id === 'app-player' && channels.length > 0) {
      setActive(channels[0]);
      showOsd('🎬 Sazib 4K Player', channels[0].name, channels[0].logo);
      return;
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setActive(null);
    setActiveOtt(app);
    setOttMode(preferredMode);
    setOttCustomLink('');
    setIsOttIframeLoading(true);
    setTimeout(() => {
      setIsOttIframeLoading(false);
    }, 1800);
    showOsd(app.name, app.subtitle || 'OTT Platform', app.logo);
  }, [showOsd, channels]);

  // Auto-dismiss OTT loading pill on webview events or timer
  useEffect(() => {
    if (!activeOtt) return;
    setIsOttIframeLoading(true);

    const timer = setTimeout(() => {
      setIsOttIframeLoading(false);
    }, 2200);

    const interval = setInterval(() => {
      const wv = document.getElementById('ott-browser-webview') as any;
      if (wv) {
        clearInterval(interval);
        const hide = () => setIsOttIframeLoading(false);
        wv.addEventListener('dom-ready', hide);
        wv.addEventListener('did-finish-load', hide);
        wv.addEventListener('did-stop-loading', hide);
        wv.addEventListener('did-fail-load', hide);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [activeOtt, ottMode]);

  // HLS Video Stream Engine for In-App OTT stream mode (Zero-Buffer Protected)
  useEffect(() => {
    if (!activeOtt || ottMode !== 'stream' || !activeOtt.url) {
      if (ottHlsRef.current) {
        ottHlsRef.current.destroy();
        ottHlsRef.current = null;
      }
      if (ottVideoRef.current) {
        ottVideoRef.current.pause();
        ottVideoRef.current.removeAttribute('src');
      }
      return;
    }

    const video = ottVideoRef.current;
    if (!video) return;

    let ottWatchdog: any = null;

    if (Hls.isSupported() && activeOtt.url.includes('.m3u8')) {
      if (ottHlsRef.current) ottHlsRef.current.destroy();
      const hls = new Hls(getUltraHlsConfig());
      ottHlsRef.current = hls;
      hls.loadSource(activeOtt.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            try {
              hls.startLoad();
            } catch {
              hls.destroy();
            }
          }
        }
      });
    } else {
      video.src = activeOtt.url;
      video.play().catch(() => {});
    }

    // Anti-stall watchdog for OTT streams
    let lastTime = 0;
    let stallTicks = 0;
    ottWatchdog = setInterval(() => {
      if (!video || video.paused || video.ended) return;
      const cur = video.currentTime;
      if (Math.abs(cur - lastTime) < 0.1) {
        stallTicks++;
        if (stallTicks >= 2) {
          video.currentTime += 0.15;
          if (ottHlsRef.current) {
            try { ottHlsRef.current.startLoad(); } catch {}
          }
          video.play().catch(() => {});
        }
      } else {
        stallTicks = 0;
        lastTime = cur;
      }
    }, 1000);

    return () => {
      if (ottWatchdog) clearInterval(ottWatchdog);
      if (ottHlsRef.current) {
        ottHlsRef.current.destroy();
        ottHlsRef.current = null;
      }
    };
  }, [activeOtt, ottMode]);

  // Digital clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch local IP & generate QR Code for Mobile Remote (Immediate + Auto-poll)
  useEffect(() => {
    generateQR(mobileInfo.url);

    let isSubscribed = true;
    const fetchMobileInfo = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8989/api/info');
        if (res.ok) {
          const info = await res.json();
          if (info && info.url && isSubscribed) {
            setMobileInfo(info);
            generateQR(info.url);
          }
        }
      } catch (err) {
        console.log('Mobile server standby:', err);
      }
    };

    fetchMobileInfo();
    const interval = setInterval(() => {
      if (isSubscribed) fetchMobileInfo();
    }, 3000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [generateQR, mobileInfo.url]);

  // Re-generate QR whenever mobile connect modal opens
  useEffect(() => {
    if (showMobileConnect) {
      generateQR(mobileInfo.url);
      fetch('http://127.0.0.1:8989/api/info')
        .then(r => r.json())
        .then(info => {
          if (info && info.url) {
            setMobileInfo(info);
            generateQR(info.url);
          }
        })
        .catch(() => {});
    }
  }, [showMobileConnect, mobileInfo.url, generateQR]);

  // Sync channels & OTT apps to Mobile Remote server whenever channels change
  useEffect(() => {
    try {
      localStorage.setItem('sb-channels', JSON.stringify(channels));
      const allSearchable = [
        ...channels,
        ...featuredAppsRow1.filter(a => a.url).map(a => ({
          id: a.id,
          name: a.name,
          group: 'Apps',
          url: a.url!,
          logo: a.logo,
          webUrl: a.webUrl
        })),
        ...featuredAppsRow2.filter(a => a.url).map(a => ({
          id: a.id,
          name: a.name,
          group: 'Widgets',
          url: a.url!,
          logo: a.logo,
          webUrl: a.webUrl
        }))
      ];
      fetch('http://127.0.0.1:8989/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allSearchable)
      }).catch(() => {});
    } catch (e) {
      console.error(e);
    }
  }, [channels]);

  // STREAM PLAYBACK ENGINE (HLS.js + HTML5 Video)
  useEffect(() => {
    if (!active) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
      setStreamError(false);
      setIsLoadingStream(false);
      return;
    }

    let isCancelled = false;
    let hlsInstance: Hls | null = null;
    let stallWatchdog: any = null;

    const initStream = () => {
      const video = videoRef.current;
      if (!video) {
        if (!isCancelled) {
          requestAnimationFrame(initStream);
        }
        return;
      }

      setStreamError(false);
      setIsLoadingStream(true);
      setIsPlaying(true);

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      const streamUrl = active.url ? active.url.trim() : '';
      if (!streamUrl) {
        setStreamError(true);
        setIsLoadingStream(false);
        return;
      }

      const attemptPlay = () => {
        if (isCancelled) return;
        video.play().then(() => {
          setIsPlaying(true);
          setIsLoadingStream(false);
          setStreamError(false);
        }).catch((err) => {
          console.warn('Playback play() was interrupted or prevented:', err);
        });
      };

      const isHls = streamUrl.includes('.m3u8') ||
                    streamUrl.includes('aynaott') ||
                    streamUrl.includes('aynascope') ||
                    streamUrl.includes('gpcdn') ||
                    streamUrl.includes('sunplex') ||
                    streamUrl.includes('shamon-cable') ||
                    streamUrl.includes('akamaized') ||
                    streamUrl.includes('tplay');

      if (isHls && Hls.isSupported()) {
        const hls = new Hls(getUltraHlsConfig());

        hlsInstance = hls;
        hlsRef.current = hls;

        hls.loadSource(streamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (!isCancelled) {
            setIsLoadingStream(false);
            attemptPlay();
          }
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.warn('⚡ High-Traffic CDN Auto-Recovery: Network congestion, reloading stream chunks...', data.details);
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.warn('⚡ Codec Auto-Recovery: Media frame glitch, recovering pipeline...', data.details);
                try {
                  hls.recoverMediaError();
                } catch {
                  try {
                    hls.swapAudioCodec();
                    hls.recoverMediaError();
                  } catch {}
                }
                break;
              default:
                console.error('HLS error:', data);
                try {
                  hls.startLoad();
                } catch {
                  hls.destroy();
                  hlsRef.current = null;
                  if (!isCancelled) {
                    setIsLoadingStream(false);
                    setStreamError(true);
                  }
                }
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', attemptPlay, { once: true });
      } else {
        video.src = streamUrl;
        attemptPlay();
      }

      // Anti-Stall & Anti-Freeze Auto-Healing Watchdog (10M+ Users Zero-Buffering Protection)
      let lastTime = 0;
      let stallTicks = 0;
      stallWatchdog = setInterval(() => {
        if (!video || video.paused || video.ended || isCancelled) return;
        const cur = video.currentTime;
        if (Math.abs(cur - lastTime) < 0.1) {
          stallTicks++;
          if (stallTicks >= 2) {
            if (video.buffered && video.buffered.length > 0) {
              let jumped = false;
              for (let i = 0; i < video.buffered.length; i++) {
                const s = video.buffered.start(i);
                const e = video.buffered.end(i);
                if (cur >= s && cur < e) {
                  video.currentTime = Math.min(e - 0.05, cur + 0.2);
                  jumped = true;
                  break;
                } else if (cur < s && (s - cur) < 1.5) {
                  video.currentTime = s + 0.05;
                  jumped = true;
                  break;
                }
              }
              if (!jumped) video.currentTime += 0.15;
            } else {
              video.currentTime += 0.15;
            }

            if (hlsInstance) {
              try {
                hlsInstance.startLoad();
              } catch {}
            }
            video.play().catch(() => {});
          }

          if (stallTicks >= 5) {
            if (video.buffered && video.buffered.length > 0) {
              const liveEdge = video.buffered.end(video.buffered.length - 1);
              video.currentTime = Math.max(0, liveEdge - 2.5);
            }
            if (hlsInstance) {
              try {
                hlsInstance.recoverMediaError();
                hlsInstance.startLoad();
              } catch {}
            }
            stallTicks = 0;
          }
        } else {
          stallTicks = 0;
          lastTime = cur;
        }
      }, 1000);
    };

    initStream();

    return () => {
      isCancelled = true;
      if (stallWatchdog) {
        clearInterval(stallWatchdog);
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (hlsInstance) {
        hlsInstance.destroy();
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
    };
  }, [active]);

  // Sync player & OTT state to Mobile Remote server
  useEffect(() => {
    try {
      fetch('http://127.0.0.1:8989/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeChannel: active || (activeOtt ? { id: activeOtt.id, name: activeOtt.name, group: 'OTT', logo: activeOtt.logo } : null),
          isPlaying,
          isFullscreen
        })
      }).catch(() => {});
    } catch {}
  }, [active, activeOtt, isPlaying, isFullscreen]);

  useEffect(() => {
    try {
      localStorage.setItem('sb-favs', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  // REAL-TIME MOBILE REMOTE LISTENER (SSE from mobile server)
  useEffect(() => {
    let es: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connectSSE = () => {
      try {
        es = new EventSource('http://127.0.0.1:8989/api/events');
        es.addEventListener('command', (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            handleRemoteCommand(data);
          } catch (e) {
            console.error('Failed to parse mobile command:', e);
          }
        });

        es.onerror = () => {
          es?.close();
          reconnectTimeout = setTimeout(connectSSE, 4000);
        };
      } catch {
        reconnectTimeout = setTimeout(connectSSE, 5000);
      }
    };

    connectSSE();
    return () => {
      es?.close();
      clearTimeout(reconnectTimeout);
    };
  }, [channels, active]);

  const topBarItems = useMemo(() => ['top-assistant', 'top-search', 'top-notif', 'top-cast', 'top-settings', 'top-account'], []);

  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      showOsd('▶️ Playing', active?.name);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      showOsd('⏸️ Paused', active?.name);
    }
  }, [active, showOsd]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
    showOsd(videoRef.current.muted ? '🔇 Muted' : '🔊 Sound Unmuted', 'Audio');
  }, [showOsd]);

  const toggleTheater = useCallback(() => {
    setIsTheaterMode(prev => {
      const next = !prev;
      showOsd(next ? '🎬 Theater Mode: ON' : '🎬 Theater Mode: OFF', 'Player View');
      return next;
    });
  }, [showOsd]);

  const toggleFullscreen = useCallback(() => {
    const isCurrentlyFs = Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement);
    if (!isCurrentlyFs) {
      const docEl = document.documentElement as any;
      const videoEl = (videoRef.current || ottVideoRef.current) as any;

      const enterFs = docEl.requestFullscreen?.bind(docEl) || docEl.webkitRequestFullscreen?.bind(docEl);
      if (enterFs) {
        enterFs().then(() => {
          setIsFullscreen(true);
          showOsd('⛶ ফুলস্ক্রিন (অটো ল্যান্ডস্কেপ)', 'মোবাইল ও ট্যাবলেটে আড়াআড়ি ভিউ সক্রিয়');
          // Auto lock to landscape on mobile & tablet
          try {
            if (typeof screen !== 'undefined' && screen.orientation && (screen.orientation as any).lock) {
              (screen.orientation as any).lock('landscape').catch(() => {
                (screen.orientation as any).lock?.('landscape-primary').catch(() => {});
              });
            }
          } catch {}
        }).catch(() => {
          if (videoEl && videoEl.webkitEnterFullscreen) {
            videoEl.webkitEnterFullscreen();
          }
        });
      } else if (videoEl && videoEl.webkitEnterFullscreen) {
        videoEl.webkitEnterFullscreen();
      }
    } else {
      const doc = document as any;
      const exitFs = doc.exitFullscreen?.bind(doc) || doc.webkitExitFullscreen?.bind(doc);
      if (exitFs) {
        exitFs().then(() => {
          setIsFullscreen(false);
          showOsd('⛶ ফুলস্ক্রিন অফ', 'স্বাভাবিক ভিউ');
          try {
            if (typeof screen !== 'undefined' && screen.orientation && screen.orientation.unlock) {
              screen.orientation.unlock();
            }
          } catch {}
        }).catch(() => {});
      }
    }
  }, [showOsd]);

  // Listen for native fullscreen change events (via mobile gestures, back button, or Esc)
  useEffect(() => {
    const handleFsChange = () => {
      const isFs = Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setIsFullscreen(isFs);
      if (!isFs) {
        try {
          if (typeof screen !== 'undefined' && screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
          }
        } catch {}
      }
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const closePlayer = useCallback(() => {
    if (document.fullscreenElement) {
      try {
        document.exitFullscreen().catch(() => {});
      } catch {}
    }
    try {
      if (typeof screen !== 'undefined' && screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    } catch {}
    setIsFullscreen(false);
    setActive(null);
  }, []);

  const closeOtt = useCallback(() => {
    if (document.fullscreenElement) {
      try {
        document.exitFullscreen().catch(() => {});
      } catch {}
    }
    try {
      if (typeof screen !== 'undefined' && screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    } catch {}
    if (ottHlsRef.current) {
      ottHlsRef.current.destroy();
      ottHlsRef.current = null;
    }
    setIsFullscreen(false);
    setActiveOtt(null);
  }, []);

  const volumeUp = useCallback(() => {
    if (videoRef.current) {
      const newVol = Math.min(1, Math.round((videoRef.current.volume + 0.1) * 10) / 10);
      videoRef.current.volume = newVol;
      showOsd(`🔊 Volume: ${Math.round(newVol * 100)}%`, 'Audio Level');
    }
  }, [showOsd]);

  const volumeDown = useCallback(() => {
    if (videoRef.current) {
      const newVol = Math.max(0, Math.round((videoRef.current.volume - 0.1) * 10) / 10);
      videoRef.current.volume = newVol;
      showOsd(`🔉 Volume: ${Math.round(newVol * 100)}%`, 'Audio Level');
    }
  }, [showOsd]);

  const nextChannel = useCallback(() => {
    if (!active || !channels.length) return;
    const curIdx = channels.findIndex(c => c.id === active.id);
    const nextIdx = (curIdx + 1) % channels.length;
    const nextCh = channels[nextIdx];
    setActive(nextCh);
    showOsd(nextCh.name, nextCh.group || 'Live TV', nextCh.logo);
  }, [active, channels, showOsd]);

  const prevChannel = useCallback(() => {
    if (!active || !channels.length) return;
    const curIdx = channels.findIndex(c => c.id === active.id);
    const prevIdx = (curIdx - 1 + channels.length) % channels.length;
    const prevCh = channels[prevIdx];
    setActive(prevCh);
    showOsd(prevCh.name, prevCh.group || 'Live TV', prevCh.logo);
  }, [active, channels, showOsd]);

  function toggleFav(c: Channel) {
    setFavorites(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id]);
  }

  function deleteChannel(id: string) {
    setChannels(prev => prev.filter(c => c.id !== id));
    setFavorites(prev => prev.filter(fId => fId !== id));
    if (active?.id === id) setActive(null);
    setMessage('Channel deleted.');
  }

  function copyMobileUrl() {
    navigator.clipboard.writeText(mobileInfo.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Grouped channels
  const bdChannels = useMemo(() => channels.filter(c => classifyCategory(c) === 'bd'), [channels]);
  const indianChannels = useMemo(() => channels.filter(c => classifyCategory(c) === 'india'), [channels]);
  const sportsChannels = useMemo(() => channels.filter(c => classifyCategory(c) === 'sports'), [channels]);
  const newsChannels = useMemo(() => channels.filter(c => classifyCategory(c) === 'news'), [channels]);
  const movieChannels = useMemo(() => channels.filter(c => classifyCategory(c) === 'movies'), [channels]);
  const favoriteChannels = useMemo(() => channels.filter(c => favorites.includes(c.id)), [channels, favorites]);

  const filteredChannels = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return channels.filter(c => c.name.toLowerCase().includes(q) || c.group.toLowerCase().includes(q));
  }, [channels, query]);

  // Spatial Navigation Layout Structure
  const navRows = useMemo(() => [
    {
      id: 'row-playstore',
      railId: 'rail-playstore',
      label: 'Play Store',
      icon: <PlayStoreIcon size={24} />,
      iconClass: 'playstore-circle',
      title: 'Google Play Store (অফিসিয়াল অ্যাপ স্টোর)',
      items: ['app-playstore']
    },
    {
      id: 'row-apps',
      railId: 'rail-apps',
      label: 'Apps',
      icon: <Grid size={22} color="#ffffff" />,
      iconClass: 'red-circle',
      title: 'Android TV Apps',
      items: featuredAppsRow1.map(a => a.id)
    },
    {
      id: 'row-widgets',
      railId: 'rail-widgets',
      label: 'Widgets',
      icon: <Flame size={22} color="#ffffff" />,
      iconClass: 'cyan-square',
      title: 'Smart Widgets & OTT',
      items: featuredAppsRow2.map(a => a.id)
    },
    {
      id: 'row-bd',
      railId: 'rail-bd',
      label: 'Live TV',
      badge: `${bdChannels.length} BD`,
      icon: <Tv size={22} color="#ffffff" />,
      iconClass: 'blue-square',
      title: 'Bangladeshi Live TV (75 Channels)',
      items: bdChannels.map(c => c.id)
    },
    {
      id: 'row-india',
      railId: 'rail-india',
      label: 'Indian TV',
      badge: `${indianChannels.length} IN`,
      icon: <Sparkles size={22} color="#ffffff" />,
      iconClass: 'purple-square',
      title: 'Indian Live TV (75 Channels)',
      items: indianChannels.map(c => c.id)
    },
    {
      id: 'row-sports',
      railId: 'rail-sports',
      label: 'Sports',
      badge: `${sportsChannels.length} Live`,
      icon: <Trophy size={22} color="#ffffff" />,
      iconClass: 'green-square',
      title: 'Live Sports & Cricket',
      items: sportsChannels.map(c => c.id)
    },
    {
      id: 'row-movies',
      railId: 'rail-movies',
      label: 'Movies',
      icon: <Film size={22} color="#ffffff" />,
      iconClass: 'orange-square',
      title: 'Movies & Cinema',
      items: movieChannels.map(c => c.id)
    },
    {
      id: 'row-news',
      railId: 'rail-news',
      label: 'News 24/7',
      icon: <Newspaper size={22} color="#ffffff" />,
      iconClass: 'crimson-square',
      title: '24/7 Breaking News',
      items: newsChannels.map(c => c.id)
    }
  ], [featuredAppsRow1, featuredAppsRow2, bdChannels, indianChannels, sportsChannels, movieChannels, newsChannels]);

  // Handle clicking or activating Left Rail button -> Open Full Grid Layout for that category
  const handleRailClick = useCallback((row: typeof navRows[0]) => {
    setMessage(`📂 ${row.title}`);
    if (row.railId === 'rail-playstore') {
      setShowPlayStoreHub(true);
      return;
    }
    setActiveCategoryRail(row.railId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const mainEl = document.querySelector('.sazib-tv-leanback');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    if (row.items && row.items.length > 0) {
      setFocusedId(row.items[0]);
    } else {
      setFocusedId(row.railId);
    }
    showOsd(`📂 ${row.label}`, `${row.items.length} টি আইটেম গ্রিড লেআউটে দেখানো হচ্ছে`);
  }, [showOsd]);

  // 2D Spatial Navigation
  const navigateSpatial = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    setFocusedId(currentId => {
      // 1. Is user in Top Bar?
      const topIdx = topBarItems.indexOf(currentId);
      if (topIdx !== -1) {
        if (direction === 'left') {
          return topBarItems[Math.max(0, topIdx - 1)];
        }
        if (direction === 'right') {
          return topBarItems[Math.min(topBarItems.length - 1, topIdx + 1)];
        }
        if (direction === 'down') {
          return navRows[0]?.items[0] || navRows[0]?.railId || 'app-netflix';
        }
        return currentId;
      }

      // 2. Is user on a Left Rail button?
      const railRowIdx = navRows.findIndex(r => r.railId === currentId);
      if (railRowIdx !== -1) {
        if (direction === 'right') {
          return navRows[railRowIdx].items[0] || currentId;
        }
        if (direction === 'down') {
          if (railRowIdx < navRows.length - 1) {
            return navRows[railRowIdx + 1].railId;
          }
          return currentId;
        }
        if (direction === 'up') {
          if (railRowIdx === 0) {
            return 'top-assistant';
          }
          return navRows[railRowIdx - 1].railId;
        }
        return currentId;
      }

      // 3. User is on a card inside a row
      let cardRowIdx = -1;
      let cardColIdx = -1;
      for (let r = 0; r < navRows.length; r++) {
        const cIdx = navRows[r].items.indexOf(currentId);
        if (cIdx !== -1) {
          cardRowIdx = r;
          cardColIdx = cIdx;
          break;
        }
      }

      if (cardRowIdx !== -1) {
        const row = navRows[cardRowIdx];
        if (direction === 'left') {
          if (cardColIdx === 0) {
            return row.railId;
          }
          return row.items[cardColIdx - 1];
        }
        if (direction === 'right') {
          return row.items[Math.min(row.items.length - 1, cardColIdx + 1)];
        }
        if (direction === 'down') {
          if (cardRowIdx < navRows.length - 1) {
            const nextRow = navRows[cardRowIdx + 1];
            const targetCol = Math.min(cardColIdx, nextRow.items.length - 1);
            return nextRow.items[targetCol] || nextRow.railId;
          }
          return currentId;
        }
        if (direction === 'up') {
          if (cardRowIdx === 0) {
            return 'top-search';
          }
          const prevRow = navRows[cardRowIdx - 1];
          const targetCol = Math.min(cardColIdx, prevRow.items.length - 1);
          return prevRow.items[targetCol] || prevRow.railId;
        }
      }

      return navRows[0]?.items[0] || 'app-netflix';
    });
  }, [topBarItems, navRows]);

  // Activate focused item
  const activateSpatial = useCallback(() => {
    // 1. Top bar activations
    if (focusedId === 'top-assistant') {
      setMessage('🎤 Google Voice Search: Search any channel...');
      searchInputRef.current?.focus();
      return;
    }
    if (focusedId === 'top-search') {
      searchInputRef.current?.focus();
      return;
    }
    if (focusedId === 'top-notif' || focusedId === 'top-cast') {
      setShowMobileConnect(true);
      return;
    }
    if (focusedId === 'top-settings') {
      setShowAdd(true);
      return;
    }
    if (focusedId === 'top-account') {
      setShowAccountModal(true);
      return;
    }

    // 2. Left Rail button activations
    const railRow = navRows.find(r => r.railId === focusedId);
    if (railRow) {
      handleRailClick(railRow);
      return;
    }

    // 3. Featured App activations
    const allApps = [PLAY_STORE_APP, ...featuredAppsRow1, ...featuredAppsRow2];
    const app = allApps.find(a => a.id === focusedId);
    if (app) {
      if (app.id === 'app-playstore') {
        setShowPlayStoreHub(true);
      } else {
        openOttApp(app);
      }
      return;
    }

    // 4. Channel activations
    const channel = channels.find(c => c.id === focusedId);
    if (channel) {
      setActive(channel);
      return;
    }
  }, [focusedId, navRows, channels, handleRailClick, openOttApp, featuredAppsRow1, featuredAppsRow2]);

  const backSpatial = useCallback(() => {
    if (showAccountModal) {
      setShowAccountModal(false);
      return;
    }
    if (showGoogleModal) {
      setShowGoogleModal(false);
      return;
    }
    if (showPlayStoreHub) {
      setShowPlayStoreHub(false);
      return;
    }
    if (activeOtt) {
      closeOtt();
      return;
    }
    if (active) {
      if (showQuickDrawer) {
        setShowQuickDrawer(false);
      } else {
        closePlayer();
      }
      return;
    } else if (showAdd) {
      setShowAdd(false);
    } else if (showMobileConnect) {
      setShowMobileConnect(false);
    } else if (query) {
      setQuery('');
    } else if (activeCategoryRail) {
      setActiveCategoryRail(null);
    } else {
      // Jump back to Left Rail button of current row
      const cardRow = navRows.find(r => r.items.includes(focusedId));
      if (cardRow) {
        setFocusedId(cardRow.railId);
      }
    }
  }, [showAccountModal, showGoogleModal, showPlayStoreHub, activeOtt, closeOtt, active, showQuickDrawer, closePlayer, showAdd, showMobileConnect, query, activeCategoryRail, navRows, focusedId]);

  const homeSpatial = useCallback(() => {
    if (showAccountModal) setShowAccountModal(false);
    if (showGoogleModal) setShowGoogleModal(false);
    if (showPlayStoreHub) setShowPlayStoreHub(false);
    if (activeOtt) {
      closeOtt();
    }
    if (active) {
      closePlayer();
    }
    if (showQuickDrawer) setShowQuickDrawer(false);
    if (showAdd) setShowAdd(false);
    if (showMobileConnect) setShowMobileConnect(false);
    if (query) setQuery('');
    if (activeCategoryRail) setActiveCategoryRail(null);
    setStoreCategory('all');
    setStoreSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const mainEl = document.querySelector('.sazib-tv-leanback');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    setFocusedId('rail-playstore');
    const rowEl = document.getElementById('row-playstore');
    if (rowEl) rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showOsd('🏠 হোম স্ক্রিন', 'Sazib TV Home');
    setMessage('🏠 Sazib TV Home');
  }, [showAccountModal, showGoogleModal, showPlayStoreHub, activeOtt, closeOtt, active, closePlayer, showQuickDrawer, showAdd, showMobileConnect, query, activeCategoryRail, showOsd]);

  // Auto-scroll when focusedId changes
  useEffect(() => {
    if (!focusedId) return;
    const el = document.getElementById(focusedId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    const row = navRows.find(r => r.railId === focusedId || r.items.includes(focusedId));
    if (row) {
      const rowEl = document.getElementById(row.id);
      if (rowEl) {
        rowEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [focusedId, navRows]);

  // Keyboard navigation listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      if (activeOtt) {
        if (e.key === 'Escape' || e.key === 'Backspace') {
          e.preventDefault();
          setActiveOtt(null);
        } else if (e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          toggleFullscreen();
        }
        return;
      }

      if (active) {
        if (e.key === 'Escape') {
          e.preventDefault();
          backSpatial();
        } else if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          togglePlayPause();
        } else if (e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          toggleFullscreen();
        } else if (e.key === 't' || e.key === 'T') {
          e.preventDefault();
          toggleTheater();
        } else if (e.key === 'm' || e.key === 'M') {
          e.preventDefault();
          toggleMute();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          prevChannel();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          nextChannel();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          volumeDown();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          volumeUp();
        } else if (e.key === 'c' || e.key === 'C') {
          e.preventDefault();
          setShowQuickDrawer(prev => !prev);
        }
        return;
      }

      if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        backSpatial();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigateSpatial('up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        navigateSpatial('down');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateSpatial('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateSpatial('right');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        activateSpatial();
      } else if (e.key === 'Home') {
        e.preventDefault();
        homeSpatial();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, activeOtt, backSpatial, togglePlayPause, toggleFullscreen, toggleTheater, toggleMute, prevChannel, nextChannel, volumeDown, volumeUp, navigateSpatial, activateSpatial, homeSpatial]);

  // Mobile remote handler
  const handleRemoteCommand = useCallback((cmd: { type: string; payload?: any }) => {
    setMessage(`📱 Mobile Remote: ${cmd.type}`);
    switch (cmd.type) {
      case 'play_channel': {
        const targetId = cmd.payload?.id;
        const targetName = (cmd.payload?.name || '').toLowerCase();
        const allApps = [PLAY_STORE_APP, ...featuredAppsRow1, ...featuredAppsRow2];
        const foundOtt = allApps.find(a => a.id === targetId || a.name.toLowerCase() === targetName);
        if (foundOtt) {
          openOttApp(foundOtt);
          break;
        }
        const found = channels.find(c => c.id === targetId || c.name.toLowerCase() === targetName) || cmd.payload;
        if (found) {
          setActiveOtt(null);
          setActive(found);
          showOsd(found.name, found.group || 'Live TV', found.logo);
        }
        break;
      }
      case 'play_pause':
        togglePlayPause();
        break;
      case 'next':
        nextChannel();
        break;
      case 'prev':
        prevChannel();
        break;
      case 'theater':
        toggleTheater();
        break;
      case 'fullscreen':
        toggleFullscreen();
        break;
      case 'mute':
        toggleMute();
        break;
      case 'volume_up':
        volumeUp();
        break;
      case 'volume_down':
        volumeDown();
        break;
      case 'menu':
        setShowQuickDrawer(prev => !prev);
        break;
      case 'search':
        if (active) {
          setShowQuickDrawer(true);
          showOsd('🔍 Channel Guide Search', 'Remote');
        } else {
          setFocusedId('top-search');
          searchInputRef.current?.focus();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          showOsd('🔍 Search Channels', 'Remote');
        }
        break;
      case 'search_query': {
        const q = String(cmd.payload || '');
        setQuery(q);
        if (active) {
          setShowQuickDrawer(true);
          setDrawerQuery(q);
        }
        break;
      }
      case 'home': {
        homeSpatial();
        break;
      }
      case 'voice_command': {
        const speech = String(cmd.payload || '').trim();
        if (!speech) break;
        showOsd(`🎤 "${speech}"`, 'Voice Remote');

        const s = speech.toLowerCase();
        if (/^(home|হোম|গো হোম|হোমে যাও)/i.test(s)) {
          homeSpatial();
        } else if (/^(back|exit|পিছনে|ফিরে যাও|ফিরে)/i.test(s)) {
          backSpatial();
        } else if (/^(pause|stop|থামো|থাম|বন্ধ|থামাও)/i.test(s)) {
          if (videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        } else if (/^(play|resume|চালাও|চালু|শুরু)/i.test(s)) {
          if (videoRef.current && videoRef.current.paused) {
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        } else if (/^(mute|মিউট|শব্দ বন্ধ)/i.test(s)) {
          toggleMute();
        } else if (/^(unmute|শব্দ চালু|সাউন্ড)/i.test(s)) {
          if (videoRef.current?.muted) toggleMute();
        } else if (/^(volume up|vol up|আওয়াজ বাড়াও|শব্দ বাড়াও)/i.test(s)) {
          volumeUp();
        } else if (/^(volume down|vol down|আওয়াজ কমাও|শব্দ কমাও)/i.test(s)) {
          volumeDown();
        } else if (/^(full\s*screen|ফুল\s*স্ক্রিন|ফুল\s*ডিসপ্লে)/i.test(s)) {
          toggleFullscreen();
        } else if (/^(theater|থিয়েটার)/i.test(s)) {
          toggleTheater();
        } else if (/^(next|পরেরটা|পরের)/i.test(s)) {
          nextChannel();
        } else if (/^(prev|previous|আগেরটা|আগের)/i.test(s)) {
          prevChannel();
        } else {
          // 1. Check OTT Apps first (YouTube, Netflix, Chorki, Toffee, Play Store, etc.)
          const matchApp = allStoreAndCustom.find(a => {
            const aname = a.name.toLowerCase();
            return s.includes(aname) || aname.includes(s) || (a.subtitle && s.includes(a.subtitle.toLowerCase()));
          }) || (s.includes('play store') || s.includes('প্লে স্টোর') ? PLAY_STORE_APP : null);

          if (matchApp) {
            openOttApp(matchApp);
            showOsd(`🚀 ${matchApp.name}`, 'Voice App Launched', matchApp.logo);
          } else {
            // 2. Channel voice match
            const found = channels.find(c => {
              const name = c.name.toLowerCase();
              return name.includes(s) || s.includes(name);
            });
            if (found) {
              setActive(found);
              showOsd(`▶️ ${found.name}`, found.group || 'Voice Match', found.logo);
            } else {
              setQuery(speech);
              if (active) {
                setShowQuickDrawer(true);
                setDrawerQuery(speech);
              }
            }
          }
        }
        break;
      }
      case 'mouse_move': {
        const { dx, dy } = cmd.payload || { dx: 0, dy: 0 };
        setVirtualCursor(prev => {
          const newX = Math.max(5, Math.min(window.innerWidth - 5, prev.x + (dx * 1.5)));
          const newY = Math.max(5, Math.min(window.innerHeight - 5, prev.y + (dy * 1.5)));

          // Forward mouse move to webview if under webview
          const wv = document.getElementById('ott-browser-webview') as any;
          if (wv && typeof wv.sendInputEvent === 'function') {
            const rect = wv.getBoundingClientRect();
            const relX = Math.round(newX - rect.left);
            const relY = Math.round(newY - rect.top);
            if (relX >= 0 && relX <= rect.width && relY >= 0 && relY <= rect.height) {
              wv.sendInputEvent({ type: 'mouseMove', x: relX, y: relY });
            }
          }
          return { ...prev, x: newX, y: newY, visible: true };
        });
        if (cursorHideTimerRef.current) clearTimeout(cursorHideTimerRef.current);
        cursorHideTimerRef.current = setTimeout(() => {
          setVirtualCursor(prev => ({ ...prev, visible: false }));
        }, 5000);
        break;
      }
      case 'mouse_click': {
        setVirtualCursor(prev => ({ ...prev, isClicking: true, visible: true }));
        setTimeout(() => setVirtualCursor(prev => ({ ...prev, isClicking: false })), 200);

        setVirtualCursor(curr => {
          let handledInWebview = false;
          const wv = document.getElementById('ott-browser-webview') as any;
          if (wv && typeof wv.sendInputEvent === 'function') {
            const rect = wv.getBoundingClientRect();
            const relX = Math.round(curr.x - rect.left);
            const relY = Math.round(curr.y - rect.top);
            if (relX >= 0 && relX <= rect.width && relY >= 0 && relY <= rect.height) {
              wv.focus();
              wv.sendInputEvent({ type: 'mouseDown', x: relX, y: relY, button: 'left', clickCount: 1 });
              wv.sendInputEvent({ type: 'mouseUp', x: relX, y: relY, button: 'left', clickCount: 1 });
              handledInWebview = true;
            }
          }

          if (!handledInWebview) {
            const el = document.elementFromPoint(curr.x, curr.y) as HTMLElement | null;
            if (el) {
              const clickable = el.closest('button, [role="button"], a, .tv-channel-card, .store-app-card, .nav-btn, .assistant-btn, .tab-btn, .sazib-tv-brand') as HTMLElement | null;
              if (clickable) {
                clickable.focus?.();
                clickable.click();
              } else {
                el.focus?.();
                el.click();
              }
              try {
                const evtDown = new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: curr.x, clientY: curr.y, view: window });
                const evtUp = new MouseEvent('mouseup', { bubbles: true, cancelable: true, clientX: curr.x, clientY: curr.y, view: window });
                const evtClick = new MouseEvent('click', { bubbles: true, cancelable: true, clientX: curr.x, clientY: curr.y, view: window });
                el.dispatchEvent(evtDown);
                el.dispatchEvent(evtUp);
                el.dispatchEvent(evtClick);
              } catch {}
            }
          }
          return curr;
        });
        break;
      }
      case 'mouse_scroll': {
        const dy = cmd.payload?.dy || 150;
        let handledInWebview = false;
        const wv = document.getElementById('ott-browser-webview') as any;
        if (wv && typeof wv.sendInputEvent === 'function') {
          const rect = wv.getBoundingClientRect();
          const relX = Math.round(virtualCursor.x - rect.left);
          const relY = Math.round(virtualCursor.y - rect.top);
          if (relX >= 0 && relX <= rect.width && relY >= 0 && relY <= rect.height) {
            wv.sendInputEvent({ type: 'mouseWheel', x: relX, y: relY, deltaY: -dy });
            handledInWebview = true;
          }
        }
        if (!handledInWebview) {
          window.scrollBy({ top: dy, behavior: 'smooth' });
          const mainEl = document.querySelector('.sazib-tv-leanback');
          if (mainEl) mainEl.scrollBy({ top: dy, behavior: 'smooth' });
        }
        break;
      }
      case 'nav': {
        const key = cmd.payload;
        if (key === 'ArrowUp') {
          if (active) prevChannel();
          else navigateSpatial('up');
        } else if (key === 'ArrowDown') {
          if (active) nextChannel();
          else navigateSpatial('down');
        } else if (key === 'ArrowLeft') {
          if (active) volumeDown();
          else navigateSpatial('left');
        } else if (key === 'ArrowRight') {
          if (active) volumeUp();
          else navigateSpatial('right');
        } else if (key === 'Enter') {
          if (active) togglePlayPause();
          else activateSpatial();
        } else if (key === 'Escape') {
          backSpatial();
        } else if (key === 'Home') {
          homeSpatial();
        }
        break;
      }
    }
  }, [channels, active, togglePlayPause, nextChannel, prevChannel, toggleTheater, toggleFullscreen, toggleMute, volumeUp, volumeDown, navigateSpatial, activateSpatial, backSpatial, homeSpatial, showOsd]);

  if (adminControl.maintenanceMode) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top, #1e293b, #090d16 70%)',
        color: '#f8fafc',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          maxWidth: '500px',
          background: 'rgba(15, 23, 42, 0.92)',
          border: '1px solid #334155',
          borderRadius: '20px',
          padding: '40px 32px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)'
        }}>
          <img src={sazibTvLogo} alt="Sazib TV" style={{ height: '56px', marginBottom: '16px', objectFit: 'contain' }} />
          <h1 style={{ margin: '0 0 10px', fontSize: '24px', color: '#fff' }}>🛠️ Under Maintenance</h1>
          <p style={{ margin: '0 0 18px', fontSize: '15px', color: '#94a3b8', lineHeight: 1.6 }}>
            {adminControl.maintenanceMessage || 'Sazib TV is under scheduled maintenance. We will be back shortly!'}
          </p>
          {adminControl.supportContact && (
            <div style={{ color: '#60a5fa', fontSize: '14px', fontWeight: 600 }}>
              {adminControl.supportContact}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`sazib-tv-leanback device-${device.activeDevice}`}>
      {/* LIVE ADMIN ANNOUNCEMENT BANNER (Controlled by https://sazib-tv-admin.vercel.app/) */}
      {adminControl.announcementEnabled && adminControl.announcementText && (
        <div style={{
          background: 'linear-gradient(90deg, #b91c1c, #e50914)',
          color: '#ffffff',
          padding: '8px 18px',
          textAlign: 'center',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.2px',
          zIndex: 1000
        }}>
          📢 {adminControl.announcementText}
        </div>
      )}

      {/* MASTER STREAMING PAUSED NOTICE (Controlled by Admin Panel) */}
      {adminControl.masterStreaming === false && (
        <div style={{
          background: '#7c2d12',
          color: '#fed7aa',
          padding: '10px 18px',
          textAlign: 'center',
          fontSize: '13px',
          fontWeight: 600,
          borderBottom: '1px solid #9a3412'
        }}>
          ⏸️ Live streaming is temporarily paused by Sazib TV Admin. {adminControl.supportContact || ''}
        </div>
      )}

      {/* SINGER / TV FRAME ANDROID TOP BAR */}
      <header className="leanback-topbar">
        <div className="topbar-left">
          {/* Sazib TV Official Brand Logo (Transparent in Top-Left Corner) */}
          <div
            className="sazib-tv-brand"
            title="Sazib TV Home"
            onClick={homeSpatial}
          >
            <img src={sazibTvLogo} alt="Sazib TV" className="sazib-tv-brand-logo-img" />
          </div>

          {/* Google Assistant Microphone & 4 Colored Dots */}
          <div className="assistant-search">
          <button
            id="top-assistant"
            type="button"
            className={`assistant-btn ${focusedId === 'top-assistant' ? 'focused' : ''}`}
            title="Google Voice Search & Assistant (Enter)"
            onClick={() => {
              setMessage('🎤 Google Voice Search: Search any channel...');
              setFocusedId('top-search');
              searchInputRef.current?.focus();
            }}
            onMouseEnter={() => setFocusedId('top-assistant')}
          >
            <div className="assistant-dots">
              <span className="dot-blue"></span>
              <span className="dot-red"></span>
              <span className="dot-yellow"></span>
              <span className="dot-green"></span>
            </div>
            <Search size={16} color="#4285f4" />
          </button>

          <div
            id="top-search"
            className={`search-input-wrap ${focusedId === 'top-search' ? 'focused' : ''}`}
            onClick={() => {
              setFocusedId('top-search');
              searchInputRef.current?.focus();
            }}
          >
            <input
              ref={searchInputRef}
              placeholder={t.searchPlaceholder}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocusedId('top-search')}
            />
            {query && <X size={14} className="clear-search" onClick={() => setQuery('')} />}
          </div>
        </div>
      </div>

      {/* Right Status Controls */}
        <div className="leanback-status">
          {/* Mobile Remote Notification Pill */}
          <button
            id="top-notif"
            className={`status-btn notif-btn ${focusedId === 'top-notif' ? 'focused' : ''}`}
            title="Mobile Remote Connected"
            onClick={() => setShowMobileConnect(true)}
            onMouseEnter={() => setFocusedId('top-notif')}
          >
            <span className="notif-badge">1</span>
          </button>

          {/* Cast / Source Icon */}
          <button
            id="top-cast"
            className={`status-btn ${focusedId === 'top-cast' ? 'focused' : ''}`}
            title="FastCast & Mobile Screen (Enter)"
            onClick={() => setShowMobileConnect(true)}
            onMouseEnter={() => setFocusedId('top-cast')}
          >
            <Cast size={18} />
          </button>

          {/* Add / Import Playlist */}
          <button
            className="status-btn"
            title="Add Channels & Playlists"
            onClick={() => setShowAdd(true)}
          >
            <Plus size={18} />
          </button>

          {/* Settings Gear */}
          <button
            id="top-settings"
            className={`status-btn ${focusedId === 'top-settings' ? 'focused' : ''}`}
            title="Settings & Network (Enter)"
            onClick={() => setShowAdd(true)}
            onMouseEnter={() => setFocusedId('top-settings')}
          >
            <Settings size={18} />
          </button>

          {/* Account Login / User Profile Button */}
          <button
            id="top-account"
            className={`status-btn account-login-pill ${currentUser ? 'logged-in' : ''} ${focusedId === 'top-account' ? 'focused' : ''}`}
            title={currentUser ? `${currentUser.name} (${currentUser.identifier})` : 'অ্যাকাউন্ট লগইন / সাইন আপ করুন'}
            onClick={() => {
              setAuthError('');
              setShowAccountModal(true);
            }}
            onMouseEnter={() => setFocusedId('top-account')}
          >
            {currentUser ? (
              <>
                <span className="account-avatar-mini">
                  {currentUser.name.charAt(0).toUpperCase()}
                </span>
                <span className="account-name-text">{currentUser.name.split(' ')[0]}</span>
              </>
            ) : (
              <>
                <LogIn size={16} />
                <span className="account-name-text">{t.login}</span>
              </>
            )}
          </button>

          {/* Leanback Digital Clock */}
          <div className="leanback-clock">
            {currentTime || '9:33'}
          </div>
        </div>
      </header>

      {/* LEANBACK ROWS DASHBOARD */}
      <main className="leanback-content">
        {/* SEARCH RESULTS VIEW */}
        {query ? (
          <section className="search-results-section">
            <div className="search-header">
              <h2>Search Results for "{query}" ({filteredChannels.length})</h2>
              <p>Click any channel to watch immediately</p>
            </div>
            {filteredChannels.length === 0 ? (
              <div className="search-empty">
                <Tv size={42} />
                <p>No channels found. Try another search keyword.</p>
              </div>
            ) : (
              <div className="search-grid">
                {filteredChannels.map(c => (
                  <LeanbackChannelCard
                    key={c.id}
                    channel={c}
                    isFocused={focusedId === c.id}
                    isFav={favorites.includes(c.id)}
                    onPlay={() => setActive(c)}
                    onFocus={() => setFocusedId(c.id)}
                    onFav={() => toggleFav(c)}
                    onDelete={() => deleteChannel(c.id)}
                  />
                ))}
              </div>
            )}
          </section>
        ) : activeCategoryRail ? (
          /* FULL-DISPLAY GRID LAYOUT FOR SELECTED CATEGORY RAIL BUTTON */
          (() => {
            const activeRow = navRows.find(r => r.railId === activeCategoryRail);
            const isAppCategory = activeCategoryRail === 'rail-apps' || activeCategoryRail === 'rail-widgets';
            const gridApps = activeCategoryRail === 'rail-apps' ? featuredAppsRow1 : featuredAppsRow2;
            const gridChannels =
              activeCategoryRail === 'rail-bd' ? bdChannels :
              activeCategoryRail === 'rail-india' ? indianChannels :
              activeCategoryRail === 'rail-sports' ? sportsChannels :
              activeCategoryRail === 'rail-movies' ? movieChannels :
              activeCategoryRail === 'rail-news' ? newsChannels :
              channels;
            const totalCount = isAppCategory ? gridApps.length : gridChannels.length;

            return (
              <section className="category-grid-section">
                <div className="category-grid-header">
                  <div className="category-grid-title-wrap">
                    <button
                      className="category-back-btn"
                      onClick={() => setActiveCategoryRail(null)}
                      title="হোম ভিউতে ফিরে যান (Esc)"
                    >
                      <ChevronLeft size={18} />
                      <span>{t.back}</span>
                    </button>
                    <h2>
                      <span>{activeRow?.title || activeRow?.label || 'Channels'}</span>
                      <span className="category-count-pill">{totalCount} টি</span>
                    </h2>
                  </div>
                </div>

                {/* Quick Switch Category Pills */}
                <div className="category-grid-pills">
                  {navRows.filter(r => r.railId !== 'rail-playstore').map(r => (
                    <button
                      key={r.railId}
                      className={`category-switch-pill ${activeCategoryRail === r.railId ? 'active' : ''}`}
                      onClick={() => handleRailClick(r)}
                    >
                      <span>{r.label}</span>
                      <span style={{ opacity: 0.75, fontSize: '11px' }}>({r.items.length})</span>
                    </button>
                  ))}
                </div>

                {totalCount === 0 ? (
                  <div className="search-empty">
                    <Tv size={42} />
                    <p>এই ক্যাটাগরিতে কোনো চ্যানেল পাওয়া যায়নি।</p>
                  </div>
                ) : isAppCategory ? (
                  <div className="category-grid-layout">
                    {gridApps.map(app => (
                      <LeanbackAppCard
                        key={app.id}
                        app={app}
                        isFocused={focusedId === app.id}
                        onFocus={() => setFocusedId(app.id)}
                        onClick={() => {
                          if (app.id === 'app-playstore') setShowPlayStoreHub(true);
                          else openOttApp(app);
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="category-grid-layout">
                    {gridChannels.map(c => (
                      <LeanbackChannelCard
                        key={c.id}
                        channel={c}
                        isFocused={focusedId === c.id}
                        isFav={favorites.includes(c.id)}
                        onPlay={() => {
                          setActive(c);
                          showOsd(c.name, c.group || 'Live TV', c.logo);
                        }}
                        onFocus={() => setFocusedId(c.id)}
                        onFav={() => toggleFav(c)}
                        onDelete={() => deleteChannel(c.id)}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })()
        ) : (
          /* STANDARD LEANBACK ROWS (EXACTLY LIKE USER'S IMAGE) */
          <div className="leanback-rows">
            {/* ROW 0: GOOGLE PLAY STORE LEFT RAIL BUTTON & STORE ACCESS */}
            <div className="leanback-row" id="row-playstore">
              <LeanbackRailButton
                id="rail-playstore"
                label="Play Store"
                icon={<PlayStoreIcon size={26} />}
                iconClass="playstore-circle"
                isFocused={focusedId === 'rail-playstore'}
                onFocus={() => setFocusedId('rail-playstore')}
                onClick={() => handleRailClick(navRows[0])}
              />
              <div className="row-cards-scroll">
                <LeanbackAppCard
                  key={PLAY_STORE_APP.id}
                  app={PLAY_STORE_APP}
                  isFocused={focusedId === PLAY_STORE_APP.id}
                  onFocus={() => setFocusedId(PLAY_STORE_APP.id)}
                  onClick={() => setShowPlayStoreHub(true)}
                />
              </div>
            </div>

            {/* ROW 1: APPS (Red 9-dot Icon Rail + Netflix Active Focus Card) */}
            <div className="leanback-row" id="row-apps">
              <LeanbackRailButton
                id="rail-apps"
                label="Apps"
                icon={<Grid size={22} color="#ffffff" />}
                iconClass="red-circle"
                isFocused={focusedId === 'rail-apps'}
                onFocus={() => setFocusedId('rail-apps')}
                onClick={() => handleRailClick(navRows[1])}
              />
              <div className="row-cards-scroll">
                {featuredAppsRow1.map(app => (
                  <LeanbackAppCard
                    key={app.id}
                    app={app}
                    isFocused={focusedId === app.id}
                    onFocus={() => setFocusedId(app.id)}
                    onClick={() => {
                      if (app.id === 'app-playstore') setShowPlayStoreHub(true);
                      else openOttApp(app);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* ROW 2: WIDGETS & OTT (Cyan Rounded Square Rail + Chorki, Toffee, TVWeb, AccuWeather) */}
            <div className="leanback-row" id="row-widgets">
              <LeanbackRailButton
                id="rail-widgets"
                label="Widgets"
                icon={<Flame size={22} color="#ffffff" />}
                iconClass="cyan-square"
                isFocused={focusedId === 'rail-widgets'}
                onFocus={() => setFocusedId('rail-widgets')}
                onClick={() => handleRailClick(navRows[2])}
              />
              <div className="row-cards-scroll">
                {featuredAppsRow2.map(app => (
                  <LeanbackAppCard
                    key={app.id}
                    app={app}
                    isFocused={focusedId === app.id}
                    onFocus={() => setFocusedId(app.id)}
                    onClick={() => openOttApp(app)}
                  />
                ))}
              </div>
            </div>

            {/* ROW 3: LIVE TV (BANGLADESH) (Blue Screen Rail + Somoy, Jamuna, T Sports, BTV, NTV, RTV) */}
            <div className="leanback-row" id="row-bd">
              <LeanbackRailButton
                id="rail-bd"
                label="Live TV"
                badge={`${bdChannels.length} BD`}
                icon={<Tv size={22} color="#ffffff" />}
                iconClass="blue-square"
                isFocused={focusedId === 'rail-bd'}
                onFocus={() => setFocusedId('rail-bd')}
                onClick={() => handleRailClick(navRows[3])}
              />
              <div className="row-cards-scroll">
                {bdChannels.map(c => (
                  <LeanbackChannelCard
                    key={c.id}
                    channel={c}
                    isFocused={focusedId === c.id}
                    isFav={favorites.includes(c.id)}
                    onPlay={() => {
                      setActive(c);
                      showOsd(c.name, c.group || 'Live TV', c.logo);
                    }}
                    onFocus={() => setFocusedId(c.id)}
                    onFav={() => toggleFav(c)}
                    onDelete={() => deleteChannel(c.id)}
                  />
                ))}
              </div>
            </div>

            {/* ROW 4: INDIAN TV (Colors Bangla, Jalsha Movies, Star Sports, Goldmines) */}
            <div className="leanback-row" id="row-india">
              <LeanbackRailButton
                id="rail-india"
                label="Indian TV"
                badge={`${indianChannels.length} IN`}
                icon={<Sparkles size={22} color="#ffffff" />}
                iconClass="purple-square"
                isFocused={focusedId === 'rail-india'}
                onFocus={() => setFocusedId('rail-india')}
                onClick={() => handleRailClick(navRows[4])}
              />
              <div className="row-cards-scroll">
                {indianChannels.map(c => (
                  <LeanbackChannelCard
                    key={c.id}
                    channel={c}
                    isFocused={focusedId === c.id}
                    isFav={favorites.includes(c.id)}
                    onPlay={() => {
                      setActive(c);
                      showOsd(c.name, c.group || 'Live TV', c.logo);
                    }}
                    onFocus={() => setFocusedId(c.id)}
                    onFav={() => toggleFav(c)}
                    onDelete={() => deleteChannel(c.id)}
                  />
                ))}
              </div>
            </div>

            {/* ROW 5: SPORTS (T Sports, Star Sports 1, Red Bull TV, DD Sports) */}
            <div className="leanback-row" id="row-sports">
              <LeanbackRailButton
                id="rail-sports"
                label="Sports"
                badge={`${sportsChannels.length} Live`}
                icon={<Trophy size={22} color="#ffffff" />}
                iconClass="green-square"
                isFocused={focusedId === 'rail-sports'}
                onFocus={() => setFocusedId('rail-sports')}
                onClick={() => handleRailClick(navRows[5])}
              />
              <div className="row-cards-scroll">
                {sportsChannels.map(c => (
                  <LeanbackChannelCard
                    key={c.id}
                    channel={c}
                    isFocused={focusedId === c.id}
                    isFav={favorites.includes(c.id)}
                    onPlay={() => {
                      setActive(c);
                      showOsd(c.name, c.group || 'Live TV', c.logo);
                    }}
                    onFocus={() => setFocusedId(c.id)}
                    onFav={() => toggleFav(c)}
                    onDelete={() => deleteChannel(c.id)}
                  />
                ))}
              </div>
            </div>

            {/* ROW 6: MOVIES & CINEMA */}
            <div className="leanback-row" id="row-movies">
              <LeanbackRailButton
                id="rail-movies"
                label="Movies"
                icon={<Film size={22} color="#ffffff" />}
                iconClass="orange-square"
                isFocused={focusedId === 'rail-movies'}
                onFocus={() => setFocusedId('rail-movies')}
                onClick={() => handleRailClick(navRows[6])}
              />
              <div className="row-cards-scroll">
                {movieChannels.map(c => (
                  <LeanbackChannelCard
                    key={c.id}
                    channel={c}
                    isFocused={focusedId === c.id}
                    isFav={favorites.includes(c.id)}
                    onPlay={() => {
                      setActive(c);
                      showOsd(c.name, c.group || 'Live TV', c.logo);
                    }}
                    onFocus={() => setFocusedId(c.id)}
                    onFav={() => toggleFav(c)}
                    onDelete={() => deleteChannel(c.id)}
                  />
                ))}
              </div>
            </div>

            {/* ROW 7: NEWS 24/7 */}
            <div className="leanback-row" id="row-news">
              <LeanbackRailButton
                id="rail-news"
                label="News 24/7"
                icon={<Newspaper size={22} color="#ffffff" />}
                iconClass="crimson-square"
                isFocused={focusedId === 'rail-news'}
                onFocus={() => setFocusedId('rail-news')}
                onClick={() => handleRailClick(navRows[7])}
              />
              <div className="row-cards-scroll">
                {newsChannels.map(c => (
                  <LeanbackChannelCard
                    key={c.id}
                    channel={c}
                    isFocused={focusedId === c.id}
                    isFav={favorites.includes(c.id)}
                    onPlay={() => {
                      setActive(c);
                      showOsd(c.name, c.group || 'Live TV', c.logo);
                    }}
                    onFocus={() => setFocusedId(c.id)}
                    onFav={() => toggleFav(c)}
                    onDelete={() => deleteChannel(c.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Floating Toast Notification */}
        {message && (
          <div className="leanback-toast" onClick={() => setMessage('')}>
            <span>{message}</span>
            <X size={15} />
          </div>
        )}
      </main>

      {/* FULLSCREEN TV VIDEO PLAYER OVERLAY */}
      {active && (
        <div className={`tv-player-overlay ${isTheaterMode ? 'theater-mode' : ''}`} ref={playerOverlayRef}>
          {/* Top Player HUD */}
          <div className="tv-player-hud">
            <button className="tv-round-btn" title="Back to Sazib TV (Esc)" onClick={closePlayer}>
              <ChevronLeft size={22} />
            </button>

            <div className="tv-player-meta">
              {active.logo && (
                <img
                  src={active.logo}
                  alt=""
                  className="tv-player-logo"
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
              )}
              <div>
                <b>{active.name}</b>
                <span className="tv-badge-pill">{active.group || 'Live TV'}</span>
              </div>
            </div>

            <div className="tv-player-controls">
              <button
                className={`tv-round-btn ${showQuickDrawer ? 'fav-on' : ''}`}
                title="Quick Channel Guide (C / Menu)"
                onClick={() => setShowQuickDrawer(prev => !prev)}
              >
                <ListVideo size={18} />
              </button>
              <button className="tv-round-btn" title="Previous Channel (Up Arrow)" onClick={prevChannel}>
                <ChevronLeft size={18} />
              </button>
              <button className="tv-round-btn" title="Next Channel (Down Arrow)" onClick={nextChannel}>
                <ChevronRight size={18} />
              </button>
              <button
                className={`tv-round-btn ${isMuted ? 'fav-on' : ''}`}
                title="Mute / Unmute (M)"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <button
                className={`tv-round-btn ${favorites.includes(active.id) ? 'fav-on' : ''}`}
                title="Favorite"
                onClick={() => toggleFav(active)}
              >
                <Heart size={18} fill={favorites.includes(active.id) ? 'currentColor' : 'none'} />
              </button>
              {active.webUrl && (
                <button
                  className="tv-round-btn web-btn"
                  title="Open Official Website (🌐)"
                  onClick={() => window.open(active.webUrl, '_blank')}
                  style={{ width: 'auto', padding: '0 10px', gap: '5px' }}
                >
                  <Globe2 size={16} />
                  <span style={{ fontSize: '11px', fontWeight: 700 }}>Web</span>
                </button>
              )}
              <button
                className={`tv-round-btn ${isTheaterMode ? 'fav-on' : ''}`}
                title="Theater Mode (T)"
                onClick={toggleTheater}
              >
                <Film size={18} />
              </button>
              <button
                className={`tv-round-btn ${device.autoRotate ? 'fav-on' : ''}`}
                title={`অটো রোটেট (${device.autoRotate ? 'চালু' : 'বন্ধ'}) / স্ক্রিন রোটেট`}
                onClick={() => {
                  device.manualRotate();
                  showOsd('🔄 স্ক্রিন রোটেট', 'ডিসপ্লে রোটেট করা হয়েছে');
                }}
              >
                <RefreshCw size={18} />
              </button>
              <button
                className={`tv-round-btn ${isFullscreen ? 'fav-on' : ''}`}
                title="Full Screen Display (F)"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
              <button className="tv-round-btn close" title="Exit Player (Esc)" onClick={closePlayer}>
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Video Container */}
          <div className="tv-video-container">
            <video
              ref={videoRef}
              controls
              autoPlay
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onVolumeChange={() => {
                if (videoRef.current) setIsMuted(videoRef.current.muted);
              }}
              onWaiting={() => setIsLoadingStream(true)}
              onPlaying={() => {
                setIsLoadingStream(false);
                setStreamError(false);
              }}
              onError={() => {
                setIsLoadingStream(false);
                setStreamError(true);
              }}
            />

            {/* LIVE STREAM BUFFERING SPINNER */}
            {isLoadingStream && !streamError && (
              <div className="tv-player-loading">
                <div className="tv-spinner"></div>
                <span>Buffering {active.name}...</span>
              </div>
            )}

            {/* ON-SCREEN OSD BANNER */}
            {playerOsd && (
              <div className="tv-player-osd">
                {playerOsd.logo && (
                  <img
                    src={playerOsd.logo}
                    alt=""
                    className="osd-logo"
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                )}
                <div className="osd-info">
                  <span className="osd-title">{playerOsd.title}</span>
                  {playerOsd.sub && <span className="osd-sub">{playerOsd.sub}</span>}
                </div>
              </div>
            )}

            {/* QUICK CHANNEL GUIDE DRAWER */}
            {showQuickDrawer && (
              <div className="tv-quick-drawer">
                <div className="drawer-head">
                  <h3><Tv size={20} color="#3b82f6" /> Quick Channel Guide</h3>
                  <button className="tv-round-btn" onClick={() => setShowQuickDrawer(false)}>
                    <X size={18} />
                  </button>
                </div>
                <div className="drawer-search">
                  <input
                    placeholder="Filter channels..."
                    value={drawerQuery}
                    onChange={e => setDrawerQuery(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="drawer-list">
                  {channels
                    .filter(c => !drawerQuery || c.name.toLowerCase().includes(drawerQuery.toLowerCase()))
                    .map(c => (
                      <button
                        key={c.id}
                        className={`drawer-item ${active.id === c.id ? 'now-playing' : ''}`}
                        onClick={() => {
                          setActive(c);
                          showOsd(c.name, c.group || 'Live TV', c.logo);
                        }}
                      >
                        {c.logo ? (
                          <img src={c.logo} alt="" onError={e => (e.currentTarget.style.display = 'none')} />
                        ) : (
                          <Tv size={18} />
                        )}
                        <div>
                          <div style={{ fontWeight: active.id === c.id ? 'bold' : 'normal' }}>{c.name}</div>
                          <small style={{ color: '#94a3b8' }}>{c.group || 'Live'}</small>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            {streamError && (
              <div className="tv-stream-error">
                <Tv size={42} />
                <h3>Stream Unavailable</h3>
                <p>This stream is currently offline or requires provider authorization.</p>
                <button className="tv-btn primary" onClick={nextChannel}>
                  Switch to Next Channel <ChevronRight size={16} />
                </button>
              </div>
            )}
            <div className="tv-player-tips">
              Sazib TV • <b>↑ / ↓</b> Channel change • <b>← / →</b> Volume • <b>Space / OK</b> Play/Pause • <b>T</b> Theater Mode • <b>F</b> Full Display • <b>C</b> Channel Guide • <b>Esc</b> Exit
            </div>
          </div>
        </div>
      )}

      {/* IN-APP OTT EXPERIENCE OVERLAY (CHORKI, TOFFEE, PLAY STORE, YOUTUBE, NETFLIX, ETC.) */}
      {activeOtt && (
        <div className={`tv-ott-overlay ${isFullscreen ? 'fullscreen' : ''}`}>
          {/* Top Control Bar */}
          <div className="tv-ott-header">
            <div className="tv-ott-header-left">
              <button
                className="tv-round-btn"
                title="Back to Sazib TV (Esc)"
                onClick={closeOtt}
              >
                <ChevronLeft size={22} />
              </button>
              <button
                className="tv-round-btn tv-ott-home-btn"
                title="হোম স্ক্রিনে ফিরে যান (Home)"
                onClick={homeSpatial}
                style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: '1px solid #60a5fa', color: '#fff', gap: '6px', padding: '0 14px', width: 'auto', borderRadius: '14px', display: 'flex', alignItems: 'center' }}
              >
                <Home size={18} />
                <span style={{ fontSize: '13px', fontWeight: 700 }}>হোম</span>
              </button>

              {ottMode === 'web' && (
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button
                    className="tv-round-btn"
                    title="পিছনে যান (Back)"
                    onClick={() => {
                      const wv = document.getElementById('ott-browser-webview') as any;
                      if (wv && typeof wv.goBack === 'function' && wv.canGoBack()) wv.goBack();
                      else {
                        const ifr = document.getElementById('ott-browser-iframe') as HTMLIFrameElement;
                        try { ifr?.contentWindow?.history.back(); } catch {}
                      }
                    }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    className="tv-round-btn"
                    title="সামনে যান (Forward)"
                    onClick={() => {
                      const wv = document.getElementById('ott-browser-webview') as any;
                      if (wv && typeof wv.goForward === 'function' && wv.canGoForward()) wv.goForward();
                      else {
                        const ifr = document.getElementById('ott-browser-iframe') as HTMLIFrameElement;
                        try { ifr?.contentWindow?.history.forward(); } catch {}
                      }
                    }}
                  >
                    <ChevronRight size={18} />
                  </button>
                  <button
                    className="tv-round-btn"
                    title="হোম পেজে যান"
                    onClick={() => {
                      const wv = document.getElementById('ott-browser-webview') as any;
                      if (wv) wv.src = activeOtt.webUrl || '';
                      else {
                        const ifr = document.getElementById('ott-browser-iframe') as HTMLIFrameElement;
                        if (ifr) ifr.src = activeOtt.webUrl || '';
                      }
                    }}
                  >
                    <Tv size={16} />
                  </button>
                </div>
              )}

              <div className="tv-ott-brand">
                <div className="tv-ott-logo-pill">
                  {activeOtt.id === 'app-playstore' || activeOtt.id === 'rail-playstore' ? (
                    <PlayStoreIcon size={22} />
                  ) : (
                    <Play size={18} color="#00d2ff" />
                  )}
                </div>
                <div>
                  <b>{activeOtt.name}</b>
                  <small>{activeOtt.subtitle || 'OTT Platform'}</small>
                </div>
              </div>
            </div>

            <div className="tv-ott-tabs">
              <button
                className={`tv-ott-tab-btn ${ottMode === 'web' ? 'active' : ''}`}
                onClick={() => setOttMode('web')}
              >
                <Globe2 size={16} />
                <span>ওয়েব অ্যাপ</span>
              </button>
              {activeOtt.url && (
                <button
                  className={`tv-ott-tab-btn ${ottMode === 'stream' ? 'active' : ''}`}
                  onClick={() => setOttMode('stream')}
                >
                  <Film size={16} />
                  <span>সরাসরি লাইভ স্ট্রিম</span>
                </button>
              )}
            </div>

            <div className="tv-ott-header-right">
              {activeOtt.webUrl && (
                <button
                  className="tv-round-btn window-btn"
                  title="আলাদা ফুল-ফিচারড টিভি প্লেয়ার উইন্ডোতে চালান"
                  onClick={() => {
                    if (window.sazibApi?.openOttWindow) {
                      window.sazibApi.openOttWindow({ url: activeOtt.webUrl || '', title: activeOtt.name });
                      showOsd('📺 আলাদা উইন্ডোতে ওপেন হয়েছে', activeOtt.name);
                    } else {
                      window.open(activeOtt.webUrl, '_blank', 'width=1320,height=800');
                    }
                  }}
                >
                  <MonitorPlay size={16} />
                  <span>আলাদা উইন্ডো</span>
                </button>
              )}

              {activeOtt.webUrl && (
                <button
                  className="tv-round-btn external-btn"
                  title="Open in Chrome / Browser"
                  onClick={() => {
                    if (window.sazibApi?.openExternal) {
                      window.sazibApi.openExternal(activeOtt.webUrl || '');
                    } else {
                      window.open(activeOtt.webUrl, '_blank');
                    }
                  }}
                >
                  <ExternalLink size={16} />
                  <span>ক্রোমে খুলুন</span>
                </button>
              )}
              <button
                className="tv-round-btn"
                title="Reload (R)"
                onClick={() => {
                  setIsOttIframeLoading(true);
                  const wv = document.getElementById('ott-browser-webview') as any;
                  if (wv && typeof wv.reload === 'function') {
                    wv.reload();
                  } else {
                    const iframe = document.getElementById('ott-browser-iframe') as HTMLIFrameElement;
                    if (iframe) iframe.src = activeOtt.webUrl || '';
                  }
                }}
              >
                <RefreshCw size={17} />
              </button>
              <button
                className={`tv-round-btn ${device.autoRotate ? 'fav-on' : ''}`}
                title={`অটো রোটেট (${device.autoRotate ? 'চালু' : 'বন্ধ'}) / স্ক্রিন রোটেট`}
                onClick={() => {
                  device.manualRotate();
                  showOsd('🔄 স্ক্রিন রোটেট', 'ডিসপ্লে রোটেট করা হয়েছে');
                }}
              >
                <RefreshCw size={18} />
              </button>
              <button
                className={`tv-round-btn ${isFullscreen ? 'fav-on' : ''}`}
                title="Full Screen Display (F)"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
              <button
                className="tv-round-btn close"
                title="Exit (Esc)"
                onClick={closeOtt}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* OTT Content Body */}
          <div className="tv-ott-body">
            {ottMode === 'web' ? (
              <div className="tv-ott-web-container">
                {typeof window !== 'undefined' && (window.sazibApi || navigator.userAgent.includes('Electron')) ? (
                  <>
                    {isOttIframeLoading && (
                      <div
                        className="tv-ott-loading-pill"
                        onClick={() => setIsOttIframeLoading(false)}
                        style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                        title="ক্লিক করে বন্ধ করুন"
                      >
                        <div className="loading-spinner"></div>
                        <span>{activeOtt.name} ওপেন হচ্ছে...</span>
                      </div>
                    )}
                    <webview
                      id="ott-browser-webview"
                      src={activeOtt.webUrl}
                      partition="persist:sazib_tv_ott"
                      useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
                      allowpopups={true}
                      webpreferences="contextIsolation=false, nodeIntegration=false, webSecurity=false"
                      className="tv-ott-iframe"
                      onLoad={() => setIsOttIframeLoading(false)}
                    ></webview>
                  </>
                ) : (activeOtt.id === 'app-youtube' || activeOtt.id === 'app-ytmusic') ? (
                  /* 100% WORKING IN-APP YOUTUBE PLAYER FOR WEB BROWSERS */
                  <div className="ott-web-yt-studio">
                    <form
                      className="ott-yt-toolbar"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const embed = extractYoutubeEmbed(ytInput);
                        if (embed) {
                          setYtEmbedUrl(embed);
                          showOsd('▶️ YouTube চালু হয়েছে', 'ভিডিও প্লে হচ্ছে');
                        } else if (ytInput.trim()) {
                          launchOttExternal(`https://www.youtube.com/results?search_query=${encodeURIComponent(ytInput.trim())}`, 'YouTube Search');
                        }
                      }}
                    >
                      <div className="ott-yt-search-wrap">
                        <Search size={16} color="#94a3b8" />
                        <input
                          type="text"
                          placeholder="যেকোনো YouTube ভিডিওর লিংক দিন বা সার্চ করুন..."
                          value={ytInput}
                          onChange={(e) => setYtInput(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="tv-btn primary" style={{ height: '38px', padding: '0 16px' }}>
                        <Play size={15} /> প্লে / সার্চ
                      </button>
                      <button
                        type="button"
                        className="tv-btn secondary"
                        style={{ height: '38px', padding: '0 14px' }}
                        onClick={() => launchOttExternal(activeOtt.webUrl || 'https://www.youtube.com', activeOtt.name)}
                      >
                        <ExternalLink size={15} /> ফুল {activeOtt.name} খুলুন
                      </button>
                    </form>

                    <div className="ott-yt-quick-chips">
                      <button onClick={() => setYtEmbedUrl('https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&rel=0')}>🎵 Live Music 24/7</button>
                      <button onClick={() => setYtEmbedUrl('https://www.youtube.com/embed/live_stream?channel=UCxHoBXkY88Tb8z1Ssj6CWsQ&autoplay=1')}>📺 Somoy TV Live</button>
                      <button onClick={() => setYtEmbedUrl('https://www.youtube.com/embed/live_stream?channel=UCN6sm8iHiPd0cnoUardDAnw&autoplay=1')}>📰 Jamuna TV Live</button>
                      <button onClick={() => launchOttExternal('https://www.youtube.com/results?search_query=Bangla+New+Natok+2026', 'Bangla Natok')}>🎬 বাংলা নাটক</button>
                      <button onClick={() => launchOttExternal('https://www.youtube.com/results?search_query=Live+Cricket+Highlights', 'Cricket Highlights')}>🏏 ক্রিকেট হাইলাইটস</button>
                    </div>

                    <div className="ott-yt-frame-wrap">
                      <iframe
                        id="ott-browser-iframe"
                        src={ytEmbedUrl}
                        title={activeOtt.name}
                        className="tv-ott-iframe"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : (
                  /* CUSTOMER-READY OTT LAUNCH & STREAM HUB FOR WEB BROWSERS (NO BLOCKED IFRAME!) */
                  <div className="ott-web-launcher-hub">
                    <div
                      className="ott-launcher-card"
                      style={{ borderColor: activeOtt.textColor ? `${activeOtt.textColor}55` : 'rgba(59, 130, 246, 0.35)' }}
                    >
                      <div className="ott-launcher-hero">
                        <div
                          className="ott-launcher-icon"
                          style={{
                            background: activeOtt.bgColor || '#1e293b',
                            color: activeOtt.textColor || '#ffffff',
                            border: `1px solid ${activeOtt.textColor || '#38bdf8'}44`
                          }}
                        >
                          {activeOtt.logo ? (
                            <img src={activeOtt.logo} alt={activeOtt.name} onError={e => (e.currentTarget.style.display = 'none')} />
                          ) : (
                            <span style={{ fontSize: '26px', fontWeight: 900 }}>{activeOtt.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="ott-launcher-info">
                          <div className="ott-verified-pill">
                            <ShieldCheck size={13} /> অফিসিয়াল ওটিটি প্ল্যাটফর্ম • Full HD / 4K DRM
                          </div>
                          <h2>{activeOtt.name}</h2>
                          <p>{activeOtt.description || activeOtt.subtitle || 'আপনার প্রিয় সিনেমা, নাটক, ওয়েব সিরিজ এবং লাইভ স্পোর্টস উপভোগ করুন।'}</p>
                        </div>
                      </div>

                      <div className="ott-launcher-actions">
                        {activeOtt.webUrl && (
                          <button
                            className="ott-launch-primary-btn"
                            onClick={() => launchOttExternal(activeOtt.webUrl || '', activeOtt.name)}
                          >
                            <ExternalLink size={20} />
                            <span>🚀 {activeOtt.name} ওপেন ও ব্যবহার করুন</span>
                          </button>
                        )}
                        {activeOtt.url && (
                          <button
                            className="ott-launch-stream-btn"
                            onClick={() => setOttMode('stream')}
                          >
                            <Play size={19} />
                            <span>📺 অ্যাপের ভেতরেই লাইভ দেখুন</span>
                          </button>
                        )}
                      </div>

                      <div className="ott-launcher-note">
                        💡 নিরাপত্তা, নিজের অ্যাকাউন্টে লগইন এবং ফুল এইচডি/৪কে (DRM) ভিডিও প্লেব্যাকের জন্য <b>{activeOtt.name}</b> সরাসরি অফিসিয়াল অ্যাপ/উইন্ডোতে চালু হবে যাতে কোনো বাফারিং বা ব্লকিং ছাড়াই দেখতে পারেন।
                      </div>

                      {/* Direct Stream / Video Link Player inside OTT Hub */}
                      <form
                        className="ott-custom-play-box"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const link = ottCustomLink.trim();
                          if (!link) return;
                          const ytEmbed = extractYoutubeEmbed(link);
                          if (ytEmbed) {
                            setYtEmbedUrl(ytEmbed);
                            const ytApp = ALL_STORE_APPS.find(a => a.id === 'app-youtube');
                            if (ytApp) setActiveOtt(ytApp);
                            return;
                          }
                          setActiveOtt({ ...activeOtt, url: link });
                          setOttMode('stream');
                          showOsd('▶️ কাস্টম স্ট্রিম চালু হয়েছে', activeOtt.name);
                        }}
                      >
                        <input
                          type="text"
                          placeholder="অথবা যেকোনো সরাসরি স্ট্রিম (.m3u8 / .mp4) বা YouTube লিংক পেস্ট করে এখানেই দেখুন..."
                          value={ottCustomLink}
                          onChange={(e) => setOttCustomLink(e.target.value)}
                        />
                        <button type="submit" className="tv-btn primary" style={{ height: '40px', padding: '0 16px', whiteSpace: 'nowrap' }}>
                          <Play size={15} /> প্লে করুন
                        </button>
                      </form>

                      {/* Quick Switch Popular OTT Platforms */}
                      <div className="ott-quick-switch-row">
                        <span className="ott-quick-label">জনপ্রিয় ওটিটি:</span>
                        {['app-netflix', 'app-chorki', 'app-toffee', 'app-hoichoi', 'app-youtube', 'app-prime', 'app-bongo', 'app-tsports'].map(id => {
                          const targetApp = ALL_STORE_APPS.find(a => a.id === id);
                          if (!targetApp) return null;
                          return (
                            <button
                              key={id}
                              type="button"
                              className={`ott-quick-chip ${activeOtt.id === id ? 'active' : ''}`}
                              onClick={() => openOttApp(targetApp, 'web')}
                            >
                              {targetApp.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="tv-ott-stream-container">
                <video
                  ref={ottVideoRef}
                  controls
                  autoPlay
                  playsInline
                  className="tv-video-element"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* GOOGLE PLAY STORE & SAZIB TV APP STORE HUB */}
      {showPlayStoreHub && (
        <div className="tv-store-overlay">
          {/* Store Header */}
          <div className="tv-store-header">
            <div className="tv-store-brand">
              <PlayStoreIcon size={36} />
              <div>
                <h1>Google Play Store</h1>
                <span>ANDROID TV APP STORE & HUB</span>
              </div>
            </div>

            {/* Google User Profile / Login */}
            <div className="tv-store-google-account">
              {googleUser ? (
                <div className="tv-google-user-pill" onClick={() => setShowGoogleModal(true)} title="Google Account Info & Settings">
                  <div className="tv-google-avatar">
                    {googleUser.name ? googleUser.name.charAt(0).toUpperCase() : 'G'}
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontSize: '12.5px', lineHeight: 1.2 }}>{googleUser.name}</div>
                    <small style={{ color: '#93c5fd', fontSize: '10px' }}>{googleUser.email}</small>
                  </div>
                </div>
              ) : (
                <button className="tv-google-login-btn" onClick={() => setShowGoogleModal(true)}>
                  <GoogleGIcon size={18} />
                  <span>গুগল অ্যাকাউন্টে সাইন ইন করুন</span>
                </button>
              )}

              <button
                className="tv-round-btn close"
                title="Exit Play Store (Esc)"
                onClick={() => setShowPlayStoreHub(false)}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Store Categories Tab Bar */}
          <div className="tv-store-tabs">
            {[
              { id: 'all', label: '🌟 সকল অ্যাপস' },
              { id: 'ott', label: '🎬 ওটিটি ও সিনেমা' },
              { id: 'live', label: '📺 লাইভ টিভি ও স্পোর্টস' },
              { id: 'music', label: '🎵 মিউজিক' },
              { id: 'tools', label: '🛠️ টুলস ও প্লেয়ার' },
              { id: 'installed', label: `⬇️ ইনস্টলকৃত অ্যাপস (${installedAppIds.length})` },
              { id: 'custom', label: '➕ নতুন কাস্টম অ্যাপ ইনস্টল' },
              { id: 'web', label: '🌐 গুগল প্লে ওয়েব (Play.google.com)' }
            ].map(t => (
              <button
                key={t.id}
                className={`tv-store-tab ${storeCategory === t.id ? 'active' : ''}`}
                onClick={() => setStoreCategory(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Store Body */}
          <div className="tv-store-body">
            {/* Search Input Bar */}
            {storeCategory !== 'web' && storeCategory !== 'custom' && (
              <div style={{ marginBottom: '22px', maxWidth: '420px' }}>
                <input
                  placeholder="প্লে স্টোরে অ্যাপ খুঁজুন (যেমন: Chorki, Hotstar, VLC)..."
                  value={storeSearch}
                  onChange={e => setStoreSearch(e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    padding: '0 16px',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>
            )}

            {storeCategory === 'web' ? (
              <div style={{ width: '100%', height: 'calc(100vh - 190px)', background: '#fff', borderRadius: '16px', overflow: 'hidden' }}>
                <iframe
                  src="https://play.google.com/store/apps"
                  title="Google Play Store Official Web"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              </div>
            ) : storeCategory === 'custom' ? (
              <div className="tv-store-custom-box">
                <h3>➕ যেকোনো ওয়েব অ্যাপ বা ওটিটি টিভি তে ইনস্টল করুন</h3>
                <p>পছন্দের যেকোনো ওটিটি বা ওয়েবসাইটের নাম ও লিঙ্ক দিয়ে টিভি হোমস্ক্রিনে নিজস্ব অ্যাপ হিসেবে ইনস্টল করুন।</p>
                
                <div className="tv-store-form-group">
                  <label>অ্যাপের নাম (App Name)</label>
                  <input
                    placeholder="যেমন: Facebook Watch, Dailymotion, Sonyliv"
                    value={customAppName}
                    onChange={e => setCustomAppName(e.target.value)}
                  />
                </div>

                <div className="tv-store-form-group">
                  <label>ওয়েবসাইট বা স্ট্রিম লিঙ্ক (Web / Stream URL)</label>
                  <input
                    placeholder="https://www.example.com"
                    value={customAppUrl}
                    onChange={e => setCustomAppUrl(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                  <div className="tv-store-form-group">
                    <label>ক্যাটেগরি (Category)</label>
                    <select
                      value={customAppCategory}
                      onChange={e => setCustomAppCategory(e.target.value as any)}
                    >
                      <option value="ott">ওটিটি ও সিনেমা</option>
                      <option value="live">লাইভ টিভি</option>
                      <option value="music">মিউজিক</option>
                      <option value="tools">টুলস ও প্লেয়ার</option>
                    </select>
                  </div>

                  <div className="tv-store-form-group">
                    <label>হোমস্ক্রিন রো (Target Row)</label>
                    <select
                      value={customAppRow}
                      onChange={e => setCustomAppRow(e.target.value as any)}
                    >
                      <option value="apps">Apps Row (উপরের রো)</option>
                      <option value="widgets">Widgets Row (নিচের রো)</option>
                    </select>
                  </div>
                </div>

                <button
                  className="tv-btn primary"
                  style={{ width: '100%', height: '44px' }}
                  onClick={handleInstallCustomApp}
                >
                  📥 অ্যাপ ইনস্টল করে টিভিতে যুক্ত করুন
                </button>
              </div>
            ) : (
              <div className="tv-store-grid">
                {filteredStoreApps.map(app => {
                  const isInstalled = installedAppIds.includes(app.id);
                  const isInstalling = installingAppId === app.id;
                  return (
                    <div key={app.id} className="tv-store-card">
                      <div className="tv-store-card-head">
                        <div className="tv-store-app-icon" style={{ background: app.bgColor || '#1e293b' }}>
                          {app.logo ? (
                            <img src={app.logo} alt="" onError={e => (e.currentTarget.style.display = 'none')} />
                          ) : (
                            <Play size={24} color={app.textColor || '#00d2ff'} />
                          )}
                        </div>
                        <div className="tv-store-app-meta">
                          <h4 className="tv-store-app-name">{app.name}</h4>
                          <p className="tv-store-app-dev">{app.developer}</p>
                          <div className="tv-store-app-stats">
                            <span className="tv-store-rating">★ {app.rating}</span>
                            <span>• {app.downloads}</span>
                            <span>• {app.size}</span>
                          </div>
                        </div>
                      </div>
                      <p className="tv-store-desc">{app.description}</p>

                      {isInstalling && (
                        <div style={{ marginBottom: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#34d399', fontWeight: 600 }}>
                            <span>ডাউনলোড ও ইনস্টল হচ্ছে...</span>
                            <span>{installProgress}%</span>
                          </div>
                          <div className="tv-store-progress-track">
                            <div className="tv-store-progress-fill" style={{ width: `${installProgress}%` }}></div>
                          </div>
                        </div>
                      )}

                      <div className="tv-store-card-actions">
                        {isInstalled ? (
                          <>
                            <button
                              className="tv-store-btn open"
                              onClick={() => {
                                setShowPlayStoreHub(false);
                                openOttApp(app);
                              }}
                            >
                              <Play size={15} />
                              <span>ওপেন করুন</span>
                            </button>
                            <button
                              className="tv-store-btn uninstall"
                              title="টিভি থেকে আনইনস্টল করুন"
                              onClick={() => uninstallStoreApp(app.id, app.name)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        ) : (
                          <button
                            className={`tv-store-btn ${isInstalling ? 'installing' : 'install'}`}
                            disabled={isInstalling}
                            onClick={() => installStoreApp(app)}
                          >
                            <Download size={15} />
                            <span>{isInstalling ? 'ইনস্টল হচ্ছে...' : 'ইনস্টল করুন'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SAZIB TV ACCOUNT LOGIN / SIGN UP / PROFILE MODAL */}
      {showAccountModal && (
        <div className="tv-modal-backdrop" onClick={() => setShowAccountModal(false)}>
          <div className="tv-modal account-auth-modal" style={{ maxWidth: '460px' }} onClick={e => e.stopPropagation()}>
            <div className="tv-modal-head" style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="account-modal-icon-badge">
                  {currentUser ? <ShieldCheck size={22} color="#4ade80" /> : <User size={22} color="#60a5fa" />}
                </div>
                <div>
                  <span className="tv-badge-pill">SAZIB TV ACCOUNT</span>
                  <h2 style={{ fontSize: '20px', margin: '2px 0 0' }}>
                    {currentUser ? 'আমার অ্যাকাউন্ট' : (authTab === 'login' ? 'অ্যাকাউন্ট লগইন' : 'নতুন অ্যাকাউন্ট তৈরি করুন')}
                  </h2>
                </div>
              </div>
              <button className="tv-round-btn" onClick={() => setShowAccountModal(false)}>
                <X size={18} />
              </button>
            </div>

            {currentUser ? (
              <div className="account-profile-card">
                <div className="account-profile-header">
                  <div className="account-avatar-large">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>{currentUser.name}</h3>
                    <div style={{ color: '#93c5fd', fontSize: '13px', marginTop: '2px' }}>{currentUser.phone || currentUser.identifier}</div>
                    {currentUser.email && (
                      <div style={{ color: '#94a3b8', fontSize: '12px' }}>{currentUser.email}</div>
                    )}
                    <div className="account-member-badge">
                      <ShieldCheck size={13} /> {currentUser.plan || 'Sazib TV Active Member'} • {currentUser.activationCode || 'Verified'}
                    </div>
                  </div>
                </div>

                {(currentUser.address || currentUser.nid) && (
                  <div style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '10px', padding: '10px 12px', marginTop: '12px', fontSize: '12px', color: '#cbd5e1', display: 'grid', gap: '4px' }}>
                    {currentUser.address && <div><strong>অ্যাড্রেস:</strong> {currentUser.address}</div>}
                    {currentUser.nid && <div><strong>NID নাম্বার:</strong> {currentUser.nid}</div>}
                    {currentUser.expiresAt && <div><strong>মেয়াদ:</strong> {currentUser.expiresAt}</div>}
                  </div>
                )}

                <div className="account-stats-grid">
                  <div className="account-stat-box">
                    <Heart size={18} color="#f43f5e" />
                    <div>
                      <b>{favorites.length}</b>
                      <small>প্রিয় চ্যানেল</small>
                    </div>
                  </div>
                  <div className="account-stat-box">
                    <Tv size={18} color="#38bdf8" />
                    <div>
                      <b>{channels.length}</b>
                      <small>মোট চ্যানেল</small>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                  <button
                    className="tv-btn secondary"
                    style={{ flex: 1, justifyContent: 'center', color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.35)' }}
                    onClick={handleAccountLogout}
                  >
                    <LogOut size={16} /> সাইন আউট (Logout)
                  </button>
                  <button
                    className="tv-btn primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => setShowAccountModal(false)}
                  >
                    ঠিক আছে
                  </button>
                </div>
              </div>
            ) : signupResult ? (
              <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(74, 222, 128, 0.35)', borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>✅</div>
                <h3 style={{ margin: '0 0 6px', color: '#4ade80', fontSize: '18px' }}>
                  অ্যাক্টিভেশন কোড পাঠানো হয়েছে!
                </h3>
                <p style={{ margin: '0 0 14px', color: '#cbd5e1', fontSize: '13px', lineHeight: 1.5 }}>
                  অভিনন্দন <strong>{signupResult.name}</strong>! আপনার ইমেইল ও ফোন নাম্বারে অ্যাক্টিভেশন কোড পাঠানো হয়েছে:
                </p>

                <div style={{ background: 'rgba(30, 41, 59, 0.9)', borderRadius: '10px', padding: '10px 12px', fontSize: '12px', color: '#93c5fd', textAlign: 'left', marginBottom: '14px', display: 'grid', gap: '4px' }}>
                  <div>📧 ইমেইল: <strong>{signupResult.email}</strong> {signupResult.emailDispatched ? '✓ Sent' : '✓ Queued'}</div>
                  <div>📱 ফোন SMS: <strong>{signupResult.phone}</strong> {signupResult.smsDispatched ? '✓ Sent' : '✓ Queued'}</div>
                </div>

                <div style={{ background: '#0b1120', border: '1px dashed #38bdf8', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '1px', marginBottom: '4px' }}>YOUR ACTIVATION CODE</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#38bdf8', letterSpacing: '3px' }}>
                    {signupResult.activationCode}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <button
                    type="button"
                    className="tv-btn secondary"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => {
                      navigator.clipboard?.writeText(signupResult.activationCode);
                      showOsd('✓ কপি হয়েছে', signupResult.activationCode);
                    }}
                  >
                    <Copy size={15} /> কোড কপি করুন
                  </button>
                  <button
                    type="button"
                    className="tv-btn primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => {
                      setAuthIdentifier(signupResult.phone);
                      setAuthActivationCode(signupResult.activationCode);
                      setSignupResult(null);
                      setAuthTab('login');
                    }}
                  >
                    <LogIn size={15} /> কোড দিয়ে লগইন
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Login / Sign Up Tab Switcher */}
                <div className="auth-tabs">
                  <button
                    type="button"
                    className={`auth-tab-btn ${authTab === 'login' ? 'active' : ''}`}
                    onClick={() => { setAuthTab('login'); setAuthError(''); }}
                  >
                    <LogIn size={15} /> লগইন (Activation Code)
                  </button>
                  <button
                    type="button"
                    className={`auth-tab-btn ${authTab === 'signup' ? 'active' : ''}`}
                    onClick={() => { setAuthTab('signup'); setAuthError(''); }}
                  >
                    <UserPlus size={15} /> সাইন আপ (Sign Up)
                  </button>
                </div>

                {authError && (
                  <div className="auth-error-banner">
                    ⚠️ {authError}
                  </div>
                )}

                {authTab === 'login' ? (
                  <form
                    onSubmit={handleAccountLogin}
                    style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}
                  >
                    <div className="auth-input-group">
                      <label>ইমেইল বা ফোন নাম্বার (Email / Phone)</label>
                      <div className="auth-input-wrap">
                        <Mail size={16} className="auth-input-icon" />
                        <input
                          type="text"
                          placeholder="example@gmail.com বা 01XXXXXXXXX"
                          value={authIdentifier}
                          onChange={e => setAuthIdentifier(e.target.value)}
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="auth-input-group">
                      <label>অ্যাক্টিভেশন কোড (Activation Code)</label>
                      <div className="auth-input-wrap">
                        <Lock size={16} className="auth-input-icon" />
                        <input
                          type="text"
                          placeholder="যেমন: SZB-8821 বা SZB-123456"
                          value={authActivationCode}
                          onChange={e => setAuthActivationCode(e.target.value.toUpperCase())}
                          style={{ textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={authSending}
                      className="tv-btn primary"
                      style={{ width: '100%', height: '44px', justifyContent: 'center', marginTop: '6px', fontSize: '14px', fontWeight: 700 }}
                    >
                      {authSending ? '⏳ ভেরিফাই করা হচ্ছে...' : '✓ অ্যাক্টিভেশন কোড দিয়ে লগইন করুন'}
                    </button>
                  </form>
                ) : (
                  <form
                    onSubmit={handleAccountSignup}
                    style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px', maxHeight: '62vh', overflowY: 'auto', paddingRight: '2px' }}
                  >
                    <div className="auth-input-group">
                      <label>পূর্ণ নাম (Full Name) *</label>
                      <div className="auth-input-wrap">
                        <User size={16} className="auth-input-icon" />
                        <input
                          type="text"
                          placeholder="যেমন: Sazib Khan"
                          value={authName}
                          onChange={e => setAuthName(e.target.value)}
                          required
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="auth-input-group">
                      <label>ইমেইল (Email Address) *</label>
                      <div className="auth-input-wrap">
                        <Mail size={16} className="auth-input-icon" />
                        <input
                          type="email"
                          placeholder="example@gmail.com"
                          value={authEmail}
                          onChange={e => setAuthEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="auth-input-group">
                      <label>ফোন নাম্বার (Phone Number) *</label>
                      <div className="auth-input-wrap">
                        <Smartphone size={16} className="auth-input-icon" />
                        <input
                          type="tel"
                          placeholder="01XXXXXXXXX"
                          value={authPhone}
                          onChange={e => setAuthPhone(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="auth-input-group">
                      <label>ঠিকানা / অ্যাড্রেস (Full Address) *</label>
                      <div className="auth-input-wrap">
                        <Home size={16} className="auth-input-icon" />
                        <input
                          type="text"
                          placeholder="যেমন: মিরপুর-১০, ঢাকা-১২১৬"
                          value={authAddress}
                          onChange={e => setAuthAddress(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="auth-input-group">
                      <label>এনআইডি কার্ড নাম্বার (NID Card Number) *</label>
                      <div className="auth-input-wrap">
                        <ShieldCheck size={16} className="auth-input-icon" />
                        <input
                          type="text"
                          placeholder="১০ থেকে ১৭ ডিজিটের NID নাম্বার"
                          value={authNid}
                          onChange={e => setAuthNid(e.target.value.replace(/[^0-9]/g, ''))}
                          maxLength={17}
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={authSending}
                      className="tv-btn primary"
                      style={{ width: '100%', height: '44px', justifyContent: 'center', marginTop: '6px', fontSize: '14px', fontWeight: 700 }}
                    >
                      {authSending ? '⏳ কোড পাঠানো হচ্ছে...' : '📩 সাইন আপ করে অ্যাক্টিভেশন কোড নিন'}
                    </button>
                  </form>
                )}

                <div className="auth-divider">
                  <span>অথবা</span>
                </div>

                <button
                  type="button"
                  className="tv-btn secondary"
                  style={{ width: '100%', height: '42px', justifyContent: 'center', gap: '10px' }}
                  onClick={() => {
                    setShowAccountModal(false);
                    setShowGoogleModal(true);
                  }}
                >
                  <GoogleGIcon size={18} />
                  <span>Google অ্যাকাউন্ট দিয়ে কানেক্ট করুন</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GOOGLE ACCOUNT AUTHENTICATION MODAL */}
      {showGoogleModal && (
        <div className="tv-modal-backdrop" onClick={() => setShowGoogleModal(false)}>
          <div className="tv-modal" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="tv-modal-head" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <GoogleGIcon size={26} />
                <h2 style={{ fontSize: '20px', margin: 0 }}>Google Play Account</h2>
              </div>
              <button className="tv-round-btn" onClick={() => setShowGoogleModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
                Google Play Store, YouTube, Netflix সহ সকল ওটিটি প্ল্যাটফর্মে সাইন ইন ও পারসিস্টেন্ট সেশন ধরে রাখতে আপনার গুগল অ্যাকাউন্ট যুক্ত করুন।
              </p>

              {googleUser ? (
                <div style={{ background: '#131d33', border: '1px solid #283963', borderRadius: '16px', padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                    <div className="tv-google-avatar" style={{ width: '44px', height: '44px', fontSize: '20px' }}>
                      {googleUser.name ? googleUser.name.charAt(0).toUpperCase() : 'G'}
                    </div>
                    <div>
                      <b style={{ color: '#fff', fontSize: '16px', display: 'block' }}>{googleUser.name}</b>
                      <small style={{ color: '#60a5fa', fontSize: '12px' }}>{googleUser.email}</small>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      className="tv-btn secondary"
                      style={{ flex: 1, color: '#ef4444' }}
                      onClick={handleGoogleLogout}
                    >
                      সাইন আউট করুন
                    </button>
                    <button
                      className="tv-btn primary"
                      style={{ flex: 1 }}
                      onClick={() => setShowGoogleModal(false)}
                    >
                      ঠিক আছে
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    className="tv-google-login-btn"
                    style={{ width: '100%', justifyContent: 'center', height: '44px', fontSize: '13.5px' }}
                    onClick={() => {
                      if (window.sazibApi?.openGoogleLogin) {
                        window.sazibApi.openGoogleLogin();
                      } else {
                        window.open('https://accounts.google.com/signin', '_blank');
                      }
                      showOsd('গুগল লগইন উইন্ডো ওপেন হয়েছে', 'ব্রাউজার উইন্ডো থেকে সাইন ইন করুন');
                    }}
                  >
                    <GoogleGIcon size={20} />
                    <span>অফিসিয়াল গুগল লগইন উইন্ডো খুলুন</span>
                  </button>

                  <div style={{ textAlign: 'center', color: '#64748b', fontSize: '11px', margin: '2px 0' }}>
                    — অথবা আপনার গুগল প্রোফাইল তথ্য দিন —
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', color: '#cbd5e1', marginBottom: '6px' }}>
                      গুগল ইমেইল (Gmail)
                    </label>
                    <input
                      style={{ width: '100%', height: '40px', background: '#0a0f1d', border: '1px solid #2b3a62', borderRadius: '10px', color: '#fff', padding: '0 12px', fontSize: '13px' }}
                      placeholder="example@gmail.com"
                      value={googleInputEmail}
                      onChange={e => setGoogleInputEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', color: '#cbd5e1', marginBottom: '6px' }}>
                      আপনার নাম
                    </label>
                    <input
                      style={{ width: '100%', height: '40px', background: '#0a0f1d', border: '1px solid #2b3a62', borderRadius: '10px', color: '#fff', padding: '0 12px', fontSize: '13px' }}
                      placeholder="Sazib"
                      value={googleInputName}
                      onChange={e => setGoogleInputName(e.target.value)}
                    />
                  </div>

                  <button
                    className="tv-btn primary"
                    style={{ width: '100%', height: '42px', marginTop: '6px' }}
                    onClick={handleSaveGoogleUser}
                  >
                    ✓ অ্যাকাউন্ট সেভ ও কানেক্ট করুন
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WIRELESS SMART MOBILE REMOTE MODAL */}
      {showMobileConnect && (
        <div className="tv-modal-backdrop" onClick={() => setShowMobileConnect(false)}>
          <div className="tv-modal tv-mobile-modal" onClick={e => e.stopPropagation()}>
            <div className="tv-modal-head">
              <div>
                <span className="tv-badge-pill neon">SAZIB TV WIRELESS REMOTE</span>
                <h2>📱 Connect Smartphone as TV Remote</h2>
              </div>
              <button className="tv-round-btn" onClick={() => setShowMobileConnect(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="mobile-connect-body">
              <div className="mobile-qr-card">
                <img
                  src={qrCodeDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=340x340&data=${encodeURIComponent(mobileInfo.url)}`}
                  alt="Scan QR Code"
                  className="mobile-qr-img"
                  onError={(e) => {
                    e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=340x340&data=${encodeURIComponent(mobileInfo.url)}`;
                  }}
                />
                <div className="mobile-qr-hint">
                  <span className="live-pill-dot"></span> Scan with Phone Camera
                </div>
              </div>

              <div className="mobile-instructions">
                <h3>সহজ ২টি ধাপে মোবাইল কানেক্ট করুন:</h3>
                <ol className="mobile-steps">
                  <li>
                    নিশ্চিত করুন আপনার মোবাইল ফোন এবং এই কম্পিউটারটি <b>একই Wi-Fi নেটওয়ার্কে</b> সংযুক্ত আছে।
                  </li>
                  <li>
                    ফোনের ক্যামেরা বা কিউআর কোড স্ক্যানার দিয়ে ওপরের <b>QR Code-টি স্ক্যান করুন</b> অথবা নিচের লিংকটি মোবাইলের ব্রাউজারে টাইপ করুন:
                  </li>
                </ol>

                <div className="mobile-url-box">
                  <code>{mobileInfo.url}</code>
                  <button className="tv-btn secondary copy-btn" onClick={copyMobileUrl}>
                    {copied ? <Check size={14} color="#4cd98b" /> : <Copy size={14} />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                <div className="mobile-feature-pills">
                  <span>🎮 Virtual D-Pad Controller</span>
                  <span>📺 Instant Channel Cast</span>
                  <span>🔊 Volume & Fullscreen</span>
                  <span>⚡ Zero Latency Wireless</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD CHANNELS & SETTINGS MODAL */}
      {showAdd && (
        <div className="tv-modal-backdrop" onClick={() => setShowAdd(false)}>
          <div className="tv-modal" onClick={e => e.stopPropagation()}>
            <div className="tv-modal-head">
              <div>
                <span className="tv-badge-pill">SAZIB TV SETTINGS • {activeCountryObj.flag} {activeCountryObj.code}</span>
                <h2>{t.settingsTitle}</h2>
              </div>
              <button className="tv-round-btn" onClick={() => setShowAdd(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Language & Country Setup Box */}
            <div className="tv-preset-box lang-country-box">
              <div className="tv-preset-title" style={{ color: '#4ade80' }}>
                <Globe2 size={15} /> 🌐 {t.langCountryTitle}
              </div>

              <div className="lang-country-grid">
                <div className="lang-country-field">
                  <label>{t.selectCountry}</label>
                  <select
                    className="lang-country-select"
                    value={appCountry}
                    onChange={(e) => {
                      const code = e.target.value;
                      setAppCountry(code);
                      try { localStorage.setItem('sazib_tv_country', code); } catch {}
                      const found = APP_COUNTRIES.find(c => c.code === code);
                      showOsd(`${found?.flag || '🌍'} দেশ পরিবর্তিত হয়েছে`, found?.name || code);
                    }}
                  >
                    {APP_COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lang-country-field">
                  <label>{t.selectLanguage}</label>
                  <div className="lang-pills-row">
                    {APP_LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        type="button"
                        className={`lang-pill-btn ${appLanguage === lang.code ? 'active' : ''}`}
                        onClick={() => {
                          setAppLanguage(lang.code);
                          try { localStorage.setItem('sazib_tv_language', lang.code); } catch {}
                          showOsd(`${lang.flag} ${lang.native}`, `${activeCountryObj.flag} ${activeCountryObj.name}`);
                        }}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.native}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Device & System Mode Selection Box */}
            <div className="tv-preset-box" style={{ background: '#111b33', borderColor: '#38bdf8' }}>
              <div className="tv-preset-title" style={{ color: '#38bdf8' }}>
                <Monitor size={15} /> ডিভাইস ও ডিসপ্লে মোড (DEVICE & SYSTEM LAYOUT)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginTop: '10px' }}>
                <button
                  className={`tv-btn secondary ${device.deviceOverride === 'auto' ? 'primary' : ''}`}
                  onClick={() => { device.updateDeviceMode('auto'); showOsd('⚡ অটো মোড সক্রিয়', `ডিটেক্টেড: ${device.detectedType.toUpperCase()}`); }}
                  style={{ fontSize: '12px', justifyContent: 'center', height: '38px', padding: '0 8px' }}
                >
                  <Sparkles size={14} /> ⚡ অটো (Auto)
                </button>
                <button
                  className={`tv-btn secondary ${device.activeDevice === 'mobile' ? 'primary' : ''}`}
                  onClick={() => { device.updateDeviceMode('mobile'); showOsd('📱 মোবাইল মোড সক্রিয়', 'স্মার্টফোন টাচ ও বটম বার লেআউট'); }}
                  style={{ fontSize: '12px', justifyContent: 'center', height: '38px', padding: '0 8px' }}
                >
                  <Smartphone size={14} /> 📱 মোবাইল
                </button>
                <button
                  className={`tv-btn secondary ${device.activeDevice === 'tablet' ? 'primary' : ''}`}
                  onClick={() => { device.updateDeviceMode('tablet'); showOsd('📲 ট্যাবলেট মোড সক্রিয়', 'আইপ্যাড ও ট্যাবলেট অপ্টিমাইজড ভিউ'); }}
                  style={{ fontSize: '12px', justifyContent: 'center', height: '38px', padding: '0 8px' }}
                >
                  <Tablet size={14} /> 📲 ট্যাবলেট
                </button>
                <button
                  className={`tv-btn secondary ${device.activeDevice === 'laptop' ? 'primary' : ''}`}
                  onClick={() => { device.updateDeviceMode('laptop'); showOsd('💻 ল্যাপটপ মোড সক্রিয়', 'মাউস ও ট্র্যাকপ্যাড অপ্টিমাইজড'); }}
                  style={{ fontSize: '12px', justifyContent: 'center', height: '38px', padding: '0 8px' }}
                >
                  <Laptop size={14} /> 💻 ল্যাপটপ
                </button>
                <button
                  className={`tv-btn secondary ${device.activeDevice === 'desktop' ? 'primary' : ''}`}
                  onClick={() => { device.updateDeviceMode('desktop'); showOsd('🖥️ পিসি মোড সক্রিয়', 'ওয়াইডস্ক্রিন ও মাল্টি-উইন্ডো মোড'); }}
                  style={{ fontSize: '12px', justifyContent: 'center', height: '38px', padding: '0 8px' }}
                >
                  <Monitor size={14} /> 🖥️ পিসি
                </button>
                <button
                  className={`tv-btn secondary ${device.activeDevice === 'tv' ? 'primary' : ''}`}
                  onClick={() => { device.updateDeviceMode('tv'); showOsd('📺 স্মার্ট টিভি মোড সক্রিয়', '১০-ফুট লিনব্যাক ও ডি-প্যাড রিমোট ভিউ'); }}
                  style={{ fontSize: '12px', justifyContent: 'center', height: '38px', padding: '0 8px' }}
                >
                  <Tv size={14} /> 📺 টিভি
                </button>
              </div>

              {/* Auto Rotate Control Row for Phones & Tablets */}
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RefreshCw size={16} color={device.autoRotate ? '#4ade80' : '#94a3b8'} />
                  <div>
                    <b style={{ fontSize: '13px', color: '#fff' }}>🔄 ফোন ও ট্যাবলেট অটো-রোটেট (Auto-Rotate)</b>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>ফোন বা ট্যাবলেট ঘোরালে ডিসপ্লে স্বয়ংক্রিয়ভাবে পোর্ট্রেট ও ল্যান্ডস্কেপ হবে</div>
                  </div>
                </div>
                <button
                  className={`tv-btn ${device.autoRotate ? 'primary' : 'secondary'}`}
                  onClick={() => {
                    const next = !device.autoRotate;
                    device.toggleAutoRotate();
                    showOsd(
                      next ? '🔄 অটো রোটেট চালু' : '🔒 অটো রোটেট বন্ধ',
                      next ? 'ফোন বা ট্যাবলেট ঘোরালে স্ক্রিন স্বয়ংক্রিয় রোটেট হবে' : 'স্ক্রিন রোটেশন লক করা হয়েছে'
                    );
                  }}
                  style={{ fontSize: '12px', height: '34px', padding: '0 14px' }}
                >
                  {device.autoRotate ? 'চালু (ON) ✓' : 'বন্ধ (OFF)'}
                </button>
              </div>
            </div>

            {/* Quick 1-Click Online Presets */}
            <div className="tv-preset-box">
              <div className="tv-preset-title">
                <Sparkles size={15} /> 1-CLICK POPULAR TV PRESETS
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  className="tv-btn secondary"
                  disabled={busy}
                  onClick={() => setChannels(DEFAULT_CHANNELS)}
                >
                  📺 Reload 170+ Curated BD & Indian TV
                </button>
                <button
                  className="tv-btn secondary"
                  onClick={() => setShowMobileConnect(true)}
                >
                  📱 Mobile Remote Setup
                </button>
              </div>
            </div>

            {/* M3U URL / File Upload */}
            <div className="tv-form-section">
              <h3><Link2 size={16} /> Import M3U / M3U8 Playlist URL</h3>
              <p>Enter any public or private IPTV M3U URL from your provider.</p>
              <div className="tv-input-row">
                <input
                  value={playlistUrl}
                  onChange={e => setPlaylistUrl(e.target.value)}
                  placeholder="https://example.com/playlist.m3u8"
                />
                <button className="tv-btn primary" disabled={busy} onClick={() => {}}>
                  {busy ? 'Loading...' : 'Load Playlist'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="mobile-bottom-nav">
        <button
          className={`mob-nav-item ${!active && !activeCategoryRail && !showPlayStoreHub && !showAdd && !showMobileConnect ? 'active' : ''}`}
          onClick={homeSpatial}
        >
          <Home size={20} />
          <span>{t.home}</span>
        </button>
        <button
          className={`mob-nav-item ${active || activeCategoryRail === 'rail-bd' ? 'active' : ''}`}
          onClick={() => {
            if (active) {
              setShowQuickDrawer(true);
            } else {
              setActiveCategoryRail('rail-bd');
              window.scrollTo({ top: 0, behavior: 'smooth' });
              showOsd('📺 সরাসরি লাইভ টিভি', 'সব চ্যানেল গ্রিড লেআউটে দেখানো হচ্ছে');
            }
          }}
        >
          <Tv size={20} />
          <span>{t.tv}</span>
        </button>
        <button
          className={`mob-nav-item ${showPlayStoreHub || activeOtt || activeCategoryRail === 'rail-widgets' ? 'active' : ''}`}
          onClick={() => {
            setActiveCategoryRail('rail-widgets');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showOsd('🎬 ওটিটি ও অ্যাপস', 'সব ওটিটি প্ল্যাটফর্ম গ্রিড লেআউটে দেখানো হচ্ছে');
          }}
        >
          <Grid size={20} />
          <span>{t.ott}</span>
        </button>
        <button
          className={`mob-nav-item ${showMobileConnect ? 'active' : ''}`}
          onClick={() => setShowMobileConnect(true)}
        >
          <Smartphone size={20} />
          <span>{t.remote}</span>
        </button>
        <button
          className={`mob-nav-item ${showAdd ? 'active' : ''}`}
          onClick={() => setShowAdd(true)}
        >
          <Settings size={20} />
          <span>{t.settings}</span>
        </button>
      </nav>

      {/* VIRTUAL AIR MOUSE CURSOR */}
      {virtualCursor.visible && (
        <div
          className={`tv-virtual-air-mouse ${virtualCursor.isClicking ? 'clicking' : ''}`}
          style={{ left: `${virtualCursor.x}px`, top: `${virtualCursor.y}px` }}
        >
          <div className="air-mouse-pointer">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#3b82f6" stroke="#ffffff" strokeWidth="2">
              <path d="M3 3l7 18 3-7 7-3L3 3z" />
            </svg>
          </div>
          {virtualCursor.isClicking && <div className="air-mouse-ripple"></div>}
        </div>
      )}
    </div>
  );
}

// LEANBACK LEFT RAIL BUTTON COMPONENT
function LeanbackRailButton({
  id,
  label,
  icon,
  badge,
  iconClass,
  isFocused,
  onFocus,
  onClick
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  iconClass: string;
  isFocused: boolean;
  onFocus: () => void;
  onClick: () => void;
}) {
  return (
    <button
      id={id}
      type="button"
      className={`row-rail-btn ${isFocused ? 'focused' : ''}`}
      onMouseEnter={onFocus}
      onClick={onClick}
      title={`${label} - Click to navigate or browse`}
    >
      <div className={`rail-icon ${iconClass}`}>
        {icon}
      </div>
      <span className="rail-label">{label}</span>
      {badge && <span className="rail-badge">{badge}</span>}
    </button>
  );
}

// LEANBACK APP CARD COMPONENT (Matches Netflix focus & Chorki, Toffee, etc.)
function LeanbackAppCard({
  app,
  isFocused,
  onFocus,
  onClick
}: {
  app: TVApp;
  isFocused: boolean;
  onFocus: () => void;
  onClick: () => void;
}) {
  return (
    <div
      id={app.id}
      className={`leanback-app-wrapper ${isFocused ? 'focused' : ''}`}
      onMouseEnter={onFocus}
      onClick={onClick}
    >
      <div
        className="leanback-app-card"
        style={{
          background: app.bgColor || '#141d33',
          color: app.textColor || '#ffffff'
        }}
      >
        {app.id === 'app-playstore' ? (
          <div className="playstore-content">
            <PlayStoreIcon size={34} />
            <div className="playstore-text">
              <b>Google Play</b>
              <small>STORE</small>
            </div>
          </div>
        ) : app.id === 'app-netflix' ? (
          <div className="netflix-text">NETFLIX</div>
        ) : app.id === 'app-chorki' ? (
          <div className="chorki-text">
            <span>CH</span>
            <span className="chorki-play">▶</span>
            <span>RKI</span>
          </div>
        ) : app.id === 'app-toffee' ? (
          <div className="toffee-content">
            <span className="toffee-wing">🪽</span>
            <span className="toffee-text">TOFFEE</span>
          </div>
        ) : app.id === 'app-fastcast' ? (
          <div className="fastcast-content">
            <Cast size={24} />
            <span>FastCast</span>
          </div>
        ) : app.id === 'app-player' ? (
          <div className="player-app-content">
            <div className="play-triangle">▶</div>
            <span>Player</span>
          </div>
        ) : app.id === 'app-prime' ? (
          <div className="prime-text">prime video</div>
        ) : app.id === 'app-youtube' ? (
          <div className="youtube-content">
            <span className="yt-badge">▶</span>
            <span className="yt-text">YouTube</span>
          </div>
        ) : app.id === 'app-disney' ? (
          <div className="disney-content">
            <span className="disney-text">Disney+</span>
            <span className="hotstar-text">hotstar</span>
          </div>
        ) : app.id === 'app-sonyliv' ? (
          <div className="sonyliv-content">
            <span className="sony-title">SONY</span>
            <span className="liv-pill">LIV</span>
          </div>
        ) : app.id === 'app-crunchyroll' ? (
          <div className="crunchyroll-content">
            <span className="cr-spiral">🌀</span>
            <span className="cr-name">crunchyroll</span>
          </div>
        ) : app.id === 'app-appletv' ? (
          <div className="appletv-content">
            <span className="apple-logo-txt">tv+</span>
          </div>
        ) : app.id === 'app-spotify' ? (
          <div className="spotify-content">
            <div className="spotify-bubble"><Music size={22} color="#1db954" /></div>
            <span className="spotify-text">Spotify</span>
          </div>
        ) : app.id === 'app-hoichoi' ? (
          <div className="hoichoi-content">
            <span className="hoichoi-text">hoi!choi</span>
          </div>
        ) : app.id === 'app-bongo' ? (
          <div className="bongo-content">
            <span className="bongo-circle">B</span>
            <span className="bongo-text">BONGO</span>
          </div>
        ) : app.id === 'app-bioscope' ? (
          <div className="bioscope-content">
            <Tv size={24} color="#00a8ff" />
            <span className="bioscope-text">bioscope</span>
          </div>
        ) : app.id === 'app-zee5' ? (
          <div className="zee5-content">
            <span className="zee5-box">ZEE5</span>
          </div>
        ) : app.id === 'app-iscreen' ? (
          <div className="iscreen-content">
            <span className="iscreen-i">i</span>
            <span className="iscreen-text">Screen</span>
          </div>
        ) : app.id === 'app-tvweb' ? (
          <div className="tvweb-content">
            <Globe2 size={24} color="#0284c7" />
            <div>
              <b>TVWeb</b>
              <small>Browser for TV</small>
            </div>
          </div>
        ) : app.id === 'app-accuweather' ? (
          <div className="accu-content">
            <div className="sun-icon">☀️</div>
            <div>
              <b>AccuWeather</b>
              <small>SUPERIOR ACCURACY</small>
            </div>
          </div>
        ) : app.id === 'app-tsports' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 900, fontSize: '18px', letterSpacing: '1px' }}>
            <Trophy size={20} color="#ffffff" />
            <span style={{ color: '#ffffff' }}>T SPORTS</span>
          </div>
        ) : app.id === 'app-vlc' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '18px' }}>
            <span style={{ fontSize: '24px' }}>🟠</span>
            <span>VLC</span>
          </div>
        ) : app.id === 'app-mxplayer' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 900, fontSize: '16px' }}>
            <Play size={18} fill="#ffffff" />
            <span>MX PLAYER</span>
          </div>
        ) : app.id === 'app-kodi' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 900, fontSize: '19px', letterSpacing: '2px' }}>
            <span>KODI</span>
          </div>
        ) : app.id === 'app-jiocinema' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 900, fontSize: '17px' }}>
            <span style={{ color: '#ec4899' }}>Jio</span>
            <span>Cinema</span>
          </div>
        ) : app.id === 'app-ytmusic' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '16px' }}>
            <Music size={18} color="#ff0000" />
            <span>Music</span>
          </div>
        ) : (
          <div className="app-generic">
            {app.logo ? (
              <img src={app.logo} alt="" style={{ width: '28px', height: '28px', objectFit: 'contain' }} onError={e => (e.currentTarget.style.display = 'none')} />
            ) : (
              <Play size={20} />
            )}
            <b>{app.name}</b>
          </div>
        )}
      </div>

      {/* Android TV signature focus label underneath */}
      <span className="app-focus-label">{app.name}</span>
    </div>
  );
}

// LEANBACK CHANNEL CARD COMPONENT (Matches the Blue & Gradient "TV" Cards in User's Screenshot)
function LeanbackChannelCard({
  channel,
  isFocused,
  isFav,
  onPlay,
  onFocus,
  onFav,
  onDelete
}: {
  channel: Channel;
  isFocused: boolean;
  isFav: boolean;
  onPlay: () => void;
  onFocus: () => void;
  onFav: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      id={channel.id}
      className={`leanback-channel-wrapper ${isFocused ? 'focused' : ''}`}
      onMouseEnter={onFocus}
      onClick={onPlay}
    >
      <div className="leanback-channel-card">
        {/* Authentic Channel Logo or Android TV Screen Symbol */}
        {channel.logo ? (
          <img
            src={channel.logo}
            alt={channel.name}
            className="channel-img-logo"
            onError={e => {
              e.currentTarget.style.display = 'none';
              const next = e.currentTarget.nextElementSibling as HTMLElement;
              if (next) next.style.display = 'flex';
            }}
          />
        ) : null}

        {/* Fallback TV icon with modern gradient */}
        <div className="channel-tv-fallback" style={{ display: channel.logo ? 'none' : 'flex' }}>
          <div className="tv-screen-box">
            <span>TV</span>
          </div>
        </div>

        {/* Live Broadcast Badge */}
        <span className="leanback-live-pill">LIVE</span>

        {/* Quick Favorite Star Button */}
        <button
          className={`card-fav-star ${isFav ? 'starred' : ''}`}
          onClick={e => { e.stopPropagation(); onFav(); }}
          title={isFav ? 'Unfavorite' : 'Favorite'}
        >
          <Star size={14} fill={isFav ? '#ffb703' : 'none'} color={isFav ? '#ffb703' : '#ffffff'} />
        </button>
      </div>

      {/* Focus Label Underneath */}
      <span className="channel-focus-label" title={channel.name}>
        {channel.name}
      </span>
    </div>
  );
}
