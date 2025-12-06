FROM web-app-eks-sandbox-base:latest

ARG USERNAME=ubuntu
ARG UID=1000
ARG GID=1000

ENV SELFRC="/home/$USERNAME/.selfrc"

USER root

# Install tools
RUN apt-get update && apt-get install -y \
    fd-find \
    git \
    git-delta \
    jq \
    libreadline-dev \
    ripgrep \
    vifm \
    passwd \
    && rm -rf /var/lib/apt/lists/*

# Change user UID and GID
RUN groupmod -g $GID $USERNAME \
    && usermod -u $UID -g $GID $USERNAME \
    && chown -R $UID:$GID /home/$USERNAME

# Set locale
RUN apt-get update && apt-get install -y \
    locales \
    && locale-gen en_US.UTF-8 \
    && rm -rf /var/lib/apt/lists/*
ENV LANG=en_US.UTF-8
ENV LC_ALL=en_US.UTF-8
ENV LC_CTYPE=en_US.UTF-8

# Install Lua
RUN LUA_VERSION=5.1.5 \
    && curl -LO https://www.lua.org/ftp/lua-${LUA_VERSION}.tar.gz \
    && tar -xzf lua-${LUA_VERSION}.tar.gz \
    && cd lua-${LUA_VERSION} \
    && make linux \
    && make install \
    && cd .. \
    && rm -rf lua-${LUA_VERSION} lua-${LUA_VERSION}.tar.gz

# Install Go
RUN GO_VERSION=1.25.5 \
    && ARCH=$(uname -m) \
    && if [ "$ARCH" = "aarch64" ]; then GO_ARCH="arm64"; else GO_ARCH="amd64"; fi \
    && curl -LO https://go.dev/dl/go${GO_VERSION}.linux-${GO_ARCH}.tar.gz \
    && tar -C /usr/local -xzf go${GO_VERSION}.linux-${GO_ARCH}.tar.gz \
    && ln -s /usr/local/go/bin/go /usr/bin/go \
    && rm go${GO_VERSION}.linux-${GO_ARCH}.tar.gz

# Install Python
# patch version を指定してインストールはできない
RUN PYTHON_VERSION=3.13 \
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
    && rm -rf /var/lib/apt/lists/*

RUN NVIM_VERSION=v0.11.5 \
    && NVIM_FILENAME=nvim-linux-arm64 \
    && TAR_FILENAME=$NVIM_FILENAME.tar.gz \
    && curl -LO https://github.com/neovim/neovim/releases/download/$NVIM_VERSION/$TAR_FILENAME \
    && tar -xzf $TAR_FILENAME \
    && mv $NVIM_FILENAME /opt/nvim \
    && ln -s /opt/nvim/bin/nvim /usr/bin/nvim \
    && rm $TAR_FILENAME

# Install fzf
RUN FZF_VERSION=0.67.0 \
    && ARCH=$(uname -m) \
    && if [ "$ARCH" = "aarch64" ]; then FZF_ARCH="linux_arm64"; else FZF_ARCH="linux_amd64"; fi \
    && curl -LO https://github.com/junegunn/fzf/releases/download/v${FZF_VERSION}/fzf-${FZF_VERSION}-${FZF_ARCH}.tar.gz \
    && tar -xzf fzf-${FZF_VERSION}-${FZF_ARCH}.tar.gz \
    && mv fzf /usr/local/bin/ \
    && rm fzf-${FZF_VERSION}-${FZF_ARCH}.tar.gz \
    && mkdir -p /usr/share/fzf \
    && curl -fLo /usr/share/fzf/completion.zsh https://raw.githubusercontent.com/junegunn/fzf/v${FZF_VERSION}/shell/completion.zsh \
    && curl -fLo /usr/share/fzf/key-bindings.zsh https://raw.githubusercontent.com/junegunn/fzf/v${FZF_VERSION}/shell/key-bindings.zsh \
    && echo 'source /usr/share/fzf/completion.zsh' >> $SELFRC \
    && echo 'source /usr/share/fzf/key-bindings.zsh' >> $SELFRC

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

# Install starship
RUN curl -sS https://starship.rs/install.sh | sh -s -- -y

# Install yq
RUN VERSION=v4.47.1 \
    && BINARY=yq_linux_arm64 \
    && TEMP_WORKDIR=$(mktemp -d) \
    && cd $TEMP_WORKDIR \
    && wget https://github.com/mikefarah/yq/releases/download/${VERSION}/${BINARY}.tar.gz -O - | tar xz \
    && mv $BINARY yq \
    && install yq -D -t /usr/local/bin/ \
    && rm -rf $TEMP_WORKDIR

RUN set -eu \
    && mkdir -p /workspace \
    && mkdir -p /home/ubuntu/.local/share/nvim/lazy \
    && mkdir -p /home/ubuntu/.local/share/nvim/lazy \
    && chown -R $USERNAME:$USERNAME /home/$USERNAME \
    && chown -R $USERNAME:$USERNAME /workspace

USER $USERNAME

# Rust
RUN RUST_VERSION=1.91.1 \
    && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain ${RUST_VERSION} \
    && . $HOME/.cargo/env \
    && rustup component remove rust-docs
ENV PATH="/home/$USERNAME/.cargo/bin:${PATH}"
RUN . $HOME/.cargo/env \
    && curl -L --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/cargo-bins/cargo-binstall/main/install-from-binstall-release.sh | bash \
    && cargo binstall --locked tree-sitter-cli@0.25.10 \
    && rm -rf /home/$USERNAME/.cargo/registry/cache \
    && rm -rf /home/$USERNAME/.cargo/git/db

# Install npm packages for Neovim
# ここでは opt にフォルダを作成するため COPY で実施する
ENV NPM_GLOBAL_DIR=/opt/npm-global
COPY --chown=$USERNAME:$USERNAME ./package*.json $NPM_GLOBAL_DIR/
RUN cd $NPM_GLOBAL_DIR \
    && npm ci --ignore-scripts \
    && npm cache clean --force
ENV PATH="$NPM_GLOBAL_DIR/node_modules/.bin:$PATH"
ENV NODE_PATH="$NPM_GLOBAL_DIR/node_modules:$NODE_PATH"
RUN safe-chain setup --include-python \
    && echo 'eval "$(starship init zsh)"' >> $SELFRC \
    && echo 'source ~/.safe-chain/scripts/init-posix.sh # Safe-chain Zsh initialization script' >> $SELFRC

# Install go tools for Neovim
RUN export GOPATH=/tmp/go \
    && export GOCACHE=/tmp/go-cache \
    && go install github.com/jesseduffield/lazygit@v0.56.0 \
    && mkdir -p /home/$USERNAME/go/bin \
    && mv $GOPATH/bin/* /home/$USERNAME/go/bin/ \
    && go clean -modcache \
    && rm -rf $GOPATH $GOCACHE
ENV PATH="/home/$USERNAME/go/bin:$PATH"

# Install python packages for Neovim
# Add uv path
ENV PATH="/home/ubuntu/.local/bin/:$PATH"
RUN cd $PIP_GLOBAL_DIR \
    && pip install --no-cache-dir uv==0.9.15
RUN set -eu \
    && uv tool install pynvim==0.6.0

# Dotfiles
RUN set -eu \
    && : "terminal で <Ctrl + h> で backspace となるように設定" \
    && echo 'stty erase ^H' >> $SELFRC \
    && : "snacks.nvim からファイル削除で gio エラーが発生するため" \
    && echo 'export GIO_USE_TRASH=0' >> $SELFRC \
    && echo "source $SELFRC" >> "/home/$USERNAME/.zshrc"

COPY --chown=$USERNAME:$USERNAME ./entrypoint.sh /home/$USERNAME/entrypoint.sh
RUN chmod +x /home/$USERNAME/entrypoint.sh
ENTRYPOINT ["/home/ubuntu/entrypoint.sh"]

WORKDIR /workspace
CMD ["nvim"]
