/*
 * tab-home
 * tab-class
 * tab-shopcar
 * tab-my
 * tabCoin
 * */

/*
 * tab-home
 * */
(function(ng, jp) {
  ng.module('app.controllers')
    .controller('HomeCtrl', HomeCtrl);
  HomeCtrl.$inject = ['$rootScope', '$scope', '$stateParams', '$state', 'systemConfig', 'commonFn', 'toolBox', 'tabService', 'goodsService', '$interval'];

  function HomeCtrl($rootScope, $scope, $stateParams, $state, systemConfig, commonFn, toolBox, tabService, goodsService, $interval) {
    //数据模型
    var vm = this;
    //参数
    vm.params = {
      keywords: '', //搜索关键字
    };
    vm.myScoItemW;  //根据设备计算活动模块的宽度
    //数据
    vm.data = {
      advList: {}, //广告列表
      discountList: {}, //折扣商品
      platformList: {}, //热卖,热评等商品列表
      searchResult: {},
      fullGive: {}, //满减
      subImgW:'', //计算subimg的宽度
    };
    vm.myinterval; //计时器

    //事件
    vm.search = search; //搜搜
    vm.getIndexData = getIndexData; //取得首页数据
    vm.addCart = addCart; //加入购物车
    vm.goodsSearch = goodsSearch; //商品搜索
    vm.timer = timer; //倒计时
    
    //页面渲染前执行的事件
    $scope.$on("$ionicView.enter", init);

    function init() {
      //参数初始化
      //执行事件
      vm.getIndexData();
      vm.myScoItemW = screen.width*0.7-12+'px';
      vm.data.subImgW = (screen.width-40)/3 +'px'
    }
    //页面离开时, 清除 timer
    $scope.$on("$ionicView.leave", leave);
    function leave() {
      if (vm.myinterval != undefined && ng.isObject(vm.myinterval)) {
        $interval.cancel(vm.myinterval);
      }
    }
    /**
     * 搜索事件
     * @author lvwei
     * @date   2018-05-14T13:45:44+0800
     * @return {[type]}                 [description]
     */
    function search() {
      vm.goodsSearch();
    }
    /**
     * 取得首页数据
     * @author lvwei
     * @date   2018-05-14T13:46:24+0800
     * @return {[type]}                 [description]
     */
    
    function getIndexData() {
      var params = {};
      toolBox.showLoading();
      tabService.getIndexData(params).then(function(result) {
        vm.data.advList = result.adv_list;
        vm.data.discountList = result.discount_list;
        vm.data.platformList = result.goods_platform_list;
        // vm.data.fullGive = result.mansong_list.data;
        
        //处理活动数据
        // angular.forEach(vm.data.advList.adv_act_list.adv_list, function (item){
        //   var goodsid = item.adv_url.split('goodsid=');
        //   item.goodsid = goodsid[1];
        // })  
        
        //倒计时
        vm.timer();
        
      }).finally(function() {
        toolBox.hideLoading();
      });
    }
    /**
     * 加入购物车
     * @author lvwei
     * @date   2018-05-14T14:42:51+0800
     * @param  {[type]}                 goods [description]
     */
    function addCart(goods) {
      toolBox.msgToast('实现加入购物车');
    }
  
    /**
     * 跳转商品搜索
     * @author lvwei
     * @date   2018-05-14T15:20:07+0800
     * @return {[type]}                 [description]
     */
    function goodsSearch() {
      //如果搜索关键字不为空
//    if (vm.params.keywords) {
        var state = {
          name: 'searchResult',
          params: {keywords: vm.params.keywords},
        };
        toolBox.direction.forward(state);
//    } else {
//      toolBox.msgToast("请输入搜索关键字");
//    }
    }
    
    //倒计时
    function timer() {
      var currentTime ;
      var params = {};
      if(vm.data.discountList.data.length > 0){
        goodsService.discountCurrentTime(params).then(function (res){
          currentTime = res.current_time;
          vm.myinterval = $interval(function(){
            currentTime = currentTime + 1000;
            var endT = vm.data.discountList.data[0].end_time;
            var newT = endT - currentTime/1000;
            vm.data.discountList.currentTime = currentTime;
            newT > 0 ? vm.data.discountList.timer = toolBox.countDown(newT): vm.data.discountList.timer = '活动已结束';
          },1000)
        })
      }       
    }
    
  }
})(angular, jsonpath);

