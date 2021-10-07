import { Group, AmbientLight, DirectionalLight } from 'three'

class Lights extends Group {
  constructor() {
    super();
    const ambientLight = new AmbientLight(0x999999, 0.8);
    const directionalLight = new DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(1000, 0, 2000);
    this.add(ambientLight);
    this.add(directionalLight);
  }
}

export default Lights;
