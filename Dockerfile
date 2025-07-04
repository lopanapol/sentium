# Sentium Dockerfile
# Base image with Fish shell
FROM ubuntu:22.04

# Set non-interactive frontend for apt-get
ENV DEBIAN_FRONTEND=noninteractive

# Install Fish shell and minimal dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    fish     ca-certificates     python3.10     python3.10-venv     python3-pip     && apt-get clean     && rm -rf /var/lib/apt/lists/*  # Set python3 to point to python3.10 RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.10 1  # Install Python AI dependencies RUN pip install --no-cache-dir transformers torch accelerate huggingface_hub

# Set Fish as the default shell
SHELL ["/usr/bin/fish", "-c"]

# Create app directory
WORKDIR /app

# Copy project files
COPY . .

# Make scripts executable
RUN chmod +x *.fish

# Set environment variables
ENV SENTIUM_VERSION="2.2.2" 

# Expose any necessary ports (if applicable)
# EXPOSE 8080

# Default command to run when starting the container
ENTRYPOINT ["/usr/bin/fish", "./run.fish"]

# If you want to use specific arguments or enable test mode:
# CMD ["test"]