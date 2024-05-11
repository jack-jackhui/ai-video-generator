#!/bin/zsh

# Load environment variables
source .env.build_config

# Variables
IMAGE_NAME="ai_video_frontend"
VERSION_TAG="latest"
GHCR_URL="ghcr.io/$GITHUB_USER/$IMAGE_NAME:$VERSION_TAG"

# Login to GitHub Container Registry
echo "Logging into GitHub Container Registry..."
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GITHUB_USER" --password-stdin

# Build and push the Docker image
echo "Building and pushing Docker image..."
# docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 -t $GHCR_URL . --push

echo "Docker image pushed to GHCR."
