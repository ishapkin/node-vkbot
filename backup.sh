HOST="$1"

echo 'Backup folders "data" and "logs"';
rsync -ar $HOST:~/vkbot/build/logs ./_/backup;
rsync -ar $HOST:~/vkbot/build/data ./_/backup;