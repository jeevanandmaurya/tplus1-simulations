// The 2D wave equation on a grid. Two coherent sources (or one source
// behind a double slit) build an interference pattern you can poke.

// Graphics quality chosen in tplus1 settings ("low" | "medium" | "high").
const QUALITY = (window.tplus1 && window.tplus1.quality) || "high";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const $ = (id) => document.getElementById(id);
function bind(id, format = (v) => v) {
  const input = $(id);
  const out = document.querySelector(`output[for="${id}"]`);
  const sync = () => out && (out.textContent = format(+input.value));
  input.addEventListener("input", sync);
  sync();
  return () => +input.value;
}
const freq = bind("freq", (v) => v.toFixed(3));
const sep = bind("sep", (v) => v.toFixed(2));
const damp = bind("damp", (v) => v.toFixed(4));

let mode = "sources";
for (const b of $("modes").children) {
  b.addEventListener("click", () => {
    mode = b.dataset.mode;
    for (const o of $("modes").children) o.setAttribute("aria-pressed", String(o === b));
    reset();
  });
}

let W, H, nx, ny, cur, prev, wall, image, buffer, bctx;
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = canvas.clientWidth;
  H = canvas.clientHeight;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cellPx = { low: 5, medium: 4, high: 3 }[QUALITY];
  nx = Math.floor(W / cellPx);
  ny = Math.floor(H / cellPx);
  buffer = document.createElement("canvas");
  buffer.width = nx;
  buffer.height = ny;
  bctx = buffer.getContext("2d");
  image = bctx.createImageData(nx, ny);
  reset();
}
function reset() {
  cur = new Float32Array(nx * ny);
  prev = new Float32Array(nx * ny);
  wall = new Uint8Array(nx * ny);
  if (mode === "slit") {
    const x = Math.floor(nx * 0.35);
    const gap = Math.max(2, Math.floor(ny * 0.025));
    const half = Math.floor((ny * sep()) / 2);
    for (let y = 0; y < ny; y++) {
      const c = ny / 2;
      const open = Math.abs(y - (c - half)) < gap || Math.abs(y - (c + half)) < gap;
      if (!open) for (let t = 0; t < 3; t++) wall[x + t + y * nx] = 1;
    }
  }
}
window.addEventListener("resize", resize);
resize();
$("sep").addEventListener("change", () => mode === "slit" && reset());

function drop(x, y, amp = 3, r = 3) {
  for (let j = -r * 2; j <= r * 2; j++) for (let i = -r * 2; i <= r * 2; i++) {
    const X = x + i, Y = y + j;
    if (X < 1 || Y < 1 || X >= nx - 1 || Y >= ny - 1) continue;
    cur[X + Y * nx] += amp * Math.exp(-(i * i + j * j) / (r * r));
  }
}
canvas.addEventListener("pointerdown", (e) => {
  drop(Math.floor((e.clientX / W) * nx), Math.floor((e.clientY / H) * ny), 4, 3);
  $("hint").classList.add("hide");
});
setTimeout(() => $("hint").classList.add("hide"), 6000);

let t = 0;
function step() {
  t++;
  const s = Math.sin(t * freq() * Math.PI * 2 * 0.25) * 1.2;
  if (mode === "sources") {
    const half = Math.floor((ny * sep()) / 2);
    cur[Math.floor(nx * 0.2) + Math.floor(ny / 2 - half) * nx] = s * 3;
    cur[Math.floor(nx * 0.2) + Math.floor(ny / 2 + half) * nx] = s * 3;
  } else if (mode === "slit") {
    // A plane wave arriving from the left edge.
    for (let y = 1; y < ny - 1; y++) cur[2 + y * nx] = s;
  }
  const c2 = 0.24, d = damp();
  for (let y = 1; y < ny - 1; y++) {
    for (let x = 1; x < nx - 1; x++) {
      const i = x + y * nx;
      if (wall[i]) { prev[i] = 0; continue; }
      const lap = cur[i - 1] + cur[i + 1] + cur[i - nx] + cur[i + nx] - 4 * cur[i];
      prev[i] = (2 * cur[i] - prev[i] + c2 * lap) * d;
    }
  }
  // Soft absorbing border so waves leave instead of bouncing back.
  const edge = 12;
  for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
    const k = Math.min(x, y, nx - 1 - x, ny - 1 - y);
    if (k < edge) prev[x + y * nx] *= 0.9 + 0.1 * (k / edge);
  }
  [cur, prev] = [prev, cur];
}

function frame() {
  for (let i = 0; i < 2; i++) step();
  const data = image.data;
  for (let i = 0; i < cur.length; i++) {
    const o = i * 4;
    if (wall[i]) { data[o] = 210; data[o + 1] = 214; data[o + 2] = 224; data[o + 3] = 255; continue; }
    const v = Math.tanh(cur[i] * 0.8);
    // Deep navy troughs, teal water, bright cyan-white crests.
    if (v > 0) {
      data[o] = 8 + v * 190; data[o + 1] = 42 + v * 205; data[o + 2] = 74 + v * 181;
    } else {
      data[o] = 8 + v * 6; data[o + 1] = 42 + v * 32; data[o + 2] = 74 + v * 46;
    }
    data[o + 3] = 255;
  }
  bctx.putImageData(image, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(buffer, 0, 0, W, H);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
