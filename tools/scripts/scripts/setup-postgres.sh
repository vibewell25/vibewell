#!/bin/bash

# Script to set up PostgreSQL using Docker
# This follows security principles by not hardcoding credentials in the application code

# Default values
DB_NAME="vibewell_dev"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_PORT="5432"
CONTAINER_NAME="vibewell-postgres"

# Print setup information
echo "Setting up PostgreSQL for VibeWell"
echo "=================================="
echo "Database Name: $DB_NAME"
echo "User: $DB_USER"
echo "Port: $DB_PORT"
echo "Container Name: $CONTAINER_NAME"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    echo "Visit https://www.docker.com/get-started to download and install Docker."
    exit 1
fi

# Check if container already exists
if docker ps -a --filter "name=$CONTAINER_NAME" --format '{{.Names}}' | grep -q "^$CONTAINER_NAME$"; then
    echo "Container $CONTAINER_NAME already exists."
    
    # Check if it's running
    if docker ps --filter "name=$CONTAINER_NAME" --format '{{.Names}}' | grep -q "^$CONTAINER_NAME$"; then
        echo "Container is already running."
    else
        echo "Starting existing container..."
        docker start $CONTAINER_NAME
        echo "Container started."
    fi
else
    echo "Creating and starting PostgreSQL container..."
    docker run --name $CONTAINER_NAME \
        -e POSTGRES_USER=$DB_USER \
        -e POSTGRES_PASSWORD=$DB_PASSWORD \
        -e POSTGRES_DB=$DB_NAME \
        -p $DB_PORT:5432 \
        -d postgres:14

    # Wait for container to be ready
    echo "Waiting for PostgreSQL to start..."
    sleep 5
    
    echo "PostgreSQL container created and started."
fi

# Print connection string
echo -e "\nConnection Information:"
echo "========================="
echo "DATABASE_URL=\"postgresql://$DB_USER:$DB_PASSWORD@localhost:$DB_PORT/$DB_NAME?schema=public\""
echo -e "\nMake sure this matches your .env.local configuration."

echo -e "\nTo connect using psql inside the container:"
echo "docker exec -it $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME"

echo -e "\nDone!" 