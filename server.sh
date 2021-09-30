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
  echo "   · database"
  echo -e "   · serve \e[31m\e[3m[development]\e[0m\e[0m"
  echo -e "   · run \e[31m\e[3m[production]\e[0m\e[0m"
  echo -e "   · stop \e[31m\e[3m[production]\e[0m\e[0m"
  echo -e "   · dist \e[31m\e[3m[production]\e[0m\e[0m"
  echo
  echo "Feed a command:";read command
else
  command=$arg
fi

function bundle() {
  zip vh3d.zip \
	  dist \
	  log \
	  static \
	  app.py \
	  gunicorn.conf.py \
	  init_db.py \
	  requirements.txt \
	  secret.py \
	  server.sh
}

if [[ "$command" = "install" ]]; then
  pip3 install -r requirements.txt
elif [[ "$command" = "serve" ]]; then
  python3 app.py
elif [[ "$command" = "run" ]]; then
  if [[ -e process.pid ]]; then
     kill $(cat process.pid)
  fi
  gunicorn -c config/gunicorn.conf.py &
  echo "server are running inside the gunicorn container"
elif [[ "$command" = "stop" ]]; then
  if [[ -e process.pid ]]; then
    pid="$(cat process.pid)"
    kill -8 $pid
    rm process.pid
  fi
  echo "Process $pid was stopped"
elif [[ "$command" = "database" ]]; then
	python3 init_db.py
	echo "Database has been initialized"
elif [[ "$command" = "dist" ]]; then
	bundle
else
  echo "Unrecognized command"
fi
