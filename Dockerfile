FROM node:argon

MAINTAINER Javier Fernández <jfernandez@whynotsoluciones.com>

ENV TERM dumb

# Install pre-reqs
RUN   \
  npm install -g mocha

RUN \
  npm install -g grunt-cli

RUN \
  export PATH=/usr/local/lib/node_modules/mocha/bin:$PATH

RUN \
  export PATH=/usr/local/lib/node_modules/grunt-cli/bin:$PATH

RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
RUN echo "deb http://repo.mongodb.org/apt/debian wheezy/mongodb-org/3.2 main" | tee /etc/apt/sources.list.d/mongodb-org-3.2.list
RUN apt-get update
RUN apt-get install -y mongodb-org=3.2.3 mongodb-org-server=3.2.3 mongodb-org-shell=3.2.3 mongodb-org-mongos=3.2.3 mongodb-org-tools=3.2.3
RUN echo "mongodb-org hold" | dpkg --set-selections
RUN echo "mongodb-org-server hold" | dpkg --set-selections
RUN echo "mongodb-org-shell hold" | dpkg --set-selections
RUN echo "mongodb-org-mongos hold" | dpkg --set-selections
RUN echo "mongodb-org-tools hold" | dpkg --set-selections

# Remove binding from localhost only on mongod
RUN sed -i -e 's/.*bindIp.*//' /etc/mongod.conf

# Create mongodb data directory
RUN mkdir -p /data/db

WORKDIR   /usr/src

CMD ["/bin/bash"]
