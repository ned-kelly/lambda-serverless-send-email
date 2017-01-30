#!/bin/bash
## package.sls-install

HOME_PWD="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PKG_LOCATIONS=($(find functions -maxdepth 2 -name 'package.json' -print0 | xargs -0 -n1 dirname))

for i in "${PKG_LOCATIONS[@]}"
do
    echo -e "\nInstalling packages for: $i...\n"
    cd $HOME_PWD/../; cd $i
    npm install
done
cd $HOME_PWD
