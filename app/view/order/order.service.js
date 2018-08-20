/*
* 2018-05-14 zhangyafei
* 
*/

(function(ng, jp) {
  ng.module('app.services')
    .factory('orderService', orderService);

  orderService.$inject = ['toolBox', 'systemConfig', '$q'];
  function orderService(toolBox, systemConfig, $q) {
    var service = {
      getOrderData: getOrderData, //提交订单时，获取订单信息
      createOrder: createOrder, //提交订单
      orderList: orderList, //订单列表
      orderDetail: orderDetail, //订单详情
      getdelivery: getdelivery, //确认收货
      
      deleteOrder: deleteOrder, //删除订单
      
      evaluateInit: evaluateInit,  //评价初始化
      evaluate: evaluate, //评论
      evaluateAgainInit: evaluateAgainInit, //追加评价初始化
      evaluateAgain: evaluateAgain, //追加评论
      expressInit: expressInit, //物流初始化 orderId
      expressInfo: expressInfo,  //物流信息 express_id
      
    };
    return service;

    
    /*
     * 2018-05-14 zhangyafei
     * 提交订单时，获取订单信息
     * */
    function getOrderData(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.getOrderData,
        params:params
      }
      toolBox.http.post(config)
        .then(function(response){
          deferred.resolve(response.data);
        },function(error){
          deferred.reject(error);
        });
      return deferred.promise;
    }
    
    /*
     * 2018-05-15 zhangyafei
     * 提交订单
     * */
    
    function createOrder(params, myurl) {
      var deferred = $q.defer();
      var config = {
        url: myurl ,
        params:params
      }
      toolBox.http.post(config)
        .then(function(response){
          deferred.resolve(response.data);
        },function(error){
          deferred.reject(error);
        });
      return deferred.promise;
    }
    
    /*
     * 2018-05-15 zhangyafei
     * 订单列表
     * */
    function orderList(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.orderList,
        params:params
      }
      toolBox.http.post(config)
        .then(function(response){
          deferred.resolve(response.data);
        },function(error){
          deferred.reject(error);
        });
      return deferred.promise;
    }
   
    /*
     * 2018-05-15 zhangyafei
     * orderDetail
     * */
    function orderDetail(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.orderDetail,
        params:params
      }
      toolBox.http.post(config)
        .then(function(response){
          deferred.resolve(response.data);
        },function(error){
          deferred.reject(error);
        });
      return deferred.promise;
    }
    
    /*
     * 2018-05-23 zhangyafei
     * 确认收货
     * */
    function getdelivery(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.getdelivery,
        params:params
      }
      toolBox.http.post(config)
        .then(function(response){
          deferred.resolve(response.data);
        },function(error){
          deferred.reject(error);
        });
      return deferred.promise;
    }
    
    /*
     * 2018-05-23 zhangyafei
     * 删除订单
     * */
    function deleteOrder(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.deleteOrder,
        params:params
      }
      toolBox.http.post(config)
        .then(function(response){
          deferred.resolve(response.data);
        },function(error){
          deferred.reject(error);
        });
      return deferred.promise;
    }
    
    /*
     * 2018-05-24 zhangyafei
     * 评价初始化
     * */
    function evaluateInit(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.evaluateInit,
        params:params
      }
      toolBox.http.post(config)
        .then(function(response){
          deferred.resolve(response.data);
        },function(error){
          deferred.reject(error);
        });
      return deferred.promise;
    }
    
    /*
     * 2018-05-24 zhangyafei
     * 评论
     * */
    function evaluate(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.evaluate,
        params:params
      }
      toolBox.http.post(config)
        .then(function(response){
          deferred.resolve(response.data);
        },function(error){
          deferred.reject(error);
        });
      return deferred.promise;
    }
    
    /*
     * 2018-05-25 zhangyafei
     * 追加评价初始化
     * */
    function  evaluateAgainInit(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.evaluateAgainInit,
        params:params
      }
      toolBox.http.post(config)
        .then(function(response){
          deferred.resolve(response.data);
        },function(error){
          deferred.reject(error);
        });
      return deferred.promise;
    }
    
    /*
     * 2018-05-25 zhangyafei
     * 追加评论
     * */
    function  evaluateAgain(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.evaluateAgain,
        params:params
      }
      toolBox.http.post(config)
        .then(function(response){
          deferred.resolve(response.data);
        },function(error){
          deferred.reject(error);
        });
      return deferred.promise;
    }
    
    /*
     * 2018-05-25 zhangyafei
     * 物流初始化
     * */
    function expressInit(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.expressInit,
        params:params
      }
      toolBox.http.post(config)
        .then(function(response){
          deferred.resolve(response.data);
        },function(error){
          deferred.reject(error);
        });
      return deferred.promise;
    }
    
    /*
     * 2018-05-25 zhangyafei
     * 物流信息
     * */
    function expressInfo(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.expressInfo,
        params:params
      }
      toolBox.http.post(config)
        .then(function(response){
          deferred.resolve(response.data);
        },function(error){
          deferred.reject(error);
        });
      return deferred.promise;
    }
   
  }
})(angular, jsonpath);

//
//  let url = combo_id == 0 ? 'api.php?s=order/orderCreate' : 'api.php?s=order/comboPackageOrderCreate';
//  url = order_tag == 'buy_now' && order_goods_type == 0 ? 'api.php?s=order/virtualOrderCreate' : url;
//  url = order_tag == 'groupbuy' ? 'api.php?s=order/groupBuyOrderCreate' : url;
//  url = order_tag == 'js_point_exchange' ? 'api.php?s=order/pointExchangeOrderCreate' : url;
//  url = order_tag == 'goods_presell' ? 'api.php?s=order/presellOrderCreate' : url;