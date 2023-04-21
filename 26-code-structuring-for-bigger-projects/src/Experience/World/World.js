import Environment from './Environment.js';
import Floor from './Floor.js';
import Fox from './Fox.js';

export default class World {
  constructor(experience) {
    this.experience = experience;
    this.scene = experience.scene;
    this.resources = experience.resources;

    this.resources.on('ready', () => {
      this.floor = new Floor(experience);
      this.fox = new Fox(experience);
      this.environment = new Environment(experience);
    });
  };
  update() {
    if (this.fox) {
      this.fox.update();
    };
  };
};