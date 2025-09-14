import { useCallback, useEffect, useMemo, useRef } from 'react'
import './App.css'
 
type PanelCell = { row: number; col: number; title: string; color: string }

function App() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const hasScrolledToOriginRef = useRef(false)

  // Fixed 5x5 grid centered at (0,0): rows/cols in [-2, 2]
  const minRow = -2
  const maxRow = 2
  const minCol = -2
  const maxCol = 2
  const rowsCount = maxRow - minRow + 1 // 5
  const colsCount = maxCol - minCol + 1 // 5

  const computeViewportSize = useCallback(() => {
    const el = containerRef.current
    return {
      vw: el ? el.clientWidth : window.innerWidth,
      vh: el ? el.clientHeight : window.innerHeight,
    }
  }, [])

  const scrollToCell = useCallback((row: number, col: number, behavior: ScrollBehavior = 'smooth') => {
    const el = containerRef.current
    if (!el) return
    const { vw, vh } = computeViewportSize()
    const targetRowIndex = row - minRow
    const targetColIndex = col - minCol
    el.scrollTo({ left: targetColIndex * vw, top: targetRowIndex * vh, behavior })
  }, [computeViewportSize, minCol, minRow])

  // Initial scroll to origin (0,0)
  useEffect(() => {
    const el = containerRef.current
    if (!el || hasScrolledToOriginRef.current) return
    hasScrolledToOriginRef.current = true
    scrollToCell(0, 0, 'instant' as ScrollBehavior)
  }, [scrollToCell])

  // Arrow key navigation
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onKeyDown = (e: KeyboardEvent) => {
      const { vw, vh } = computeViewportSize()

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          el.scrollBy({ top: vh, left: 0, behavior: 'smooth' })
          break
        case 'ArrowUp':
          e.preventDefault()
          el.scrollBy({ top: -vh, left: 0, behavior: 'smooth' })
          break
        case 'ArrowRight':
          e.preventDefault()
          el.scrollBy({ left: vw, top: 0, behavior: 'smooth' })
          break
        case 'ArrowLeft':
          e.preventDefault()
          el.scrollBy({ left: -vw, top: 0, behavior: 'smooth' })
          break
        case 'Home':
          e.preventDefault()
          scrollToCell(0, 0)
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [computeViewportSize, scrollToCell])

  const panels: PanelCell[] = useMemo(() => {
    const list: PanelCell[] = []
    const total = rowsCount * colsCount
    for (let r = minRow; r <= maxRow; r += 1) {
      for (let c = minCol; c <= maxCol; c += 1) {
        const index = (r - minRow) * colsCount + (c - minCol)
        const hue = Math.round((index / Math.max(total, 1)) * 360)
        list.push({
          row: r,
          col: c,
          title: `Panel ${r}-${c}`,
          color: `hsl(${hue} 70% 45%)`,
        })
      }
    }
    return list
  }, [colsCount, maxCol, maxRow, minCol, minRow, rowsCount])

  return (
    <div className="viewportContainer">
      <div className="gridScroll" ref={containerRef}>
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${colsCount}, 100vw)`,
            gridTemplateRows: `repeat(${rowsCount}, 100vh)`,
          }}
        >
          {panels.map((p) => (
            <section
              key={`${p.row}:${p.col}`}
              className="panel"
              style={{ background: p.color }}
            >
              <div className="panelInner">
                <h1>{p.title}</h1>
                <p>Scroll in any direction. Arrow keys snap between panels. Press Home for origin.</p>
              </div>
            </section>
          ))}
        </div>
      </div>
      <div className="starFrame" aria-hidden="true">
        <div className="frameTop"></div>
        <div className="frameBottom"></div>
        <div className="frameLeft"></div>
        <div className="frameRight"></div>
      </div>
    </div>
  )
}

export default App
