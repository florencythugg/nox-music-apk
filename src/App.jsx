import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Home,
  Search,
  Library,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ListMusic,
  Plus,
  Upload,
  Check,
  Sparkles,
  Disc3,
  Music2,
  X,
  Info,
  Wifi,
  Flame,
  Calendar,
  UserCheck,
  UserPlus,
  Users
} from 'lucide-react';

// --- АВТОНОМНЫЙ ОРИГИНАЛЬНЫЙ ЭФИР NOX (Web Audio API) ---
const NOX_ORIGINAL_TRACKS = [
  {
    id: 'nox-orig-1',
    title: 'Neon Horizon',
    artist: 'Nox Sound Lab',
    rawArtistId: null,
    album: 'Midnight Sessions Vol. 1',
    releaseDate: '2025-02-14T00:00:00Z',
    duration: 214,
    genre: 'Ambient Synthwave',
    coverGradient: 'from-indigo-600 via-purple-700 to-slate-900',
    artworkUrl: null,
    source: 'synth',
    tempo: 96,
    chords: [
      [220.0, 261.63, 329.63, 392.0],
      [174.61, 220.0, 261.63, 349.23],
      [196.0, 246.94, 293.66, 392.0],
      [164.81, 196.0, 246.94, 329.63]
    ]
  },
  {
    id: 'nox-orig-2',
    title: 'Deep Focus Pulse',
    artist: 'Aether & Nox',
    rawArtistId: null,
    album: 'Flow State',
    releaseDate: '2024-11-08T00:00:00Z',
    duration: 198,
    genre: 'Lo-Fi Chill',
    coverGradient: 'from-emerald-600 via-teal-800 to-zinc-950',
    artworkUrl: null,
    source: 'synth',
    tempo: 82,
    chords: [
      [196.0, 246.94, 293.66, 369.99],
      [164.81, 196.0, 246.94, 329.63],
      [146.83, 174.61, 220.0, 261.63],
      [196.0, 246.94, 293.66, 349.23]
    ]
  },
  {
    id: 'nox-orig-3',
    title: 'Velvet Rain',
    artist: 'Nox Acoustic',
    rawArtistId: null,
    album: 'Nocturne EP',
    releaseDate: '2024-06-21T00:00:00Z',
    duration: 242,
    genre: 'Downtempo',
    coverGradient: 'from-rose-600 via-fuchsia-800 to-neutral-950',
    artworkUrl: null,
    source: 'synth',
    tempo: 74,
    chords: [
      [261.63, 329.63, 392.0, 493.88],
      [220.0, 261.63, 329.63, 392.0],
      [174.61, 220.0, 261.63, 329.63],
      [196.0, 246.94, 293.66, 392.0]
    ]
  },
  {
    id: 'nox-orig-4',
    title: 'Midnight Autobahn',
    artist: 'Klangwerk',
    rawArtistId: null,
    album: 'Berlin 03:00',
    releaseDate: '2023-09-15T00:00:00Z',
    duration: 265,
    genre: 'Minimal Electronic',
    coverGradient: 'from-blue-600 via-cyan-800 to-slate-950',
    artworkUrl: null,
    source: 'synth',
    tempo: 112,
    chords: [
      [146.83, 220.0, 261.63, 329.63],
      [130.81, 196.0, 246.94, 293.66],
      [110.0, 164.81, 196.0, 261.63],
      [130.81, 196.0, 246.94, 329.63]
    ]
  }
];

const CURATED_MOODS = [
  {
    id: 'mood-energy',
    title: 'Энергия дня',
    subtitle: 'Бодрые хиты и поп-новинки',
    query: 'The Weeknd',
    gradient: 'from-amber-500/30 via-orange-600/20 to-zinc-900 border-amber-500/30'
  },
  {
    id: 'mood-ru',
    title: 'Русский вайб',
    subtitle: 'Главные треки чартов',
    query: 'Miyagi & Эндшпиль',
    gradient: 'from-indigo-500/30 via-violet-600/20 to-zinc-900 border-indigo-500/30'
  },
  {
    id: 'mood-night',
    title: 'Ночной драйв',
    subtitle: 'Атмосферный хип-хоп и R&B',
    query: 'Travis Scott',
    gradient: 'from-cyan-500/30 via-blue-600/20 to-zinc-900 border-cyan-500/30'
  },
  {
    id: 'mood-chill',
    title: 'Вечерний чилл',
    subtitle: 'Мягкое звучание для отдыха',
    query: 'Lana Del Rey',
    gradient: 'from-rose-500/30 via-pink-600/20 to-zinc-900 border-rose-500/30'
  }
];

const GENRE_FILTERS = [
  { id: 'all', label: 'Всё' },
  { id: 'Hip-Hop/Rap', label: 'Хип-хоп' },
  { id: 'Pop', label: 'Поп' },
  { id: 'Electronic', label: 'Электроника' },
  { id: 'Rock', label: 'Рок' },
  { id: 'R&B/Soul', label: 'R&B' }
];

// --- УНИВЕРСАЛЬНЫЙ HTTP-КЛИЕНТ (НАТИВНЫЙ CAPACITOR БЕЗ CORS В APK + ОБЫЧНЫЙ FETCH В БРАУЗЕРЕ) ---
const isNativeCapacitor = () =>
  typeof window !== 'undefined' &&
  Boolean(window.Capacitor?.isNativePlatform?.() || window.Capacitor?.Plugins?.CapacitorHttp);

