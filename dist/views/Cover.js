export default {
  template: `<div id="cover" >
    <header><h3>Vall d'Hebron 3D</h3></header>
    <main class="text">
      <h1>Beinvingut/da</h1>
      <p>A continuació et presentem un petit joc que només podrem completar si tots i totes hi participem. Es tracta d'un puzzle col·laboratiu. Tu, com a membre de la familia de la Vall d'Hebrón, tens una peça, la resta de peces són en mans de les teves companyes. Ajudales a completar el puzzle i desentrallem l'enigma: Quina serà l'imàtge que s'hi recull amagada entre les peces?</p>
      <h3>Instruccions</h3>
      <p>Al entrar al joc apareixeras al campus de la Vall d'Hebron, amb una peça entre les mans. El primer que hauràs de fer es trobar, dins del campus, on es que s'està montant el puzzle. A continuació hauràs d'esbrinar el lloc de la teva peça i col·locar-la correctament. Tens, a la teva disposició, un mapa del campús, el teu coneixiement de les instal·lacions, i el teu enginy. Tens llibertat per passejar-te i explorar sense límits, a través del mon, o a través del mapa, per completar la teva missió. I recorda, necessitem la teva peça!</p>
      <p><router-link :to="{path: '/game', query: { pieceId: pieceId }}" ><button class="button black">Jugar</button></router-link></p>
    </main>
    <div id="disclaimer" v-if="showDisclaimer">
      <div class="text">
        <h1 class="centered">Avís</h1>
        <p>Sembla que has accedit al joc des d'un dispositiu tàctil. En cas que sigui un mòbil o una tauleta, t'informem que el joc no està preparat per aquest tipus de dispositius i només ofereix funcionalitats limitades, com poder navegar pel mapa. Si vols participar del joc et convidem a visitar de nou el joc des d'un ordinador. Si només vols fer un vol pel mapa, pots continuar sense problemes.</p>
        <p class="centered"><button @click="showDisclaimer = false" class="button black">Acceptar</button></p>
      </div>
    </div>
    <footer></footer>
  </div>`,

  data() {
    return {
      showDisclaimer: false
    };
  },

  computed: {
    isTouch() {
      return "touchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0 || window.innerWidth < window.innerHeight;
    },

    pieceId() {
      return Math.round(Math.random() * 9000);
    }

  },
  watch: {
    isTouch: {
      immediate: true,

      handler(to, from) {
        if (to) {
          this.showDisclaimer = true;
        }
      }

    }
  }
};