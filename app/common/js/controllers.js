/**
 * tab - controller
 * @param  {[type]} ng [description]
 * @param  {[type]} jp [description]
 * @return {[type]}    [description]
 */
(function(ng, jp) {
  "use strict";
  ng.module('app.controllers')
    .controller('TabController', TabController);

  TabController.$inject = ['$scope', '$state', 'sessionStorage', '$location', 'toolBox', '$timeout', 'Session'];

  function TabController($scope, $state, sessionStorage, $location, toolBox, $timeout, Session) {
    $scope.$on('$ionicView.beforeEnter', function() {
      var params = $location.search();
      if (params.statename) {
        var state = {
          name: params['statename'],
          params: params,
          options: {
            reload: true
          }
        };
        delete params['statename'];
        toolBox.direction.none(state);
      }
    });
    //路由变更完成时
    $scope.$on('$ionicView.enter', function(event, data) {
      $scope.UnreadCount = false;
      //设置白名单 tab 路由
      //var blackList = ['tab.cart'];
      var blackList = ['tab.index', 'tab.borrow', 'tab.credit', 'tab.my'];
      //当前 stateName 在白名单(购物车页面)中, 则不清空后退历史
      if (blackList.indexOf(data.stateName) >= 0) {
        sessionStorage.set('_app_router', []);
        sessionStorage.set('_app_states', []);
      }
      if (Session.get('authorizationToken')) {
        // tabService.NewsUnreadCount().then(function(result){
        //   if(result > 0){
        //     $scope.UnreadCount=true;
        //   }
        // })
      }
    });
  }
})(angular, jsonpath);

(function(ng, jp) {
  "use strict";
  ng.module('app.controllers')
    .controller('MyStart', MyStart)
    .controller('IntroCtrl', IntroCtrl);

  //我的引导控制层
  MyStart.$inject = ['$scope', 'toolBox', 'sessionStorage', '$rootScope', '$ionicPlatform'];
  function MyStart($scope, toolBox, sessionStorage, $rootScope, $ionicPlatform) {
    var vm = this;
    //转到首页
    vm.turnToIndex = turnToIndex;
    //转到引导页
    vm.turnToIntro = turnToIntro;
    //提前显示 navbar
    // $scope.$on('$ionicView.beforeEnter', function() {
    //   $rootScope.navbarshow = true;
    // });
    if ($ionicPlatform.is('ios')) {
      $rootScope.navbarshow = true;
      vm.turnToIndex();

      //TODO 下面是引导页的处理, 有需要再开启
      // vm.turnToIntro();
    } else {
      $rootScope.navbarshow = false;
      vm.turnToIndex();
    }
    /**
     * 转到首页的实现
     * @author lvwei
     * @date   2018-07-23T20:30:47+0800
     * @return {[type]}                 [description]
     */
    function turnToIndex() {
      var state = {
        name: 'tab.index',
        params: {}
      };
      toolBox.direction.none(state);
    }
    /**
     * 转到引导页的实现
     * @author lvwei
     * @date   2018-07-23T20:32:07+0800
     * @return {[type]}                 [description]
     */
    function turnToIntro() {
      var state = {
        name: 'intro',
        params: {}
      };
      toolBox.direction.none(state);
      sessionStorage.set('_app_router', []);
      sessionStorage.set('_app_states', []);
    }

  }

  //引导页
  IntroCtrl.$inject = ['$scope', '$rootScope', 'toolBox', '$ionicSlideBoxDelegate'];
  function IntroCtrl($scope, $rootScope, toolBox, $ionicSlideBoxDelegate) {
    // Called to navigate to the main app
    $scope.startApp = function() {
      var state = {
        name: 'tab.index',
        params: {}
      };
      toolBox.direction.none(state);
    };
    $scope.next = function() {
      $ionicSlideBoxDelegate.next();
    };
    $scope.previous = function() {
      $ionicSlideBoxDelegate.previous();
    };

    // Called each time the slide changes
    $scope.slideChanged = function(index) {
      $scope.slideIndex = index;
    };

    $scope.$on('$ionicView.beforeLeave', function() {
      $rootScope.navbarshow = false;
    });
  }
})(angular, jsonpath);