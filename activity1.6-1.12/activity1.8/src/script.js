import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import * as dat from 'lil-gui'
import boxTextureUrl from './assets/boxTexture.png'

// Scene
const scene = new THREE.Scene()

// Texture
const loadingManager = new THREE.LoadingManager()
loadingManager.onStart = () => { console.log("loading started")}
loadingManager.onLoad = () => { console.log("loading finished")}
loadingManager.onProgress = () => { console.log("loading progressing")}
loadingManager.onError = () => { console.log("loading error")}

const textureLoader = new THREE.TextureLoader(loadingManager)
const texture = textureLoader.load(
  boxTextureUrl,
  () => { console.log("img loading finished")},
  () => { console.log("img loading progressing")},
  () => { console.log("img loading error")},
)

const image = new Image()
image.addEventListener("load", () => {
  texture.needsUpdate = true
})
image.src = boxTextureUrl

// Object
const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2)
const material = new THREE.MeshBasicMaterial({ map: texture })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

mesh.rotation.x = Math.PI * 0.25
mesh.rotation.y = Math.PI * 0.25

// Parameters
const parameters = {
  color: 0xff0000,
  spin: () => {
    gsap.to(mesh.rotation, { 
      duration: 1, 
      y: mesh.rotation.y + Math.PI * 2})
  }}

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () =>
{
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

window.addEventListener('dblclick', () =>
{
  const fullscreenElement = 
    document.fullscreenElement ||
    document.webkitFullscreenElement
    
  if(!fullscreenElement){
    if(canvas.requestFullscreen)
      canvas.requestFullscreen()
    else if(canvas.webkitRequestFullscreen)
      canvas.webkitRequestFullscreen()
  } else {
    if(document.exitFullscreen)
      document.exitFullscreen()
    else if(document.webkitExitFullscreen)
      document.webkitExitFullscreen()
  }
})

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 1, 100)
camera.position.z = 3
scene.add(camera)

// Renderer
const canvas = document.querySelector('canvas.webgl')
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(sizes.width, sizes.height)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true      // smooth inertia
controls.dampingFactor = 0.05      // 0 = no damping, 1 = instant stop
// controls.target.set(0, 0, 0)    // what the camera orbits around (default is origin)
// controls.enableZoom = true      // scroll to zoom (on by default)
// controls.enablePan = true       // right-drag to pan (on by default)
// controls.minDistance = 1        // closest zoom
// controls.maxDistance = 10       // farthest zoom

// Debug
const gui = new dat.GUI()
gui.add(mesh.position, 'y')
  .min(- 3)
  .max(3)
  .step(0.01)
  .name("elevation")

gui.add(mesh, "visible")
gui.add(material, 'wireframe')
gui.addColor(parameters, "color")
  .onChange(() => {
    material.color.set(parameters.color)
  })
gui.add(parameters, "spin")

// Animate
const tick = () => {
  controls.update()                // needed for damping
  renderer.render(scene, camera)
  window.requestAnimationFrame(tick)
}
tick()