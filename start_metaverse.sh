#!/bin/bash

ip=`ifconfig -a | grep "inet " | grep -Fv 127.0.0.1 | awk 'NR==1{print $2}'`
export IP=${ip}
docker-compose up -d  && docker exec backend npm run start && docker exec -it frontend bash