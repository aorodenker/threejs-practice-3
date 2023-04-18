import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Objects
const object1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
);

const object2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
);

const object3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
);

object1.position.x = - 2;
object3.position.x = 2;

scene.add(object1, object2, object3);

// Raycaster
const raycaster = new THREE.Raycaster();
let currentIntersect = null;

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

// Mouse
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX / sizes.width * 2 - 1;
    mouse.y = - (e.clientY / sizes.height * 2 - 1);
});

window.addEventListener('click', () => {
    if (currentIntersect) {
        switch (currentIntersect.object) {
            case object1:
                console.log('clicked one');
                break;

            case object2:
                console.log('clicked two');
                break;

            case object3:
                console.log('clicked three');
                break;
        }
    };
});

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 3;
scene.add(camera);

// Lights
const ambientLight = new THREE.AmbientLight('#ffffff', 0.3);
const directionalLight = new THREE.DirectionalLight('#ffffff', 0.7);

directionalLight.position.set(1, 2, 3);
scene.add(ambientLight, directionalLight);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Loader
const gltfLoader = new GLTFLoader();
let model;

gltfLoader.load(
    '/models/Duck/glTF-Binary/Duck.glb',
    (gltf) => {
        model = gltf.scene;
        model.position.y = -1.2;
        scene.add(model);
});

// Animate
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Animate Objects
    object1.position.y = Math.sin(elapsedTime * 0.3) * 1.5;
    object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5;
    object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5;

    // Mouse Raycasting
    raycaster.setFromCamera(mouse, camera);

    const objectsToTest = [object1, object2, object3];
    const intersects = raycaster.intersectObjects(objectsToTest);

    for (const item of objectsToTest) {
        item.material.color.set('red');
    };

    for (const item of intersects) {
        item.object.material.color.set('blue');
    };

    if (intersects.length) {
        if (currentIntersect === null) {
            console.log('hovered')
        }
        currentIntersect = intersects[0];
    } else {
        if (currentIntersect) {
            console.log('nothing hovered')
            currentIntersect = null;
        }
    }

    // Duck Raycasting
    if (model) {
        const modelIntersects = raycaster.intersectObject(model);
        if (modelIntersects.length) {
            model.scale.set(1.2, 1.2, 1.2);
        } else {
            model.scale.set(1, 1, 1);
        };
    };

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();