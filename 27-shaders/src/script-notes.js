/* ----- SHADERS ----- */
//? Data sent to the shader:
//* - vertices coordinates
//* - mesh transformation
//* - information about camera
//* - colors
//* - textures
//* - lights
//* - fog
//* - etc.
//* GPU processes all of this data and follows the shader's instructions

// Types of Shaders:
//? Vertex Shader - position each vertex of the geometry
//? Fragment Shader - colors each visible pixel of the geometry, executes after Vertex Shader

//? Attributes: info that changes between each vertex (like their position), only useable on Vertex Shader
//? Uniforms: info that doesn't change between vertices or fragments, can be used by both shaders
//* useful for: using the same shader for different results, tweak values, animate values
//? Varying: data sent from Vertex Shader to Fragment Shader, data is interpolated between vertices

/* ----- CUSTOM SHADERS ----- */
//? ShaderMaterial - some code automatically added to the shader
//* https://threejs.org/docs/#api/en/materials/ShaderMaterial
//? RawShaderMaterial - nothing added, 'raw'
//* https://threejs.org/docs/#api/en/materials/RawShaderMaterial

//? GLSL files(OpenGL Shading Language)
// Documentation / Useful Links:
//* https://docs.gl/sl4/all
//* https://shaderific.com/glsl.html
//* https://registry.khronos.org/OpenGL-Refpages/gl4/html/indexflat.php
//* https://learnopengl.com/Getting-started/Shaders
//* https://thebookofshaders.com/
//* https://www.shadertoy.com/

//* language similar to C
//* no console, aka console.log()
//* indentation not essential
//* semicolon REQUIRED to end any instruction

/* -- GLSL Syntax -- */

//* typed language, must specify variable type and cannot assign any other type to that variable

//! float:
// float fooBar = 0.123;
//* float(0.123) !== int(1), but can be negative, and can use 1.0 for float
//* float and int can't be mixed (float + int), but can be converted for equations:
// float a = 1.0;
// int b = 2;
// float c = a * float(b);

//! boolean:
// bool foo = true;
// bool bar = false;

//! vec2(x:float, y:float):
//* can be negative, can't be empty, but can use one value if x and y are the same, vec2(1.0, 1.0) === vec2(1.0)
//* vec2 ex:
// vec2 foo = vec2(1.0, 2.0);
//* properties can be changed:
// vec2 foo = vec2(0.0);
// foo.x = 1.0;
// foo.y = 2.0;
//* doing operations on a vec2 will apply to BOTH x and y:
// vec2 foo = vec2(1.0, 2.0);
// foo *= 2.0;
//* after operation, foo = vec2(2.0, 4.0)

//! vec3(x:float, y:float, z:float):
//* similar rules to vec2

//* convenient for 3D coordinates:
// vec3 foo = vec3(0.0);
// vec3 bar = vec3(1.0, 2.0, 3.0);
// bar.z = 4.0

//* convenient for colors, x,y,z can be aliased as r,g,b
//* vec3.x === vec3.r, ex:
// vec3 purpleColor = vec3(0.0);
// purpleColor.r = 0.5;
// purpleColor.b = 1.0;

//* vec3 can be partially created from a vec2:
//* vec2 -> vec3
// vec2 foo = vec2(1.0, 2.0);
// vec3 bar = vec3(foo, 3.0);

//* vec3 can be used to create a vec2, known as 'swizzle'
//* vec3 -> vec2
// vec3 foo = vec3(1.0, 2.0, 3.0);
// vec2 bar = foo.xy;

//! vec4(x:float, y:float, z:float, w:float):
//* x,y,z,w can be aliased as r,g,b,a
// vec4 foo = vec4(1.0, 2.0, 3.0, 4.0);
// vec4 bar = vec4(foo.zw, vec2(5.0, 6.0));

//! function
//* must start with type of value it will return:
// float loremIpsum() {
//     float a = 1.0;
//     float b = 2.0;
//     return a + b;
// }
// float result = loremIpsum();

