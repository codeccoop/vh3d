export default {
  template: "<div id=\"cover\">\n    <header>\n      <img src=\"/static/images/pla-estrategic--blue.svg\" class=\"logo-pla\">\n      <img src=\"/static/images/logo-vh--blue.png\" class=\"logo-vh\">\n    </header>\n    <main class=\"text\">\n      <h1>Benvingut, Benvinguda</h1>\n      <p>Ens agradaria convidar-te a participar en un joc de construcci\xF3 que nom\xE9s podrem completar si hi participem tots i totes. Es tracta d\u2019un puzle. Tu, com a membre del Vall d\u2019Hebron, tens una pe\xE7a. La resta de peces s\xF3n en mans dels teus companys i companyes. Nom\xE9s si tots i totes hi posem la nostra pe\xE7a aconseguirem descobrir la imatge que s\u2019amaga en el puzle.</p>\n      <h3>Juguem?</h3>\n      <p>La forma de participar-hi \xE9s molt senzilla. Quan cliquis al bot\xF3 de jugar, t\u2019apareixer\xE0 una imatge virtual a\xE8ria del campus del Vall d\u2019Hebron. El reconeixer\xE0s de seguida. Al costat veur\xE0s les instruccions del joc i els comandaments o tecles que et permetran moure\u2019t pel campus.</p>\n      <p v-if=\"pieceId\" class=\"enter-btn\"><router-link :to=\"{path: '/game', query: { pieceId: pieceId }}\" ><button class=\"button black\">Jugar</button></router-link></p>\n      <img src=\"/static/images/piece-blue.png\" class=\"piece\" />\n    </main>\n    <div id=\"disclaimer\" v-if=\"showDisclaimer\">\n      <div class=\"text\">\n        <h1 class=\"centered\">Av\xEDs</h1>\n        <p>Sembla que has accedit al joc des d'un dispositiu t\xE0ctil. En cas que sigui un m\xF2bil o una tauleta, t'informem que el joc no est\xE0 preparat per aquest tipus de dispositius i nom\xE9s ofereix funcionalitats limitades, com poder navegar pel mapa. Si vols participar del joc, et convidem a visitar de nou l'enlla\xE7 des d'un ordinador. Si nom\xE9s vols fer un vol pel mapa, pots continuar sense problemes.</p>\n        <p class=\"centered\"><button @click=\"showDisclaimer = false\" class=\"button\">Acceptar</button></p>\n      </div>\n    </div>\n    <footer></footer>\n  </div>",
  data: function data() {
    return {
      showDisclaimer: false
    };
  },
  computed: {
    isTouch: function isTouch() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    pieceId: function pieceId() {
      return this.$route.query.pieceId > 0 && this.$route.query.pieceId <= 9000 ? this.$route.query.pieceId : null;
    }
  },
  watch: {
    isTouch: {
      immediate: true,
      handler: function handler(to, from) {
        if (to) {
          this.showDisclaimer = true;
        }
      }
    }
  }
};