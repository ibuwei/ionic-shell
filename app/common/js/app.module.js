var serviceModule = angular.module('app.services', []);
var routerModule = angular.module('app.routes', []);
var controllerModule = angular.module('app.controllers', []);
var filterModule = angular.module('app.filters', []);
var directiveModule = angular.module('app.directive', []);
var configModule = angular.module('app.config', []);
(function(ng, jp) {
  ng.module("templates", []);
  ng.module('app', ['ionic', 'app.directive',
    'app.services', 'app.routes', 'app.controllers',
    'http-auth-interceptor', 'LocalStorageModule',
    'app.filters', 'ionic.service.core',
    'ngFileUpload', 'ngCordova', 'templates','app.config',
    'base64'
  ]).run(appRun);

  appRun.$inject = ['$ionicPlatform', '$rootScope', '$ionicViewSwitcher', 'toolBox', 
    '$timeout', '$window', 'systemConfig', 'Session', '$ionicPopup', 
    '$location', '$interval', 'appUpdate'];
  /**
   * app初始化方法
   * @param  {[type]} $ionicPlatform     [description]
   * @param  {[type]} $rootScope         [description]
   * @param  {[type]} $ionicViewSwitcher [description]
   * @param  {[type]} toolBox            [description]
   * @param  {[type]} $timeout           [description]
   * @param  {[type]} $window            [description]
   * @param  {[type]} systemConfig       [description]
   * @return {[type]}                    [description]
   */
  function appRun($ionicPlatform, $rootScope, $ionicViewSwitcher, toolBox, 
    $timeout, $window, systemConfig, Session, $ionicPopup, 
    $location, $interval, appUpdate) {
    //默认不显示 navbar
    $rootScope.navbarshow = true;
    //ionic 平台准备完成
    $ionicPlatform.ready(function() {
      $rootScope.isApp = false;
      if (window.cordova) {
        // 设置为竖屏模式
        screen.orientation.lock('portrait');

        if (ionic.Platform.isReady) {
          $rootScope.isApp = true;
        }
        document.addEventListener("deviceready", onDeviceReady, false);
        function onDeviceReady() {
          $rootScope.isApp = true; //判断是否为APP客户端
          // retrieve the DOM element that had the ng-app attribute
          StatusBar.styleLightContent();
          //设置顶部状态栏为白色
          StatusBar.backgroundColorByName("white");
          //延迟隐藏闪屏 防止有白屏
          window.setTimeout(function() {
            navigator.splashscreen.hide();
          }, 500);
          //先判断是否有需要更新的内容
          appUpdate.checkHotCode();
        }
        //移除deviceready监听事件
        document.removeEventListener("deviceready", onDeviceReady, false);
      } else {
        console.log('web 模式');
        // 代码开始
      }

      // listen for Online event
      $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
        var onlineState = networkState;
        $rootScope.netWorkError = false;
        $state.reload();  //重新加载页面
        //如果当前未下载完成, 则继续下载
        if ($rootScope._apk_start2download) {
          update.startPauseResumeDownload(true);
        }
      });

      // listen for Offline event
      $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
        var offlineState = networkState;
        //如果当前在下载中, 则暂停下载
        if ($rootScope._apk_start2download) {
          update.pauseDownload();
        }
        $rootScope.netWorkError = true;
        checkNetWorkService.checkConnection();  //提示网络错误
      });
      //检查是否有重叠的页面
      $interval(function() {
        var navView = document.querySelector('ion-view[nav-view=leaving]');
        if (navView) { //找到leaving元素
          var htmlEl = angular.element(navView);
          var navViewStatus = htmlEl.attr('nav-view');
          if (navViewStatus == 'leaving') {
            //设置状态
            htmlEl.attr('nav-view', 'cached');
          }
        }
      }, 1000);
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
      //判断是否是微信浏览器访问
      //如果是微信浏览器, 根据openid进行登录
      $rootScope.isInWeiXin = window.plugins.wechat ? window.plugins.wechat.inWeixin : '';
      if ($rootScope.isInWeiXin) {
        var wechat = window.plugins.wechat;
        var code = wechat.getQueryString('code');
        wechat.hideOptionMenu();
        if (code) {
          wechat.getCookies(systemConfig, function() {
            $timeout(function() {
              var url = window.location.href;
              if (url.indexOf('code') >= 0) {
                url = url.replace(/\?.*#/, '#');
              }
              //如果 openid 不存在, 则继续刷新
              if (!Session.get('openId') && url) {
                Session.remove('nowUrl');
                //window.location.replace(url);
                wechat.weixinAuth(url);
              } else {
                wechat.initConfig(location.href.replace(location.hash, ""));
              }
            });
          });
        } else {
          if (Session.get('openId')) {
            wechat.initConfig(location.href.replace(location.hash, ""));
          } else {
            // 判断 openid 是否存在, 跳转微信授权
            wechat.inWeixin && wechat.weixinAuth();
          }
        }
      }

      $rootScope.ctrlList = [];
      //TODO 配置网络状态 临时处理
      $rootScope.errorNetwork = !1;
      /* 自己实现的后退处理历史处理 cody by lvwei 2016-10-25 ----------- begin -------------*/
      $rootScope.$on('$stateNotFound', function(event, o) {
        console.error('The request state was not found: ');
      });
      //页面渲染完成后的处理
      $rootScope.$on('$ionicView.afterEnter', function(event, o) {
        //如果当前页不是登录页, 则将全局标记 登录后退状态 设置为 false
        if (o.stateName!='login') {
          $rootScope._isLoginGoBack = false;
        }
        // //重置页面后退的标识
        // $rootScope._isPageGoBack = false;
      });
      $rootScope.$on('$ionicView.beforeLeave', function() {
        //页面离开全局关闭已弹出的 popup 窗口
        if ($rootScope._popupModal) {
          if (toolBox.hasPrototype($rootScope._popupModal, 'close')) {
            $rootScope._popupModal.close();
          }
          $rootScope._popupModal = null;
        }
      });
      //路由状态变更成功后的处理
      $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        //微信浏览器指定按钮隐藏
        //window.plugins.wechat.hideOptionMenu();
        //白名页处理
        var whitelist = ['/index', '/borrow', '/credit', '/my'];
        if (!$rootScope._isGoBack) {
          if (fromState.url != "^" && whitelist.indexOf(fromState.url) < 0 && whitelist.indexOf(toState.url) < 0 && toState.url != '/index?business') {
            $ionicViewSwitcher.nextDirection("forward");
          }
          //对非刷新访问, 并且不在白名单列表的路由增加页面过度动画
          if (fromState.url != "^" && whitelist.indexOf(fromState.url) < 0 && whitelist.indexOf(toState.url) < 0) {
            //对不需要页面过度动画的同一个路由访问做过滤
            var repeatList = ['order-list'];
            if (repeatList.indexOf(fromState.name) >= 0 && repeatList.indexOf(toState.name) >= 0) {
              //statement here
              $ionicViewSwitcher.nextDirection("none");
            } else {
              $ionicViewSwitcher.nextDirection("forward");
            }
          }
        }
        //不记录到历史中的页面: 填写订单, 收银台 --- 暂时不启用
        //var blackList = ['pay-platform']; //'order-settlement',
        //if (blackList.indexOf(fromState.name) < 0) {
        //记录回退历史
        toolBox.recordBackHistory(toState, toParams, fromState, fromParams);
        //}
        //是否隐藏购物车的后退按钮状态
        $rootScope.hideBackButton = true;
        //如果不是从 tab 页进入购物车都将隐藏 tabs
        $rootScope.hideTabs = '';
        var hideTabs = 'tabs-item-hide';
//      if (toState.name == 'tab.cart') {
//        var lastHistory = '';
//        //刷新了当前页
//        if (fromState.url == "^") {
//          lastHistory = toolBox.getLastHistory() || '';
//          //当历史中的上一个来源页不是 tab 页, 也将隐藏 tabs
//          if (lastHistory.indexOf('/tab') < 0) {
//            $rootScope.hideTabs = hideTabs;
//            $rootScope.hideBackButton = false;
//          } else if (lastHistory == '#/tab/cart') {
//            //如果来源页是 tab 页也隐藏 tab 栏
//            $rootScope.hideTabs = hideTabs;
//            $rootScope.hideBackButton = false;
//          }
//        } else if (fromState.name.indexOf('tab') < 0) {
//          lastHistory = toolBox.getLastHistory() || '';
//          //当历史中的上一个来源页不是 tab 页, 也将隐藏 tabs
//          if (lastHistory.indexOf('/tab') < 0) {
//            $rootScope.hideTabs = hideTabs;
//            $rootScope.hideBackButton = false;
//          } else if (lastHistory == '#/tab/cart') {
//            //如果来源页是 tab 页也隐藏 tab 栏
//            $rootScope.hideTabs = hideTabs;
//            $rootScope.hideBackButton = false;
//          }
//        }
//      }
      });
      /* 自己实现的后退处理历史处理 cody by lvwei 2016-10-25 -----------  end -------------*/
      //global goBack
      $rootScope.xgoBack = function(backto, noNeedToSave, e) {
        if (e != undefined && e)
          e.stopPropagation();
        toolBox.goBack(backto, noNeedToSave);
      };
      //ios 的滑动后退处理
      $rootScope.iosSwipe = function(backto, noNeedToSave, e) {
        var elemt = ng.element(e.target).parents('ion-slide');
        //如果父元素有 slider, 并且不是第一区块, 且退出
        if (elemt.length > 0 && elemt.index() > 0) {
          return;
        }
        //ios 设备才允许滑动后退
        if ($ionicPlatform.is('ios')) {
          $rootScope.xgoBack.apply(this, arguments);
        }
      };

      //主页面显示退出提示框 安卓的后退按钮事件注册
      $ionicPlatform.registerBackButtonAction(function(e) {
        e.preventDefault();
        //如果页面已经进入分享页, 则不做处理
        if ($rootScope.isSharing) {
          return false;
        }
        function showConfirm() {
          var confirmPopup = $ionicPopup.confirm({
            title: '提示',
            template: '<p class="text-center">您确定要退出应用吗?</p>',
            okText: '退出',
            cancelText: '取消'
          });
          confirmPopup.then(function(res) {
            if (res) {
              ionic.Platform.exitApp();
            } else {
              // Don't close
            }
          });
        }
        // Is there a page to go back to?
        if ($location.path() == '/tab/index') { //如果已经回退到首页
          /*$rootScope.backButtonPressedOnceToExit = true;
           $cordovaToast.showShortTop('再按一次退出系统');
           setTimeout(function () {
           $rootScope.backButtonPressedOnceToExit = false;
           }, 2000);*/
          showConfirm();
        } else {
          //console.log('$rootScope.ctrlGoBack:', $rootScope.ctrlGoBack)
          // Go back in history
          //$rootScope.$viewHistory.backView.go();
          //判断页面中是否有回退按钮
          // if ($rootScope.hasBackButton) {
          //判断控制层是否有自定义回退事件
          if ($rootScope.ctrlGoBack) {
            $rootScope.ctrlGoBack();
          } else {
            //没有自定义回退事件, 则使用全局的回退事件
            $rootScope.xgoBack();
          }
          // }else if ($location.path().indexOf('tab')) {
          //   //tab 页面使用全局的回退事件
          //   $rootScope.goBack();
          // }
        }
        return false;
      }, 101);
    });
  }
})(angular, jsonpath);