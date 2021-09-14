export default {
  template: `<div id="cover">
    <header><img src="/static/images/logo-vh.png" class="logo"></header>
    <main class="text">
      <h1>Beinvingut/da</h1>
      <p>Fer el nou Vall d'Hebron és una cosa molt seria. Per això, la millor forma de començar és jugant. Ens agradaria convidar-te a participar en un joc de construcció que només podrem completar si hi participem tots. Es tracta d'un puzzle. Tu, com a membre de la familia de Vall d'Hebron, tens una peça. La resta de peces són en mans dels teus companys i companyes. Només si tots hi posem la nostra peça aconseguirem descobrir la imatge que s'amaga en el puzzle.</p>
      <h3>Juguem?</h3>
      <p>La forma de participar és molt senzilla. Quan cliquis en el botó de jugar t'apareixerà una imatge virtual aèria del campus de la Vall d'Hebron. El reconeixeràs de seguida. Al costat vueràs les instruccions del joc i els comandaments o "tecles" que et permetran moure't pel campus.</p>
      <p v-if="pieceId" class="enter-btn"><router-link :to="{path: '/game', query: { pieceId: pieceId }}" ><button class="button black">Jugar</button></router-link></p>
      <img src="/static/images/piece-blue.png" class="piece" />
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
