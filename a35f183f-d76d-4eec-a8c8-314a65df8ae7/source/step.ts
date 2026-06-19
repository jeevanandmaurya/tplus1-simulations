const COLORS = [
  "#f43f5e", "#fb923c", "#facc15", "#4ade80",
  "#22d3ee", "#818cf8", "#e879f9", "#f472b6"
];

function step(state, config, dt) {
  const spawnRate = config.parameters?.spawnRate ?? 40;
  const ballSize = config.parameters?.ballSize ?? 0.6;

  if (state.t % Math.round(spawnRate) === 0 && state.globals.ballCount < 60) {
    const id = "ball_" + state.t;
    const color = COLORS[state.globals.ballCount % COLORS.length];
    const x = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;

    state.entities.push({
      id,
      type: "sphere",
      position: [x, 12, z],
      rotation: [0, 0, 0, 1],
      scale: [ballSize, ballSize, ballSize],
      color
    });

    state.globals.ballCount += 1;
  }

  return state;
}
