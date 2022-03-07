#!/bin/bash
MONGO="/usr/bin/mongo"

checkServerStatus(){
	SERVER=$1
	PORT=$2
	$MONGO --host $SERVER --port $PORT --eval db
	while [ "$?" -ne 0 ]
	do
		echo "Waiting for $SERVER to come up..."
		sleep 1
		$MONGO --host $SERVER --port $PORT --eval db
	done
}

checkServerStatus "mongodb1" "27401"
checkServerStatus "mongodb2" "27402"
checkServerStatus "mongodb3" "27403"
$MONGO --host "mongodb1" --port "27401" "/tmp/config.js"
