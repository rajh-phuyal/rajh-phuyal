class WaveEffect {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'wave-container';

    this.grid = document.createElement('div');
    this.grid.className = 'wave-grid';

    this.container.appendChild(this.grid);
    document.body.insertBefore(this.container, document.body.firstChild);

    this.points = [];
    this.time = 0;
    this.waveParams = {
      amplitude: 30,
      frequency: 0.02,
      damping: 0.3,
      phaseVelocity: 2,
      decayDistance: 200
    };

    this.init();
    this.bindEvents();
    this.animate();
  }

  init() {
    const spacing = 30; // Smaller spacing for better resolution
    const rows = Math.floor(window.innerHeight / spacing);
    const cols = Math.floor(window.innerWidth / spacing);

    for (let i = 0; i < rows * cols; i++) {
      const point = document.createElement('div');
      point.className = 'wave-point';
      this.grid.appendChild(point);
      this.points.push({
        element: point,
        phase: Math.random() * Math.PI * 2 // Random initial phase
      });
    }
  }

  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      this.points.forEach((point) => {
        const rect = point.element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        // Calculate distance for the probability amplitude
        const distance = Math.sqrt(Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2));

        // Quantum wave function inspired probability distribution
        const probability = Math.exp(-distance / this.waveParams.decayDistance);
        const interference = this.calculateInterference(x, y, distance);

        const height = probability * interference * this.waveParams.amplitude;

        point.element.style.transform = `translateZ(${height}px)`;
        point.element.style.opacity = Math.max(0.2, probability);
      });
    });
  }

  calculateInterference(x, y, distance) {
    // Quantum interference pattern
    const k = 2 * Math.PI * this.waveParams.frequency;
    return Math.cos(k * distance - this.waveParams.phaseVelocity * this.time) *
           Math.exp(-this.waveParams.damping * distance);
  }

  animate() {
    this.time += 0.016; // Assuming 60fps

    this.points.forEach((point) => {
      const rect = point.element.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      // Ground state oscillation
      const baseOscillation = Math.sin(
        this.waveParams.frequency * (x + y) + this.time + point.phase
      ) * 5;

      if (!point.element.style.transform) {
        point.element.style.transform = `translateZ(${baseOscillation}px)`;
      }
    });

    requestAnimationFrame(() => this.animate());
  }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
  new WaveEffect();
});