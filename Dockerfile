FROM node:argon

MAINTAINER Javier Fernández <jfernandez@whynotsoluciones.com>

# Install pre-reqs
RUN   \
  npm install -g mocha

RUN \
  npm install -g grunt-cli

RUN \
  export PATH=/usr/local/lib/node_modules/mocha/bin:$PATH

RUN \
  export PATH=/usr/local/lib/node_modules/grunt-cli/bin:$PATH

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /usr/src && cp -a /tmp/node_modules /usr/src
WORKDIR   /usr/src

CMD ["/bin/bash"]
