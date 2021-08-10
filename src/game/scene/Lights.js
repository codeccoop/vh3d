class Lights extends THREE.Group {
  constructor() {
    super();
    const ambientLight = new THREE.AmbientLight(0x999999, 0.8);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(1000, 0, 2000);
    this.add(ambientLight);
    this.add(directionalLight);
  }
}

export default Lights;
