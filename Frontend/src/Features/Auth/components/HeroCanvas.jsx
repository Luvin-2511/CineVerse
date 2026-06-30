import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";

function StarField() {
  const ref = useRef();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMouseMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 0.4;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 0.4;
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  const positions = new Float32Array(2500 * 3);
  for (let i = 0; i < 2500; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
  }

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = t * 0.018;
    ref.current.rotation.x = mouse.current.y * 0.3;
    ref.current.rotation.z = mouse.current.x * 0.2;
    state.camera.position.x +=
      (mouse.current.x - state.camera.position.x) * 0.04;
    state.camera.position.y +=
      (-mouse.current.y - state.camera.position.y) * 0.04;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#e8ff00"
        size={0.012}
        sizeAttenuation
        depthWrite={false}
        opacity={0.55}
      />
    </Points>
  );
}

function Rings() {
  const ring1 = useRef();
  const ring2 = useRef();

  useFrame((_, delta) => {
    ring1.current.rotation.z += delta * 0.06;
    ring2.current.rotation.z -= delta * 0.04;
  });

  return (
    <>
      <mesh ref={ring1} rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[2.2, 0.004, 16, 120]} />
        <meshBasicMaterial color="#e8ff00" transparent opacity={0.08} />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[1.5, 0.002, 16, 120]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.04} />
      </mesh>
    </>
  );
}

const HeroCanvas = () => {
  return (
    <Canvas
      className="home-page__hero-canvas"
      camera={{ position: [0, 0, 4], fov: 60 }}
      style={{ position: "absolute", inset: 0 }}
    >
      <StarField />
      <Rings />
    </Canvas>
  );
};

export default HeroCanvas;
