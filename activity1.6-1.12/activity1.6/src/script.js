import * as THREE from 'three'
import './style.css'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'


// Scene
const scene = new THREE.Scene()

// Object
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

mesh.rotation.x = Math.PI * 0.25
mesh.rotation.y = Math.PI * 0.25

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

// Animate
const tick = () => {
  controls.update()                // needed for damping
  renderer.render(scene, camera)
  window.requestAnimationFrame(tick)
}
tick()