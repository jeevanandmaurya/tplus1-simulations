function step(state, config, dt) {
  const g = config.globals;

  // --- Initialise static scene once ---
  if (g.initialized === 0) {
    g.initialized = 1;

    // Ground
    state.entities.push({
      id: "ground",
      type: "rigid_body",
      position: [0, -22, 0],
      velocity: [0, 0, 0],
      rotation: [0, 0, 0, 1],
      properties: { bodyType: "fixed", mass: 0, restitution: 0.3, friction: 0.8 },
      visual: { shape: "box", color: "#1a2233", size: [60, 1, 14], opacity: 1.0 }
    });

    // Left wall
    state.entities.push({
      id: "wall_left",
      type: "rigid_body",
      position: [-25, 0, 0],
      velocity: [0, 0, 0],
      rotation: [0, 0, 0, 1],
      properties: { bodyType: "fixed", mass: 0, restitution: 0.3, friction: 0.5 },
      visual: { shape: "box", color: "#1a2233", size: [1, 60, 14], opacity: 1.0 }
    });

    // Right wall
    state.entities.push({
      id: "wall_right",
      type: "rigid_body",
      position: [25, 0, 0],
      velocity: [0, 0, 0],
      rotation: [0, 0, 0, 1],
      properties: { bodyType: "fixed", mass: 0, restitution: 0.3, friction: 0.5 },
      visual: { shape: "box", color: "#1a2233", size: [1, 60, 14], opacity: 1.0 }
    });

    // Back wall
    state.entities.push({
      id: "wall_back",
      type: "rigid_body",
      position: [0, 0, -7],
      velocity: [0, 0, 0],
      rotation: [0, 0, 0, 1],
      properties: { bodyType: "fixed", mass: 0, restitution: 0.3, friction: 0.5 },
      visual: { shape: "box", color: "#111a28", size: [60, 60, 1], opacity: 1.0 }
    });

    // Front wall (transparent)
    state.entities.push({
      id: "wall_front",
      type: "rigid_body",
      position: [0, 0, 7],
      velocity: [0, 0, 0],
      rotation: [0, 0, 0, 1],
      properties: { bodyType: "fixed", mass: 0, restitution: 0.3, friction: 0.5 },
      visual: { shape: "box", color: "#223355", size: [60, 60, 1], opacity: 0.15 }
    });

    // Ramp 1 — tilted down-right at ~25 degrees (sin/cos of 12.5 deg)
    // rotation around Z: [0, 0, sin(angle/2), cos(angle/2)] for angle=25deg => [0,0,0.2164,0.9763]
    state.entities.push({
      id: "ramp1",
      type: "rigid_body",
      position: [-4, 0, 0],
      velocity: [0, 0, 0],
      rotation: [0, 0, 0.2164, 0.9763],
      properties: { bodyType: "fixed", mass: 0, restitution: 0.2, friction: 0.4 },
      visual: { shape: "box", color: "#2a3f5f", size: [22, 1.2, 13], opacity: 1.0 }
    });

    // Ramp 2 — tilted down-left at ~25 degrees
    state.entities.push({
      id: "ramp2",
      type: "rigid_body",
      position: [5, -10, 0],
      velocity: [0, 0, 0],
      rotation: [0, 0, -0.2164, 0.9763],
      properties: { bodyType: "fixed", mass: 0, restitution: 0.2, friction: 0.4 },
      visual: { shape: "box", color: "#2a3f5f", size: [22, 1.2, 13], opacity: 1.0 }
    });

    // Ramp 3 — tilted down-right at ~25 degrees
    state.entities.push({
      id: "ramp3",
      type: "rigid_body",
      position: [-3, -17, 0],
      velocity: [0, 0, 0],
      rotation: [0, 0, 0.2164, 0.9763],
      properties: { bodyType: "fixed", mass: 0, restitution: 0.2, friction: 0.4 },
      visual: { shape: "box", color: "#2a3f5f", size: [18, 1.2, 13], opacity: 1.0 }
    });
  }

  // --- Count active balls ---
  const balls = state.entities.filter(e => e.id.startsWith("ball_"));

  // --- Spawn a new ball ---
  if (state.t % Math.max(1, Math.round(g.spawn_rate)) === 0 && balls.length < g.max_balls) {
    const palette = [
      "#ff4466", "#ff7733", "#ffcc00",
      "#44ff88", "#33ccff", "#aa66ff", "#ff44cc"
    ];
    const color = palette[balls.length % palette.length];
    const jitter = (Math.random() - 0.5) * 3;

    state.entities.push({
      id: "ball_" + state.t,
      type: "rigid_body",
      position: [-13 + jitter, 17, (Math.random() - 0.5) * 5],
      velocity: [2, 0, 0],
      rotation: [0, 0, 0, 1],
      properties: {
        bodyType: "dynamic",
        mass: 1,
        restitution: g.restitution,
        friction: g.friction
      },
      visual: {
        shape: "sphere",
        color: color,
        size: g.ball_size,
        opacity: 1.0
      }
    });
  }

  // --- Cull balls that have fallen out of bounds ---
  state.entities = state.entities.filter(e =>
    !e.id.startsWith("ball_") || e.position[1] > -30
  );

  return state;
}