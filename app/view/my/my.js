/*
 * myCollect
 * myInfo
 * myScore
 * modifyPsd
 * 
 * */

/*
 * 2018.5.4 zhangyafei 
 * myCollect
 * */
(function(){
	'use strict';
	angular.module('app.controllers')
    .controller('MyCollect', myCollect);
	myCollect.$inject = ['$rootScope', '$scope', '$stateParams', '$state', 'commonFn','Session','userService', 'toolBox', 'systemConfig', '$timeout'];
  function myCollect($rootScope, $scope, $stateParams, $state, commonFn,Session, userService, toolBox, systemConfig, $timeout){
  	//数据模型
  	var vm = this;
    vm.params = {
      page: 1,
      type: 0,
    };
    
    vm.page = {
      ids: [], 
      data:[], //存储数据
      currentPage: 1,
      pageSize:10,
      noDate:false,
      hasmore:true,
    };
    
    //事件
    vm.refresh = refresh; //下拉刷新
    vm.loadMore = loadMore; //上拉加载
    vm.getData = getData; //取得收藏列表
    vm.switchTab = switchTab; //切换 tab
    vm.cancelFav = cancelFav; //取消收藏 
    
    // start 
    
    //进入页面时渲染执行的事件
    $scope.$on("$ionicView.beforeEnter", init);
    //初始化
    function init(){
//    vm.getData();
    }
    
    //下拉刷新
    function refresh(){
      vm.page.ids = [];
      vm.page.data = [];
      vm.page.currentPage = 1;
      vm.getData();
    } 
    
    //上拉加载
    function loadMore(){
      $timeout(function(){  //延时器
        vm.getData();
      },300)
    }
    
    /**
     * 取得我的收藏列表
     * @author lvwei
     * @date   2018-05-13T20:54:30+0800
     * @return {[type]}                 [description]
     */
    function getData() {
      var params = {
        page: vm.page.currentPage,
        page_size: vm.page.pageSize,
        type: vm.params.type,
      };
      userService.getMyCollection(params).then(function(result) {
        handlePage(result.data);  
      }).finally(function() {
        $scope.$broadcast('scroll.refreshComplete');
      });
      
      function handlePage(data){   
        //分页数据累加
        angular.forEach(data, function(item){
          if(vm.page.ids.indexOf(item.goods_id) < 0){
            vm.page.ids.push(item.goods_id);
            vm.page.data.push(item);
          }
        }) 
        
        var pageData = data; //后台的分页数组
        
        //检测是否有数据-自动化处理
        if(vm.page.currentPage ==1 && pageData.length == 0){
          vm.page.noDate = true;
          vm.page.hasmore=false;
        }else{
          vm.page.noDate = false;
          //检测是否最后一页
          if(pageData.length == 0 || pageData.length < vm.page.currentPage){ 
            vm.page.hasmore = false;
          }else{
            $scope.$broadcast('scroll.infiniteScrollComplete');//这里是告诉ionic更新数据完成，可以再次触发更新事件
            vm.page.hasmore = true;
            vm.page.currentPage++;                          
          }
        }
      }
      
    }
    /**
     * 切换 tab
     * @author lvwei
     * @date   2018-05-13T21:32:50+0800
     * @param  {[type]}                 type [description]
     * @return {[type]}                      [description]
     */
    function switchTab(type) {
      vm.params.type = type;
      vm.params.page = 1;
      vm.refresh();
    }
    /**
     * 取消收藏
     * @author lvwei
     * @date   2018-05-13T21:33:09+0800
     * @return {[type]}                 [description]
     */
    function cancelFav(item, thisIndex) {
      var options = {
        title: '取消收藏',
        template: '确认要取消收藏此商品吗?',
        ok: function() {
          var params = {
            fav_id: item.goods_id,
            fav_type: 'goods',
            log_msg: item.goods_name,
          };
          toolBox.showLoading()
          userService.cancelFavorites(params).then(function(result) {
            vm.page.data.splice(thisIndex, 1); //无刷新的删除
          }).finally(function() {
            toolBox.hideLoading()
          });
        }
      };
    }
  }
})();

/*
 * myInfo 
 * */
