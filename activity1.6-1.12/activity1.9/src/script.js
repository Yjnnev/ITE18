import './style.css'
import * as THREE from 'three'
import boxTextureUrl from './assets/boxTexture.png'
import GUI from 'lil-gui'

const scene = new THREE.Scene()

const loadingManager = new THREE.LoadingManager()
loadingManager.onStart = () => console.log("loading started")
loadingManager.onLoad = () => console.log("loading finished")
loadingManager.onProgress = () => console.log("loading progressing")
loadingManager.onError = () => console.log("loading error")

const textureLoader = new THREE.TextureLoader(loadingManager)
const texture = textureLoader.load(boxTextureUrl)
texture.colorSpace = THREE.SRGBColorSpace

// Alpha map made in code (no extra image needed): a soft circle, white = visible, black = see-through
function makeAlphaMap() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 20, size / 2, size / 2, size / 2)
  g.addColorStop(0, '#ffffff')
  g.addColorStop(0.6, '#ffffff')
  g.addColorStop(1, '#000000')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}
const alphaTexture = makeAlphaMap()

// Lights (Lambert, Phong and Toon need light to be visible)
scene.add(new THREE.AmbientLight(0xffffff, 0.6))
const sun = new THREE.DirectionalLight(0xffffff, 2)
sun.position.set(2, 3, 4)
scene.add(sun)

// Material settings controlled by the GUI
const params = {
  sphere: true,
  box: true,
  torus: true,
  type: 'MeshBasicMaterial',
  useTexture: false,
  color: '#ffffff',
  wireframe: false,
  opacity: 1,
  useAlphaMap: false
}

const materialTypes = {
  MeshBasicMaterial: THREE.MeshBasicMaterial,
  MeshNormalMaterial: THREE.MeshNormalMaterial,
  MeshLambertMaterial: THREE.MeshLambertMaterial,
  MeshPhongMaterial: THREE.MeshPhongMaterial,
  MeshToonMaterial: THREE.MeshToonMaterial
}

function buildMaterial() {
  const mat = new materialTypes[params.type]()
  mat.flatShading = true
  mat.wireframe = params.wireframe
  mat.opacity = params.opacity
  mat.transparent = params.opacity < 1 || params.useAlphaMap
  mat.side = THREE.DoubleSide

  // MeshNormalMaterial has no color / map / alphaMap, so only set them if they exist
  if ('color' in mat) mat.color.set(params.color)
  if ('map' in mat) mat.map = params.useTexture ? texture : null
  if ('alphaMap' in mat) mat.alphaMap = params.useAlphaMap ? alphaTexture : null
  return mat
}

const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), buildMaterial())
sphere.position.x = -1.5

const box = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.75), sphere.material)

const torus = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.2, 16, 32), sphere.material)
torus.position.x = 1.5

const shapes = [sphere, box, torus]
scene.add(...shapes)

// Rebuild the material and put it on every shape
function applyMaterial() {
  const old = sphere.material
  const fresh = buildMaterial()
  for (const mesh of shapes) mesh.material = fresh
  old.dispose()
}

// Camera
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 100)
camera.position.set(0, 0, 3)

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
document.body.appendChild(renderer.domElement)

// Resize
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
})

// Drag to spin
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
let held = null

renderer.domElement.addEventListener('pointerdown', (e) => {
  pointer.x = (e.clientX / innerWidth) * 2 - 1
  pointer.y = -(e.clientY / innerHeight) * 2 + 1
  raycaster.setFromCamera(pointer, camera)
  const hit = raycaster.intersectObjects(shapes.filter(s => s.visible))[0]
  held = hit ? hit.object : null
})

addEventListener('pointerup', () => held = null)

addEventListener('pointermove', (e) => {
  if (!held) return
  held.rotation.y += e.movementX * 0.01
  held.rotation.x += e.movementY * 0.01
})

// GUI
const controlPanel = new GUI()

const shapeFolder = controlPanel.addFolder('Shapes')
shapeFolder.add(params, 'sphere').onChange(val => sphere.visible = val)
shapeFolder.add(params, 'box').onChange(val => box.visible = val)
shapeFolder.add(params, 'torus').onChange(val => torus.visible = val)

const matFolder = controlPanel.addFolder('Material')
matFolder.add(params, 'type', Object.keys(materialTypes)).name('material').onChange(applyMaterial)
matFolder.add(params, 'useTexture').name('boxTexture').onChange(applyMaterial)
matFolder.addColor(params, 'color').onChange(applyMaterial)
matFolder.add(params, 'wireframe').onChange(applyMaterial)
matFolder.add(params, 'opacity', 0, 1, 0.01).onChange(applyMaterial)
matFolder.add(params, 'useAlphaMap').name('alphaMap').onChange(applyMaterial)

// Loop and Animate
const clock = new THREE.Clock()

renderer.setAnimationLoop(() => {
  const delta = clock.getDelta()

  for (const mesh of shapes) {
    if (mesh === held) continue
    mesh.rotation.x += 0.6 * delta
    mesh.rotation.y += 0.4 * delta
    mesh.rotation.z += 0.2 * delta
  }

  renderer.render(scene, camera)
})