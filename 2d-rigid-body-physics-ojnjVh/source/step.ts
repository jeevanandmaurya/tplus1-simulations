
if (!state.entities) state.entities = [];

// Hydrate 2D bouncing balls on load
if (state.t === 0 && state.entities.length === 0) {
  const count = 400; // 400 2D objects
  const colors = ['#f43f5e', '#8b5cf6', '#3b82f6', '#14b8a6', '#f59e0b', '#ec4899', '#06b6d4'];
  const shapes = ['circle', 'square'];
  
  const boundsX = state.globals.bounds_x || 800;
  const boundsY = state.globals.bounds_y || 600;

  for (let i = 0; i < count; i++) {
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    // 2D objects are visually larger in screen-space
    const size = 10 + Math.random() * 20; 
    const mass = (size * size) * 0.05; // mass proportional to area
    
    state.entities.push({
      id: `body2d_${i}`,
      type: 'rigid_body',
      position: [
        60 + Math.random() * (boundsX - 120),
        60 + Math.random() * (boundsY * 0.8), // Start in upper 80%
        0 // 2D means z is 0
      ],
      velocity: [
        (Math.random() - 0.5) * 200, // Move faster horizontally
        (Math.random() - 0.5) * 100, // Move vertically
        0
      ],
      properties: {
        bodyType: 'dynamic',
        mass: mass,
        restitution: 0.6 + Math.random() * 0.35, // very bouncy
        friction: 0.2 + Math.random() * 0.3,
        linearDamping: 0.05,
        angularDamping: 0.1,
        angle: Math.random() * Math.PI * 2 // Initialize with a random 2D angle
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
