Example 1: Simple Web App (Python Flask + PostgreSQL)
Use Case: A basic Flask app connected to a PostgreSQL database.

Docker Images:

python:3.9-slim (Flask app)
postgres:15 (Database)
docker-compose.yml:

Steps:

Create a webapp directory with a Dockerfile for your Flask app.
Run docker-compose up to build and start the containers.