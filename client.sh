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

    cp node_modules/three/examples/fonts/helvetiker_bold.typeface.json static/helvetiker_bold.typeface.json
    # cp index.html dist/
    npx postcss static/css/ie.css -o static/css/ie.css --use autoprefixer
}
if [[ "$command" = "install" ]]; then
    npm install
elif [[ "$command" = "develop" ]]; then
    bootstrap_dist
    NODE_ENV=development webpack-cli --watch ./src --progress --mode development
elif [[ "$command" = "build" ]]; then
    bootstrap_dist
    NODE_ENV=production webpack-cli build --progress --mode production
else
  echo "Unrecognized command"
fi
