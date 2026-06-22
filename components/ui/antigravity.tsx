"use client";

import {
  Canvas,
  useFrame,
  useThree,
} from "@react-three/fiber";
import {
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import * as THREE from "three";

import { subscribeAnimationFrame } from "@/lib/animation-clock";
import styles from "./antigravity.module.css";

type ParticleShape = "capsule" | "sphere" | "box" | "tetrahedron";

export type AntigravityProps = {
  count?: number;
  magnetRadius?: number;
  ringRadius?: number;
  waveSpeed?: number;
  waveAmplitude?: number;
  particleSize?: number;
  lerpSpeed?: number;
  color?: string;
  autoAnimate?: boolean;
  particleVariance?: number;
  rotationSpeed?: number;
  depthFactor?: number;
  pulseSpeed?: number;
  particleShape?: ParticleShape;
  fieldStrength?: number;
  className?: string;
  style?: CSSProperties;
};

type Particle = {
  t: number;
  speed: number;
  mx: number;
  my: number;
  mz: number;
  cx: number;
  cy: number;
  cz: number;
  vx: number;
  vy: number;
  vz: number;
  randomRadiusOffset: number;
};

const FRAME_AHEAD_MS = 2000;

const hashFloat = (value: number): number => {
  const x = Math.sin(value) * 43758.5453123;
  return x - Math.floor(x);
};

const createParticles = (
  count: number,
  width: number,
  height: number,
): Particle[] => {
  const temp: Particle[] = [];
  const safeWidth = width || 100;
  const safeHeight = height || 100;
  const baseSeed = count * 0.913 + safeWidth * 0.137 + safeHeight * 0.173;

  for (let i = 0; i < count; i += 1) {
    const seed = baseSeed + i * 1.127;
    const t = hashFloat(seed) * 100;
    const speed = 0.01 + hashFloat(seed + 1.31) / 200;
    const x = (hashFloat(seed + 2.17) - 0.5) * safeWidth;
    const y = (hashFloat(seed + 3.29) - 0.5) * safeHeight;
    const z = (hashFloat(seed + 4.41) - 0.5) * 20;

    temp.push({
      t,
      speed,
      mx: x,
      my: y,
      mz: z,
      cx: x,
      cy: y,
      cz: z,
      vx: 0,
      vy: 0,
      vz: 0,
      randomRadiusOffset: (hashFloat(seed + 5.53) - 0.5) * 2,
    });
  }

  return temp;
};

function FrameDriver(): null {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    const unsubscribe = subscribeAnimationFrame(() => {
      invalidate();
    });

    return unsubscribe;
  }, [invalidate]);

  return null;
}