/*
 * tab-class
 * @Author: narlian
 * @Date:   2018-05-10 12:06:38
 * @Last Modified by:   lvwei
 * @Last Modified time: 2018-08-19 22:24:45
*/

(function(ng, jp) {
  'use strict';
  ng.module('app.controllers')
    .controller('TabClassCtrl', tabClassCtrl);

  tabClassCtrl.$inject = ['$scope', 'tabService'];
  function tabClassCtrl($scope, tabService) {
    var vm = this;
    //参数准备
    vm.params = {
      goodsCateList: []
    };
    //事件注册
    vm.getGoodsCategoryList = getGoodsCategoryList;

    $scope.$on('$ionicView.beforeEnter', beforeEnter);
    function beforeEnter() {
      vm.getGoodsCategoryList()
    }
    //取得商品分类列表
    function getGoodsCategoryList() {
      var params = {};
      tabService.getGoodsCategoryList(params).then(function(result) {
        vm.params.goodsCateList = result.goods_category_list;
      });
    }
  }
})(angular, jsonpath);

/*
 * tab-shopcar
 * */
(function(ng, jp) {
  ng.module('app.controllers').controller('shopcar', shopcar);
  shopcar.$inject = ['$rootScope', '$scope', '$stateParams', '$state', 'toolBox', 'tabService'];

  function shopcar($rootScope, $scope, $stateParams, $state, toolBox, tabService) {
    //数据模型
    var vm = this;
    vm.data = '';
    vm.selectAll = 'N'; //是否全选
    vm.allMoney = 0;
    vm.showDel = false; //显示删除按钮
    vm.selctedIds = []; //被选中的ids
    
    //事件
    vm.getData = getData; //获取数据 
    vm.addSbtract = addSbtract;//加减器
    vm.changeNum = changeNum; //改变数量
    vm.selectFn = selectFn; //选择商品
    vm.selectAllFn = selectAllFn; //全选
    vm.countAllMoney = countAllMoney; //计算总价,统计被选中ids
    vm.next = next; //下一步
    vm.cartDel = cartDel; //购物车删除

    $scope.$on('$ionicView.beforeEnter', enterInit);
    
    //页面进入后的初始化方法
    function enterInit() {
      vm.data = '';
      //执行页面数据初始化事件
      vm.getData();
    }
    
    //获取数据
    function getData(){
      var params = {};
      tabService.cart(params).then(function(res){
        vm.data =res.cart_list;
      })
    }
    
    //加减器
    function addSbtract(info, num){
      var params = {
        cartid:info.cart_id, 
        num:info.num + num
      }
      
      if(params.num <= 0){
        toolBox.msgToast('亲，该宝贝不能减少了哟~');
      }else if(params.num > info.stock){
        toolBox.msgToast('亲，该宝贝不能购买更多了哟~');
      }else{
        tabService.cartAddplus(params).then(function(res){})
        //改变数量
        angular.forEach(vm.data,function(item){
          if(info.cart_id == item.cart_id){
            item.num = params.num;
          }
        })
        vm.countAllMoney();
      }
    }
    
    //改变数量
    function changeNum(info){
      if(info.num < 1){
        toolBox.msgToast('亲，该宝贝不能减少了哟~');
      }else if(info.num > info.stock){
        info.num = info.stock;
        toolBox.msgToast('亲，该宝贝不能购买更多了哟~');
      }else{
        var params = {
          cartid:info.cart_id, 
          num:info.num
        }
        tabService.cartAddplus(params).then(function(res){})
        vm.countAllMoney();
      }
    }
    
    //选择商品
    function selectFn(info){
      angular.forEach(vm.data,function(item){
        if(info.cart_id == item.cart_id){
          item.selected == 'Y' ?item.selected = 'N':item.selected = 'Y';
        }
      })
      
      // 检测是否全选, 计算总价
      vm.selectAll = 'Y'; //是否全选
      angular.forEach(vm.data,function(item){
        item.selected == "N" || item.selected == undefined ?vm.selectAll = 'N':'';
      })
      
      vm.countAllMoney();
    }
    
    //全选
    function selectAllFn(){
      if(vm.selectAll == "Y"){
        vm.selectAll = "N";
        angular.forEach(vm.data,function(item){
          item.selected = 'N';
        })
      }else{
        vm.selectAll = "Y";
        angular.forEach(vm.data,function(item){
          item.selected = 'Y';
        })
      }
      vm.countAllMoney();
    }
    
    //计算总价,统计被选中ids
    function countAllMoney(){
      vm.allMoney = 0;
      vm.selctedIds = [];
      angular.forEach(vm.data,function(item){
        if(item.selected == "Y"){
          vm.allMoney += item.price * item.num;
          vm.selctedIds.push(item.cart_id);
        }
      })
      vm.selctedIds = vm.selctedIds.join(',');
    }
    
    //下一步
    function next(){
      if(vm.selctedIds.length > 0){
        $state.go("submitOrder", {cartList: vm.selctedIds, tag:2});
      }else{
        toolBox.msgToast('请选择商品');
      }
    }
    
    //购物车删除
    function cartDel(){
      var params={
        del_id:vm.selctedIds,
      }
      
      tabService.cartDelete(params).then(function(){
        vm.getData();
      })
    }
    

  }
})(angular, jsonpath);


