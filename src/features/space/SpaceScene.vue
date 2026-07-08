<script setup lang="ts">
import * as THREE from 'three'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type ViewMode = 'overview' | 'immersive'
type MeshWithMaterial = THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>
type SunSystem = {
  group: THREE.Group
  materials: THREE.ShaderMaterial[]
}

const TITLE_SAFE_SUN_Y = 5.1
const SUN_POSITION: THREE.Vector3Tuple = [-7.4, TITLE_SAFE_SUN_Y, -8.8]
const SUN_TARGET: THREE.Vector3Tuple = [-0.65, 0.72, -1.9]

const props = withDefaults(
  defineProps<{
    ariaLabel?: string
    viewMode?: ViewMode
  }>(),
  {
    ariaLabel: undefined,
    viewMode: 'overview'
  }
)

const canvasRef = ref<HTMLCanvasElement | null>(null)
const sceneClass = computed(() => `space-scene--${props.viewMode}`)
const canvasLabel = computed(
  () => props.ariaLabel ?? (props.viewMode === 'immersive' ? '3D 空间沉浸场景' : '3D 空间预览')
)

let animationFrameId = 0
let renderer: THREE.WebGLRenderer | undefined
let resizeObserver: ResizeObserver | undefined
let scene: THREE.Scene | undefined

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
  emissive?: THREE.ColorRepresentation,
  roughness = 0.82
) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: emissive ?? '#000000',
    emissiveIntensity: emissive ? 0.3 : 0,
    flatShading: true,
    roughness
  })
}

function createCloudMaterial(color: THREE.ColorRepresentation) {
  return new THREE.MeshBasicMaterial({
    color,
    opacity: 0.86,
    toneMapped: false,
    transparent: true
  })
}

function createSunCoreMaterial() {
  return new THREE.ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    uniforms: {
      uCoreColor: { value: new THREE.Color('#fffaf0') },
      uEdgeColor: { value: new THREE.Color('#fff0b8') },
      uTime: { value: 0 }
    },
    vertexShader: `
      varying vec3 vNormalView;
      varying vec3 vPosition;

      void main() {
        vNormalView = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uCoreColor;
      uniform vec3 uEdgeColor;
      uniform float uTime;
      varying vec3 vNormalView;
      varying vec3 vPosition;

      void main() {
        float facing = clamp(dot(normalize(vNormalView), vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
        float rim = pow(1.0 - facing, 2.6);
        float flicker = sin(uTime * 1.35 + vPosition.y * 8.0) * 0.014;
        vec3 color = mix(uCoreColor, uEdgeColor, clamp(rim * 0.36 + flicker, 0.0, 1.0));
        gl_FragColor = vec4(color, 1.0);
      }
    `
  })
}

