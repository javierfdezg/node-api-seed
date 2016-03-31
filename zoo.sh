#!/bin/bash

if [ -f .zooconfig ]; 
then 
  source .zooconfig
fi

ask() {
    # http://djm.me/ask
    while true; do

        if [ "${2:-}" = "Y" ]; then
            prompt="Y/n"
            default=Y
        elif [ "${2:-}" = "N" ]; then
            prompt="y/N"
            default=N
        else
            prompt="y/n"
            default=
        fi

        # Ask the question - use /dev/tty in case stdin is redirected from somewhere else
        read -p "$1 [$prompt] " REPLY </dev/tty

        # Default?
        if [ -z "$REPLY" ]; then
            REPLY=$default
        fi

        # Check if the reply is valid
        case "$REPLY" in
            Y*|y*) return 0 ;;
            N*|n*) return 1 ;;
        esac

    done
}

init_aux() {

  GITHOOK_SETUP_DIR='githook-setup'

  if [ -d "$GITHOOK_SETUP_DIR" ]; then
    chmod 755 ./githook-setup/setup.sh
    ./githook-setup/setup.sh
  else
    echo "githook-setup not found. Please fix"
  fi

  chmod 755 ./docker-tools/*


  # Check if docker is installed
  echo "Checking docker..."
  echo -e -n "\tDocker binary... "
  command -v docker >/dev/null 2>&1 || { echo "docker (docker-toolbox) is not installed. Please fix." >&2; exit 1; }
  echo "found"

  # Check if there is a docker-machine
  echo -e -n "\tDocker machine... "
  if [[ "${dockerMachineCommand} ls | wc -l | tr -d ' '" -gt "1" ]]; then
    echo "found"
  else
    echo "not found"
    if ask "Create a docker machine now?" Y; then
      ./docker-tools/docker-machine-create
    else
      echo "You need a Docker machine to use this framework. Please fix"
      exit 1;
    fi
  fi

  # Pull the docker image
  echo -e -n "\tFetch Docker image... "
  ./docker-tools/docker-update-system &> /dev/null
  echo "done"

  echo -e "Setting up the framework config"

  read -p "Project name (`basename $(pwd)`): " projectName
  projectName=${projectName:-`basename $(pwd)`}
  echo "projectName=${projectName}" > .zooconfig

  # Set up the config params
  read -p "API Port (4000): " apiPort
  apiPort=${apiPort:-4000}
  echo "apiPort=${apiPort}" >> .zooconfig

  read -p "Source directory (`pwd`): " srcDir
  srcDir=${srcDir:-`pwd`}
  echo "srcDir=${srcDir}" >> .zooconfig
}

init() {

  if [ -f .zooconfig ]; 
  then
    if ask "This directory seems to have been initialized. Reinitialize?" Y; then
      init_aux
    else
      exit 1
    fi
  else
    init_aux
  fi

}

help() {
  echo "usage: $0 [command] [--help]"
  echo
  echo "Available commands:"
  echo -e "clean-images\t\tRemove all untagged images"
  echo -e "connect\t\t\tConnect to docker container"
  echo -e "init\t\t\tInitialize zoo"
  echo -e "run\t\t\tRun docker container"
  echo -e "update\t\t\tAttempt to pull a remote image and update the container"
  echo -e "upgrade\t\t\tCreate a new image and push to remote repo"
}

update() {
  ./docker-tools/docker-update-system
}

upgrade() {
  ./docker-tools/docker-image-upgrade
}

run() {
  ./docker-tools/docker-run
}

connect() {
  ./docker-tools/docker-connect $1
}

stop() {
  ./docker-tools/docker-stop
}

clean-images() {
  docker rmi $(docker images | grep "^<none>" | awk "{ print $3 }")
}

# Trap Ctrl+c and exit
trap ctrl_c INT
function ctrl_c() {
  exit 1
}

if [ "$1" != "init" ] && [ "$1" != "" ];
then
  ${dockerMachineCommand} ls | if grep --silent 'default.*Stopped'
  then
    echo "Docker VM not running."
    ${dockerMachineCommand} start default
  fi
  eval $(${dockerMachineCommand} env default)
fi

case $1 in
    init)
      init;;
    update)
      update;;
    upgrade)
      upgrade;;
    clean-images)
      clean-images;;
    run)
      run;;
    connect)
      connect bash;;
    stop)
      stop;;
    --help)
      help;;
    *)
      help;;
esac

