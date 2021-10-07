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
    rm -rf dist/*
    # mkdir -p vendor
    # cp node_modules/vue/dist/vue.min.js vendor/vue.min.js
    # cp node_modules/vue-router/dist/vue-router.min.js vendor/vue-router.min.js
    # cp node_modules/vue-carousel/dist/vue-carousel.min.js vendor/vue-carousel.min.js
    # cp node_modules/@turf/turf/turf.min.js vendor/turf.min.js
    # cp node_modules/proj4/dist/proj4.js vendor/proj4.js
    # cp node_modules/three/build/three.min.js vendor/three.min.js
    # cp node_modules/three/examples/js/controls/OrbitControls.js vendor/OrbitControls.js
    # cp node_modules/three/examples/js/controls/PointerLockControls.js vendor/PointerLockControls.js
    # cp node_modules/three/examples/js/loaders/GLTFLoader.js vendor/GLTFLoader.js

    # npx babel --config-file ./babel.config.json vendor --out-dir dist/vendor
    # rm -rf vendor
    # mv -f vendor dist/vendor

    cp node_modules/three/examples/fonts/helvetiker_bold.typeface.json static/helvetiker_bold.typeface.json
    cp index.html dist/
    # cp src/ie.js dist/
    npx postcss static/css/ie.css -o static/css/ie.css --use autoprefixer
}
if [[ "$command" = "install" ]]; then
    npm install
elif [[ "$command" = "develop" ]]; then
    bootstrap_dist
    webpack-cli --watch ./src --progress --mode development
elif [[ "$command" = "build" ]]; then
    bootstrap_dist
    webpack-cli build --progress --mode production
else
  echo "Unrecognized command"
fi
