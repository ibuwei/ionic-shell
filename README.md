# ionic-shell with IONIC-v1

### 本人自用框架介绍
* 1. 此框架仅有前端代码
* 2. 接口端使用的是 `牛酷科技站点` 的B2C单商户版(2.1小程序版), [点击链接](http://www.niushop.com.cn/) 进行了解
* 声明: 接口端版权为 [牛酷科技](http://www.niushop.com.cn/) 所有
### 开发环境下需要按以下步骤准备启动环境:
* 1. 先安装 node 环境, 尽量安装4.4.7版, [点击链接](https://npm.taobao.org/mirrors/node/v4.4.7/) 后安装对应系统版本
* 2. 安装cnpm: `npm install -g cnpm --registry=https://registry.npm.taobao.org`
* 3. 以下指令在根目录下执行,用于安装程序依赖包
* &emsp;`cnpm install -g ionic@2.2.2 gulp@3.5.6 bower@1.8.0`
* &emsp;`cnpm install`
* 4. 以下指令在 app 目录下执行,用于安装程序依赖包
* &emsp;`bower install`

### 开发环境下的接口设置:
* 修改 ionic.config.json 的配置
* api 的 proxyUrl 改为 http://牛酷科技站点/api.php?s=
* public 的 proxyUrl 改为 http://牛酷科技站点/public

### 开发环境启动在根目录下运行下面的指令(win的cmd 或 linux的终端):
* `ionic serve --nobrowser --nolivereload --port 8100`

### ionic 的打包及相关问题解决
* `文章地址: http://mysrc.sinaapp.com/view_note/?id=1552`

### Angular代码规范
* `文章地址: http://www.reqianduan.com/1722.html`

### 以下配置文件在提交时不要勾选
* `ionic.config.json`

### 提交代码时要注意
* package.json 中 cordova的插件要删掉不提交

### 打包流程
* `ionic platform add android`  
>(注：如果报错： Current working directory is not a Cordova-based project.， 则可能工程下缺失www文件夹，要gulp一下，或手动创建www文件夹)。
>* 对照./plugins和config.xml，查找漏网之鱼
>* 添加cordova-plugin;删除package.json中的cordova-plugin,手动按照confi>g.xml中的列表在cmd中添加插件 `cordova plugin add 插件名 --save`
>* 如果私有库里面的插件（比如：cordova-plugin-idcardscan）则  `cordova plugin add 插件名 --save --nofecth`
>* 注:`card.io.cordova.mobilesdk` 这个插件暂时不用可以从config.xml中删掉（because：300M 太大）
>* 注：`cordova-plugin-idcardscan` 私有库，暂时冲突，删掉； 
>* 注：`cordova-plugin-apkInstaller`,这个插件被修改过，需要从私有库里下载
>* 清除打包环境的指令： `ionic state reset` （慎用）
* `cordova build android` (此时www文件夹可能为空，只是为了测试android打包环境是否正常)
*  `gulp build ` (注:`--production` 正式环境打包) 这一步已经集合了文件压缩混淆，apk 打包（ordova build android） 
*  先生成keystore 签名秘钥（网上搜教程）
*  用360加固(或其他加固)软件进行apk签名及加固

