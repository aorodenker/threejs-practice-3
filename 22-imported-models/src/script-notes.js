import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';

//* access many different loader types in node_modules threejs loaders folder
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// GLTF Loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

//* create mixer variable for scope in tick function
let mixer;

gltfLoader.load(
    '/models/Fox/glTF/Fox.gltf',
    (gltf) => {
        //* create mixer for animation clips
        mixer = new THREE.AnimationMixer(gltf.scene);

        //* add a clip to mixer
        const action = mixer.clipAction(gltf.animations[2]);

        //* play selected action
        action.play();

        //* scale down fox
        gltf.scene.scale.set(0.025, 0.025, 0.025);
        scene.add(gltf.scene);
    }
);

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5
    })
);
floor.receiveShadow = true;
floor.rotation.x = - Math.PI * 0.5;
scene.add(floor);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = - 7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = - 7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

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
camera.position.set(2, 2, 2);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Animate
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    // Update Mixer
    //* update only if mixer is defined
    if (mixer) {
        //* mixer.update(timeSinceLastTick:num)
        mixer.update(deltaTime);
    };

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();

/* ----- MODELS ----- */
//? Three.js Editor
//* https://threejs.org/editor/
//* like tiny online 3D software, good for testing models
//* only works for models composed of ONE file
//* file -> import -> select file

//? Popular Formats:
//* OBJ, FBX, STL, PLY, COLLADA, 3DS, GLTF

//? GLTF(GL Transmission Format) - most popular
//* supports:
//* geometries, materials, cameras, lights, sceneGraph(objectGroup), animations, skeletons, morphing, etc
//* various formats: JSON, binary, embedded textures
//* becoming the standard for real-time, most 3D softwares, game engines
//* don't need to use in all cases, question data you need

//* GLTF team provided models for testing:
//* https://github.com/KhronosGroup/glTF-Sample-Models/

/* ----- Duck ----- */
//? Duck-gltf-default
//* Duck.gltf - JSON, contains: cameras, lights, scenes, materials, objects transformations
//* Duck.bin - binary, usually contains geometries(vertices positions, UV coordinates, normals, colors, etc)
//* DuckCM.png - image, contains texture

//* when loading Duck.gltf, other files load automatically

//? Duck-gltf-Binary
//* one file, contains all data, usually lighter, easier to load one file, harder to alter its data

//? Duck-gltf-Draco
//* maintained by google - https://google.github.io/draco/
//* similar to standard gltf version, but much lighter
//* compression is applied to the buffer data (typically geometry)
//* not always best solution, files are lighter but user has to load DRACOLoader class and decoder
//* also takes time and resources to decode a compressed files

//* decoder(DRACOLoader) is available in Web Assembly:
//* allows it to run in a worker to improve performance significantly
//* 1) copy draco folder from 'node_modules/threejs/examples/jsm/libs/draco'
//* 2) paste it into static folder
//* 3) provide Loader with path to draco folder:
// const dracoLoader = new DRACOLoader();
// dracoLoader.setDecoderPath('/draco/');
// const gltfLoader = new GLTFLoader();
// gltfLoader.setDRACOLoader(dracoLoader);

//? Duck-gltf-Embedded
//* JSON, one file, heaviest

//? Choosing which to use:
//* depends on what you want to do
//* want to be able to alter files, use gltf default
//* else, gltf binary might be better
//* decide if you want to use Draco compression

/* ----- ANIMATIONS ----- */
//* load animated model
//* gltf.scene.animations contains AnimationClips
//* AnimationClip - threejs classes, 'keyframes'

/* ----- CODE ----- */

//* load models - Loader.load(file:string, success:func, progress:func, error:func)
// gltfLoader.load(
//     '/models/Duck/glTF/Duck.gltf',
//     (gltf) => { console.log(gltf) }
// );

//* scene property contains everything we need, always start by studying model structure
//* check position, rotation, and scale. in this case, Object3D scale is very small
//* if you add Object3D with mesh inside, you will get something very small
//* gltf.scene.children[0](.Object3D).children[1](.Mesh) = Duck model

//* since scene property is a group, you can add whole scene to canvas
//* not great, but it will work
// gltfLoader.load(
//     '/models/Duck/glTF/Duck.gltf',
//     (gltf) => {
//         scene.add(gltf.scene);
//     }
// );

//* - OR -
//* add all children of the group to scene
//* will preserve actual scale, but also adds things you don't need (PerspectiveCamera)
// gltfLoader.load(
//     '/models/FlightHelmet/glTF/FlightHelmet.gltf',
//     (gltf) => {
//         while (gltf.scene.children.length) {
//             scene.add(gltf.scene.children[0])
//         };
//     }
// );

//* - OR -
//* filter children and only add what you need
//* harder, have to iterate thru array picking, or find index you need from structure
// gltfLoader.load(
//     '/models/FlightHelmet/glTF/FlightHelmet.gltf',
//     (gltf) => {
//         for (const child of gltf.scene.children) {
//             scene.add(child);
//         };
//     }
// );
// gltfLoader.load(
//     '/models/Duck/glTF/Duck.gltf',
//     (gltf) => {
//         scene.add(gltf.scene.children[0]);
//     }
// );

//* - OR -
//* create copy of children array, adding each child to scene from that new array
//! WHY DOES THIS WORK??
// gltfLoader.load(
//     '/models/FlightHelmet/glTF/FlightHelmet.gltf',
//     (gltf) => {
//         const children = [...gltf.scene.children];
//         for (const child of children) {
//             scene.add(child);
//         }
//     }
// );

//* - OR -
//* clean file in 3D software then export it again
//* best solution, but time consuming