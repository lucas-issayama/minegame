import { useState, useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import * as THREE from 'three'
import { BlockFragment } from './BlockFragment'

// Generate truly unique IDs using timestamp, random numbers, and sequence counter
let sequenceCounter = 0
const instanceId = Math.random().toString(36).substring(2, 11) // Unique per component instance
const generateUniqueId = () => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 11)
  const sequence = (++sequenceCounter).toString(36)
  return `fragment-${instanceId}-${timestamp}-${random}-${sequence}`
}

interface Block {
  id: string
  position: [number, number, number]
  color: string
  type: 'ground' | 'destructible'
}

interface Fragment {
  id: string
  position: [number, number, number]
  color: string
  velocity: THREE.Vector3
  angularVelocity: THREE.Vector3
  isFlying: boolean
}

interface GroundFragment {
  id: string
  position: [number, number, number]
  color: string
}

interface DestructibleWorldProps {
  onBlockDestroyed: () => void
}

export function DestructibleWorld({ onBlockDestroyed }: DestructibleWorldProps) {
  const { camera, raycaster } = useThree()
  const [, getKeys] = useKeyboardControls()
  const [blocks, setBlocks] = useState<Block[]>(() => {
    const initialBlocks: Block[] = []
    const size = 20

    // Create ground
    for (let x = -size; x < size; x++) {
      for (let z = -size; z < size; z++) {
        initialBlocks.push({
          id: `ground-${x}-${z}`,
          position: [x, 0, z],
          color: '#4ade80',
          type: 'ground'
        })
      }
    }

    // Add destructible blocks
    for (let i = 0; i < 50; i++) {
      const x = Math.floor(Math.random() * size * 2) - size
      const z = Math.floor(Math.random() * size * 2) - size
      const y = Math.floor(Math.random() * 5) + 1
      const colors = ['#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']
      const color = colors[Math.floor(Math.random() * colors.length)]

      initialBlocks.push({
        id: `destructible-${i}`,
        position: [x, y, z],
        color,
        type: 'destructible'
      })
    }

    return initialBlocks
  })

  const [fragments, setFragments] = useState<Fragment[]>([])
  const [groundFragments, setGroundFragments] = useState<GroundFragment[]>([])
  const meshRefs = useRef<Map<string, THREE.Mesh>>(new Map())
  const lastHitTime = useRef(0)
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

  useFrame(() => {
    const { hit } = getKeys()
    const now = Date.now()

    if ((hit || mousePressed) && now - lastHitTime.current > 300) { // Prevent rapid firing
      lastHitTime.current = now

      // Cast ray from camera
      const direction = new THREE.Vector3()
      camera.getWorldDirection(direction)

      raycaster.set(camera.position, direction)

      // Get all meshes that can be hit
      const meshes = Array.from(meshRefs.current.values())
      const intersects = raycaster.intersectObjects(meshes)

      if (intersects.length > 0 && intersects[0].distance < 5) { // Hit range of 5 units
        const hitMesh = intersects[0].object as THREE.Mesh

        // Find the block that was hit
        const hitBlockId = Array.from(meshRefs.current.entries())
          .find(([, mesh]) => mesh === hitMesh)?.[0]

        if (hitBlockId) {
          const hitBlock = blocks.find(block => block.id === hitBlockId)

          if (hitBlock?.type === 'destructible') {
            // Create 3D fragments
            createBlockFragments(hitBlock.position, hitBlock.color)

            // Remove the block
            setBlocks(prev => prev.filter(block => block.id !== hitBlockId))
            meshRefs.current.delete(hitBlockId)
            onBlockDestroyed()
          }
        }
      }
    }
  })

  const createBlockFragments = (position: [number, number, number], color: string) => {
    const newFragments: Fragment[] = []

    // Create 8-12 random fragments
    const numFragments = 8 + Math.floor(Math.random() * 5)

    for (let i = 0; i < numFragments; i++) {
      // Random position within the block
      const offsetX = (Math.random() - 0.5) * 0.5
      const offsetY = (Math.random() - 0.5) * 0.5
      const offsetZ = (Math.random() - 0.5) * 0.5

      const fragmentPosition: [number, number, number] = [
        position[0] + offsetX,
        position[1] + offsetY,
        position[2] + offsetZ
      ]

      // Random velocity - explosion effect
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 8, // X velocity
        Math.random() * 6 + 2,     // Y velocity (upward)
        (Math.random() - 0.5) * 8  // Z velocity
      )

      // Random angular velocity
      const angularVelocity = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      )

      // Generate guaranteed unique ID using timestamp and random string
      const uniqueId = generateUniqueId()

      newFragments.push({
        id: uniqueId,
        position: fragmentPosition,
        color,
        velocity,
        angularVelocity,
        isFlying: true
      })
    }

    setFragments(prev => {
      // Ensure no duplicate IDs exist
      const existingIds = new Set(prev.map(f => f.id))
      const validFragments = newFragments.filter(f => !existingIds.has(f.id))
      return [...prev, ...validFragments]
    })
  }

  const handleFragmentLanded = (fragmentId: string, finalPosition: [number, number, number]) => {
    setFragments(prev => {
      const fragment = prev.find(f => f.id === fragmentId)
      if (fragment) {
        // Move to ground fragments with a new unique ID
        setGroundFragments(prevGround => [...prevGround, {
          id: generateUniqueId(), // Generate new ID to avoid conflicts
          position: finalPosition,
          color: fragment.color
        }])

        // Remove from flying fragments
        return prev.filter(f => f.id !== fragmentId)
      }
      return prev
    })
  }

  return (
    <>
      {/* Blocks */}
      {blocks.map((block) => (
        <mesh
          key={block.id}
          position={block.position}
          ref={(ref) => {
            if (ref) {
              meshRefs.current.set(block.id, ref)
            }
          }}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshLambertMaterial color={block.color} />
        </mesh>
      ))}

      {/* Flying Fragments */}
      {fragments.map((fragment) => (
        <BlockFragment
          key={fragment.id}
          id={fragment.id}
          position={fragment.position}
          color={fragment.color}
          velocity={fragment.velocity}
          angularVelocity={fragment.angularVelocity}
          onLanded={(finalPosition) => handleFragmentLanded(fragment.id, finalPosition)}
        />
      ))}

      {/* Ground Fragments (persistent) */}
      {groundFragments.map((fragment) => (
        <mesh key={fragment.id} position={fragment.position}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshLambertMaterial color={fragment.color} />
        </mesh>
      ))}
    </>
  )
}