import * as THREE from 'three'

export default interface Configuration {
  lightSource?: LightSource
  camera?: Camera
  parentElement?: HTMLElement
}

export interface Camera {
  x?: number
  y?: number
  z?: number
}

export interface LightSource {
  skyColor?: THREE.ColorRepresentation
  groundColor?: THREE.ColorRepresentation
  intensity?: number
  x?: number
  y?: number
  z?: number
}
