#!/bin/bash

TEST=false;

if [ "$1" = "--test" ]; then
  TEST=true
fi

echo 'Building..';

rm -rf ./build;
rsync -ar ./src/ ./build/;
rsync -ar ./_/build/ ./build/;

if [ $TEST = true ]; then
  rsync -ar ./_/test/accounts.js ./build/;
fi

rm ./build/*.default.js;

echo 'Done.';