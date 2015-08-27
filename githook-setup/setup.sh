#!/bin/bash

# Assuming that the project dir is one level up the script file
SETUP_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

# Leave blank if you're no using submodules (or don't want to watch them)
WATCHED_MODULES=""
REPO_HOOKS="$SETUP_DIR/hooks-wrapper"

# If this repo is not a submodule...
if [ -d .git ]; then

  GIT_BASE=.git
  HOOK_DIR=$GIT_BASE/hooks
  HOOK_DIR_BACKUP=$HOOK_DIR/old

  if [ ! -d $HOOK_DIR_BACKUP ]; then
    mkdir $HOOK_DIR_BACKUP
  fi

  for hook in `ls $REPO_HOOKS`; do
    # If the hook already exists, is executable, and is not a symlink
    if [ ! -h $HOOK_DIR/$hook -a -x $HOOK_DIR/$hook ]; then
      mv $HOOK_DIR/$hook $HOOK_DIR_BACKUP/$hook.local
    fi

    # If not samples...
    if [[ ! $hook =~ .*\.sample ]]; then

      # Set execution right
      chmod +x $REPO_HOOKS/$hook 

      # Create symlink
      ln -s -f $REPO_HOOKS/$hook $HOOK_DIR/$hook
    else 
      # Remove execution right

      chmod -x $REPO_HOOKS/$hook 
    fi
  done

  for module in $WATCHED_MODULES; do

    GIT_BASE=.git/modules/$module
    HOOK_DIR=$GIT_BASE/hooks
    HOOK_DIR_BACKUP=$HOOK_DIR/old

    MODULE_REPO_HOOKS=$module/$REPO_HOOKS

    if [ ! -d $HOOK_DIR_BACKUP ]; then
      mkdir $HOOK_DIR_BACKUP 
    fi

    for hook in `ls $MODULE_REPO_HOOKS`; do
      # If the hook already exists, is executable, and is not a symlink
      if [ ! -h $HOOK_DIR/$hook -a -x $HOOK_DIR/$hook ]; then
        mv $HOOK_DIR/$hook $HOOK_DIR_BACKUP/$hook.local
      fi

      # If not samples...
      if [[ ! $hook =~ .*\.sample ]]; then

        # Set execution right
        chmod +x $module/$REPO_HOOKS/$hook 

        # Create symlink
        ln -s -f ../../../$module/$REPO_HOOKS/$hook $HOOK_DIR/$hook
      else 
        # Remove execution right

        chmod -x $module/$REPO_HOOKS/$hook 
      fi
    done
  done
fi
