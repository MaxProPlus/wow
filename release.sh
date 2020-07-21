#!/bin/bash

ssh servT 'rm -rf ~/wow/server/src'
scp -r './server/src/' servT:~/wow/server/
ssh servT 'cd ~/wow/server/src && npm run build'

ssh servT 'rm -rf ~/wow/client/src'
scp -r './client/src/' servT:~/wow/client/
ssh servT 'cd ~/wow/client/src && npm run build'

# ssh serverT 'cd ~/wow && git reset --hard && git fetch && git rebase'
# ssh serverT 'cd ~/wow/server && npm i && npm run build'
# ssh serverT 'cd ~/wow/client && npm i && npm run build'
# ssh serverT 'cd ~/wow/server && nohup npm run start > /dev/null 2>&1 &'

