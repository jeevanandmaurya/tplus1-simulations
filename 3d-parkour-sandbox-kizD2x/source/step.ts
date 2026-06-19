
  const player = bodyMap.get('player');
  if (player) {
    const curPos = player.translation();
    
    // Infinite Procedural Platforms
    state.globals.lastPlatformZ = state.globals.lastPlatformZ ?? 0;
    
    // Maintain a buffer of platforms ahead
    while (state.globals.lastPlatformZ > curPos.z - 120) {
      const nextZ = state.globals.lastPlatformZ - (15 + Math.random() * 10);
      const nextX = (Math.random() - 0.5) * 20; // some side-to-side variance
      const nextY = -2 + (Math.random() - 0.5) * 6;
      
      const pId = 'plat_' + state.t + '_' + Math.floor(Math.random()*1000);
      const bodyDesc = self.RAPIER.RigidBodyDesc.fixed().setTranslation(nextX, nextY, nextZ);
      const body = world.createRigidBody(bodyDesc);
      
      // Make platforms wide: size 14-20
      const w = 7 + Math.random() * 3; // half width
      const d = 7 + Math.random() * 3; // half depth
      
      const colliderDesc = self.RAPIER.ColliderDesc.cuboid(w, 0.5, d);
      world.createCollider(colliderDesc, body);
      bodyMap.set(pId, body);
      
      // Random shades of slate/blue
      const colors = ['#64748B', '#475569', '#334155', '#1E293B', '#4F46E5', '#6366F1'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      state.entities.push({
        id: pId,
        type: 'ground',
        position: [nextX, nextY, nextZ],
        properties: { mass: 0, bodyType: 'fixed' },
        visual: { shape: 'box', color, size: [w*2, 1, d*2] }
      });
      
      state.globals.lastPlatformZ = nextZ;
      state.globals._forceSync = true;
    }
    
    // Cleanup old platforms
    const toRemove = [];
    for (const e of state.entities) {
      if (e.type === 'ground' && e.id !== 'start_platform') {
         // if platform is way behind the player
         if (e.position[2] > curPos.z + 40) {
            toRemove.push(e.id);
         }
      }
    }
    if (toRemove.length > 0) {
       state.entities = state.entities.filter(e => !toRemove.includes(e.id));
       state.globals._forceSync = true;
    }
    // Handle resetting dynamic platforms if boundary reset happened (pos.y < -29)
    // We check pos.y to sync with the boundary_reset behavior threshold of -30.
    if (curPos.y < -29) {
       // Clean up dynamically generated platforms
       const toRemove = [];
       for (const e of state.entities) {
         if (e.id.startsWith('plat_')) {
            toRemove.push(e.id);
         }
       }
       state.entities = state.entities.filter(e => !toRemove.includes(e.id));
       state.globals.lastPlatformZ = 0;
    }
  }
