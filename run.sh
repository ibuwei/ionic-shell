#/bin/sh
# [ ! -d /data/node_modules ] && mkdir /data/node_modules
# [ -d /data/node_modules ] && ln -s /data/node_modules /app/node_modules
cnpm install
# [ ! -d /data/bower_components ] && mkdir /data/bower_components
# [ -d /data/bower_components ] && ln -s /data/bower_components /app/app/bower_components
cd ./app && bower install --allow-root && cd ..
gulp
# npm start
ionic serve --nobrowser --nolivereload --port 8100