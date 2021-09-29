import Game from "../game/index.js";
var controlsTimeout;
var submitTimeout;
export default {
  template: `<div id="game">
    <div v-if="(!gameLock && !done) || waiting" class="game-cover" >
      <img src="/static/images/pla-estrategic--white.svg" class="logo-pla"/>
      <img src="/static/images/logo-vh--white.png" class="logo-vh"/>
      <div v-if="waiting === true" class="game-cover__loader">Carregant...</div>
      <div v-if="waiting === false" class="game-cover__menu-wrapper">
        <div class="game-cover__menu">
          <template v-if="!isResume">
            <div v-if="!gameOver" class="introduction">
              <p>El lloc indicat com a “sortida” és on apareixeràs amb la teva peça quan cliquis en el botó de JUGAR.</p>
              <p>La teva missió és portar la peça fins al puzle on està la paraula “arribada” i, allà, buscar el lloc que li correspon. Per fer-ho, hauràs de seguir l’ombra vermella de la teva peça que t’indicarà el camí. Quan l’ombra es torni verda hauràs trobat el lloc. Clica la tecla "Enter" per col·locar la peça.</p>
            </div>
            <h2 class="centered menu-title">{{ menuTitle }}</h2>
            <ul class="centered menu-list">
              <li v-if="!gameOver && !started"><button @click="gameLock = true" class="button">{{ isTouch ? 'Explorar' : 'Jugar' }}</button></li>
              <li v-if="!gameOver && started"><button @click="gameLock = true" class="button">{{ isTouch ? 'Explorar' : 'Continuar' }}</button></li>
              <li v-if="started && !isTouch"><button @click="restart" class="button">Reiniciar</button></li>
              <li><button @click="exit" class="button">Sortir</button></li>
              <li><button @click="showInstructions = true" class="button broad">Comandaments</button></li>
            </ul>
          </template>
          <template v-else>
            <h3 class="overview-message">Així ha quedat el puzle que hem fet entre tots i totes.</h3>
            <ul class="centered menu-list">
              <li><button @click="goToGame" class="button">Vols jugar?</button></li>
            </ul>
          </template>
        </div>
        <div v-if="showInstructions" class="game-cover__instructions">
          <h5 class="instructions-title">AQUESTS SÓN ELS COMANDAMENTS QUE HAS D'UTILITZAR:<i @click="showInstructions = false"/></h5>
          <div class="controls">
            <div class="control move">
              <div class="icon">
              <img src="/static/images/arrows-icon.svg"/>
              <img src="/static/images/wasd-icon.svg"/>
              </div>
              <p>Per moure't pel campus i pel puzle has d'utilitzar les fletxes o aquestes lletres, el que prefereixis</p>
            </div>
            <div class="control action">
              <div class="icon"><img src="/static/images/enter-icon.svg"/></div>
              <p>Per col·locar la teva peça quan arribis al lloc que li correspon</p>
            </div>
            <label class="general">Durant tot el joc pots utilitzar aquests comandaments:</label>
            <div class="control map">
              <div class="icon"><img src="/static/images/map-icon.svg"/></div>
              <p>Per anar al mapa i veure on ets</p>
            </div>
            <div class="control menu">
              <div class="icon"><img src="/static/images/esc-icon.svg"/></div>
              <p>Per pausar el joc i tornar al menu</p>
            </div>
            <div class="control help">
              <div class="icon"><img src="/static/images/help-icon.svg"/></div>
              <p>Per veure un resum dels controls</p>
            </div>
            <label class="map">Si surts del joc i vas al mapa hauràs d'utilitzar el ratolí:</label>
            <div class="control orbit">
              <div class="icon"><img src="/static/images/left-click-icon.svg"/></div>
              <p>Per voltejar el mapa</p>
            </div>
            <div class="control pan">
              <div class="icon"><img src="/static/images/right-click-icon.svg"/></div>
              <p>Per desplaçar el mapa</p>
            </div>
            <div class="control zoom">
              <div class="icon"><img src="/static/images/zoom-icon.svg"/></div>
              <p>Per apropar o allunyar el mapa</p>
            </div>
          </div>
        </div>
        <div v-if="!(isTouch || isResume)" class="game-cover__map" ref="coverMap">
          <canvas id="coverMap"></canvas>
        </div>
        <div v-else class="game-cover__video" ref="gameVideo">
          <video ref="resume" v-if="isResume" id="resume" autoplay muted playsinline>
            <source src="/static/resume.mp4"></source>
            El teu navegador no pot reproduir videos amb HTML.
          </video>
        </div>
      </div>
    </div>
    <div class="game-overlay">
      <div v-if="gameLock && isTouch" @click="gameLock = false" class="is-touch-unlocker"></div>
      <div v-if="!isTouch" class="controls-highlights" :class="{'hidden': !showControls}">
        <ul v-if="controls === 'pointer'" class="centered">
          <li class="movement"><div class="icon"><p><strong>Fletxes</strong><br/>per desplaçar-se</p></div></li>
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
    <div ref="modal" v-if="done" class="done-modal">
       <div class="form">
         <div class="fieldset">
           <p>
             <label>Nom i cognoms</label>
             <input v-model="userName" type="text" id="nameInput"/>
           </p>
           <p>
             <label>A quina direcció/unitat/servei pertanys?</label>
             <input v-model="userArea" type="text" id="areaInput"/>
           </p>
           <p>
             <label>Mira el video que hi ha en aquest enllaç</label>
             <a @click="showVideo"><button id="videoBtn" class="button">VIDEO</button></a>
             <label>I diga'ns en quínes línies estratègiques creus que la teva aportació és més important.</label>
           </p>
           <p><textarea v-model="userOpinion"></textarea></p>
           <button class="restart-btn button" @click="location.reload()">Tornar a jugar</button>
         </div>
       </div>
       <div class="done-modal__image">
          <div class="img-wrapper">
            <img :src="doneImageSrc" />
            <div class="image-radio">
              <div class="radio-btn" :class="{active: !doneImage}" @click="doneImage = false"></div>
              <div class="radio-btn" :class="{active: doneImage}" @click="doneImage = true"></div>
            </div>
          </div>
          <button class="submit-btn button" :class="{disabled: !(userName && userArea && userOpinion)}">Enviar</button>
          <button class="restart-btn button" @click="location.reload()">Tornar a jugar</button>
       </div>
    </div>
    <canvas id="canvas"></canvas>
  </div>`,
  components: {
    carousel: VueCarousel.Carousel,
    slide: VueCarousel.Slide
  },

  data() {
    return {
      started: false,
      gameLock: undefined,
      showControls: false,
      showInstructions: false,
      game: null,
      waiting: false,
      gameOver: false,
      controls: "pointer",
      done: false,
      userName: null,
      userArea: null,
      userOpinion: null,
      doneImage: false
    };
  },

  beforeMount() {
    fetch("/piece/" + this.pieceId).then(res => res.json()).then(data => {
      this.game = new Game(document.getElementById("canvas"), data, this.isTouch ? "touch" : "pointer");

      if (!(this.isTouch || this.isResume)) {
        this.coverMap = new Game(document.getElementById("coverMap"), data, "cover");
        this.coverMap.bind();
      } else {
        this.game.bind();
      }
    }).catch(err => console.error("Error while fetching the piece"));
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
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    isResume() {
      return this.$route.name === "resume";
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

    doneImageSrc() {
      return "/puzzle/" + (this.doneImage === true ? 0 : 9001); // this.pieceId);
    }

  },
  methods: {
    exit() {
      this.game.unbind();
      this.$router.push({
        path: "/",
        query: {
          pieceId: this.pieceId
        }
      });
    },

    onGameUnlock() {
      this.gameLock = false;
    },

    onHelp(ev) {
      clearTimeout(controlsTimeout);
      this.controls = ev.detail.target;
      this.showControls = true;
      controlsTimeout = setTimeout(_ => this.showControls = false, ev.detail.timeout || 7000);
    },

    restart() {
      this.game.unbind();
      this.game = new Game(this.game.canvas, this.game.playerData, this.isTouch ? "orbit" : "pointer");
      this.started = false;
      this.gameOver = false;
      this.showInstructions = false;
      this.gameLock = true;
    },

    onGameOver() {
      this.gameOver = true;
    },

    onDone() {
      this.done = true;
      this.game.unbind();
      fetch(`piece/${this.pieceId}`, {
        method: "POST"
      }).then(res => {
        res.json().then(data => {
          if (data["success"]) {
            this.$nextTick(() => {
              this.$refs.modal.classList.add("visible");
            });
          }
        });
      });
    },

    submitForm(field, value) {
      clearTimeout(submitTimeout);
      submitTimeout = setTimeout(() => {
        fetch("/form/" + this.pieceId, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            field: field,
            value: value
          })
        });
      }, 500);
    },

    showVideo() {
      window.addEventListener("popstate", event => {
        console.log("location: " + document.location + ", state: " + JSON.stringify(event.state));
      });
      window.open("https://www.vallhebron.com/ca");
    },

    goToGame() {
      window.open("/#/game/?pieceId=" + (this.pieceId != null ? this.pieceId : Math.ceil(Math.random() * 9000)));
    }

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
          /* controlsTimeout = setTimeout(
            () => (self.showControls = false),
            10000
          ); */

          if (!(self.isTouch || self.isResume)) {
            self.coverMap.unbind();
            window.audioObj.play();
          }

          self.game.bind();
          self.game.scene.state.mode = self.isTouch ? "orbit" : "pointer";
          self.onHelp({
            detail: {
              target: "pointer",
              timeout: 14000
            }
          });
        } else {
          if (!(self.isTouch || self.isResume)) {
            self.$nextTick(() => {
              self.$refs.coverMap.removeChild(self.$refs.coverMap.children[0]);
              self.$refs.coverMap.innerHTML = '<canvas id="coverMap"></canvas>';
              self.coverMap = new Game(document.getElementById("coverMap"), self.coverMap.playerData, "cover");
              self.coverMap.bind();
            });
            window.audioObj.pause();
            window.audioObj.currentTime = 0;
          }

          self.game.unbind();
        }
      }, 1000);
      if (!(self.isTouch || self.isResume)) self.coverMap.lock(!to);
      self.game.lock(to);
    },

    userName(to) {
      this.submitForm("name", to);
    },

    userArea(to) {
      this.submitForm("area", to);
    },

    userOpinion(to) {
      this.submitForm("opinion", to);
    }

  }
};