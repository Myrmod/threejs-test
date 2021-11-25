import * as THREE from 'three'

export default function calcOrthogonalVector(object: THREE.Object3D): THREE.Vector3 {
  // create default plane using normal vector
  const normalVector = new THREE.Vector3(0, 1, 0)
  const normalPlane = new THREE.Plane(normalVector, 0)

  // copy rotation of camera to plane
  normalPlane.normal.set(0, 1, 0).applyQuaternion(object.quaternion.clone())

  // get new normal vector
  const newNormalVector = normalPlane.normal

  // create new vector from cross product
  const crossVector = new THREE.Vector3()
  crossVector.crossVectors(newNormalVector, object.getWorldDirection(new THREE.Vector3()))

  return crossVector
}
