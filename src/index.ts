import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Configuration from './interfaces'
import chessboardUrl from './assets/models/chessboard.glb?url'
import calcOrthogonalVector from './helper/calculateOrthogonalVector'

export default class XRScene {
  private mouseDown = false
  private camera: THREE.PerspectiveCamera
  private scene: THREE.Scene
  private renderer: THREE.WebGLRenderer
  private raycaster: THREE.Raycaster
  private cursor: THREE.Vector2
  private intersectedObject: THREE.Object3D | undefined
  private controls: OrbitControls
  private light: THREE.HemisphereLight
  protected config: Configuration
  group: THREE.Group

  private initializeRenderer() {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })

    try {
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.localClippingEnabled = true

      if (this.config.parentElement) {
        renderer.setSize(
          this.config.parentElement.getBoundingClientRect().width,
          this.config.parentElement.getBoundingClientRect().height,
        )
        this.config.parentElement.appendChild(renderer.domElement)
      } else {
        renderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(renderer.domElement)
      }
    } catch (error) {
      console.error(error)
    }

    return renderer
  }

  private initializeCamera() {
    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 200)
    camera.position.set(
      this.config.camera?.x === undefined ? -3 : this.config.camera.x,
      this.config.camera?.y === undefined ? 2 : this.config.camera.y,
      this.config.camera?.z === undefined ? -1 : this.config.camera.z,
    )

    return camera
  }

  private initializeScene() {
    const scene = new THREE.Scene()
    scene.add(this.light)

    return scene
  }

  /**
   * makes camera moveable
   * @returns
   */
  private initializeControls() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement)
    controls.addEventListener('change', this.render) // use only if there is no animation loop
    controls.enablePan = false

    return controls
  }

  /**
   * creates a light source
   * @returns
   */
  private initializeLight() {
    const light = new THREE.HemisphereLight(
      this.config.lightSource?.skyColor || 0xffffff,
      this.config.lightSource?.groundColor || 0x080808,
      this.config.lightSource?.intensity === undefined ? 1 : this.config.lightSource?.intensity,
    )
    light.position.set(
      this.config.lightSource?.x === undefined ? -1.25 : this.config.lightSource.x,
      this.config.lightSource?.y === undefined ? 1 : this.config.lightSource.y,
      this.config.lightSource?.z === undefined ? 1.25 : this.config.lightSource.z,
    )

    return light
  }

  private async initializeObject(callback?: () => void) {
    const objLoader = new GLTFLoader()
    const gltf = await objLoader.loadAsync(chessboardUrl)
    this.group = gltf.scene
    console.log(gltf)

    this.group.position.set(0, 0, 0)
    this.scene.add(this.group)

    if (callback) callback()
  }

  constructor(config: Configuration) {
    this.config = config

    this.renderer = this.initializeRenderer()
    this.camera = this.initializeCamera()
    this.light = this.initializeLight()
    this.scene = this.initializeScene()
    this.controls = this.initializeControls()

    this.group = new THREE.Group()

    // red cube
    // const material = new THREE.ShaderMaterial({
    //   depthWrite: false,
    //   side: THREE.BackSide,
    // })
    // const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material)
    // group.add(mesh)
    // this.scene.add(group)
    // this.camera.lookAt(group.position)

    // .glb model
    this.initializeObject(() => {
      this.camera.position.set(
        this.group.position.x,
        this.group.position.y + 50,
        this.group.position.z,
      )
      this.camera.lookAt(this.group.position)
      // const grid = new THREE.GridHelper(25, 25)
      // this.scene.add(grid)

      // enable hovering of cursor
      this.raycaster = new THREE.Raycaster()
      this.cursor = new THREE.Vector2()

      this.render()
      // events
      window.addEventListener('resize', this.onWindowResize)
      this.renderer.domElement.addEventListener('mousemove', this.onMouseMove)
      this.renderer.domElement.addEventListener('mousedown', this.onMouseDown)
      this.renderer.domElement.addEventListener('mouseup', this.onMouseUp)
      window.addEventListener('keydown', this.handleKeypress)
    })
  }

  private moveCamera = (direction: 'forward' | 'right' | 'backward' | 'left', speed = 1) => {
    const facingDir = this.camera.getWorldDirection(new THREE.Vector3())

    switch (direction) {
      case 'forward':
        this.camera.position.addScaledVector(facingDir, speed)
        break
      case 'right':
        this.camera.position.addScaledVector(calcOrthogonalVector(this.camera), -1 * speed)

        break
      case 'backward':
        this.camera.position.addScaledVector(facingDir, -1 * speed)
        break
      case 'left':
        this.camera.position.addScaledVector(calcOrthogonalVector(this.camera), speed)
        break

      default:
        break
    }
    this.camera.updateProjectionMatrix()
    this.render()
  }

  private handleKeypress = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveCamera('forward')

        break

      case 'KeyA':
      case 'ArrowLeft':
        this.moveCamera('left')

        break

      case 'KeyD':
      case 'ArrowRight':
        this.moveCamera('right')

        break

      case 'KeyS':
      case 'ArrowDown':
        this.moveCamera('backward')
        break

      default:
        break
    }
  }

  private onMouseDown = () => {
    this.mouseDown = true
  }

  private onMouseUp = () => {
    this.mouseDown = false
  }

  private onWindowResize = () => {
    try {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()

      this.renderer.setSize(window.innerWidth, window.innerHeight)

      this.render()
    } catch (error) {
      console.error(error)
    }
  }

  private render = () => {
    try {
      this.renderer.render(this.scene, this.camera)
    } catch (error) {
      console.error(error)
    }
  }

  private onMouseMove = (e: MouseEvent) => {
    try {
      e.preventDefault()

      this.cursor.x = (e.clientX / window.innerWidth) * 2 - 1
      this.cursor.y = -(e.clientY / window.innerHeight) * 2 + 1

      this.raycaster.setFromCamera(this.cursor, this.camera)

      const intersects = this.raycaster.intersectObject(this.scene, true)

      if (intersects.length > 0) {
        if (this.intersectedObject === intersects[0]?.object) return

        this.intersectedObject = intersects[0]?.object
      } else {
        if (!this.intersectedObject) return
        this.intersectedObject = undefined
      }
    } catch (error) {
      console.error(error)
    }
  }

  public hoveredObject = () => {
    return {
      object: this.intersectedObject,
      mouseDown: this.mouseDown,
    }
  }
}
