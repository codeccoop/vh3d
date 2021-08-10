import Game from "../game/index.js";

export default {
  template: `<div id="game">
    <div v-if="!lock" class="menu-veil">
      <div class="menu-wrapper">
        <div v-if="!help" class="game-menu menu">
          <h2 class="centered">Menu</h2>
          <ul class="centered">
            <li><button @click="lock = true">{{ isTouch ? 'Explorar' : 'Jugar' }}</button></li>
            <li><button @click="exit">Sortir</button></li>
            <li><button @click="help = true">Ajuda</button></li>
          </ul>
        </div>
        <div v-if="help" class="help-menu menu">
          <h2 class="centered">Ajuda</h2>
          <ul class="centered">
            <li><strong>A,W,D,S</strong> per moures</li>
            <li><strong>Ratolí</strong> per moure la camara</li>
            <li><strong>Click esquerra</strong> per interactuar</li>
            <li><strong>ESC</strong> per tornar al menú</li>
            <li><strong>M</strong> per accedir al mapa</li>
            <li><button @click="help = false">Tornar</button></li>
          </ul>
         </div>
      </div>
    </div>
    <canvas id="canvas"></canvas>
  </div>`,
  data() {
    return {
      lock: false,
      help: false,
      game: null,
      lastUnlock: Date.now(),
    };
  },
  mounted() {
    document.removeEventListener("unlock", this.onUnlock);
    document.addEventListener("unlock", this.onUnlock);
    this.game = new Game(this.isTouch);
  },
  computed: {
    isTouch() {
      return (
        "touchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0 ||
        window.innerWidth < window.innerHeight
      );
    },
  },
  methods: {
    exit() {
      this.game.unbind();
      this.$router.push({ path: "/" });
    },
    onUnlock() {
      this.lock = false;
    },
  },
  watch: {
    lock(to, from) {
      this.game.lock(to);
    },
  },
};
