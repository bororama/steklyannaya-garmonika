#!/bin/bash

ip=`ifconfig -a | grep "inet " | grep -Fv 127.0.0.1 | awk 'NR==1{print $2}'`
export IP=${ip}
docker-compose up --build -d  &&  docker exec curroverso-expanded env | grep HOST_ADDRESS
docker exec curroverso-expanded npm run dev && docker exec -it curroverso-expanded bash npm run start