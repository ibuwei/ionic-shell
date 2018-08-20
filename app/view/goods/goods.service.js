/*
* @Author: narlian
* @Date:   2018-05-10 17:36:01
* @Last Modified by:   narlian
* @Last Modified time: 2018-05-14 15:09:38
*/

(function(ng, jp) {
  ng.module('app.services')
    .factory('goodsService', goodsService);

  goodsService.$inject = ['toolBox', 'systemConfig', '$q'];
  function goodsService(toolBox, systemConfig, $q) {
    var service = {
      getGoodsList: getGoodsList, //取得商品列表
      discountGoods: discountGoods, //限时折扣-商品列表
      discountCurrentTime: discountCurrentTime, //限时折扣-当前时间
      getGoodsDetail: getGoodsDetail, //取得商品详情
      getGoodsComments: getGoodsComments, //取得商品评价
      getGoodsEvaluateCount: getGoodsEvaluateCount, //取得商品评价类型数量
      goodsSearch: goodsSearch, //商品搜索
      addcart:addcart,  //添加购物车
    };
    return service;

    /**
     * 根据条件取得商品列表
     * @author lvwei
     * @date   2018-05-10T17:38:52+0800
     * @param  {[type]}                 params [description]
     * @return {[type]}                        [description]
     */
    function getGoodsList(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.goodsList,
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
    
    /**
     * 限时折扣-商品列表
     * @author zhangyafei
     * @date   2018-05-18 
     * @param  {[type]}                 params [description]
     * @return {[type]}                        [description]
     */
    function discountGoods(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.discountGoods,
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
    
    /**
     *  限时折扣-当前时间
     * @author zhangyafei
     * @date   2018-05-18 
     * @param  {[type]}                 params [description]
     * @return {[type]}                        [description]
     */
    function discountCurrentTime(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.discountCurrentTime,
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

    /**
     * 根据条件取得商品详情
     * @author lvwei
     * @date   2018-05-10T19:10:03+0800
     * @param  {[type]}                 params [description]
     * @return {[type]}                        [description]
     */
    function getGoodsDetail(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.goodsDetail,
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
    /**
     * 根据条件取得商品评价
     * @author lvwei
     * @date   2018-05-11T11:13:32+0800
     * @param  {[type]}                 params [description]
     * @return {[type]}                        [description]
     */
    function getGoodsComments(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.goodsComments,
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
    /**
     * 取得商品各评价类型数量
     * @author lvwei
     * @date   2018-05-11T11:40:16+0800
     * @param  {[type]}                 params [description]
     * @return {[type]}                        [description]
     */
    function getGoodsEvaluateCount(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.goodsEvaluateCount,
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
    /**
     * 商品搜索
     * @author lvwei
     * @date   2018-05-14T15:09:18+0800
     * @param  {[type]}                 params [description]
     * @return {[type]}                        [description]
     */
    function goodsSearch(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.goodsSearch,
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
     * 2018.5.14 zhangyafei
     * 添加购物车
     * */
    function addcart(params) {
      
      var deferred = $q.defer();
      var config = {
        url: systemConfig.addcart,
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