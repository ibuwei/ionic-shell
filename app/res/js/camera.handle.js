(function(ng) {
  "use strict";
  ng.module('app.services')
    .factory('camaraHandle', camaraHandle);
  camaraHandle.$inject = ['$timeout', 'toolBox', '$q'];

  function camaraHandle($timeout, toolBox, $q) {
    //提示信息定义
    var userMessages = {
      noCamera: "The device doesn't have a working camera",
      cameraUnauthorized: {
        title: "Camera unavailable",
        message: "The app is not authorised to access the camera, which means it can't take photos. Would you like to switch to the Settings app to allow access?"
      },
      cameraRollUnauthorized: {
        title: "相册权限提示",
        message: "应用需要访问您的相册, 请点击确认到设置中开启.",
        buttonLabels: ['aaa', 'bbb']
      },
      cameraAuthorisationError: {
        title: "Camera authorisation error",
        message: "The app could not request access to the camera due to the following error: "
      },
      cameraPickError: {
        title: "文件选取提示",
        message: "%s未选择成功,请返回重新选取"
      }
    };
    var service = {
      imagePath: '',
      videoPath: '',
      uploadPath: '',
      pickFilePath: '',
      uploadFlag: false,
      uploadimgVideo: {
        videoProgress: 0,
        fileUploading: false,
      },
      cameraOptions: {}, //相册或摄像头选项
      localFileName: '',
      uploadType: '', //Camera.MediaType.VIDEO / Camera.MediaType.PICTURE;
      uploadTypeString: 'image', // image / video
      uploadHandle: uploadHandle, //摄像头及图片选择的处理入口, 检查网络情况
      checkCameraAuth: checkCameraAuth,
      //doUpload: doUpload, //打开相册和摄像头处理
      uploadBase64File: uploadBase64File, //base64文件上传
      checkCameraIsUsable: checkCameraIsUsable //检查相册和摄像头权限
    };
    return service;

    //摄像头及图片选择的处理入口, 检查网络情况
    function uploadHandle(uploadType) {
      var deferred = $q.defer();
      service.uploadType = Camera.MediaType.PICTURE;
      console.log("uploadFileAction fileUploading", service.uploadimgVideo.fileUploading);
      var uploadMsg = "%s正在上传中, 请稍后再试.";
      if (service.uploadimgVideo.fileUploading) {
        navigator.notification.alert(sprintf(uploadMsg, (service.localFileName == 'image') ? "照片" : "视频"), null, "文件上传提示");
        deferred.reject(false);
      }
      service.uploadTypeString = uploadType;
      cordova.plugins.diagnostic.isWifiAvailable(function(available) {
        console.log("WiFi is " + (available ? "available" : "not available"));
        if (available) {
          doUpload();
        } else {
          navigator.notification.confirm("当前网络不在WIFI状态下, 需要使用流量进行上传, 确认吗?", function(buttonIndex) {
            if (buttonIndex == 1) { //do check while press yes
              doUpload();
            }
          }, "网络状态提示");
        }
      }, function(error) {
        console.error("The following error occurred: " + error);
        navigator.notification.alert("网络没有开启, 请先开启网络.", null, "网络状态提示");
        deferred.reject(false);
      });

      //检查相册和摄像头权限
      function doUpload() {
        if (!service.uploadTypeString) service.uploadTypeString = 'image';
        service.uploadPath = (service.uploadTypeString == 'video') ? service.videoPath : service.imagePath;
        service.uploadType = (service.uploadTypeString == 'video') ? Camera.MediaType.VIDEO : Camera.MediaType.PICTURE;
        console.log('service:', service.uploadType);
        // Request camera authorisation
        //检查相册是否可用
        service.checkCameraIsUsable({
          successFn: onCameraAuthorised,
          errorFn: onCameraAuthorisationError,
          requireCameraRoll: true
        });
      }

      // Called on successful authorisation of camera/camera roll
      //当相册可用时跳转
      function onCameraAuthorised() {
        var srcType = Camera.PictureSourceType.PHOTOLIBRARY;
        service.cameraOptions = setOptions(srcType);
        //var func = createNewFileEntry;
        //cordova-plugin-camera
        navigator.camera.getPicture(onSuccess, onFail, service.cameraOptions);
      }

      // Called on error during authorisation of camera/camera roll
      //无调用相册权限时提示的错误
      function onCameraAuthorisationError(error) {
        console.error("An error occurred authorising use of the camera");
        navigator.notification.confirm(userMessages.cameraAuthorisationError.message, null, userMessages.cameraAuthorisationError.title, userMessages.cameraAuthorisationError.buttonLabels);
      }

      //从相册中选取图片的参数设置
      function setOptions(srcType) {
        var options = {
          // Some common settings are 20, 50, and 100
          quality: 50,
          destinationType: Camera.DestinationType.DATA_URL,
          // In this app, dynamically set the picture source, Camera or photo gallery
          sourceType: srcType,
          targetWidth: 200,
          targetHeight: 200,
          encodingType: Camera.EncodingType.JPEG,
          mediaType: service.uploadType,
          saveToPhotoAlbum: false,
          allowEdit: false,
          correctOrientation: true //Corrects Android orientation quirks
        };
        return options;
      }

      //客户端文件选取失败
      function onFail(message) {
        console.error('Failed because: ' + message);
        //格式化错误显示内容
        var message = sprintf(userMessages.cameraPickError.message, (service.uploadTypeString == 'video') ? "视频" : "图片");
        //navigator.notification.alert(message,null,userMessages.cameraPickError.title);
      }

      //cordova-plugin-file
      //客户端文件选取成功, 根据文件路径取得文件对象, 然后进行文件上传处理
      function onSuccess(imgUri) {
        //console.log('file pickup success:', imgUri);
        //如果是 base64 图片数据, 直接上传
        if (service.cameraOptions.destinationType == Camera.DestinationType.DATA_URL) {
          deferred.resolve(imgUri);
        } else { //如果是图片 url
          if (imgUri.indexOf("file://") < 0) {
            imgUri = "file://" + imgUri;
          }
          //如果是视频上传的话, 先获取视频信息, 取得视频文件的大小及 播放时长 等参数
          if (service.uploadTypeString == 'video') {
            service.pickFilePath = imgUri;
            //取得视频文件信息, 用于判断视频长度
            //转码后无法获取真正的信息, 最好放在获取视频时
            VideoEditor.getVideoInfo(
              getVideoInfoSuccess,
              getVideoInfoError, { fileUri: imgUri }
            );
          } else {
            uploadFile(imgUri);
            deferred.resolve(imgUri);
          }
        }
      }
      return deferred.promise;
    }

    //检查 网络 和 摄像头 权限
    function checkCameraAuth() {
      var deferred = $q.defer();
      //检查网络
      cordova.plugins.diagnostic.isWifiAvailable(function(available) {
        console.log("WiFi is " + (available ? "available" : "not available"));
        if (available) {
          //检查相册是否可用
          service.checkCameraIsUsable({
            successFn: onCameraAuthorised,
            errorFn: onCameraAuthorisationError,
            requireCameraRoll: true
          });
        } else {
          navigator.notification.confirm("当前网络不在WIFI状态下, 需要使用流量进行上传, 确认吗?", function(buttonIndex) {
            if (buttonIndex == 1) { //do check while press yes
              //检查相册是否可用
              service.checkCameraIsUsable({
                successFn: onCameraAuthorised,
                errorFn: onCameraAuthorisationError,
                requireCameraRoll: true
              });
            }
          }, "网络状态提示");
        }
      }, function(error) {
        console.error("The following error occurred: " + error);
        navigator.notification.alert("网络没有开启, 请先开启网络.", null, "网络状态提示");
        deferred.reject(false);
      });

      // Called on successful authorisation of camera/camera roll
      //当相册可用时跳转
      function onCameraAuthorised() {
        deferred.resolve(true);
      }

      // Called on error during authorisation of camera/camera roll
      //无调用相册权限时提示的错误
      function onCameraAuthorisationError(error) {
        console.error("An error occurred authorising use of the camera");
        navigator.notification.confirm(userMessages.cameraAuthorisationError.message, null, userMessages.cameraAuthorisationError.title, userMessages.cameraAuthorisationError.buttonLabels);
        deferred.resolve(false);
      }
      return deferred.promise;
    }

    //根据路径获取文件失败的处理
    function onErrorResolveUrl(msg) {
      console.log('onErrorResolveUrl', msg)
    }

    //成功取得视频文件信息时
    function getVideoInfoSuccess(info, e) { //对视频的播放时长进行限制
      var message = "视频不得%s, 请返回重新选择.";
      if (info.duration < 10) {
        service.uploadFlag = false;
        message = sprintf(message, '小于10秒');
      }
      /*if (info.duration>60) {
        service.uploadFlag = false;
        message = sprintf(message,'大于60秒');
      }*/
      if (!service.uploadFlag) {
        navigator.notification.alert(message, null, '视频上传提示');
        service.uploadFlag = true;
      } else { //如果符合转码条件
        //先对视频文件进行转码
        window.resolveLocalFileSystemURL(service.pickFilePath, function success(fileEntry) {
          videoTranscode(fileEntry.nativeURL);
        });
      }

      console.log('getVideoInfoSuccess, info: ' + JSON.stringify(info, null, 2));
    }

    //获取视频文件信息失败时
    function getVideoInfoError(message) {
      console.log('getVideoInfoError, msg: ' + message);
    }
    //视频转码处理
    function videoTranscode(imgUri) {
      var fileName = imgUri.substring(imgUri.lastIndexOf('/') + 1);
      fileName = fileName.substr(0, fileName.lastIndexOf('.'));
      console.log('videoTranscode fileName', fileName);
      service.uploadimgVideo.fileUploading = true; //待上传
      //视频转码处理
      VideoEditor.transcodeVideo(
        videoTranscodeSuccess,
        videoTranscodeError, {
          fileUri: imgUri,
          outputFileName: fileName,
          outputFileType: VideoEditorOptions.OutputFileType.MPEG4,
          optimizeForNetworkUse: VideoEditorOptions.OptimizeForNetworkUse.YES,
          saveToLibrary: false,
          maintainAspectRatio: true,
          //width: 640,
          //height: 640,
          videoBitrate: 2500000, // 1 megabit,720p
          audioChannels: 2,
          audioSampleRate: 44100,
          audioBitrate: 128000, // 128 kilobits
          progress: function(info) {
            //console.log('transcodeVideo progress callback, info: ' + info);
            $timeout(function() {
              if (ionic.Platform.isIOS()) {
                service.uploadimgVideo.videoProgress = parseInt(info);
              } else if (ionic.Platform.isAndroid()) {
                service.uploadimgVideo.videoProgress = parseInt(info * 100);
              }
            });
          }
        }
      );
      //视频转码成功
      function videoTranscodeSuccess(imgUri) {
        // result is the path to the transcoded video on the device
        console.log('videoTranscodeSuccess, result: ' + imgUri);
        //console.log('imgUri',imgUri);
        if (imgUri.indexOf("file://") < 0) {
          imgUri = "file://" + imgUri
        }
        //文件转码成功后进行文件上传处理
        uploadFile(imgUri);
      }
      //视频转码失败
      function videoTranscodeError(err) {
        console.log('videoTranscodeError, err: ' + err);
        service.uploadimgVideo.fileUploading = false; //失败后上传状态取消
        navigator.notification.alert("视频转码失败,请重新选择视频.", null, "视频转码提示");
      }
    }

    //根据取得的文件对象复制文件到应用目录下
    function copyFile(fileEntry) {
      console.log('copyFile newName', fileEntry.fullPath);
      var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
      var newName = getUuid() + name;
      console.log('copyFile newName', newName);
      // window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function(fileSystem2) {
      //     fileEntry.copyTo(
      //       fileSystem2,
      //       newName,
      //       onCopySuccess,
      //       fail
      //     );
      //   },
      //   fail);
    }
    //文件复制成功
    function onCopySuccess(entry) {
      //q.resolve(entry.nativeURL)
      console.log('onCopySuccess', entry.nativeURL);
      service.localFileName = entry.nativeURL; //取得当前文件全路径
      console.log('onCopySuccess fileName', service.localFileName);
      entry.file(function(file) {
        //console.log('onCopySuccess file',file);
        uploadFileHandler(file);
      });
    }
    //文件复制失败
    function fail(error) {
      q.reject(error)
      console.error("fail: " + JSON.stringify(error));
    }

    //检查相册是否可用的各方法实现
    function checkCameraIsUsable(params) {

      function androidCameraRollAuthorization() {
        cordova.plugins.diagnostic.getPermissionAuthorizationStatus(function(status) {
          switch (status) {
            case cordova.plugins.diagnostic.permissionStatus.GRANTED:
              console.log("Permission granted to use the camera");
              //params.successFn();
              break;
            case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
              console.log("Permission to use the camera has not been requested yet");
              break;
            case cordova.plugins.diagnostic.permissionStatus.DENIED:
              console.log("Permission denied to use the camera - ask again?");
              break;
            case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
              console.log("Permission permanently denied to use the camera - guess we won't be using it then!");
              break;
          }
        }, params.errorFn, cordova.plugins.diagnostic.runtimePermission.CAMERA);
        params.successFn();
      }

      function requestCameraRollAuthorization() {
        cordova.plugins.diagnostic.requestCameraRollAuthorization(function(granted) {
          if (granted) {
            params.successFn();
          } else {
            onCameraRollAuthorizationDenied();
          }
        }, params.errorFn);
      }

      function onCameraRollAuthorizationDenied() {
        navigator.notification.confirm(
          userMessages.cameraRollUnauthorized.message,
          function(i) {
            if (i == 1) {
              cordova.plugins.diagnostic.switchToSettings();
            }
          },
          userMessages.cameraRollUnauthorized.title, ["Yes", "No"]
        );
      }

      function getCameraRollAuthorizationStatus() {
        cordova.plugins.diagnostic.getCameraRollAuthorizationStatus(function(status) {
          switch (status) {
            case "denied":
              onCameraRollAuthorizationDenied();
              break;
            case "not_determined":
              requestCameraRollAuthorization();
              break;
            default:
              params.successFn();
          }
        }, params.errorFn);
      }

      function requestCameraAuthorization() {
        cordova.plugins.diagnostic.requestCameraAuthorization(function(granted) {
          if (granted) {
            if (params.requireCameraRoll) {
              console.log("ionic.Platform.isAndroid()", ionic.Platform.isAndroid());
              if (ionic.Platform.isAndroid()) { //当是安卓时使用安卓的处理
                androidCameraRollAuthorization();
              } else {
                getCameraRollAuthorizationStatus();
              }
            } else {
              params.successFn();
            }
          } else {
            onCameraAuthorizationDenied();
          }
        }, params.errorFn);
      }

      function onCameraAuthorizationDenied() {
        navigator.notification.confirm(
          userMessages.cameraUnauthorized.message,
          function(i) {
            if (i == 1) {
              cordova.plugins.diagnostic.switchToSettings();
            }
          },
          userMessages.cameraUnauthorized.title, ["Yes", "No"]
        );
      }

      function getCameraAuthorizationStatus() {
        cordova.plugins.diagnostic.getCameraAuthorizationStatus(function(status) {
          switch (status) {
            case "denied":
              onCameraAuthorizationDenied();
              break;
            case "not_determined":
              requestCameraAuthorization();
              break;
            default:
              if (params.requireCameraRoll) {
                if (ionic.Platform.isAndroid()) { //当是安卓时使用安卓的处理
                  androidCameraRollAuthorization();
                } else {
                  getCameraRollAuthorizationStatus();
                }
              } else {
                params.successFn();
              }

          }
        }, params.errorFn);
      }

      function isCameraPresent() {
        cordova.plugins.diagnostic.isCameraPresent(function(present) {
          if (present) {
            getCameraAuthorizationStatus();
          } else {
            params.errorFn(userMessages.noCamera);
          }
        }, params.errorFn);
      }
      isCameraPresent();
    }

    //文件重命名规则
    function getUuid() {
      var len = 32; //32长度
      var radix = 16; //16进制
      var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
      var uuid = [],
        i;
      radix = radix || chars.length;
      if (len) { for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix]; } else {
        var r;
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';
        for (i = 0; i < 36; i++) {
          if (!uuid[i]) {
            r = 0 | Math.random() * 16;
            uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
          }
        }
      }
      return uuid.join('');
    }
    //文件上传处理
    function uploadFile(imgUri) {
      //console.log('uploadFile imgUri',imgUri);
      //根据文件路径取得文件对象, 将转成可用于上传的文件对象
      window.resolveLocalFileSystemURL(imgUri, function success(fileEntry) {
        console.log('uploadFile fileEntry', fileEntry);
        if (ionic.Platform.isAndroid() && service.uploadTypeString == 'image') {
          copyFile(fileEntry);
        } else {
          fileEntry.file(function(file) {
            console.log('upload file object', file);
            service.localFileName = imgUri; //取得当前文件全路径
            console.log('upload fileName', service.localFileName);
            //uploadFileHandler(file);
          });
        }
      }, onErrorResolveUrl);
    }
    /**
     * base64文件上传
     * @author lvwei
     * @date   2017-12-29T11:13:21+0800
     * @return {[type]}                 [description]
     */
    function uploadBase64File() {
      //toolBox.http.post
    }
  }


})(angular);