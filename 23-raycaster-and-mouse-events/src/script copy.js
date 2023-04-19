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

//* create variable to store duck for scope issues
let model;

gltfLoader.load(
    '/models/Duck/glTF-Binary/Duck.glb',
    (gltf) => {
        //* store duck in model
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
    //* if model exists (post load), assign intersecting model to modelIntersects variable
    if (model) {
        const modelIntersects = raycaster.intersectObject(model);

        //* if model is intersected, scale size up
        if (modelIntersects.length) {
            model.scale.set(1.2, 1.2, 1.2);
            
        //* otherwise reset scale to 1 because nothing is hovered
        } else {
            model.scale.set(1, 1, 1);
        };
    };

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();

/* ----- RAYCASTER ----- */
//* https://threejs.org/docs/#api/en/core/Raycaster
//* cast ray in specific direction and test which objects intersect with it
//* ex: detect walls in front of player
//* ex: if laser gun hit something
//* ex: if something is currently under mouse to simulate mouse events
//* ex: alert message if spaceship is headed toward a planet

/* ----- CODE ----- */
//? Creating and using a Raycaster
// const raycaster = new THREE.Raycaster();

//* create raycaster origin slightly left of first sphere and raycaster direction to the right
// const rayOrigin = new THREE.Vector3(-3, 0, 0);
// const rayDirection = new THREE.Vector3(10, 0, 0);

//* direction must be normalized, reduces size to 1 but keeps direction
// rayDirection.normalize();

//* raycaster.set(origin:Vector3, direction:Vector3)
// raycaster.set(rayOrigin, rayDirection);

//* test if ray intersects object
// const intersect = raycaster.intersectObject(object2);
// const intersects = raycaster.intersectObjects([object1, object2, object3]);

//* console.log() to view intersected objects
//* can intersect one object multiple times depending on object shape
// console.log(intersect)
// console.log(intersects)

//? Using Raycaster in tick function
// const tick = () => {
//     const elapsedTime = clock.getElapsedTime();

    // Animate Objects
    // object1.position.y = Math.sin(elapsedTime * 0.3) * 1.5;
    // object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5;
    // object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5;

    // Raycaster Testing
    // const rayOrigin = new THREE.Vector3(-3, 0, 0);
    // const rayDirection = new THREE.Vector3(1, 0, 0);
    // rayDirection.normalize();
    // raycaster.set(rayOrigin, rayDirection);

    // const objectsToTest = [object1, object2, object3];
    // const intersects = raycaster.intersectObjects(objectsToTest);

    //* reset objects to red
    // for (const item of objectsToTest) {
    //     item.material.color.set('red');
    // };

    //* loop over intersecting objects and turn them blue if they intersect
    // for (const item of intersects) {
    //     item.object.material.color.set('blue');
    // };

    // controls.update();
    // renderer.render(scene, camera);
    // window.requestAnimationFrame(tick);
// };

//? Using Raycaster on mouse enter / leave
// const raycaster = new THREE.Raycaster();

//* create variable to store currently hovered object
// let currentIntersect = null;

//* create mouse variable, Vector2 because we only use x and y coordinates
// const mouse = new THREE.Vector2();

//* listen for mouse movements to update mouse coordinates
// window.addEventListener('mousemove', (e) => {
//     mouse.x = e.clientX / sizes.width * 2 - 1;
//     mouse.y = - (e.clientY / sizes.height * 2 - 1);
// });

//* click listener to check which object is clicked on
// window.addEventListener('click', () => {
//     if (currentIntersect) {
//         //* switch statement in place of if statements for style points
//         switch (currentIntersect.object) {
//             case object1:
//                 console.log('clicked one');
//                 break;

//             case object2:
//                 console.log('clicked two');
//                 break;

//             case object3:
//                 console.log('clicked three');
//                 break;
//         }
//     };
// });

// const tick = () => {
//     const elapsedTime = clock.getElapsedTime();

    // Animate Objects
    // object1.position.y = Math.sin(elapsedTime * 0.3) * 1.5;
    // object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5;
    // object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5;

    // Mouse Raycasting
    //* send ray towards mouse coordinates, originating from camera
    //* raycaster.setFromCamera(2DMouseCoordinates:Vector2 between -1 and 1, cameraForRayOrigination:camera)
    // raycaster.setFromCamera(mouse, camera);

    // const objectsToTest = [object1, object2, object3];
    // const intersects = raycaster.intersectObjects(objectsToTest);

    //* reset objects to red
    // for (const item of objectsToTest) {
    //     item.material.color.set('red');
    // };

    //* loop over intersecting objects and turn them blue if they intersect
//     for (const item of intersects) {
//         item.object.material.color.set('blue');
//     };

//     controls.update();
//     renderer.render(scene, camera);
//     window.requestAnimationFrame(tick);
// };