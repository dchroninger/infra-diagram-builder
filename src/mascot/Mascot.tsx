import { useEffect, useRef, useState } from 'react'
import { useMascotStore, type ReactionKind } from './store'

const IDLE_MS = 20000
const PUPIL_MAX = 2
const MOUTH_MAX = 6.4
const ACTIVE_RADIUS = 280
const EYE_LERP = 0.35
const MOUTH_LERP = 0.09

const HOP_SHORT_THRESHOLD = 400
const HOP_BASE_MS = 350
const HOP_PEAK = 80

const FLOAT_DY_THRESHOLD = -50
const FLOAT_BASE_MS = 700
const FLOAT_SWAY = 6
const LAND_MS = 380
const LAND_HOP_PEAK = 14

const BLINK_MIN_MS = 2500
const BLINK_MAX_MS = 6500
const BLINK_CLOSED_MS = 120
const DOUBLE_BLINK_CHANCE = 0.12
const DOUBLE_BLINK_GAP_MS = 90

const REACTION_DURATIONS: Record<ReactionKind, number> = {
  happy: 600,
  wink: 200,
  surprised: 400,
  sad: 600,
  blush: 800,
}

interface Pos {
  x: number
  y: number
  size: number
}

export function Mascot() {
  const activeSlot = useMascotStore((s) => s.activeSlot)
  const anchors = useMascotStore((s) => s.anchors)
  const reaction = useMascotStore((s) => s.reaction)
  const clearReaction = useMascotStore((s) => s.clearReaction)

  const [pos, setPos] = useState<Pos | null>(null)
  const [eyes, setEyes] = useState({ x: 0, y: 0 })
  const [mouth, setMouth] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState({ x: 1, y: 1 })
  const [sleepy, setSleepy] = useState(false)
  const [blinking, setBlinking] = useState(false)

  type Anim =
    | { kind: 'hop'; from: { x: number; y: number }; to: { x: number; y: number }; startTime: number; duration: number; count: number }
    | { kind: 'float'; from: { x: number; y: number }; to: { x: number; y: number }; startTime: number; duration: number }

  const sr = useRef({
    target: { x: 0, y: 0 },
    eyeNow: { x: 0, y: 0 },
    mouthNow: { x: 0, y: 0 },
    pos: null as Pos | null,
    anim: null as Anim | null,
  })

  const reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const activeAnchor = activeSlot ? anchors[activeSlot] : null
  const bobbing = useRef(false)
  bobbing.current = activeSlot === 'canvas-center'

  useEffect(() => {
    if (!activeAnchor) return
    const r = activeAnchor.getBoundingClientRect()
    const target = { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    const size = Math.min(r.width, r.height)

    if (sr.current.pos == null || reducedMotion) {
      sr.current.pos = { x: target.x, y: target.y, size }
      setPos({ ...sr.current.pos })
      return
    }

    const from = sr.current.pos
    const distance = Math.hypot(target.x - from.x, target.y - from.y)
    if (distance < 5) {
      sr.current.pos = { x: target.x, y: target.y, size }
      setPos({ ...sr.current.pos })
      return
    }

    const dy = target.y - from.y
    if (dy < FLOAT_DY_THRESHOLD) {
      sr.current.anim = {
        kind: 'float',
        from: { x: from.x, y: from.y },
        to: { x: target.x, y: target.y },
        startTime: performance.now(),
        duration: Math.max(FLOAT_BASE_MS, distance * 1.2) + LAND_MS,
      }
    } else {
      const numHops = distance < HOP_SHORT_THRESHOLD ? 1 : Math.ceil(distance / 350)
      sr.current.anim = {
        kind: 'hop',
        from: { x: from.x, y: from.y },
        to: { x: target.x, y: target.y },
        startTime: performance.now(),
        duration: numHops * HOP_BASE_MS,
        count: numHops,
      }
    }
    sr.current.pos = { x: from.x, y: from.y, size }
  }, [activeAnchor, reducedMotion])

  useEffect(() => {
    let rafId: number | null = null
    let idleId: number | null = null

    const arm = () => {
      if (idleId != null) window.clearTimeout(idleId)
      idleId = window.setTimeout(() => setSleepy(true), IDLE_MS)
    }

    const onMove = (e: MouseEvent) => {
      setSleepy(false)
      arm()
      const cur = sr.current
      if (!cur.pos) return
      const dx = e.clientX - cur.pos.x
      const dy = e.clientY - cur.pos.y
      const dist = Math.hypot(dx, dy)
      if (dist > ACTIVE_RADIUS) {
        cur.target.x = 0
        cur.target.y = 0
        return
      }
      const k = dist / ACTIVE_RADIUS
      const a = Math.atan2(dy, dx)
      cur.target.x = Math.cos(a) * k
      cur.target.y = Math.sin(a) * k
    }

    const onLeave = () => {
      sr.current.target.x = 0
      sr.current.target.y = 0
    }

    const tick = () => {
      const cur = sr.current

      if (cur.anim && cur.pos) {
        const elapsed = performance.now() - cur.anim.startTime
        const t = elapsed / cur.anim.duration
        if (t >= 1) {
          cur.pos = { x: cur.anim.to.x, y: cur.anim.to.y, size: cur.pos.size }
          cur.anim = null
          setPos({ ...cur.pos })
          setScale({ x: 1, y: 1 })
        } else if (cur.anim.kind === 'hop') {
          const ease = easeOutCubic(t)
          const baseX = cur.anim.from.x + (cur.anim.to.x - cur.anim.from.x) * ease
          const baseY = cur.anim.from.y + (cur.anim.to.y - cur.anim.from.y) * ease
          const hopT = (t * cur.anim.count) % 1
          const arc = -HOP_PEAK * Math.sin(Math.PI * hopT)
          const sy = hopScale(hopT)
          const sx = 1 / Math.sqrt(sy)
          cur.pos = { x: baseX, y: baseY + arc, size: cur.pos.size }
          setPos({ ...cur.pos })
          setScale({ x: sx, y: sy })
        } else {
          const totalDur = cur.anim.duration
          const floatDur = totalDur - LAND_MS
          if (elapsed < floatDur) {
            const ft = elapsed / floatDur
            const ease = easeInOutCubic(ft)
            const baseX = cur.anim.from.x + (cur.anim.to.x - cur.anim.from.x) * ease
            const baseY = cur.anim.from.y + (cur.anim.to.y - cur.anim.from.y) * ease
            const sway = FLOAT_SWAY * Math.sin(ft * Math.PI * 2) * (1 - ft)
            cur.pos = { x: baseX + sway, y: baseY, size: cur.pos.size }
            setPos({ ...cur.pos })
            setScale({ x: 1, y: 1 })
          } else {
            const lt = (elapsed - floatDur) / LAND_MS
            const sy = hopScale(lt)
            const sx = 1 / Math.sqrt(sy)
            const landY = -LAND_HOP_PEAK * Math.sin(Math.PI * lt)
            cur.pos = { x: cur.anim.to.x, y: cur.anim.to.y + landY, size: cur.pos.size }
            setPos({ ...cur.pos })
            setScale({ x: sx, y: sy })
          }
        }
      } else if (cur.pos && bobbing.current) {
        const bobY = -8 * Math.sin(performance.now() / 700)
        setPos({ x: cur.pos.x, y: cur.pos.y + bobY, size: cur.pos.size })
      }

      cur.eyeNow.x += (cur.target.x * PUPIL_MAX - cur.eyeNow.x) * EYE_LERP
      cur.eyeNow.y += (cur.target.y * PUPIL_MAX - cur.eyeNow.y) * EYE_LERP
      cur.mouthNow.x += (cur.target.x * MOUTH_MAX - cur.mouthNow.x) * MOUTH_LERP
      cur.mouthNow.y += (cur.target.y * MOUTH_MAX - cur.mouthNow.y) * MOUTH_LERP
      setEyes({ x: cur.eyeNow.x, y: cur.eyeNow.y })
      setMouth({ x: cur.mouthNow.x, y: cur.mouthNow.y })

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
  }, [])

  useEffect(() => {
    const onResize = () => {
      if (sr.current.anim || !activeAnchor) return
      const r = activeAnchor.getBoundingClientRect()
      sr.current.pos = {
        x: r.left + r.width / 2,
        y: r.top + r.height / 2,
        size: Math.min(r.width, r.height),
      }
      setPos({ ...sr.current.pos })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [activeAnchor])

  useEffect(() => {
    if (!reaction) return
    const dur = REACTION_DURATIONS[reaction.kind]
    const t = window.setTimeout(clearReaction, dur)
    return () => window.clearTimeout(t)
  }, [reaction, clearReaction])

  useEffect(() => {
    let nextId: number | null = null
    let openId: number | null = null
    const blink = () => {
      setBlinking(true)
      openId = window.setTimeout(() => {
        setBlinking(false)
        if (Math.random() < DOUBLE_BLINK_CHANCE) {
          openId = window.setTimeout(blink, DOUBLE_BLINK_GAP_MS)
        } else {
          schedule()
        }
      }, BLINK_CLOSED_MS)
    }
    const schedule = () => {
      const delay = BLINK_MIN_MS + Math.random() * (BLINK_MAX_MS - BLINK_MIN_MS)
      nextId = window.setTimeout(blink, delay)
    }
    schedule()
    return () => {
      if (nextId != null) window.clearTimeout(nextId)
      if (openId != null) window.clearTimeout(openId)
    }
  }, [])

  if (!pos) return null

  return (
    <div
      className="kn-mascot"
      style={{
        position: 'fixed',
        left: pos.x - pos.size / 2,
        top: pos.y - pos.size / 2,
        width: pos.size,
        height: pos.size,
        transform: `scale(${scale.x}, ${scale.y})`,
        transformOrigin: 'center bottom',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      <CloudFace size={pos.size} eyes={eyes} mouth={mouth} sleepy={sleepy} blinking={blinking} reaction={reaction?.kind ?? null} />
    </div>
  )
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function hopScale(hopT: number): number {
  if (hopT < 0.1) return 0.8 + (1.15 - 0.8) * (hopT / 0.1)
  if (hopT < 0.5) return 1.15 + (1.0 - 1.15) * ((hopT - 0.1) / 0.4)
  if (hopT < 0.9) return 1.0 + (1.15 - 1.0) * ((hopT - 0.5) / 0.4)
  return 1.15 + (0.8 - 1.15) * ((hopT - 0.9) / 0.1)
}

interface CloudFaceProps {
  size: number
  eyes: { x: number; y: number }
  mouth: { x: number; y: number }
  sleepy: boolean
  blinking: boolean
  reaction: ReactionKind | null
}

function CloudFace({ size, eyes, mouth, sleepy, blinking, reaction }: CloudFaceProps) {
  const showBlush = reaction === 'blush'
  const eyesClosed = sleepy || blinking
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={{ overflow: 'visible' }}>
      <path
        d="M18 44 C 8 44 6 30 16 28 C 16 18 28 14 34 22 C 42 16 54 22 52 32 C 60 32 60 44 50 44 Z"
        fill="var(--accent-soft)"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {showBlush && (
        <g stroke="var(--pink, #ff8db4)" strokeWidth="1.4" strokeLinecap="round" opacity="0.85">
          <path d="M19 37 l4 -2" />
          <path d="M19 39 l4 -2" />
          <path d="M19 41 l4 -2" />
          <path d="M41 37 l4 -2" />
          <path d="M41 39 l4 -2" />
          <path d="M41 41 l4 -2" />
        </g>
      )}
      {eyesClosed ? (
        <>
          <path d="M21 34 Q 24 37 27 34" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <path d="M37 34 Q 40 37 43 34" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <circle cx={24 + eyes.x} cy={34 + eyes.y} r="2" fill="var(--accent)" />
          <circle cx={40 + eyes.x} cy={34 + eyes.y} r="2" fill="var(--accent)" />
        </>
      )}
      {sleepy ? (
        <>
          <path d="M28 40 Q 32 41 36 40" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.8" />
          <text className="kn-cloud-z kn-cloud-z1" x="50" y="20" fill="var(--accent)" fontSize="9" fontWeight="700" fontFamily="ui-rounded, system-ui, sans-serif">z</text>
          <text className="kn-cloud-z kn-cloud-z2" x="56" y="12" fill="var(--accent)" fontSize="6" fontWeight="700" fontFamily="ui-rounded, system-ui, sans-serif">z</text>
        </>
      ) : (
        <path
          d="M28 39 Q 32 42 36 39"
          transform={`translate(${mouth.x} ${mouth.y})`}
          stroke="var(--accent)"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
      )}
    </svg>
  )
}
