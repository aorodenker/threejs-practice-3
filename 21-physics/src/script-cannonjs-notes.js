import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';
import CANNON from 'cannon';
//* npm install --save cannon

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Sounds
//* import mp3 sound - normal js syntax
const hitSound = new Audio('/sounds/hit.mp3');

//* function to play sound when collision velocity/strength is high enough at random volume
//* reset sound.currentTime to 0 for sequential sounds to play normally
const playHitSound = (e) => {
    const impactStrength = e.contact.getImpactVelocityAlongNormal();
    if (impactStrength > 1.5) {
        hitSound.volume = Math.random();
        hitSound.currentTime = 0;
        hitSound.play()
        .then()
        .catch((err => {
            console.log('Sounds require interaction!')
        }));
    };
};

// Textures
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
]);

// Physics
//* create cannon world - https://schteppe.github.io/cannon.js/docs/classes/World.html
const world = new CANNON.World();

//* change default broadphase to SAPBroadphase
//* CANNON.SAPBroadphase(world);
world.broadphase = new CANNON.SAPBroadphase(world);

//* enable allowSleep, performance improvement
//* can adjust how quickly Body falls asleep using world.sleepSpeedLimit property on world
//* https://schteppe.github.io/cannon.js/docs/classes/Body.html
world.allowSleep = true;

//* add gravity to cannon world
//* world.gravity.set(x,y,z) - Vec3
//* (0, -9.82, 0) = Earth gravity
world.gravity.set(0, -9.82, 0);

// Materials
const defaultMaterial = new CANNON.Material('default');

//* contact material - defines what happens when two materials meet
//* CANNON.ContactMaterial(material1, material2, options:object)
//* https://schteppe.github.io/cannon.js/docs/classes/ContactMaterial.html
const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1,
        restitution: 0.7
    }
);

//* add contact material to scene THEN set defaultContactMaterial to contact material
world.addContactMaterial(defaultContactMaterial);
world.defaultContactMaterial = defaultContactMaterial;

// Objects

// Floor
//* 0 mass for body that wont move
//* can add multiple bodies to another body
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body({
    mass: 0,
    shape: floorShape
});

//* cannon only supports Quaternion with setFromAxisAngle for rotation
//* body.quaternion.setFromAxisAngle(rotationAxis:Vec3, rotationAngle:num)
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI / 2);

world.addBody(floorBody);

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
);

floor.receiveShadow = true;
floor.rotation.x = - Math.PI * 0.5;
scene.add(floor);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
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
camera.position.set(- 3, 3, 3);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Utils
let objectsToUpdate = [];

// Sphere
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.6,
    roughness: 0.4,
    envMap: environmentMapTexture
});

//* one function to create three.js sphere AND cannon sphere
const createSphere = (radius, position) => {
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

    //* listen to collide event to play hit sound
    body.addEventListener('collide', playHitSound);

    world.add(body);

    objectsToUpdate.push({
        mesh: mesh,
        body: body
    });
};

// Box
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.6,
    roughness: 0.4,
    envMap: environmentMapTexture
});

const createBox = (width, height, depth, position) => {
    const mesh = new THREE.Mesh(boxGeometry, boxMaterial);

    mesh.scale.set(width, height, depth);
    mesh.castShadow = true;
    mesh.position.copy(position);
    scene.add(mesh);

    //* CANNON.Box(Vec3)
    //* different from THREE.BoxGeometry(), cannon measures from center of box, cannon = half of 3js box
    const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape: shape,
    });

    body.position.copy(position);

    //* listen to collide event to play hit sound
    body.addEventListener('collide', playHitSound);

    world.add(body);

    objectsToUpdate.push({
        mesh: mesh,
        body: body
    });
};

createSphere(0.5, {x: 0, y: 3, z: 0});

// Animate
const clock = new THREE.Clock();
let oldElapsedTime = 0;

// GUI
const gui = new dat.GUI()
const debugObject = {}

debugObject.createSphere = () => {
    createSphere(
        Math.random() * 0.5,
        {
            x: (Math.random() - 0.5) * 3,
            y: 3,
            z: (Math.random() - 0.5) * 3
        }
        );
};
debugObject.createBox = () => {
    createBox(
        Math.random(),
        Math.random(),
        Math.random(),
        {
            x: (Math.random() - 0.5) * 3,
            y: 3,
            z: (Math.random() - 0.5) * 3
        }
        );
};
//* reset function, remove eventListeners, bodies, meshes, clear objectsToUpdate array
debugObject.reset = () => {
    console.log('reset');
    for (const object of objectsToUpdate) {
        object.body.removeEventListener('collide', playHitSound);
        world.removeBody(object.body);
        scene.remove(object.mesh);
        objectsToUpdate = [];
    }
};

gui.add(debugObject, 'createSphere');
gui.add(debugObject, 'createBox');
gui.add(debugObject, 'reset');

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - oldElapsedTime;
    oldElapsedTime = elapsedTime;

    // Update Physics World
    //* https://schteppe.github.io/cannon.js/docs/classes/World.html#method_step
    //* world.step(fixedTimeStepSize:num, timeSinceLastCalled:num, maxStepsPerCall:num)
    //* 1/60 because we want 60 fps, can step 3 times to catch up with potential delay
    world.step(1/60, deltaTime, 3);

    for (const object of objectsToUpdate) {
        object.mesh.position.copy(object.body.position);
        object.mesh.quaternion.copy(object.body.quaternion);
    };

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();

