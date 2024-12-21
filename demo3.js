/*
MIT License

Copyright (c) 2017 Pavel Dobryakov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

'use strict';

// Configuration
const config = {
    MOUSE_FORCE: 0.15,
    COLOR_INTENSITY: 1.2,
    COLORS: [
        new THREE.Color(0x7AD3DF), // Blue
        new THREE.Color(0x91F065), // Green  
        new THREE.Color(0xFE4ADA), // Pink
        new THREE.Color(0xFFEC68)  // Yellow
    ]
};

// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true,
    canvas: document.createElement('canvas')
});
document.body.appendChild(renderer.domElement);

// Create shader material
const material = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uResolution: { value: new THREE.Vector2() },
        uColor1: { value: config.COLORS[0] },
        uColor2: { value: config.COLORS[1] },
        uColor3: { value: config.COLORS[2] },
        uColor4: { value: config.COLORS[3] },
        uColorIntensity: { value: config.COLOR_INTENSITY },
        uMouseForce: { value: config.MOUSE_FORCE }
    },
    vertexShader: `
        varying vec2 vUv;
        
        void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform vec2 uResolution;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        uniform vec3 uColor4;
        uniform float uColorIntensity;
        uniform float uMouseForce;
        
        varying vec2 vUv;

        vec3 rgb2hsv(vec3 c) {
            vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
            vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
            vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
            float d = q.x - min(q.w, q.y);
            float e = 1.0e-10;
            return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
        }

        vec3 hsv2rgb(vec3 c) {
            vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
            vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
            return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }

        void main() {
            float time = uTime * 0.2;
            vec2 uv = vUv;
            
            // Mouse influence with resistance
            float mouseDistance = length(uv - uMouse);
            vec2 mouseInfluence = (uv - uMouse) * (1.0 - smoothstep(0.0, 0.5, mouseDistance));
            mouseInfluence *= uMouseForce;
            
            // Dynamic control points
            vec2 p1 = vec2(0.5 + sin(time * 0.3) * 0.3);
            vec2 p2 = vec2(0.5 + cos(time * 0.4) * 0.3);
            vec2 p3 = uMouse + mouseInfluence;
            vec2 p4 = vec2(0.5 + sin(time * 0.5) * 0.3);

            // Calculate distances
            float d1 = length(uv - p1);
            float d2 = length(uv - p2);
            float d3 = length(uv - p3);
            float d4 = length(uv - p4);

            // Create weights
            float w1 = 1.0 / (d1 * d1 + 0.05);
            float w2 = 1.0 / (d2 * d2 + 0.05);
            float w3 = 1.0 / (d3 * d3 + 0.05);
            float w4 = 1.0 / (d4 * d4 + 0.05);
            float wSum = w1 + w2 + w3 + w4;

            // Blend colors
            vec3 color = (
                uColor1 * w1 +
                uColor2 * w2 +
                uColor3 * w3 +
                uColor4 * w4
            ) / wSum;

            // Enhance color vibrancy
            vec3 hsv = rgb2hsv(color);
            hsv.y = min(hsv.y * uColorIntensity, 1.0);
            hsv.z = min(hsv.z * uColorIntensity, 1.0);
            color = hsv2rgb(hsv);

            gl_FragColor = vec4(color, 1.0);
        }
    `
});

// Create a full-screen quad
const geometry = new THREE.PlaneGeometry(2, 2);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Handle window resize
function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    material.uniforms.uResolution.value.set(width, height);
}

// Handle mouse movement
function onMouseMove(event) {
    material.uniforms.uMouse.value.set(
        event.clientX / window.innerWidth,
        1 - event.clientY / window.innerHeight
    );
}

// Add event listeners
window.addEventListener('resize', onWindowResize);
window.addEventListener('mousemove', onMouseMove);

// Initial setup
onWindowResize();

// Animation loop
function animate(time) {
    material.uniforms.uTime.value = time * 0.001;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// Start animation
animate(0);