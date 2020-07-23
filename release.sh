#!/bin/bash

ssh servT 'cd ~/wow && git reset --hard && git fetch && git rebase'
ssh servT 'cd ~/wow/server && npm i && npm run build'
ssh servT 'cd ~/wow/client && npm i && npm run build'
ssh servT 'cd ~/wow/server && nohup npm run start > /dev/null 2>&1 &'

