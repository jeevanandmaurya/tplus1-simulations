if (!state.entities) state.entities = [];

const g = config.globals;

// Build ramps as trimesh on first frame
if (state.t === 0) {

  // --- Ramp 1: slopes DOWN to the RIGHT ---
  // Left-high end at x=-12, y=19  |  Right-low end at x=12, y=11  |  depth z=±8
  // Top face (y+1 above surface)
  const r1vTop = [
    -12, 20, -8,
    -12, 20,  8,
     12, 12,  8,
     12, 12, -8
  ];
  // Bottom face (y-0 — slightly below top, gives visual slab)
  const r1vBot = [
    -12, 18, -8,
    -12, 18,  8,
     12, 10,  8,
     12, 10, -8
  ];
  const r1verts = new Float32Array([
    ...r1vTop,   // 0-3
    ...r1vBot    // 4-7
  ]);
  const r1idx = new Uint32Array([
    // top
    0,1,2, 0,2,3,
    // bottom (flipped)
    4,6,5, 4,7,6,
    // front (z=+8)
    1,5,6, 1,6,2,
    // back (z=-8)
    0,3,7, 0,7,4,
    // left (x=-12)
    0,4,5, 0,5,1,
    // right (x=+12)
    2,6,7, 2,7,3
  ]);
  state.entities.push({
    id: 'ramp1',
    type: 'terrain',
    position: [0, 0, 0],
    rotation: [0, 0, 0, 1],
    properties: { bodyType: 'fixed', mass: 0, restitution: 0.2, friction: 0.5, vertices: r1verts, indices: r1idx },
    visual: { shape: 'trimesh', color: '#2a6faf', size: 1 }
  });

  // --- Ramp 2: slopes DOWN to the LEFT ---
  // Right-high end at x=12, y=8  |  Left-low end at x=-12, y=0  |  depth z=±8
  const r2vTop = [
    -12,  1, -8,
    -12,  1,  8,
     12,  9,  8,
     12,  9, -8
  ];
  const r2vBot = [
    -12, -1, -8,
    -12, -1,  8,
     12,  7,  8,
     12,  7, -8
  ];
  const r2verts = new Float32Array([
    ...r2vTop,
    ...r2vBot
  ]);
  const r2idx = new Uint32Array([
    0,1,2, 0,2,3,
    4,6,5, 4,7,6,
    1,5,6, 1,6,2,
    0,3,7, 0,7,4,
    0,4,5, 0,5,1,
    2,6,7, 2,7,3
  ]);
  state.entities.push({
    id: 'ramp2',
    type: 'terrain',
    position: [0, 0, 0],
    rotation: [0, 0, 0, 1],
    properties: { bodyType: 'fixed', mass: 0, restitution: 0.2, friction: 0.5, vertices: r2verts, indices: r2idx },
    visual: { shape: 'trimesh', color: '#2a6faf', size: 1 }
  });
}

// Spawn balls
const palette = ['#ff4466','#ff7733','#ffcc00','#44ff88','#33ccff','#aa66ff','#ff44cc'];
const balls = state.entities.filter(e => e.id.startsWith('ball_'));

if (state.t % Math.max(1, Math.round(g.spawn_rate)) === 0 && balls.length < g.max_balls) {
  const color = palette[balls.length % palette.length];
  state.entities.push({
    id: 'ball_' + state.t,
    type: 'rigid_body',
    position: [-14 + (Math.random() - 0.5) * 2, 28, (Math.random() - 0.5) * 10],
    velocity: [3, 0, 0],
    rotation: [0, 0, 0, 1],
    properties: {
      bodyType: 'dynamic', mass: 1,
      restitution: g.restitution, friction: g.friction,
      linearDamping: 0.02, angularDamping: 0.05
    },
    visual: { shape: 'sphere', color: color, size: g.ball_size, opacity: 1.0 }
  });
}

// Cull escaped balls
state.entities = state.entities.filter(e =>
  !e.id.startsWith('ball_') || e.position[1] > -10
);