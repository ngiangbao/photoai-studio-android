import { CapturedPhoto } from '../types';

function createSvgDataUrl(title: string, subtitle: string, gradientColors: [string, string, string], iconSvg: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${gradientColors[0]}" />
        <stop offset="50%" stop-color="${gradientColors[1]}" />
        <stop offset="100%" stop-color="${gradientColors[2]}" />
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="35%" r="40%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </radialGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000" flood-opacity="0.35"/>
      </filter>
    </defs>
    <rect width="600" height="800" fill="url(#grad)" />
    <circle cx="300" cy="280" r="220" fill="url(#glow)" />
    
    <!-- Aesthetic decorative geometry -->
    <g opacity="0.15">
      <circle cx="300" cy="300" r="180" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="8 6"/>
      <circle cx="300" cy="300" r="240" fill="none" stroke="#fff" stroke-width="1.5"/>
    </g>

    <!-- Center Icon -->
    <g transform="translate(230, 210) scale(3.5)" filter="url(#shadow)">
      ${iconSvg}
    </g>

    <!-- Overlay bottom card -->
    <rect x="40" y="580" width="520" height="170" rx="24" fill="#0b0f19" fill-opacity="0.75" filter="url(#shadow)" stroke="#ffffff" stroke-opacity="0.15" stroke-width="1.5"/>
    <text x="75" y="640" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="28" font-weight="800" fill="#ffffff">${title}</text>
    <text x="75" y="685" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="16" font-weight="500" fill="#94a3b8">${subtitle}</text>
    <rect x="75" y="708" width="110" height="26" rx="13" fill="#6366f1" />
    <text x="130" y="725" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">AI STUDIO</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const INITIAL_SAMPLE_PHOTOS: CapturedPhoto[] = [
  {
    id: 'sample_portrait_01',
    dataUrl: createSvgDataUrl(
      'Chân Dung Studio Nghệ Thuật',
      'Ánh sáng mềm • Mịn da tự nhiên • Bokeh',
      ['#4f46e5', '#7c3aed', '#ec4899'],
      '<path fill="#ffffff" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>',
    ),
    name: 'Chan_Dung_Portrait_01.jpg',
    timestamp: Date.now() - 3600000 * 3,
    category: 'portraits',
    aiTags: ['chân dung', 'studio', 'mịn da', 'nghệ thuật'],
    analyzed: true,
  },
  {
    id: 'sample_landscape_01',
    dataUrl: createSvgDataUrl(
      'Hoàng Hôn Đà Lạt Mộng Mơ',
      'Góc rộng thiên nhiên • Mây trời rực rỡ',
      ['#0ea5e9', '#2563eb', '#4f46e5'],
      '<path fill="#ffffff" d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.88 13.84 8 11.33 8 11.33L3 18h18l-7-12z"/>',
    ),
    name: 'Phong_Canh_Da_Lat.jpg',
    timestamp: Date.now() - 3600000 * 2,
    category: 'landscapes',
    aiTags: ['phong cảnh', 'thiên nhiên', 'hoàng hôn', 'đà lạt'],
    analyzed: true,
  },
  {
    id: 'sample_selfie_01',
    dataUrl: createSvgDataUrl(
      'Selfie Nụ Cười Nắng Mai',
      'Góc cận rạng rỡ • Tone Hàn Quốc trong trẻo',
      ['#f43f5e', '#d946ef', '#8b5cf6'],
      '<path fill="#ffffff" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>',
    ),
    name: 'Selfie_Nu_Cuoi_Morning.jpg',
    timestamp: Date.now() - 3600000 * 1,
    category: 'selfies',
    aiTags: ['selfie', 'nụ cười', 'k-beauty', 'tự nhiên'],
    analyzed: true,
  },
  {
    id: 'sample_event_01',
    dataUrl: createSvgDataUrl(
      'Kỷ Yếu Tốt Nghiệp Cử Nhân',
      'Đồng phục cử nhân • Nụ cười rạng rỡ',
      ['#f59e0b', '#d97706', '#b45309'],
      '<path fill="#ffffff" d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>',
    ),
    name: 'Ky_Yeu_Tot_Nghiep.jpg',
    timestamp: Date.now() - 3600000 * 4,
    category: 'events',
    aiTags: ['kỷ yếu', 'tốt nghiệp', 'sự kiện', 'tập thể'],
    analyzed: true,
  },
];
