// Perspective rendering adapted from the user-supplied Mono demo HTML.
function initializeStarfield() {
  const canvas = document.querySelector<HTMLCanvasElement>("[data-starfield]")!;
  const context = canvas.getContext("2d")!;
  if (!context) return;

  const toggle = document.querySelector<HTMLButtonElement>(
    "[data-motion-toggle]",
  )!;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const mousePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const stars = new Float32Array(1600 * 3);
  for (let index = 0; index < stars.length; index++) {
    stars[index] = (Math.random() - 0.5) * 10;
  }

  let width = 0;
  let height = 0;
  let rotation = 0;
  let yaw = 0;
  let pitch = 0;
  let targetYaw = 0;
  let targetPitch = 0;
  let pausedByUser = false;
  let frame = 0;
  let previousTime: number | null = null;

  function draw() {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#ffffff";
    context.globalAlpha = 0.35;
    const focalLength = height / (2 * Math.tan((75 * Math.PI) / 360));
    const spinCos = Math.cos(rotation);
    const spinSin = Math.sin(rotation);
    const tiltCos = Math.cos(rotation * 0.5);
    const tiltSin = Math.sin(rotation * 0.5);
    const yawCos = Math.cos(yaw);
    const yawSin = Math.sin(yaw);
    const pitchCos = Math.cos(pitch);
    const pitchSin = Math.sin(pitch);

    for (let index = 0; index < stars.length; index += 3) {
      const x = stars[index];
      const y = stars[index + 1];
      const z = stars[index + 2];
      // Rotate the point cloud, then apply the eased camera viewpoint.
      const rotatedX = x * spinCos + z * spinSin;
      const rotatedZ = -x * spinSin + z * spinCos;
      const rotatedY = y * tiltCos - rotatedZ * tiltSin;
      const cameraZ = y * tiltSin + rotatedZ * tiltCos - 5;
      const viewX = rotatedX * yawCos + cameraZ * yawSin;
      const viewZ = -rotatedX * yawSin + cameraZ * yawCos;
      const viewY = rotatedY * pitchCos - viewZ * pitchSin;
      const depth = -(rotatedY * pitchSin + viewZ * pitchCos);
      if (depth < 0.4) continue;

      const screenX = width / 2 + (viewX * focalLength) / depth;
      const screenY = height / 2 - (viewY * focalLength) / depth;
      if (
        screenX < -2 ||
        screenX > width + 2 ||
        screenY < -2 ||
        screenY > height + 2
      )
        continue;
      // Match the reference's perspective sizing at different viewport heights.
      const radius = Math.min(1.5, Math.max(0.3, (height * 0.00375) / depth));
      context.beginPath();
      context.arc(screenX, screenY, radius, 0, Math.PI * 2);
      context.fill();
    }
  }

  function resize() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = document.documentElement.clientWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    draw();
  }

  function animate(time: number) {
    const delta =
      previousTime === null ? 0 : Math.min((time - previousTime) / 1000, 0.05);
    previousTime = time;
    const easing = 1 - Math.exp(-delta * 10);
    yaw += (targetYaw - yaw) * easing;
    pitch += (targetPitch - pitch) * easing;
    rotation += delta * 0.022;
    draw();
    frame = requestAnimationFrame(animate);
  }

  function resetPointer() {
    targetYaw = 0;
    targetPitch = 0;
  }

  function movePointer(event: PointerEvent) {
    if (event.pointerType !== "mouse") return;
    targetYaw = (0.5 - event.clientX / width) * 0.2;
    targetPitch = (event.clientY / height - 0.5) * 0.2;
  }

  function updateMotion() {
    cancelAnimationFrame(frame);
    frame = 0;
    // Resume from the last rendered position instead of counting paused time.
    previousTime = null;
    document.removeEventListener("pointermove", movePointer);
    resetPointer();
    toggle.hidden = reducedMotion.matches;
    toggle.textContent = pausedByUser ? "Resume motion" : "Pause motion";
    toggle.setAttribute(
      "aria-label",
      pausedByUser ? "Resume background motion" : "Pause background motion",
    );
    if (reducedMotion.matches) {
      yaw = 0;
      pitch = 0;
    }
    if (!document.hidden) draw();
    if (pausedByUser || reducedMotion.matches || document.hidden) return;
    if (mousePointer.matches) {
      document.addEventListener("pointermove", movePointer, { passive: true });
    }
    frame = requestAnimationFrame(animate);
  }

  toggle.addEventListener("click", () => {
    pausedByUser = !pausedByUser;
    updateMotion();
  });
  reducedMotion.addEventListener("change", updateMotion);
  mousePointer.addEventListener("change", updateMotion);
  document.addEventListener("visibilitychange", updateMotion);
  document.addEventListener("pointerleave", resetPointer);
  window.addEventListener("blur", resetPointer);
  window.addEventListener("resize", resize, { passive: true });
  resize();
  document.body.classList.add("canvas-ready");
  updateMotion();
}

initializeStarfield();
