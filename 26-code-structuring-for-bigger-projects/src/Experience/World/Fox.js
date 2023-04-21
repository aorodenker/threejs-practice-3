export default class Fox {
  constructor(experience) {
    this.experience = experience;
    this.scene = experience.scene;
    this.resources = experience.resources;

    this.resource = this.resources.items.foxModel;
  };
};