function createSunHaloMaterial(
  color: THREE.ColorRepresentation,
  intensity: number,
  falloff: number
) {
  return new THREE.ShaderMaterial({
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    transparent: true,
    toneMapped: false,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uFalloff: { value: falloff },
      uIntensity: { value: intensity },
      uTime: { value: 0 }
    },
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uFalloff;
      uniform float uIntensity;
      uniform float uTime;
      varying vec2 vUv;

      void main() {
        vec2 centeredUv = vUv - 0.5;
        float distanceFromCenter = length(centeredUv) * 2.0;
        float pulse = 1.0 + sin(uTime * 0.8) * 0.035;
        float halo = pow(clamp(1.0 - distanceFromCenter, 0.0, 1.0), uFalloff);
        float innerBloom = smoothstep(0.52, 0.0, distanceFromCenter) * 0.4;
        float alpha = (halo + innerBloom) * uIntensity * pulse;
        gl_FragColor = vec4(uColor, alpha);
      }
    `
  })
}

function createSunSystem(): SunSystem {
  const group = new THREE.Group()
  group.position.set(...SUN_POSITION)

  const wideHaloMaterial = createSunHaloMaterial('#ffe0a2', 0.46, 2.2)
  const warmHaloMaterial = createSunHaloMaterial('#fff3bf', 0.62, 3.8)
  const coreMaterial = createSunCoreMaterial()

  const wideHalo = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), wideHaloMaterial)
  wideHalo.renderOrder = -3
  wideHalo.position.z = -0.04
  group.add(wideHalo)

  const warmHalo = new THREE.Mesh(new THREE.PlaneGeometry(1.74, 1.74), warmHaloMaterial)
  warmHalo.renderOrder = -2
  warmHalo.position.z = -0.02
  group.add(warmHalo)

  const core = new THREE.Mesh(new THREE.SphereGeometry(0.52, 36, 24), coreMaterial)
  core.renderOrder = -1
  group.add(core)

  return { group, materials: [wideHaloMaterial, warmHaloMaterial, coreMaterial] }
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

function createRock(position: THREE.Vector3Tuple, scale = 1, color = '#9c937b') {
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.2 * scale, 0),
    createStandardMaterial(color)
  )
  rock.position.set(...position)
  rock.scale.set(1.35, 0.72, 1)
  rock.rotation.y = position[0] * 1.3
  rock.castShadow = true
  rock.receiveShadow = true

  return rock
}

function createLowPolyTree(position: THREE.Vector3Tuple, scale = 1, hue = 0) {
  const tree = new THREE.Group()
  tree.position.set(...position)
  tree.add(
    createCylinder(0.12 * scale, 0.17 * scale, 1.08 * scale, '#795134', [0, 0.54 * scale, 0], 7)
  )

  const lower = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.62 * scale, 0),
    createStandardMaterial(hue > 0 ? '#789f57' : '#6f9a5d')
  )
  lower.position.set(0, 1.18 * scale, 0)
  lower.scale.set(1.1, 0.86, 1)
  lower.castShadow = true
  lower.receiveShadow = true
  tree.add(lower)

  const middle = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.48 * scale, 0),
    createStandardMaterial(hue > 0 ? '#9ab463' : '#84aa64')
  )
  middle.position.set(-0.04 * scale, 1.52 * scale, 0.04 * scale)
  middle.scale.set(1, 0.92, 1.08)
  middle.castShadow = true
  middle.receiveShadow = true
  tree.add(middle)

  const upper = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.36 * scale, 0),
    createStandardMaterial('#b7bd68')
  )
  upper.position.set(0.08 * scale, 1.88 * scale, -0.04 * scale)
  upper.castShadow = true
  upper.receiveShadow = true
  tree.add(upper)

  return tree
}

function createPine(position: THREE.Vector3Tuple, scale = 1) {
  const pine = new THREE.Group()
  pine.position.set(...position)
  pine.add(
    createCylinder(0.08 * scale, 0.12 * scale, 0.86 * scale, '#71533b', [0, 0.43 * scale, 0], 7)
  )

  for (let index = 0; index < 3; index += 1) {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry((0.55 - index * 0.12) * scale, 0.88 * scale, 7),
      createStandardMaterial(index === 0 ? '#6f9164' : '#879c64')
    )
    cone.position.set(0, (0.95 + index * 0.42) * scale, 0)
    cone.castShadow = true
    cone.receiveShadow = true
    pine.add(cone)
  }

  return pine
}

function createLamp(position: THREE.Vector3Tuple, color: THREE.ColorRepresentation) {
  const lamp = new THREE.Group()
  lamp.position.set(...position)
  lamp.add(createCylinder(0.045, 0.06, 1.24, '#4f4f3f', [0, 0.62, 0], 8))
  lamp.add(createBox(0.42, 0.06, 0.1, '#4f4f3f', [0.14, 1.22, 0]))

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 18, 12),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 1.35,
      roughness: 0.4
    })
  )
  glow.position.set(0.36, 1.18, 0)
  lamp.add(glow)

  const light = new THREE.PointLight(color, 3.2, 4.4)
  light.position.set(0.36, 1.18, 0)
  lamp.add(light)

  return lamp
}

function createCabin(
  color: THREE.ColorRepresentation,
  roofColor: THREE.ColorRepresentation,
  position: THREE.Vector3Tuple,
  rotation = 0,
  scale = 1
) {
  const cabin = new THREE.Group()
  cabin.position.set(...position)
  cabin.rotation.y = rotation
  cabin.add(createBox(1.64 * scale, 1.08 * scale, 1.2 * scale, color, [0, 0.54 * scale, 0]))
  cabin.add(
    createBox(0.38 * scale, 0.6 * scale, 0.08 * scale, '#49352e', [0, 0.3 * scale, 0.64 * scale])
  )
  cabin.add(
    createBox(0.34 * scale, 0.3 * scale, 0.08 * scale, '#ffe4a3', [
      -0.48 * scale,
      0.72 * scale,
      0.65 * scale
    ])
  )
  cabin.add(
    createBox(0.34 * scale, 0.3 * scale, 0.08 * scale, '#ffe4a3', [
      0.48 * scale,
      0.72 * scale,
      0.65 * scale
    ])
  )
  cabin.add(
    createBox(0.08 * scale, 0.18 * scale, 0.08 * scale, '#f7c885', [
      0.2 * scale,
      0.38 * scale,
      0.69 * scale
    ])
  )

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(1.25 * scale, 0.6 * scale, 4),
    createStandardMaterial(roofColor, undefined, 0.76)
  )
  roof.position.set(0, 1.28 * scale, 0)
  roof.rotation.y = Math.PI / 4
  roof.castShadow = true
  roof.receiveShadow = true
  cabin.add(roof)

  return cabin
}

function createBench(position: THREE.Vector3Tuple, rotation = 0) {
  const bench = new THREE.Group()
  bench.position.set(...position)
  bench.rotation.y = rotation
  bench.add(createBox(1.28, 0.1, 0.28, '#9c6844', [0, 0.43, 0]))
  bench.add(createBox(1.28, 0.1, 0.13, '#b6784f', [0, 0.58, -0.02]))
  bench.add(createBox(1.28, 0.12, 0.16, '#7d543b', [0, 0.78, -0.22]))
  bench.add(createBox(0.1, 0.46, 0.1, '#5d4636', [-0.5, 0.23, 0.1]))
  bench.add(createBox(0.1, 0.46, 0.1, '#5d4636', [0.5, 0.23, 0.1]))
  bench.add(createBox(0.09, 0.46, 0.08, '#5d4636', [-0.54, 0.58, -0.22]))
  bench.add(createBox(0.09, 0.46, 0.08, '#5d4636', [0.54, 0.58, -0.22]))

  return bench
}

function createFence(position: THREE.Vector3Tuple, length = 1.8, rotation = 0) {
  const fence = new THREE.Group()
  fence.position.set(...position)
  fence.rotation.y = rotation
  const posts = 5

  for (let index = 0; index < posts; index += 1) {
    const x = -length / 2 + (length / (posts - 1)) * index
    fence.add(createBox(0.08, 0.52, 0.08, '#8b6446', [x, 0.26, 0]))
  }

  fence.add(createBox(length + 0.18, 0.08, 0.06, '#a87951', [0, 0.34, 0.01]))
  fence.add(createBox(length + 0.18, 0.08, 0.06, '#a87951', [0, 0.16, 0.01]))

  return fence
}

function createFlower(position: THREE.Vector3Tuple, color: THREE.ColorRepresentation, scale = 1) {
  const flower = new THREE.Group()
  flower.position.set(...position)
  flower.add(
    createCylinder(0.012 * scale, 0.016 * scale, 0.22 * scale, '#477545', [0, 0.11 * scale, 0], 5)
  )

  const center = new THREE.Mesh(
    new THREE.SphereGeometry(0.035 * scale, 8, 6),
    createStandardMaterial('#f1bd4c', '#f1bd4c')
  )
  center.position.set(0, 0.24 * scale, 0)
  center.castShadow = true
  flower.add(center)

  for (let index = 0; index < 5; index += 1) {
    const petal = new THREE.Mesh(
      new THREE.SphereGeometry(0.036 * scale, 8, 6),
      createStandardMaterial(color)
    )
    const angle = (Math.PI * 2 * index) / 5
    petal.position.set(
      Math.cos(angle) * 0.045 * scale,
      0.24 * scale,
      Math.sin(angle) * 0.045 * scale
    )
    petal.scale.set(1.15, 0.64, 0.92)
    petal.castShadow = true
    flower.add(petal)
  }

  return flower
}

function createFlowerPatch(position: THREE.Vector3Tuple, rotation = 0) {
  const patch = new THREE.Group()
  patch.position.set(...position)
  patch.rotation.y = rotation
  const colors = ['#fff2db', '#f4a8a1', '#f7d56f', '#efe8ff']

  for (let index = 0; index < 12; index += 1) {
    const x = Math.sin(index * 1.9) * 0.42
    const z = Math.cos(index * 1.27) * 0.32
    patch.add(createFlower([x, 0, z], colors[index % colors.length], 0.86 + (index % 3) * 0.12))
  }

  return patch
}

function createGrassTuft(position: THREE.Vector3Tuple, scale = 1, rotation = 0) {
  const tuft = new THREE.Group()
  tuft.position.set(...position)
  tuft.rotation.y = rotation

  for (let index = 0; index < 3; index += 1) {
    const blade = createBox(
      0.026 * scale,
      0.22 * scale,
      0.026 * scale,
      index % 2 ? '#7fa65e' : '#6f985a',
      [(index - 1) * 0.035 * scale, 0.11 * scale, Math.sin(index) * 0.025 * scale]
    )
    blade.rotation.z = (index - 1) * 0.23
    tuft.add(blade)
  }

  return tuft
}

function createPath() {
  const path = new THREE.Group()
  const stoneColors = ['#dfc391', '#d5b884', '#ead2a4', '#cda974']

  for (let index = 0; index < 15; index += 1) {
    const z = 5.5 - index * 0.66
    const x = Math.sin(index * 0.42) * 0.36 - index * 0.028
    const stone = createBox(
      0.92 + (index % 3) * 0.08,
      0.045,
      0.56 + (index % 2) * 0.08,
      stoneColors[index % stoneColors.length],
      [x, 0.025, z]
    )
    stone.rotation.y = Math.sin(index * 0.7) * 0.34
    path.add(stone)
  }

  return path
}

function createCloud(position: THREE.Vector3Tuple, scale = 1) {
  const cloud = new THREE.Group()
  cloud.position.set(...position)
  const parts = [
    [-0.46, -0.02, 0, 0.24, 1.34, 0.58, 0.72, '#fff7e5'],
    [-0.18, 0.08, 0.02, 0.32, 1.08, 0.82, 0.78, '#fff9eb'],
    [0.14, 0.12, -0.02, 0.3, 1, 0.9, 0.76, '#fff4dd'],
    [0.44, 0, 0.02, 0.24, 1.28, 0.62, 0.7, '#fff8e8'],
    [0.02, -0.12, 0.04, 0.34, 1.78, 0.44, 0.62, '#f8ead0']
  ] as const

  for (const [x, y, z, radius, scaleX, scaleY, scaleZ, color] of parts) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(radius * scale, 18, 12),
      createCloudMaterial(color)
    )
    puff.position.set(x * scale, y * scale, z * scale)
    puff.scale.set(scaleX, scaleY, scaleZ)
    cloud.add(puff)
  }

  return cloud
}

function createDistantHills() {
  const hills = new THREE.Group()
  hills.position.set(0, -0.18, -8.8)
  const hillColors = ['#7fa26b', '#90aa72', '#78996a', '#a2ad75']

  for (let index = 0; index < 6; index += 1) {
    const hill = new THREE.Mesh(
      new THREE.ConeGeometry(3.6 + index * 0.24, 1.7 + index * 0.12, 8),
      createStandardMaterial(hillColors[index % hillColors.length])
    )
    hill.position.set(-7.2 + index * 2.9, 0.72, Math.sin(index) * 0.36)
    hill.rotation.y = index * 0.33
    hill.scale.y = 0.82
    hill.receiveShadow = true
    hills.add(hill)
  }

  return hills
}

function buildPark() {
  const park = new THREE.Group()

  const ground = new THREE.Mesh(new THREE.CircleGeometry(14, 72), createStandardMaterial('#8fad68'))
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.02
  ground.receiveShadow = true
  park.add(ground)
  park.add(createPath())
  park.add(createDistantHills())

  park.add(createCabin('#d39958', '#ba6646', [-1.15, 0, -2.7], 0.15, 1.08))
  park.add(createCabin('#d9b078', '#7e745c', [2.25, 0, -3.25], -0.34, 0.78))

  park.add(createBench([1.05, 0, 1.08], -0.06))
  park.add(createBench([-2.9, 0, 1.15], -0.4))
  park.add(createFence([2.45, 0, -1.22], 1.8, -0.16))
  park.add(createFence([3.1, 0, -0.55], 1.32, Math.PI / 2 - 0.16))
  park.add(createLamp([-2.45, 0, 0.82], '#ffe3a1'))
  park.add(createLamp([2.32, 0, -0.12], '#ffd179'))
  park.add(createFlowerPatch([2.5, 0, -0.95], -0.16))
  park.add(createFlowerPatch([0.95, 0, 1.8], 0.4))

  const trees = [
    [-4.4, 0, -1.5, 1.2, 0],
    [-3.5, 0, 1.45, 0.9, 1],
    [-1.1, 0, -4.65, 1.08, 0],
    [0.55, 0, -5.15, 0.82, 1],
    [4.0, 0, -3.55, 0.95, 1],
    [3.05, 0, 0.75, 1.12, 0],
    [1.55, 0, 2.85, 0.78, 1],
    [-1.55, 0, 2.75, 0.84, 0]
  ] as const

  for (const [x, y, z, scale, hue] of trees) {
    park.add(createLowPolyTree([x, y, z], scale, hue))
  }

  const pines = [
    [-5.8, 0, -4.4, 0.85],
    [5.55, 0, -4.2, 0.72],
    [4.9, 0, -6.25, 0.68],
    [-4.7, 0, -6.1, 0.64]
  ] as const

  for (const [x, y, z, scale] of pines) {
    park.add(createPine([x, y, z], scale))
  }

  for (let index = 0; index < 78; index += 1) {
    const angle = index * 2.399
    const radius = 1.2 + (((index * 37) % 100) / 100) * 6.4
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius - 0.2

    if (Math.abs(x) < 0.74 && z > -4.6 && z < 5.7) {
      continue
    }

    park.add(createGrassTuft([x, 0.005, z], 0.72 + (index % 4) * 0.1, angle))
  }

  const rocks = [
    [-3.4, 0.06, -0.05, 0.82],
    [3.65, 0.06, 1.72, 0.64],
    [-2.25, 0.06, 3.34, 0.52],
    [4.64, 0.06, -1.86, 0.48],
    [-4.8, 0.06, 2.8, 0.72]
  ] as const

  for (const [x, y, z, scale] of rocks) {
    park.add(createRock([x, y, z], scale))
  }

  const clouds = new THREE.Group()
  clouds.add(createCloud([-8.2, 3.82, -6.1], 1.08))
  clouds.add(createCloud([2.45, 4.06, -7.4], 0.76))
  clouds.add(createCloud([4.85, 3.72, -5.8], 0.58))
  park.add(clouds)

  return { clouds, park }
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

function configureCamera(viewMode: ViewMode) {
  const camera = new THREE.PerspectiveCamera(viewMode === 'immersive' ? 62 : 42, 1, 0.1, 90)

  if (viewMode === 'immersive') {
    camera.position.set(0.5, 0.92, 5.18)
    camera.lookAt(-0.3, 0.58, -2.05)
  } else {
    camera.position.set(5.4, 3.05, 7.2)
    camera.lookAt(-0.45, 0.92, -1.95)
  }

  return camera
}

function mountScene(canvas: HTMLCanvasElement) {
  if (!hasWebGLSupport()) {
    canvas.dataset.preview = 'static'
    return
  }

  scene = new THREE.Scene()
  scene.background = new THREE.Color('#f3dfad')
  scene.fog = new THREE.Fog('#f3dfad', 12, 30)

  const camera = configureCamera(props.viewMode)
  renderer = new THREE.WebGLRenderer({ antialias: true, canvas, preserveDrawingBuffer: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = props.viewMode === 'immersive' ? 1.08 : 1.03
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const { clouds, park } = buildPark()
  const sun = createSunSystem()
  scene.add(park, sun.group)

  const sunTarget = new THREE.Group()
  sunTarget.position.set(...SUN_TARGET)
  scene.add(sunTarget)

  const ambientLight = new THREE.HemisphereLight('#fff6dc', '#4f6c59', 1.36)
  const sunLight = new THREE.DirectionalLight('#ffd18a', 6.4)
  sunLight.position.set(...SUN_POSITION)
  sunLight.target = sunTarget
  sunLight.castShadow = true
  sunLight.shadow.mapSize.set(2048, 2048)
  sunLight.shadow.camera.near = 0.5
  sunLight.shadow.camera.far = 34
  sunLight.shadow.camera.left = -8.5
  sunLight.shadow.camera.right = 8.5
  sunLight.shadow.camera.top = 8.5
  sunLight.shadow.camera.bottom = -8.5

  const fillLight = new THREE.DirectionalLight('#a9c9ff', 0.42)
  fillLight.position.set(5.8, 3.4, 5.2)
  fillLight.target = sunTarget
  scene.add(ambientLight, sunLight, fillLight)

  const emissiveMaterials: Array<{
    base: number
    material: THREE.MeshStandardMaterial
    phase: number
  }> = []
  scene.traverse((object) => {
    const mesh = object as MeshWithMaterial

    if (
      mesh instanceof THREE.Mesh &&
      !Array.isArray(mesh.material) &&
      mesh.material instanceof THREE.MeshStandardMaterial &&
      mesh.material.emissiveIntensity > 0
    ) {
      emissiveMaterials.push({
        base: mesh.material.emissiveIntensity,
        material: mesh.material,
        phase: mesh.position.x + mesh.position.z
      })
    }
  })

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
    park.rotation.y = props.viewMode === 'overview' ? Math.sin(time * 0.16) * 0.02 : 0
    sun.group.scale.setScalar(1 + Math.sin(time * 0.86) * 0.012)
    clouds.position.x = Math.sin(time * 0.08) * 0.08

    for (const material of sun.materials) {
      material.uniforms.uTime.value = time
    }

    for (const { base, material, phase } of emissiveMaterials) {
      material.emissiveIntensity = base + Math.sin(time * 1.6 + phase) * 0.1
    }

    renderer?.render(scene as THREE.Scene, camera)
  }

  render()
}

onMounted(() => {
  const canvas = canvasRef.value

  if (canvas) {
    mountScene(canvas)
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
  <div class="space-scene" :class="sceneClass" aria-label="空间场景">
    <canvas ref="canvasRef" class="space-scene__canvas" :aria-label="canvasLabel"></canvas>

    <div class="space-scene__ambient" aria-hidden="true">
      <span class="space-scene__sun"></span>
      <span class="space-scene__cloud space-scene__cloud--left"></span>
      <span class="space-scene__cloud space-scene__cloud--right"></span>
      <span class="space-scene__hill space-scene__hill--back"></span>
      <span class="space-scene__hill space-scene__hill--front"></span>
      <span class="space-scene__path"></span>
      <span class="space-scene__cabin"></span>
      <span class="space-scene__tree space-scene__tree--left"></span>
      <span class="space-scene__tree space-scene__tree--right"></span>
    </div>
  </div>
</template>

<style scoped>
.space-scene {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background:
    radial-gradient(circle at 19% 12%, rgb(255 239 179 / 78%), transparent 17%),
    linear-gradient(180deg, #f5dea7 0%, #f8e7bc 42%, #91ad69 100%);
}

.space-scene__canvas,
.space-scene__ambient {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.space-scene__canvas {
  z-index: 1;
  display: block;
}

.space-scene__ambient {
  z-index: 0;
  background:
    linear-gradient(180deg, rgb(255 246 213 / 0%) 0 42%, rgb(143 173 104 / 46%) 76% 100%),
    radial-gradient(circle at 19% 12%, rgb(255 239 179 / 56%), transparent 14%);
}

.space-scene__canvas[data-preview='static'] + .space-scene__ambient {
  z-index: 2;
}

.space-scene__sun,
.space-scene__cloud,
.space-scene__hill,
.space-scene__path,
.space-scene__cabin,
.space-scene__tree {
  position: absolute;
  display: block;
}

.space-scene__sun {
  top: clamp(36px, 11%, 52px);
  left: 17%;
  width: 82px;
  aspect-ratio: 1;
  background: radial-gradient(circle at 42% 38%, #fffdf1 0 34%, #ffe1a1 68%, #ffc66d 100%);
  border-radius: 50%;
  box-shadow:
    0 0 36px 12px rgb(255 239 179 / 46%),
    0 0 92px 36px rgb(255 198 109 / 26%);
}

.space-scene__cloud {
  width: 184px;
  height: 48px;
  background:
    radial-gradient(circle at 31% 34%, rgb(255 252 240 / 88%) 0 30%, transparent 31%),
    radial-gradient(circle at 52% 18%, rgb(255 248 229 / 82%) 0 35%, transparent 36%),
    radial-gradient(circle at 71% 42%, rgb(255 247 226 / 72%) 0 28%, transparent 29%),
    linear-gradient(180deg, rgb(255 251 238 / 72%), rgb(246 230 199 / 46%));
  border-radius: 999px;
  box-shadow: 0 18px 42px rgb(143 119 76 / 10%);
  opacity: 0.74;
}

.space-scene__cloud::before,
.space-scene__cloud::after {
  position: absolute;
  content: '';
  background: inherit;
  border-radius: 50%;
}

.space-scene__cloud::before {
  top: -16px;
  left: 34px;
  width: 62px;
  height: 52px;
}

.space-scene__cloud::after {
  top: -8px;
  right: 28px;
  width: 54px;
  height: 42px;
}

.space-scene__cloud--left {
  top: 18%;
  left: 4%;
}

.space-scene__cloud--right {
  top: 16%;
  right: 13%;
  transform: scale(0.76);
}

.space-scene__hill {
  bottom: 31%;
  width: 44%;
  height: 27%;
  background: #8fa56f;
  border-radius: 62% 45% 0 0;
  opacity: 0.68;
}

.space-scene__hill--back {
  right: 4%;
  background: #b1ae78;
  opacity: 0.42;
}

.space-scene__hill--front {
  right: 28%;
  background: #7ea06c;
}

.space-scene__path {
  bottom: -10%;
  left: 42%;
  width: 18%;
  height: 68%;
  background: linear-gradient(180deg, #ebcf9f, #c9a16e);
  border-radius: 45% 55% 0 0;
  opacity: 0.86;
  transform: rotate(8deg);
}

.space-scene__cabin {
  right: 42%;
  bottom: 35%;
  width: 18%;
  height: 15%;
  background: #d39958;
}

.space-scene__cabin::before {
  position: absolute;
  inset: -45% -10% auto;
  height: 60%;
  content: '';
  background: #ba6646;
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
}

.space-scene__tree {
  bottom: 27%;
  width: 90px;
  height: 160px;
}

.space-scene__tree::before {
  position: absolute;
  bottom: 0;
  left: 38px;
  width: 18px;
  height: 72px;
  content: '';
  background: #795134;
}

.space-scene__tree::after {
  position: absolute;
  top: 0;
  left: 3px;
  width: 84px;
  aspect-ratio: 1;
  content: '';
  background: #7fa65e;
  border-radius: 45% 55% 44% 56%;
}

.space-scene__tree--left {
  left: 14%;
}

.space-scene__tree--right {
  right: 13%;
  bottom: 24%;
  transform: scale(1.2);
}

.space-scene--immersive .space-scene__path {
  left: 35%;
  width: 34%;
  height: 86%;
}

.space-scene--immersive .space-scene__cabin {
  right: 38%;
  bottom: 39%;
}
</style>
