#/bin/bash
basepath=$(cd `dirname $0`; pwd)
#创建 npm 结果文件夹
if [ ! -d ${basepath}/../node_modules ]; then
  mkdir ${basepath}/../node_modules
fi
if [ ! -d ${basepath}/../bower_components ]; then
  mkdir ${basepath}/../bower_components
fi
#建立文件夹链接
# ln -s ${basepath}/../node_modules ./node_modules
# ln -s ${basepath}/../bower_components ./www/res/lib

#判断 docker-compose 是否存在
if command -v docker-compose >/dev/null 2>&1; then
  echo 'exists docker-compose'
else
  # 不存在则安装
  curl -L https://get.daocloud.io/docker/compose/releases/download/1.16.0/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose
fi
#如果 node_modules 的 volume 不存在, 则创建
if [ ! -n "$(docker volume ls |grep node_modules)" ]; then
  docker volume create --name=node_modules
fi
#如果 node_modules 的 volume 不存在, 则创建
if [ ! -n "$(docker volume ls |grep bower_components)" ]; then
  docker volume create --name=bower_components
fi
#如果 proxynet 不存在, 则创建
if [ ! -n "$(docker network ls |grep proxynet)" ]; then
  docker network create proxynet
fi
docker-compose build

containname="_ionicshell"
# 使用 docker-compose 执行发布操作
if [ -n "$(docker ps|grep ${containname}|awk '{print $1}')" ]; then
  docker ps|grep ${containname}|awk '{print $1}' | xargs docker kill
  docker-compose up -d
  if [ -n "$(docker ps -a |grep ${containname}|grep Exited|awk '{print $1}')" ]; then
    docker ps -a |grep ${containname}|grep Exited|awk '{print $1}' | xargs docker rm -f
  fi
  if [ -n "$(docker images|grep ${containname}|awk '{if (NR>1){print $3}}')" ]; then
    docker images|grep ${containname}|awk '{if (NR>1){print $3}}' | xargs docker rmi -f
  fi
else
  if [ -n "$(docker ps -a |grep ${containname}|grep Exited|awk '{print $1}')" ]; then
    docker ps -a |grep ${containname}|grep Exited|awk '{print $1}' | xargs docker rm -f
  fi
  if [ -n "$(docker images|grep ${containname}|awk '{if (NR>1){print $3}}')" ]; then
    docker images|grep ${containname}|awk '{if (NR>1){print $3}}' | xargs docker rmi -f
  fi
  docker-compose up -d
fi