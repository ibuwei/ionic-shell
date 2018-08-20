(function(){
	'use strict';
	angular.module('app.controllers').controller('submitOrder', submitOrder);
	submitOrder.$inject = ['$rootScope', '$scope', '$stateParams', '$state', 'commonFn','Session','userService', 'toolBox', 'systemConfig','orderService'];
  function submitOrder($rootScope, $scope, $stateParams, $state, commonFn,Session, userService, toolBox, systemConfig, orderService){
  	//数据模型
  	var vm = this;
    vm.pageInfo = ''; //页面数据
    vm.leavemessage = '我是留言'; //留言
    
    //事件
    vm.createOrder = createOrder; //创建订单
    
    // start
    $scope.$on('$ionicView.beforeEnter',function(){
      var params = {
        order_tag:$stateParams.tag,
      }
      
      if(params.order_tag == 1){
        params.order_tag = 'buy_now';
        params.order_goods_type = $stateParams.goods_type;
        params.order_sku_list = $stateParams.sku;
      }else if(params.order_tag == 2){
        params.order_tag = 'cart';
        params.cart_list = $stateParams.cartList;
      }else if(params.order_tag == 5){
        params.order_tag = 'js_point_exchange';
        params.order_sku_list = $stateParams.sku;
      }
      
      orderService.getOrderData(params).then(function (res){
        vm.pageInfo = res;
      })
    });
    
    //创建订单
    function createOrder(){
      var params = {
        user_telephone: '',
        use_coupon: 0, // 优惠券
        integral: vm.pageInfo.count_point_exchange,//积分
        goods_sku_list: vm.pageInfo.goods_sku_list,
        leavemessage: vm.leavemessage, //留言
        account_balance: 0.00, //使用余额 ？？？？？？？
        pay_type: 4, //支付方式-没有支付(4:货到付款)
        buyer_invoice:'',//发票
        pick_up_id: 0, //自提
        shipping_company_id: 1, //物流公司id
        combo_package_id: 0, //是否是组合商品 - 需要再测
        buy_num: 1, //购买数量-组合商品 - 需要再测
        shipping_time: 0, //配送时间列表
        point_exchange_type:vm.pageInfo.point_exchange_type, //是否是积分兑换
        delivery_type: 1, //配送方式
        is_full_payment: 0, //预售是否全款
      }
     
      var myurl = systemConfig.createOrderBuyNow;
      params.point_exchange_type == 1 ? myurl = systemConfig.createOrderPoint : '';
      
      toolBox.showLoading();
      orderService.createOrder(params, myurl).then(function (res){
        toolBox.hideLoading();
        vm.pageInfo = res;
        $rootScope._noNeedToSave = true;
        $state.go('orderList',{status:'all'});
      },function(error){
        toolBox.hideLoading();
      })
    }
    
  }
})();
