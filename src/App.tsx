import { useEffect } from 'react'
import { selectOpenDiagram, useStore } from './store'
import { Launch } from './launch/Launch'
import { Editor } from './editor/Editor'

export default function App() {
  const tweaks = useStore((s) => s.tweaks)
  const setTweak = useStore((s) => s.setTweak)
  const open = useStore(selectOpenDiagram)
  const openStack = useStore((s) => s.openStack)
  const diagrams = useStore((s) => s.diagrams)
  const popOpen = useStore((s) => s.popOpen)
  const jumpTo = useStore((s) => s.jumpTo)
  const createDiagram = useStore((s) => s.createDiagram)

  // Sync theme + accent to <html>
  useEffect(() => {
    document.documentElement.dataset.theme = tweaks.theme
    document.documentElement.dataset.accent = tweaks.accent
  }, [tweaks.theme, tweaks.accent])

  // ⌘N to create a new diagram on launch screen
  useEffect(() => {
    if (open) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        createDiagram('blank')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, createDiagram])

  const toggleTheme = () => setTweak('theme', tweaks.theme === 'dark' ? 'light' : 'dark')

  const crumbs = openStack.map((id) => ({ id, name: diagrams[id]?.name ?? 'Untitled' }))

  return (
    <div className="kn-app">
      {!open && <Launch brand={tweaks.brand} theme={tweaks.theme} />}
      {open && (
        <Editor
          key={open.id}
          diagram={open}
          brand={tweaks.brand}
          theme={tweaks.theme}
          toggleTheme={toggleTheme}
          crumbs={crumbs}
          onBack={popOpen}
          onCrumbJump={jumpTo}
        />
      )}
    </div>
  )
}
