import Cover from "./views/Cover.js";
import Game from "./views/Game.js";

Vue.use(VueRouter);
Vue.use(VueCarousel);

const router = new VueRouter({
  routes: [
    { path: "/", name: "cover", component: Cover },
    { path: "/game", name: "game", component: Game },
    { path: "/game/resume", name: "resume", component: Game },
  ],
});

const vm = new Vue({
  router: router,
}).$mount("#app");

window.console.warn = function () {};
