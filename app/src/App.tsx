import { useCallback, useEffect, useMemo, useRef } from 'react'
import './App.css'
 
type PanelCell = { row: number; col: number; gRow: number; gCol: number; title: string; color: string }

function App() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const hasScrolledToOriginRef = useRef(false)
  const isRebasingRef = useRef(false)

  // Fixed 5x5 grid centered at (0,0): rows/cols in [-2, 2]
  const minRow = -2
  const maxRow = 2
  const minCol = -2
  const maxCol = 2
  const rowsCount = maxRow - minRow + 1 // 5
  const colsCount = maxCol - minCol + 1 // 5
  const renderedRows = rowsCount + 2 // add ghost ring top/bottom
  const renderedCols = colsCount + 2 // add ghost ring left/right

  const wrapCoord = useCallback((value: number, min: number, max: number) => {
    const range = max - min + 1
    let v = value
    while (v < min) v += range
    while (v > max) v -= range
    return v
  }, [])

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

  // Initial scroll to origin (0,0) in the grid (into the center of ghost ring)
  useEffect(() => {
    const el = containerRef.current
    if (!el || hasScrolledToOriginRef.current) return
    hasScrolledToOriginRef.current = true
    // Use instant to avoid animation on initial mount
    const { vw, vh } = computeViewportSize()
    const centerRowIndex = (0 - minRow) + 1 // real index + ghost offset
    const centerColIndex = (0 - minCol) + 1 // real index + ghost offset
    el.scrollTo({ left: centerColIndex * vw, top: centerRowIndex * vh, behavior: 'instant' as ScrollBehavior })
  }, [scrollToCell])

  // Seamless wrap (cylinder): rebase vertically from ghost edges to opposite real edges
  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el || isRebasingRef.current) return

    const { vw, vh } = computeViewportSize()
    const rowIndex = Math.round(el.scrollTop / vh)
    const colIndex = Math.round(el.scrollLeft / vw)

    const topGhost = 0
    const bottomGhost = renderedRows - 1 // 6
    const firstReal = 1
    const lastReal = renderedRows - 2 // 5

    let targetRowIndex = rowIndex
    let shouldRebase = false

    if (rowIndex === topGhost) {
      targetRowIndex = lastReal
      shouldRebase = true
    } else if (rowIndex === bottomGhost) {
      targetRowIndex = firstReal
      shouldRebase = true
    }

    if (shouldRebase) {
      isRebasingRef.current = true
      el.scrollTo({ left: colIndex * vw, top: targetRowIndex * vh, behavior: 'instant' as ScrollBehavior })
      // allow the scroll position to settle before unlocking
      requestAnimationFrame(() => { isRebasingRef.current = false })
    }
  }, [computeViewportSize, renderedCols, renderedRows])

  const panels: PanelCell[] = useMemo(() => {
    const list: PanelCell[] = []
    const total = rowsCount * colsCount
    for (let r = minRow - 1; r <= maxRow + 1; r += 1) {
      for (let c = minCol - 1; c <= maxCol + 1; c += 1) {
        const gRow = r - (minRow - 1)
        const gCol = c - (minCol - 1)
        const index = gRow * (colsCount + 2) + gCol
        const wr = wrapCoord(r, minRow, maxRow)
        const wc = wrapCoord(c, minCol, maxCol)
        const hue = Math.round((index / Math.max(total, 1)) * 360)
        list.push({
          row: wr,
          col: wc,
          gRow,
          gCol,
          title: `Panel ${wr}-${wc}`,
          color: `hsl(${hue} 70% 45%)`,
        })
      }
    }
    return list
  }, [colsCount, maxCol, maxRow, minCol, minRow, rowsCount, wrapCoord])

  return (
    <div className="viewportContainer">
      <div className="gridScroll" ref={containerRef} onScroll={handleScroll}>
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${renderedCols}, 100vw)`,
            gridTemplateRows: `repeat(${renderedRows}, 100vh)`,
          }}
        >
          {panels.map((p) => (
            <section
              key={`g${p.gRow}:${p.gCol}-r${p.row}:${p.col}`}
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
