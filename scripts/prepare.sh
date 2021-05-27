#!/bin/bash

if [ ! -d "/home/tests/data" ]; then
	mkdir -p /home/tests/data
	if [ $? != 0 ]; then
		echo "ERROR: Cannot create the database directory"
		exit 1
	fi
fi

if [ ! -d "/home/projects/bp-test" ]; then
	mkdir -p /home/projects/bp-test
	if [ $? != 0 ]; then
		echo "ERROR: Cannot create the project directory"
		exit 1
	fi
fi
