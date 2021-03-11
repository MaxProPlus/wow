#!/bin/sh

# Выставить права на монтируемы директории
chown node:node -R uploads
find ./uploads -type d -exec chmod 0755 {} \;
find ./uploads -type f -exec chmod 0644 {} \;

chown node:node -R logs
find ./logs -type d -exec chmod 0755 {} \;
find ./logs -type f -exec chmod 0644 {} \;

# Передать управление дальше от имени node
exec su-exec node:node "$@"