async function nativeGetJson(url, params = {}, headers = {}) {
  const queryStr = new URLSearchParams(params).toString();
  const fullUrl = queryStr ? `${url}${url.includes('?') ? '&' : '?'}${queryStr}` : url;

  const capHttp = typeof window !== 'undefined' ? window.Capacitor?.Plugins?.CapacitorHttp : null;
  if (capHttp && typeof capHttp.get === 'function') {
    const res = await capHttp.get({
      url: fullUrl,
      headers: {
        Accept: 'application/json',
        ...headers
      }
    });
    if (res.status >= 200 && res.status < 300) {
      return typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
    }
    throw new Error(`HTTP ${res.status}`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(fullUrl, { headers, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function nativePostJson(url, body = {}, headers = {}) {
  const capHttp = typeof window !== 'undefined' ? window.Capacitor?.Plugins?.CapacitorHttp : null;
  if (capHttp && typeof capHttp.post === 'function') {
    const res = await capHttp.post({
      url,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...headers
      },
      data: body
    });
    if (res.status >= 200 && res.status < 300) {
      return typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
    }
    throw new Error(`HTTP ${res.status}`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// --- ПОИСК ПОЛНОГО ТРЕКА НАПРЯМУЮ С ТЕЛЕФОНА (YOUTUBE INNERTUBE + AUDIUS) ---
const normalizeText = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\s*[\(\[].*?[\)\]]/g, '')
    .replace(/[^a-zа-я0-9\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const isStrictSongMatch = (candTitle, candArtist, targetArtist, targetTitle) => {
  const hay = `${normalizeText(candTitle)} ${normalizeText(candArtist)}`;
  const nt = normalizeText(targetTitle);
  const na = normalizeText(targetArtist);
  if (!nt) return false;

  const banned = ['karaoke', 'караоке', 'cover', 'кавер', 'instrumental', 'минус', 'slowed', 'nightcore', '8d', 'reaction', 'реакция'];
  for (const b of banned) {
    if (hay.includes(b) && !nt.includes(b)) return false;
  }

  const tWords = nt.split(' ').filter((w) => w.length >= 2);
  if (tWords.length > 0) {
    const hits = tWords.filter((w) => hay.includes(w)).length;
    if (hits / tWords.length < 0.7) return false;
  } else if (!hay.includes(nt)) {
    return false;
  }

  if (na) {
    const aWords = na.split(' ').filter((w) => w.length >= 2);
    if (aWords.length > 0 && !aWords.some((w) => hay.includes(w))) return false;
  }
  return true;
};

function extractVideoIdsFromYtSearch(data, artist, title) {
  const ids = [];
  const seen = new Set();

  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (node.videoRenderer && node.videoRenderer.videoId) {
      const vid = node.videoRenderer.videoId;
      const vTitle = node.videoRenderer.title?.runs?.map((r) => r.text).join('') || '';
      const vAuthor = node.videoRenderer.ownerText?.runs?.map((r) => r.text).join('') || '';
      if (!seen.has(vid) && isStrictSongMatch(vTitle, vAuthor, artist, title)) {
        seen.add(vid);
        ids.push(vid);
      }
    }
    if (node.musicResponsiveListItemRenderer) {
      const flex = node.musicResponsiveListItemRenderer.flexColumns || [];
      const vTitle = flex[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.map((r) => r.text).join('') || '';
      const vAuthor = flex[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.map((r) => r.text).join('') || '';
      const vid =
        node.musicResponsiveListItemRenderer.playlistItemData?.videoId ||
        node.musicResponsiveListItemRenderer.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint?.videoId;
      if (vid && !seen.has(vid) && isStrictSongMatch(vTitle, vAuthor, artist, title)) {
        seen.add(vid);
        ids.push(vid);
      }
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
    } else {
      Object.values(node).forEach(walk);
    }
  };

  walk(data);
  return ids.slice(0, 5);
}

async function resolveYtPlayerAudio(videoId) {
  const clients = [
    {
      endpoint: 'https://music.youtube.com/youtubei/v1/player?prettyPrint=false',
      userAgent: 'com.google.android.apps.youtube.music/6.42.52 (Linux; U; Android 14; en_US) gzip',
      context: {
        client: {
          clientName: 'ANDROID_MUSIC',
          clientVersion: '6.42.52',
          androidSdkVersion: 34,
          hl: 'ru',
          gl: 'RU'
        }
      }
    },
    {
      endpoint: 'https://www.youtube.com/youtubei/v1/player?prettyPrint=false',
      userAgent: 'com.google.ios.youtube/19.29.1 (iPhone16,2; U; CPU iOS 17_5_1 like Mac OS X)',
      context: {
        client: {
          clientName: 'IOS',
          clientVersion: '19.29.1',
          deviceModel: 'iPhone16,2',
          hl: 'ru',
          gl: 'RU'
        }
      }
    },
    {
      endpoint: 'https://www.youtube.com/youtubei/v1/player?prettyPrint=false',
      userAgent: 'com.google.android.youtube/19.29.37 (Linux; U; Android 14; en_US) gzip',
      context: {
        client: {
          clientName: 'ANDROID',
          clientVersion: '19.29.37',
          androidSdkVersion: 34,
          hl: 'ru',
          gl: 'RU'
        }
      }
    }
  ];

  for (const cfg of clients) {
    try {
      const playerRes = await nativePostJson(
        cfg.endpoint,
        {
          context: cfg.context,
          videoId,
          contentCheckOk: true,
          racyCheckOk: true
        },
        {
          'User-Agent': cfg.userAgent,
          'X-YouTube-Client-Name': cfg.context.client.clientName === 'ANDROID_MUSIC' ? '21' : cfg.context.client.clientName === 'IOS' ? '5' : '3',
          'X-YouTube-Client-Version': cfg.context.client.clientVersion
        }
      );

      const formats = [
        ...(playerRes?.streamingData?.adaptiveFormats || []),
        ...(playerRes?.streamingData?.formats || [])
      ];

      // Выбираем прямой аудиопоток без шифрования signatureCipher (itag 140 m4a или webm audio)
      const audioFormats = formats.filter(
        (f) =>
          f.url &&
          !f.url.includes('.m3u8') &&
          String(f.mimeType || '').startsWith('audio/')
      );

      if (audioFormats.length > 0) {
        // Предпочитаем audio/mp4 (m4a / AAC), который идеально играет в Android WebView <audio>
        audioFormats.sort((a, b) => {
          const aMp4 = String(a.mimeType).includes('audio/mp4') ? 1 : 0;
          const bMp4 = String(b.mimeType).includes('audio/mp4') ? 1 : 0;
          if (aMp4 !== bMp4) return bMp4 - aMp4;
          return (b.bitrate || 0) - (a.bitrate || 0);
        });
        return audioFormats[0].url;
      }
    } catch {}
  }

  return null;
}

async function resolveFullAudioDirect(artist, title) {
  const q = `${artist} - ${title}`.replace(/^[\s-]+|[\s-]+$/g, '');

  // Канал 1: Прямой поиск через мобильный YouTube Music InnerTube API (с IP телефона без CORS!)
  try {
    const ytMusicSearch = await nativePostJson(
      'https://music.youtube.com/youtubei/v1/search?prettyPrint=false',
      {
        context: {
          client: {
            clientName: 'WEB_REMIX',
            clientVersion: '1.20240724.01.00',
            hl: 'ru',
            gl: 'RU'
          }
        },
        query: q,
        params: 'EgWKAQIIAWoKEAMQBBAJEAoQBQ%3D%3D'
      },
      {
        Origin: 'https://music.youtube.com',
        Referer: 'https://music.youtube.com/'
      }
    );

    const musicIds = extractVideoIdsFromYtSearch(ytMusicSearch, artist, title);
    for (const vid of musicIds) {
      const directUrl = await resolveYtPlayerAudio(vid);
      if (directUrl) {
        return { url: directUrl, label: 'YT Music Full' };
      }
    }
  } catch {}

  // Канал 2: Обычный поиск YouTube InnerTube API
  try {
    const ytWebSearch = await nativePostJson(
      'https://www.youtube.com/youtubei/v1/search?prettyPrint=false',
      {
        context: {
          client: {
            clientName: 'WEB',
            clientVersion: '2.20240725.01.00',
            hl: 'ru',
            gl: 'RU'
          }
        },
        query: `${q} official audio`
      }
    );

    const webIds = extractVideoIdsFromYtSearch(ytWebSearch, artist, title);
    for (const vid of webIds) {
      const directUrl = await resolveYtPlayerAudio(vid);
      if (directUrl) {
        return { url: directUrl, label: 'YouTube Full' };
      }
    }
  } catch {}

  // Канал 3: Audius Open Stream (резерв)
  try {
    const au = await nativeGetJson('https://discoveryprovider.audius.co/v1/tracks/search', {
      query: `${artist} ${title}`.trim(),
      limit: '5'
    });
    for (const item of au?.data || []) {
      const tName = item.title || '';
      const uName = item.user?.name || '';
      if (isStrictSongMatch(tName, uName, artist, title) && item.id) {
        return {
          url: `https://discoveryprovider.audius.co/v1/tracks/${item.id}/stream`,
          label: 'Full Stream'
        };
      }
    }
  } catch {}

  return null;
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const formatPlays = (num) => {
  if (!num) return '1.2M';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${Math.floor(num / 1000)}K`;
  return num.toString();
};

const extractYear = (dateStr) => {
  if (!dateStr) return 2024;
  const parsed = new Date(dateStr).getFullYear();
  return isNaN(parsed) ? 2024 : parsed;
};

const normalizeName = (str) =>
  (str || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9\s&,-]/gi, '')
    .trim();

const matchesArtistStrict = (trackArtist, targetArtist) => {
  const target = normalizeName(targetArtist);
  const candidate = normalizeName(trackArtist);
  if (!target || !candidate) return false;
  if (candidate === target) return true;
  const parts = candidate.split(/\s*(?:,|&|\bfeat\.?\b|\bft\.?\b|\bx\b|\bи\b)\s*/i).map((p) => p.trim());
  return parts.includes(target);
};

// Вынесенный компонент обложки (без мерцания при работе эквалайзера)
const TrackArtwork = React.memo(({ track, size = 'md', isActive = false, isPlaying = false }) => {
  const sizeClasses = {
    sm: 'w-11 h-11 rounded-xl',
    md: 'w-12 h-12 rounded-xl',
    lg: 'w-64 h-64 sm:w-72 sm:h-72 rounded-3xl shadow-2xl'
  }[size];

  return (
    <div
      className={`relative overflow-hidden flex-shrink-0 bg-gradient-to-br ${
        track?.coverGradient || 'from-indigo-600 to-zinc-900'
      } ${sizeClasses} flex items-center justify-center border border-white/10`}
    >
      {track?.artworkUrl ? (
        <img
          src={track.artworkUrl}
          alt={track.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <Music2 className={size === 'lg' ? 'w-20 h-20 text-white/40' : 'w-5 h-5 text-white/70'} />
      )}
      {isActive && isPlaying && size !== 'lg' && (
        <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] flex items-center justify-center gap-0.5">
          <span className="w-1 h-3 bg-indigo-400 rounded-full animate-pulse" />
          <span className="w-1 h-5 bg-white rounded-full animate-bounce" />
          <span className="w-1 h-2.5 bg-indigo-400 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
});

const TrackRow = React.memo(({
  track,
  contextList,
  rank = null,
  isCurrent,
  isPlaying,
  isLiked,
  onPlay,
  onOpenArtist,
  onToggleLike,
  onOpenPlaylistModal
}) => (
  <div
    onClick={() => onPlay(track, contextList)}
    className={`group flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer ${
      isCurrent
        ? 'bg-white/10 border border-indigo-500/30'
        : 'hover:bg-white/[0.06] border border-transparent'
    }`}
  >
    <div className="flex items-center gap-3 min-w-0 flex-1">
      {rank !== null && (
        <span
          className={`w-5 text-center text-xs font-bold flex-shrink-0 ${
            rank <= 3 ? 'text-amber-400' : 'text-zinc-500'
          }`}
        >
          #{rank}
        </span>
      )}
      <TrackArtwork track={track} size="md" isActive={isCurrent} isPlaying={isPlaying} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p
            className={`text-sm font-semibold truncate ${
              isCurrent ? 'text-indigo-400' : 'text-zinc-100'
            }`}
          >
            {track.title}
          </p>
          {track.explicit && (
            <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 font-bold flex-shrink-0">
              E
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenArtist(track.artist, track.rawArtistId);
            }}
            className="text-xs text-zinc-400 hover:text-indigo-300 hover:underline truncate text-left"
          >
            {track.artist}
          </button>
          {rank !== null && (
            <span className="text-[11px] text-zinc-500 flex-shrink-0">
              • {formatPlays(track.plays)}
            </span>
          )}
        </div>
      </div>
    </div>

    <div className="flex items-center gap-1.5 ml-2">
      <button
        type="button"
        onClick={(e) => onToggleLike(track.id, e)}
        className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition"
        title="В избранное"
      >
        <Heart className={`w-4 h-4 ${isLiked ? 'fill-indigo-500 text-indigo-500' : ''}`} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpenPlaylistModal(track);
        }}
        className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition"
        title="Добавить в плейлист"
      >
        <ListMusic className="w-4 h-4" />
      </button>
    </div>
  </div>
));

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [viewStack, setViewStack] = useState([]);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);

  const [catalogTracks, setCatalogTracks] = useState([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('all');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchArtists, setSearchArtists] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [artistTopTracks, setArtistTopTracks] = useState([]);
  const [artistAlbums, setArtistAlbums] = useState([]);
  const [artistBannerImg, setArtistBannerImg] = useState(null);
  const [isArtistLoading, setIsArtistLoading] = useState(false);
  const [followedArtists, setFollowedArtists] = useState(() => {
    try {
      const saved = localStorage.getItem('nox_followed_artists');
      return saved ? JSON.parse(saved) : ['The Weeknd', 'Miyagi & Эндшпиль'];
    } catch {
      return ['The Weeknd', 'Miyagi & Эндшпиль'];
    }
  });

  const [albumTracks, setAlbumTracks] = useState([]);
  const [isAlbumLoading, setIsAlbumLoading] = useState(false);

  const [likedIds, setLikedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('nox_likes');
      return saved ? JSON.parse(saved) : ['nox-orig-1'];
    } catch {
      return ['nox-orig-1'];
    }
  });

  const [playlists, setPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem('nox_playlists');
      return saved
        ? JSON.parse(saved)
        : [
            { id: 'pl-1', name: 'Ночной вайб', trackIds: ['nox-orig-1', 'nox-orig-3'] },
            { id: 'pl-2', name: 'В дорогу', trackIds: ['nox-orig-2', 'nox-orig-4'] }
          ];
    } catch {
      return [{ id: 'pl-1', name: 'Ночной вайб', trackIds: ['nox-orig-1', 'nox-orig-3'] }];
    }
  });

  const [localTracks, setLocalTracks] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [trackForPlaylistModal, setTrackForPlaylistModal] = useState(null);
  const [infoTrack, setInfoTrack] = useState(null);

  const [queue, setQueue] = useState(NOX_ORIGINAL_TRACKS);
  const [currentTrack, setCurrentTrack] = useState(NOX_ORIGINAL_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(NOX_ORIGINAL_TRACKS[0].duration);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('all');
  const [activeStreamLabel, setActiveStreamLabel] = useState(
    isNativeCapacitor() ? 'Android Full HQ' : 'Web / APK Ready'
  );
  const [customServerUrl, setCustomServerUrl] = useState(() => {
    try {
      return localStorage.getItem('nox_custom_server') || '';
    } catch {
      return '';
    }
  });
  const [serverInput, setServerInput] = useState(customServerUrl);
  const [showServerModal, setShowServerModal] = useState(false);

  const [visualizerBars, setVisualizerBars] = useState(() => Array(22).fill(18));

  const htmlAudioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const synthTimerRef = useRef(null);
  const synthStepRef = useRef(0);
  const synthProgressTimerRef = useRef(null);
  const fileInputRef = useRef(null);
  const playRequestIdRef = useRef(0);
  const fullStreamCacheRef = useRef(new Map());

  useEffect(() => {
    try {
      localStorage.setItem('nox_likes', JSON.stringify(likedIds));
    } catch {}
  }, [likedIds]);

  useEffect(() => {
    try {
      localStorage.setItem('nox_playlists', JSON.stringify(playlists));
    } catch {}
  }, [playlists]);

  useEffect(() => {
    try {
      localStorage.setItem('nox_followed_artists', JSON.stringify(followedArtists));
    } catch {}
  }, [followedArtists]);

  const mapItunesSong = useCallback((item, rankIndex = 0) => {
    const highResArtwork = item.artworkUrl100
      ? item.artworkUrl100.replace('100x100bb', '600x600bb')
      : null;

    const popularitySeed = Math.max(1.2, (28 - rankIndex) * 1.4);
    const estimatedPlays = Math.round(popularitySeed * 1000000);

    return {
      id: `itunes-${item.trackId}`,
      rawTrackId: item.trackId,
      rawArtistId: item.artistId || null,
      rawCollectionId: item.collectionId || null,
      title: item.trackName || 'Без названия',
      artist: item.artistName || 'Неизвестный артист',
      album: item.collectionName || 'Сингл',
      releaseDate: item.releaseDate || '2023-01-01T00:00:00Z',
      duration: item.trackTimeMillis ? Math.round(item.trackTimeMillis / 1000) : 180,
      genre: item.primaryGenreName || 'Pop',
      artworkUrl: highResArtwork,
      previewUrl: item.previewUrl || null,
      explicit: item.trackExplicitness === 'explicit',
      plays: estimatedPlays,
      source: 'catalog',
      coverGradient: 'from-indigo-600 via-purple-700 to-zinc-900'
    };
  }, []);

  const mapItunesAlbum = useCallback((item) => {
    const highResArtwork = item.artworkUrl100
      ? item.artworkUrl100.replace('100x100bb', '600x600bb')
      : null;
    const isSingle =
      (item.collectionType === 'Single' || (item.trackCount && item.trackCount <= 3)) &&
      !(item.collectionName || '').toLowerCase().includes('album');

    return {
      id: `album-${item.collectionId}`,
      rawCollectionId: item.collectionId,
      rawArtistId: item.artistId || null,
      title: item.collectionName || 'Релиз',
      artist: item.artistName || 'Исполнитель',
      artworkUrl: highResArtwork,
      releaseDate: item.releaseDate || '2022-01-01T00:00:00Z',
      year: extractYear(item.releaseDate),
      trackCount: item.trackCount || 1,
      genre: item.primaryGenreName || 'Music',
      releaseType: isSingle ? 'Сингл' : 'Альбом'
    };
  }, []);

  const fetchCatalogByQuery = useCallback(
    async (queryTerm = 'hits 2025', limit = 25) => {
      setIsCatalogLoading(true);
      try {
        const data = await nativeGetJson('https://itunes.apple.com/search', {
          term: queryTerm,
          media: 'music',
          entity: 'song',
          country: 'RU',
          limit: String(limit)
        });
        let results = (data?.results || []).filter((r) => r.previewUrl);

        if (results.length < 6) {
          const fallbackData = await nativeGetJson('https://itunes.apple.com/search', {
            term: queryTerm,
            media: 'music',
            entity: 'song',
            country: 'US',
            limit: String(limit)
          });
          const usResults = (fallbackData?.results || []).filter((r) => r.previewUrl);
          results = [...results, ...usResults];
        }

        const seen = new Set();
        const mapped = [];
        results.forEach((item, idx) => {
          if (!seen.has(item.trackId)) {
            seen.add(item.trackId);
            mapped.push(mapItunesSong(item, idx));
          }
        });

        setCatalogTracks(mapped);
      } catch {
        setCatalogTracks([]);
      } finally {
        setIsCatalogLoading(false);
      }
    },
    [mapItunesSong]
  );

  useEffect(() => {
    fetchCatalogByQuery('The Weeknd', 25);
  }, [fetchCatalogByQuery]);

  const searchExactTracks = useCallback(
    async (term) => {
      const cleanTerm = term.trim();
      if (!cleanTerm) {
        setSearchResults([]);
        setSearchArtists([]);
        return;
      }

      setIsSearching(true);
      try {
        const [ruSongs, usSongs, ruArtists, usArtists] = await Promise.all([
          nativeGetJson('https://itunes.apple.com/search', {
            term: cleanTerm,
            media: 'music',
            entity: 'song',
            country: 'RU',
            limit: '25'
          }),
          nativeGetJson('https://itunes.apple.com/search', {
            term: cleanTerm,
            media: 'music',
            entity: 'song',
            country: 'US',
            limit: '25'
          }),
          nativeGetJson('https://itunes.apple.com/search', {
            term: cleanTerm,
            media: 'music',
            entity: 'musicArtist',
            country: 'RU',
            limit: '6'
          }),
          nativeGetJson('https://itunes.apple.com/search', {
            term: cleanTerm,
            media: 'music',
            entity: 'musicArtist',
            country: 'US',
            limit: '6'
          })
        ]);

        const allRaw = [...(ruSongs?.results || []), ...(usSongs?.results || [])].filter(
          (r) => r.previewUrl
        );

        const qLower = normalizeName(cleanTerm);
        const qWords = qLower.split(/\s+/).filter(Boolean);

        const seen = new Set();
        const uniqueSongs = [];
        allRaw.forEach((item, idx) => {
          if (!seen.has(item.trackId)) {
            seen.add(item.trackId);
            uniqueSongs.push(mapItunesSong(item, idx));
          }
        });

        const scored = uniqueSongs
          .map((track) => {
            const titleN = normalizeName(track.title);
            const artistN = normalizeName(track.artist);
            let score = 0;

            if (titleN === qLower || artistN === qLower) score += 100;
            else if (titleN.startsWith(qLower) || artistN.startsWith(qLower)) score += 60;
            else if (titleN.includes(qLower) || artistN.includes(qLower)) score += 35;

            const matchedWords = qWords.filter(
              (w) => titleN.includes(w) || artistN.includes(w)
            ).length;
            score += matchedWords * 15;

            return { track, score };
          })
          .filter((entry) => entry.score > 0)
          .sort((a, b) => b.score - a.score)
          .map((entry) => entry.track);

        setSearchResults(scored.slice(0, 30));

        const artistMap = new Map();
        [...(ruArtists?.results || []), ...(usArtists?.results || [])].forEach((a) => {
          if (a.artistId && !artistMap.has(a.artistId)) {
            const sampleSong = scored.find((s) => s.rawArtistId === a.artistId);
            artistMap.set(a.artistId, {
              artistId: a.artistId,
              name: a.artistName,
              genre: a.primaryGenreName || 'Music',
              artworkUrl: sampleSong?.artworkUrl || null
            });
          }
        });
        setSearchArtists(Array.from(artistMap.values()).slice(0, 8));
      } catch {
        setSearchResults([]);
        setSearchArtists([]);
      } finally {
        setIsSearching(false);
      }
    },
    [mapItunesSong]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'search') {
        searchExactTracks(searchQuery);
      }
    }, 320);
    return () => clearTimeout(timer);
  }, [searchQuery, activeTab, searchExactTracks]);

  const openArtistProfile = useCallback(
    async (artistName, rawArtistId = null) => {
      if (!artistName) return;

      setViewStack((prev) => [
        ...prev,
        { type: 'artist', name: artistName, artistId: rawArtistId }
      ]);
      setIsArtistLoading(true);
      setArtistTopTracks([]);
      setArtistAlbums([]);
      setArtistBannerImg(null);

      try {
        let resolvedArtistId = rawArtistId;

        if (!resolvedArtistId) {
          const artistSearchData = await nativeGetJson('https://itunes.apple.com/search', {
            term: artistName,
            media: 'music',
            entity: 'musicArtist',
            limit: '10'
          });
          const exactArtistObj = (artistSearchData?.results || []).find(
            (a) => normalizeName(a.artistName) === normalizeName(artistName)
          );
          if (exactArtistObj) {
            resolvedArtistId = exactArtistObj.artistId;
          }
        }

        let rawSongs = [];
        let rawAlbums = [];

        if (resolvedArtistId) {
          const lookupData = await nativeGetJson('https://itunes.apple.com/lookup', {
            id: String(resolvedArtistId),
            entity: 'song,album',
            limit: '200'
          });
          const items = lookupData?.results || [];

          rawSongs = items.filter((item) => item.wrapperType === 'track' && item.previewUrl);
          rawAlbums = items.filter((item) => item.wrapperType === 'collection');
        }

        if (rawSongs.length === 0) {
          const [ruData, usData] = await Promise.all([
            nativeGetJson('https://itunes.apple.com/search', {
              term: artistName,
              media: 'music',
              entity: 'song',
              attribute: 'artistTerm',
              country: 'RU',
              limit: '50'
            }),
            nativeGetJson('https://itunes.apple.com/search', {
              term: artistName,
              media: 'music',
              entity: 'song',
              attribute: 'artistTerm',
              country: 'US',
              limit: '50'
            })
          ]);
          rawSongs = [...(ruData?.results || []), ...(usData?.results || [])].filter(
            (item) =>
              item.previewUrl &&
              (resolvedArtistId
                ? item.artistId === resolvedArtistId
                : matchesArtistStrict(item.artistName, artistName))
          );
        }

        const seenTrackIds = new Set();
        const uniqueSongs = [];
        rawSongs.forEach((item, idx) => {
          const dedupKey = `${normalizeName(item.trackName)}-${item.trackTimeMillis || idx}`;
          if (!seenTrackIds.has(item.trackId) && !seenTrackIds.has(dedupKey)) {
            seenTrackIds.add(item.trackId);
            seenTrackIds.add(dedupKey);
            uniqueSongs.push(mapItunesSong(item, idx));
          }
        });

        uniqueSongs.sort((a, b) => b.plays - a.plays);
        setArtistTopTracks(uniqueSongs);

        if (uniqueSongs[0]?.artworkUrl) {
          setArtistBannerImg(uniqueSongs[0].artworkUrl);
        }

        if (rawAlbums.length === 0) {
          const albData = await nativeGetJson('https://itunes.apple.com/search', {
            term: artistName,
            media: 'music',
            entity: 'album',
            attribute: 'artistTerm',
            limit: '40'
          });
          rawAlbums = (albData?.results || []).filter((item) =>
            resolvedArtistId
              ? item.artistId === resolvedArtistId
              : matchesArtistStrict(item.artistName, artistName)
          );
        }

        const seenAlb = new Set();
        const uniqueAlbums = [];
        rawAlbums.forEach((item) => {
          if (!seenAlb.has(item.collectionId)) {
            seenAlb.add(item.collectionId);
            uniqueAlbums.push(mapItunesAlbum(item));
          }
        });

        uniqueAlbums.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        setArtistAlbums(uniqueAlbums);

        if (!uniqueSongs[0]?.artworkUrl && uniqueAlbums[0]?.artworkUrl) {
          setArtistBannerImg(uniqueAlbums[0].artworkUrl);
        }
      } catch {
        setArtistTopTracks([]);
        setArtistAlbums([]);
      } finally {
        setIsArtistLoading(false);
      }
    },
    [mapItunesSong, mapItunesAlbum]
  );

  const openAlbumDetail = useCallback(
    async (albumObj) => {
      if (!albumObj) return;
      setViewStack((prev) => [...prev, { type: 'album', album: albumObj }]);
      setIsAlbumLoading(true);
      setAlbumTracks([]);

      try {
        if (albumObj.rawCollectionId) {
          const data = await nativeGetJson('https://itunes.apple.com/lookup', {
            id: String(albumObj.rawCollectionId),
            entity: 'song'
          });
          const songs = (data?.results || [])
            .filter((item) => item.wrapperType === 'track' && item.previewUrl)
            .map((item, idx) => mapItunesSong(item, idx));
          setAlbumTracks(songs);
        }
      } catch {
        setAlbumTracks([]);
      } finally {
        setIsAlbumLoading(false);
      }
    },
    [mapItunesSong]
  );

  const navigateBack = () => {
    setViewStack((prev) => prev.slice(0, -1));
  };

  const stopSynth = useCallback(() => {
    if (synthTimerRef.current) {
      clearInterval(synthTimerRef.current);
      synthTimerRef.current = null;
    }
    if (synthProgressTimerRef.current) {
      clearInterval(synthProgressTimerRef.current);
      synthProgressTimerRef.current = null;
    }
  }, []);

  const startSynthForTrack = useCallback(
    (track) => {
      stopSynth();
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContextClass();
          masterGainRef.current = audioCtxRef.current.createGain();
          masterGainRef.current.connect(audioCtxRef.current.destination);
        }
        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
        masterGainRef.current.gain.value = isMuted ? 0 : volume * 0.25;

        const chords = track.chords || NOX_ORIGINAL_TRACKS[0].chords;
        const stepMs = Math.round((60 / (track.tempo || 90)) * 1000 * 2);

        const playChord = () => {
          if (!audioCtxRef.current || !masterGainRef.current) return;
          const now = audioCtxRef.current.currentTime;
          const chord = chords[synthStepRef.current % chords.length];
          synthStepRef.current += 1;

          chord.forEach((freq, idx) => {
            const osc = audioCtxRef.current.createOscillator();
            const noteGain = audioCtxRef.current.createGain();
            osc.type = idx === 0 ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(freq, now);

            noteGain.gain.setValueAtTime(0.001, now);
            noteGain.gain.exponentialRampToValueAtTime(0.18 / chord.length, now + 0.15);
            noteGain.gain.exponentialRampToValueAtTime(0.0008, now + stepMs / 1000);

            osc.connect(noteGain);
            noteGain.connect(masterGainRef.current);
            osc.start(now);
            osc.stop(now + stepMs / 1000 + 0.05);
          });
        };

        playChord();
        synthTimerRef.current = setInterval(playChord, stepMs);
        synthProgressTimerRef.current = setInterval(() => {
          setProgress((prev) => {
            if (prev + 0.25 >= track.duration) {
              return 0;
            }
            return prev + 0.25;
          });
        }, 250);
      } catch {}
    },
    [isMuted, stopSynth, volume]
  );

  // --- ГИБРИДНЫЙ ДВИЖОК ВОСПРОИЗВЕДЕНИЯ (НАТИВНЫЙ ANDROID APK + ВЕБ) ---
  useEffect(() => {
    const audioEl = htmlAudioRef.current;
    const reqId = ++playRequestIdRef.current;

    if (!isPlaying || !currentTrack) {
      stopSynth();
      if (audioEl && !audioEl.paused) audioEl.pause();
      setIsBuffering(false);
      return;
    }

    if (currentTrack.source === 'synth') {
      if (audioEl && !audioEl.paused) audioEl.pause();
      setActiveStreamLabel('Эфир Nox');
      startSynthForTrack(currentTrack);
      return () => stopSynth();
    }

    if (currentTrack.source === 'local' || currentTrack.isFullStream) {
      stopSynth();
      setActiveStreamLabel('Локальный');
      if (audioEl) {
        const targetUrl = currentTrack.audioUrl || currentTrack.previewUrl;
        if (audioEl.src !== targetUrl) {
          audioEl.src = targetUrl;
          audioEl.load();
        }
        audioEl.play().then(() => setIsBuffering(false)).catch(() => setIsBuffering(false));
      }
      return;
    }

    stopSynth();
    setIsBuffering(true);
    let cancelled = false;

    const playPreviewFallback = () => {
      if (cancelled || reqId !== playRequestIdRef.current) return;
      setActiveStreamLabel('Превью 30с');
      if (currentTrack.previewUrl && audioEl) {
        audioEl.onerror = null;
        audioEl.src = currentTrack.previewUrl;
        audioEl.play().then(() => setIsBuffering(false)).catch(() => setIsBuffering(false));
      } else {
        setIsBuffering(false);
      }
    };

    const startPlayback = async () => {
      // 1. Если указан кастомный сервер (например, http://localhost:8000)
      if (customServerUrl.trim()) {
        const cleanBase = customServerUrl.trim().replace(/\/+$/, '');
        const params = new URLSearchParams({
          artist: currentTrack.artist,
          title: currentTrack.title,
          q: `${currentTrack.artist} - ${currentTrack.title}`
        });
        setActiveStreamLabel('Full Server');
        if (audioEl) {
          audioEl.src = `${cleanBase}/api/stream?${params.toString()}`;
          audioEl.onerror = () => playPreviewFallback();
          audioEl.play().then(() => setIsBuffering(false)).catch(() => playPreviewFallback());
        }
        return;
      }

      // 2. В нативном Android .apk (через CapacitorHttp без CORS) ищем полный трек напрямую с телефона
      if (isNativeCapacitor()) {
        setActiveStreamLabel('Поиск Full...');
        const cacheKey = `${normalizeText(currentTrack.artist)}::${normalizeText(currentTrack.title)}`;
        let resolved = fullStreamCacheRef.current.get(cacheKey);
        if (!resolved) {
          resolved = await resolveFullAudioDirect(currentTrack.artist, currentTrack.title);
          if (resolved) {
            fullStreamCacheRef.current.set(cacheKey, resolved);
          }
        }
        if (cancelled || reqId !== playRequestIdRef.current) return;

        if (resolved?.url && audioEl) {
          setActiveStreamLabel(resolved.label || 'Full HQ');
          audioEl.src = resolved.url;
          audioEl.onerror = () => playPreviewFallback();
          audioEl.play().then(() => setIsBuffering(false)).catch(() => playPreviewFallback());
          return;
        }
      }

      playPreviewFallback();
    };

    startPlayback();

    return () => {
      cancelled = true;
      stopSynth();
    };
  }, [isPlaying, currentTrack?.id, customServerUrl, startSynthForTrack, stopSynth]);

  useEffect(() => {
    if (htmlAudioRef.current) {
      htmlAudioRef.current.volume = isMuted ? 0 : volume;
    }
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.value = isMuted ? 0 : volume * 0.25;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (!isPlaying) {
      setVisualizerBars(Array(22).fill(14));
      return;
    }
    const id = setInterval(() => {
      setVisualizerBars(
        Array.from({ length: 22 }, (_, i) => {
          const centerBoost = 1 - Math.abs(i - 10.5) / 14;
          return Math.max(14, Math.min(95, Math.round((20 + Math.random() * 75) * (0.55 + centerBoost * 0.65))));
        })
      );
    }, 240);
    return () => clearInterval(id);
  }, [isPlaying]);

  const playTrackFromList = useCallback((track, listContext = null) => {
    if (listContext && listContext.length > 0) {
      setQueue(listContext);
    }
    setCurrentTrack(track);
    setProgress(0);
    setDuration(track.duration || 30);
    setIsPlaying(true);
  }, []);

  const handleNext = useCallback(() => {
    if (!queue.length) return;
    if (repeatMode === 'one' && currentTrack) {
      setProgress(0);
      if (htmlAudioRef.current) {
        htmlAudioRef.current.currentTime = 0;
        htmlAudioRef.current.play().catch(() => {});
      }
      setIsPlaying(true);
      return;
    }

    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    let nextIndex = 0;
    if (isShuffle && queue.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * queue.length);
      } while (nextIndex === currentIndex);
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeatMode === 'off') {
          setIsPlaying(false);
          return;
        }
        nextIndex = 0;
      }
    }

    const nextTrack = queue[nextIndex];
    setCurrentTrack(nextTrack);
    setProgress(0);
    setDuration(nextTrack.duration || 30);
    setIsPlaying(true);
  }, [queue, currentTrack, isShuffle, repeatMode]);

  const handlePrev = useCallback(() => {
    if (progress > 4 && htmlAudioRef.current) {
      htmlAudioRef.current.currentTime = 0;
      setProgress(0);
      return;
    }
    if (!queue.length) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    const prevIndex = currentIndex <= 0 ? queue.length - 1 : currentIndex - 1;
    const prevTrack = queue[prevIndex];
    setCurrentTrack(prevTrack);
    setProgress(0);
    setDuration(prevTrack.duration || 30);
    setIsPlaying(true);
  }, [progress, queue, currentTrack]);

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = ratio * (duration || 30);
    setProgress(newTime);
    if (htmlAudioRef.current && currentTrack?.source !== 'synth') {
      htmlAudioRef.current.currentTime = newTime;
    }
  };

  const toggleLike = useCallback((trackId, e) => {
    if (e) e.stopPropagation();
    setLikedIds((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [trackId, ...prev]
    );
  }, []);

  const toggleFollowArtist = (artistName) => {
    setFollowedArtists((prev) =>
      prev.includes(artistName)
        ? prev.filter((a) => a !== artistName)
        : [artistName, ...prev]
    );
  };

  const handleCreatePlaylist = () => {
    const trimmed = newPlaylistName.trim();
    if (!trimmed) return;
    const newPl = {
      id: `pl-${Date.now()}`,
      name: trimmed,
      trackIds: []
    };
    setPlaylists((prev) => [newPl, ...prev]);
    setNewPlaylistName('');
    setShowCreatePlaylist(false);
  };

  const addTrackToPlaylist = (playlistId, trackId) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        if (pl.trackIds.includes(trackId)) return pl;
        return { ...pl, trackIds: [...pl.trackIds, trackId] };
      })
    );
    setTrackForPlaylistModal(null);
  };

  const handleLocalFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const uploaded = files.map((file, idx) => ({
      id: `local-${Date.now()}-${idx}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Локальный файл',
      rawArtistId: null,
      album: 'Мои загрузки',
      releaseDate: new Date().toISOString(),
      duration: 180,
      genre: 'Local Audio',
      artworkUrl: null,
      audioUrl: URL.createObjectURL(file),
      source: 'local',
      isFullStream: true,
      coverGradient: 'from-emerald-600 via-teal-700 to-zinc-900'
    }));
    setLocalTracks((prev) => [...uploaded, ...prev]);
    playTrackFromList(uploaded[0], [...uploaded, ...localTracks]);
  };

  const allAvailableTracks = useMemo(() => {
    const map = new Map();
    [
      ...NOX_ORIGINAL_TRACKS,
      ...localTracks,
      ...catalogTracks,
      ...searchResults,
      ...artistTopTracks,
      ...albumTracks
    ].forEach((t) => {
      if (t && !map.has(t.id)) map.set(t.id, t);
    });
    return Array.from(map.values());
  }, [localTracks, catalogTracks, searchResults, artistTopTracks, albumTracks]);

  const likedTracksList = useMemo(
    () => allAvailableTracks.filter((t) => likedIds.includes(t.id)),
    [allAvailableTracks, likedIds]
  );

  const renderTrackRow = (track, contextList, rank = null) => (
    <TrackRow
      key={track.id}
      track={track}
      contextList={contextList}
      rank={rank}
      isCurrent={currentTrack?.id === track.id}
      isPlaying={isPlaying}
      isLiked={likedIds.includes(track.id)}
      onPlay={playTrackFromList}
      onOpenArtist={openArtistProfile}
      onToggleLike={toggleLike}
      onOpenPlaylistModal={setTrackForPlaylistModal}
    />
  );

  const currentView = viewStack[viewStack.length - 1] || null;

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-100 flex justify-center items-center sm:py-6 font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      <audio
        ref={htmlAudioRef}
        preload="auto"
        onTimeUpdate={(e) => {
          if (currentTrack?.source !== 'synth') {
            setProgress(e.currentTarget.currentTime || 0);
          }
        }}
        onLoadedMetadata={(e) => {
          if (currentTrack?.source !== 'synth' && e.currentTarget.duration && isFinite(e.currentTarget.duration)) {
            setDuration(e.currentTarget.duration);
          }
        }}
        onEnded={handleNext}
      />

      <div className="relative w-full max-w-[430px] h-[100dvh] sm:h-[844px] bg-[#0a0a0f] sm:rounded-[40px] sm:border sm:border-white/10 shadow-[0_25px_90px_rgba(79,70,229,0.2)] flex flex-col overflow-hidden">
        {/* Верхний статус-бар */}
        <div className="px-6 pt-3 pb-1 flex items-center justify-between text-[11px] font-semibold text-zinc-400 select-none">
          <span>23:55</span>
          <div className="w-24 h-5 bg-black rounded-full border border-white/5" />
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-2 bg-zinc-300 rounded-[2px]" />
            <span>5G</span>
          </div>
        </div>

        {/* Шапка приложения */}
        <header className="px-5 py-3 flex items-center justify-between border-b border-white/[0.06] bg-[#0a0a0f]/90 backdrop-blur-xl z-20">
          {currentView ? (
            <button
              type="button"
              onClick={navigateBack}
              className="flex items-center gap-1.5 text-sm font-bold text-white hover:text-indigo-300 transition"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Назад</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Disc3 className={`w-4 h-4 text-white ${isPlaying ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-white leading-none">
                  Nox
                </h1>
                <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
                  {isNativeCapacitor() ? 'Android Native' : 'Music Stream'}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setServerInput(customServerUrl);
                setShowServerModal(true);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                isNativeCapacitor() || customServerUrl
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/20'
              }`}
            >
              <Wifi className="w-3 h-3" />
              <span>{activeStreamLabel}</span>
            </button>
          </div>
        </header>

        {/* Основная прокручиваемая область */}
        <main className="flex-1 overflow-y-auto px-4 pt-3 pb-36 space-y-6">
          {currentView?.type === 'artist' ? (
            <div className="space-y-5">
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-indigo-900/50 via-[#12121a] to-[#0d0d14] border border-white/10 p-5">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-400/50 shadow-xl bg-zinc-900 flex items-center justify-center mb-3">
                    {artistBannerImg ? (
                      <img
                        src={artistBannerImg}
                        alt={currentView.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-10 h-10 text-indigo-300" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-xl font-black text-white">{currentView.name}</h2>
                    <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center font-bold">
                      ✓
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    {artistTopTracks.length > 0
                      ? `${artistTopTracks.length} треков • ${artistAlbums.length} релизов`
                      : 'Артист каталога Nox'}
                  </p>

                  <div className="flex items-center gap-2.5 mt-4 w-full">
                    <button
                      type="button"
                      disabled={artistTopTracks.length === 0}
                      onClick={() => playTrackFromList(artistTopTracks[0], artistTopTracks)}
                      className="flex-1 py-2.5 px-4 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-200 transition disabled:opacity-40"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>Слушать топ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleFollowArtist(currentView.name)}
                      className={`py-2.5 px-4 rounded-full text-xs font-bold border flex items-center gap-1.5 transition ${
                        followedArtists.includes(currentView.name)
                          ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                          : 'bg-white/5 text-white border-white/15 hover:bg-white/10'
                      }`}
                    >
                      {followedArtists.includes(currentView.name) ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Вы подписаны</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Подписаться</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <section>
                <div className="flex items-center justify-between mb-2.5 px-1">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">Популярные треки</h3>
                  </div>
                  <span className="text-[11px] text-zinc-500">От хита #1 вниз</span>
                </div>

                {isArtistLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className="h-14 rounded-2xl bg-white/5 animate-pulse" />
                    ))}
                  </div>
                ) : artistTopTracks.length > 0 ? (
                  <div className="space-y-1.5">
                    {artistTopTracks.slice(0, 15).map((track, idx) =>
                      renderTrackRow(track, artistTopTracks, idx + 1)
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 text-center py-6">
                    Треки исполнителя не найдены
                  </p>
                )}
              </section>

              {artistAlbums.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-2.5 px-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-sm font-bold text-white">Альбомы и релизы</h3>
                    </div>
                    <span className="text-[11px] text-zinc-500">По дате выхода</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {artistAlbums.map((alb) => (
                      <div
                        key={alb.id}
                        onClick={() => openAlbumDetail(alb)}
                        className="group rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] p-2.5 cursor-pointer transition"
                      >
                        <div className="aspect-square rounded-xl overflow-hidden bg-zinc-900 mb-2 relative">
                          {alb.artworkUrl ? (
                            <img
                              src={alb.artworkUrl}
                              alt={alb.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Disc3 className="w-8 h-8 text-zinc-600" />
                            </div>
                          )}
                          <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/70 text-[10px] font-bold text-zinc-200">
                            {alb.year}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-white truncate">{alb.title}</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          {alb.releaseType} • {alb.trackCount} тр.
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : currentView?.type === 'album' ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center text-center bg-white/[0.03] border border-white/10 rounded-3xl p-5">
                <div className="w-40 h-40 rounded-2xl overflow-hidden shadow-2xl mb-3 bg-zinc-900">
                  {currentView.album.artworkUrl ? (
                    <img
                      src={currentView.album.artworkUrl}
                      alt={currentView.album.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Disc3 className="w-12 h-12 text-zinc-600" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-400">
                  {currentView.album.releaseType} • {currentView.album.year}
                </span>
                <h2 className="text-lg font-black text-white mt-1">{currentView.album.title}</h2>
                <button
                  type="button"
                  onClick={() =>
                    openArtistProfile(currentView.album.artist, currentView.album.rawArtistId)
                  }
                  className="text-xs text-zinc-400 hover:text-indigo-300 mt-0.5"
                >
                  {currentView.album.artist}
                </button>
                <button
                  type="button"
                  disabled={albumTracks.length === 0}
                  onClick={() => playTrackFromList(albumTracks[0], albumTracks)}
                  className="mt-4 w-full py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition disabled:opacity-40"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Слушать релиз</span>
                </button>
              </div>

              {isAlbumLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-14 rounded-2xl bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {albumTracks.map((track, idx) => renderTrackRow(track, albumTracks, idx + 1))}
                </div>
              )}
            </div>
          ) : activeTab === 'home' ? (
            <>
              <div className="relative rounded-3xl p-5 overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-700 to-[#141422] border border-white/15 shadow-xl">
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-md text-[11px] font-bold text-indigo-200 mb-3">
                    <Sparkles className="w-3 h-3" />
                    <span>Персональная волна</span>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Мой поток</h2>
                  <p className="text-xs text-indigo-100/80 mt-1 max-w-[260px]">
                    Бесконечный микс на основе твоих лайков, любимых артистов и свежих хитов
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const pool = [...catalogTracks, ...NOX_ORIGINAL_TRACKS];
                      if (pool.length > 0) playTrackFromList(pool[0], pool);
                    }}
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-extrabold text-xs hover:scale-[1.02] active:scale-[0.98] transition shadow-lg"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Запустить поток</span>
                  </button>
                </div>
              </div>

              <section>
                <div className="flex items-center justify-between mb-2.5 px-1">
                  <h3 className="text-sm font-bold text-white">Подборки по настроению</h3>
                  <span className="text-[11px] text-zinc-500">Микс дня</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {CURATED_MOODS.map((mood) => (
                    <button
                      key={mood.id}
                      type="button"
                      onClick={() => {
                        setSelectedGenre('all');
                        fetchCatalogByQuery(mood.query, 25);
                      }}
                      className={`text-left p-3.5 rounded-2xl bg-gradient-to-br ${mood.gradient} border transition hover:brightness-110`}
                    >
                      <p className="text-xs font-extrabold text-white">{mood.title}</p>
                      <p className="text-[11px] text-zinc-300/80 mt-1 line-clamp-1">
                        {mood.subtitle}
                      </p>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-2.5 px-1">
                  <h3 className="text-sm font-bold text-white">Оригинальный эфир Nox</h3>
                  <span className="text-[11px] text-zinc-500">Автономный Hi-Fi</span>
                </div>
                <div className="space-y-1.5">
                  {NOX_ORIGINAL_TRACKS.map((track) =>
                    renderTrackRow(track, [...NOX_ORIGINAL_TRACKS, ...catalogTracks])
                  )}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-2.5 px-1">
                  <h3 className="text-sm font-bold text-white">В тренде сейчас</h3>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
                  {GENRE_FILTERS.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        setSelectedGenre(g.id);
                        fetchCatalogByQuery(g.id === 'all' ? 'The Weeknd' : g.label, 25);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                        selectedGenre === g.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white/[0.06] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>

                {isCatalogLoading ? (
                  <div className="space-y-2 mt-2">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className="h-14 rounded-2xl bg-white/5 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1.5 mt-1">
                    {catalogTracks.map((track) => renderTrackRow(track, catalogTracks))}
                  </div>
                )}
              </section>
            </>
          ) : activeTab === 'search' ? (
            <>
              <div className="sticky top-0 z-10 bg-[#0a0a0f]/95 backdrop-blur-md pb-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Треки, артисты, альбомы..."
                    className="w-full bg-white/[0.08] border border-white/10 focus:border-indigo-500/50 rounded-2xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex gap-1.5 overflow-x-auto pt-2.5 no-scrollbar">
                  {['Miyagi & Эндшпиль', 'Скриптонит', 'MACAN', 'The Weeknd', 'Travis Scott'].map(
                    (chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setSearchQuery(chip)}
                        className="px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/15 text-[11px] font-medium text-zinc-300 whitespace-nowrap transition"
                      >
                        {chip}
                      </button>
                    )
                  )}
                </div>
              </div>

              {isSearching ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="h-14 rounded-2xl bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <div className="space-y-5">
                  {searchArtists.length > 0 && (
                    <section>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5 px-1">
                        Исполнители
                      </h3>
                      <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                        {searchArtists.map((art) => (
                          <button
                            key={art.artistId}
                            type="button"
                            onClick={() => openArtistProfile(art.name, art.artistId)}
                            className="flex flex-col items-center w-20 flex-shrink-0 group"
                          >
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-900 border border-white/10 group-hover:border-indigo-400 transition flex items-center justify-center">
                              {art.artworkUrl ? (
                                <img
                                  src={art.artworkUrl}
                                  alt={art.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Users className="w-6 h-6 text-zinc-500" />
                              )}
                            </div>
                            <span className="text-xs font-bold text-zinc-200 group-hover:text-indigo-300 truncate w-full text-center mt-1.5">
                              {art.name}
                            </span>
                            <span className="text-[10px] text-zinc-500 truncate w-full text-center">
                              {art.genre}
                            </span>
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  <section>
                    <div className="flex items-center justify-between mb-2 px-1">
                      <h3 className="text-sm font-bold text-white">
                        Точные совпадения: «{searchQuery}»
                      </h3>
                      <span className="text-[11px] text-zinc-500">
                        {searchResults.length} треков
                      </span>
                    </div>

                    {searchResults.length > 0 ? (
                      <div className="space-y-1.5">
                        {searchResults.map((track) => renderTrackRow(track, searchResults))}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-white/[0.03] rounded-3xl border border-white/5">
                        <p className="text-sm text-zinc-400">Ничего не найдено</p>
                      </div>
                    )}
                  </section>
                </div>
              ) : (
                <section>
                  <h3 className="text-sm font-bold text-white mb-2.5 px-1">
                    Рекомендации каталога
                  </h3>
                  <div className="space-y-1.5">
                    {catalogTracks.slice(0, 10).map((track) => renderTrackRow(track, catalogTracks))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-black text-white">Моя коллекция</h2>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    multiple
                    onChange={handleLocalFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>MP3</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreatePlaylist((v) => !v)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Плейлист</span>
                  </button>
                </div>
              </div>

              {showCreatePlaylist && (
                <div className="flex gap-2 p-3 rounded-2xl bg-white/[0.05] border border-white/10">
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    placeholder="Название нового плейлиста..."
                    className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCreatePlaylist}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 text-xs font-bold text-white"
                  >
                    Создать
                  </button>
                </div>
              )}

              {followedArtists.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 px-1">
                    Любимые артисты ({followedArtists.length})
                  </h3>
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {followedArtists.map((artist) => (
                      <button
                        key={artist}
                        type="button"
                        onClick={() => openArtistProfile(artist)}
                        className="px-3.5 py-2 rounded-2xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-200 whitespace-nowrap flex items-center gap-1.5"
                      >
                        <span>{artist}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                      </button>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 px-1">
                  Плейлисты ({playlists.length})
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {playlists.map((pl) => {
                    const plTracks = allAvailableTracks.filter((t) => pl.trackIds.includes(t.id));
                    return (
                      <div
                        key={pl.id}
                        onClick={() => {
                          if (plTracks.length > 0) playTrackFromList(plTracks[0], plTracks);
                        }}
                        className="p-3.5 rounded-2xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-indigo-500/40 cursor-pointer transition"
                      >
                        <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-2.5">
                          <ListMusic className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-bold text-white truncate">{pl.name}</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          {pl.trackIds.length} треков
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>

              {localTracks.length > 0 && (
                <section>
                  <h3 className="text-sm font-bold text-white mb-2 px-1">
                    Загруженные треки ({localTracks.length})
                  </h3>
                  <div className="space-y-1.5">
                    {localTracks.map((track) => renderTrackRow(track, localTracks))}
                  </div>
                </section>
              )}

              <section>
                <h3 className="text-sm font-bold text-white mb-2.5 px-1">
                  Мне нравится ({likedTracksList.length})
                </h3>
                {likedTracksList.length > 0 ? (
                  <div className="space-y-1.5">
                    {likedTracksList.map((track) => renderTrackRow(track, likedTracksList))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 text-center py-8 bg-white/[0.02] rounded-2xl">
                    Нажимайте сердечко рядом с треками, чтобы сохранять их сюда
                  </p>
                )}
              </section>
            </div>
          )}
        </main>

        {/* === МИНИ-ПЛЕЕР === */}
        {currentTrack && !isPlayerExpanded && (
          <div
            onClick={() => setIsPlayerExpanded(true)}
            className="absolute bottom-[68px] left-3 right-3 z-30 rounded-2xl bg-[#161622]/95 backdrop-blur-xl border border-white/10 p-2.5 shadow-2xl cursor-pointer"
          >
            <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-indigo-500 transition-all duration-200"
                style={{ width: `${Math.min(100, ((progress || 0) / (duration || 30)) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <TrackArtwork
                  track={currentTrack}
                  size="sm"
                  isActive={true}
                  isPlaying={isPlaying}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{currentTrack.title}</p>
                  <p className="text-[11px] text-zinc-400 truncate">{currentTrack.artist}</p>
                </div>
              </div>

              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={(e) => toggleLike(currentTrack.id, e)}
                  className="p-2 text-zinc-400 hover:text-white"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      likedIds.includes(currentTrack.id) ? 'fill-indigo-500 text-indigo-500' : ''
                    }`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-black" />
                  ) : (
                    <Play className="w-4 h-4 fill-black ml-0.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-2 text-zinc-300 hover:text-white"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === НИЖНЯЯ НАВИГАЦИЯ === */}
        <nav className="h-[64px] bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/[0.06] px-6 flex items-center justify-around z-30">
          {[
            { id: 'home', label: 'Поток', icon: Home },
            { id: 'search', label: 'Поиск', icon: Search },
            { id: 'library', label: 'Коллекция', icon: Library }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id && !currentView;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setViewStack([]);
                  setActiveTab(tab.id);
                }}
                className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition ${
                  active ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-bold">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* === ПОЛНОЭКРАННЫЙ ПЛЕЕР === */}
        {isPlayerExpanded && currentTrack && (
          <div className="absolute inset-0 z-40 bg-gradient-to-b from-[#17162b] via-[#0d0d15] to-[#07070b] flex flex-col justify-between p-6">
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setIsPlayerExpanded(false)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300"
              >
                <ChevronDown className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                  Сейчас в эфире Nox
                </span>
                <span className="mt-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-300">
                  {isBuffering ? 'Загрузка...' : activeStreamLabel}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setTrackForPlaylistModal(currentTrack)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300"
              >
                <ListMusic className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center my-auto">
              <TrackArtwork
                track={currentTrack}
                size="lg"
                isActive={true}
                isPlaying={isPlaying}
              />

              <div className="flex items-end justify-center gap-1 h-9 mt-6">
                {visualizerBars.map((val, idx) => (
                  <span
                    key={idx}
                    className="w-1 rounded-full bg-gradient-to-t from-indigo-500 to-purple-300 transition-all duration-200"
                    style={{ height: `${isPlaying ? val : 14}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-5 pb-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-black text-white truncate">{currentTrack.title}</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlayerExpanded(false);
                      openArtistProfile(currentTrack.artist, currentTrack.rawArtistId);
                    }}
                    className="text-sm text-indigo-300 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <span className="truncate">{currentTrack.artist}</span>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInfoTrack(currentTrack)}
                    className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold text-zinc-200"
                  >
                    Инфо
                  </button>
                  <button
                    type="button"
                    onClick={(e) => toggleLike(currentTrack.id, e)}
                    className="p-2.5 rounded-full bg-white/5 hover:bg-white/10"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        likedIds.includes(currentTrack.id)
                          ? 'fill-indigo-500 text-indigo-500'
                          : 'text-zinc-300'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div>
                <div
                  onClick={handleSeek}
                  className="w-full h-1.5 bg-white/15 rounded-full cursor-pointer relative overflow-hidden"
                >
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full"
                    style={{
                      width: `${Math.min(100, ((progress || 0) / (duration || 30)) * 100)}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400 font-medium mt-1.5">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between px-2">
                <button
                  type="button"
                  onClick={() => setIsShuffle((s) => !s)}
                  className={`p-2 rounded-full transition ${
                    isShuffle ? 'text-indigo-400 bg-indigo-500/15' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Shuffle className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-3 rounded-full text-white hover:bg-white/10 transition"
                >
                  <SkipBack className="w-6 h-6 fill-white" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition"
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-black" />
                  ) : (
                    <Play className="w-7 h-7 fill-black ml-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="p-3 rounded-full text-white hover:bg-white/10 transition"
                >
                  <SkipForward className="w-6 h-6 fill-white" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setRepeatMode((m) => (m === 'off' ? 'all' : m === 'all' ? 'one' : 'off'))
                  }
                  className={`p-2 rounded-full transition relative ${
                    repeatMode !== 'off'
                      ? 'text-indigo-400 bg-indigo-500/15'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Repeat className="w-5 h-5" />
                  {repeatMode === 'one' && (
                    <span className="absolute -top-0.5 -right-0.5 text-[9px] font-black bg-indigo-500 text-white w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      1
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3 px-2">
                <button
                  type="button"
                  onClick={() => setIsMuted((m) => !m)}
                  className="text-zinc-400 hover:text-white"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setIsMuted(false);
                    setVolume(parseFloat(e.target.value));
                  }}
                  className="w-full accent-indigo-500 h-1 bg-white/15 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* === МОДАЛЬНОЕ ОКНО: ДОБАВИТЬ В ПЛЕЙЛИСТ === */}
        {trackForPlaylistModal && (
          <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
            <div className="w-full rounded-3xl bg-[#14141d] border border-white/10 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white">Добавить в плейлист</h3>
                <button
                  type="button"
                  onClick={() => setTrackForPlaylistModal(null)}
                  className="p-1.5 rounded-full bg-white/10 text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {playlists.map((pl) => {
                  const alreadyIn = pl.trackIds.includes(trackForPlaylistModal.id);
                  return (
                    <button
                      key={pl.id}
                      type="button"
                      onClick={() => addTrackToPlaylist(pl.id, trackForPlaylistModal.id)}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.05] hover:bg-white/10 text-left transition"
                    >
                      <span className="text-xs font-bold text-white">{pl.name}</span>
                      {alreadyIn ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Plus className="w-4 h-4 text-zinc-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* === МОДАЛЬНОЕ ОКНО: ИНФО О ТРЕКЕ === */}
        {infoTrack && (
          <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-5">
            <div className="w-full rounded-3xl bg-[#14141d] border border-white/10 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-extrabold text-white">О треке</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setInfoTrack(null)}
                  className="p-1.5 rounded-full bg-white/10 text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs space-y-2 text-zinc-300">
                <p>
                  <span className="text-zinc-500">Название:</span> {infoTrack.title}
                </p>
                <p>
                  <span className="text-zinc-500">Исполнитель:</span> {infoTrack.artist}
                </p>
                <p>
                  <span className="text-zinc-500">Альбом:</span> {infoTrack.album}
                </p>
                <p>
                  <span className="text-zinc-500">Жанр:</span> {infoTrack.genre}
                </p>
                <p>
                  <span className="text-zinc-500">Год релиза:</span>{' '}
                  {extractYear(infoTrack.releaseDate)}
                </p>
                <p>
                  <span className="text-zinc-500">Режим потока:</span> {activeStreamLabel}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* === МОДАЛЬНОЕ ОКНО: РЕЖИМ РАБОТЫ (ANDROID APK / СЕРВЕР) === */}
        {showServerModal && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-5">
            <div className="w-full rounded-3xl bg-[#14141d] border border-white/10 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white">Источник полных треков</h3>
                <button
                  type="button"
                  onClick={() => setShowServerModal(false)}
                  className="p-1.5 rounded-full bg-white/10 text-zinc-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {isNativeCapacitor()
                  ? 'Обнаружена нативная сборка Android (.apk)! Приложение ищет полные треки напрямую через телефон без CORS-ограничений.'
                  : 'В браузерной песочнице из-за CORS играют 30-секундные превью. При сборке в Android APK через Capacitor (с включённым CapacitorHttp) полные треки включатся автоматически!'}
              </p>
              <input
                type="text"
                value={serverInput}
                onChange={(e) => setServerInput(e.target.value)}
                placeholder="Опционально: http://localhost:8000"
                className="w-full bg-white/[0.07] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const clean = serverInput.trim().replace(/\/+$/, '');
                    setCustomServerUrl(clean);
                    try {
                      localStorage.setItem('nox_custom_server', clean);
                    } catch {}
                    setShowServerModal(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white"
                >
                  Сохранить
                </button>
                {customServerUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setServerInput('');
                      setCustomServerUrl('');
                      try {
                        localStorage.removeItem('nox_custom_server');
                      } catch {}
                      setShowServerModal(false);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white/10 text-xs font-bold text-zinc-300"
                  >
                    Сбросить
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
