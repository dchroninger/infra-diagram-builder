import { useCallback } from 'react'
import { create } from 'zustand'

export type MascotSlot = 'launch' | 'canvas-center' | 'props-footer'
export type ReactionKind = 'happy' | 'wink' | 'surprised' | 'sad' | 'blush'

interface MascotReaction {
  kind: ReactionKind
  startedAt: number
}

interface MascotStore {
  activeSlot: MascotSlot | null
  anchors: Partial<Record<MascotSlot, HTMLElement>>
  reaction: MascotReaction | null
  setActive: (slot: MascotSlot) => void
  registerAnchor: (slot: MascotSlot, el: HTMLElement | null) => void
  react: (kind: ReactionKind) => void
  clearReaction: () => void
}

const MIN_REACTION_MS = 200

export const useMascotStore = create<MascotStore>((set, get) => ({
  activeSlot: null,
  anchors: {},
  reaction: null,
  setActive: (slot) => set({ activeSlot: slot }),
  registerAnchor: (slot, el) =>
    set((s) => {
      const next = { ...s.anchors }
      if (el) next[slot] = el
      else delete next[slot]
      return { anchors: next }
    }),
  react: (kind) => {
    const cur = get().reaction
    if (cur && performance.now() - cur.startedAt < MIN_REACTION_MS) return
    set({ reaction: { kind, startedAt: performance.now() } })
  },
  clearReaction: () => set({ reaction: null }),
}))

export function useMascot() {
  const setActive = useMascotStore((s) => s.setActive)
  const react = useMascotStore((s) => s.react)
  return { setActive, react }
}

export function useMascotAnchor(slot: MascotSlot) {
  const registerAnchor = useMascotStore((s) => s.registerAnchor)
  return useCallback(
    (el: HTMLDivElement | null) => {
      registerAnchor(slot, el)
    },
    [slot, registerAnchor],
  )
}
