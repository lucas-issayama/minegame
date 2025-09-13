import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useKeyboardControls, Text } from '@react-three/drei'
import * as THREE from 'three'

interface PickaxeProps {
  onHit: () => void
}

export function Pickaxe({ onHit }: PickaxeProps) {
  const { camera } = useThree()
  const [, getKeys] = useKeyboardControls()
  const pickaxeRef = useRef<THREE.Group>(null)
  const [isSwinging, setIsSwinging] = useState(false)
  const [mousePressed, setMousePressed] = useState(false)

  // Add mouse event listeners
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) { // Left mouse button
        setMousePressed(true)
      }
    }

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 0) { // Left mouse button
        setMousePressed(false)
      }
    }

    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  useFrame((state) => {
    if (!pickaxeRef.current) return

    const { hit } = getKeys()

    // Handle hit animation - triggered by either key or mouse
    if ((hit || mousePressed) && !isSwinging) {
      setIsSwinging(true)
      onHit()
      setTimeout(() => setIsSwinging(false), 300) // Animation duration
    }

    // Get camera direction for pickaxe positioning
    const cameraDirection = new THREE.Vector3()
    camera.getWorldDirection(cameraDirection)

    const rightVector = new THREE.Vector3()
    rightVector.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0))

    // Base position relative to camera (right side)
    const basePos = rightVector.clone().multiplyScalar(0.3)

    // Add forward offset
    const forwardOffset = cameraDirection.clone().multiplyScalar(0.8)
    basePos.add(forwardOffset)

    // Add downward offset
    basePos.y -= 0.4

    // Base position (bottom-right of screen)
    pickaxeRef.current.position.copy(camera.position).add(basePos)

    if (isSwinging) {
      // Movimento giratório no eixo Z - cabeça vai de Y para Z
      const swingTime = (Date.now() % 300) / 300 // 0 to 1 over 300ms
      const rotationAngle = Math.sin(swingTime * Math.PI) * Math.PI / 2 // 90 degrees rotation

      // Rotação no eixo Z - cabeça move de (0, ymax, 0) para (0, 0, zmax)
      pickaxeRef.current.rotation.x = 0
      pickaxeRef.current.rotation.y = 0
      pickaxeRef.current.rotation.z = -rotationAngle // Negativo para rotação correta
    } else {
      // Posição idle com bobbing sutil
      pickaxeRef.current.position.add(new THREE.Vector3(0, Math.sin(state.clock.elapsedTime * 1.5) * 0.02, 0))

      // Orientação inicial - picareta vertical com cabeça em Y
      pickaxeRef.current.rotation.x = 0
      pickaxeRef.current.rotation.y = 0
      pickaxeRef.current.rotation.z = 0
    }
  })

  return (
    <>
      <group ref={pickaxeRef}>
        {/* Handle - Vertical upright (Y axis) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.03, 0.6, 0.03]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>

        {/* Pickaxe Head - At the top */}
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[0.25, 0.08, 0.06]} />
          <meshLambertMaterial color="#C0C0C0" />
        </mesh>

        {/* Left Pick Point */}
        <mesh position={[-0.16, 0.35, 0]}>
          <boxGeometry args={[0.08, 0.04, 0.04]} />
          <meshLambertMaterial color="#C0C0C0" />
        </mesh>

        {/* Right Pick Point */}
        <mesh position={[0.16, 0.35, 0]}>
          <boxGeometry args={[0.08, 0.04, 0.04]} />
          <meshLambertMaterial color="#C0C0C0" />
        </mesh>

        {/* Handle Grip */}
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[0.04, 0.15, 0.04]} />
          <meshLambertMaterial color="#654321" />
        </mesh>

        {/* Axis Indicators - Positioned below pickaxe */}
        {/* X Axis - Red Arrow (Forward direction from camera) */}
        <group position={[0, -0.4, 0]}>
          {/* X Axis Line */}
          <mesh position={[0.1, 0, 0]}>
            <boxGeometry args={[0.2, 0.01, 0.01]} />
            <meshBasicMaterial color="red" />
          </mesh>
          {/* X Arrow Head */}
          <mesh position={[0.2, 0, 0]}>
            <boxGeometry args={[0.02, 0.03, 0.01]} />
            <meshBasicMaterial color="red" />
          </mesh>
          {/* X Label */}
          <Text
            position={[0.3, 0, 0]}
            fontSize={0.06}
            color="red"
            anchorX="center"
            anchorY="middle"
          >
            X+↗
          </Text>
        </group>

        {/* Y Axis - Green Arrow (Up direction) */}
        <group position={[0, -0.4, 0]}>
          {/* Y Axis Line */}
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.01, 0.2, 0.01]} />
            <meshBasicMaterial color="green" />
          </mesh>
          {/* Y Arrow Head */}
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[0.03, 0.02, 0.01]} />
            <meshBasicMaterial color="green" />
          </mesh>
          {/* Y Label */}
          <Text
            position={[0, 0.25, 0]}
            fontSize={0.06}
            color="green"
            anchorX="center"
            anchorY="middle"
          >
            Y+↑
          </Text>
        </group>

        {/* Z Axis - Blue Arrow (Right/Left from camera perspective) */}
        <group position={[0, -0.4, 0]}>
          {/* Z Axis Line */}
          <mesh position={[0, 0, 0.1]}>
            <boxGeometry args={[0.01, 0.01, 0.2]} />
            <meshBasicMaterial color="blue" />
          </mesh>
          {/* Z Arrow Head */}
          <mesh position={[0, 0, 0.2]}>
            <boxGeometry args={[0.03, 0.01, 0.02]} />
            <meshBasicMaterial color="blue" />
          </mesh>
          {/* Z Label */}
          <Text
            position={[0, 0, 0.25]}
            fontSize={0.06}
            color="blue"
            anchorX="center"
            anchorY="middle"
          >
            Z+→
          </Text>
        </group>

        {/* Origin Point */}
        <mesh position={[0, -0.4, 0]}>
          <boxGeometry args={[0.02, 0.02, 0.02]} />
          <meshBasicMaterial color="white" />
        </mesh>
      </group>
    </>
  )
}