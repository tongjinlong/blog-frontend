<script setup lang="ts">
import * as THREE from 'three'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)

let animationFrameId = 0
let renderer: THREE.WebGLRenderer | undefined
let resizeObserver: ResizeObserver | undefined
let scene: THREE.Scene | undefined

type MeshWithMaterial = THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>

function hasWebGLSupport() {
  try {
    const testCanvas = document.createElement('canvas')

    return Boolean(testCanvas.getContext('webgl2') ?? testCanvas.getContext('webgl'))
  } catch {
    return false
  }
}

function createStandardMaterial(
  color: THREE.ColorRepresentation,
  emissive?: THREE.ColorRepresentation
) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: emissive ?? '#000000',
    emissiveIntensity: emissive ? 0.28 : 0,
    roughness: 0.82
  })
}

function createBox(
  width: number,
  height: number,
  depth: number,
  color: THREE.ColorRepresentation,
  position: THREE.Vector3Tuple
) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    createStandardMaterial(color)
  )
  mesh.position.set(...position)
  mesh.castShadow = true
  mesh.receiveShadow = true

  return mesh
}

function createCylinder(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  color: THREE.ColorRepresentation,
  position: THREE.Vector3Tuple,
  segments = 8
) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments),
    createStandardMaterial(color)
  )
  mesh.position.set(...position)
  mesh.castShadow = true
  mesh.receiveShadow = true

  return mesh
}

function createLowPolyTree(position: THREE.Vector3Tuple, scale = 1) {
  const tree = new THREE.Group()
  tree.position.set(...position)
  tree.add(
    createCylinder(0.12 * scale, 0.16 * scale, 1.04 * scale, '#7c563a', [0, 0.52 * scale, 0], 7)
  )

  const lower = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.58 * scale, 0),
    createStandardMaterial('#6f9c63')
  )
  lower.position.set(0, 1.15 * scale, 0)
  lower.scale.set(1, 0.86, 1)
  lower.castShadow = true
  tree.add(lower)

  const upper = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.42 * scale, 0),
    createStandardMaterial('#86ad68')
  )
  upper.position.set(0.05 * scale, 1.58 * scale, -0.02 * scale)
  upper.castShadow = true
  tree.add(upper)

  return tree
}

function createLamp(position: THREE.Vector3Tuple, color: THREE.ColorRepresentation) {
  const lamp = new THREE.Group()
  lamp.position.set(...position)
  lamp.add(createCylinder(0.045, 0.06, 1.24, '#4d5144', [0, 0.62, 0], 8))
  lamp.add(createBox(0.42, 0.06, 0.1, '#4d5144', [0.14, 1.22, 0]))

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 18, 12),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 1.4,
      roughness: 0.4
    })
  )
  glow.position.set(0.36, 1.18, 0)
  lamp.add(glow)

  const light = new THREE.PointLight(color, 3.4, 4.5)
  light.position.set(0.36, 1.18, 0)
  lamp.add(light)

  return lamp
}

function createCabin(
  color: THREE.ColorRepresentation,
  roofColor: THREE.ColorRepresentation,
  position: THREE.Vector3Tuple,
  rotation = 0
) {
  const cabin = new THREE.Group()
  cabin.position.set(...position)
  cabin.rotation.y = rotation
  cabin.add(createBox(1.46, 1.02, 1.14, color, [0, 0.51, 0]))
  cabin.add(createBox(0.36, 0.56, 0.07, '#4d352b', [0, 0.28, 0.6]))
  cabin.add(createBox(0.32, 0.28, 0.08, '#ffe28e', [-0.42, 0.65, 0.61]))
  cabin.add(createBox(0.32, 0.28, 0.08, '#ffe28e', [0.42, 0.65, 0.61]))

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(1.14, 0.56, 4),
    createStandardMaterial(roofColor)
  )
  roof.position.set(0, 1.24, 0)
  roof.rotation.y = Math.PI / 4
  roof.castShadow = true
  cabin.add(roof)

  return cabin
}