(function(){
  'use strict';
  angular.module('app.controllers').controller('myInfo', myInfo);
  myInfo.$inject = ['$rootScope', '$scope', '$stateParams', '$state', 'commonFn','Session','userService', 'toolBox', 'systemConfig',];
  function myInfo($rootScope, $scope, $stateParams, $state, commonFn,Session, userService, toolBox, systemConfig){
    
    var vm = this;
    vm.data = {
      userInfo: {}
    };
    vm.logout = logout;
    $scope.title = '个人信息';
    var firstLoadApi = systemConfig.getUserInfo;

    var openId = $stateParams.openId,
      userId = $stateParams.userId,
      token = Session.getToken();

      $scope.$on('$ionicView.beforeEnter', enterInit);
      //页面进入后的初始化方法
      function enterInit() {
        //执行页面数据初始化事件
        firstLoad();
      }
      //初始化数据
      function firstLoad() {
        userService.getUserInfo().then(function(data) {
          if (angular.isObject(data)) {
            Session.set('userInfo', data);
            vm.data.userInfo = data;
          }
        }, function(error) {
          if (angular.isObject(error) && error.reason) {
            toolBox.msgToast(error.reason);
          }
        }).finally(function() {
          toolBox.hideLoading();
        });
      }

      $scope.MyBack = function() { //返回键
        $state.go('tab.index', {
          openId: $stateParams.openId,
          token: $stateParams.token,
          userId: $stateParams.userId
        });
      };
      /**
       * 退出登录
       * @author lvwei
       * @date   2017-11-29T18:39:05+0800
       * @return {[type]}                 [description]
       */
      function logout() {
        userService.logout().then(function() {
          toolBox.msgToast('您已经退出');
          var state = {
            name: 'tab.index',
            params: {}
          };
          toolBox.direction.back(state);
        });
        // $state.go('login');
      }
  }
})();

/*
 * 2018.5.4 zhangyafei 
 * myScore
 * */
(function(ng) {
  'use strict';
  ng.module('app.controllers')
    .controller('MyScore', myScore);
  myScore.$inject = ['$rootScope', '$scope', '$stateParams', '$state', 'Session', 'userService', 'toolBox', 'systemConfig', '$timeout'];

  function myScore($rootScope, $scope, $stateParams, $state, Session, userService, toolBox, systemConfig, $timeout) {
    //数据模型
    var vm = this;
    //参数
    vm.params = {
      account_type: 1,
    };
    //数据
    vm.data = {
      //账户详情
      accountInfo: {},
    };
    
    vm.page = {
      data:[], //存储数据
      noDate:false,
    };

    //事件
    vm.refresh = refresh; //下拉刷新
    vm.getData= getData; //获取数据
    vm.getAccountInfo = getAccountInfo;

    //页面渲染前执行的事件
    $scope.$on("$ionicView.beforeEnter", init);
    function init() {
      //参数初始化
      vm.getAccountInfo();
    }
    
    //下拉刷新
    function refresh(){
      vm.page.data = [];
      vm.getData();
    } 
    
    /**
     * 取得账户信息
     * @author lvwei
     * @date   2018-05-14T11:25:49+0800
     * @return {[type]}                 [description]
     */
    function getAccountInfo() {
      var params = {};
      userService.getAccountInfo(params).then(function(result) {
        vm.data.accountInfo = result;
        vm.getData();
      });
    }
    /**
     * 取得账户积分列表信息
     * @author lvwei
     * @date   2018-05-14T11:26:02+0800
     * @return {[type]}                 [description]
     */
    function getData() {
      var params = {};
      userService.getRecordsList(params).then(function(result) {
        vm.page.data = result.data; 
      }).finally(function() {
        $scope.$broadcast('scroll.refreshComplete');
      });
    }

  }
})(angular);

/*
 * 2018.5.21 zhangyafei 
 * modifyPsd
 * */
(function(ng) {
  'use strict';
  ng.module('app.controllers')
    .controller('modifyPsd', modifyPsd);
  modifyPsd.$inject = ['$rootScope', '$scope', '$stateParams', '$state', 'Session', 'userService', 'toolBox', 'systemConfig'];

  function modifyPsd($rootScope, $scope, $stateParams, $state, Session, userService, toolBox, systemConfig) {
    //数据模型
    var vm = this;
    vm.params = {
      old_password: '',
      new_password: '',
      new_password2: '',
    }
    
    //事件
    vm.next = next;
    
    //start
    function next(){
      if(!vm.params.old_password){
        toolBox.msgToast('请输入原始密码');
      }else if(!vm.params.new_password){
        toolBox.msgToast('请输入新密码');
      }else if(vm.params.new_password.length < 5){
        toolBox.msgToast('密码最少5位');
      }else if(vm.params.new_password != vm.params.new_password2){
        toolBox.msgToast('两次密码不一致');
      }else{
        var params = {
          old_password: vm.params.old_password,
          new_password: vm.params.new_password
        }
        userService.modifyPsd(params).then(function(res){
          if(res != 1){
            toolBox.msgToast(res[1]);
          }else{
            toolBox.msgToast('修改成功');
            toolBox.goBack();
          }
        })
      }
    }

  }
})(angular);