/* ----- PHYSICS ----- */
//* Raycaster: https://threejs.org/docs/#api/en/core/Raycaster
//* for more realistic libraries, better to use external libraries
//? 3D Physics Libraries:
//* Ammo.js - harder to use, but has more features, has WebAssembly support, most popular
//* Cannon.js - easy to use
//* Oimo.js
//? 2D Physics Libraries:
//* Matter.js
//* P2.js
//* Planck.js
//* Box2D.js
//? Solution trying to combine Three.js with physics libraries:
//* Physijs - uses ammo.js, supports workers natively, doesn't require separate physics Body
//* good for beginners, but limiting

//* Cannon.js demos - https://schteppe.github.io/cannon.js/
//* Cannon.js hasn't been updated in years
//* user maintained fork - Cannon-es - https://github.com/pmndrs/cannon-es

/* ----- WORKERS ----- */
//* CPU handles physics, currently everything is done by same thread in CPU, can quickly overload
//* solution = workers - put part of code in different threads to spread load
//* worker example - https://schteppe.github.io/cannon.js/examples/worker.html Ctrl+U

/* ----- BROADPHASE ----- */
//* reduce amount of potential collisions calculated, improve performance
//* for all broadphases, all bodies are tested, even those not moving anymore
//* UNLESS using allowSleep = true. Slow or still bodies will 'sleep' til moving again
//* Do not test every Body against every other Body, bad for performance
//* https://schteppe.github.io/cannon.js/docs/classes/Broadphase.html

//? NaiveBroadphase - tests every collision of Body against every other Body (cannon default)
//* worst gpu performance
//* https://schteppe.github.io/cannon.js/docs/classes/NaiveBroadphase.html

//? GridBroadphase - only tests collision of Body against other Body in same gridbox or adjacent gridbox
//* medium gpu performance, can cause bugs for fast moving Body not colliding with other Bodies
//* https://schteppe.github.io/cannon.js/docs/classes/GridBroadphase.html

//? SAPBroadphase - SAP(Sweep And Prune) tests Bodies on arbitrary axis during multiple steps
//* best gpu performance, can have same bugs as GridBroadphase
//* https://schteppe.github.io/cannon.js/docs/classes/SAPBroadphase.html

/* ----- FORCE ----- */

//? applyForce - apply force from specific time in space (not necessarily on the Body's surface)
//* ex: wind, small push on domino, strong force like Angry Birds

//? applyImpulse - like applyForce, but instead of adding to force, will add to velocity
//* bypasses force and applies directly to velocity
//* ex: engine speeding up a car, falling, sliding

//? applyLocalForce - same as applyForce, but coordinates are local to the Body (0,0,0 = center of body)

//? applyLocalImpulse - same as applyImpulse, but local to Body

/* ----- CONSTRAINTS ----- */
//* enables constraints between two Bodies

//? HingeConstraint - acts like door hinge
//* https://schteppe.github.io/cannon.js/docs/classes/HingeConstraint.html

//? DistanceConstraint - forces Bodies to keep a distance between each other
//* https://schteppe.github.io/cannon.js/docs/classes/DistanceConstraint.html

//? LockConstraint - merge Bodies as if they were one Body
//* https://schteppe.github.io/cannon.js/docs/classes/LockConstraint.html

//? PointToPointConstraint - glue Body to specific point
//* https://schteppe.github.io/cannon.js/docs/classes/PointToPointConstraint.html

/* ----- EVENTS ----- */
//* can listen to Body events ex: 'collide', 'sleep', 'wakeup'
//* sounds will play after current sound has finished, sounds bad
//* remedy this by resetting sound to 0 with currentTime property
//* AND use collision property to check collision velocity / strength
//* AND use random volume level

/* ----- CODE ----- */
//* shape in cannon = geometry in three.js
//* CANNON.Sphere(radius:num) - https://schteppe.github.io/cannon.js/docs/classes/Sphere.html
// const sphereShape = new CANNON.Sphere(0.5);

//* body in cannon = object in three.js - https://schteppe.github.io/cannon.js/docs/classes/Body.html
//* CANNON.Body(object) - mass:num, position:Vec3, shape:var(CANNON.<shape>)
// const sphereBody = new CANNON.Body({
//     mass: 1,
//     position: new CANNON.Vec3(0, 3, 0),
//     shape: sphereShape
// });

//* applyLocalForce(force:Vec3, localPoint:Vec3)
// sphereBody.applyLocalForce(new CANNON.Vec3(150, 0, 0), new CANNON.Vec3(0, 0, 0));

//* add body to world
// world.addBody(sphereBody);

// const sphere = new THREE.Mesh(
//     new THREE.SphereGeometry(0.5, 32, 32),
//     new THREE.MeshStandardMaterial({
//         metalness: 0.3,
//         roughness: 0.4,
//         envMap: environmentMapTexture,
//         envMapIntensity: 0.5
//     })
// );

// sphere.castShadow = true;
// sphere.position.y = 0.5;
// scene.add(sphere);

// const tick = () => {
//     const elapsedTime = clock.getElapsedTime();
//     const deltaTime = elapsedTime - oldElapsedTime;
//     oldElapsedTime = elapsedTime;

    // Wind
    //* apply wind to the sphere only
    //* applyForce(force:Vec3, worldPoint:Vec3)
    // sphereBody.applyForce(new CANNON.Vec3(-0.5, 0, 0), sphereBody.position);

    // Update Physics World
    //* https://schteppe.github.io/cannon.js/docs/classes/World.html#method_step
    //* world.step(fixedTimeStepSize:num, timeSinceLastCalled:num, maxStepsPerCall:num)
    //* 1/60 because we want 60 fps, can step 3 times to catch up with potential delay
    // world.step(1/60, deltaTime, 3);

    //* update three.js sphere position to match physics
    // sphere.position.copy(sphereBody.position);

    // controls.update();
    // renderer.render(scene, camera);
    // window.requestAnimationFrame(tick);
// };