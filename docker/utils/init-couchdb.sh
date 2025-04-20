#!/bin/bash
echo "Starting the CouchDB initialization script."

# Wait for CouchDB to be accessible using the container hostname (couchdb)
while true; do
  if curl -s -o /dev/null http://couchdb:5984/_up; then
    echo "CouchDB is responding."
    break
  else
    echo "Waiting for CouchDB to be ready..."
    sleep 3
  fi
done

# Function to create a database and validate its status
create_db() {
  local dbname=$1
  echo "Checking if the database ${dbname} exists..."
  status=$(curl -s -o /dev/null -w "%{http_code}" -u "$COUCHDB_USER:$COUCHDB_PASSWORD" -X PUT http://couchdb:5984/${dbname})
  if [[ "$status" == "201" || "$status" == "412" ]]; then
    echo "The database ${dbname} is ready."
    return 0
  else
    echo "There was an issue creating ${dbname}. Response code: $status"
    return 1
  fi
}

# Attempt to create critical databases with retries
for db in _users _replicator _global_changes; do
  retries=0
  max_retries=5
  while [ $retries -lt $max_retries ]; do
    if create_db $db; then
      break
    fi
    echo "Retrying creation of ${db} in 5 seconds..."
    sleep 5
    retries=$((retries + 1))
  done
done

echo "CouchDB initialization completed."
