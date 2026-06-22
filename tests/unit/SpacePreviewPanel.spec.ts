import { cleanup, render, screen } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import SpacePreviewPanel from '../../src/features/home/SpacePreviewPanel.vue'

const threeMock = vi.hoisted(() => {
  const createVector = () => ({
    x: 0,
    y: 0,
    z: 0,
    set(x = 0, y = 0, z = 0) {
      this.x = x
      this.y = y
      this.z = z
    },
    setScalar(value: number) {
      this.x = value
      this.y = value
      this.z = value
    }
  })

  class Object3D {
    castShadow = false
    children: Object3D[] = []
    position = createVector()
    receiveShadow = false
    rotation = createVector()
    scale = createVector()

    add(...objects: Object3D[]) {
      this.children.push(...objects)
    }

    traverse(callback: (object: Object3D) => void) {
      callback(this)

      for (const child of this.children) {
        child.traverse(callback)
      }
    }
  }

  class Geometry {
    dispose = vi.fn()
  }

  class Material {
    dispose = vi.fn()
  }

  class MeshStandardMaterial extends Material {
    color?: string
    emissive?: string
    emissiveIntensity: number
    roughness?: number

    constructor(options: Record<string, unknown> = {}) {
      super()
      this.color = options.color as string
      this.emissive = options.emissive as string
      this.emissiveIntensity = Number(options.emissiveIntensity ?? 0)
      this.roughness = options.roughness as number
    }
  }

  class Mesh extends Object3D {
    geometry: Geometry
    material: Material | Material[]

    constructor(geometry: Geometry, material: Material | Material[]) {
      super()
      this.geometry = geometry
      this.material = material
    }
  }

  class Group extends Object3D {}

  class Scene extends Group {
    background?: unknown
    fog?: unknown
  }

  class PerspectiveCamera extends Object3D {
    aspect = 1
    far: number
    fov: number
    near: number

    constructor(fov: number, aspect: number, near: number, far: number) {
      super()
      this.fov = fov
      this.aspect = aspect
      this.near = near
      this.far = far
    }

    lookAt = vi.fn()
    updateProjectionMatrix = vi.fn()
  }

  class WebGLRenderer {
    dispose = vi.fn()
    render = vi.fn()
    setPixelRatio = vi.fn()
    setSize = vi.fn()
    shadowMap = { enabled: false, type: '' }
    toneMapping = ''
    toneMappingExposure = 0
    options: Record<string, unknown>

    constructor(options: Record<string, unknown>) {
      this.options = options
    }
  }

  class DirectionalLight extends Object3D {
    color: string
    intensity: number
    shadow = {
      camera: {
        bottom: 0,
        far: 0,
        left: 0,
        near: 0,
        right: 0,
        top: 0
      },
      mapSize: {
        set: vi.fn()
      }
    }

    constructor(color: string, intensity: number) {
      super()
      this.color = color
      this.intensity = intensity
    }
  }

  class HemisphereLight extends Object3D {
    groundColor: string
    intensity: number
    skyColor: string

    constructor(skyColor: string, groundColor: string, intensity: number) {
      super()
      this.skyColor = skyColor
      this.groundColor = groundColor
      this.intensity = intensity
    }
  }

  class PointLight extends Object3D {
    color: string
    distance: number
    intensity: number

    constructor(color: string, intensity: number, distance: number) {
      super()
      this.color = color
      this.intensity = intensity
      this.distance = distance
    }
  }

  const geometryFactory = () => class extends Geometry {}

  return {
    ACESFilmicToneMapping: 'aces',
    BoxGeometry: geometryFactory(),
    CircleGeometry: geometryFactory(),
    Color: class {
      color: string

      constructor(color: string) {
        this.color = color
      }
    },
    ConeGeometry: geometryFactory(),
    CylinderGeometry: geometryFactory(),
    DirectionalLight,
    DodecahedronGeometry: geometryFactory(),
    Fog: class {
      color: string
      far: number
      near: number

      constructor(color: string, near: number, far: number) {
        this.color = color
        this.near = near
        this.far = far
      }
    },
    Group,
    HemisphereLight,
    Mesh,
    MeshStandardMaterial,
    PCFShadowMap: 'pcf',
    PerspectiveCamera,
    PointLight,
    Scene,
    SphereGeometry: geometryFactory(),
    WebGLRenderer
  }
})

vi.mock('three', () => threeMock)

class ResizeObserverStub {
  private readonly callback: ResizeObserverCallback

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }

  disconnect = vi.fn()

  observe(target: Element) {
    this.callback([{ target } as ResizeObserverEntry], this as unknown as ResizeObserver)
  }

  unobserve = vi.fn()
}

describe('SpacePreviewPanel', () => {
  let getContextSpy: ReturnType<typeof vi.spyOn> | undefined
  let originalResizeObserver: typeof globalThis.ResizeObserver
  let requestAnimationFrameSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    originalResizeObserver = globalThis.ResizeObserver
    globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver
    requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1)
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined)
  })

  afterEach(() => {
    cleanup()
    getContextSpy?.mockRestore()
    globalThis.ResizeObserver = originalResizeObserver
    vi.restoreAllMocks()
    getContextSpy = undefined
  })

  it('renders a static fallback when WebGL is unavailable', () => {
    getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)

    render(SpacePreviewPanel)

    expect(screen.getByLabelText('3D 空间预览')).toHaveAttribute('data-preview', 'static')
  })

  it('builds and disposes the animated preview when WebGL is available', () => {
    getContextSpy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue({} as RenderingContext)

    const { unmount } = render(SpacePreviewPanel)

    expect(screen.getByLabelText('3D 空间预览')).not.toHaveAttribute('data-preview')
    expect(requestAnimationFrameSpy).toHaveBeenCalled()

    unmount()

    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1)
  })
})
