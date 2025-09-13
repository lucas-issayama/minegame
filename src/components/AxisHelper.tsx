import { useRef } from 'react'
import * as THREE from 'three'

// Componente para visualizar os eixos X, Y, Z
export function AxisHelper() {
  return (
    <>
      {/* Eixo X - Vermelho (direita/esquerda) */}
      <mesh position={[1, 0, 0]}>
        <boxGeometry args={[2, 0.05, 0.05]} />
        <meshBasicMaterial color="red" />
      </mesh>
      <mesh position={[2, 0, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshBasicMaterial color="red" />
      </mesh>

      {/* Eixo Y - Verde (frente/trás) */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.05, 2, 0.05]} />
        <meshBasicMaterial color="green" />
      </mesh>
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshBasicMaterial color="green" />
      </mesh>

      {/* Eixo Z - Azul (cima/baixo) */}
      <mesh position={[0, 0, 1]}>
        <boxGeometry args={[0.05, 0.05, 2]} />
        <meshBasicMaterial color="blue" />
      </mesh>
      <mesh position={[0, 0, 2]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshBasicMaterial color="blue" />
      </mesh>

      {/* Centro - Branco */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshBasicMaterial color="white" />
      </mesh>
    </>
  )
}