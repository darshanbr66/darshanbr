import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function usePrefersReducedMotion() {
  const [reduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  return reduced
}

function Rig({ children }) {
  const group = useRef(null)
  const mouse = useRef({ x: 0, y: 0 })
  const { size } = useThree()
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const handleMove = (e) => {
      mouse.current.x = (e.clientX / size.width) * 2 - 1
      mouse.current.y = (e.clientY / size.height) * 2 - 1
    }
    window.addEventListener('mousemove', handleMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMove)
  }, [size.width, size.height])

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.getElapsedTime()
    if (!reducedMotion) {
      group.current.rotation.y += 0.0009
      group.current.position.y = Math.sin(t * 0.4) * 0.15
    }
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      mouse.current.y * 0.15,
      0.03
    )
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      -mouse.current.x * 0.1,
      0.03
    )
  })

  return <group ref={group}>{children}</group>
}

function WireShape({ position, geometryEl, color, speed = 1 }) {
  const ref = useRef(null)
  const reducedMotion = usePrefersReducedMotion()
  useFrame((state) => {
    if (!ref.current || reducedMotion) return
    const t = state.clock.getElapsedTime() * speed
    ref.current.rotation.x = t * 0.25
    ref.current.rotation.y = t * 0.18
  })
  return (
    <mesh ref={ref} position={position}>
      {geometryEl}
      <meshBasicMaterial color={color} wireframe transparent opacity={0.55} />
    </mesh>
  )
}

function generateParticlePositions(count) {
  const arr = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    arr[i * 3] = (Math.random() - 0.5) * 12
    arr[i * 3 + 1] = (Math.random() - 0.5) * 8
    arr[i * 3 + 2] = (Math.random() - 0.5) * 8
  }
  return arr
}

function Particles({ count = 220 }) {
  const [points] = useState(() => generateParticlePositions(count))
  const ref = useRef(null)
  const reducedMotion = usePrefersReducedMotion()
  useFrame((state) => {
    if (!ref.current || reducedMotion) return
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.02
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#5b7fff" transparent opacity={0.5} sizeAttenuation />
    </points>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.5], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <Rig>
          <WireShape
            position={[1.6, 0.3, 0]}
            geometryEl={<icosahedronGeometry args={[1.35, 0]} />}
            color="#86a3ff"
            speed={0.6}
          />
          <WireShape
            position={[-1.9, -0.4, -1]}
            geometryEl={<octahedronGeometry args={[0.8, 0]} />}
            color="#5b7fff"
            speed={0.9}
          />
          <WireShape
            position={[0.2, 1.4, -1.5]}
            geometryEl={<torusKnotGeometry args={[0.4, 0.12, 100, 16]} />}
            color="#3a4a7d"
            speed={1.1}
          />
        </Rig>
        <Particles />
      </Suspense>
    </Canvas>
  )
}
