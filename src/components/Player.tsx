import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useSphere } from '@react-three/cannon'
import { useKeyboardControls } from '@react-three/drei'
import * as THREE from 'three'

export function Player() {
  const { camera } = useThree()
  const [, getKeys] = useKeyboardControls()
  
  const [ref, api] = useSphere(() => ({
    mass: 1,
    type: 'Dynamic',
    position: [0, 5, 0],
    args: [0.5],
    material: {
      friction: 0.4,
      restitution: 0.1,
    },
  }))

  const velocity = useRef([0, 0, 0])
  const position = useRef([0, 5, 0])

  useEffect(() => {
    api.velocity.subscribe((v) => (velocity.current = v))
    api.position.subscribe((p) => (position.current = p))
  }, [api])

  useFrame(() => {
    const { forward, backward, leftward, rightward, jump, run } = getKeys()
    
    const speed = run ? 12 : 8
    const direction = new THREE.Vector3()
    
    camera.getWorldDirection(direction)
    direction.y = 0
    direction.normalize()
    
    const right = new THREE.Vector3()
    right.crossVectors(direction, new THREE.Vector3(0, 1, 0))
    
    let moveX = 0
    let moveZ = 0
    
    if (forward) {
      moveX -= direction.x * speed
      moveZ -= direction.z * speed
    }
    if (backward) {
      moveX += direction.x * speed
      moveZ += direction.z * speed
    }
    if (leftward) {
      moveX -= right.x * speed
      moveZ -= right.z * speed
    }
    if (rightward) {
      moveX += right.x * speed
      moveZ += right.z * speed
    }

    // Apply movement with current y velocity preserved
    api.velocity.set(moveX, velocity.current[1], moveZ)
    
    // Jump only if not already moving up much
    if (jump && Math.abs(velocity.current[1]) < 2) {
      api.velocity.set(velocity.current[0], 15, velocity.current[2])
    }

    // Update camera position to follow the player
    camera.position.set(
      position.current[0],
      position.current[1] + 1.7, // Eye level
      position.current[2]
    )
  })

  return (
    <mesh ref={ref} visible={false}>
      <sphereGeometry args={[0.5]} />
      <meshBasicMaterial color="red" transparent opacity={0.3} />
    </mesh>
  )
}