import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface BlockFragmentProps {
  position: [number, number, number]
  color: string
  velocity: THREE.Vector3
  angularVelocity: THREE.Vector3
  onLanded: (finalPosition: [number, number, number]) => void
  id: string
}

export function BlockFragment({
  position,
  color,
  velocity,
  angularVelocity,
  onLanded,
  id: _id
}: BlockFragmentProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const positionRef = useRef(new THREE.Vector3(...position))
  const velocityRef = useRef(velocity.clone())
  const angularVelRef = useRef(angularVelocity.clone())
  const hasLanded = useRef(false)

  // Suppress unused variable warning
  void _id

  useFrame((state, delta) => {
    if (!meshRef.current || hasLanded.current) return

    // Apply gravity
    velocityRef.current.y -= 15 * delta

    // Update position
    positionRef.current.add(velocityRef.current.clone().multiplyScalar(delta))

    // Ground collision
    if (positionRef.current.y <= 0.05) { // Small fragments sit slightly above ground
      positionRef.current.y = 0.05
      velocityRef.current.set(0, 0, 0)
      angularVelRef.current.multiplyScalar(0.95) // Slow down rotation

      if (!hasLanded.current) {
        hasLanded.current = true
        onLanded([positionRef.current.x, positionRef.current.y, positionRef.current.z])
      }
    }

    // Update mesh position
    meshRef.current.position.copy(positionRef.current)

    // Apply rotation
    meshRef.current.rotation.x += angularVelRef.current.x * delta
    meshRef.current.rotation.y += angularVelRef.current.y * delta
    meshRef.current.rotation.z += angularVelRef.current.z * delta
  })

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshLambertMaterial color={color} />
    </mesh>
  )
}