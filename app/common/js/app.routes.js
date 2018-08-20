/**
 * ui-router的配置文件
 * @author lvwei
 * @date   2017-11-30T18:00:38+0800
 * @param  {[type]}                 ng [description]
 * @param  {[type]}                 jp [description]
 * @return {[type]}                    [description]
 */
(function(ng, jp) {
  ng.module('app.routes')
    .config(routesConfig);
    routesConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider'];
    function routesConfig($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
      $ionicConfigProvider.platform.ios.tabs.style('standard');
      $ionicConfigProvider.platform.ios.tabs.position('bottom');
      $ionicConfigProvider.platform.android.tabs.style('standard');
      $ionicConfigProvider.platform.android.tabs.position('standard');

      $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
      $ionicConfigProvider.platform.android.navBar.alignTitle('left');

      $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
      $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');

      $ionicConfigProvider.platform.ios.views.transition('ios');
      $ionicConfigProvider.platform.android.views.transition('android');

      //装饰路由配置
      $stateProvider.decorator('parent', function(internalStateObj, parentFn) {
        // This fn is called by StateBuilder each time a state is registered
        /*路由信息*/
        var state = internalStateObj.self;
        // The first arg is the internal state. Capture it and add an accessor to public state object.
        state.$$state = function() { return internalStateObj; };
        //if (!hasPrototype(state, 'templateUrl')) state.template = '<div ui-view></div>';
        //nodeList.push(state.name);
        return parentFn(internalStateObj);
      });
      // Ionic uses AngularUI Router which uses the concept of states
      // Learn more here: https://github.com/angular-ui/ui-router
      // Set up the various states which the app can be in.
      // Each state's controller can be found in controllers.js
      $stateProvider
        //这里判断是否到引导页
        .state('mystart', {
          url: '/mystart',
          cache: false,
          controller: 'MyStart as vm'
        })
        .state('intro', {
          url: '/intro',
          templateUrl: 'templates/intro.html',
          controller: 'IntroCtrl'
        })
        // 注册
        .state('register', {
          url: '/register',
          templateUrl: 'view/login/register.html',
          controller: 'LoginCtrl as vm',
        })
        
        // 登录
        .state('login', {
          cache: false,
          url: '/login',
          templateUrl: 'view/login/login.html',
          controller: 'LoginCtrl as vm',
        })
      
        .state('tab', {
          url: '/tab',
          abstract: true,
          templateUrl: 'view/tabs/tabs.html',
          controller: 'TabController as vm'
        })
        
        //首页
        .state('tab.index', {
          url: '/index',
          views: {
            'tab-index': {
              templateUrl: 'view/tabs/tab-home.html',
              controller: 'HomeCtrl as vm'
            }
          }
        })
        
        //分类
        .state('tab.class', {
          url: '/class',
          views: {
            'tab-class': {
              templateUrl: 'view/tabs/tab-class.html',
              controller: 'TabClassCtrl as vm'
            }
          }
        })
        
        
        // 购物车
        .state('tab.shopcar', {
          url: '/shopcar',
          views: {
            'tab-shopcar': {
              templateUrl: 'view/tabs/tab-shopcar.html',
              controller: 'shopcar as vm'
            }
          }
        })
        
        //会员中心
        .state('tab.my', {
          url: '/my',
          views: {
            'tab-my': {
              templateUrl: 'view/tabs/tab-my.html',
              controller: 'MyCtrl as vm',
            }
          }
        })
        
        //商品列表
        .state('goodsList', {
          url: '/goodsList?cid',
          templateUrl: 'view/goods/goodsList.html',
          controller: 'goodsList as vm',
        })
        
        //限时折扣
        .state('discount', {
          url: '/discount',
          templateUrl: 'view/goods/discount.html',
          controller: 'discount as vm',
        })
        
        //商品详情
        .state('goodsDetail', {
          url: '/goodsDetail?id',
          templateUrl: 'view/goods/goodsDetail.html',
          controller: 'goodsDetail as vm',
        })
        
        //商品搜索结果
        .state('searchResult', {
          url: '/searchResult?keywords',
          templateUrl: 'view/goods/searchResult.html',
          controller: 'SearchResult as vm',
        })
        
        //个人中心
        .state('myInfo', {
          url: '/myInfo',
          templateUrl: 'view/my/myInfo.html',
          controller: 'myInfo as vm',
        })
        
        //修改密码
        .state('modifyPsd', {
          url: '/modifyPsd',
          templateUrl: 'view/my/modifyPsd.html',
          controller: 'modifyPsd as vm',
        })
        
        //收货地址-列表
        .state('addressList', {
          url: '/addressList?from', //检测是否是提交订单页面的跳转
          templateUrl: 'view/address/addressList.html',
          controller: 'addressList as vm',
        })
        
        //收货地址-添加修改
        .state('addAddress', {
          url: '/addAddress?id&address_info&from',
          templateUrl: 'view/address/addAddress.html',
          controller: 'addAddress as vm',
        })
        
        // 提交订单
        .state('submitOrder', {
          url: '/submitOrder?tag&sku&goods_type&cartList&addressId',
          templateUrl: 'view/order/submitOrder.html',
          controller: 'submitOrder as vm',
        })
        
        // 订单列表
        .state('orderList', {
          url: '/orderList?status',
          templateUrl: 'view/order/orderList.html',
          controller: 'orderList as vm',
        })
        
        // 订单详情
        .state('orderDetail', {
          url: '/orderDetail?id',
          templateUrl: 'view/order/orderDetail.html',
          controller: 'orderDetail as vm',
        })
        
        //我的收藏
        .state('myCollect', {
          url: '/myCollect',
          templateUrl: 'view/my/myCollect.html',
          controller: 'MyCollect as vm',
        })
        
        //我的积分
        .state('myScore', {
          url: '/myScore',
          templateUrl: 'view/my/myScore.html',
          controller: 'MyScore as vm',
        })
        
        //文章列表
        .state('newsList', {
          url: '/newsList',
          templateUrl: 'view/news/newsList.html',
          controller: 'newsList as vm',
        })
        
        //文章详情
        .state('newsDetail', {
          url: '/newsDetail?id',
          templateUrl: 'view/news/newsDetail.html',
          controller: 'newsDetail as vm',
        })
        
        //物流承诺
        .state('mail', {
          url: '/mail',
          templateUrl: 'view/news/mail.html',
          controller: 'mail as vm'
        })
        
        //我要评价
        .state('evaluate', {
          url: '/evaluate?id',
          templateUrl: 'view/order/evaluate.html',
          controller: 'evaluate as vm'
        })
        
        //我要评价
        .state('evaluateAgain', {
          url: '/evaluateAgain?id',
          templateUrl: 'view/order/evaluateAgain.html',
          controller: 'evaluateAgain as vm'
        })
        
        //我的物流
        .state('express', {
          url: '/express?id',
          templateUrl: 'view/order/express.html',
          controller: 'express as vm'
          
        })

     
      $urlRouterProvider.otherwise('/mystart');
    }
})(angular, jsonpath);