function createBench(position: THREE.Vector3Tuple, rotation = 0) {
  const bench = new THREE.Group()
  bench.position.set(...position)
  bench.rotation.y = rotation
  bench.add(createBox(1.28, 0.12, 0.36, '#93684b', [0, 0.44, 0]))
  bench.add(createBox(1.28, 0.12, 0.18, '#7e5b42', [0, 0.72, -0.2]))
  bench.add(createBox(0.1, 0.44, 0.1, '#5b4637', [-0.5, 0.22, 0.1]))
  bench.add(createBox(0.1, 0.44, 0.1, '#5b4637', [0.5, 0.22, 0.1]))

  return bench
}

function disposeScene(target: THREE.Scene) {
  target.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) {
      return
    }

    object.geometry.dispose()

    const materials = Array.isArray(object.material) ? object.material : [object.material]

    for (const material of materials) {
      material.dispose()
    }
  })
}

function mountPreview(canvas: HTMLCanvasElement) {
  if (!hasWebGLSupport()) {
    canvas.dataset.preview = 'static'
    return
  }

  scene = new THREE.Scene()
  scene.background = new THREE.Color('#dce8cf')
  scene.fog = new THREE.Fog('#dce8cf', 10, 24)

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80)
  camera.position.set(5.8, 3.1, 7.4)
  camera.lookAt(-0.2, 0.82, -1.8)

  renderer = new THREE.WebGLRenderer({ antialias: true, canvas, preserveDrawingBuffer: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.12

  const park = new THREE.Group()
  park.position.x = -2.15

  const ground = new THREE.Mesh(new THREE.CircleGeometry(12, 48), createStandardMaterial('#8dad6e'))
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.02
  ground.receiveShadow = true
  park.add(ground)

  const path = new THREE.Group()
  const stoneColors = ['#dfc391', '#d5b884', '#ead2a4', '#cda974']

  for (let index = 0; index < 12; index += 1) {
    const stone = createBox(
      0.92 + (index % 3) * 0.08,
      0.045,
      0.58 + (index % 2) * 0.08,
      stoneColors[index % stoneColors.length],
      [Math.sin(index * 0.42) * 0.42, 0.02, 4.8 - index * 0.72]
    )
    stone.rotation.y = Math.sin(index * 0.7) * 0.34
    path.add(stone)
  }

  park.add(path)

  park.add(createCabin('#c77f4d', '#9c5147', [-2.1, 0, -2.5], 0.28))
  park.add(createCabin('#d6a057', '#6f6b55', [1.45, 0, -3.2], -0.36))
  park.add(createCabin('#7ea47a', '#795b72', [3.55, 0, -1.15], -0.95))

  park.add(createBench([-1.55, 0, 0.7], -0.22))
  park.add(createBench([2.05, 0, 1.05], 0.38))
  park.add(createLamp([-0.88, 0, 1.5], '#ffd98f'))
  park.add(createLamp([2.35, 0, -0.55], '#ffcf75'))

  const trees = [
    [-4.4, 0, -1.6, 1.16],
    [-3.4, 0, 1.4, 0.88],
    [-1.2, 0, -4.4, 1.08],
    [0.35, 0, -5.2, 0.8],
    [3.9, 0, -3.6, 0.95],
    [2.7, 0, 0.35, 1.05],
    [1.2, 0, 2.8, 0.78]
  ] as const

  for (const [x, y, z, scale] of trees) {
    park.add(createLowPolyTree([x, y, z], scale))
  }

  const hills = new THREE.Group()
  hills.position.set(-1, -0.12, -7.7)
  const hillMaterial = createStandardMaterial('#6f9d75')

  for (let index = 0; index < 4; index += 1) {
    const hill = new THREE.Mesh(
      new THREE.ConeGeometry(2.9 + index * 0.42, 1.5 + index * 0.2, 8),
      hillMaterial
    )
    hill.position.set(-5 + index * 3.2, 0.64, 0)
    hill.rotation.y = index * 0.38
    hill.receiveShadow = true
    hills.add(hill)
  }

  park.add(hills)

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 24, 16),
    new THREE.MeshStandardMaterial({
      color: '#fff0a8',
      emissive: '#ffd26a',
      emissiveIntensity: 1.5
    })
  )
  sun.position.set(-5.3, 4.1, -5.9)
  park.add(sun)

  scene.add(park)

  const ambientLight = new THREE.HemisphereLight('#fff5df', '#55735b', 2.7)
  const sunLight = new THREE.DirectionalLight('#ffe1a3', 4.8)
  sunLight.position.set(4.5, 7.2, 3.4)
  sunLight.castShadow = true
  sunLight.shadow.mapSize.set(1024, 1024)
  sunLight.shadow.camera.near = 0.5
  sunLight.shadow.camera.far = 24
  sunLight.shadow.camera.left = -8
  sunLight.shadow.camera.right = 8
  sunLight.shadow.camera.top = 8
  sunLight.shadow.camera.bottom = -8
  scene.add(ambientLight, sunLight)

  const resize = () => {
    const { clientWidth, clientHeight } = canvas
    const width = Math.max(clientWidth, 1)
    const height = Math.max(clientHeight, 1)

    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer?.setSize(width, height, false)
  }

  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas)
  resize()

  const render = () => {
    animationFrameId = window.requestAnimationFrame(render)

    const time = Date.now() * 0.001
    park.rotation.y = Math.sin(time * 0.16) * 0.025
    sun.position.y = 4.1 + Math.sin(time * 0.4) * 0.08
    sun.scale.setScalar(1 + Math.sin(time * 1.2) * 0.025)

    scene?.traverse((object) => {
      const mesh = object as MeshWithMaterial

      if (
        mesh instanceof THREE.Mesh &&
        !Array.isArray(mesh.material) &&
        mesh.material instanceof THREE.MeshStandardMaterial &&
        mesh.material.emissiveIntensity > 0
      ) {
        mesh.material.emissiveIntensity = 0.72 + Math.sin(time * 1.8 + mesh.position.x) * 0.12
      }
    })

    renderer?.render(scene as THREE.Scene, camera)
  }

  render()
}

