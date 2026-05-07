import type { PointerEvent } from 'react'

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
const HANDLES: ResizeHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']

interface Props {
  onStart: (e: PointerEvent<HTMLDivElement>, handle: ResizeHandle) => void
  locked?: boolean
}

export function ResizeHandles({ onStart, locked }: Props) {
  if (locked) return null
  return (
    <>
      {HANDLES.map((h) => (
        <div
          key={h}
          className={`kn-rh kn-rh-${h}`}
          onPointerDown={(e) => {
            e.stopPropagation()
            onStart(e, h)
          }}
        />
      ))}
    </>
  )
}
