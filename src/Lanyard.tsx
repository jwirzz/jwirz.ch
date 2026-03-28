import * as THREE from 'three'
import { useRef, useState, useEffect } from 'react'
import { Canvas, extend, useThree, useFrame } from '@react-three/fiber'
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei'
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import { useNavigate } from 'react-router-dom'

extend({ MeshLineGeometry, MeshLineMaterial })

interface LanyardProps {
  position?: [number, number, number]
  gravity?: [number, number, number]
  fov?: number
  transparent?: boolean
}

export default function Lanyard({
                                  position = [0, 0, 30],
                                  gravity = [0, -40, 0],
                                  fov = 20,
                                  transparent = true,
                                }: LanyardProps) {
  return (
      <Canvas
          camera={{ position, fov }}
          gl={{ alpha: transparent }}
          onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <ambientLight intensity={Math.PI} />
        <Physics interpolate gravity={gravity} timeStep={1 / 60}>
          <Band />
        </Physics>
        <Environment background={false}>
          <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
  )
}

function Band({ maxSpeed = 50, minSpeed = 10 }) {
  const navigate = useNavigate()
  const band = useRef<THREE.Mesh<any>>(null!)
  const fixed = useRef<any>(null!)
  const j1 = useRef<any>(null!)
  const j2 = useRef<any>(null!)
  const j3 = useRef<any>(null!)
  const card = useRef<any>(null!)
  const flipGroup = useRef<THREE.Group>(null!)

  const vec = new THREE.Vector3()
  const ang = new THREE.Vector3()
  const rot = new THREE.Vector3()
  const dir = new THREE.Vector3()

  const flipAngle = useRef(0)
  const [flipped, setFlipped] = useState(false)
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null)

  const clickedOnZone = useRef(false)

  const segmentProps = {
    type: 'dynamic' as const,
    canSleep: true,
    colliders: false as const,
    angularDamping: 2,
    linearDamping: 2,
  }

  const { nodes, materials } = useGLTF('/lanyard/card.glb') as any
  const texture = useTexture('/lanyard/lanyard.png')
  const { width, height } = useThree((state) => state.size)

  const [curve] = useState(() =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ])
  )

  const [dragged, drag] = useState<THREE.Vector3 | false>(false)
  const [hovered, hover] = useState(false)

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1])
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1])
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]])

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab'
      return () => { document.body.style.cursor = 'auto' }
    }
  }, [hovered, dragged])

  useFrame((state, delta) => {
    const targetAngle = flipped ? Math.PI : 0
    flipAngle.current += (targetAngle - flipAngle.current) * Math.min(delta * 8, 1)
    if (flipGroup.current) flipGroup.current.rotation.y = flipAngle.current

    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      dir.copy(vec).sub(state.camera.position).normalize()
      vec.add(dir.multiplyScalar(state.camera.position.length()))
      ;[card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp())
      card.current?.setNextKinematicTranslation({
        x: vec.x - (dragged as THREE.Vector3).x,
        y: vec.y - (dragged as THREE.Vector3).y,
        z: vec.z - (dragged as THREE.Vector3).z,
      })
    }
    if (fixed.current) {
      ;[j1, j2].forEach((ref) => {
        if (!ref.current.lerped)
          ref.current.lerped = new THREE.Vector3().copy(ref.current.translation())
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())))
        ref.current.lerped.lerp(
            ref.current.translation(),
            delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        )
      })
      curve.points[0].copy(j3.current.translation())
      curve.points[1].copy(j2.current.lerped)
      curve.points[2].copy(j1.current.lerped)
      curve.points[3].copy(fixed.current.translation())
      band.current.geometry.setPoints(curve.getPoints(32))
      ang.copy(card.current.angvel())
      rot.copy(card.current.rotation())
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z })
    }
  })

  curve.curveType = 'chordal'
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping

  const markZone = () => { clickedOnZone.current = true }

  const openLink = (url: string) => {
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
      <>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" position={[0, 4.5, 0]} />
        <RigidBody position={[0, 3.5, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0, 2.5, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0, 1.5, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
            position={[0, 0.5, 0]}
            ref={card}
            {...segmentProps}
            type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
              scale={2.25}
              position={[0, -1.2, -0.05]}
              onPointerOver={() => hover(true)}
              onPointerOut={() => hover(false)}
              onPointerDown={(e: any) => {
                e.target.setPointerCapture?.(e.pointerId)
                pointerDownPos.current = { x: e.clientX, y: e.clientY }
                drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
              }}
              onPointerUp={(e: any) => {
                e.target.releasePointerCapture?.(e.pointerId)
                drag(false)
                if (pointerDownPos.current && !clickedOnZone.current) {
                  const dx = e.clientX - pointerDownPos.current.x
                  const dy = e.clientY - pointerDownPos.current.y
                  if (Math.sqrt(dx * dx + dy * dy) < 4) {
                    setFlipped((f) => !f)
                  }
                }
                pointerDownPos.current = null
                clickedOnZone.current = false
              }}
          >
            <group ref={flipGroup}>
              <mesh geometry={nodes.card.geometry}>
                <meshPhysicalMaterial
                    map={materials['Material.001'].map}
                    map-anisotropy={16}
                    clearcoat={1}
                    clearcoatRoughness={0.15}
                    roughness={0.3}
                    metalness={0.5}
                    side={THREE.DoubleSide}
                />
              </mesh>

              {!flipped && <group>
              <mesh
                  geometry={nodes.clickzone_email.geometry}
                  position={[-0.281, 0.101, 0.005]}
                  rotation={[Math.PI / 2, 0, 0]}
                  scale={[0.035, 1, 0.028]}
                  onPointerDown={markZone}
                  onClick={(e) => { e.stopPropagation(); window.location.href = 'mailto:mail@jwirz.ch' }}
                  onPointerOver={() => document.body.style.cursor = 'pointer'}
                  onPointerOut={() => document.body.style.cursor = 'auto'}
              >
                <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
              </mesh>

              <mesh
                  geometry={nodes.clickzone_github.geometry}
                  position={[-0.201, 0.100, 0.005]}
                  rotation={[Math.PI / 2, 0, 0]}
                  scale={[0.035, 1, 0.03]}
                  onPointerDown={markZone}
                  onClick={(e) => { e.stopPropagation(); openLink('https://github.com/notacodes') }}
                  onPointerOver={() => document.body.style.cursor = 'pointer'}
                  onPointerOut={() => document.body.style.cursor = 'auto'}
              >
                <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
              </mesh>

              <mesh
                  geometry={nodes.clickzone_x.geometry}
                  position={[-0.065, 0.100, 0.005]}
                  rotation={[Math.PI / 2, 0, 0]}
                  scale={[0.029, 1, 0.03]}
                  onPointerDown={markZone}
                  onClick={(e) => { e.stopPropagation(); openLink('https://x.com/notacodes') }}
                  onPointerOver={() => document.body.style.cursor = 'pointer'}
                  onPointerOut={() => document.body.style.cursor = 'auto'}
              >
                <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
              </mesh>

              <mesh
                  geometry={nodes.clickzone_buymeacoffe.geometry}
                  position={[-0.127, 0.100, 0.005]}
                  rotation={[Math.PI / 2, 0, 0]}
                  scale={[0.023, 1, 0.032]}
                  onPointerDown={markZone}
                  onClick={(e) => { e.stopPropagation(); openLink('https://buymeacoffee.com/jwirz') }}
                  onPointerOver={() => document.body.style.cursor = 'pointer'}
                  onPointerOut={() => document.body.style.cursor = 'auto'}
              >
                <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
              </mesh>

              </group>}

              {flipped && <group position={[0.174, 0.031, 0.437]} scale={[1, 1, -1]}>
                <mesh
                    geometry={nodes.clickzone_projects_link.geometry}
                    position={[-0.005, 0.514, 0.437]}
                    rotation={[Math.PI / 2, 0, -Math.PI]}
                    scale={[-0.105, -1, -0.017]}
                    onPointerDown={markZone}
                    onClick={(e) => { e.stopPropagation(); navigate('/projects') }}
                    onPointerOver={() => document.body.style.cursor = 'pointer'}
                    onPointerOut={() => document.body.style.cursor = 'auto'}
                >
                  <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
                </mesh>

                <mesh
                    geometry={nodes.clickzone_projects_text.geometry}
                    position={[-0.065, 0.43, 0.437]}
                    rotation={[Math.PI / 2, 0, -Math.PI]}
                    scale={[-0.155, -1, -0.017]}
                    onPointerDown={markZone}
                    onClick={(e) => { e.stopPropagation(); navigate('/projects') }}
                    onPointerOver={() => document.body.style.cursor = 'pointer'}
                    onPointerOut={() => document.body.style.cursor = 'auto'}
                >
                  <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
                </mesh>

                <mesh
                    geometry={nodes.clickzone_micro_link.geometry}
                    position={[-0.005, 0.36, 0.437]}
                    rotation={[Math.PI / 2, 0, -Math.PI]}
                    scale={[-0.105, -1, -0.017]}
                    onPointerDown={markZone}
                    onClick={(e) => { e.stopPropagation(); navigate('/micro') }}
                    onPointerOver={() => document.body.style.cursor = 'pointer'}
                    onPointerOut={() => document.body.style.cursor = 'auto'}
                >
                  <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
                </mesh>

                <mesh
                    geometry={nodes.clickzone_micro_text.geometry}
                    position={[-0.07, 0.28, 0.437]}
                    rotation={[Math.PI / 2, 0, -Math.PI]}
                    scale={[-0.167, -1, -0.017]}
                    onPointerDown={markZone}
                    onClick={(e) => { e.stopPropagation(); navigate('/micro') }}
                    onPointerOver={() => document.body.style.cursor = 'pointer'}
                    onPointerOut={() => document.body.style.cursor = 'auto'}
                >
                  <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
                </mesh>

                <mesh
                    geometry={nodes.clickzone_email_plain.geometry}
                    position={[-0.18, 0.15, 0.437]}
                    rotation={[Math.PI / 2, 0, -Math.PI]}
                    scale={[-0.149, -1, -0.02]}
                    onPointerDown={markZone}
                    onClick={(e) => { e.stopPropagation(); window.location.href = 'mailto:mail@jwirz.ch' }}
                    onPointerOver={() => document.body.style.cursor = 'pointer'}
                    onPointerOut={() => document.body.style.cursor = 'auto'}
                >
                  <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
                </mesh>

                <mesh
                    geometry={nodes.clickzone_by_jonathan.geometry}
                    position={[-0.275, 0.059, 0.437]}
                    rotation={[Math.PI / 2, 0, -Math.PI]}
                    scale={[-0.105, -1, -0.017]}
                    onPointerDown={markZone}
                    onClick={(e) => { e.stopPropagation(); openLink('https://jwirz.ch') }}
                    onPointerOver={() => document.body.style.cursor = 'pointer'}
                    onPointerOut={() => document.body.style.cursor = 'auto'}
                >
                  <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
                </mesh>
              </group>}
            </group>

            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>

        <mesh ref={band}>
          {/* @ts-ignore */}
          <meshLineGeometry />
          {/* @ts-ignore */}
          <meshLineMaterial
              color="white"
              depthTest={false}
              resolution={[width, height]}
              useMap={1}
              map={texture}
              repeat={[-3, 1]}
              lineWidth={1}
          />
        </mesh>
      </>
  )
}
