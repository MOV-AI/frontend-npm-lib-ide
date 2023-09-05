#! /bin/bash

robot_name=$1;

if [ -z $robot_name ]
then
	echo "ERROR: Robot name is required:"
    echo "  ./import_callback.sh <robot_name>"
    exit 1
fi

backend_container="backend-${robot_name}-movai";
echo "Attempting to enter ${backend_container}";

if [ ! "$(docker ps -q -f name=${backend_container})" ]; then
    echo "The container ${backend_container} is not running. Please start your robot and try again."
    exit 1
fi

docker cp -a database/ ${backend_container}:/opt/mov.ai/app
docker exec -i ${backend_container} bash <<!
export PYTHONPATH=/opt/mov.ai/app
python3 -m tools.backup -a import -p database/ -r /opt/mov.ai/app/ 
!


echo "DONE! All callbacks were imported."
exit 0