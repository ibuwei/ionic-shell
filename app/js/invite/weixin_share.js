//PluginManager
var ncc;
! function(ncc) {
  "use strict";
  var PluginManager = function() {
    function PluginManager() {
      this.inCordovaRuntime = !!window.cordova;
    }
    return PluginManager.prototype.register = function(namespace, plugin) {
      var isRegister = this.inCordovaRuntime || this.createNS(namespace, plugin);
      if (!window.plugins) window.plugins = {};
    }, PluginManager.prototype.createNS = function(namespace, plugin) {
      var NSArray = namespace.split("."),
        NS = null;
      angular.forEach(NSArray, function(NSPart, index) {
        "window" == NSPart ? NS = window : NS.hasOwnProperty(NSPart) ? NS = NS[NSPart] : index == NSArray.length - 1 ? NS[NSPart] = plugin : NS = NS[NSPart] = {};
      });
    }, PluginManager;
  }();
  ncc.pluginManager = new PluginManager;
}(ncc || (ncc = {}));

//wechat
var ncc;
! function(ncc) {
  "use strict";
  var myLocalStorage, systemConfig;
  ncc.host = location.origin;
  ncc.url = ncc.host + '/login/api';
  var wx = window.wx,
    isInitSuccess = !1,
    $q = angular.injector(["ng"]).get("$q"),
    weixinReady = $q.defer(),
    WexinConfig = function() {
      function WexinConfig() {}
      return WexinConfig;
    }(),
    WexinShareParam = function() {
      function WexinShareParam() {
        this.title = "", this.desc = "", this.link = "", this.imgUrl = "", this.type = "", this.dataUrl = "";
      }
      return WexinShareParam;
    }(),
    allJsApiList = ["onMenuShareTimeline", "onMenuShareAppMessage", "onMenuShareQQ", "onMenuShareQZone", "onMenuShareWeibo",
      "startRecord", "stopRecord", "onVoiceRecordEnd", "playVoice", "pauseVoice", "stopVoice", "onVoicePlayEnd",
      "uploadVoice", "downloadVoice", "chooseImage", "previewImage", "uploadImage", "downloadImage", "translateVoice",
      "getNetworkType", "openLocation", "getLocation", "hideOptionMenu", "showOptionMenu", "hideMenuItems", "showMenuItems",
      "hideAllNonBaseMenuItem", "showAllNonBaseMenuItem", "closeWindow", "scanQRCode", "chooseWXPay", "openProductSpecificView",
      "addCard", "chooseCard", "openCard"
    ],
    WeChat = function() {
      function WeChat() {
        var vm = this;
        this.code = vm.getQueryString('code');
        //这里还要给 APP 交互留下一个口子
        vm.allowInBrowser = true;
        vm.config = new WexinConfig;
        vm.inWeixin = window.navigator.userAgent.indexOf("MicroMessenger") >= 0;
        var curUrl = window.location.href;
        if (curUrl.indexOf('invite_register.html')>=0) {
          vm.initConfig(location.href.replace(location.hash, ""));
          return;
        }
        // //判断是否允许在浏览器运行
        // if (!this.allowInBrowser) this.inWeixin = !this.allowInBrowser;
        setTimeout(function() {
          var injector = angular.element(document.body).injector();
          if (injector == undefined) return;
          myLocalStorage = injector.get('Session');
          systemConfig = injector.get('systemConfig');
          vm.code = vm.getQueryString('code');
          // if (vm.code) {
          //   vm.getCookies(systemConfig, function(){
          //     var url = myLocalStorage.get('nowUrl');
          //     //如果 openid 不存在, 则继续刷新
          //     if(!myLocalStorage.get('openId') && url) {
          //       myLocalStorage.remove('nowUrl');
          //       window.location.replace(url);
          //     } else {
          //       vm.initConfig(location.href.replace(location.hash, ""));
          //     }
          //   });
          // } else {
          //   // 判断 openid 是否存在, 跳转微信授权
          //   vm.inWeixin && !vm.getOpenId() && vm.weixinAuth();
          // }
        });
      }
      return WeChat.prototype.initConfig = function(url, successFn) {
          var self = this;
          self.getTicket(url, function(data) {
            self.config = extend(self.config, data),
              window.wx.config({
                debug: !1,
                appId: self.config.appId,
                timestamp: self.config.timestamp,
                nonceStr: self.config.nonceStr,
                signature: self.config.signature,
                jsApiList: allJsApiList
              }), isInitSuccess = !0, !!successFn && successFn();
          });
        },
        WeChat.prototype.getTicket = function(url, successFn) {
          ajax({
            method: "GET",
            url: ncc.url + "/oauth2/third/wechat/config?url=" + encodeURIComponent(url),
            //url: location.origin + "/weixin/getTicket?url=" + encodeURIComponent(url),
            success: function(data) {
              data = JSON.parse(data), !!successFn && successFn(data.data);
            }
          });
        }, WeChat.prototype.init = function(appId, appSecret, appDescription, success, failed) {
          return "";
        }, WeChat.prototype.login = function(successFn, failedFn) {},
        WeChat.prototype.limitShareScene = function(params, successFn, failedFn) {
          this.shareToSessionScene(params, successFn, failedFn),
            this.shareToTimeQQ(params, successFn, failedFn),
            this.shareToTimeQZone(params, successFn, failedFn),
            this.shareToTimelineScene(params, successFn, failedFn);
        }, WeChat.prototype.shareToSessionScene = function(params, successFn, failedFn) {
          weixinReady.promise.then(function() {
            wx.onMenuShareAppMessage({
              title: params.title,
              desc: params.desc,
              link: params.link,
              imgUrl: params.imgUrl,
              type: params.type,
              dataUrl: params.dataUrl,
              success: function(res) {
                !!successFn && successFn(res);
              },
              cancel: function() {},
              fail: function(res) {
                !!failedFn && failedFn(res);
              }
            });
          });
        }, WeChat.prototype.shareToTimelineScene = function(params, successFn, failedFn) {
          weixinReady.promise.then(function() {
            wx.onMenuShareTimeline({
              title: params.title,
              link: params.timelineLink || params.link,
              imgUrl: params.imgUrl,
              success: function() {
                !!successFn && successFn();
              },
              cancel: function() {},
              fail: function(res) {
                !!failedFn && failedFn(res);
              }
            });
          });
        }, WeChat.prototype.shareToTimeQQ = function(params, successFn, failedFn) {
          weixinReady.promise.then(function() {
            wx.onMenuShareQQ({
              title: params.title,
              desc: params.desc,
              link: params.link,
              imgUrl: params.imgUrl,
              success: function(res) {
                !!successFn && successFn(res);
              },
              cancel: function() {},
              fail: function(res) {
                !!failedFn && failedFn(res);
              }
            });
          });
        }, WeChat.prototype.shareToTimeQZone = function(params, successFn, failedFn) {
          weixinReady.promise.then(function() {
            wx.onMenuShareQZone({
              title: params.title,
              desc: params.desc,
              link: params.link,
              imgUrl: params.imgUrl,
              success: function(res) {
                !!successFn && successFn(res);
              },
              cancel: function() {},
              fail: function(res) {
                !!failedFn && failedFn(res);
              }
            });
          });
        }, WeChat.prototype.shareText = function(type, text, successFn, failedFn) {
          var params = new WexinShareParam;
          params.desc = text, params.type = "text", this[type](params, successFn, failedFn);
        }, WeChat.prototype.shareImageWithUrl = function(type, imageUrl, title, successFn, failedFn) {
          var params = new WexinShareParam;
          params.type = "image", params.imgUrl = imageUrl, params.title = title, this[type](params, successFn, failedFn);
        }, WeChat.prototype.shareImageWithData = function(type, imageData, title, successFn, failedFn) {}, WeChat.prototype.shareLinkWithThumbData = function(type, url, thumbData, title, successFn, failedFn) {}, WeChat.prototype.shareLinkWithThumbUrl = function() {}, WeChat.prototype.shareLink = function(type, url, title, successFn, failedFn) {
          var params = new WexinShareParam;
          params.type = "link", params.title = title, params.link = url, this[type](params, successFn, failedFn);
        }, WeChat.prototype.pay = function(params, successFn, failedFn) {
          isInitSuccess || window.plugins.toast.showExShortCenter("支付服务调用失败."), wx.chooseWXPay({
            timestamp: params.timeStamp + "",
            nonceStr: params.nonceStr,
            "package": params.package,
            signType: params.signType,
            paySign: params.paySign,
            success: function(res) {
              !!successFn && successFn(res);
            },
            fail: function(res) {
              !!failedFn && failedFn({
                error: "fail"
              });
            },
            cancel: function() {
              !!failedFn && failedFn({
                error: "cancel"
              });
            },
            trigger: function() {}
          });
        }, WeChat.prototype.getQueryString = function(name) {
          var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"),
            addr = window.location.href.split("?");
          if (addr.length <= 1)
            return null;
          var r = addr[1].match(reg);
          return null != r ? window.unescape(r[2]) : null;
        }, WeChat.prototype.storageSet = function(name) {
          var curTime = new Date().getTime();
          var millisecond = curTime.valueOf();
          curTime = $filter('date')(curTime, "yyyy-MM-dd HH:mm:ss");
          var setData = {value: data, time: curTime};
          setData['expireTime'] = '';
          if (expireTime) {
            millisecond += parseInt(expireTime)*1000;
            setData['expireTime'] = $filter('date')(millisecond, "yyyy-MM-dd HH:mm:ss");
          }
          return localStorageService.set(key, setData);
        }, WeChat.prototype.storageGet = function(name) {
          function hasPrototype(object,name){
            return object.hasOwnProperty(name)&&(name in object);
          }
          var curTime = new Date().getTime();
          curTime = $filter('date')(curTime, "yyyy-MM-dd HH:mm:ss");
          var data = localStorageService.get(key);
          //如果存储的数据是对象, 并且有过期时间
          if (angular.isObject(data)) {
            if (hasPrototype(data, 'expireTime')) {
              if (data.expireTime) {
                (curTime > data.expireTime) && (data.value = '');
              }
              data = data.value;
            }
          }
          return data;
        }, WeChat.prototype.storageRemove = function(name) {
          return localStorageService.remove(key);
        }, WeChat.prototype.getCookies = function(systemConfig, successFn) {
          if (this.code) {
            ajax({
              method: "GET",
              url: systemConfig.loginApi + systemConfig.wechatUrl + '?code=' + this.code,
              success: function(data) {
                data = JSON.parse(data);
                if (angular.isObject(data.data)) {
                  setTimeout(function() {
                    var injector = angular.element(document.body).injector();
                    if (injector == undefined) return;
                    myLocalStorage = injector.get('Session');
                    //openid保存10小时
                    myLocalStorage.set("openId", data.data.openId, 36000);
                    myLocalStorage.set("wxToken", data.data.accessToken);
                  });
                  // localStorage.setItem("openId", data.data.openId);
                  // localStorage.setItem("wxToken", data.data.accessToken);
                }!!successFn && successFn();
              }
            });
          }
        }, WeChat.prototype.getAccessToken = function(successFn, failedFn) {
          var self = this,
            openid = self.getOpenId();
          ajax({
            method: "GET",
            url: ncc.host + "/wechat/refresh/" + openid,
            success: function(data) {
              setTimeout(function() {
                var injector = angular.element(document.body).injector();
                if (injector == undefined) return;
                myLocalStorage = injector.get('Session');
                data ? (data = JSON.parse(data), //localStorage.setItem("accessToken", data.access_token), 
                  myLocalStorage.set("accessToken", data.access_token),
                  !!successFn && successFn({
                  accessToken: data.access_token,
                  openid: data.openid,
                  userId: data.user_id
                })) : window.location.reload();
              });

            }
          });
        }, WeChat.prototype.weixinAuth = function(redirectUrl) {
          if (!this.code || (redirectUrl != undefined && redirectUrl.length>0)) {
            var redirect = window.location.href;
            if (redirect.indexOf('#') < 0 || (location.hash).length < 2) {
              //redirect = location.origin + '/#/tab/index';
            }
            setTimeout(function() {
              var injector = angular.element(document.body).injector();
              if (injector == undefined) return;
              myLocalStorage = injector.get('Session');
              var url = ncc.url + "/oauth2/third/wechat/auth?redirect=",
                nowUrl = encodeURIComponent((redirect));
              myLocalStorage.set("nowUrl", redirect);
              //localStorage.setItem('nowUrl', redirect);
              window.location.replace(url + (redirectUrl || nowUrl));
            });
          }
        }, WeChat.prototype.getOpenId = function() {
          setTimeout(function() {
            var injector = angular.element(document.body).injector();
            if (injector == undefined) return;
            myLocalStorage = injector.get('Session');
            openid = myLocalStorage.get("openId")
          });
          var self = this;
            //openid = localStorage.getItem("openId"); //self.getCookies("openid"); //
          return openid;
        }, WeChat.prototype.hideOptionMenu = function() {
          window.wx.hideOptionMenu();
        }, WeChat.prototype.showMenuItems = function(items, successFn) {
          void 0 === items && (items = ["menuItem:share:appMessage", "menuItem:share:timeline", "menuItem:favorite"]), void 0 === successFn && (successFn = function() {}), wx.showOptionMenu(), wx.showMenuItems({
            menuList: items,
            success: function() {
              successFn();
            }
          });
        }, WeChat.prototype.hideMenuItems = function(items, successFn) {
          void 0 === items && (items = []), void 0 === successFn && (successFn = function() {}), window.wx.ready(function() {
            0 == items.length && (items = ["menuItem:share:appMessage", "menuItem:share:timeline", "menuItem:share:qq", "menuItem:share:weiboApp", "menuItem:share:facebook", "menuItem:share:QZone", "menuItem:copyUrl", "menuItem:delete", "menuItem:editTag", "menuItem:share:brand"]),
              wx.hideMenuItems({
                menuList: items,
                success: function() {
                  successFn();
                }
              });
          });
        }, WeChat.prototype.showMenu = function(isFriendOnly, successFn, failFn) {
          void 0 === isFriendOnly && (isFriendOnly = !1), void 0 === successFn && (successFn = null), void 0 === failFn && (failFn = null);
          var isFriendOnly = !0;
          wx.showOptionMenu(), window.wx.ready(function() {
            wx.hideMenuItems({
              menuList: ["menuItem:share:appMessage", "menuItem:share:timeline", "menuItem:share:qq", "menuItem:share:weiboApp", "menuItem:favorite", "menuItem:share:facebook", "menuItem:jsDebug", "menuItem:editTag", "menuItem:delete", "menuItem:copyUrl", "menuItem:originPage", "menuItem:readMode", "menuItem:openWithQQBrowser", "menuItem:openWithSafari", "menuItem:share:email", "menuItem:share:brand", "menuItem:share:QZone"],
              success: function() {
                var items = ["menuItem:share:appMessage", "menuItem:copyUrl", "menuItem:share:timeline"]; //["menuItem:share:appMessage", "menuItem:share:timeline","menuItem:share:qq", "menuItem:share:weiboApp", "menuItem:copyUrl", "menuItem:originPage", "menuItem:readMode", "menuItem:openWithQQBrowser", "menuItem:openWithSafari", "menuItem:share:email", "menuItem:share:QZone"];
                //isFriendOnly || items.push("menuItem:share:timeline"),
                wx.showMenuItems({
                  menuList: items,
                  success: function() {
                    !!successFn && successFn();
                  },
                  fail: function() {
                    !!failFn && failFn();
                  }
                });
              },
              fail: function() {
                !!failFn && failFn();
              }
            });
          });
        }, WeChat.prototype.uploadImg = function(loadsucess) {
          wx.chooseImage({
            count: 5,
            sizeType: ["compressed"],
            sourceType: ["album", "camera"],
            success: function(res) {
              var localIds = res.localIds;
              loadsucess(localIds);
            }
          });
        }, WeChat;
    }(),
    ajax = function(obj) {
      if (!obj.url)
        return !1;
      var method = obj.type || "GET",
        async = obj.async || !0,
        dataType = obj.dataType,
        XHR = window.XMLHttpRequest ? new XMLHttpRequest : new ActiveXObject("Microsoft.XMLHTTP");
      XHR.open(method, obj.url, async), XHR.setRequestHeader("If-Modified-Since", "Thu, 06 Apr 2006 00:00: 00 GMT"), XHR.send(null), obj.sendBefore && obj.sendBefore(), XHR.onreadystatechange = function() {
        4 == XHR.readyState && (XHR.status >= 200 && XHR.status < 300 || 304 == XHR.status) ? (obj.success && (dataType && "json" === dataType.toLocaleLowerCase() ? obj.success(eval("(" + XHR.responseText + ")")) : dataType && "xml" === dataType.toLocaleLowerCase() ? obj.success(XHR.responseXML) : obj.success(XHR.responseText)), obj.complete && obj.complete(XHR)) : (obj.complete && obj.complete(XHR), obj.error && obj.error("The XMLHttpRequest failed. status: " + XHR.readyState));
      };
    },
    extend = function(obj1, obj2) {
      var temp = new WexinConfig;
      for (var i in obj1)
        temp[i] = obj1[i];
      for (var j in obj2)
        temp[j] = obj2[j];
      return temp;
    };
  window.wx.error(function(res) {
    console.log(JSON.stringify(res));
  }), window.wx.ready(function() {
    weixinReady.resolve();
  }), ncc.pluginManager.register("window.plugins.wechat", new WeChat);
  if (!window.plugins.hasOwnProperty('wechat')) window.plugins.wechat = new WeChat;
}(ncc || (ncc = {}));

function onMenuShareAppMessage() {
  wx.onMenuShareAppMessage({
    title: '互联网之子 方倍工作室',
    desc: '在长大的过程中，我才慢慢发现，我身边的所有事，别人跟我说的所有事，那些所谓本来如此，注定如此的事，它们其实没有非得如此，事情是可以改变的。更重要的是，有些事既然错了，那就该做出改变。',
    link: 'http://movie.douban.com/subject/25785114/',
    imgUrl: 'http://img3.douban.com/view/movie_poster_cover/spst/public/p2166127561.jpg',
    trigger: function(res) {
      alert('用户点击发送给朋友');
    },
    success: function(res) {
      alert('已分享');
    },
    cancel: function(res) {
      alert('已取消');
    },
    fail: function(res) {
      alert(JSON.stringify(res));
    }
  });
  alert('已注册获取“发送给朋友”状态事件');
}