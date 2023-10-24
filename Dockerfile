FROM node:latest

RUN curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh -s -- -y
RUN /bin/bash -c 'source "$HOME/.cargo/env"'
RUN git clone https://github.com/iden3/circom.git /app/installation/circom
RUN /root/.cargo/bin/cargo build --release --manifest-path /app/installation/circom/Cargo.toml
RUN /root/.cargo/bin/cargo install --path /app/installation/circom/circom

#TODO: get rid of the redundant "circom" pfolder in the "installation" folder (above)
RUN git clone https://github.com/iden3/circomlib.git /app/circom/lib/circomlib
RUN npm install -g snarkjs@latest

COPY ./heimdalljs /app/heimdalljs
WORKDIR /app/heimdalljs

RUN npm i
RUN npm link
RUN heimdalljs -h

RUN apt update
RUN apt upgrade -y
RUN apt install golang-go -y
ENV GO111MODULE=on

RUN go get github.com/msoap/shell2http@latest
RUN mkdir -p ~/bin/
RUN ln -s $(go env GOPATH)/bin/shell2http ~/bin/shell2http
ENV PATH=$PATH:/root/go/bin/
