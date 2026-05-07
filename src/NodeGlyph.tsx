import type { JSX } from 'react'

const stroke = {
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none',
}

const GLYPH_PATHS: Record<string, JSX.Element> = {
  pg: <><ellipse cx="9" cy="5" rx="6" ry="2.4" {...stroke} /><path d="M3 5v8c0 1.3 2.7 2.4 6 2.4s6-1.1 6-2.4V5" {...stroke} /><path d="M3 9c0 1.3 2.7 2.4 6 2.4s6-1.1 6-2.4" {...stroke} /></>,
  my: <><ellipse cx="9" cy="5" rx="6" ry="2.4" {...stroke} /><path d="M3 5v8c0 1.3 2.7 2.4 6 2.4s6-1.1 6-2.4V5" {...stroke} /></>,
  mg: <><path d="M9 2C7 5 5 8 5 11a4 4 0 0 0 4 4 4 4 0 0 0 4-4c0-3-2-6-4-9Z" {...stroke} /><path d="M9 11v5" {...stroke} /></>,
  rd: <><ellipse cx="9" cy="5" rx="6" ry="2.4" {...stroke} /><path d="M3 5v8c0 1.3 2.7 2.4 6 2.4s6-1.1 6-2.4V5" {...stroke} /><path d="m6 9 1.5 1.5L11 7" {...stroke} /></>,
  s3: <><path d="M3 4h12v3H3z" {...stroke} /><path d="M3 7v7h12V7" {...stroke} /><path d="M6 11h6" {...stroke} /></>,
  ms: <><ellipse cx="9" cy="5" rx="6" ry="2.4" {...stroke} /><path d="M3 5v8c0 1.3 2.7 2.4 6 2.4s6-1.1 6-2.4V5" {...stroke} /><path d="M6 10h6M6 12h6" {...stroke} /></>,
  fw: <><path d="M3 3h12v4H3zM3 7h12v4H3zM3 11h12v4H3z" {...stroke} /><path d="M6 3v4M11 3v4M4 7v4M9 7v4M14 7v4M7 11v4M12 11v4" {...stroke} /></>,
  rt: <><rect x="2" y="6" width="14" height="6" rx="1.5" {...stroke} /><circle cx="5" cy="9" r=".7" fill="currentColor" /><circle cx="8" cy="9" r=".7" fill="currentColor" /><circle cx="11" cy="9" r=".7" fill="currentColor" /><path d="M2 5h2M14 5h2M2 13h2M14 13h2" {...stroke} /></>,
  sw: <><rect x="2" y="6" width="14" height="6" rx="1.5" {...stroke} /><path d="M4 6V4M7 6V4M10 6V4M13 6V4M4 12v2M7 12v2M10 12v2M13 12v2" {...stroke} /></>,
  md: <><rect x="2" y="6" width="14" height="6" rx="1.5" {...stroke} /><circle cx="5" cy="9" r=".7" fill="currentColor" /><circle cx="13" cy="9" r=".7" fill="currentColor" /><path d="M9 6V3M7 4l4-1" {...stroke} /></>,
  ap: <><circle cx="9" cy="11" r="1.5" {...stroke} /><path d="M5.5 8.5a5 5 0 0 1 7 0M3 6a8 8 0 0 1 12 0" {...stroke} /></>,
  wl: <><rect x="2" y="9" width="14" height="6" rx="1.5" {...stroke} /><path d="M5 12h.01M9 12h.01M13 12h.01" {...stroke} /><path d="M5 6.5a5 5 0 0 1 8 0M3 4a8 8 0 0 1 12 0" {...stroke} /></>,
  up: <><rect x="3" y="4" width="12" height="11" rx="1.5" {...stroke} /><path d="M9 7v4M7 9l2-2 2 2" {...stroke} /><path d="M5 4V2M13 4V2" {...stroke} /></>,
  vm: <><rect x="2" y="3" width="14" height="9" rx="1.2" {...stroke} /><path d="M6 12v3M12 12v3M5 15h8" {...stroke} /><circle cx="9" cy="7.5" r="1.5" {...stroke} /></>,
  cm: <><rect x="2" y="3" width="14" height="6" rx="1.2" {...stroke} /><rect x="2" y="10" width="14" height="5" rx="1.2" {...stroke} /><circle cx="4.5" cy="6" r=".5" fill="currentColor" /></>,
  rg: <><rect x="3" y="4" width="12" height="10" rx="1.2" {...stroke} /><path d="M3 7h12M3 10h12" {...stroke} /></>,
  vl: <><ellipse cx="9" cy="5" rx="5" ry="2" {...stroke} /><path d="M4 5v8c0 1.1 2.2 2 5 2s5-.9 5-2V5" {...stroke} /></>,
  cl2: <><circle cx="9" cy="9" r="6" {...stroke} /><circle cx="9" cy="9" r="2" {...stroke} /><path d="M9 3v2M9 13v2M3 9h2M13 9h2" {...stroke} /></>,
  ig: <><path d="M3 9h12" {...stroke} /><path d="m12 6 3 3-3 3" {...stroke} /><rect x="2" y="3" width="3" height="12" rx=".5" {...stroke} /></>,
  cf: <><rect x="3" y="3" width="12" height="12" rx="1.2" {...stroke} /><path d="M5 6h8M5 9h8M5 12h5" {...stroke} /></>,
  sc: <><circle cx="9" cy="11" r="2" {...stroke} /><path d="M5 9V6a4 4 0 0 1 8 0v3" {...stroke} /></>,
  pv: <><rect x="3" y="3" width="12" height="12" rx="1.2" {...stroke} /><path d="M9 6v6M6 9h6" {...stroke} /></>,
  rb: <><circle cx="6" cy="6" r="1.5" {...stroke} /><circle cx="12" cy="9" r="1.5" {...stroke} /><circle cx="6" cy="12" r="1.5" {...stroke} /><path d="M7.3 6.5 10.7 8.5M7.3 11.5 10.7 9.5" {...stroke} /></>,
  gr: <rect x="2" y="2" width="14" height="14" rx="2" strokeDasharray="2 2" {...stroke} />,
  ns: <><rect x="2" y="2" width="14" height="14" rx="2" {...stroke} /><path d="M2 6h14" {...stroke} /></>,
  vp: <><rect x="2" y="3" width="14" height="12" rx="3" strokeDasharray="3 2" {...stroke} /><path d="M5 7h8M5 10h6" {...stroke} /></>,
  sb: <rect x="3" y="3" width="12" height="12" rx="2" strokeDasharray="2 1.5" {...stroke} />,
  zn: <path d="M3 9a6 6 0 0 1 12 0 6 6 0 0 1-12 0Z" strokeDasharray="2 2" {...stroke} />,
  cpa: <><circle cx="9" cy="7" r="3" {...stroke} /><path d="M4 15c0-2.5 2-4 5-4s5 1.5 5 4" {...stroke} /><path d="M9 4V2M6 5 5 4M12 5l1-1" {...stroke} /></>,
  cpt: <><path d="M3 4h12v8H8l-3 3v-3H3z" {...stroke} /><path d="M6 7h6M6 9h4" {...stroke} /></>,
  cptl: <><path d="m4 14 5-5 1.5 1.5L5.5 15.5z" {...stroke} /><path d="M9.5 8.5 12 6a2 2 0 1 1 0-3 2 2 0 0 1 3 0 2 2 0 0 1 0 3l-2.5 2.5" {...stroke} /></>,
  cpc: <><circle cx="5" cy="9" r="2" {...stroke} /><circle cx="13" cy="9" r="2" {...stroke} /><path d="M7 9h4" {...stroke} /></>,
  cpv: <><path d="M5 4h2l4 10h2" {...stroke} /><path d="M5 14h2l4-10h2" {...stroke} /></>,
  cpac: <path d="m7 3 6 6-3 1 1 5-6-6 3-1z" {...stroke} />,
  cpk: <><path d="M4 3h7l3 3v9H4z" {...stroke} /><path d="M11 3v3h3" {...stroke} /><path d="M6 9h6M6 11h6M6 13h4" {...stroke} /></>,
  cptr: <path d="M9 2 4 10h4l-1 6 6-9h-4z" {...stroke} />,
  sv: <><rect x="3" y="3" width="12" height="12" rx="2" {...stroke} /><path d="M6 9h6M9 6v6" {...stroke} /></>,
  fn: <><path d="M5 4h6c2 0 2 2 0 2H8c-2 0-2 2 0 2h2c2 0 2 2 0 2H6" {...stroke} /><path d="M11 14H7" {...stroke} /></>,
  wk: <><circle cx="9" cy="9" r="2.5" {...stroke} /><path d="M9 3v2M9 13v2M3 9h2M13 9h2M5 5l1.5 1.5M11.5 11.5 13 13M5 13l1.5-1.5M11.5 6.5 13 5" {...stroke} /></>,
  lb: <><path d="M9 3v3M9 12v3M3 9h3M12 9h3" {...stroke} /><circle cx="9" cy="9" r="2.5" {...stroke} /></>,
  gw: <><path d="M3 14V8l6-4 6 4v6" {...stroke} /><path d="M6 14v-3h6v3" {...stroke} /></>,
  px: <><path d="M3 9h12" {...stroke} /><path d="m11 5 4 4-4 4M7 5 3 9l4 4" {...stroke} /></>,
  us: <><circle cx="9" cy="6" r="2.5" {...stroke} /><path d="M3.5 15c0-3 2.5-5 5.5-5s5.5 2 5.5 5" {...stroke} /></>,
  br: <><rect x="2" y="3" width="14" height="12" rx="2" {...stroke} /><path d="M2 7h14" {...stroke} /><circle cx="4.5" cy="5" r=".5" fill="currentColor" /><circle cx="6.2" cy="5" r=".5" fill="currentColor" /></>,
  mo: <><rect x="5" y="2" width="8" height="14" rx="1.5" {...stroke} /><path d="M8 13.5h2" {...stroke} /></>,
  cl: <><rect x="2" y="3" width="14" height="12" rx="2" {...stroke} /><path d="m5 7 2 2-2 2M9 11h4" {...stroke} /></>,
  sr: <><rect x="2" y="3" width="14" height="5" rx="1.2" {...stroke} /><rect x="2" y="10" width="14" height="5" rx="1.2" {...stroke} /><circle cx="4.5" cy="5.5" r=".5" fill="currentColor" /><circle cx="4.5" cy="12.5" r=".5" fill="currentColor" /></>,
  dk: <><rect x="2" y="7" width="14" height="6" rx="1.5" {...stroke} /><path d="M5 7V5h2v2M8 7V5h2v2M11 7V5h2v2M5 10v0M8 10v0M11 10v0" {...stroke} /></>,
  k8: <><path d="M9 2 3 5v6l6 3 6-3V5Z" {...stroke} /><circle cx="9" cy="9" r="1.5" {...stroke} /></>,
  kf: <><circle cx="5" cy="5" r="1.5" {...stroke} /><circle cx="13" cy="9" r="1.5" {...stroke} /><circle cx="5" cy="13" r="1.5" {...stroke} /><path d="M6.3 6 11.7 8M6.3 12 11.7 10" {...stroke} /></>,
  q: <><rect x="2" y="6" width="14" height="6" rx="1.5" {...stroke} /><path d="M6 9h2M9.5 9h2" {...stroke} /></>,
  cd: <path d="M5 12a3 3 0 0 1 0-6 4 4 0 0 1 8 0 3 3 0 0 1 0 6Z" {...stroke} />,
  dn: <><circle cx="9" cy="9" r="6" {...stroke} /><path d="M3 9h12M9 3c2 2 2 10 0 12M9 3c-2 2-2 10 0 12" {...stroke} /></>,
}

export function NodeGlyph({ type, size = 18 }: { type: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" style={{ display: 'block' }}>
      {GLYPH_PATHS[type] ?? <rect x="3" y="3" width="12" height="12" rx="2" {...stroke} />}
    </svg>
  )
}
