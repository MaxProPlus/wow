#!/bin/bash

ssh serv 'cd ~/wow && git reset --hard && git fetch && git rebase'
ssh serv 'cd ~/wow/server && npm i && npm run build'
ssh serv 'cd ~/wow/client && npm i && npm run build'
# ssh serv 'cd ~/wow/server && nohup npm run start > /dev/null 2>&1 &'

