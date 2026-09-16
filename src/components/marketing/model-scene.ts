import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  loadForMesh,
  groupForMesh,
  type MuscleGroup,
  type TrainingLoad,
  type DemoProfile,
} from "./demo-data";

type ModelState = {
  selected: MuscleGroup | null;
  loads: TrainingLoad;
  experience: DemoProfile;
  resetKey: number;
};
type Callbacks = {
  select: (group: MuscleGroup) => void;
  interact: () => void;
  ready: () => void;
  fail: () => void;
};

export function createModelScene(host: HTMLElement, callbacks: Callbacks) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl2", {
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  if (!context) throw new Error("WebGL unavailable");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    context,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 20);
  camera.position.set(0, 0, 4.1);
  scene.add(new THREE.HemisphereLight("#f5f4ee", "#242b28", 1.1));
  const key = new THREE.DirectionalLight("#fffaf0", 3.4);
  key.position.set(3, 3, 2.5);
  scene.add(key);
  const fill = new THREE.DirectionalLight("#c8d6e5", 0.65);
  fill.position.set(-3, 1.5, 2);
  scene.add(fill);
  const rim = new THREE.DirectionalLight("#e2edff", 3);
  rim.position.set(-2, 1.5, -3);
  scene.add(rim);
  const pivot = new THREE.Group();
  scene.add(pivot);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const meshes: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>[] =
    [];
  const targets = new Map<THREE.Mesh, THREE.Color>();
  const abort = new AbortController();
  const loadTimeout = window.setTimeout(() => {
    if (!loaded && !disposed) {
      abort.abort();
      callbacks.fail();
    }
  }, 15000);
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let state: ModelState = { selected: null, loads: {}, experience: "intermediate", resetKey: 0 };
  let hovered: MuscleGroup | null = null;
  let targetYaw = 0;
  let frame = 0;
  let previousTime = 0;
  let visible = true;
  let disposed = false;
  let loaded = false;
  let gesture: {
    id: number;
    startX: number;
    startY: number;
    lastX: number;
    moved: boolean;
  } | null = null;

  function draw(time: number) {
    frame = 0;
    if (disposed || !visible || document.hidden || !loaded) return;
    const delta = Math.min((time - previousTime) / 1000 || 1 / 60, 0.05);
    previousTime = time;
    const blend = motion.matches ? 1 : 1 - Math.exp(-12 * delta);
    pivot.rotation.y += (targetYaw - pivot.rotation.y) * blend;
    let changing = Math.abs(targetYaw - pivot.rotation.y) > 0.0001;
    for (const mesh of meshes) {
      const target = targets.get(mesh)!;
      mesh.material.color.lerp(target, blend);
      if (
        Math.abs(mesh.material.color.r - target.r) +
          Math.abs(mesh.material.color.g - target.g) +
          Math.abs(mesh.material.color.b - target.b) >
        0.0005
      )
        changing = true;
    }
    renderer.render(scene, camera);
    if (changing) invalidate();
  }
  function invalidate() {
    if (!frame && !disposed && visible && !document.hidden)
      frame = requestAnimationFrame(draw);
  }
  function updateColors() {
    for (const mesh of meshes) {
      const group = groupForMesh(mesh.name);
      const load = loadForMesh(mesh.name, state.loads, { experience: state.experience });
      const color = new THREE.Color("#b8b5ac");
      if (load && load.value > 0) color.lerp(new THREE.Color(load.hex), load.opacity);
      if (group && group === state.selected && !load?.value)
        color.set("#e4ded0");
      if (group && group === hovered)
        color.lerp(new THREE.Color("#ffffff"), 0.16);
      targets.set(mesh, color);
    }
    invalidate();
  }
  function resize() {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.position.z = Math.max(4.1, 2.15 / camera.aspect);
    camera.updateProjectionMatrix();
    invalidate();
  }
  function pick(event: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(meshes, false)[0];
    return hit ? groupForMesh(hit.object.name) : null;
  }
  function down(event: PointerEvent) {
    if (!event.isPrimary || event.button !== 0) return;
    gesture = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      moved: false,
    };
    canvas.setPointerCapture(event.pointerId);
  }
  function move(event: PointerEvent) {
    if (gesture && gesture.id === event.pointerId) {
      const distance = Math.hypot(
        event.clientX - gesture.startX,
        event.clientY - gesture.startY,
      );
      if (distance > 6) {
        gesture.moved = true;
        callbacks.interact();
      }
      if (gesture.moved) {
        targetYaw += (event.clientX - gesture.lastX) * 0.009;
        invalidate();
      }
      gesture.lastX = event.clientX;
    } else if (event.pointerType === "mouse") {
      const next = pick(event);
      canvas.style.cursor = next ? "pointer" : "grab";
      if (next !== hovered) {
        hovered = next;
        updateColors();
      }
    }
  }
  function up(event: PointerEvent) {
    if (!gesture || gesture.id !== event.pointerId) return;
    if (!gesture.moved) {
      const group = pick(event);
      if (group) {
        callbacks.select(group);
        callbacks.interact();
      }
    }
    gesture = null;
    if (canvas.hasPointerCapture(event.pointerId))
      canvas.releasePointerCapture(event.pointerId);
  }
  function cancel() {
    gesture = null;
  }
  function leave() {
    hovered = null;
    updateColors();
  }
  function visibility() {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else invalidate();
  }
  function contextLost(event: Event) {
    event.preventDefault();
    callbacks.fail();
  }
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", cancel);
  canvas.addEventListener("lostpointercapture", cancel);
  canvas.addEventListener("pointerleave", leave);
  canvas.addEventListener("webglcontextlost", contextLost);
  document.addEventListener("visibilitychange", visibility);
  motion.addEventListener("change", invalidate);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else invalidate();
  });
  observer.observe(host);

  function disposeModel(model: THREE.Object3D) {
    model.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        materials.forEach((material) => material.dispose());
      }
    });
  }
  // Abort network work on unmount; dispose a late parse result too (React Strict Mode).
  void fetch("/marketing/male-body.glb", { signal: abort.signal })
    .then((response) => {
      if (!response.ok) throw new Error("Model unavailable");
      return response.arrayBuffer();
    })
    .then((buffer) => new GLTFLoader().parseAsync(buffer, "/marketing/"))
    .then((gltf) => {
      if (disposed) {
        disposeModel(gltf.scene);
        return;
      }
      const originals = new Set<THREE.Material>();
      gltf.scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        (Array.isArray(object.material)
          ? object.material
          : [object.material]
        ).forEach((material) => originals.add(material));
        object.material = new THREE.MeshStandardMaterial({
          color: "#b8b5ac",
          roughness: 0.46,
          metalness: 0.12,
          side: THREE.DoubleSide,
        });
        meshes.push(
          object as THREE.Mesh<
            THREE.BufferGeometry,
            THREE.MeshStandardMaterial
          >,
        );
      });
      originals.forEach((material) => material.dispose());
      gltf.scene.position.y = -0.90368;
      pivot.add(gltf.scene);
      loaded = true;
      window.clearTimeout(loadTimeout);
      updateColors();
      resize();
      // Draw the complete model before revealing the canvas.
      renderer.render(scene, camera);
      callbacks.ready();
    })
    .catch((error) => {
      if (!disposed && error.name !== "AbortError") callbacks.fail();
    });

  return {
    update(next: ModelState) {
      if (next.resetKey !== state.resetKey) targetYaw = 0;
      if (next.selected !== state.selected && next.selected) {
        const back = ["Back", "Triceps", "Hamstrings", "Glutes"].includes(
          next.selected,
        );
        const target = back ? Math.PI : 0;
        targetYaw += Math.atan2(
          Math.sin(target - targetYaw),
          Math.cos(target - targetYaw),
        );
      }
      state = next;
      updateColors();
    },
    rotate(amount: number) {
      targetYaw += amount;
      callbacks.interact();
      invalidate();
    },
    dispose() {
      disposed = true;
      abort.abort();
      window.clearTimeout(loadTimeout);
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      motion.removeEventListener("change", invalidate);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", cancel);
      canvas.removeEventListener("lostpointercapture", cancel);
      canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("webglcontextlost", contextLost);
      disposeModel(pivot);
      renderer.dispose();
      canvas.remove();
    },
  };
}
