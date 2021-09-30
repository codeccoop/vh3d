#! /usr/bin/env bash

cd "$(dirname "$(readlink -f $0)")"

arg=$1

if [[ -z "$arg" ]]; then
  echo
  echo -e "\e[1m   SERVER CONTROLS \e[0m"
  echo " welcome to wsgi API"
  echo
  echo -e "  \e[4mcommands:\e[0m"
  echo "   · install"
  echo "   · develop"
  echo "   · build"
  echo
  echo "Feed a command:";read command
else
  command=$arg
fi

function bootstrap_dist() {
    mkdir -p dist/vendor
    cp node_modules/vue/dist/vue.min.js dist/vendor/vue.min.js
    cp node_modules/vue-router/dist/vue-router.min.js dist/vendor/vue-router.min.js
    cp node_modules/vue-carousel/dist/vue-carousel.min.js dist/vendor/vue-carousel.min.js
    cp node_modules/@turf/turf/turf.min.js dist/vendor/turf.min.js
    cp node_modules/proj4/dist/proj4.js dist/vendor/proj4.js
    cp node_modules/three/build/three.min.js dist/vendor/three.min.js
    cp node_modules/three/examples/js/controls/OrbitControls.js dist/vendor/OrbitControls.js
    cp node_modules/three/examples/js/controls/PointerLockControls.js dist/vendor/PointerLockControls.js
    cp node_modules/three/examples/js/loaders/GLTFLoader.js dist/vendor/GLTFLoader.js
    cp node_modules/three/examples/fonts/helvetiker_bold.typeface.json dist/vendor/helvetiker_bold.typeface.json

    cp -r static dist/
    cp -r data dist/

    cp index.html dist/
}
if [[ "$command" = "install" ]]; then
    npm install
elif [[ "$command" = "develop" ]]; then
    bootstrap_dist
    npx babel --watch src --out-dir dist
elif [[ "$command" = "build" ]]; then
    bootstrap_dist
    npx babel src --out-dir dist
else
  echo "Unrecognized command"
fi
