import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import * as THREE from 'three'

export function SimplePlayer() {
  const { camera } = useThree()
  const [, getKeys] = useKeyboardControls()
  const playerRef = useRef<THREE.Object3D>(null)
  const positionRef = useRef(new THREE.Vector3(0, 2, 5))
  const velocityRef = useRef(new THREE.Vector3(0, 0, 0))

  useFrame((state, delta) => {
    const { forward, backward, leftward, rightward, jump, run } = getKeys()
    
    const speed = run ? 10 : 5
    const direction = new THREE.Vector3()
    
    // Get camera direction
    camera.getWorldDirection(direction)
    direction.y = 0
    direction.normalize()
    
    // Get right vector
    const right = new THREE.Vector3()
    right.crossVectors(direction, new THREE.Vector3(0, 1, 0))
    
    // Calculate movement
    let moveVector = new THREE.Vector3(0, 0, 0)
    
    if (forward) {
      moveVector.add(direction.multiplyScalar(speed))
    }
    if (backward) {
      moveVector.add(direction.multiplyScalar(-speed))
    }
    if (leftward) {
      moveVector.add(right.multiplyScalar(-speed))
    }
    if (rightward) {
      moveVector.add(right.multiplyScalar(speed))
    }
    
    // Apply movement
    moveVector.multiplyScalar(delta)
    positionRef.current.add(moveVector)
    
    // Simple gravity and jumping
    if (jump && positionRef.current.y <= 2.1) {
      velocityRef.current.y = 8
    }
    
    // Apply gravity
    velocityRef.current.y -= 15 * delta
    positionRef.current.y += velocityRef.current.y * delta
    
    // Ground collision
    if (positionRef.current.y <= 2) {
      positionRef.current.y = 2
      velocityRef.current.y = 0
    }
    
    // Update camera position
    camera.position.copy(positionRef.current)
    camera.position.y += 0.5 // Eye level
  })

  return null // Invisible player
}