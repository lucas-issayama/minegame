'use client'

import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PointerLockControls, KeyboardControls } from '@react-three/drei'
import { SimplePlayer } from './SimplePlayer'
import { KeyControls } from './KeyControls'
import { Pickaxe } from './Pickaxe'
import { DestructibleWorld } from './DestructibleWorld'
import { AxisHelper } from './AxisHelper'

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
  { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
  { name: 'leftward', keys: ['ArrowLeft', 'a', 'A'] },
  { name: 'rightward', keys: ['ArrowRight', 'd', 'D'] },
  { name: 'jump', keys: [' '] },
  { name: 'run', keys: ['ShiftLeft', 'ShiftRight'] },
  { name: 'hit', keys: ['MouseLeft', 'f', 'F'] },
]

export default function MinecraftGame() {
  const [hitCount, setHitCount] = useState(0)

  const handleHit = () => {
    // This can be used for hit feedback
  }

  const handleBlockDestroyed = () => {
    setHitCount(prev => prev + 1)
  }

  return (
    <div className="w-full h-screen relative">
      <KeyControls />
      {/* Score display */}
      <div className="absolute top-4 right-4 z-10 bg-black/50 rounded-lg p-4 text-white">
        <div className="text-lg font-bold">Blocks Destroyed: {hitCount}</div>
      </div>
      <KeyboardControls map={keyboardMap}>
        <Canvas camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 2.5, 5] }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <SimplePlayer />
          <Pickaxe onHit={handleHit} />
          <DestructibleWorld onBlockDestroyed={handleBlockDestroyed} />
          <AxisHelper />
          <PointerLockControls />
        </Canvas>
      </KeyboardControls>
    </div>
  )
}