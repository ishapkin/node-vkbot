#!/bin/bash

# First argument is the name of host from ssh config
HOST="$1"

echo 'Backup folders "data/vips" and "logs"';
rsync -ar $HOST:~/vkbot/logs ./_/backup;
rsync -ar $HOST:~/vkbot/data/vips ./_/backup;

echo 'Turning bots off';
ssh $HOST /bin/bash << EOF
  pm2 delete all;
  rm -rf ~/vkbot
EOF

echo 'Copying files to remote host';
(
  rsync -ar ./build $HOST:~/vkbot/
  rsync -ar ./node_modules $HOST:~/vkbot/
) || (echo '# Failed' && exit 1);

echo 'Starting the application';
ssh $HOST /bin/bash << EOF
  cd ./vkbot && node ./build/main && echo '# Started' || echo '# Not started';
EOF