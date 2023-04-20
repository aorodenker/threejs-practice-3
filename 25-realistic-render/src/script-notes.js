import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Debug
const gui = new dat.GUI();
const debugObject = {};

//* traverse entire scene
const updateAllMaterials = () => {
    scene.traverse((child) => {
        //* check if child is Mesh AND MeshStandardMaterial and apply envMapIntensity to that child
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.envMapIntensity = debugObject.envMapIntensity;
            child.castShadow = true;
            child.receiveShadow = true;
        };
    });
};

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Loaders
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

//* flight helmet load
gltfLoader.load(
    'models/hamburger.glb',
    (gltf) => {
        gltf.scene.scale.set(0.3, 0.3, 0.3);
        gltf.scene.position.set(0, -1, 0);
        gltf.scene.rotation.y = Math.PI * 0.5;
        scene.add(gltf.scene);

        updateAllMaterials();

        gui.add(gltf.scene.rotation, 'y')
        .min(-Math.PI).max(Math.PI).step(0.001).name('rotation');
    }
);

//* envMap loader
const environmentMap = cubeTextureLoader.load([
    'textures/environmentMaps/2/px.jpg',
    'textures/environmentMaps/2/nx.jpg',
    'textures/environmentMaps/2/py.jpg',
    'textures/environmentMaps/2/ny.jpg',
    'textures/environmentMaps/2/pz.jpg',
    'textures/environmentMaps/2/nz.jpg'
]);
//* change envMap encoding from default to sRGBEncoding for accurate colors
environmentMap.encoding = THREE.sRGBEncoding;
//* set scene background
scene.background = environmentMap;
//* scene environment to loaded envMap
//* this will apply envMap to all objects with the environment property on the scene
scene.environment = environmentMap;

// Lights
const directionalLight = new THREE.DirectionalLight('#ffffff', 3);
directionalLight.position.set(0.25, 3, -2.25);
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.mapSize.set(1024, 1024);
//* tweak shadow normalBias to fix 'shadow acne'
directionalLight.shadow.normalBias = 0.05;
scene.add(directionalLight);

//* camera helper for adjusting near and far
// const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(directionalLightCameraHelper);

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
camera.position.set(4, 1, - 4);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//* physically realistic light values - NOW DEFAULT IN LATEST THREEJS VERSION
//* makes it easier to get same result from different software (blender, threejs)
renderer.physicallyCorrectLights = true;
//* change default outputEncoding from LinearEncoding to sRGBEncoding
//* helps with light realism
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 3;
//* turn on shadowMap and change type from default
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// GUI
gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('lightIntensity');
gui.add(directionalLight.position, 'x').min(-5).max(5).step(0.001).name('lightX');
gui.add(directionalLight.position, 'y').min(-5).max(5).step(0.001).name('lightY');
gui.add(directionalLight.position, 'z').min(-5).max(5).step(0.001).name('lightZ');

debugObject.envMapIntensity = 2.5;
gui.add(debugObject, 'envMapIntensity').min(0).max(5).step(0.001).onChange(updateAllMaterials);

gui.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping,
});
gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001);

gui.add(directionalLight.shadow, 'normalBias').min(0).max(0.5).step(0.001)

// Animate
const tick = () => {
    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();

/* ----- ENCODING ----- */
//? LinearEncoding - default, uses linear light/color scale
//? GammaEncoding - for gamma scaling, don't use
//? sRGBEncoding - uses scale accurate to how our eyes perceive light/color
//* all textures we can see directly, like map, should have sRGBEncoding
//* all other textures, like normalMap, should have LinearEncoding (default)
//* GLTFLoader uses correct encoding automatically, cubeTextureLoader does not

/* ----- TONE MAPPING ----- */
//* intends to convert HDR(high dynamic range) values to LDR(low dynamic range) values
//* current assets aren't HDR, but tone mapping can still provide result as if camera was poorly adjusted
//* creates algorithm to normalize HDR
//? HDR - images where color values can go beyond 1
//* ex: white paper = 1, light should be higher than 1
// Three.js built in toneMapping:
//? THREE.NoToneMapping - default
//? THREE.LinearToneMapping
//? THREE.ReinhardToneMapping
//? THREE.CineonToneMapping
//? THREE.ACESFilmicToneMapping

//* tone mapping exposure can be manipulating using renderer.toneMappingExposure

/* ----- ANTI-ALIASING ----- */
//* stair-like effect happens when the renderer is choosing if the geometry is in the pixel or not
//? SSAA(super sampling) aka: FSAA(fullscreen sampling)
//? MSAA(multi sampling)

// Solutions:
//* 1) SSAA/FSAA
//* increase renderer resolution
//* 2x the resolution divides each pixel into 4 quadrants, creating 4 pixels
//* easy and efficient, but bad performance

//* 2) MSAA
//* apply SSAA/FSAA only to edges of geometry
//* most recent GPUs can perform MSAA
//* three.js handles setup automatically in renderer instantiation:
// const renderer = new THREE.WebGLRenderer({
//     canvas: canvas,
//     antialias: true
// });

/* ----- SHADOWS ----- */
//* burger has weird shadowing on surface
//* similar effect to anti-aliasing, causes stair-like shadows
//* known as 'shadow acne'
//* happens when object casts shadow on its own surface
// Solution:
//* tweak shadow's bias OR normalBias
//* bias for flat surfaces
// directionalLight.shadow.bias = 0.05;
//* normalBias for rounded surfaces
// directionalLight.shadow.normalBias = 0.05;