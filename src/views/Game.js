import Game from "../game/index.js";

var controlsTimeout;
export default {
  template: `<div id="game">
    <div v-if="(!gameLock && !done) || waiting" class="game-cover" >
      <div v-if="waiting === true" class="game-cover__loader">Carregant...</div>
      <div v-if="waiting === false" class="game-cover__menu-wrapper">
        <div class="game-cover__menu">
          <h2 class="centered">{{ menuTitle }}</h2>
          <ul class="centered">
            <li v-if="!gameOver && !started"><button @click="gameLock = true" class="button">{{ isTouch ? 'Explorar' : 'Jugar' }}</button></li>
            <li v-if="!gameOver && started"><button @click="gameLock = true" class="button">{{ isTouch ? 'Explorar' : 'Continuar' }}</button></li>
            <li v-if="started && !isTouch"><button @click="restart" class="button">Reiniciar</button></li>
            <li><button @click="exit" class="button">Sortir</button></li>
          </ul>
        </div>
        <div v-if="!isTouch" class="game-cover__map" ref="coverMap">
          <canvas id="coverMap"></canvas>
        </div>
      </div>
    </div>
    <div class="game-overlay">
      <div v-if="gameLock && isTouch" @click="gameLock = false" class="is-touch-unlocker"></div>
      <div v-if="!isTouch" class="controls-highlights" :class="{'hidden': !showControls}">
        <ul v-if="controls === 'pointer'" class="centered">
          <li class="movement"><div class="icon"><p><strong>A,W,D,S</strong><br/>per desplaçar-se</p></div></li>
          <li class="jump"><div class="icon"><p><strong>Barra espaciadora</strong><br/>per saltar</p></div></li>
          <li class="camera"><div class="icon"><p><strong>Ratolí</strong><br/>per moure la camara</p></div></li>
          <li class="enter"><div class="icon"><p><strong>Enter</strong><br/>per col·locar la peça</p></div></li>
        </ul>
        <ul v-else="controls === 'orbit'" class="centered">
          <li class="orbit"><div class="icon"><p><strong>Click esquerra</strong><br/>per rotar</p></div></li>
          <li class="pan"><div class="icon"><p><strong>Click dret</strong><br/>per desplaçar</p></div></li>
          <li class="zoom"><div class="icon"><p><strong>Scroll</strong><br/>pel zoom</p></div></li>
        </ul>
      </div>
      <aside v-if="gameLock && !isTouch" class="game-aside left">
        <ul class="centered">
          <li class="escape"><div class="icon"><p><strong>Menú</strong></p></div></li>
          <li class="map"><div class="icon"><p><strong>Mapa</strong></p></div></li>
          <li class="help"><div class="icon"><p><strong>Controls</strong></p></div></li>
        </ul>
      </aside>
    </div>
    <div ref="modal" v-if="done" class="done-modal"></div>
    <canvas id="canvas"></canvas>
  </div>`,
  components: {
    carousel: VueCarousel.Carousel,
    slide: VueCarousel.Slide,
  },
  data() {
    return {
      started: false,
      gameLock: undefined,
      showControls: false,
      game: null,
      waiting: false,
      gameOver: false,
      controls: "pointer",
      done: false,
    };
  },
  beforeMount() {
    fetch("/piece/" + this.pieceId)
      .then((res) => res.json())
      .then((data) => {
        this.game = new Game(
          document.getElementById("canvas"),
          data,
          this.isTouch ? "touch" : "pointer"
        );
        if (!this.isTouch) {
          this.coverMap = new Game(
            document.getElementById("coverMap"),
            data,
            "cover"
          );
          this.coverMap.bind();
        } else {
          this.game.bind();
        }
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
    document.removeEventListener("done", this.onDone);
    document.addEventListener("done", this.onDone);
  },
  computed: {
    isTouch() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    },
    pieceId() {
      return this.$route.query.pieceId;
    },
    menuTitle() {
      return this.gameOver ? "Game Over" : "Menú";
    },
    carouselImageWidth() {
      return Math.min(window.innerHeight, window.innerWidth) + "px";
    },
  },
  methods: {
    exit() {
      this.$router.push({ path: "/" });
    },
    onGameUnlock() {
      this.gameLock = false;
    },
    onHelp(ev) {
      clearTimeout(controlsTimeout);
      this.controls = ev.detail;
      this.showControls = true;
      controlsTimeout = setTimeout((_) => (this.showControls = false), 7000);
    },
    restart() {
      this.game.unbind();
      this.game = new Game(
        this.game.canvas,
        this.game.playerData,
        this.isTouch ? "orbit" : "pointer"
      );
      this.game.bind();
      this.started = false;
      this.gameOver = false;
      this.gameLock = true;
    },
    onGameOver() {
      this.gameOver = true;
    },
    onDone() {
      this.done = true;
      fetch(`piece/${this.pieceId}`, {
        method: "POST",
      }).then((res) => {
        res.json().then((data) => {
          if (data["success"]) {
            this.$nextTick(() => {
              this.$refs.modal.classList.add("visible");
            });
          }
        });
      });
    },
  },
  watch: {
    gameLock(to, from) {
      const self = this;
      self.waiting = true;
      setTimeout(() => {
        self.waiting = false;
        if (to) {
          self.started = true;
          self.showControls = true;
          controlsTimeout = setTimeout(() => (self.showControls = false), 7000);
          if (!self.isTouch) {
            self.coverMap.unbind();
            window.audioObj.play();
          }
          self.game.bind();
          self.game.scene.state.mode = self.isTouch ? "orbit" : "pointer";
          self.onHelp({
            detail: "pointer",
          });
        } else {
          if (!self.isTouch) {
            self.$nextTick(() => {
              self.$refs.coverMap.removeChild(self.$refs.coverMap.children[0]);
              self.$refs.coverMap.innerHTML = '<canvas id="coverMap"></canvas>';
              self.coverMap = new Game(
                document.getElementById("coverMap"),
                self.coverMap.playerData,
                "cover"
              );
              self.coverMap.bind();
            });
            window.audioObj.pause();
            window.audioObj.currentTime = 0;
          }
          self.game.unbind();
        }
      }, 1000);

      if (!self.isTouch) self.coverMap.lock(!to);
      self.game.lock(to);
    },
  },
};
