"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number; y: number; vx: number; vy: number; g: number
  size: number; color: string; life: number; rot: number; vr: number
}

let particles: Particle[] = []
let running = false
let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null

export function burstConfetti(x?: number, y?: number, big = false) {
  if (!canvas || !ctx) return
  const cx = x ?? window.innerWidth / 2
  const cy = y ?? window.innerHeight / 2
  const colors = ["#ff4d3d", "#fbbf24", "#4cc9f0", "#b388ff", "#ff7043", "#4ade80"]
  const count = big ? 140 : 40
  for (let i = 0; i < count; i++) {
    particles.push({
      x: cx, y: cy,
      vx: (Math.random() - 0.5) * (big ? 20 : 12),
      vy: (Math.random() - 1) * (big ? 18 : 10),
      g: 0.4,
      size: 4 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 60 + Math.random() * 40,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
    })
  }
  if (!running) animate()
}

function animate() {
  if (!ctx || !canvas) return
  running = true
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  particles = particles.filter(p => p.life > 0)
  for (const p of particles) {
    p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--
    ctx.save()
    ctx.translate(p.x, p.y); ctx.rotate(p.rot)
    ctx.fillStyle = p.color
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
    ctx.restore()
  }
  if (particles.length > 0) requestAnimationFrame(animate)
  else { running = false; ctx.clearRect(0, 0, canvas.width, canvas.height) }
}

export default function ConfettiCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    canvas = ref.current
    ctx = canvas?.getContext("2d") ?? null
    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [])

  return <canvas ref={ref} className="fixed inset-0 pointer-events-none z-[99]" />
}
