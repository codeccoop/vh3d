import Game from "../game/index.js";

var controlsTimeout;
export default {
  template: `<div id="game">
    <div v-if="!gameLock" class="game-cover" :style="background.color">
      <div v-if="waiting" class="game-cover__loader">Carregant...</div>
      <div v-else class="game-cover__menu-wrapper">
        <div v-if="!showInfo" class="game-cover__menu">
          <h2 class="centered">{{ menuTitle }}</h2>
          <ul class="centered">
            <li v-if="!gameOver"><button @click="gameLock = true" class="button">{{ isTouch ? 'Explorar' : 'Jugar' }}</button></li>
            <li v-if="gameOver"><button @click="restart" class="button">Reiniciar</button></li>
            <li><button @click="exit" class="button">Sortir</button></li>
            <li><button @click="showInfo = true" class="button">Veure'n més</button></li>
          </ul>
        </div>
        <div v-if="showInfo" class="game-cover__show-info">
          <h2 class="centered">Les línies del pla estratègic</h2>
          <div class="carousel">
          <carousel
            :perPage="1"
          >
            <slide
              v-for="banner in banners"
            >
              <img :src="'static/images/'+banner" :style="{width: carouselImageWidth, maxWidth: '900px' }" />
            </slide>
          </carousel>
          <ul class="centered">
            <li><button @click="showInfo = false" class="button">Tornar</button></li>
          </ul>
          </div>
          <!-- <h2 class="centered">Ajuda</h2>
          <ul class="centered">
            <li><button @click="showInfo = false" class="button">Tornar</button></li>
          </ul> -->
        </div>
        <div v-else class="game-cover__banner" :style="background.image"></div>
      </div>
    </div>
    <div class="game-overlay">
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
    </div>
    <canvas id="canvas"></canvas>
  </div>`,
  components: {
    carousel: VueCarousel.Carousel,
    slide: VueCarousel.Slide,
  },
  data() {
    return {
      gameLock: undefined,
      showInfo: false,
      showControls: false,
      game: null,
      waiting: false,
      gameOver: false,
      // distance: 101,
      controls: "pointer",
      done: false,
      currentBanner: Math.round(Math.random() * 9),
      banners: Array.apply(null, Array(9)).map((d, i) => `banner-${i + 1}.png`),
      colors: [
        "#3A7DF4",
        "#8F5AB5",
        "#4FADEA",
        "#4CA89E",
        "#4EAE5B",
        "#84C53B",
        "#EA436D",
        "#ED6A48",
        "#F2A33A",
      ],
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
    background() {
      return {
        color: { backgroundColor: this.colors[this.currentBanner] },
        image: {
          backgroundImage: `url(static/images/${
            this.banners[this.currentBanner]
          })`,
        },
      };
    },
    menuTitle() {
      return this.gameOver ? "Game Over" : "Menu";
    },
    carouselImageWidth() {
      return Math.min(window.innerHeight, window.innerWidth) + "px";
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
        if (!this.isTouch) window.audioObj.play();
      } else {
        if (!this.isTouch) window.audioObj.pause();
      }
    },
  },
};
