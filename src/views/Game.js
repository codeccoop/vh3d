import Game from "../game/index.js";

var controlsTimeout;
export default {
  template: `<div id="game">
    <div v-if="!gameLock" class="menu-veil">
      <div v-if="!waiting" class="menu-wrapper">
        <div v-if="!help" class="game-menu menu">
          <h2 class="centered">{{ gameOver ? 'Game Over' : 'Menu' }}</h2>
          <ul class="centered">
            <li v-if="!gameOver"><button @click="gameLock = true" class="button">{{ isTouch ? 'Explorar' : 'Jugar' }}</button></li>
            <li v-if="gameOver"><button @click="restart" class="button">Reiniciar</button></li>
            <li><button @click="exit" class="button">Sortir</button></li>
            <li><button @click="help = true" class="button">Ajuda</button></li>
          </ul>
        </div>
        <div v-if="help" class="help-menu menu">
          <h2 class="centered">Ajuda</h2>
          <ul class="centered">
            <li><button @click="help = false" class="button">Tornar</button></li>
          </ul>
        </div>
      </div>
    </div>
    <div v-if="gameLock && isTouch" @click="gameLock = false" class="is-touch-unlocker"></div>
    <div v-if="!isTouch" class="controls-highlights" :class="{'hidden': !showControls}">
      <ul v-if="controls === 'pointer'" class="centered">
        <li class="movement"><div class="icon"><p><strong>A,W,D,S</strong><br/>per desplaçar-se</p></div></li>
        <li class="jump"><div class="icon"><p><strong>Barra espaciadora</strong><br/>per saltar</p></div></li>
        <li class="camera"><div class="icon"><p><strong>Ratolí</strong><br/>per moure la camara</p></div></li>
      </ul>
      <ul v-else="controls === 'orbit'" class="centered">
        <li class="orbit"><div class="icon"><p><strong>Click esquerra</strong><br/>per rotar</p></div></li>
        <li class="pan"><div class="icon"><p><strong>Click dret</strong><br/>per desplaçar</p></div></li>
        <li class="zoom"><div class="icon"><p><strong>Scroll</strong><br/>pel zoom</p></div></li>
      </ul>
    </div>
    <aside v-if="!isTouch" class="game-aside left">
      <ul class="centered">
        <li class="escape"><div class="icon"><p><strong>Menú</strong></p></div></li>
        <li class="map"><div class="icon"><p><strong>Mapa</strong></p></div></li>
        <li class="help"><div class="icon"><p><strong>Controls</strong></p></div></li>
      </ul>
    </aside>
    <aside v-if="!isTouch && distance < 100" class="game-aside right">
      <div class="distance-slider">
        <h3>Metres</h3>
        <div ref="slider" class="slider">
          <div ref="position" class="slider-position">
             {{distance ? distance.toFixed(2) : ''}}<div></div>
          </div>
          <div class="slider-scrollbar"></div>
        </div>
      </div>
    </aside>
    <canvas id="canvas"></canvas>
  </div>`,
  data() {
    return {
      gameLock: undefined,
      help: false,
      showControls: false,
      game: null,
      waiting: false,
      gameOver: false,
      distance: 101,
      controls: "pointer",
      done: false,
    };
  },
  beforeMount() {
    fetch("/piece/" + this.pieceId)
      .then((res) => res.json())
      .then((data) => {
        this.game = new Game(data, this.isTouch);
      })
      .catch((err) => console.error("Error while fetching the piece"));
    this.controls = this.isTouch ? "orbit" : "pointer";
  },
  mounted() {
    document.removeEventListener("unlock", this.onGameUnlock);
    document.addEventListener("unlock", this.onGameUnlock);
    document.removeEventListener("help", this.onHelp);
    document.addEventListener("help", this.onHelp);
    document.removeEventListener("gameover", this.onGameOver);
    document.addEventListener("gameover", this.onGameOver);
    document.removeEventListener("distance", this.onDistanceChange);
    document.addEventListener("distance", this.onDistanceChange);
    document.removeEventListener("piece", this.onPiece);
    document.addEventListener("piece", this.onPiece);
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
    pieceId() {
      return this.$route.query.pieceId;
    },
  },
  methods: {
    exit() {
      this.game.lock();
      this.$router.push({ path: "/" });
    },
    onGameUnlock() {
      this.gameLock = false;
    },
    onHelp(ev) {
      clearTimeout(controlsTimeout);
      this.controls = ev.detail;
      this.showControls = true;
      controlsTimeout = setTimeout((_) => (this.showControls = false), 5000);
    },
    restart() {
      this.game = new Game(this.isTouch);
      this.gameOver = false;
    },
    onGameOver() {
      this.gameOver = true;
    },
    onDistanceChange(ev) {
      this.distance = ev.detail.value;
      if (this.$refs.position) {
        this.$refs.position.style.top =
          Math.min(
            this.$refs.slider.offsetHeight,
            this.$refs.slider.offsetHeight * (ev.detail.value / 100)
          ) -
          50 +
          "px";
      }
    },
    onPiece() {
      if (this.distance < 0.5) {
        fetch(`piece/${this.pieceId}`, {
          method: "POST",
        }).then((res) => {
          res.json().then((data) => {
            if (data["success"]) {
              this.done = true;
            }
          });
        });
      }
    },
  },
  watch: {
    gameLock(to, from) {
      if (from === undefined && !this.isTouch) {
        window.audioObj.play();
      }
      this.game.lock(to);
      if (from !== void 0) {
        this.waiting = true;
        setTimeout(() => {
          this.waiting = false;
        }, 1000);
      }
      if (to) {
        this.showControls = true;
        controlsTimeout = setTimeout((_) => (this.showControls = false), 5000);
      }
    },
  },
};
