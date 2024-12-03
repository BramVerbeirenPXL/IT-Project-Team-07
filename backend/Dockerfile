# Base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Arguments for secrets (to match pipeline's build-args)
ARG SECRET_KEY
ARG DATABASE_URL
ARG GOOGLE_APPLICATION_CREDENTIALS_BASE64

# Install dependencies
COPY requirements.txt .
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Add Cloud SQL Proxy
RUN wget https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64 -O /cloud_sql_proxy && chmod +x /cloud_sql_proxy

# Decode and copy the service account key from the base64 argument
COPY gcloud-credentials.json /secrets/gcloud-credentials.json
ENV GOOGLE_APPLICATION_CREDENTIALS="/secrets/gcloud-credentials.json"

# Environment variables for the app
ENV SECRET_KEY=$SECRET_KEY
ENV DATABASE_URL=$DATABASE_URL
# Expose application port
EXPOSE 8000

# Create a script to run both processes
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Use the script as the entrypoint
ENTRYPOINT ["/start.sh"]
