export default `
if (!state.entities) state.entities = [];

// Hydrate chaos on load
if (state.t === 0 && state.entities.length <= 1) { // 1 for the ground
  const count = 1200; // Over a thousand physics objects!
  const colors = ['#f43f5e', '#8b5cf6', '#3b82f6', '#14b8a6', '#f59e0b', '#ec4899', '#06b6d4'];
  const shapes = ['sphere', 'box'];

  for (let i = 0; i < count; i++) {
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const size = 0.6 + Math.random() * 0.8;
    const mass = size * size * size; // roughly proportional to volume
    
    state.entities.push({
      id: \`body3d_\${i}\`,
      type: 'rigid_body',
      position: [
        (Math.random() - 0.5) * 20,
        5 + Math.random() * 40,
        (Math.random() - 0.5) * 20
      ],
      velocity: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      ],
      rotation: [0, 0, 0, 1],
      properties: {
        bodyType: 'dynamic',
        mass: mass,
        restitution: 0.4 + Math.random() * 0.5,
        friction: 0.3,
        linearDamping: 0.05,
        angularDamping: 0.1
      },
      visual: {
        shape: shape,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: size,
        opacity: 0.95
      }
    });
  }
}
`;
