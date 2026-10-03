import './style.css'
import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import fontUrl from './fonts/helvetiker_regular.typeface.json?url'

const scene = new THREE.Scene()
scene.background = new THREE.Color('#14141f')

scene.add(new THREE.AmbientLight(0xffffff, 0.8))
const sun = new THREE.DirectionalLight(0xffffff, 2.5)
sun.position.set(2, 3, 4)
scene.add(sun)

const donutMaterial = new THREE.MeshNormalMaterial()
const textMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 })

const fontLoader = new FontLoader()
fontLoader.load(fontUrl, (font) => {
  console.log('font loaded')
  const textGeometry = new TextGeometry('Hello Three.js', {
    font,
    size: 0.5,
    depth: 0.2, // newer three.js versions
    height: 0.2, // older versions (ignored by newer ones)
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 5
  })
  textGeometry.center()
  scene.add(new THREE.Mesh(textGeometry, textMaterial))
},
undefined,
(error) => console.error('Could not load the font:', error))

const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45)
const donuts = []
const donutCount = 150

for (let i = 0; i < donutCount; i++) {
  const donut = new THREE.Mesh(donutGeometry, donutMaterial)

  do {
    donut.position.set(
      (Math.random() - 0.5) * 16,
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 12
    )
  } while (donut.position.length() < 3.5)

  donut.rotation.x = Math.random() * Math.PI
  donut.rotation.y = Math.random() * Math.PI

  const scale = 0.3 + Math.random() * 0.7
  donut.scale.setScalar(scale)

  donut.userData = {
    baseY: donut.position.y,
    speed: 0.3 + Math.random() * 0.7,
    phase: Math.random() * Math.PI * 2,
    spin: 0.1 + Math.random() * 0.4
  }

  donuts.push(donut)
}
scene.add(...donuts)

const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 100)
camera.position.set(0, 0, 5)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
document.body.appendChild(renderer.domElement)

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(innerWidth, innerHeight)
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
})

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.maxDistance = 12 // stay inside the donut cloud

const clock = new THREE.Clock()

renderer.setAnimationLoop(() => {
  const delta = clock.getDelta()
  const elapsed = clock.elapsedTime

  for (const donut of donuts) {
    const { baseY, speed, phase, spin } = donut.userData
    donut.position.y = baseY + Math.sin(elapsed * speed + phase) * 0.4
    donut.rotation.x += spin * delta
    donut.rotation.y += spin * delta
  }

  controls.update()
  renderer.render(scene, camera)
})