import * as THREE from 'three';
import CANNON from 'cannon';

const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.6,
    roughness: 0.4,
    envMap: environmentMapTexture
});

export const createSphere = (radius, position) => {
  const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

  mesh.scale.set(radius, radius, radius);
  mesh.castShadow = true;
  mesh.position.copy(position);
  scene.add(mesh);

  const shape = new CANNON.Sphere(radius);
  const body = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(0, 3, 0),
      shape: shape,
  });

  body.position.copy(position);
  world.add(body);

  objectsToUpdate.push({
      mesh: mesh,
      body: body
  });
};