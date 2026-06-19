export default `
if (!state.entities || !bodyMap) return;

const generateWaveTerrain = function(size, segments, depth, phase) {
  const numVertices = (segments + 1) * (segments + 1);
  const numQuads = segments * segments;
  
  const vertices = new Float32Array(numVertices * 3);
  const indices = new Uint32Array(numQuads * 6);
  
  const step = size / segments;
  const halfSize = size / 2;
  
  let vIdx = 0;
  for (let z = 0; z <= segments; z++) {
    for (let x = 0; x <= segments; x++) {
      const px = x * step - halfSize;
      const pz = z * step - halfSize;
      
      const wave = (Math.sin(px * 0.1 + phase) + Math.sin(pz * 0.1 + phase * 1.5)) * (depth / 2);
      const noise = Math.sin(px * 0.4) * Math.cos(pz * 0.4) * 0.8;
      const py = wave + noise;
      
      vertices[vIdx++] = px;
      vertices[vIdx++] = py;
      vertices[vIdx++] = pz;
    }
  }
  
  let iIdx = 0;
  for (let z = 0; z < segments; z++) {
    for (let x = 0; x < segments; x++) {
      const a = x + (segments + 1) * z;
      const b = x + (segments + 1) * (z + 1);
      const c = (x + 1) + (segments + 1) * (z + 1);
      const d = (x + 1) + (segments + 1) * z;
      
      indices[iIdx++] = a;
      indices[iIdx++] = b;
      indices[iIdx++] = d;
      
      indices[iIdx++] = b;
      indices[iIdx++] = c;
      indices[iIdx++] = d;
    }
  }
  return { vertices, indices };
};

// 1. Setup the Generation Worker (only once per worker thread)
if (!self._terrainWorker) {
  state.globals._terrainWorkerReady = true;
  state.globals._nextTerrain = null;
  state.globals._isGenerating = false;
  state.globals.lastResetT = 0;
  state.globals.cycle = 0;

  const workerCode = \`
    const generateWaveTerrain = \${generateWaveTerrain.toString()};
    
    self.onmessage = function(e) {
      const { size, segments, depth, phase } = e.data;
      const { vertices, indices } = generateWaveTerrain(size, segments, depth, phase);
      
      // Transfer the typed arrays to avoid copying overhead
      self.postMessage({ vertices, indices }, [vertices.buffer, indices.buffer]);
    };
  \`;

  const blob = new Blob([workerCode], { type: 'application/javascript' });
  if (self._terrainWorker) {
    self._terrainWorker.terminate();
  }
  self._terrainWorker = new Worker(URL.createObjectURL(blob));
}

// Always update the onmessage handler so it captures the freshest 'state' object!
// If we left it inside the initialization block, it would mutate a stale state clone from t=0.
self._terrainWorker.onmessage = (e) => {
  state.globals._nextTerrain = e.data;
  state.globals._isGenerating = false;
};

// 2. Queue the generation early (at t=0, or 200 ticks before swap)
const ticksSinceReset = state.t - state.globals.lastResetT;

if (state.t === 0 && state.globals.cycle === 0 && !state.globals._nextTerrain) {
  // Generate the very first terrain synchronously so it hydrates instantly when paused!
  state.globals._nextTerrain = generateWaveTerrain(100, 60, 15, 0);
  swapTerrain();
} else if (ticksSinceReset === 700 && !state.globals._isGenerating) {
  // 200 ticks before the 900 swap, we start computing the next terrain phase asynchronously!
  state.globals._isGenerating = true;
  const nextPhase = (state.globals.cycle + 1) * Math.PI / 2;
  self._terrainWorker.postMessage({ size: 100, segments: 60, depth: 15, phase: nextPhase });
}

// Helper to swap and respawn bodies
function swapTerrain() {
  const terrainData = state.globals._nextTerrain;
  state.globals._nextTerrain = null;
  
  // Filter out existing terrain and balls
  state.entities = state.entities.filter(e => e.type !== 'terrain' && !e.id.startsWith('ball_'));
  
  // Push new terrain. The vertices/indices are Float32Array/Uint32Array!
  // This drastically drops the structured cloning overhead across the worker boundaries.
  state.entities.push({
    id: \`advanced_terrain_\${state.globals.cycle}\`,
    type: 'terrain',
    position: [0, -5, 0],
    rotation: [0, 0, 0, 1],
    properties: { 
      bodyType: 'fixed',
      mass: 0, 
      restitution: 0.2, 
      friction: 0.8,
      vertices: terrainData.vertices,
      indices: terrainData.indices
    },
    visual: { shape: 'trimesh', color: '#0d9488', size: 1 }
  });
  
  // Respawn 15 massive spheres high above
  for (let i = 0; i < 15; i++) {
    state.entities.push({
      id: \`ball_\${state.globals.cycle}_\${i}\`,
      type: 'rigid_body',
      position: [
        (Math.random() - 0.5) * 40,
        30 + Math.random() * 40,
        (Math.random() - 0.5) * 40
      ],
      rotation: [0, 0, 0, 1],
      properties: { bodyType: 'dynamic', mass: 5, restitution: 0.6, friction: 0.5 },
      visual: { shape: 'sphere', size: 3.0 + Math.random() * 1.5, color: i % 2 === 0 ? '#f43f5e' : '#eab308' }
    });
  }
  
  state.globals.lastResetT = state.t;
}



// Normal 15-second cycle swap (900 ticks)
if (ticksSinceReset >= 900 && state.globals._nextTerrain) {
  state.globals.cycle++;
  swapTerrain();
}
`;

