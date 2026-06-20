if (!state.globals.nextLaunch) state.globals.nextLaunch = 0;
if (!state.globals.shells) state.globals.shells = {};

const COLORS = ['#f43f5e','#fb923c','#facc15','#4ade80','#22d3ee','#818cf8','#e879f9','#ffffff'];

// Launch a new shell periodically
if (state.t >= state.globals.nextLaunch) {
  const shellId = 'shell_' + state.t;
  const x = (Math.random() - 0.5) * 20;
  const z = (Math.random() - 0.5) * 20;
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  state.entities.push({
    id: shellId,
    type: 'rigid_body',
    position: [x, 0, z],
    velocity: [
      (Math.random() - 0.5) * 3,
      28 + Math.random() * 8,
      (Math.random() - 0.5) * 3
    ],
    rotation: [0, 0, 0, 1],
    properties: {
      bodyType: 'dynamic',
      mass: 0.5,
      restitution: 0.0,
      friction: 0.0,
      linearDamping: 0.05,
      angularDamping: 0.1
    },
    visual: { shape: 'sphere', color: color, size: 0.35, opacity: 1.0 }
  });
  state.globals.shells[shellId] = { color: color, exploded: false, launchT: state.t };
  state.globals.nextLaunch = state.t + 60 + Math.floor(Math.random() * 40);
}

// Check shells and explode them at peak
for (const entity of state.entities) {
  const meta = state.globals.shells[entity.id];
  if (!meta || meta.exploded) continue;
  const age = state.t - meta.launchT;
  if (age >= 72) {
    meta.exploded = true;
    entity.visual = { shape: 'sphere', color: meta.color, size: 0.01, opacity: 0 };
    entity.properties.bodyType = 'static';
    const count = 40 + Math.floor(Math.random() * 20);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 6 + Math.random() * 8;
      const vx = speed * Math.sin(phi) * Math.cos(theta);
      const vy = speed * Math.cos(phi);
      const vz = speed * Math.sin(phi) * Math.sin(theta);
      state.entities.push({
        id: 'spark_' + state.t + '_' + i,
        type: 'rigid_body',
        position: [...entity.position],
        velocity: [vx, vy, vz],
        rotation: [0, 0, 0, 1],
        properties: {
          bodyType: 'dynamic',
          mass: 0.05,
          restitution: 0.1,
          friction: 0.0,
          linearDamping: 0.6,
          angularDamping: 0.1
        },
        visual: { shape: 'sphere', color: meta.color, size: 0.18, opacity: 0.95 }
      });
    }
  }
}
