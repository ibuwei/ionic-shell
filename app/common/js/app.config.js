/**
 * http 请求拦截器
 * */
(function() {
  'use strict';
  angular.module('app')
    .config(httpProviderConfig);

  function httpProviderConfig($httpProvider) {
    // Pull in `userService` from the dependency injector
    $httpProvider.interceptors.push(['$rootScope', 'Session', '$q', 'msgService', httpInterceptors]);
    $httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded';
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    //微信cache接口缓存
    if (!$httpProvider.defaults.headers.get) {
      $httpProvider.defaults.headers.get = {};
    }
    //对某些特定的页面做页面缓存设置(针对页面刷新用)
    // if (location.hash.indexOf('order-settlement')) {
    //   $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    //   $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
    // }
    // Override $http service's default transformRequest
    $httpProvider.defaults.transformRequest = [paramsFormat];

    //header参数追加默认值
    function httpInterceptors($rootScope, Session, $q, msgService) {
      return {
        request: function(config) {
          //提供token
          var token = Session.getToken();
          if (Session.isNotEmpty(token)) {
            config.headers.Authorization = token;
          }
          //返回来源
          var platform = $rootScope.isInWeb ? "WECHAT" : "WEB";
          if ($rootScope.isApp) { //如果是 app 的话
            if (ionic.Platform.isAndroid()) {
              platform = "ANDROID";
            } else if (ionic.Platform.isIOS()) {
              platform = "IOS";
            } else if (inoic.Platform.isIPad()) {
              platform = "IPAD";
            }
          }
          config.timeout = 20000,
            config.headers.platform = platform;
          config.headers.versionCode = 100;
          var deferred = $q.defer();
          deferred.resolve(config);
          return deferred.promise;
        },
        response: function(response) {
          function hasPrototype(object, name) {
            return object.hasOwnProperty(name) && (name in object);
          }
          if (response && hasPrototype(response.data, 'data')) {
            var data = angular.copy(response.data);
            if (hasPrototype(data, 'code')) {
              response.data.resultCode = data.resultCode = data.code === 0 ? 1000 : data.code;
              response.data.resultCode = data.resultCode = data.code === 0 ? 1000 : data.code;
              //当错误代码不为0(成功)时, 映射框架中相应的错误代码
              if (data.code !== 0) {
                response.data.resultCode = data.resultCode = data.code;
                if (data.code == -51) {
                  response.data.resultCode = data.resultCode = 401;
                }
                var notShowMsgArr = ['success'];
                var iPos = notShowMsgArr.indexOf(data.message);
                response.data.reason = (notShowMsgArr.indexOf(data.message) >= 0) ? "" : data.message;
              }
            }
            //当不是调试状态, 返回的 code 不为1000时, 提示错误
            if (data.resultCode) {
              if (msgService.httpReturnCode.success.indexOf(data.resultCode) < 0) {
                if ($rootScope._isLoginGoBack == false || $rootScope._isLoginGoBack == undefined) {
                  $rootScope.$broadcast('event:message-error-toast', response);
                }
                if (data.resultCode == 401) {
                  $rootScope.$broadcast('event:auth-userLogin-Required', data);
                }
                return $q.reject(response);
              } else if (data.resultCode == 1001) { //用户未进行身份认证
                $rootScope.$broadcast('event:auth-userIdVerify', response);
              }
            }
          }

          return response;
        },
        responseError: function(rejection) {
          var config = rejection.config || {};
          if (!config.ignoreAuthModule) {
            switch (rejection.status) {
              case 500:
                $rootScope.$broadcast('event:message-error-toast', rejection.status);
                break;
              case 404:
                $rootScope.$broadcast('event:message-error-toast', rejection.status);
                break;
              case 0:
                $rootScope.$broadcast('event:message-error-toast', -1);
                break;
            }

          }
          // otherwise, default behaviour
          return $q.reject(rejection);
        }
      };
    }
    //请求参数格式化
    function paramsFormat(data) {
      //console.log('paramsFormat data:', data);
      /**
       * The workhorse; converts an object to x-www-form-urlencoded serialization.
       * @param {Object} obj
       * @return {String}
       */
      if (!data) {
        return;
      }
      var params = data.params ? data.params : data;
      try {
        var urlParam = [];
        var val = "";
        for (var key in params) {
          if (typeof(params[key]) == 'object') {
            params[key] = JSON.stringify(params[key]);
          }
          if (params[key] === 0) {
            val = params[key];
          } else {
            val = params[key] ? encodeURIComponent(params[key]) : "";
            /*参数为空时，剔除该参数*/
            if (!val) continue;
          }
          urlParam.push(encodeURIComponent(key) + "=" + val);
        }
        return urlParam.join("&");
      } catch (e) {
        console.log('form param trans exception!');
      }
    }
  }

})();
/**
 * 全局配置
 * */
