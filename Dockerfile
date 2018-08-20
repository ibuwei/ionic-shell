# VERSION               1.0.0

FROM registry.cn-hangzhou.aliyuncs.com/narlian/node-npm:4.8.7-alpine
MAINTAINER chinalvwei@gmail.com

ENV HTTP_PORT 8100

#将宿主中的ionic项目文件复制到容器中
COPY . /app 
WORKDIR /app
# ADD ./sources.list /etc/apt/sources.list
ADD ./docker/alpine-repositories.list /etc/apk/repositories

RUN set -x && \
  apk --update add --no-cache git && \
  rm -rf /var/cache/apk/*

#使用淘宝的 npm 镜像, 安装 ionic 和 gulp
# RUN npm install -g cnpm --registry=https://registry.npm.taobao.org

RUN cnpm install -g ionic@2.2.2
# RUN cd ./www && bower install
# RUN cnpm install
#执行文件合并压缩, 如果有需要的话
#RUN gulp


EXPOSE 8100

#CMD ["ionic", "serve", "--nobrowser", "--nolivereload", "--port", "8100"]
# CMD ["sh", "run.sh"]