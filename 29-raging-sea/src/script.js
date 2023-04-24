import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';
import waterVertex from './shaders/water/vertex.glsl';
import waterFragment from './shaders/water/fragment.glsl';

// Debug
const gui = new dat.GUI({ width: 340 });
const debugObject = {};

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Water
const waterGeometry = new THREE.PlaneGeometry(2, 2, 512, 512);

// Color
debugObject.depthColor = '#11118d';
debugObject.surfaceColor = '#7070c2';

const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: waterVertex,
    fragmentShader: waterFragment,
    uniforms: {
        uWaveElevation: { value: 0.2 },
        uWaveFrequency: { value: new THREE.Vector2(4, 1.5) },
        uWaveSpeed: { value: 0.75 },

        uSmallElevation: { value: 0.15 },
        uSmallFrequency: { value: 3 },
        uSmallSpeed: { value: 0.2 },
        uSmallIterations: { value: 4 },

        uTime: { value: 0 },

        uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
        uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
        uColorOffset: { value: 0.88 },
        uColorMultiplier: { value: 7 }
    }
});

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = - Math.PI * 0.5;
water.scale.set(10, 10, 10);
scene.add(water);

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
camera.position.set(1, 1, 1);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// GUI
gui.add(waterMaterial.uniforms.uWaveElevation, 'value').min(0).max(1).step(0.001).name('uWaveElevation');
gui.add(waterMaterial.uniforms.uWaveFrequency.value, 'x').min(0).max(10).step(0.001).name('uWaveFrequencyX');
gui.add(waterMaterial.uniforms.uWaveFrequency.value, 'y').min(0).max(10).step(0.001).name('uWaveFrequencyY');
gui.add(waterMaterial.uniforms.uWaveSpeed, 'value').min(0).max(4).step(0.001).name('uWaveSpeed');

gui.add(waterMaterial.uniforms.uColorOffset, 'value').min(0).max(1).step(0.001).name('uColorOffset');
gui.add(waterMaterial.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.001).name('uColorMultiplier');

gui.add(waterMaterial.uniforms.uSmallElevation, 'value').min(0).max(1).step(0.001).name('uSmallElevation');
gui.add(waterMaterial.uniforms.uSmallFrequency, 'value').min(0).max(30).step(0.001).name('uSmallFrequency');
gui.add(waterMaterial.uniforms.uSmallSpeed, 'value').min(0).max(4).step(0.001).name('uSmallSpeed');
gui.add(waterMaterial.uniforms.uSmallIterations, 'value').min(0).max(5).step(1).name('uSmallIterations');

gui.addColor(debugObject, 'depthColor').name('depthColor').onChange(() => {
    waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor);
    });
gui.addColor(debugObject, 'surfaceColor').name('surfaceColor').onChange(() => {
    waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor);
    });

// Animate
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update Water
    waterMaterial.uniforms.uTime.value = elapsedTime;

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();