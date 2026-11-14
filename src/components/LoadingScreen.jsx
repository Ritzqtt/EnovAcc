import { useEffect, useRef, useState } from 'react'
import './LoadingScreen.css'

/**
 * Wave tuning — all amplitudes are in em of the wordmark font size.
 * Enlarge AMPLITUDE_* for taller crests, lower SPEED_* for a slower roll,
 * raise TILT for more side-to-side slosh.
 */
const WAVE_CONFIG = {
  AMPLITUDE_FRONT: 0.09, // em — primary rolling wave
  AMPLITUDE_BACK: 0.05, // em — secondary crossing wave
  WAVELENGTH_FRONT: 0.55, // × wordmark width
  WAVELENGTH_BACK: 0.35, // × wordmark width
  SPEED_FRONT: 1.7, // seconds per cycle
  SPEED_BACK: 2.4, // seconds per cycle
  TILT: 0.05, // radians (~3°) of side-to-side slosh
  TILT_PERIOD: 3.2, // seconds
  BACK_LAYER_PHASE: 1.2, // radians
  BACK_LAYER_LEVEL: 0.03, // em above the front surface
  HIGHLIGHT_SIZE: 2, // px
}

const SAMPLE_COUNT = 100
// Ink bounds of "EnovAcc" inside its 1em line box, measured at 1287px wide.
const GLYPH_TOP = 0.13 // em from the top of the line box
const GLYPH_BOTTOM = 0.87 // em from the top of the line box
const LEVEL_MARGIN = 0.02 // em extra clearance at either extreme

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