//* if not meant to return anything, type = void:
// void loremIpsum(){ ... }

//* param types must be defined:
// float add(float a, float b) {
//     return a + b;
// }
// float result = loremIpsum(1.0, 2.0);

//* built in classic functions:
// sin, cos, max, min, pow, exp, mod, clamp, etc.
//* built in practical functions:
// cross, dot, mix, step, smoothstep, length, distance, reflect, refract, normalize, etc.

//! others: mat2, mat3, mat4, sampler2D, etc.

//* common properties will still work:
//* wireframe, side, transparent, flatShading, etc.

//* some properties will not work, and need to be created ourselves:
//* map, alphaMap, opacity, color, etc.

//* 1) install glsl file handler plugin:
// npm install vite-plugin-glsl

//* 2) separate VertexShader and FragmentShader into individual glsl files

//* 3) add glsl plugin to vite.config.js:
// import glsl from 'vite-plugin-glsl';
// export default {
    //...
//     plugins: [
//         glsl()
//     ]
// }

//* 4) define VertexShader and FragmentShader:

//? VertexShader:
// uniform mat4 projectionMatrix;
// uniform mat4 viewMatrix;
// uniform mat4 modelMatrix;

// attribute vec3 position;

// void main() {
//   gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
// }

//? FragmentShader:
// precision mediump float;

// void main() {
//   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
// }

//* 5) import shaders:
// import testVertexShader from './shaders/test/vertex.glsl';
// import testFragmentShader from './shaders/test/fragment.glsl';

//* 6) use custom shaders in material:
// const material = new THREE.RawShaderMaterial({
//     vertexShader: testVertexShader,
//     fragmentShader: testFragmentShader
// });

/* -- VertexShader Code Breakdown -- */

//! void main() is called automatically and doesn't return anything (void)

//! attribute vec3
// attribute vec3 position;
//* provides us the position attribute from geometry supplied on creation in three.js
//* different between each vertex
//* 'position' variable contains x,y,z coordinates from the three.js attribute

//! gl_Position - vec4
//* variable gl_Position already exists, which is why we can reassign
//* contains formula that positions the vertex on the screen

//* converts position to a vec4:
// ...vec4(position, 1.0);

//* why vec4? - homogeneous coordinates
//* 'clip space' (?)
//* x,y,z,w, 4th value(w) responsible for perspective (?)

//* can manipulate properties, but don't do it like this:
// gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
// gl_Position.x += 0.5;
// gl_Position.y += 0.5;

//! uniform
//* 'uniform' because they do not change from one shader invocation to the next
//* currently there are 3 matrices provided by three.js:
// uniform mat4 projectionMatrix;
// uniform mat4 viewMatrix;
// uniform mat4 modelMatrix;

//* there is a shorter version that combines viewMatrix and modelMatrix
//* less control over each step
// uniform mat4 projectionMatrix;
// uniform mat4 modelViewMatrix;

// attribute vec3 position;

// void main() {
//   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
// }

//! mat4 - matrix 4 (4x4)
//* mat4 data type is composed for a 4x4 matrix of a floating point
//* must use mat4 for vec4, mat3 for vec3
//* to apply a matrix, we multiply it:
// gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

//! gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
//* applied order of operations:
//* position -> apply modelMatrix -> apply viewMatrix -> apply projectionMatrix
//* step breakdown:
// vec4 modelPosition = modelMatrix * vec4(position, 1.0);
// vec4 viewPosition = viewMatrix * modelPosition;
// vec4 projectedPosition = projectionMatrix * viewPosition;

// gl_Position = projectedPosition;

//! modelMatrix:
// uniform mat4 modelMatrix;
//* handles transformations relative to the Mesh(position, rotation, scale)
//* ex: mesh.position.x = 1 gets converted to modelMatrix then apply modelMatrix to position coordinates:
// gl_Position = .... modelMatrix * vec4(position, 1.0)

//! viewMatrix:
//* handles transformations relative to the camera: position, rotation, fov, near, far, etc.

