#!/bin/sh

#npm on OSX is slow as it's volume mounted
echo "Install NPM packages..."
npm install
OUT=$?

if [ $OUT -eq 0 ];then
    echo "Installing NPM packages complete."
else
    echo "Failed"
    exit 1
fi

echo "Running gulp"
gulp default