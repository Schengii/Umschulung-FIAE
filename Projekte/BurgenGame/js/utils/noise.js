// --- PERLIN NOISE GENERATOR ---
// Simple implementation of 2D Noise for procedural map generation

class PerlinNoise {
  constructor(seed) {
    this.seed = seed || Math.random();
    this.p = new Uint8Array(512);
    this.permutation = new Uint8Array(256);
    
    // Simple LCG random for seeding
    let random = this.seed;
    const lcg = () => {
      random = (random * 1664525 + 1013904223) % 4294967296;
      return random / 4294967296;
    };
    
    for (let i = 0; i < 256; i++) {
      this.permutation[i] = i;
    }
    
    // Shuffle
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(lcg() * (i + 1));
      const temp = this.permutation[i];
      this.permutation[i] = this.permutation[j];
      this.permutation[j] = temp;
    }
    
    for (let i = 0; i < 512; i++) {
      this.p[i] = this.permutation[i % 256];
    }
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  lerp(t, a, b) {
    return a + t * (b - a);
  }

  grad(hash, x, y) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise(x, y) {
    let X = Math.floor(x) & 255;
    let Y = Math.floor(y) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    
    const u = this.fade(x);
    const v = this.fade(y);
    
    const A = this.p[X] + Y, AA = this.p[A], AB = this.p[A + 1];
    const B = this.p[X + 1] + Y, BA = this.p[B], BB = this.p[B + 1];
    
    return this.lerp(v, 
      this.lerp(u, this.grad(this.p[AA], x, y), this.grad(this.p[BA], x - 1, y)),
      this.lerp(u, this.grad(this.p[AB], x, y - 1), this.grad(this.p[BB], x - 1, y - 1))
    );
  }
  
  // Get normalized value between 0 and 1
  get(x, y) {
    return (this.noise(x, y) + 1) / 2;
  }
}

window.PerlinNoise = PerlinNoise;