//! projectionMatrix
//* transforms coordinates into final 'clip space' coordinates

/* -- FragmentShader Code Breakdown -- */

//! void main() is called automatically and doesn't return anything (void)

//! precision mediump float;
//* automatically handled by three.js when using ShaderMaterial
//* precision lets you decide how precise a float can be
//* precision must be combined with:
//* highp - bad performance and might not work on some devices
//* mediump - middle ground, standard
//* lowp - can create bugs by lack of precision

//! gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
//* variable gl_FragColor already exists, which is why we can reassign
//* will contain the color of the fragment
//* vec4(r,g,b,a)

/* ----- CODE ----- */
//! Attribute example
//? make waves in object:
// void main() {
//     vec4 modelPosition = modelMatrix * vec4(position, 1.0);
//     modelPosition.z += sin(modelPosition.x * 10.0) * 0.1;

//     vec4 viewPosition = viewMatrix * modelPosition;
//     vec4 projectedPosition = projectionMatrix * viewPosition;

//     gl_Position = projectedPosition;
//   }

//! Varying example
//? create random heights on a plane and color based on height:
//* Javascript:
// const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
// const count = geometry.attributes.position.count;
// const randoms = new Float32Array(count);
// for (let i = 0; i < count; i++) {
//     randoms[i] = Math.random();
// };
// geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

//* VertexShader:
// uniform mat4 projectionMatrix;
// uniform mat4 viewMatrix;
// uniform mat4 modelMatrix;

// attribute vec3 position;
//* grab 'aRandom' from attributes sent from threejs
// attribute float aRandom;

//* create 'varying' to send values from VertexShader to FragmentShader
// varying float vRandom;

// void main() {
//   vec4 modelPosition = modelMatrix * vec4(position, 1.0);
//   modelPosition.z += aRandom * 0.1;

  //* store aRandom in varying sent to FragmentShader
//   vRandom = aRandom;

//   vec4 viewPosition = viewMatrix * modelPosition;
//   vec4 projectedPosition = projectionMatrix * viewPosition;

//   gl_Position = projectedPosition;
// }

//* FragmentShader:
// precision mediump float;

//* receive varying from VertexShader
// varying float vRandom;

// void main() {
 //* use varying to color each pixel
//  gl_FragColor = vec4(0.5, vRandom, 1.0, 1.0);
// }

//! Uniform example
//? animate flag to 'wave' and send color from threejs to FragmentShader
//* Javascript:
// const material = new THREE.RawShaderMaterial({
//     vertexShader: testVertexShader,
//     fragmentShader: testFragmentShader,
//     uniforms: {
//         uFrequency: { value: new THREE.Vector2(10, 5) },
//         uTime: { value: 0 },
//         uColor: { value: new THREE.Color('orange') }
//     }
// });

// const tick = () => {
//     const elapsedTime = clock.getElapsedTime();

//     material.uniforms.uTime.value = elapsedTime;

//     controls.update();
//     renderer.render(scene, camera);
//     window.requestAnimationFrame(tick);
// };

// tick();

//* VertexShader:
// uniform mat4 projectionMatrix;
// uniform mat4 viewMatrix;
// uniform mat4 modelMatrix;

//* grab new uniforms sent from threejs
// uniform vec2 uFrequency;
// uniform float uTime;
// attribute vec3 position;

// void main() {
//   vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  //* use created uniforms in equation
//   modelPosition.z += sin(modelPosition.x * uFrequency.x - uTime) * 0.1;
//   modelPosition.z += sin(modelPosition.y * uFrequency.y - uTime) * 0.1;
//   vec4 viewPosition = viewMatrix * modelPosition;
//   vec4 projectedPosition = projectionMatrix * viewPosition;
//   gl_Position = projectedPosition;
// }

//* FragmentShader:
// precision mediump float;
//* grab color uniform from threejs
// uniform vec3 uColor;

// void main() {
 //* use uniform in color calculation
//  gl_FragColor = vec4(uColor, 1.0);
// }