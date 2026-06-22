if (!state.entities) state.entities = [];

const g = config.globals;
const palette = ['#ff4466','#ff7733','#ffcc00','#44ff88','#33ccff','#aa66ff','#ff44cc'];
const balls = state.entities.filter(e => e.id.startsWith('ball_'));

// Spawn a new ball every spawn_rate frames
if (state.t % Math.max(1, Math.round(g.spawn_rate)) === 0 && balls.length < g.max_balls) {
  const color = palette[balls.length % palette.length];
  state.entities.push({
    id: 'ball_' + state.t,
    type: 'rigid_body',
    position: [-12 + (Math.random() - 0.5) * 2, 12, (Math.random() - 0.5) * 4],
    velocity: [3, 0, 0],
    rotation: [0, 0, 0, 1],
    properties: {
      bodyType: 'dynamic',
      mass: 1,
      restitution: g.restitution,
      friction: g.friction,
      linearDamping: 0.02,
      angularDamping: 0.05
    },
    visual: {
      shape: 'sphere',
      color: color,
      size: g.ball_size,
      opacity: 1.0
    }
  });
}

// Remove balls that have fallen through the floor
state.entities = state.entities.filter(e =>
  !e.id.startsWith('ball_') || e.position[1] > -60
);