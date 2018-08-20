/*
 * @Author: narlian
 * @Date:   2018-05-10 15:01:22
 * @Last Modified by:   narlian
 * @Last Modified time: 2018-08-19 21:54:30
 */

(function(ng, jp) {
  'use strict';
  ng.module('app.services')
    .factory('tabService', tabService);

  tabService.$inject = ['toolBox', 'systemConfig', '$q', '$ionicSlideBoxDelegate'];

  function tabService(toolBox, systemConfig, $q, $ionicSlideBoxDelegate) {
    var service = {
      getIndexData: getIndexData, //取得首页数据
      getGoodsCategoryList: getGoodsCategoryList, //取得商品分类列表
      cart: cart, //购物车
      cartAddplus: cartAddplus, //购物车加减
      cartDelete: cartDelete,//购物车-删除
    };
    return service;
    /**
     * 取得首页数据
     * @author lvwei
     * @date   2018-05-14T13:44:04+0800
     * @param  {[type]}                 params [description]
     * @return {[type]}                        [description]
     */
    function getIndexData(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.indexData,
        params: params
      }
      toolBox.http.post(config)
        .then(function(response) {
          deferred.resolve(response.data);
          $ionicSlideBoxDelegate.update();
        }, function(error) {
          deferred.reject(error);
        });
      return deferred.promise;
    }
    /**
     * 取得商品分类列表数据
     * @author lvwei
     * @date   2018-05-10T15:10:34+0800
     * @param  {[type]}                 params [description]
     * @return {[type]}                        [description]
     */
    function getGoodsCategoryList(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.goodsClass,
        params: params
      }
      toolBox.http.post(config)
        .then(function(response) {
          deferred.resolve(response.data);
        }, function(error) {
          deferred.reject(error);
        });
      return deferred.promise;
    }
    
    /*
     * 2018-05-15 zhangyafei
     * 购物车
     * */
    function cart(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.cart,
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
     * 购物车加减
     * */
    function cartAddplus(params) {
      toolBox.showLoading();
      var deferred = $q.defer();
      var config = {
        url: systemConfig.cartAddplus,
        params:params
      }
      toolBox.http.post(config)
        .then(function(response){
          deferred.resolve(response.data);
          toolBox.hideLoading();
        },function(error){
          deferred.reject(error);
          toolBox.hideLoading();
        });
      return deferred.promise;
    }
    
    /*
     * 2018-05-15 zhangyafei
     * 购物车-删除
     * */
    function cartDelete(params) {
      toolBox.showLoading();
      var deferred = $q.defer();
      var config = {
        url: systemConfig.cartDelete,
        params:params
      }
      toolBox.http.post(config)
        .then(function(response){
          deferred.resolve(response.data);
          toolBox.msgToast('删除成功');
          toolBox.hideLoading();
        },function(error){
          deferred.reject(error);
          toolBox.hideLoading();
        });
      return deferred.promise;
    }
    
  }
})(angular, jsonpath);