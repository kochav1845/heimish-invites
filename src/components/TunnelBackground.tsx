import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ShaderMaterial, Vector2, Mesh } from 'three';

const fragmentShader = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  uniform float time;
  uniform vec2 resolution;

  void main() {
    vec2 position = (gl_FragCoord.xy - resolution * 0.5) / resolution.yy;
    float th = atan(position.y, position.x) / (2.0 * 3.1415926) + 0.5;
    float dd = length(position);
    float d = 0.5 / dd + time * 0.3;

    vec3 uv = vec3(th + d, th - d, th + sin(d) * 0.2);
    float a = 0.5 + cos(uv.x * 3.1415926 * 4.0) * 0.5;
    float b = 0.5 + cos(uv.y * 3.1415926 * 4.0) * 0.5;
    float c = 0.5 + cos(uv.z * 3.1415926 * 8.0) * 0.5;
    
    vec3 color = mix(vec3(0.3, 0.0, 0.8), vec3(0.05, 0.05, 0.2), pow(a, 0.3)) * 0.8;
    color += mix(vec3(0.2, 0.6, 1.0), vec3(0.05, 0.05, 0.2), pow(b, 0.2)) * 0.8;
    color += mix(vec3(0.5, 0.3, 1.0), vec3(0.1, 0.1, 0.3), pow(c, 0.2)) * 0.8;
    
    // Add pulsing effect
    float pulse = sin(time * 2.0) * 0.1 + 0.9;
    color *= pulse;
    
    // Add tunnel movement effect
    float tunnel = sin(time * 1.5 + dd * 10.0) * 0.1;
    color += tunnel;
    
    gl_FragColor = vec4(color * clamp(dd * 0.8, 0.0, 1.2), 1.0);
  }
`;

const vertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const TunnelBackground = () => {
  const materialRef = useRef<ShaderMaterial>(null);
  const meshRef = useRef<Mesh>(null);

  useFrame(({ clock, size, camera }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
      materialRef.current.uniforms.resolution.value = new Vector2(size.width, size.height);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -10]} scale={[50, 50, 1]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        uniforms={{
          time: { value: 0 },
          resolution: { value: new Vector2(window.innerWidth, window.innerHeight) }
        }}
        transparent={true}
      />
    </mesh>
  );
};

export default TunnelBackground;