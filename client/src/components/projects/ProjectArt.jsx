import { useMemo } from 'react'
import './project-art.css'

// Deterministic generative artwork for projects without an uploaded cover:
// a small animated "system" (orbits, nodes, data pulses) seeded by the slug,
// so each project keeps the same distinctive visual on every visit.

const PALETTES = [
  { a: '#5b7fff', b: '#86a3ff', glow: 'rgba(91, 127, 255, 0.35)' },
  { a: '#3fb7ff', b: '#8fd6ff', glow: 'rgba(63, 183, 255, 0.3)' },
  { a: '#8b6bff', b: '#b9a6ff', glow: 'rgba(139, 107, 255, 0.32)' },
  { a: '#2fd1b2', b: '#8ce9d7', glow: 'rgba(47, 209, 178, 0.28)' },
]

function hash(text) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function random(seed) {
  let t = seed
  return () => {
    t = (t + 0x6d2b79f5) | 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function initials(title) {
  return title
    .split(/\s+/)
    .filter((w) => /^[A-Za-z0-9]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

const W = 400
const H = 300
const CX = W * 0.62
const CY = H * 0.46

export default function ProjectArt({ project, index = 0 }) {
  const art = useMemo(() => {
    const rand = random(hash(project.slug || project.title || String(index)))
    const nodeCount = 5 + Math.floor(rand() * 3)
    const nodes = Array.from({ length: nodeCount }, (_, i) => {
      const angle = (i / nodeCount) * Math.PI * 2 + rand() * 0.6
      const radius = 60 + rand() * 70
      return {
        x: CX + Math.cos(angle) * radius * 1.25,
        y: CY + Math.sin(angle) * radius * 0.8,
        r: 2.5 + rand() * 3.5,
      }
    })
    // Hub-and-spoke plus a ring, like a service architecture.
    const links = nodes.map((n, i) => ({ from: { x: CX, y: CY }, to: n, delay: rand() * 4, id: `s${i}` }))
    nodes.forEach((n, i) => {
      if (rand() > 0.45) links.push({ from: n, to: nodes[(i + 1) % nodes.length], delay: rand() * 4, id: `r${i}` })
    })
    const orbits = [0, 1, 2].map((i) => ({
      rx: 70 + i * 42 + rand() * 12,
      ry: 34 + i * 24 + rand() * 8,
      tilt: -18 + rand() * 36,
      speed: 28 + i * 14 + rand() * 10,
      reverse: i % 2 === 1,
    }))
    return { nodes, links, orbits, palette: PALETTES[index % PALETTES.length] }
  }, [project.slug, project.title, index])

  const { palette } = art

  return (
    <div
      className="project-art"
      style={{ '--art-a': palette.a, '--art-b': palette.b, '--art-glow': palette.glow }}
      aria-hidden="true"
    >
      <span className="project-art__monogram">{initials(project.title)}</span>

      <svg className="project-art__svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id={`art-core-${index}`}>
            <stop offset="0%" stopColor={palette.b} stopOpacity="0.9" />
            <stop offset="100%" stopColor={palette.a} stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="project-art__layer project-art__layer--back">
          {art.orbits.map((o, i) => (
            <g key={i} transform={`translate(${CX} ${CY}) rotate(${o.tilt})`}>
              <g
                className={`project-art__orbit ${o.reverse ? 'project-art__orbit--reverse' : ''}`}
                style={{ '--speed': `${o.speed}s` }}
              >
                <ellipse rx={o.rx} ry={o.ry} className="project-art__orbit-path" />
                <circle cx={o.rx} cy="0" r="2.2" className="project-art__satellite" />
              </g>
            </g>
          ))}
        </g>

        <g className="project-art__layer project-art__layer--mid">
          {art.links.map((l) => (
            <g key={l.id}>
              <line x1={l.from.x} y1={l.from.y} x2={l.to.x} y2={l.to.y} className="project-art__link" />
              <line
                x1={l.from.x}
                y1={l.from.y}
                x2={l.to.x}
                y2={l.to.y}
                className="project-art__pulse"
                style={{ animationDelay: `${l.delay}s` }}
              />
            </g>
          ))}
        </g>

        <g className="project-art__layer project-art__layer--front">
          <circle cx={CX} cy={CY} r="46" fill={`url(#art-core-${index})`} className="project-art__core-glow" />
          <circle cx={CX} cy={CY} r="9" className="project-art__core" />
          {art.nodes.map((n, i) => (
            <circle
              key={i}
              cx={n.x}
              cy={n.y}
              r={n.r}
              className="project-art__node"
              style={{ animationDelay: `${i * 0.35}s` }}
            />
          ))}
        </g>
      </svg>

      <span className="project-art__scan" />
    </div>
  )
}
