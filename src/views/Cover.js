export default {
  template: `<div id="cover">
    <header>
      <img src="/static/images/pla-estrategic--blue.svg" class="logo-pla">
      <img src="/static/images/logo-vh--blue.png" class="logo-vh">
    </header>
    <main class="text">
      <h1>Benvingut, Benvinguda</h1>
      <p>Ens agradaria convidar-te a participar en un joc de construcció que només podrem completar si hi participem tots i totes. Es tracta d’un puzle. Tu, com a membre del Vall d’Hebron, tens una peça. La resta de peces són en mans dels teus companys i companyes. Només si tots i totes hi posem la nostra peça aconseguirem descobrir la imatge que s’amaga en el puzle.</p>
      <h3>Juguem?</h3>
      <p>La forma de participar-hi és molt senzilla. Quan cliquis al botó de jugar, t’apareixerà una imatge virtual aèria del campus del Vall d’Hebron. El reconeixeràs de seguida. Al costat veuràs les instruccions del joc i els comandaments o tecles que et permetran moure’t pel campus.</p>
      <p v-if="pieceId" class="enter-btn"><router-link :to="{path: '/game', query: { pieceId: pieceId }}" ><button class="button black">Jugar</button></router-link></p>
      <img src="/static/images/piece-blue.png" class="piece" />
    </main>
    <div id="disclaimer" v-if="showDisclaimer">
      <div class="text">
        <h1 class="centered">Avís</h1>
        <p>Sembla que has accedit al joc des d'un dispositiu tàctil. En cas que sigui un mòbil o una tauleta, t'informem que el joc no està preparat per aquest tipus de dispositius i només ofereix funcionalitats limitades, com poder navegar pel mapa. Si vols participar del joc, et convidem a visitar de nou l'enllaç des d'un ordinador. Si només vols fer un vol pel mapa, pots continuar sense problemes.</p>
        <p class="centered"><button @click="showDisclaimer = false" class="button">Acceptar</button></p>
      </div>
    </div>
    <footer></footer>
  </div>`,
  data() {
    return {
      showDisclaimer: false,
    };
  },
  computed: {
    isTouch() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    },
    pieceId() {
      return this.$route.query.pieceId > 0 && this.$route.query.pieceId <= 9000
        ? this.$route.query.pieceId
        : null;
    },
  },
  watch: {
    isTouch: {
      immediate: true,
      handler(to, from) {
        if (to) {
          this.showDisclaimer = true;
        }
      },
    },
  },
};
