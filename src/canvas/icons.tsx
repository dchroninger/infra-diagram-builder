import { useEffect, useRef, useState } from 'react'
import type { BrandName } from '../types'

export const IconSun = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4" />
    <path d="M8 1.5v2M8 12.5v2M14.5 8h-2M3.5 8h-2M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4M12.6 12.6l-1.4-1.4M4.8 4.8 3.4 3.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

export const IconMoon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M13 9.5A5.5 5.5 0 1 1 6.5 3a4.5 4.5 0 0 0 6.5 6.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
)

export const IconExport = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M8 10V2m0 0L5 5m3-3 3 3M3 11v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="m11 11 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

interface CloudGlyphProps {
  size?: number
  interactive?: boolean
}

const IDLE_MS = 20000
const PUPIL_MAX = 2
const MOUTH_MAX = 6.4
const ACTIVE_RADIUS = 280
const EYE_LERP = 0.35
const MOUTH_LERP = 0.09

export function CloudGlyph({ size = 32, interactive = false }: CloudGlyphProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [eyes, setEyes] = useState({ x: 0, y: 0 })
  const [mouth, setMouth] = useState({ x: 0, y: 0 })
  const [sleepy, setSleepy] = useState(false)

  useEffect(() => {
    if (!interactive) return
    const target = { x: 0, y: 0 }
    const eyeNow = { x: 0, y: 0 }
    const mouthNow = { x: 0, y: 0 }
    let idleId: number | null = null
    let rafId: number | null = null

    const arm = () => {
      if (idleId != null) window.clearTimeout(idleId)
      idleId = window.setTimeout(() => setSleepy(true), IDLE_MS)
    }
    const onMove = (e: MouseEvent) => {
      setSleepy(false)
      arm()
      const svg = svgRef.current
      if (!svg) return
      const r = svg.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      const dist = Math.hypot(dx, dy)
      if (dist > ACTIVE_RADIUS) {
        target.x = 0
        target.y = 0
        return
      }
      const k = dist / ACTIVE_RADIUS
      const a = Math.atan2(dy, dx)
      target.x = Math.cos(a) * k
      target.y = Math.sin(a) * k
    }
    const onLeave = () => {
      target.x = 0
      target.y = 0
    }
    const tick = () => {
      eyeNow.x += (target.x * PUPIL_MAX - eyeNow.x) * EYE_LERP
      eyeNow.y += (target.y * PUPIL_MAX - eyeNow.y) * EYE_LERP
      mouthNow.x += (target.x * MOUTH_MAX - mouthNow.x) * MOUTH_LERP
      mouthNow.y += (target.y * MOUTH_MAX - mouthNow.y) * MOUTH_LERP
      setEyes({ x: eyeNow.x, y: eyeNow.y })
      setMouth({ x: mouthNow.x, y: mouthNow.y })
      rafId = requestAnimationFrame(tick)
    }

    arm()
    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)
    rafId = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      if (idleId != null) window.clearTimeout(idleId)
      if (rafId != null) cancelAnimationFrame(rafId)
    }
  }, [interactive])

  return (
    <svg ref={svgRef} width={size} height={size} viewBox="0 0 64 64" fill="none" style={{ overflow: 'visible' }}>
      <path
        d="M18 44 C 8 44 6 30 16 28 C 16 18 28 14 34 22 C 42 16 54 22 52 32 C 60 32 60 44 50 44 Z"
        fill="var(--accent-soft)"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {sleepy ? (
        <>
          <path d="M21 34 Q 24 37 27 34" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <path d="M37 34 Q 40 37 43 34" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <path d="M28 40 Q 32 41 36 40" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.8" />
          <text className="kn-cloud-z kn-cloud-z1" x="50" y="20" fill="var(--accent)" fontSize="9" fontWeight="700" fontFamily="ui-rounded, system-ui, sans-serif">z</text>
          <text className="kn-cloud-z kn-cloud-z2" x="56" y="12" fill="var(--accent)" fontSize="6" fontWeight="700" fontFamily="ui-rounded, system-ui, sans-serif">z</text>
        </>
      ) : (
        <>
          <circle cx={24 + eyes.x} cy={34 + eyes.y} r="2" fill="var(--accent)" />
          <circle cx={40 + eyes.x} cy={34 + eyes.y} r="2" fill="var(--accent)" />
          <path
            d="M28 39 Q 32 42 36 39"
            transform={`translate(${mouth.x} ${mouth.y})`}
            stroke="var(--accent)"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
    </svg>
  )
}

export function BrandMark({ brand, size = 24 }: { brand: BrandName; size?: number }) {
  if (brand === 'Mochi') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect x="3" y="3" width="26" height="26" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="2" />
        <circle cx="11" cy="14" r="1.6" fill="var(--accent)" />
        <circle cx="21" cy="14" r="1.6" fill="var(--accent)" />
        <path d="M12 20 Q 16 23 20 20" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </svg>
    )
  }
  if (brand === 'Lattice') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <circle cx="9" cy="9" r="3" fill="var(--accent)" />
        <circle cx="23" cy="9" r="3" fill="var(--accent)" opacity="0.7" />
        <circle cx="9" cy="23" r="3" fill="var(--accent)" opacity="0.7" />
        <circle cx="23" cy="23" r="3" fill="var(--accent)" />
        <path d="M9 9h14M9 9v14M23 9v14M9 23h14" stroke="var(--accent)" strokeWidth="1.4" opacity="0.5" />
      </svg>
    )
  }
  return <CloudGlyph size={size} />
}

export function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
      <rect x="2.5" y="6" width="9" height="6" rx="1" fill="currentColor" />
      <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  )
}
