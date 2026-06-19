
  // Generate a long, fixed level using math (no random variables!)
  function generateLevel(levelIndex) {
    const geometry = [];
    const length = 50 + (levelIndex * 20); // Levels get longer
    const gapFreq = Math.max(2, 5 - levelIndex); // More gaps on higher levels
    
    let lastY = 0;
    
    // Start platform
    geometry.push({ id: 'start_plat', type: 'ground', position: [0, -5, 0], properties: { mass: 0, bodyType: 'fixed' }, visual: { shape: 'square', color: '#22C55E', size: [20, 2] } });

    for (let i = 1; i < length; i++) {
      const x = i * 15;
      
      // Fixed pseudo-random using Sine wave so the level is always EXACTLY the same
      const wave = Math.sin(i * 1.5); 
      
      // Determine if this should be a gap
      if (i % gapFreq !== 0) {
        // Vary height based on the sine wave
        const y = Math.floor(wave * 8); 
        
        geometry.push({ 
          id: 'plat_' + i, 
          type: 'ground', 
          position: [x, y - 5, 0], 
          properties: { mass: 0, bodyType: 'fixed', friction: 0.8 }, 
          visual: { shape: 'square', color: '#22C55E', size: [12, 2] } 
        });
        
        // Add a floating obstacle block occasionally
        if (i % 4 === 0) {
           geometry.push({ 
             id: 'obs_' + i, 
             type: 'wall', 
             position: [x, y + 5, 0], 
             properties: { mass: 0, bodyType: 'fixed' }, 
             visual: { shape: 'square', color: '#F43F5E', size: [2, 10] } 
           });
        }
        
        lastY = y;
      }
    }
    
    // Goal line
    const goalX = length * 15;
    geometry.push({ 
      id: 'goal_' + levelIndex, 
      type: 'goal', 
      position: [goalX, lastY + 5, 0], 
      properties: { mass: 0, bodyType: 'fixed' }, 
      visual: { shape: 'square', color: '#FBBF24', size: [5, 40] } 
    });
    
    return { geometry, goalX };
  }

  // Initialize Level 1 on the very first frame
  if (state.globals.current_level === 0) {
    state.globals.current_level = 1;
    const levelData = generateLevel(1);
    state.globals.current_goalX = levelData.goalX;
    state.entities.push(...levelData.geometry);
    state.globals._forceSync = true;
  }

  // Monitor player position to load next levels
  const player = bodyMap.get('player');
  if (player) {
    const pos = player.translation();
    
    if (pos.x > state.globals.current_goalX) {
      // Ding!
      state.events = state.events || [];
      state.events.push({ type: 'play_audio', payload: { id: 'jump', volume: 1.0 } });
      
      state.globals.current_level++;
      const levelData = generateLevel(state.globals.current_level);
      state.globals.current_goalX = levelData.goalX;
      
      // Wipe old static geometry but keep the player
      state.entities = state.entities.filter(e => e.type === 'player');
      
      // Stream in new geometry
      state.entities.push(...levelData.geometry);
      state.globals._forceSync = true;
    }
  }