/*
 * tab-my
 * 
 * */
/**
 * 我的 控制层
 * @param  {[type]} ng [description]
 * @param  {[type]} jp [description]
 * @return {[type]}    [description]
 */
(function(ng, jp) {
  ng.module('app.controllers')
    .controller('MyCtrl', MyCtrl);

  MyCtrl.$inject = ['$rootScope', '$scope', '$stateParams', '$state', 'commonFn', 'toolBox', 'userService', 'Session'];
  function MyCtrl($rootScope, $scope, $stateParams, $state, commonFn, toolBox, userService, Session) {
    var vm = this;
    //参数初始化
    $scope.title = '';
    vm.data = {
      userInfo: {},
      memberIndex: {},
    };
    //事件声明
    vm.myInfo = myInfo;
    vm.logout = logout;
    vm.getUserInfo = getUserInfo; //用户详情
    vm.getMenberIndex = getMenberIndex; //取得用户相关统计数据

    //页面渲染前的页面事件
    $scope.$on('$ionicView.beforeEnter', enterInit);
    /**
     * 页面进入后的初始化方法
     * @author lvwei
     * @date   2017-12-07T11:46:43+0800
     * @return {[type]}                 [description]
     */
    function enterInit() {
      var userInfo = Session.get('userInfo');
      if (!userInfo) {
        if ($rootScope._isLoginGoBack == true) {
          $rootScope._isLoginGoBack = false;
          toolBox.goBack();
        } else {
          // toolBox.msgToast("用户未登录, 请返回重新操作");
          // toolBox.goBack();
          toolBox.msgToast("用户未登录, 请登录");
          var state = {
            name: 'login',
            params: {}
          };
          toolBox.direction.forward(state);
        }
      } else {
        vm.getUserInfo();
      }
    }
    //页面事件
    $scope.eaOkBtn = function() {
      //关闭错误弹出框
      commonFn.closeErrorPop();
    }; 
    $scope.reload = function() {
      //无网图刷新按钮
      commonFn.reload();
    }; 

    /**
     * 跳转我的页面
     * @author lvwei
     * @date   2017-11-29T18:26:30+0800
     * @return {[type]}                 [description]
     */
    function myInfo() {
      var state = {
        name: 'myInfo'
      };
      toolBox.direction.forward(state);
      //$state.go('myInfo');
    }

    function logout() {
      userService.logout().then(function() {
        toolBox.msgToast('您已经退出');
        toolBox.direction.back('tab.index');
      });
    }
    /**
     * 取得用户信息
     * @author lvwei
     * @date   2017-12-07T11:42:59+0800
     * @return {[type]}                 [description]
     */
    function getUserInfo() {
      if (Session.get('userInfo')) {
        userService.getUserInfo().then(function(result) {
          if (ng.isObject(result)) {
            Session.set('userInfo', result);
            // vm.userInfo = data;
            vm.data.userInfo = result;
            vm.getMenberIndex();
          }
        });
      }
    }
    /**
     * 取得用户相关统计数据
     * @author lvwei
     * @date   2018-05-11T16:07:27+0800
     * @return {[type]}                 [description]
     */
    function getMenberIndex() {
      userService.getMenberIndex().then(function(result) {
        vm.data.memberIndex = result;
      });
    }
  }
})(angular, jsonpath);

