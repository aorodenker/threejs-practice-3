import EventEmitter from './EventEmitter.js';

export default class Sizes extends EventEmitter {
  constructor() {
    super();

    // Setup
    this.height = window.innerHeight;
    this.width = window.innerWidth;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);

    // Resize event
    window.addEventListener('resize', () => {
      this.height = window.innerHeight;
      this.width = window.innerWidth;
      this.pixelRatio = Math.min(window.devicePixelRatio, 2);

      this.trigger('resize');
    });
  };
};