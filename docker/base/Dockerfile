FROM public.ecr.aws/lts/ubuntu:24.04_stable

ARG USERNAME=ubuntu
ARG UID=1000
ARG GID=1000

ENV HOME=/home/$USERNAME
ENV XDG_BIN_HOME=$HOME/.local/bin \
  XDG_CACHE_HOME=$HOME/.cache
ENV PATH=$XDG_BIN_HOME:$PATH

# Change user UID and GID
RUN groupmod -g $GID $USERNAME \
    && usermod -u $UID -g $GID $USERNAME \
    && chown -R $UID:$GID /home/$USERNAME

# Install tools
RUN apt-get update && apt-get install -y \
    build-essential \
    ca-certificates \
    curl \
    git \
    gzip \
    jq \
    tar \
    unzip \
    wget \
    xz-utils \
    && rm -rf /var/lib/apt/lists/*

# Install zsh
RUN apt-get update && apt-get install -y zsh \
    && chsh -s /bin/zsh $USERNAME \
    && rm -rf /var/lib/apt/lists/*
ENV SHELL=/bin/zsh \
    HISTFILE=/home/$USERNAME/.cache/zsh/history

# Install Node.js
RUN NODE_VERSION=22.21.1 \
    && ARCH=$(uname -m) \
    && if [ "$ARCH" = "aarch64" ]; then NODE_ARCH="arm64"; else NODE_ARCH="x64"; fi \
    && curl -LO https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz \
    && tar -xJf node-v${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz \
    && mv node-v${NODE_VERSION}-linux-${NODE_ARCH} /opt/node \
    && ln -s /opt/node/bin/node /usr/bin/node \
    && ln -s /opt/node/bin/npm /usr/bin/npm \
    && ln -s /opt/node/bin/npx /usr/bin/npx \
    && rm node-v${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz \
    && npm cache clean --force
ENV NPM_CONFIG_PREFIX=$HOME/.local
ENV PATH=$NPM_CONFIG_PREFIX/bin:$PATH

RUN set -eu \
    && ZIP_ARCHIVE="awscliv2.zip" \
    && curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64-2.32.11.zip" -o "$ZIP_ARCHIVE" \
    && unzip "$ZIP_ARCHIVE" \
    && ./aws/install \
    && rm -rf "$ZIP_ARCHIVE" aws

RUN set -eu \
    && mkdir -p /home/$USERNAME/.aws \
    && mkdir -p /home/$USERNAME/.cache/mise \
    && mkdir -p /workspace \
    && chown -R $USERNAME:$USERNAME /home/$USERNAME \
    && chown -R $USERNAME:$USERNAME /workspace

# Switch to non-root user
USER $USERNAME
WORKDIR $HOME

# Install Mise
RUN set -eu \
    && MISE_VERSION=v2025.11.11 \
    && curl https://mise.jdx.dev/install.sh | sh \
    && echo 'eval "$($XDG_BIN_HOME/mise activate bash)"' >> ~/.bashrc

WORKDIR /workspace
