FROM web-app-eks-sandbox-base:latest

ARG USERNAME=ubuntu
ENV SELFRC="/home/$USERNAME/.selfrc"

user root

# Install Python
# patch version を指定してインストールはできない
RUN PYTHON_VERSION=3.11 \
    && apt-get update && apt-get install -y \
    software-properties-common \
    && add-apt-repository ppa:deadsnakes/ppa -y \
    && apt-get update \
    && apt-get install -y \
        python${PYTHON_VERSION} \
        python${PYTHON_VERSION}-dev \
        python${PYTHON_VERSION}-venv \
        python3-pip \
    && update-alternatives --install /usr/bin/python3 python3 /usr/bin/python${PYTHON_VERSION} 1 \
    && update-alternatives --install /usr/bin/python python /usr/bin/python${PYTHON_VERSION} 1 \
    && rm -rf /var/lib/apt/lists/* \
    && python3 -m pip cache purge

# Install GitHub CLI
RUN set -eu \
    && (type -p wget >/dev/null || (apt update && apt install wget -y)) \
    && mkdir -p -m 755 /etc/apt/keyrings \
    && out=$(mktemp) && wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg \
    && cat $out | tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
    && chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
    && mkdir -p -m 755 /etc/apt/sources.list.d \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt update \
    && apt install gh -y \
    && rm -rf /var/lib/apt/lists/*

RUN set -eu \
    && mkdir -p /workspace \
    && chown -R $USERNAME:$USERNAME /home/$USERNAME \
    && chown -R $USERNAME:$USERNAME /workspace

USER $USERNAME

# Install global npm packages
# ここでは opt にフォルダを作成するため COPY で実施する
ENV NPM_GLOBAL_DIR=/opt/npm-global
COPY --chown=$USERNAME:$USERNAME ./.config/docker/dcopilot/package*.json $NPM_GLOBAL_DIR/
RUN cd $NPM_GLOBAL_DIR \
    && npm ci --ignore-scripts \
    && npm cache clean --force
ENV PATH="$NPM_GLOBAL_DIR/node_modules/.bin:$PATH"
ENV NODE_PATH="$NPM_GLOBAL_DIR/node_modules:$NODE_PATH"
RUN safe-chain setup --include-python

# Install global python packages for Neovim
ENV PIP_GLOBAL_DIR=/opt/pip-global
COPY --chown=$USERNAME:$USERNAME ./.config/docker/dcopilot/requirements-freeze.txt $PIP_GLOBAL_DIR/
RUN cd $PIP_GLOBAL_DIR \
    && pip install --no-cache-dir -r requirements-freeze.txt

# Dotfiles
COPY --chown=$USERNAME:$USERNAME ./config.json /home/$USERNAME/.config/.copilot/config.json
COPY --chown=$USERNAME:$USERNAME ./mcp-config.json /home/$USERNAME/.config/.copilot/mcp-config.json
RUN set -eu \
    && SRC=/home/$USERNAME/dotfiles/.config \
    && : "terminal で <Ctrl + h> で backspace となるように設定" \
    && echo 'stty erase ^H' >> $SELFRC \
    && echo ". $SRC/rc-settings.sh" >> $SELFRC \
    && echo ". $SELFRC" >> "/home/$USERNAME/.bashrc"

COPY --chown=$USERNAME:$USERNAME ./entrypoint.sh /home/$USERNAME/entrypoint.sh
RUN chmod +x /home/$USERNAME/entrypoint.sh
ENTRYPOINT ["/home/ubuntu/entrypoint.sh"]

WORKDIR /workspace
CMD ["copilot"]