function AntigravityScene({
  count = 300,
  magnetRadius = 10,
  ringRadius = 10,
  waveSpeed = 0.4,
  waveAmplitude = 1,
  particleSize = 2,
  lerpSpeed = 0.1,
  color = "#FF9FFC",
  autoAnimate = false,
  particleVariance = 1,
  rotationSpeed = 0,
  depthFactor = 1,
  pulseSpeed = 3,
  particleShape = "capsule",
  fieldStrength = 10,
}: AntigravityProps): ReactNode {
  const meshRef = useRef<THREE.InstancedMesh | null>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const { viewport } = useThree();

  const lastMousePos = useRef({
    x:
      typeof window !== "undefined"
        ? window.innerWidth / 2
        : 0,
    y:
      typeof window !== "undefined"
        ? window.innerHeight / 2
        : 0,
  });
  const lastMouseMoveTime = useRef(0);
  const virtualMouse = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>(
    createParticles(count, viewport.width, viewport.height),
  );

  useEffect(() => {
    particlesRef.current = createParticles(count, viewport.width, viewport.height);
  }, [count, viewport.height, viewport.width]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    mesh.frustumCulled = false;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      lastMouseMoveTime.current = performance.now();
      lastMousePos.current = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    const handlePointerLeave = () => {
      lastMouseMoveTime.current = performance.now();
    };

    lastMousePos.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("pointerleave", handlePointerLeave, {
      passive: true,
    });
    window.addEventListener("blur", handlePointerLeave, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("blur", handlePointerLeave);
    };
  }, []);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const particles = particlesRef.current;

    const { viewport } = state;
    const pointerX = lastMousePos.current.x / window.innerWidth;
    const pointerY = lastMousePos.current.y / window.innerHeight;
    const mouseX = (pointerX - 0.5) * 2;
    const mouseY = -(pointerY - 0.5) * 2;

    let destX = (mouseX * viewport.width) / 2;
    let destY = (mouseY * viewport.height) / 2;

    if (
      autoAnimate &&
      performance.now() - lastMouseMoveTime.current > FRAME_AHEAD_MS
    ) {
      const time = state.clock.getElapsedTime();
      destX = Math.sin(time * 0.5) * (viewport.width / 4);
      destY = Math.cos(time) * (viewport.height / 4);
    }

    const smoothFactor = 0.05;
    virtualMouse.current.x += (destX - virtualMouse.current.x) * smoothFactor;
    virtualMouse.current.y += (destY - virtualMouse.current.y) * smoothFactor;

    const targetX = virtualMouse.current.x;
    const targetY = virtualMouse.current.y;
    const globalRotation = state.clock.getElapsedTime() * rotationSpeed;

    for (let i = 0; i < particles.length; i += 1) {
      const particle = particles[i]!;
      const t = (particle.t += particle.speed / 2);
      const { mx, my, mz, cz, randomRadiusOffset } = particle;

      const projectionFactor = 1 - cz / 50;
      const projectedTargetX = targetX * projectionFactor;
      const projectedTargetY = targetY * projectionFactor;

      const dx = mx - projectedTargetX;
      const dy = my - projectedTargetY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let targetPos = {
        x: mx,
        y: my,
        z: mz * depthFactor,
      };

      if (dist < magnetRadius) {
        const angle = Math.atan2(dy, dx) + globalRotation;

        const wave = Math.sin(t * waveSpeed + angle) * (0.5 * waveAmplitude);
        const deviation = randomRadiusOffset * (5 / (fieldStrength + 0.1));
        const currentRingRadius = ringRadius + wave + deviation;

        targetPos = {
          x: projectedTargetX + currentRingRadius * Math.cos(angle),
          y: projectedTargetY + currentRingRadius * Math.sin(angle),
          z: mz * depthFactor + Math.sin(t) * waveAmplitude * depthFactor,
        };
      }

      particle.cx += (targetPos.x - particle.cx) * lerpSpeed;
      particle.cy += (targetPos.y - particle.cy) * lerpSpeed;
      particle.cz += (targetPos.z - particle.cz) * lerpSpeed;

      dummy.position.set(particle.cx, particle.cy, particle.cz);
      dummy.lookAt(projectedTargetX, projectedTargetY, particle.cz);
      dummy.rotateX(Math.PI / 2);

      const currentDistToMouse = Math.sqrt(
        (particle.cx - projectedTargetX) ** 2 +
          (particle.cy - projectedTargetY) ** 2,
      );
      const distFromRing = Math.abs(currentDistToMouse - ringRadius);

      let scaleFactor = 1 - distFromRing / 10;
      scaleFactor = Math.max(0, Math.min(1, scaleFactor));

      const finalScale =
        scaleFactor *
        (0.8 + Math.sin(t * pulseSpeed) * 0.2 * particleVariance) *
        particleSize;
      dummy.scale.set(finalScale, finalScale, finalScale);
      dummy.updateMatrix();

      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {particleShape === "capsule" && (
        <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
      )}
      {particleShape === "sphere" && <sphereGeometry args={[0.2, 16, 16]} />}
      {particleShape === "box" && <boxGeometry args={[0.3, 0.3, 0.3]} />}
      {particleShape === "tetrahedron" && (
        <tetrahedronGeometry args={[0.3]} />
      )}
      <meshBasicMaterial color={color} />
    </instancedMesh>
  );
}

const Antigravity = (props: AntigravityProps): ReactNode => {
  return (
    <div className={styles.container}>
      <Canvas
        frameloop="demand"
        camera={{ position: [0, 0, 50], fov: 35 }}
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: false,
          depth: false,
          stencil: false,
          powerPreference: "low-power",
        }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <FrameDriver />
        <AntigravityScene {...props} />
      </Canvas>
    </div>
  );
};

export default Antigravity;
