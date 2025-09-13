import { useMemo } from 'react'
import { useBox } from '@react-three/cannon'
import * as THREE from 'three'

function Block({ position, color }: { position: [number, number, number], color: string }) {
  const [ref] = useBox(() => ({
    type: 'Static',
    position,
    args: [1, 1, 1],
  }))

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshLambertMaterial color={color} />
    </mesh>
  )
}

export function World() {
  const blocks = useMemo(() => {
    const blockArray = []
    const size = 20
    
    // Create ground
    for (let x = -size; x < size; x++) {
      for (let z = -size; z < size; z++) {
        blockArray.push({
          position: [x, -1, z] as [number, number, number],
          color: '#4ade80' // green
        })
      }
    }

    // Add some random blocks
    for (let i = 0; i < 50; i++) {
      const x = Math.floor(Math.random() * size * 2) - size
      const z = Math.floor(Math.random() * size * 2) - size
      const y = Math.floor(Math.random() * 5)
      const colors = ['#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']
      const color = colors[Math.floor(Math.random() * colors.length)]
      
      blockArray.push({
        position: [x, y, z] as [number, number, number],
        color
      })
    }

    return blockArray
  }, [])

  return (
    <>
      {blocks.map((block, index) => (
        <Block key={index} position={block.position} color={block.color} />
      ))}
    </>
  )
}