onMounted(() => {
  const canvas = canvasRef.value

  if (canvas) {
    mountPreview(canvas)
  }
})

onBeforeUnmount(() => {
  window.cancelAnimationFrame(animationFrameId)
  resizeObserver?.disconnect()
  renderer?.dispose()

  if (scene) {
    disposeScene(scene)
  }
})
</script>

<template>
  <div class="space-preview" aria-label="空间场景预览">
    <canvas ref="canvasRef" class="space-preview__canvas" aria-label="3D 空间预览"></canvas>

    <div class="space-preview__ambient" aria-hidden="true">
      <span class="space-preview__hill"></span>
      <span class="space-preview__path"></span>
      <span class="space-preview__cabin"></span>
      <span class="space-preview__glow"></span>
    </div>
  </div>
</template>

<style scoped>
.space-preview {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background:
    radial-gradient(circle at 22% 20%, rgb(255 231 158 / 50%), transparent 24%),
    linear-gradient(180deg, #dce8cf 0%, #f2dcaf 48%, #8dad6e 100%);
}

.space-preview__canvas,
.space-preview__ambient {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.space-preview__canvas {
  z-index: 1;
  display: block;
}

.space-preview__ambient {
  z-index: 0;
  background:
    radial-gradient(circle at 23% 24%, rgb(255 233 158 / 54%), transparent 11%),
    linear-gradient(180deg, rgb(220 232 207 / 0%) 0 44%, rgb(141 173 110 / 58%) 82% 100%);
}

.space-preview__canvas[data-preview='static'] + .space-preview__ambient {
  z-index: 2;
}

.space-preview__hill,
.space-preview__path,
.space-preview__cabin,
.space-preview__glow {
  position: absolute;
  display: block;
}

.space-preview__hill {
  right: 22%;
  bottom: 34%;
  width: 46%;
  height: 28%;
  background: #7da26f;
  border-radius: 60% 40% 0 0;
  opacity: 0.72;
}

.space-preview__path {
  bottom: -12%;
  left: 20%;
  width: 22%;
  height: 58%;
  background: linear-gradient(180deg, #e8c993, #cda974);
  border-radius: 50% 50% 0 0;
  opacity: 0.86;
  transform: rotate(12deg);
}

.space-preview__cabin {
  right: 48%;
  bottom: 34%;
  width: 18%;
  height: 16%;
  background: #c77f4d;
}

.space-preview__cabin::before {
  position: absolute;
  inset: -48% -8% auto;
  height: 62%;
  content: '';
  background: #9c5147;
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
}

.space-preview__glow {
  right: 42%;
  bottom: 28%;
  width: 54px;
  height: 54px;
  background: #ffe099;
  border-radius: 50%;
  box-shadow: 0 0 44px 16px rgb(255 199 111 / 48%);
}
</style>
