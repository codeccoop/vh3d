function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

import Game from "../game/index.js";
var controlsTimeout;
var submitTimeout;
export default {
  template: "<div id=\"game\">\n    <div v-if=\"(!gameLock && !done) || waiting\" class=\"game-cover\" >\n      <img src=\"/static/images/pla-estrategic--white.svg\" class=\"logo-pla\"/>\n      <img src=\"/static/images/logo-vh--white.png\" class=\"logo-vh\"/>\n      <div v-if=\"waiting === true\" class=\"game-cover__loader\">Carregant...</div>\n      <div v-if=\"waiting === false\" class=\"game-cover__menu-wrapper\">\n        <div class=\"game-cover__menu\">\n          <template v-if=\"!isResume\">\n            <div v-if=\"!gameOver\" class=\"introduction\">\n              <p>El lloc indicat com a \u201Csortida\u201D \xE9s on apareixer\xE0s amb la teva pe\xE7a quan cliquis al bot\xF3 de JUGAR.</p>\n              <p>La teva missi\xF3 \xE9s portar la pe\xE7a fins al puzle on hi ha la paraula \u201Carribada\u201D i, all\xE0, buscar el lloc que li correspon. Per fer-ho, haur\xE0s de seguir l\u2019ombra vermella de la teva pe\xE7a, que t\u2019indicar\xE0 el cam\xED. Quan l\u2019ombra es torni verda, haur\xE0s trobat el lloc. Clica la tecla \u201CEnter\u201D per col\xB7locar la pe\xE7a.</p>\n            </div>\n            <h2 class=\"centered menu-title\">{{ menuTitle }}</h2>\n            <ul class=\"centered menu-list\">\n              <li v-if=\"!gameOver && !started\"><button @click=\"gameLock = true\" class=\"button\">{{ isTouch ? 'Explorar' : 'Jugar' }}</button></li>\n              <li v-if=\"!gameOver && started\"><button @click=\"gameLock = true\" class=\"button\">{{ isTouch ? 'Explorar' : 'Continuar' }}</button></li>\n              <li v-if=\"started && !isTouch\"><button @click=\"restart\" class=\"button\">Reiniciar</button></li>\n              <li><button @click=\"exit\" class=\"button\">Sortir</button></li>\n              <li><button @click=\"showInstructions = true\" class=\"button broad\">Comandaments</button></li>\n            </ul>\n          </template>\n          <template v-else>\n            <h3 class=\"overview-message\">Aix\xED ha quedat el puzle que hem fet entre tots i totes.</h3>\n            <ul class=\"centered menu-list\">\n              <li><button @click=\"goToGame\" class=\"button\">Vols jugar?</button></li>\n            </ul>\n          </template>\n        </div>\n        <div v-if=\"showInstructions\" class=\"game-cover__instructions\">\n          <h5 class=\"instructions-title\">AQUESTS S\xD3N ELS COMANDAMENTS QUE HAS D'UTILITZAR:<i @click=\"showInstructions = false\"/></h5>\n          <div class=\"controls\">\n            <div class=\"control move\">\n              <div class=\"icon\">\n              <img src=\"/static/images/arrows-icon.svg\"/>\n              <img src=\"/static/images/wasd-icon.svg\"/>\n              </div>\n              <p>Per moure\u2019t pel campus i pel puzle, has d\u2019utilitzar les fletxes o aquestes lletres, el que prefereixis.</p>\n            </div>\n            <div class=\"control action\">\n              <div class=\"icon\"><img src=\"/static/images/enter-icon.svg\"/></div>\n              <p>Per col\xB7locar la teva pe\xE7a quan arribis al lloc que li correspon.</p>\n            </div>\n            <label class=\"general\">Durant tot el joc pots utilitzar aquests comandaments:</label>\n            <div class=\"control map\">\n              <div class=\"icon\"><img src=\"/static/images/map-icon.svg\"/></div>\n              <p>Per anar al mapa i veure on ets.</p>\n            </div>\n            <div class=\"control menu\">\n              <div class=\"icon\"><img src=\"/static/images/esc-icon.svg\"/></div>\n              <p>Per aturar el joc i tornar al men\xFA.</p>\n            </div>\n            <div class=\"control help\">\n              <div class=\"icon\"><img src=\"/static/images/help-icon.svg\"/></div>\n              <p>Per veure un resum dels controls.</p>\n            </div>\n            <label class=\"map\">Si surts del joc i vas al mapa, haur\xE0s d\u2019utilitzar el ratol\xED:</label>\n            <div class=\"control orbit\">\n              <div class=\"icon\"><img src=\"/static/images/left-click-icon.svg\"/></div>\n              <p>Per voltejar el mapa.</p>\n            </div>\n            <div class=\"control pan\">\n              <div class=\"icon\"><img src=\"/static/images/right-click-icon.svg\"/></div>\n              <p>Per despla\xE7ar el mapa.</p>\n            </div>\n            <div class=\"control zoom\">\n              <div class=\"icon\"><img src=\"/static/images/zoom-icon.svg\"/></div>\n              <p>Per apropar o allunyar el mapa.</p>\n            </div>\n          </div>\n        </div>\n        <div v-if=\"!(isTouch || isResume)\" class=\"game-cover__map\" ref=\"coverMap\">\n          <canvas id=\"coverMap\"></canvas>\n        </div>\n        <div v-else class=\"game-cover__video\" ref=\"gameVideo\">\n          <video ref=\"resume\" v-if=\"isResume\" id=\"resume\" autoplay muted playsinline>\n            <source src=\"/static/multimedia/resume.mp4\"></source>\n            El teu navegador no pot reproduir videos amb HTML.\n          </video>\n        </div>\n      </div>\n    </div>\n    <div class=\"game-overlay\">\n      <div v-if=\"gameLock && isTouch\" @click=\"gameLock = false\" class=\"is-touch-unlocker\"></div>\n      <div v-if=\"!isTouch\" class=\"controls-highlights\" :class=\"{'hidden': !showControls}\">\n        <ul v-if=\"controls === 'pointer'\" class=\"centered\">\n          <li class=\"movement\"><div class=\"icon\"><p><strong>Fletxes</strong><br/>per despla\xE7ar-se.</p></div></li>\n          <li class=\"jump\"><div class=\"icon\"><p><strong>Barra espaiadora</strong><br/>per saltar.</p></div></li>\n          <li class=\"camera\"><div class=\"icon\"><p><strong>Ratol\xED</strong><br/>per moure la c\xE0mera.</p></div></li>\n          <li class=\"enter\"><div class=\"icon\"><p><strong>\u201CEnter\u201D</strong><br/>per col\xB7locar la pe\xE7a.</p></div></li>\n        </ul>\n        <ul v-else=\"controls === 'orbit'\" class=\"centered\">\n          <li class=\"orbit\"><div class=\"icon\"><p><strong>Click esquerra</strong><br/>per rotar.</p></div></li>\n          <li class=\"pan\"><div class=\"icon\"><p><strong>Click dret</strong><br/>per despla\xE7ar.</p></div></li>\n          <li class=\"zoom\"><div class=\"icon\"><p><strong>Scroll</strong><br/>pel zoom.</p></div></li>\n        </ul>\n      </div>\n      <aside v-if=\"gameLock && !isTouch\" class=\"game-aside left\">\n        <ul class=\"centered\">\n          <li class=\"escape\"><div class=\"icon\"><p><strong>Men\xFA</strong></p></div></li>\n          <li class=\"map\"><div class=\"icon\"><p><strong>Mapa</strong></p></div></li>\n          <li class=\"help\"><div class=\"icon\"><p><strong>Controls</strong></p></div></li>\n        </ul>\n      </aside>\n    </div>\n    <div ref=\"modal\" v-if=\"done\" class=\"done-modal\">\n       <div class=\"form\">\n         <div class=\"fieldset\">\n           <p>\n             <label>Nom i cognoms</label>\n             <input v-model=\"userName\" type=\"text\" class=\"name\"/>\n           </p>\n           <p>\n             <label>A quina direcci\xF3/unitat/servei pertanys?</label>\n             <input v-model=\"userArea\" type=\"text\" class=\"area\"/>\n           </p>\n           <p>\n             <label>Mira el v\xEDdeo que hi ha en aquest enlla\xE7.</label>\n             <a @click=\"showVideo\"><button id=\"videoBtn\" class=\"button\">VIDEO</button></a>\n             <label>I digue'ns en qu\xEDnes l\xEDnies estrat\xE8giques creus que la teva aportaci\xF3 \xE9s m\xE9s important.</label>\n           </p>\n           <p><textarea v-model=\"userOpinion\" class=\"opinion\"></textarea></p>\n           <button class=\"restart-btn button\" @click=\"location.reload()\">Tornar a jugar</button>\n         </div>\n       </div>\n       <div class=\"done-modal__image\">\n          <div class=\"img-wrapper\">\n            <img :src=\"doneImageSrc\" />\n          </div>\n          <button class=\"submit-btn button\" @click=\"sent\" :class=\"{disabled: !(userName && userArea && userOpinion)}\">Enviar</button>\n          <button class=\"restart-btn button\" @click=\"location.reload()\">Tornar a jugar</button>\n       </div>\n    </div>\n    <canvas id=\"canvas\"></canvas>\n  </div>",
  components: {
    carousel: VueCarousel.Carousel,
    slide: VueCarousel.Slide
  },
  data: function data() {
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
  beforeMount: function beforeMount() {
    var _this = this;

    fetch("/piece/" + this.pieceId).then(function (res) {
      return res.json();
    }).then(function (data) {
      _this.game = new Game(document.getElementById("canvas"), data, _this.isTouch ? "touch" : "pointer");

      if (!(_this.isTouch || _this.isResume)) {
        _this.coverMap = new Game(document.getElementById("coverMap"), data, "cover");

        _this.coverMap.bind();
      } else {
        _this.game.bind();
      }
    }).catch(function (err) {
      return console.error("Error while fetching the piece");
    });
    this.controls = this.isTouch ? "orbit" : "pointer";
  },
  mounted: function mounted() {
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
    isTouch: function isTouch() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    isResume: function isResume() {
      return this.$route.name === "resume";
    },
    pieceId: function pieceId() {
      return this.$route.query.pieceId;
    },
    menuTitle: function menuTitle() {
      return this.gameOver ? "Game Over" : "Menú";
    },
    carouselImageWidth: function carouselImageWidth() {
      return Math.min(window.innerHeight, window.innerWidth) + "px";
    },
    doneImageSrc: function doneImageSrc() {
      return "/puzzle/0";
    }
  },
  methods: {
    exit: function exit() {
      this.game.unbind();
      this.$router.push({
        path: "/",
        query: {
          pieceId: this.pieceId
        }
      });
    },
    onGameUnlock: function onGameUnlock() {
      this.gameLock = false;
    },
    onHelp: function onHelp(ev) {
      var _this2 = this;

      clearTimeout(controlsTimeout);
      this.controls = ev.detail.target;
      this.showControls = true;
      controlsTimeout = setTimeout(function (_) {
        return _this2.showControls = false;
      }, ev.detail.timeout || 7000);
    },
    restart: function restart() {
      this.game.unbind();
      this.game = new Game(this.game.canvas, this.game.playerData, this.isTouch ? "orbit" : "pointer");
      this.started = false;
      this.gameOver = false;
      this.showInstructions = false;
      this.gameLock = true;
    },
    onGameOver: function onGameOver() {
      this.gameOver = true;
    },
    onDone: function onDone() {
      var _this3 = this;

      this.done = true;
      this.game.unbind();
      fetch("piece/".concat(this.pieceId), {
        method: "POST"
      }).then(function (res) {
        res.json().then(function (data) {
          if (data["success"]) {
            _this3.$nextTick(function () {
              _this3.$refs.modal.classList.add("visible");
            });
          }
        });
      });
    },
    sent: function sent() {
      var _iterator = _createForOfIteratorHelper(this.$el.querySelectorAll(".form p input")),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var input = _step.value;
          input.classList.add("sent");
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      this.$el.querySelector(".form p textarea").classList.add("sent");
    },
    submitForm: function submitForm(field, value, el) {
      var _this4 = this;

      clearTimeout(submitTimeout);
      submitTimeout = setTimeout(function () {
        fetch("/form/" + _this4.pieceId, {
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
      el.classList.remove("sent");
    },
    showVideo: function showVideo() {
      window.addEventListener("popstate", function (event) {
        console.log("location: " + document.location + ", state: " + JSON.stringify(event.state));
      });
      fetch("/static/resources.json").then(function (res) {
        res.json().then(function (config) {
          window.open(config.VIDEO_URL);
        }); // window.open("https://www.vallhebron.com/ca");
      });
    },
    goToGame: function goToGame() {
      window.open("/#/game/?pieceId=" + (this.pieceId != null ? this.pieceId : Math.ceil(Math.random() * 9000)));
    }
  },
  watch: {
    gameLock: function gameLock(to, from) {
      var self = this;
      self.waiting = true;
      setTimeout(function () {
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
            self.$nextTick(function () {
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
    userName: function userName(to) {
      var el = this.$el.querySelector(".form p input.name");
      this.submitForm("name", to, el);
    },
    userArea: function userArea(to) {
      var el = this.$el.querySelector(".form p input.area");
      this.submitForm("area", to, el);
    },
    userOpinion: function userOpinion(to) {
      var el = this.$el.querySelector(".form p textarea.opinion");
      this.submitForm("opinion", to, el);
    }
  }
};