(function(ng, jp) {
  'use strict';
  angular.module('app')
    /*.constant("$ionicLoadingConfig",{
      template : "<div class='load'></div><p class='ml30'>加载中...</p>"
    })*/
    //全局禁止页面左滑页面后退
    .config(function($ionicConfigProvider) {
      $ionicConfigProvider.views.swipeBackEnabled(false);
    })
    //下载地址
    .constant('appDownUrlConfig', {
      url: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.maikevip.app.sweetelephant'
    })
    //上传插件全局配置
    .constant("GlobalSysConfig", {
      api: '/api', //全局的api 名称配置
      reasonsExpire: 3600 //全局的理由失效时间配置
    })
    .constant("globalPluploadOption", {
      flash_swf_url: 'www/js/lib/plupload/Moxie.swf',
      silverlight_xap_url: 'www/js/lib/plupload/Moxie.xap',
      max_file_size: '50mb',
      resize: {
        quality: 60,
        preserve_headers: false
      }
    })
    .constant("globalLoginOption", {
      APP_ID: '1d58af8c79d7f7812d3d9f41065a2881',
      SECRET: '612332d',
      GRANT_TYPE: 'authorization_code',
      REFRESH_TYPE: 'refresh_token'
    })
    .constant("requestHttpCode", {
      RESULT_OK: 1000, // 成功
      RESULT_ERROR: 9999, // 其它错误
      RESULT_NET_ERROR: 9998, // 其它错误
      RESULT_PASSWORD_ERROR: 2010, //密码错误
      RESULT_CODE_MISMATCH: 2011, //验证码不匹配
      RESULT_SENT_TO_UPPER_LIMIT: 2012, //短信发送记录数达到上限
      RESULT_CAPTCHA_UPPER_LIMIT: 2013, //需要启动二次验证码
      RESULT_SMS_FREQUENT: 2014, //短信发送过于频繁
      RESULT_NOT_LOGGED: 2015, //未登录，
      RESULT_LOGIN_TIMEOUT: 2016, //登录超时
      RESULT_USER_NOT_EXIST: 2018, //会员不存在
      RESULT_RECORD_EXIST: 2003, //记录已存在
      RESULT_RECORD_NOT_EXIST: 2002, //记录不存在
      RESULT_RECORD_USER_EXIST: 20002, //该账号已存在
      RESULT_RECORD_USER_BINDED: 2026, //账号也绑定(第三方)

    })
    .filter('trustHtml', function($sce) {
      return function(input) {
        return $sce.trustAsHtml(input);
      };
    });

  angular.module('app')
    //给控制层加装饰器
    .decorator('$controller', decController)
    //token 的 session
    .factory('Session', Session)
    .factory('sessionStorage', sessionStorage);

  //装饰器的功能实现
  decController.$inject = ['$delegate', '$rootScope', '$ionicHistory', 'sessionStorage', '$window', '$ionicPlatform'];

  function decController($delegate, $rootScope, $ionicHistory, sessionStorage, $window, $ionicPlatform) {
    var stateObject = {
      index: 0
    };
    var listenerList = [];
    var ctrlList = [];
    var params = {
      isFromLogin: false,
      ctrlName: ''
    };
    //判断对象的属性是否存在
    function hasPrototype(object, name) {
      return object.hasOwnProperty(name) && (name in object);
    }
    //取得当前页的来源页
    function getLastHistory() {
      var myRouter = sessionStorage.get('_app_router') || []; //取得反退历史列表
      if (myRouter.length > 0) { //如果后退历史有数据, 则取得最后一条数据
        return myRouter[myRouter.length - 1];
      }
      return '';
    }
    return function(constructor, locals) {
      //console.log('arguments:',arguments);
      var controller = $delegate.apply(null, arguments);
      //不是 controller 则直接返回
      if (!controller.constructor.name || controller.constructor.name == 'Function') {
        // params.ctrlName = '';
        //return controller;
      } else {
        params.ctrlName = controller.constructor.name;
        // console.log('controller:',controller.constructor.name);
        //全局的判断控制层是否隐藏 ion-nav-bar
        var navbarhideCtrlList = ['TabController', 'MyStart', 'IntroCtrl'];
        if (navbarhideCtrlList.indexOf(params.ctrlName) < 0) {
          $rootScope.navbarshow = false;
        }
      }
      //toolBox.msgToast('xxxx')

      return angular.extend(function() {
        if (!angular.isArray($rootScope.ctrlList)) {
          $rootScope.ctrlList = [];
        }
        locals.$scope.$on('$ionicView.beforeEnter', function(event) {
          // if (params.ctrlName && $rootScope.ctrlList.indexOf(params.ctrlName) >= 0) {
          //   if ($rootScope._isLoginGoBack == true) {
          //     $rootScope._isLoginGoBack = false;
          //     $rootScope.xgoBack();
          //   }
          // }
          //设置 beforeLeaveFlag 状态, 给 touch 事件用
          //$rootScope.beforeLeaveFlag = true;
        });
        locals.$scope.$on('$ionicView.beforeLeave', function(event) {
          if (params.ctrlName && $rootScope.ctrlList.indexOf(params.ctrlName) >= 0) {
            //console.log('params.ctrlName:',params.ctrlName)
            var index = $rootScope.ctrlList.indexOf(params.ctrlName);
            $rootScope.ctrlList.splice(index, 1);
          }
          //设置 beforeLeaveFlag 状态, 给 touch 事件用
          //$rootScope.beforeLeaveFlag = true;
        });
        if (params.ctrlName && $rootScope.ctrlList.indexOf(params.ctrlName) < 0) {
          $rootScope.ctrlList = []; //先清空列表, 再添加当前控制层名称
          $rootScope.ctrlList.push(params.ctrlName);
          // var ctrlName = 'register';
          // if (params.ctrlName != ctrlName) {
          //   //如果不是指定的 ctrl, 并且存在, 则删除
          //   var index = $rootScope.ctrlList.indexOf(ctrlName);
          //   if (index > -1) {
          //     $rootScope.ctrlList.splice(index, 1);
          //   }
          // }
          //判断 scope是否存在
          if (locals.$scope && locals.$scope.xgoBack) {
            if (locals.$scope.count == undefined) {
              locals.$scope.count = 0;
              var backButton = angular.element(document.querySelector('.ionicBack')) || angular.element(document.querySelector('.back')) || '';
              //判断页面中是否有后退按钮
              if (hasPrototype(backButton, 'length')) {
                $rootScope.hasBackButton = true;
              } else {
                $rootScope.hasBackButton = false;
              }

            } else {
              locals.$scope.count++;
            }
            //拦截控制层中定义的回退事件
            if (hasPrototype(locals.$scope, 'xgoBack')) {
              $rootScope.ctrlGoBack = locals.$scope.xgoBack;
            } else {
              $rootScope.ctrlGoBack = '';
            }
          }
        }
        return controller();
      }, controller);
    };
  }
  //token 的 session
  Session.$inject = ['localStorageService', '$filter'];

  function Session(localStorageService, $filter) {
    var Session = {
      getToken: function() {
        return Session.get('authorizationToken');
      },
      setToken: function(token) {
        return Session.set('authorizationToken', token);
      },
      isNotEmpty: function(token) {
        return (typeof token != 'undefined') && (token != null) && token.trim() != '';
      },
      get: function(key) {
        function hasPrototype(object, name) {
          return object.hasOwnProperty(name) && (name in object);
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
      },
      /**
       * 设置 localstorage 的值
       * @param expireTime 过期时间(秒数),默认为0不过期
       * */
      set: function(key, data, expireTime) {
        var curTime = new Date().getTime();
        var millisecond = curTime.valueOf();
        curTime = $filter('date')(curTime, "yyyy-MM-dd HH:mm:ss");
        var setData = {
          value: data,
          time: curTime
        };
        setData['expireTime'] = '';
        if (expireTime) {
          millisecond += parseInt(expireTime) * 1000;
          setData['expireTime'] = $filter('date')(millisecond, "yyyy-MM-dd HH:mm:ss");
        }
        return localStorageService.set(key, setData);
      },
      /**
       * 删除 localstorage 的值
       */
      remove: function(key) {
        return localStorageService.remove(key);
      }
    };

    return Session;
  }

  /**
   * sessionStorage 会话级的缓存(发现 ios 的 safari 不支持)
   * 当前用于
   * set 设置
   * get 获取
   * */
  sessionStorage.$inject = ['$window', '$filter'];

  function sessionStorage($window, $filter) {
    var storage = {
      get: function(keyName) {
        function hasPrototype(object, name) {
          return object.hasOwnProperty(name) && (name in object);
        }
        var curTime = new Date().getTime();
        curTime = $filter('date')(curTime, "yyyy-MM-dd HH:mm:ss");
        var testType = typeof window.sessionStorage;
        try {
          var testKey = '_test';
          $window.sessionStorage.setItem(testKey, '1');
          $window.sessionStorage.removeItem(testKey);
          var data = $window.sessionStorage.getItem(keyName);
        } catch (error) {
          var data = $window.localStorage.getItem(keyName);
        }
        if (data && data.indexOf('time') >= 0) data = JSON.parse(data);
        //如果存储的数据是对象, 并且有过期时间
        if (angular.isObject(data)) {
          if (hasPrototype(data, 'expireTime') && data.expireTime) {
            (curTime > data.expireTime) && (data.value = '');
          }
          data = data.value;
        }
        return data;
        //return $window.sessionStorage.getItem(key);
      },
      set: function(_key, data, expireTime) {
        var curTime = new Date().getTime();
        var millisecond = curTime.valueOf();
        curTime = $filter('date')(curTime, "yyyy-MM-dd HH:mm:ss");
        var setData = {
          value: data,
          time: curTime
        };
        setData['expireTime'] = '';
        if (expireTime) {
          millisecond += parseInt(expireTime) * 1000;
          setData['expireTime'] = $filter('date')(millisecond, "yyyy-MM-dd HH:mm:ss");
        }
        var testData = JSON.stringify(setData);
        try {
          return $window.sessionStorage.setItem(_key, JSON.stringify(setData));
        } catch (error) {
          return $window.localStorage.setItem(_key, JSON.stringify(setData));
        }
      }
    };
    return storage;
  }
})(angular, jsonpath);

//从user-agent获取设备型号
(function(ng) {
  "use strict";
  ng.module('app')
    .config(getUserAgent);
  getUserAgent.$inject = ['$provide'];

  function getUserAgent($provide) {
    function checkPlatform() {
      if (/maike-android/i.test(navigator.userAgent)) {
        return 'android'; //这是Android平台下浏览器
      }
      if (/(maike-iOS)/i.test(navigator.userAgent)) {
        return 'ios'; //这是iOS平台下浏览器
      }
      return '';
    }
    $provide.service('whichPlatform', function() {
      this.mkfrom = checkPlatform();
    });
  }
})(angular);

/*API接口*/
(function(ng) {
  "use strict";
  ng.module('app.services')
    .factory("systemConfig", systemConfig);

  systemConfig.$inject = ['GlobalSysConfig', 'ApiConfig', '$ionicPlatform'];

  function systemConfig(GlobalSysConfig, ApiConfig, $ionicPlatform) {
    var config = {
      'host': 'http://www.niushop.com',
      'url': location.origin + '/api/',
      'public': location.origin + '/public/',
      //常用的接口
      'uploadImg': 'upload/uploadFile', //上传图片

      //商品相关
      'goodsClass': 'goods/goodsClassificationList', //商品分类列表
      'goodsList': 'goods/goodsList', //商品列表
      'discountGoods': 'index/getDiscountGoods', //限时折扣-商品列表
      'discountCurrentTime': 'index/getDiscountData', //限时折扣-当前时间
      'goodsDetail': 'goods/goodsDetail', //商品详情

      'addresslist': 'member/getmemberaddresslist', //地址列表
      'defAdd': 'member/updateAddressDefault', //设为默认地址
      'delAdd': 'member/memberAddressDelete', //删除地址
      'detailAdd': 'member/getMemberAddressDetail', //详细地址
      'getprovince': 'index/getprovince', //获取省份
      'getCity': 'index/getCity', //获取市 {province_id}
      'getDistrict': 'index/getDistrict', //获取区 {city_id}
      'addAddress': 'member/addmemberaddress', //保存地址-新增
      'updataAddress': 'member/updateMemberAddress', //保存地址-修改

      'goodsComments': 'goods/getGoodsComments', //商品评价
      'goodsEvaluateCount': 'goods/getGoodsEvaluateCount', //商品各评价类型数量
      'goodsSearch': 'goods/goodsSearchList', //商品查询
      //用户相关
      'register': 'login/register', //注册
      'login': 'login/Login', //登录
      'modifyPsd': 'member/modifypassword', //修改密码
      'memberDetail': 'member/getMemberDetail', //用户详情
      'memberIndex': 'member/memberIndex', //用户相关统计数据
      'logout': 'login/logout', //登出
      'favoriteGoods': 'member/FavoritesGoodsorshop', //商品收藏
      'cancelFavorites': 'member/cancelFavorites', //取消收藏
      'myCollection': 'member/myCollection', //我的收藏列表
      'addcart': 'goods/addcart', //添加购物车
      'cart': 'goods/cart', //购物车
      'cartAddplus': 'goods/cartAdjustNum', //购物车加减
      'cartDelete': 'goods/cartDelete', //购物车-删除
      'getOrderData': 'order/getOrderData', //获取订单结算信息
      'createOrderBuyNow': 'order/orderCreate', //创建订单 -立即购买
      'createOrderCombo': 'order/comboPackageOrderCreate', //创建订单 -组合商品
      'createOrderPoint': 'order/pointExchangeOrderCreate', //创建订单 -积分兑换
      'orderList': 'order/getOrderList', //订单列表
      'orderDetail': 'order/orderDetail', //订单详情

      'getdelivery': 'order/orderTakeDelivery', //确认收货
      'deleteOrder': 'order/deleteOrder', //删除订单
      'evaluateInit': 'order/reviewCommodity', //评价初始化
      'evaluate': 'order/addGoodsEvaluate', //评论
      'evaluateAgainInit': 'order/reviewAgain', //追加评价初始化
      'evaluateAgain': 'order/addGoodsEvaluateAgain', //追加评论
      'expressInit': 'order/orderExpress', //物流初始化 orderId
      'expressInfo': 'order/getOrderGoodsExpressMessage', //物流信息 express_id
      'accountInfo': 'member/getMemberAccount', //我的账户信息
      'accountRecordsList': 'member/getMemberAccountRecordsList', //我的积分列表
      'newsClass': 'Article/getArticleClass', //文章类型
      'newsList': 'Article/getArticleList', //文章列表
      'newsDetail': 'Article/getArticleDetail', //文章详情
      'mailArticle': 'helpcenter/index', //物流承诺 

      //首页
      'indexData': 'index/getIndexData', //首页数据
      'queryAppUpdateInfo': 'index/getAppVersionInfo', //app 版本信息获取
    };
    if (ng.isObject(ApiConfig)) { //&& window.cordova
      // 判断 ncc 的配置信息是否存在
      if (ApiConfig.api) {
        config.url = ApiConfig.api;
      }
      // 判断 login 的配置信息是否存在
      if (ApiConfig.public) {
        config.public = ApiConfig.public;
      }
    }
    return config;
  }
})(angular);