const COLORS = ['#f43f5e','#fb923c','#facc15','#4ade80','#22d3ee','#818cf8','#e879f9','#f472b6'];

if (!state.globals.ballCount) state.globals.ballCount = 0;

const spawnRate = 40;
const ballSize = 0.6;

if (state.t % spawnRate === 0 && state.globals.ballCount < 60) {
  const color = COLORS[state.globals.ballCount % COLORS.length];
  state.entities.push({
    id: 'ball_' + state.t,
    type: 'rigid_body',
    position: [(Math.random() - 0.5) * 14, 18, (Math.random() - 0.5) * 14],
    velocity: [(Math.random() - 0.5) * 4, 0, (Math.random() - 0.5) * 4],
    rotation: [0, 0, 0, 1],
    properties: {
      bodyType: 'dynamic',
      mass: 1,
      restitution: 0.6,
      friction: 0.3,
      linearDamping: 0.02,
      angularDamping: 0.05
    },
    visual: {
      shape: 'sphere',
      color: color,
      size: ballSize,
      opacity: 1.0
    }
  });
  state.globals.ballCount += 1;
}