const smoothstep = (edge0, edge1, value) => {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

/**
 * Full-screen first-load preloader.
 *
 * The wordmark is drawn four times: a dim ghost, a translucent back wave, the
 * solid front wave, and a thin crest highlight. Every frame the front/back
 * surfaces are recomputed from the eased progress value that also drives the
 * percentage label. Only clip-path is written per frame; element dimensions
 * are measured once per resize.
 */
export default function LoadingScreen({ onDone, onReveal }) {
  const [phase, setPhase] = useState('loading')
  const [reduced] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const frontRef = useRef(null)
  const backRef = useRef(null)
  const highlightRef = useRef(null)
  const labelRef = useRef(null)
  const onDoneRef = useRef(onDone)
  const onRevealRef = useRef(onReveal)

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    onRevealRef.current = onReveal
  }, [onReveal])

  useEffect(() => {
    const reduceMotion = reduced
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const timers = []
    let rafId = 0
    let cancelled = false
    let loadHandler = null
    let metrics = null

    const measure = () => {
      const element = frontRef.current
      if (!element) return null
      const rect = element.getBoundingClientRect()
      const fontSize =
        parseFloat(window.getComputedStyle(element).fontSize) || rect.height
      return {
        width: rect.width,
        height: rect.height,
        fontSize,
      }
    }

    const setLabel = (value) => {
      if (labelRef.current) {
        labelRef.current.textContent = `loading... ${value} %`
      }
    }

    const setSolid = () => {
      if (frontRef.current) frontRef.current.style.clipPath = 'none'
      if (backRef.current) backRef.current.style.clipPath = 'none'
      if (highlightRef.current) highlightRef.current.style.clipPath = 'none'
    }

    const buildFillPath = (surfaceAt, width, height) => {
      const points = []

      for (let index = 0; index <= SAMPLE_COUNT; index += 1) {
        const x = (index / SAMPLE_COUNT) * width
        const y = Math.min(height, surfaceAt(x))
        points.push(`${x.toFixed(1)} ${y.toFixed(1)}`)
      }

      return `path("M ${points.join(' L ')} L ${width.toFixed(1)} ${height.toFixed(1)} L 0 ${height.toFixed(1)} Z")`
    }

    const buildHighlightPath = (surfaceAt, width) => {
      const top = []
      const bottom = []
      const rise = WAVE_CONFIG.HIGHLIGHT_SIZE

      for (let index = 0; index <= SAMPLE_COUNT; index += 1) {
        const x = (index / SAMPLE_COUNT) * width
        const y = surfaceAt(x)
        top.push(`${x.toFixed(1)} ${(y - rise).toFixed(1)}`)
        bottom.push(`${x.toFixed(1)} ${y.toFixed(1)}`)
      }

      bottom.reverse()
      return `path("M ${top.join(' L ')} L ${bottom.join(' L ')} Z")`
    }

    const drawFill = (progress, elapsedMs) => {
      const front = frontRef.current
      if (!front) return

      if (progress >= 0.999) {
        setSolid()
        return
      }

      metrics = metrics ?? measure()
      if (!metrics) return

      const { width, height, fontSize } = metrics
      const em = fontSize
      const seconds = elapsedMs / 1000

      // Envelope: crests appear immediately, hold, then calm to flat at 100%.
      const envelope = smoothstep(0, 0.05, progress) *
        (1 - smoothstep(0.85, 1, progress))

      const tilt =
        WAVE_CONFIG.TILT * Math.sin((2 * Math.PI * seconds) / WAVE_CONFIG.TILT_PERIOD)

      // Waterline travels from just below the letters to just above them.
      // The envelope flattens the wave at both ends, so no extra wave margin
      // is needed in the level itself.
      const levelStart = (GLYPH_BOTTOM + LEVEL_MARGIN) * em
      const levelEnd = (GLYPH_TOP - LEVEL_MARGIN) * em
      const level = levelStart + (levelEnd - levelStart) * progress

      const frontPhase = -(2 * Math.PI * seconds) / WAVE_CONFIG.SPEED_FRONT
      const backPhase =
        (2 * Math.PI * seconds) / WAVE_CONFIG.SPEED_BACK + 1.7

      const makeSurface = (levelOffsetEm, phaseShift) => (x) => {
        const primary = Math.sin(
          (2 * Math.PI * x) / (width * WAVE_CONFIG.WAVELENGTH_FRONT) +
            frontPhase +
            phaseShift,
        )
        const secondary = Math.sin(
          (2 * Math.PI * x) / (width * WAVE_CONFIG.WAVELENGTH_BACK) +
            backPhase +
            phaseShift,
        )
        const displacement =
          WAVE_CONFIG.AMPLITUDE_FRONT * em * primary +
          WAVE_CONFIG.AMPLITUDE_BACK * em * secondary -
          tilt * (x - width / 2)

        return level + levelOffsetEm * em - envelope * displacement
      }

      const frontSurface = makeSurface(0, 0)
      const backSurface = makeSurface(
        -envelope * WAVE_CONFIG.BACK_LAYER_LEVEL,
        WAVE_CONFIG.BACK_LAYER_PHASE,
      )

      front.style.clipPath = buildFillPath(frontSurface, width, height)

      if (backRef.current) {
        backRef.current.style.clipPath = buildFillPath(
          backSurface,
          width,
          height,
        )
      }

      if (highlightRef.current) {
        highlightRef.current.style.clipPath = buildHighlightPath(
          frontSurface,
          width,
        )
      }
    }

    const finish = () => {
      if (!cancelled) onDoneRef.current?.()
    }

    const startExit = () => {
      if (cancelled) return
      setPhase('exit')
      // Reveal the landing page when the fade is ~60% done (700ms × 0.6).
      timers.push(setTimeout(() => onRevealRef.current?.(), 420))
      timers.push(setTimeout(finish, 740))
    }

    const startHold = () => {
      if (cancelled) return
      setPhase('hold')
      timers.push(setTimeout(startExit, 500))
    }

    drawFill(0, 0)
    setLabel(0)

    if (reduceMotion) {
      // Skip the long fill and wave motion: solid word, short hold, fade out.
      setLabel(100)
      setSolid()
      timers.push(setTimeout(() => setPhase('hold'), 400))
      timers.push(setTimeout(startExit, 650))
    } else {
      const mountTime = performance.now()

      const handleResize = () => {
        metrics = measure()
      }
      window.addEventListener('resize', handleResize)

      const beginFill = () => {
        if (cancelled) return

        // Re-measure after the font has settled.
        metrics = measure()
        const fillStart = performance.now()
        let lastPercent = 0

        const tick = (now) => {
          if (cancelled) return

          const raw = clamp((now - fillStart) / 3000, 0, 1)
          const progress = easeInOutCubic(raw)
          const percent = Math.round(progress * 100)

          if (percent !== lastPercent) {
            lastPercent = percent
            setLabel(percent)
          }

          drawFill(progress, now - fillStart)

          if (raw < 1) {
            rafId = requestAnimationFrame(tick)
          } else {
            setLabel(100)
            setSolid()
            startHold()
          }
        }

        rafId = requestAnimationFrame(tick)
      }

      const assetReady = [
        document.fonts?.ready ?? Promise.resolve(),
        document.readyState === 'complete'
          ? Promise.resolve()
          : new Promise((resolve) => {
              loadHandler = resolve
              window.addEventListener('load', resolve, { once: true })
            }),
      ]

      // Safety valve: never hold the page hostage to a slow asset.
      const safety = new Promise((resolve) => {
        timers.push(setTimeout(resolve, 5000))
      })

      Promise.race([Promise.all(assetReady), safety]).then(() => {
        if (cancelled) return
        const wait = Math.max(0, 400 - (performance.now() - mountTime))
        timers.push(setTimeout(beginFill, wait))
      })

      timers.push(() => window.removeEventListener('resize', handleResize))
    }

    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
      timers.forEach((timer) => {
        if (typeof timer === 'function') timer()
        else clearTimeout(timer)
      })
      if (loadHandler) {
        window.removeEventListener('load', loadHandler)
      }
      document.body.style.overflow = previousOverflow
    }
  }, [reduced])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading EnovAcc"
      className={[
        'loading-screen',
        phase === 'hold' ? 'is-holding' : '',
        phase === 'exit' ? 'is-exiting' : '',
        reduced ? 'is-reduced' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="loading-screen__inner">
        <div className="ls-stage">
          <div className="ls-wordmark-wrap">
            <span aria-hidden="true" className="ls-word ls-ghost">
              EnovAcc
            </span>
            <span
              ref={backRef}
              aria-hidden="true"
              className="ls-word ls-fill ls-back"
            >
              EnovAcc
            </span>
            <span
              ref={frontRef}
              aria-hidden="true"
              className="ls-word ls-fill ls-front"
            >
              EnovAcc
            </span>
            <span
              ref={highlightRef}
              aria-hidden="true"
              className="ls-word ls-fill ls-highlight"
            >
              EnovAcc
            </span>
            <span ref={labelRef} className="ls-label">
              loading... 0 %
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
