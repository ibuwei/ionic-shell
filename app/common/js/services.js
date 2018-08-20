/**
 * commonFn 公用的服务层
 * @author lvwei
 * @date   2017-11-29T16:04:01+0800
 * @param  {[type]}                 ng [description]
 * @param  {[type]}                 jp [description]
 * @return {[type]}                    [description]
 */
(function(ng, jp) {
  angular.module('app.services').factory('commonFn', commonFn);
  commonFn.$inject = ['$rootScope', '$timeout', '$state', '$http', '$ionicSlideBoxDelegate'];

  function commonFn($rootScope, $timeout, $state, $http, $ionicSlideBoxDelegate) {
    return {
      signFn: function(api, token, userId) { //获取sign
        var url = api + "?token=" + token + "&user_id=" + userId;
        //console.log('url:' + url);
        sign = md5(url);
        return sign;
      }
    };

  }
})(angular, jsonpath);
//通用方法 ----> 获取广告、说明文章，参数： id，返回使用promise 等等、、、、、
(function(ng, jp) {
  "use strict";
  angular.module('app.services')
    .factory('toolBox', toolBox); /*缺少 'ShoppingCart', 'DataService'*/

  /* @ngInject */
  toolBox.$inject = ['$q', '$filter', '$http', 'systemConfig', '$ionicPopup', '$ionicLoading',
    '$window', 'Session', 'globalLoginOption', '$state', '$rootScope', '$location',
    '$ionicViewSwitcher', '$timeout', 'globalPluploadOption', 'sessionStorage',
    'msgService', 'ionicClosePopupService', 'Upload'
  ];

  function toolBox($q, $filter, $http, systemConfig, $ionicPopup, $ionicLoading, $window, Session, globalLoginOption, $state, $rootScope, $location, $ionicViewSwitcher, $timeout, globalPluploadOption, sessionStorage, msgService, ionicClosePopupService, Upload) {
    var service = {
      refreshToken: refreshToken, //刷新token
      //获取广告位信息
      getAdvertisement: getAdvertisement,
      //取得关于文章信息
      getFaq: getFaq,
      //客服方法
      addkefuNumber: addkefuNumber,
      refreshKefu: refreshKefu,
      //立即购买
      buyNow: buyNow,
      msgToast: msgToast, //根据 code 提示信息
      //弹框提示
      popup: popup,
      //http 请求的方法
      http: httpRequest,
      //标签聚
      onFocus: onFocus,
      hasPrototype: hasPrototype,
      showLoading: function() {
        $ionicLoading.show();
      },
      hideLoading: function() {
        $timeout(function() {
          $ionicLoading.hide();
        }, 100);
      },
      getFName: function(fn) { //取得函数名称
        return (/^[\s\(]*function(?:\s+([\w$_][\w\d$_]*))?\(/).exec(fn.toString())[1] || '';
      },
      isEmptyObject: isEmptyObject,
      triggerScrollViewPullToRefresh: triggerScrollViewPullToRefresh,
      //http promise
      multiHttpRequest: multiHttpRequest,
      recordBackHistory: recordBackHistory,
      goBack: goBack,
      getLastHistory: getLastHistory, //取得当前页的来源页
      direction: directionAnimation, //页面跳转动画
      getParam: getParam, //将 url 的[参数]解析成对象
      urlParse: urlParse, //将 url 解析成对象
      pluploadErrorEvent: pluploadErrorEvent, //plupload 文件上传插件错误处理事件
      mapFields: mapFields, //字段映射方法
      getMsgByCode: getMsgByCode, //根据异常代码取得提示信息
      regex: regex, // 正则校验
      uploadFile: uploadFile, //文件上传
      uiSwpierConfig: { // 滑块默认全局配置信息
        parallax: true,
        autoplay: 3000,
        loop: true,
        // allowSwipeToPrev: true,
        // allowSwipeToNext: true,
        autoplayDisableOnInteraction: false,
        pagination: '.swiper-pagination',
        paginationClickable: true,
      },
      getDefer: getDefer,
      sortarr: sortarr, //冒泡排序
      countDown: countDown, //倒计时 

    };

    /**
     * 给 msgToast 请求增加top方法
     * */
    msgToast.top = function(code, replace, duration) {
      if (!code) reutrn;
      return (new this).showMsg(code, replace, 'top', duration);
    };
    /**
     * 给 msgToast 请求增加center方法
     * */
    msgToast.center = function(code, replace) {
      if (!code) reutrn;
      return (new this).showMsg(code, replace, 'center', duration);
    };

    /**
     * 给 http 请求增加get方法
     * */
    httpRequest.get = function(config) {
      !(config instanceof Object) && (config = {});
      config.method = 'get';
      return (new this).request(config);
    };
    /**
     * 给 http 请求增加post方法
     * */
    httpRequest.post = function(config) {
      !(config instanceof Object) && (config = {});
      config.method = 'post';
      return (new this).request(config);
    };
    //跳转动画: 向前
    directionAnimation.forward = function(state) {
      return new this('forward', state);
    };
    //跳转动画: 向后
    directionAnimation.back = function(state) {
      return new this('back', state);
    };
    //跳转动画: 无
    directionAnimation.none = function(state) {
      return new this('none', state);
    };
    return service;

    //过期时间 刷新token  <=3600s
    function refreshToken() {
      var defered = $q.defer();
      var refresh = Session.get('refreshToken');
      if (refresh != null) {
        var expTime = refresh.expirationTime - parseInt((new Date().getTime() - refresh.nowTime) / 1000, 10);
        var reExpTime = parseInt(refresh.expirationTime / 3, 10);
        if (expTime <= reExpTime) {
          var params = {
            appid: globalLoginOption.APP_ID,
            secret: globalLoginOption.SECRET,
            grant_type: globalLoginOption.REFRESH_TYPE,
            refresh_token: refresh.refresh_token
          };
          defered.resolve(true);
          // $http.post(systemConfig.loginApi + systemConfig.refreshToken, {
          //     params: params
          //   })
          //   .then(function(res) {
          //     var result = res.data;
          //     if (result.resultCode == 1000) {
          //       var data = result.data;
          //       var refresh_token = {
          //         refresh_token: data.refresh_token,
          //         expirationTime: data.expirationTime,
          //         nowTime: result.nowTime
          //       };
          //       Session.set('refreshToken', refresh_token);
          //       Session.setToken(data.access_token);
          //       // Session.set('authorizationToken', data.access_token);
          //     }
          //     defered.resolve(result);
          //   }, function(error) {
          //     defered.reject(error.data);
          //   });
        } else {
          defered.reject(false);
        }
      } else {
        defered.reject(false);
      }
      return defered.promise;
    }

    //获取广告位信息
    function getAdvertisement(id) {
      var config = {
        method: 'get',
        url: systemConfig.Advertisement,
        params: {
          positionId: id
        }
      };
      return service.http(config)
        .success(function(response) {
          return response.data;
        })
        .error(function(response) {
          console.log("Error Message: ", response);
        });
    }
    //
    function getFaq(id) {
      var config = {
        method: 'get',
        url: systemConfig.faqById,
        params: {
          id: id
        }
      };
      return service.http(config)
        .success(function(response) {
          return response.data;
        })
        .error(function(response) {
          console.log("Error Message: ", response);
        });
    }
    //客服方法
    function addkefuNumber() {
      var config = {
        method: 'get',
        url: systemConfig.addKefuMember,
        params: {}
      };
      return service.http(config)
        .success(function(response) {
          return response;
        })
        .error(function(error) {
          console.debug("Error Message: ", error);
        });
    }
    //刷新客服页
    function refreshKefu(param) {
      var config = {
        method: 'get',
        url: systemConfig.refreshKefu,
        params: param
      };
      return service.http(config)
        .success(function(response) {
          return response;
        });
    }
    //立即购买
    function buyNow(param) {
      var config = {
        method: 'get',
        url: systemConfig.goodsById,
        params: {
          ignoreAuthModule: true
        }
      };
      return service.http(config)
        .success(function(response) {
          if (response.success) {
            ShoppingCart.createOrder(DataService.handleGoodsData(response.data));
          }
        });
    }
    /**
     * 根据 code 提示 toast 消息
     * @param code {String} 必填,这里可以是 msg.service.js 中定义好的信息提示代码, 也可以是直接显示的字符串
     * @param replace {Array} 可选参数, 这个参数可以用来替换 msg.service.js 中定义好的信息提示 内容中的%s
     * */
    function msgToast(code, replace, duration, position) {
      var vm = this;
      //将 http 请求变成内置方法
      vm.showMsg = function(code, replace, duration, position) {
        $rootScope.$broadcast('event:message-error-toast', code, replace, position || 'center', duration);
      };
      $rootScope._isBlockToastMessage = true; //拦截框架默认的 toast 消息
      $rootScope._isBlockPopupMessage = true; //拦截框架默认的  popup 提示
      return vm.showMsg(code, replace, duration, position);

    }
    //弹框提示
    function popup(type, options, ok, cancel) {
      // 弹出框信息配置
      var popupOptions = {
        title: options.title || '提示信息',
        subTitle: options.subTitle || '',
        cssClass: options.cssClass || 'text-center',
        template: options.template || '',
        templateUrl: options.templateUrl || '',
        okText: options.okText || '确定',
        cancelText: options.cancelText || '取消',
        backdropClickToClose: options.backdropClickToClose || false
      };

      $rootScope._isBlockToastMessage = true; //拦截框架默认的 toast 消息
      $rootScope._isBlockPopupMessage = true; //拦截框架默认的  popup 提示
      function isFunc(test) {
        return typeof test == 'function';
      }
      var popupModal = null;
      if (type == 'confirm') {
        popupOptions.okType = options.okType || '';
        popupOptions.cancelType = options.cancelType || '';
        popupModal = $ionicPopup.confirm(popupOptions);
        popupModal.then(function(res) {
          if (res) {
            if (options.ok && isFunc(options.ok)) options.ok();
            if (isFunc(ok)) ok();
          } else {
            if (options.cancel && isFunc(options.cancel)) options.cancel();
            if (isFunc(cancel)) cancel();
          }
        }).finally(function() {
          // 在执行取消和确认操作后回复标识
          $rootScope._isBlockPopupMessage = false;
        });
      } else {
        // if (!options.okText) options.okText = '确定';
        popupModal = $ionicPopup.alert(popupOptions);
        popupModal.then(function(res) {
          if (res) {
            if (options.ok && isFunc(options.ok)) options.ok();
            if (isFunc(ok)) ok();
          }
        });
      }
      //popup 窗口点击空白处关闭的事件注册
      if (popupOptions.backdropClickToClose === true) {
        ionicClosePopupService.register(popupModal);
      }
      if (popupModal) $rootScope._popupModal = popupModal;
      return popupModal;
    }
    //focus 方法
    function onFocus(id) {
      // timeout makes sure that it is invoked after any other event has been triggered.
      // e.g. click events that need to run before the focus or
      // inputs elements that are in a disabled state but are enabled when those events
      // are triggered.
      $timeout(function() {
        var element = $window.document.getElementById(id);
        if (element)
          element.focus();
      });
    }
    //判断对象是否有查找的属性
    function hasPrototype(object, name) {
      return object.hasOwnProperty(name) && (name in object);
    }
    /** 判断对象是否为空
     * @param  { object } e 将对象传入
     * @return {Boolean}
     */
    function isEmptyObject(e) {
      var t;
      for (t in e)
        return !1;
      return !0;
    }
    //滚动触发事件
    function triggerScrollViewPullToRefresh(scrollView) {
      scrollView.__publish(
        scrollView.__scrollLeft, -scrollView.__refreshHeight,
        scrollView.__zoomLevel, true);

      var d = new Date();

      scrollView.refreshStartTime = d.getTime();

      scrollView.__refreshActive = true;
      scrollView.__refreshHidden = false;
      if (scrollView.__refreshShow) {
        scrollView.__refreshShow();
      }
      if (scrollView.__refreshActivate) {
        scrollView.__refreshActivate();
      }
      if (scrollView.__refreshStart) {
        scrollView.__refreshStart();
      }
    }

    //记录回退历史
    function recordBackHistory(toState, toParams, fromState, fromParams) {
      //var myRouter = $window.sessionStorage.getItem('_app_router');
      var myRouter = sessionStorage.get('_app_router') || [];
      var myStates = sessionStorage.get('_app_states') || [];
      if (ng.isString(myRouter)) myRouter = [];
      if (fromState.url != '^') { //当前页没有被刷新的话, 也就是 上一页 是 url, 才做后退历史记录
        //取得上一来源 url(previousUrl) 和当前访问的 url(curUrl)
        var previousUrl = $state.href(fromState.name, fromParams);
        var curUrl = $state.href(toState.name, toParams);
        var specRouter = ['pay-fail', 'pay-success']; //,'search'
        angular.forEach(specRouter, function(item) {
          if (fromState.url.indexOf(item) >= 0) {
            $rootScope._noNeedToSave = true;
          }
        });
        //TODO $rootScope._noNeedToSave 在需要的 处理方法 中手动设置为 FALSE 后操作页将不会被记录到后退的 历史列表 中
        //TODO $rootScope._isGoBack 当点击后退按钮时会设置为 true, 既后退时不记录 上一页
        $rootScope._urlNeedSave = ($rootScope._noNeedToSave === true) ? false : true && ($rootScope._isGoBack === true) ? false : true;
        if (previousUrl == curUrl) { //如果 上一页 与 当前页 是同一个页面不做保存
          $rootScope._urlNeedSave = false;
        }
        var isSettlMent = false;
        var special_url = ['#/order-settlement'];
        angular.forEach(special_url, function(item) {
          //对结算页做特殊处理
          if (curUrl.indexOf(item) >= 0) {
            curUrl = item;
            //如果上一页是 地址选择页 或 地址编辑页, 则不记录 上一页
            if (previousUrl.indexOf('address-list') >= 0 || previousUrl.indexOf('edit-address') >= 0) {
              $rootScope._urlNeedSave = false;
              isSettlMent = true;
            }
            return false;
          }
        });
        //如果缓存中没有 url 数据则直接赋值
        if (myRouter.length <= 0) {
          if ($rootScope._urlNeedSave) {
            myRouter.push(previousUrl);
            myStates.push(fromState.name);
          }
        } else { //如果缓存中已经有内容, 则判断列表中是否存在将要添加的上一页
          //myRouter = myRouter.split(',');
          var urlPos = myRouter.indexOf(previousUrl);
          if (urlPos < 0) { //此 上一页 不存在, 则添加
            if ($rootScope._urlNeedSave) {
              myRouter.push(previousUrl);
              myStates.push(fromState.name);
            }
            //如果 当前页 的地址在列表中存在, 则删除 当前页 及以后的url
            if (isSettlMent) {
              var urlPos = -1,
                i = 0;
              while (urlPos < 0 && myRouter[i]) { //直到取得 order-settlement 在列表中的位置后退出循环
                urlPos = (myRouter.length > 0) ? myRouter[i].indexOf(curUrl) : 0;
                i++;
              }
              if (urlPos >= 0) urlPos = i - 1; //最后一次 i++ 了, 所以要减掉
            } else { //后退历史中没有结算页的话, 直接取得 当前页 位置
              var urlPos = myRouter.indexOf(curUrl);
            }
            if (urlPos >= 0) {
              if (isSettlMent) { //后退历史中有 结算页 则删除结算页以后的历史
                myRouter.splice(urlPos);
                myStates.splice(urlPos);
              } else { //历史无结算页时只删除 当前页 历史
                myRouter.splice(urlPos, 1);
                myStates.splice(urlPos, 1);
              }
            }
          } else if (urlPos && previousUrl.indexOf('#/login') >= 0) {
            //如果是 login 页, 保留所有来源历史
            var spliceFlag = true; //是否需要删除历史
            if ($rootScope._isGoBack === false) {
              if ($rootScope._urlNeedSave) {
                myRouter.push(previousUrl);
                myStates.push(fromState.name);
                spliceFlag = false;
              }
            }
            if (spliceFlag) {
              myRouter.splice(urlPos);
              myStates.splice(urlPos);
            }
          } else { //如果 上一页 存在, 则找到地址并删除
            myRouter.splice(urlPos);
            myStates.splice(urlPos);
          }
        }
        //$window.sessionStorage.setItem('_app_router',myRouter);
        sessionStorage.set('_app_router', myRouter);
        sessionStorage.set('_app_states', myStates);
        $rootScope._noNeedToSave = $rootScope._isGoBack = false;
      } else {
        //sessionStorage.set('_app_router', '')
      }
    }
    //后退按钮事件
    function goBack(backto, noNeedToSave) {
      if (noNeedToSave === true) $rootScope._noNeedToSave = true;
      $rootScope._isGoBack = true; //设置后退的状态
      //var myRouter = $window.sessionStorage.getItem('_app_router');//取得反退历史列表
      var myRouter = sessionStorage.get('_app_router') || []; //取得反退历史列表
      var myStates = sessionStorage.get('_app_states') || []; //取得反退历史state
      if (ng.isString(myRouter)) myRouter = [];
      //如果指定了后退的页面名称
      if (backto && backto != -1) {
        //在路由配置信息中查找是否存在要后退的路由
        var specState = jp.value($state.get(), sprintf('$..[?(@.name=="%s")]', backto));
        if (specState) {
          //如果要后退的地址存在后退列表中
          var pos = myStates.lastIndexOf(backto);
          if (pos >= 0) {
            //在后退历史中删除此地址, 并执行后退事件
            var arr = myRouter.splice(pos);
            myStates.splice(pos);
            sessionStorage.set('_app_router', myRouter);
            sessionStorage.set('_app_states', myStates);
            var params = {};
            if (ng.isArray(arr) && arr.length > 0) {
              var urlState = service.urlParse(arr[0].replace('\#', ''));
              params = service.getParam(urlState.search);
            }
            service.direction.back({
              name: specState.name,
              params: params || {}
            });
            return;
          }
        }
      }

      //后退到上一页的处理, 如果后退历史不为空
      if (myRouter.length > 0) {
        var urlItem = myRouter.pop(); //取得列表中最后一个 url
        myStates.pop();
        //如果当前页与后退历史中的页面一致, 则继续后退
        while (urlItem == location.hash) {
          if (myRouter.length > 0) {
            urlItem = myRouter.pop();
            myStates.pop();
          } else {
            urlItem = '';
          }
        }
        //如果没有可后退的 url, 直接跳转首页
        if (!urlItem) {
          $state.go('tab.index');
        } else {
          var backFlag = true;
          //var urlState = $location.url(urlItem.replace('\#',''));//将 url 格式化
          var urlState = service.urlParse(urlItem.replace('\#', ''));
          var params = service.getParam(urlState.search);
          //var test_state = jp.value($state.get(), '$..[?(@.$$state)]');
          angular.forEach($state.get(), function(state) {
            if (!state.$$state) return;
            var privatePortion = state.$$state();
            var match = privatePortion.url.exec(urlState.pathname);
            if (match) {
              backFlag = false;
              sessionStorage.set('_app_router', myRouter);
              sessionStorage.set('_app_states', myStates);
              //service.direction.back({name: specState.name});
              $state.go(state.name, params, {
                reload: true
              });
              return;
            }
          });
          if (backFlag == !0) {
            $state.go('tab.index');
          }
        }
      } else {
        $state.go('tab.index');
      }
      // 增加后退动画白名单，若匹配白名单则使用特定动画效果
      var curUrl = $location.path(); // 获取当前地址
      var backWhiteList = ['/search']; // 后退白名单地址列表
      var backStyle = 'back'; // 默认后退动画

      if (backWhiteList.indexOf(curUrl) > -1)
        backStyle = "enter";
      else
        backStyle = "back";
      $ionicViewSwitcher.nextDirection(backStyle);
    }
    /**
     * 取得当前页的来源页
     * @author lvwei
     * @date   2017-09-18T11:36:59+0800
     * @return {[type]}                 [description]
     */
    function getLastHistory() {
      var myRouter = sessionStorage.get('_app_router') || []; //取得反退历史列表
      if (myRouter.length > 0) { //如果后退历史有数据, 则取得最后一条数据
        return myRouter[myRouter.length - 1];
      }
      return '';
    }

    /**
     * 页面跳转动画
     * @param state {object} 包含属性: name(跳转的 state 名称), params(参数), options(其他选项)
     * */
    function directionAnimation(type, state) {
      var flag = false;
      if (type == 'forward') {
        flag = true;
      } else if (type == 'back') {
        flag = true;
      } else if (type == 'none') {
        flag = true;
      }
      if (flag) $ionicViewSwitcher.nextDirection(type);
      $state.go(state.name, state.params, state.options);
    }
    /* Http Request
     * @param method: 请求方式
     * @param url: 接口地址 不需要前缀[systemConfig.url]
     * @param param: 接口参数
     * @return { promise } 返回一个 promise
     * */
    function httpRequest(config) {
      var vm = this;
      //将 http 请求变成内置方法
      vm.request = doRequest;
      if (config) {
        return vm.request(config);
      }
      //去请求
      function doRequest(http_config) {
        var deferred = $q.defer();
        //刷新token
        refreshToken().then(refreshSuccess, refreshReject).finally(refreshFinally);

        return deferred.promise;
        //刷新 token 的 success
        function refreshSuccess(res) {
          return res;
        }
        //刷新 token 的 reject
        function refreshReject(error) {
          if (ng.isObject(error) && toolBox.hasPrototype(error, 'resultCode')) {
            //如果提示的错误为 2016, 则通知退出事件
            if (error.resultCode == 2016) {
              $rootScope.$broadcast('event:auth-userLoginOut', error);
            }
          }
          return error;
        }
        //刷新 token 的 finally
        function refreshFinally() {
          //判断 http_config 参数是否为对象
          if (!ng.isObject(http_config)) return;
          var config = {
            method: http_config.method || "get",
            //新增 _api_path(参数) 自定义的请求地址, 如果有需要可增加此参数来自定义请求地址
            url: (http_config._api_path || systemConfig.url) + http_config.url,
            params: http_config.params || {}
          };
          // if (!service.hasPrototype(config.params, 'sign')) {
          //   var sign = md5(http_config.url + "?token=" + Session.getToken() + "&user_id=");
          //   config.params['sign'] = sign;
          // }
          //如果 token 存在
          if (!service.hasPrototype(config.params, 'token') && Session.getToken()) {
            config.params['token'] = Session.getToken();
          }
          //增加随机数参数, 防止接口数据缓存
          if (config.url.indexOf('?') >= 0) {
            config.url = sprintf('%s&_rand=%s', config.url, Math.random());
          } else {
            config.url = sprintf('%s?_rand=%s', config.url, Math.random());
          }
          if ($rootScope.isDebug) {
            deferred.resolve();
            return deferred.promise;
          }
          $http[ng.lowercase(config.method)](config.url, {
              params: config.params
            })
            .then(function(response) {
              deferred.resolve(response.data);
            }, function(error) {
              //如果 状态为-1, 并且 timeout 已设置
              if (error.status == -1 && error.config.timeout > 0) {
                var timestamp = new Date().getTime(); //取得当前时间
                //当前时间减去上一次提示的时间为3秒, 则提示请求超时
                if (!$rootScope.showTimeOutTimestamp ||
                  ($rootScope.showTimeOutTimestamp && (timestamp - $rootScope.showTimeOutTimestamp) >= 3000)) {
                  $rootScope.showTimeOutTimestamp = new Date().getTime();
                  $rootScope.$broadcast('event:message-error-toast', error.status);
                }
              }
              // if (error.status == 0) {
              //   $rootScope.$broadcast('event:message-error-toast', error.status);
              // }
              //如果是接口返回的正常错误信息, 则将接口的错误返回
              if (angular.isObject(error.data) && service.hasPrototype(error.data, 'resultCode')) {
                if (error.headers('__login_token__')) {
                  $rootScope.loginToken = error.headers('__login_token__');
                }
                deferred.reject(error.data);
              } else { //如果是 http 请求的相关错误, 则整个错误信息返回
                deferred.reject(error);
              }
            });
        }
      }
    }

    //多个 http 请求
    function multiHttpRequest(requestList) {
      if (requestList.length > 0) {
        return $q.all(requestList);
      } else {
        return false;
      }
    }
    /**
     * 将 url 的[参数]解析成对象
     * @param url
     * @returns {Object}
     */
    function getParam(url) {
      var strs = [],
        theRequest = new Object,
        index = url.lastIndexOf("?");
      if (-1 != index) {
        var str = url.substr(index + 1);
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++)
          theRequest[strs[i].split("=")[0]] = window.decodeURIComponent(strs[i].split("=")[1]);
      }
      return theRequest;
    }

    /**
     * 将 url 解析成对象
     * @param url
     * @returns {{href: (*|args), protocol: (*|string|null), host: *, hostname: *, port: (*|Function|string|null), pathname: (*|ALY.HttpRequest.pathname|string|null|string), hash: (*|$location.hash|Function|Eg.hash|string|null), search: *}}
     */
    function urlParse(url) {
      var parser = document.createElement('a');
      parser.href = url;
      return {
        href: parser.href,
        protocol: parser.protocol,
        host: parser.host,
        hostname: parser.hostname,
        port: parser.port,
        pathname: parser.pathname,
        hash: parser.hash,
        search: parser.search
      };
    }

    /**
     * plupload 文件上传插件错误处理事件
     * @param uploader
     * @param error
     */
    function pluploadErrorEvent(uploader, error) {
      if (error.resultCode == '-602') {
        //alert('已有相同的图片, 请误重复上传');
        service.msgToast('已有相同的图片, 请误重复上传');
      } else if (error.resultCode == '-600') {
        service.msgToast(sprintf('当前上传文件大小超过%s, 文件添加失败!', globalPluploadOption.max_file_size));
      }
    }

    /**
     * 对象字段映射
     * */
    function mapFields(fields, o) {
      if (o instanceof Array) { //判断对象是否为数组
        var json = JSON.stringify(o); //将数组对象转成字符串
        ng.forEach(fields, function(v, k) {
          //检查对象中的 key 是否在 fields 中存在, 存在则替换
          json = json.replace(eval("/\"" + k + "\":/g"), "\"" + v + "\":");
        });
        var oo = JSON.parse(json); //将字符串转回对象
        ng.forEach(oo, function(v, k) { //重新替换原数组中的值
          o[k] = v;
        });
      } else if (o instanceof Object) {
        if (!service.isEmptyObject(o)) {
          var oo = {}; //新对象
          ng.forEach(fields, function(v, k) {
            //检查对象中的 key 是否在 fields 中存在, 存在则替换
            if (service.hasPrototype(o, k)) {
              var value = o[k]; //先把值取出来
              delete o[k]; //删除原有的键
              o[v] = value; //将值赋给新的键
            }
          });
        }
      }
    }

    /**
     * 根据异常代码取得提示信息
     * */
    function getMsgByCode(code) {
      return msgService.errorMsg(code);
    }

    /**
     * 冒泡排序
     * */
    function sortarr(arr) {
      for (var i = 0; i < arr.length - 1; i++) {
        for (var j = 0; j < arr.length - 1 - i; j++) {
          if (arr[j] > arr[j + 1]) {
            var temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
          }
        }
      }
      return arr;
    }

    /**
     * 倒计时
     * */
    function countDown(t1) {
      //传进来的是正确的时间差（秒）
      var day = Math.floor((t1 / 3600) / 24);
      var hour = Math.floor((t1 / 3600) % 24);
      var minute = Math.floor((t1 / 60) % 60);
      var second = Math.floor(t1 % 60);
      var t2 = day + '天' + twoNum(hour)  + ':' + twoNum(minute) + ':' + twoNum(second);
      
      return t2;
      
      //将1位变成2位
      function twoNum(num){
        num < 10 ? num = '0'+num : '';
        return num;
      }
    }

    /**正则校验
     * @param type { String } 校验类型
     * @param params { String } 校验参数*/
    function regex(type, params) {
      var returnObj = {
        msgCode: '', // 错误码
        isMatch: true // 是否通过正则
      };
      var pattern = new RegExp();
      // var isMatch = true;
      switch (type) {
        case 'phone':
          if (!params) {
            returnObj.msgCode = 'PHONE_NULL';
            returnObj.isMatch = !1;
          } else {
            pattern = /^(13[0-9]|15[012356789]|17[013678]|18[0-9]|14[57])+\d{8}$/;
            returnObj.isMatch = pattern.test(params);
            if (!returnObj.isMatch) {
              returnObj.msgCode = 'PHONE_ERROR';
            }
          }
          break;
        case 'password':
          if (!params) {
            returnObj.msgCode = 'PASSWD_NULL';
            returnObj.isMatch = !1;
          } else {
            pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d]{6,16}$/;
            returnObj.isMatch = pattern.test(params);
            if (!returnObj.isMatch) {
              returnObj.msgCode = 'PASSWD_ERROR';
            }
          }
          break;
        case 'smscode':
          if (!params) {
            returnObj.msgCode = 'CODE_NULL';
            returnObj.isMatch = !1;
          } else {
            pattern = /^\d{6}$/;
            returnObj.isMatch = pattern.test(params);
            if (!returnObj.isMatch) {
              returnObj.msgCode = 'CODE_ERROR';
            }
          }
          break;
        case 'idCard':
          pattern = /(^\d{15}$)|(^\d{17}([0-9]|X)$)/;
          returnObj.isMatch = pattern.test(params);
          if (!returnObj.isMatch) {
            returnObj.msgCode = 'IDCARD_ERROR';
          }
          break;
        case 'zipcode':
          pattern = /^[1-9]+\d{5}$/;
          returnObj.isMatch = pattern.test(params);
          if (!returnObj.isMatch) {
            returnObj.msgCode = 'ZIPCODE_ERROR';
          }
          break
        case 'bankcard':
          if (!params) {
            returnObj.msgCode = 'BANKCARD_NULL';
            returnObj.isMatch = !1;
          } else {
            pattern = /[\d]{12,19}?/;
            returnObj.isMatch = pattern.test(params);
            if (!returnObj.isMatch) {
              returnObj.msgCode = 'BANKCARD_ERROR';
            }
          }
          break;
        case 'username':
          if (!params) {
            returnObj.msgCode = 'USERNAME_NULL';
            returnObj.isMatch = !1;
          } else {
            pattern = /[A-Za-z\u4e00-\u9fa5]{2,25}/;
            returnObj.isMatch = pattern.test(params);
            if (!returnObj.isMatch) {
              returnObj.msgCode = 'USERNAME_ERROR';
            }
          }
          break;
        default:
          returnObj.msgCode = 'REGEXP_ERROR';
          returnObj.isMatch = !1;
      }
      return returnObj;
    }
    /**
     * uploadFile 使用 ngFileUpload 插件上传文件
     * @param uploader
     * @param error
     */
    function uploadFile(file, type, options) {
      var deferred = $q.defer();
      // 校验是否存在
      if (ng.isObject(file)) {
        //提交参数格式化
        if (!options) {
          var options = {
            url: systemConfig.url + systemConfig.uploadImg,
            data: {
              imgFile: file,
              uploadType: type || "good"
            }
          };
        } else {
          var options = options;
          options.data['imgFile'] = file;
          options.data['uploadType'] = options.data['uploadType'] ? options.data['uploadType'] : type || "good";
        }
        //调用文件上传
        if (ng.isObject(options.headers) && options.headers.isUploadFile) {
          options.data['file'] = file;
          options.data['imgFile'] = null;
        } else {
          options.data['imgFile'] = file;
        }
        //6118242 //大于2M
        if (file.size > 2000000) {
          var resizeOptions = {
            quality: 0.9,
            ratio: '1:2'
          };
          //给文件进行压缩
          Upload.resize(file, resizeOptions).then(function(resizedFile) {
            console.log('resizedFile:', resizedFile);
            //调用文件上传
            if (ng.isObject(options.headers) && options.headers.isUploadFile) {
              options.data['file'] = resizedFile;
              options.data['imgFile'] = null;
            } else {
              options.data['imgFile'] = resizedFile;
            }
            doUpload(options);
          });
        } else {
          doUpload(options);
        }
      } else {
        deferred.reject(false);
      }
      return deferred.promise;

      function doUpload(options) {
        var uploader = Upload.upload(options);
        uploader.then(function(result) {
          var re = (result.data);
          if (result.status == 200) {
            if (re.error == 0 || re.url) {
              deferred.resolve(re);
            } else {
              //re.error不等0
              deferred.reject(result);
            }
          } else {
            //http status 不为 200
            deferred.reject(result);
            service.msgToast(result.status);
          }
        }, function(error) {
          deferred.reject(error);
          service.msgToast(error.status);
          console.log('upload Error status: ', error);
        }, function(evt) {
          var progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
          deferred.notify(progress);
          //var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          //console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        });
      }
    }

    /**
     * 返回 $q.defer();
     * @author lvwei
     * @date   2018-05-13T23:49:57+0800
     * @return {[type]}                 [description]
     */
    function getDefer() {
      return $q.defer();
    }
  }

})(angular, jsonpath);
/**
 * 文件上传
 * @author lvwei
 * @date   2017-12-29T15:51:44+0800
 * @return {[type]}                 [description]
 */
(function(ng) {
  angular.module('app.services')
    .service('fileUpload', fileUpload);
  fileUpload.$inject = ['toolBox', 'systemConfig', '$q', '$timeout', 'globalPluploadOption'];

  function fileUpload(toolBox, systemConfig, $q, $timeout, globalPluploadOption) {
    if (!ng.isObject(WebUploader)) {
      return false;
    }
    var service = {
      options: {},
      uploadOptions: uploadOptions,
      initImage: initImage, //上传对象初始化
    };
    return service;

    function uploadOptions() {
      var deferred = $q.defer();
      $timeout(function() {
        var options = {
          accept: 'image/png,image/jpg,image/jpeg,image/gif',
          validate: sprintf('{size: {max: \'%s\', min: \'10B\'}}', globalPluploadOption.max_file_size)
        };
      });
    }

    function initImage() {
      var uploader = WebUploader.create({
        // swf文件路径
        swf: 'Uploader.swf',
        // 文件接收服务端。
        server: systemConfig.loginApi + '/file/uploadImages',
        // 选择文件的按钮。可选。
        // 内部根据当前运行是创建，可能是input元素，也可能是flash.
        pick: {
          id: pick,
          multiple: false
        },
        // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
        resize: false,
        accept: {
          title: 'Images',
          extensions: 'gif,jpg,jpeg,bmp,png',
          mimeTypes: 'image/*'
        },
        auto: true,
        fileNumLimit: 300
      });
      return uploader;
    }

    /**
     * 文件上传事件(提供给 ngFileUpload 指令集使用)
     * @param files {object} 上传的文件对象
     * @param uploadType {string} 上传的类型,不指定为 goods
     */
    function uploadFiles(files, options) { //uploadType
      if (ng.isObject(files)) {
        //如果文件列表为空, 则退出上传事件
        if (ng.isArray(files)) {
          if (files.length > 0) {
            var i = 0;
            //对文件列表循环执行上传操作
            ng.forEach(files, function(fileItem) {
              i++;
              //判断长度是否在允许的范围内
              if ((options.curImgList.length + i) > options.imgListMaxlength) {
                return false; //如果已上传的文件数超出设置的最大上传数, 则退出
              }
              //调用上传处理
              toolBox.uploadFile(fileItem, uploadType || 'goods').then(function(data) {
                if (uploadType == 'goodsImgList') { //相册
                  //判断长度是否在允许的范围内
                  if (vm.spuInfo.goodsImgList.length >= vm.spuInfo.goodsImgListMaxlength) return;
                  vm.spuInfo.goodsImgList.push({
                    fileId: data.id,
                    fileUrl: data.url
                  });
                } else if (uploadType == 'goodsDesc') { //商品详情
                  //判断长度是否在允许的范围内
                  if (vm.spuInfo.goodsDesc.length >= vm.spuInfo.goodsDescMaxlength) return;
                  vm.spuInfo.goodsDesc.push({
                    fileId: data.id,
                    fileUrl: data.url
                  });
                }
              }, uploadError);
            });
          } else {
            return;
          }
        } else {
          //单个文件调用上传处理
          toolBox.uploadFile(files, 'goods').then(function(data) {
            if (uploadType == 'goodsImg') { //首图
              vm.spuInfo.goodsImg = data.url;
              vm.spuInfo.goodsImgId = data.id;
            }
          }, uploadError);
        }
      }
      //图片上传的错误提示处理
      function uploadError(error) {
        if (error.message) {
          toolBox.promptBox.alert(error.message);
        }
        console.log('uploadFile error:', error);
      }
    }
  }
})(angular);
/**
 * Created by Vidailhet on 17/11/15.
 * 来源: https://github.com/mvidailhet/ionic-close-popup
 * 点击空白处关闭 ionicPopup 弹窗
 */
(function(ionic) {
  "use strict";
  angular.module('app.services')
    .service('ionicClosePopupService', [
      function() {
        var currentPopup;
        var htmlEl = angular.element(document.querySelector('html'));
        htmlEl.on('click', function(event) {
          if (event.target.nodeName === 'HTML') {
            if (currentPopup) {
              currentPopup.close();
            }
          }
        });
        this.register = function(popup) {
          currentPopup = popup;
        };
      }
    ]);
})(window.ionic);


//APP分享功能
(function(ng, jp) {
  "use strict";
  angular.module('app.services')
    .factory('shareTools', shareTools);

  shareTools.$inject = ['$ionicModal', '$ionicPopup', '$rootScope', '$location', 'toolBox', 'systemConfig', 'whichPlatform', '$timeout'];

  function shareTools($ionicModal, $ionicPopup, $rootScope, $location, toolBox, systemConfig, whichPlatform, $timeout) {
    var share = {
      messageInfo: {},
      openModal: openModal, //mob 旧插件分享处理
      mobShareNew: mobShareNew, //mob 新插件分享处理
      shareInfo: shareInfo,
      wechatShare: wechatShare, //xu-li 分享插件
      weixinShare: weixinShare
    };
    return share;
    //打开分享modal, mob 旧插件分享处理
    function openModal(shareMessage, successFunc, failFunc) {
      //重新配置分享信息
      shareMessage = {
        title: shareMessage.title || "ionic-shell",
        description: shareMessage.description || "ionic-shell-decs",
        thumb: shareMessage.thumb.substring(0, 3) == 'www' || !shareMessage.thumb ? location.origin + "/common/img/icon/logo.png" : shareMessage.thumb,
        media: shareMessage.media
      };
      cordova.exec(function(result) {
        if (typeof(successFunc) == 'function') {
          successFunc();
        } else {
          toolBox.msgToast('分享成功, 感谢您的分享');
        }
      }, function(error) {
        if (typeof(failFunc) == 'function') {
          failFunc();
        } else {
          if (error == 'cancel') {
            toolBox.msgToast('您已取消分享');
          } else {
            toolBox.msgToast('分享失败');
          }
        }
      }, "ShareSDK", "share", [
        shareMessage.title,
        shareMessage.description,
        shareMessage.thumb,
        shareMessage.media.webpageUrl ? shareMessage.media.webpageUrl : location.origin + "/#" + $location.url()
      ]);
      return;
    }

    //mob 的新插件分享处理
    function mobShareNew(shareMessage, successFunc, failFunc) {
      var shareInfo = {
        icon: shareMessage.thumb.substring(0, 3) == 'www' || !shareMessage.thumb ? location.origin + "/common/img/icon/logo.png" : shareMessage.thumb,
        title: shareMessage.title || "ionic-shell",
        text: shareMessage.description || "ionic-shell-desc",
        url: shareMessage.media.webpageUrl ? shareMessage.media.webpageUrl : location.origin + "/#" + $location.url()
      };
      var platformType = ShareSDK.PlatformType.WechatSession;
      if (shareMessage.scene == 'TIMELINE') {
        platformType = ShareSDK.PlatformType.WechatTimeline;
      }
      sharesdk.share(platformType,
        ShareSDK.ShareType.WebPage,
        shareInfo,
        function(success) {},
        function(fail) {});
      //成功
      function success(result) {
        if (typeof(successFunc) == 'function') {
          successFunc();
        } else {
          toolBox.msgToast('分享成功, 感谢您的分享');
        }
      }
      //失败
      function fail(error) {
        if (typeof(failFunc) == 'function') {
          failFunc();
        } else {
          if (error == 'cancel') {
            toolBox.msgToast('您已取消分享');
          } else {
            toolBox.msgToast('分享失败');
          }
        }
      }
      return;
    }

    //绑定分享信息
    function shareInfo(message, type) {
      if (message) {
        share.messageInfo = {
          message: {
            title: message.title,
            description: message.description,
            thumb: message.thumb,
            media: {
              type: message.media.type,
              webpageUrl: message.media.webpageUrl ? message.media.webpageUrl : location.origin + "/#" + $location.url()
            }
          },
        };
      }
      if (type == 'SESSION') { // SESSION聊天界面 TIMELINE朋友圈
        share.messageInfo.scene = Wechat.Scene.SESSION;
      } else if (type == 'TIMELINE') {
        share.messageInfo.scene = Wechat.Scene.TIMELINE;
      }
    }

    //微信插件分享
    function wechatShare(successFunc, failFunc) {
      successFunc = successFunc ? successFunc : null;
      failFunc = failFunc ? failFunc : null;
      Wechat.share(share.messageInfo, function() {
        $rootScope.isSharing = false;
        $ionicPopup.alert({
          title: "温馨提示~",
          template: "分享成功啦~",
          buttons: [{
            text: '确定',
            onTap: successFunc
          }]
        });
      }, function(reason) {
        if (reason != '用户点击取消并返回') {
          $rootScope.isSharing = false;
          $ionicPopup.alert({
            title: "温馨提示~",
            template: "分享失败: " + reason,
            buttons: [{
              text: '确定',
              onTap: failFunc
            }]
          });
        } else {
          $timeout(function() {
            $rootScope.isSharing = false;
          });
          toolBox.msgToast('您已取消分享');
        }
      });
      $rootScope.isSharing = true;
    }
    //微信浏览器分享
    function weixinShare(message, success, fail) {
      //先解析当前 url是否有 from 参数
      var urlParse = toolBox.urlParse(location.href);
      var urlParams = toolBox.getParam(urlParse.search);
      var from = urlParams.mkfrom || whichPlatform.mkfrom;
      if (!from) {
        from = $location.search().mkfrom;
      }
      var webView = from == 'ios' || from == 'android' ? true : false // 是否客户端访问
      if (webView) {
        var appMessage = {
          title: message.title ? message.title : "ionic-shell",
          description: message.description ? message.description : "ionic-shell-desc",
          link: message.link,
          thumb: message.thumb ? message.thumb : sprintf('%s/%s', systemConfig.imagesUrl, location.origin + "/common/img/icon/logo.png"),
        };
        //如果是 app 的 webView则增加分享方法  IOS
        if (from == 'ios') {
          window.interface.iosInterface.shareH5Action = function() {
            window.interface.iosInterface.shareAppAction(appMessage.title, appMessage.description, appMessage.thumb, appMessage.link);
          };
          return;
        }
        if (from == 'android') {
          window.androidInterface.shareH5Action = function() {
            window.androidInterface.shareAppAction(appMessage.title, appMessage.description, appMessage.thumb, appMessage.link);
          };
          return;
        }
      }
      success = success ? success : null;
      fail = fail ? fail : null;
      if (window.plugins.wechat) {
        var weixinMessage = {
          title: message.title ? message.title : "ionic-shell",
          desc: message.description ? message.description : "ionic-shell-desc",
          link: message.link ? message.link : window.location.href,
          imgUrl: message.thumb ? message.thumb : sprintf('%s/%s', systemConfig.imagesUrl, location.origin + "/common/img/icon/logo.png"),
          type: "link",
          dataUrl: ""
        };
        window.plugins.wechat.showMenu(!0, function() {
          !!window.plugins.wechat.limitShareScene && window.plugins.wechat.limitShareScene(weixinMessage, success, fail);
        });
      }
    }
  }
})(angular, jsonpath);
/**
 * app 升级
 * @author lvwei
 * @date   2017-12-31T12:04:27+0800
 * @return {[type]}                 [description]
 */
(function() {
  "use strict";
  angular.module('app.services')
    //APP版本更新
    .factory('appUpdate', appUpdate);
  appUpdate.$inject = ['$filter', '$rootScope', 'toolBox', '$ionicActionSheet',
    'localStorageService', '$cordovaAppVersion', '$ionicPopup', '$ionicLoading',
    '$cordovaFileTransfer', '$cordovaFile', '$cordovaFileOpener2',
    '$ionicPlatform', 'systemConfig', '$timeout', '$q', '$state'
  ];

  function appUpdate($filter, $rootScope, toolBox, $ionicActionSheet,
    localStorageService, $cordovaAppVersion, $ionicPopup, $ionicLoading,
    $cordovaFileTransfer, $cordovaFile, $cordovaFileOpener2,
    $ionicPlatform, systemConfig, $timeout, $q, $state) {
    var $scope = $rootScope.$new();
    $scope.updateProgress = 0;
    var update = {
      // version : null,  //初始版本号
      isNewVersion: false,
      isSetUpdateTime: true,
      apkDownUrl: '',
      apkFileName: 'ionic-shell.apk',
      fileURL: "file:///storage/sdcard0/Download/",
      newFilePath: '',
      useNewUpdate: false,
      getLocalAppVersion: function() { //获取本地版本号
        var deferred = $q.defer();
        if (update.useNewUpdate) {
          //使用新版更新插件 cordova-plugin-app-update
          update.newUpdateAct().finally(function() {
            deferred.reject(false);
          });
          return deferred.promise;
        }
        //旧版更新插件 cordova-plugin-apkInstall
        if (typeof cordova != 'undefined') {
          cordova.getAppVersion.getVersionNumber(function(version) {
            //$rootScope.isApp = true;  //添加标识是否为app
            update.version = version;
            update.fileURL = cordova.file.dataDirectory;
            deferred.resolve(version);
          });
        } else {
          deferred.reject(false);
        }
        return deferred.promise;
      },
      newUpdateAct: function() {
        var deferred = $q.defer();
        // 使用新的更新插件进行 app 更新
        var updateUrl = sprintf("%s%s?type=2&x=%s", systemConfig.url, systemConfig.queryAppUpdateInfo, Math.random());
        window.AppUpdate.checkAppUpdate(onSuccess, onFail, updateUrl);

        function onSuccess() {
          deferred.resolve(true);
          console.log('app new update success:', arguments);
        }

        function onFail(error) {
          deferred.reject(false);
          console.log('app new update fail:', error);
        }

        return deferred.promise;
      },
      checkUpdate: function(platform) {
        var deferred = $q.defer();
        var url = systemConfig.queryAppUpdateInfo + '?x=' + Math.random();
        if ($ionicPlatform.is('ios')) {
          url = systemConfig.url + '/ios_version'; //systemConfig.iosVersion;
          deferred.reject(false);
          return deferred.promise;
        }
        var config = {
          url: url
        };
        toolBox.http.get(config).then(function(result) { //从服务器获取版本信息
          var upgrade = result.data; //从服务端取得最新版本
          if (angular.isString(upgrade)) {
            try {
              upgrade = angular.fromJson(upgrade);
            } catch (e) {
              console.log("error to query app update info");
              return;
            }
          }
          if ($ionicPlatform.is('ios')) { //服务端版本大于本地版本
            var iosVersionData = result.data; //从服务端取得最新版本
            var versionData = jsonpath.value(iosVersionData, '$..[?(@.version)]');
            if (versionData) {
              upgrade.ios = {
                newVersion: versionData.version,
                updateInfo: versionData.releaseNotes.replace(/[\r\n]/g, "<br>")
              };
              if ((update.version < versionData.version)) {
                showUpdateConfirm(update.version, upgrade.ios);
              }
            }
          } else if ($ionicPlatform.is('android') && (update.version < upgrade.android.newVersion)) { //如果本地与服务端的APP版本不符合
            if (result.data.success) {
              update.apkDownUrl = upgrade.android.url; //取得 apk 下载地址
              //update.showUpdateConfirm(update.version,upgrade.android);
              showUpdateConfirm(update.version, upgrade.android);
            }
          }
          deferred.resolve(update.version);
          // return update.version;
        }, function() {
          deferred.reject(false);
        });
        return deferred.promise;
      },
      //当取消更新时，延时7天检测更新
      delayUpdate: function(isSet) {
        var delayUpdateTime = localStorageService.get('delayUpdateTime'); //获取上次更新时间 nextUpdateTime
        if (delayUpdateTime) {
          update.getLocalAppVersion(); //获取本地版本号
          update.isNewVersion = true; //有更新
          var nowDate = $filter('date')(new Date(), 'yyyy-MM-dd'); //当前系统时间 nowDate
          delayUpdateTime = new Date(delayUpdateTime.replace(/-/g, "/"));
          nowDate = new Date(nowDate.replace(/-/g, "/"));
          //计算距离上次更新相差天数
          var days = nowDate.getTime() - delayUpdateTime.getTime();
          var time = parseInt(days / (1000 * 60 * 60 * 24));

          if (time >= 7) { //当延时时间超过7天检测新版本
            update.isSetUpdateTime = isSet;
            return true;
          }
        } else {
          return true;
        }
      },
      androidNewUpdate: function() {
        // 一个精心制作的自定义弹窗
        $scope.myPopup = null;
        var popupOptions = {
          template: "<p class=\"p5 rate\"><i ng-style=\"{'width': (updateProgress)+'%'}\"></i>{{updateProgress}}%</p>",
          title: '升级文件下载中',
          subTitle: '请耐心等待',
          scope: $scope,
          buttons: [{
            text: '后台更新'
          }, {
            text: '取消更新',
            type: 'button-positive',
            onTap: function(e) {
              update.pauseDownload();
              update.deleteFile();
            }
          }]
        };
        //创建文件传输对象
        $scope.fileTransfer = new PRD(); // Use PRD ( extended cordova-plugin-pause-resume-download )
        update.deleteFile().finally(function() {
          $rootScope._apk_start2download = false;
          $scope.updateProgress = 0; //
          //显示进度弹窗
          $scope.myPopup = $ionicPopup.show(popupOptions);
          $scope.myPopup.then(function(res) {
            //console.log('Tapped!', res);
          });
          update.startPauseResumeDownload().then(function(entry) {
            //apk安装提示窗口选项配置
            var options = {
              template: '新版本已下载完成',
              okText: '立即安装',
              ok: function() {
                apkInstaller.install(update.apkFileName, function(msg) {
                  // Start the installer
                }, function(error) {
                  toolBox.msgToast('新版本安装失败');
                });
                //update.openFile(entry.toURL());
              }
            };
            toolBox.popup('confirm', options);
            //关闭下载窗口
            if ($scope.myPopup) {
              $scope.myPopup.close();
            }
          }); //开始下载
        });
      },
      startPauseResumeDownload: function(isOnline) {
        var deferred = $q.defer();
        if (!$rootScope._apk_start2download) {
          $rootScope._apk_start2download = true;
        }

        //$scope.fileTransfer = new PRD(); // Use PRD ( extended cordova-plugin-pause-resume-download )

        var url = update.apkDownUrl;
        var uri = encodeURI(url);
        //var fileURL = update.fileURL + update.apkFileName;
        var fileURL = $scope.fileTransfer.disk + update.apkFileName;
        // window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, onFileSystemSuccess, onError);

        $scope.fileTransfer.download(
          uri,
          fileURL,
          function(entry) {
            $rootScope._apk_start2download = false;
            //if ($scope.myPopup) $scope.myPopup.remove();
            updateProgress(100);
            deferred.resolve(entry);
          },
          function(error) {
            //$rootScope._apk_start2download = false;
            //if ($scope.myPopup) $scope.myPopup.remove();
            deferred.reject(error);
          },
          false, {
            headers: {
              "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
            }
          }
        );

        $scope.fileTransfer.onprogress = function(progress) {
          if (this.pre === undefined) this.pre = 0;
          var now = ~~((progress.loaded / progress.total) * 100 * 100);
          if (now - +this.pre > 17) {
            updateProgress(now / 100);
            this.pre = now;
          }
        };

        function updateProgress(data) {
          deferred.notify(data);
          $timeout(function() {
            $scope.updateProgress = data;
            //console.log('$scope.updateProgress',$scope.updateProgress);
          });
        }
        return deferred.promise;
      },
      pauseDownload: function() {
        //window.location.reload();
        $scope.fileTransfer.abort();
      },
      openFile: function(targetPath) {
        //APP下载存放的路径，可以使用cordova file插件进行相关配置;
        targetPath = targetPath; //update.fileURL;
        // 打开下载下来的APP
        $cordovaFileOpener2.open(targetPath, 'application/vnd.android.package-archive').then(function() {
          if ($scope.myPopup) {
            $scope.myPopup.close();
          }
          // 成功
          localStorageService.remove('delayUpdateTime'); //更新后清除 取消更新日期
        }, function(err) {
          // 错误
          console.log('open file error:', JSON.stringify(err));
        });
      },
      deleteFile: function(file) {
        var deferred = $q.defer();
        var filePath = file || $scope.fileTransfer.disk + update.apkFileName;
        window.resolveLocalFileSystemURL(filePath, function(file) {
          file.remove(function() {
            deferred.resolve();
          }, onError);
        }, onError);

        function onError(error) {
          deferred.reject(error);
          console.log("error to deleted:", JSON.stringify(error));
        }
        return deferred.promise;
      },
      clearDirectory: function(folder) {
        var delFolder = cordova.file.dataDirectory + 'codepush/download/unzipped';
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, fail);

        function fail(evt) {
          console.log("FOLDER DELETE FAILURE: " + JSON.stringify(evt));
        }

        function onFileSystemSuccess(fileSystem) {
          window.resolveLocalFileSystemURL(delFolder,
            function(dirEntry) {
              // move the file to a new directory and rename it
              dirEntry.removeRecursively(function() {
                console.log("Remove Recursively Succeeded");
              }, fail);
            },
            fail);
          // fileSystem.root.getDirectory(
          //   delFolder, {
          //     create: true,
          //     exclusive: false
          //   },
          //   function(entry) {
          //     entry.removeRecursively(function() {
          //       console.log("Remove Recursively Succeeded");
          //     }, fail);
          //   }, fail);
        }
      },
      androidUpdate: function() {
        $ionicLoading.show({
          template: "已经下载：0%"
        });
        if (!update.apkDownUrl) {
          return;
        }
        var url = update.apkDownUrl; //systemConfig.url + "/app_download/kakabao.apk"; //可以从服务端获取更新APP的路径
        //var targetPath = "file:///storage/sdcard0/Download/kakabao.apk"; //APP下载存放的路径，可以使用cordova file插件进行相关配置
        //var targetPath = $scope.fileTransfer.disk + update.apkFileName; //APP下载存放的路径，可以使用cordova file插件进行相关配置
        var targetPath = cordova.file.dataDirectory + update.apkFileName; //APP下载存放的路径，可以使用cordova file插件进行相关配置
        var trustHosts = true;
        var options = {};
        $cordovaFileTransfer.download(url, targetPath, options, trustHosts).then(function(result) {
          // 打开下载下来的APP
          $cordovaFileOpener2.open(targetPath, 'application/vnd.android.package-archive').then(function() {
            // 成功
            localStorageService.remove('delayUpdateTime'); //更新后清除 取消更新日期
          }, function(err) {
            // 错误
          });
          $ionicLoading.hide();
        }, function(err) {
          alert('下载失败');
        }, function(progress) {
          //进度，这里使用文字显示下载百分比
          var downloadProgress = (progress.loaded / progress.total) * 100;
          $ionicLoading.show({
            template: "已经下载：" + Math.floor(downloadProgress) + "%"
          });
          if (downloadProgress > 99) {
            $ionicLoading.hide();
          }
        });
      },
      // 热更
      checkHotCode: checkHotCode,
      // Update DOM on a Received Event
      receivedEvent: function(id) {
        // $timeout(function() {
        //   $state.reload();
        // });
        // var parentElement = document.getElementById(id);
        // var listeningElement = parentElement.querySelector('.listening');
        // var receivedElement = parentElement.querySelector('.received');

        // listeningElement.setAttribute('style', 'display:none;');
        // receivedElement.setAttribute('style', 'display:block;');

        // console.log('Received Event: ' + id);
      },
      // app 更新处理的入口
      appUpdateEnter: appUpdateEnter,
    };
    /**
     * app 更新的入口
     * @author lvwei
     * @date   2018-05-28T13:48:33+0800
     * @return {[type]}                 [description]
     */
    function appUpdateEnter() {
      //ios 暂不检查新版本
      if ($ionicPlatform.is('ios')) {
        return false;
      }
      //版本检测, 获取当前版本
      update.getLocalAppVersion().then(function(version) {
        $rootScope.appVersion = version;
        //检查软件更新
        var isUpdate = update.delayUpdate(true); //是否更新
        if (isUpdate) {
          update.checkUpdate().then(function(success) {
            console.log('success');
          }, function(error) {
            if (error.status != '404') {
              window.plugins.toast.showExShortCenter('无法获取版本信息...');
            }
          });
        }
      });
    }
    /**
     * 检查是否热更新
     * @author lvwei
     * @date   2018-05-28T10:45:05+0800
     * @return {[type]}                 [description]
     */
    function checkHotCode() {
      //检查热更的插件是否存在
      if (window.codePush) {
        var updateDialogOptions = {
          installMode: InstallMode.IMMEDIATE,//InstallMode.ON_NEXT_RESTART,
          updateDialog: false
        };
        update.clearDirectory();
        var filepath = cordova.file.dataDirectory + 'codepush/download/update.zip';
        update.deleteFile(filepath).then(function() {
          console.log('update file deleted success.');
        });
        //执行热更
        window.codePush.sync(function(syncStatus) {
          switch (syncStatus) {
            // Result (final) statuses
            case SyncStatus.UPDATE_INSTALLED:
              console.log("已经完成更新");
              update.receivedEvent();
              break;
            case SyncStatus.UP_TO_DATE:
              update.appUpdateEnter();
              console.log("当前应用是最新版的了.");
              break;
            case SyncStatus.UPDATE_IGNORED:
              console.log("用户忽略了此次更新.");
              break;
            case SyncStatus.ERROR:
              update.appUpdateEnter();
              console.log("更新遇到了错误.");
              break;
              // Intermediate (non final) statuses
            case SyncStatus.CHECKING_FOR_UPDATE:
              console.log("检查更新中.");
              break;
            case SyncStatus.AWAITING_USER_ACTION:
              console.log("Alerting user.");
              break;
            case SyncStatus.DOWNLOADING_PACKAGE:
              console.log("更新包下载中...");
              break;
            case SyncStatus.INSTALLING_UPDATE:
              console.log("正在安装更新");
              break;
          }
        }, updateDialogOptions, progressFoo);
      } else {
        //检查 app 是否有新版本
        update.appUpdateEnter();
      }
    }
    // 显示是否更新对话框
    function showUpdateConfirm(version, upgrade) {
      update.isNewVersion = true; //是否有更新
      var confirmPopup = $ionicPopup.confirm({
        title: '新版本' + upgrade.newVersion,
        template: upgrade.updateInfo, //从服务端获取更新的内容
        cancelText: '取消',
        okText: '升级'
      });
      confirmPopup.then(function(res) {
        if (res) {
          if ($ionicPlatform.is('ios')) { //ios跳转至app store商店
            //window.open('https://itunes.apple.com/us/app/');
          } else if ($ionicPlatform.is('android')) { //下载apk文件进行安装
            //update.androidUpdate();//旧的更新方法
            update.androidNewUpdate(); //新的断点续传的更新
            // 这里是 apk 安装插件的处理
            //alert(update.apkDownUrl)

          }
        } else if (upgrade.isNecessary) {
          ionic.Platform.exitApp();
        } else {
          //取消更新
          if (update.isSetUpdateTime) {
            localStorageService.set('delayUpdateTime', $filter('date')(new Date(), 'yyyy-MM-dd')); //存储本次取消更新日期
            update.isSetUpdateTime = false;
          }
        }
      });
    }

    /**
     * 更新包的下载进度
     * @author lvwei
     * @date   2018-05-28T10:53:35+0800
     * @return {[type]}                 [description]
     */
    function progressFoo(downloadProgress) {
      console.log("Downloading " + downloadProgress.receivedBytes + " of " + downloadProgress.totalBytes + " bytes.");
    }


    return update;
  }
})(angular, jsonpath);