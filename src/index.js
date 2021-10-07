// import "core-js/es"
// import "regenerator-runtime/runtime";

// import Vue from 'vue'
import Vue from 'vue/dist/vue.esm.browser'
import VueRouter from 'vue-router'
import Cover from "./views/Cover.vue";
import Game from "./views/Game.vue";

Vue.use(VueRouter);

const routes = [
  { path: "/", name: "cover", component: Cover },
  { path: "/game", name: "game", component: Game },
  { path: "/game/resume", name: "resume", component: Game },
]

const router = new VueRouter({ routes });

new Vue({
  router,
  template: '<div id="app"><router-view></router-view></div>'
}).$mount('#app')

// window.console.warn = function () {};

window.audioObj = new Audio("/static/multimedia/soundtrack.mp3");