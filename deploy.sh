#!/bin/bash

# First argument is the name of host from ssh config
HOST="$1"

echo 'Turning bots off';
ssh $HOST /bin/bash << EOF
  pm2 delete all;
  rm -rf ~/vkbot
EOF

echo 'Copying files to remote host';
(
  rsync -ar ./build $HOST:~/vkbot/
  rsync -ar ./node_modules $HOST:~/vkbot/
  rsync -ar ./package.json $HOST:~/vkbot/
) || (echo '# Failed' && exit 1);

echo 'Starting the application';
ssh $HOST /bin/bash << EOF
  cd ./vkbot && npm start && echo '# Started' || echo '# Not started';
EOF