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

    // Get camera direction and rotation for pickaxe positioning
    const cameraDirection = new THREE.Vector3()
    camera.getWorldDirection(cameraDirection)

    // Position the pickaxe relative to camera (like first-person view)
    const rightOffset = 0.5   // Right side of screen
    const downOffset = -0.6   // Lower on screen
    const forwardOffset = 1.2 // In front of camera

    // Create position relative to camera's local space
    const rightVector = new THREE.Vector3()
    rightVector.crossVectors(cameraDirection, camera.up).normalize()

    // Calculate final position in world space
    const basePos = camera.position.clone()
    basePos.add(rightVector.clone().multiplyScalar(rightOffset))
    basePos.add(camera.up.clone().multiplyScalar(downOffset))
    basePos.add(cameraDirection.clone().multiplyScalar(forwardOffset))

    // Add subtle idle bobbing motion
    if (!isSwinging) {
      const bobbing = Math.sin(state.clock.elapsedTime * 1.5) * 0.02
      basePos.y += bobbing
    }

    pickaxeRef.current.position.copy(basePos)

    // Reset rotation matrix to avoid accumulation
    pickaxeRef.current.rotation.set(0, 0, 0)

    // Make pickaxe point in camera direction
    pickaxeRef.current.lookAt(
      basePos.clone().add(cameraDirection.clone().multiplyScalar(2))
    )

    // Adjust rotation to make it look natural in hand
    pickaxeRef.current.rotateZ(-Math.PI / 6)  // 30 degrees rotation from Y to X axis (rotate around Z)
    pickaxeRef.current.rotateY(-Math.PI / 6)  // +90 degrees rotation from Z to X axis (rotate around Y)
    pickaxeRef.current.rotateX(-Math.PI / 4)  // Tilt forward slightly
    pickaxeRef.current.rotateX(Math.PI / 2)   // 90 degrees rotation from Y to Z axis (rotate around X)

    if (isSwinging) {
      // Add swing animation on top of base rotation
      const swingTime = (Date.now() % 300) / 300 // 0 to 1 over 300ms
      const swingAngle = Math.sin(swingTime * Math.PI) * Math.PI / 2 // 90 degrees swing

      // Apply swing rotation
      pickaxeRef.current.rotateX(-swingAngle)
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

        {/* Simple axis reference */}
        <group position={[0, -0.4, 0]}>
          {/* X Axis - Red */}
          <mesh position={[0.1, 0, 0]}>
            <boxGeometry args={[0.2, 0.005, 0.005]} />
            <meshBasicMaterial color="red" />
          </mesh>
          <Text position={[0.25, 0, 0]} fontSize={0.03} color="red">X</Text>

          {/* Y Axis - Green */}
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.005, 0.2, 0.005]} />
            <meshBasicMaterial color="green" />
          </mesh>
          <Text position={[0, 0.25, 0]} fontSize={0.03} color="green">Y</Text>

          {/* Z Axis - Blue */}
          <mesh position={[0, 0, 0.1]}>
            <boxGeometry args={[0.005, 0.005, 0.2]} />
            <meshBasicMaterial color="blue" />
          </mesh>
          <Text position={[0, 0, 0.25]} fontSize={0.03} color="blue">Z</Text>

          {/* Origin Point */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.01, 0.01, 0.01]} />
            <meshBasicMaterial color="white" />
          </mesh>
        </group>

      </group>
    </>
  )
}