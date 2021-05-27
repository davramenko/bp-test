#!/bin/bash

cd /home/projects/bp-test
if [ $? != 0 ]; then
	echo "ERROR: Cannot change the workinbg directory"
	exit 1
fi

npm install
if [ $? != 0 ]; then
	echo "ERROR: Cannot install project dependencies"
	exit 1
fi

npm run build-ts
if [ $? != 0 ]; then
	echo "ERROR: Cannot compile typescript sources"
	exit 1
fi

docker build . -t davramenko/bp-test -t "name:bp-test"
if [ $? != 0 ]; then
	echo "ERROR: Cannot build API image"
	exit 1
fi

docker-compose exec db-server /bin/bash -c "echo \"SELECT 'CREATE DATABASE mydb' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mydb')\gexec\" | psql -U postgres"
if [ $? != 0 ]; then
	echo "ERROR: Cannot create the database"
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
