#!/bin/sh
test -z "$PREF" && PREF=../../apps
test -z "$APP" && APP=ide
npm link ../sub ../core ../styles ../react $PREF/$APP/node_modules/react $PREF/$APP/node_modules/react-virtualized
