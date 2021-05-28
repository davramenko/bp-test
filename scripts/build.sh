#!/bin/bash

cd /home/projects/bp-test
if [ $? != 0 ]; then
	echo "ERROR: Cannot change the workinbg directory"
	exit 1
fi

docker build . -t davramenko/bp-test -t "name:bp-test"
if [ $? != 0 ]; then
	echo "ERROR: Cannot build API image"
	exit 1
fi

docker-compose down
docker kill $(docker ps -q)
docker rm $(docker ps -a -q)

docker-compose -f docker-compose-db-only.yaml up -d
if [ $? != 0 ]; then
	echo "ERROR: Cannot start the DB swarm"
	exit 1
fi

docker-compose -f docker-compose-db-only.yaml exec db-server /bin/bash -c "echo \"SELECT 'CREATE DATABASE bp_test_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'bp_test_db')\gexec\" | psql -U postgres"
if [ $? != 0 ]; then
	echo "ERROR: Cannot create the database"
	exit 1
fi

docker-compose -f docker-compose-db-only.yaml exec db-server /bin/bash -c "echo \"ALTER USER postgres WITH PASSWORD 'just4pgsql'\g\" | psql -U postgres"
if [ $? != 0 ]; then
	echo "ERROR: Cannot set password for \"postgres\""
	exit 1
fi

docker-compose down
if [ $? != 0 ]; then
	echo "ERROR: Cannot stop the swarm"
	exit 1
fi

docker-compose up -d
if [ $? != 0 ]; then
	echo "ERROR: Cannot start the swarm"
	exit 1
fi
