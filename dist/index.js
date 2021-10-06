import Cover from "./views/Cover.js";
import Game from "./views/Game.js";
Vue.use(VueRouter);
Vue.use(VueCarousel);
var router = new VueRouter({
  routes: [{
    path: "/",
    name: "cover",
    component: Cover
  }, {
    path: "/game",
    name: "game",
    component: Game
  }, {
    path: "/game/resume",
    name: "resume",
    component: Game
  }]
});
var vm = new Vue({
  router: router
}).$mount("#app");

window.console.warn = function () {};