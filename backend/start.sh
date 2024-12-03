#!/bin/sh

# Start Cloud SQL Proxy in the background
/cloud_sql_proxy -instances=buzzwatch-422510:europe-west1:mutualism-test=tcp:3306 &

# Start the Uvicorn app
exec uvicorn main:app --host 0.0.0.0 --port 8000
