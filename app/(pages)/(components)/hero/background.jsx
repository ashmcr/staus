'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import s from './background.module.css'

const config = {
  MOUSE_FORCE: 0.8,
  COLOR_INTENSITY: 2.0,
  MOUSE_LERP: 0.1,
  NUM_LAYERS: 2,
  LAYER_OPACITY: 0.5,
  COLORS: [
    new THREE.Color(0xffa6a6),
    new THREE.Color(0xffe5b9),
    new THREE.Color(0xa8e6cf),
    new THREE.Color(0xdcd3ff),
    new THREE.Color(0xffb5e8),
    new THREE.Color(0xb5deff),
    new THREE.Color(0xaff8db),
  ],
}

export function Background() {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const currentMouseRef = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    if (!canvasRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas: canvasRef.current,
    })

    const createMeshLayer = (layerIndex) => {
      const material = new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
          uTime: { value: 1 },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uResolution: { value: new THREE.Vector2() },
          uColor1: { value: config.COLORS[0] },
          uColor2: { value: config.COLORS[1] },
          uColor3: { value: config.COLORS[2] },
          uColor4: { value: config.COLORS[3] },
          uColor5: { value: config.COLORS[4] },
          uColor6: { value: config.COLORS[5] },
          uColor7: { value: config.COLORS[6] },
          uColorIntensity: { value: config.COLOR_INTENSITY },
          uMouseForce: { value: config.MOUSE_FORCE },
          uLayerOffset: { value: layerIndex },
          uOpacity: { value: config.LAYER_OPACITY },
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
          uniform vec3 uColor5;
          uniform vec3 uColor6;
          uniform vec3 uColor7;
          uniform float uColorIntensity;
          uniform float uMouseForce;
          uniform float uLayerOffset;
          uniform float uOpacity;
          
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

          mat2 rotate2d(float angle) {
            return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
          }

          void main() {
            float time = uTime * 0.1 + uLayerOffset * 2.0;
            vec2 uv = vUv;
            
            float mouseDistance = length(uv - uMouse);
            vec2 mouseInfluence = (uv - uMouse) * (1.0 - smoothstep(0.0, 0.8, mouseDistance));
            mouseInfluence *= uMouseForce * (1.0 + sin(time) * 0.2);
            
            vec2 rotatedUV = (uv - 0.5) * rotate2d(time * 0.1 * (uLayerOffset + 1.0)) + 0.5;
            
            vec2 p1 = vec2(0.3 + sin(time * 0.2) * 0.4) + mouseInfluence * 0.8;
            vec2 p2 = vec2(0.7 + cos(time * 0.3) * 0.4) + mouseInfluence * 0.6;
            vec2 p3 = vec2(0.4 + sin(time * 0.4) * 0.3) + mouseInfluence * 1.2;
            vec2 p4 = vec2(0.6 + cos(time * 0.25) * 0.35) + mouseInfluence * 0.9;
            vec2 p5 = vec2(0.5 + sin(time * 0.35) * 0.45) + mouseInfluence * 0.7;
            vec2 p6 = vec2(0.2 + cos(time * 0.15) * 0.3) + mouseInfluence * 1.1;
            vec2 p7 = vec2(0.8 + sin(time * 0.45) * 0.25) + mouseInfluence * 0.85;

            // Apply rotation to points
            p1 = (p1 - 0.5) * rotate2d(time * 0.2) + 0.5;
            p2 = (p2 - 0.5) * rotate2d(-time * 0.15) + 0.5;
            p3 = (p3 - 0.5) * rotate2d(time * 0.25) + 0.5;
            p4 = (p4 - 0.5) * rotate2d(-time * 0.3) + 0.5;
            p5 = (p5 - 0.5) * rotate2d(time * 0.18) + 0.5;
            p6 = (p6 - 0.5) * rotate2d(-time * 0.22) + 0.5;
            p7 = (p7 - 0.5) * rotate2d(time * 0.28) + 0.5;

            float d1 = length(rotatedUV - p1);
            float d2 = length(rotatedUV - p2);
            float d3 = length(rotatedUV - p3);
            float d4 = length(rotatedUV - p4);
            float d5 = length(rotatedUV - p5);
            float d6 = length(rotatedUV - p6);
            float d7 = length(rotatedUV - p7);

            float scale = 1.5 + sin(time) * 0.2;
            float w1 = 1.0 / pow(d1 * d1 * scale + 0.05, 1.5);
            float w2 = 1.0 / pow(d2 * d2 * scale + 0.05, 1.5);
            float w3 = 1.0 / pow(d3 * d3 * scale + 0.05, 1.5);
            float w4 = 1.0 / pow(d4 * d4 * scale + 0.05, 1.5);
            float w5 = 1.0 / pow(d5 * d5 * scale + 0.05, 1.5);
            float w6 = 1.0 / pow(d6 * d6 * scale + 0.05, 1.5);
            float w7 = 1.0 / pow(d7 * d7 * scale + 0.05, 1.5);
            float wSum = w1 + w2 + w3 + w4 + w5 + w6 + w7;

            vec3 color = (
              uColor1 * w1 +
              uColor2 * w2 +
              uColor3 * w3 +
              uColor4 * w4 +
              uColor5 * w5 +
              uColor6 * w6 +
              uColor7 * w7
            ) / wSum;

            vec3 hsv = rgb2hsv(color);
            hsv.y *= uColorIntensity * (0.8 + sin(time * 0.5) * 0.1);
            hsv.z = mix(0.8, 1.0, hsv.z * uColorIntensity);
            color = hsv2rgb(hsv);

            float vignette = 1.0 - smoothstep(0.5, 1.5, length(uv - 0.5) * 2.0);
            color = mix(color * 0.95, color, vignette);

            gl_FragColor = vec4(color, uOpacity);
          }
        `,
      })

      const geometry = new THREE.PlaneGeometry(2, 2)
      const mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)
      return { mesh, material, geometry }
    }

    const layers = Array.from({ length: config.NUM_LAYERS }, (_, i) =>
      createMeshLayer(i)
    )

    function onWindowResize() {
      const width = window.innerWidth
      const height = window.innerHeight
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      layers.forEach((layer) => {
        layer.material.uniforms.uResolution.value.set(width, height)
      })
    }

    function onMouseMove(event) {
      mouseRef.current = {
        x: event.clientX / window.innerWidth,
        y: 1 - event.clientY / window.innerHeight,
      }
    }

    window.addEventListener('resize', onWindowResize)
    window.addEventListener('mousemove', onMouseMove)
    onWindowResize()

    let animationFrameId
    function animate(time) {
      // Smooth mouse movement
      currentMouseRef.current.x +=
        (mouseRef.current.x - currentMouseRef.current.x) * config.MOUSE_LERP
      currentMouseRef.current.y +=
        (mouseRef.current.y - currentMouseRef.current.y) * config.MOUSE_LERP

      layers.forEach((layer) => {
        layer.material.uniforms.uTime.value = time * 0.001
        layer.material.uniforms.uMouse.value.set(
          currentMouseRef.current.x,
          currentMouseRef.current.y
        )
      })

      renderer.render(scene, camera)
      animationFrameId = requestAnimationFrame(animate)
    }

    animate(0)

    return () => {
      window.removeEventListener('resize', onWindowResize)
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(animationFrameId)
      layers.forEach((layer) => {
        layer.geometry.dispose()
        layer.material.dispose()
      })
      renderer.dispose()
    }
  }, [])

  return <canvas ref={canvasRef} className={s.canvas} />
}
