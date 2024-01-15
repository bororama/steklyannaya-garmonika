#!/bin/bash

ip=`ifconfig -a | grep "inet " | grep -Fv 127.0.0.1 | awk 'NR==1{print $2}'`
export IP=${ip}
docker-compose up -d  
#docker exec -w /app/glass-harmonica-back/ -d backend npm run start:dev
docker exec -w /app/glass-harmonica -d frontend npm run dev
echo URL $ip
if grep -q "HOST_ADDRESS=" .env; then
    sed -i '' "s/HOST_ADDRESS=\".*\"/HOST_ADDRESS=\"$ip\"/" .env
else
    echo "HOST_ADDRESS=$ip" >> .env
fi

# docker exec -w /app/glass-harmonica -it frontend bash
# docker exec -w /app/glass-harmonica-back -it backend bash