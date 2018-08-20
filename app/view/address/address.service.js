/*
* 2018.5.11 zhangyafei
*/

(function(ng, jp) {
  'use strict';
  ng.module('app.services')
    .factory('addService', addService);

  addService.$inject = ['toolBox', 'systemConfig', '$q', '$timeout'];
  function addService(toolBox, systemConfig, $q, $timeout) {
    var service = {
      addresslist: addresslist, //地址列表
      defAdd: defAdd,  //设为默认地址
      delAdd: delAdd,  //删除地址
      detailAdd: detailAdd,//地址详情
      getprovince: getprovince, //获取省份
      getcity: getcity, //获取市
      getarea: getarea, //获取区
      addAddress: addAddress, //新增地址
      updataAddress: updataAddress, //修改地址
    };
    return service;
    
    //地址列表
    function addresslist(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.addresslist,
        params:params
      }
      toolBox.http.post(config)
        .then(function(response){
          deferred.resolve(response);
        },function(error){
          toolBox.msgToast('出错了');
          deferred.reject(error);
        });
      return deferred.promise;
    }
    
    //设为默认地址
    function defAdd(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.defAdd,
        params:params
      }
      toolBox.showLoading();
      toolBox.http.post(config)
        .then(function(response){
          deferred.resolve(response);
        },function(error){
          toolBox.msgToast('出错了');
          deferred.reject(error);
        }).finally(function(){
          $timeout(function(){
            toolBox.hideLoading();
          },300)
        });
      return deferred.promise;
    }
    
    //删除地址
    function delAdd(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.delAdd,
        params:params
      }
      toolBox.showLoading();
      toolBox.http.post(config)
        .then(function(response){
          deferred.resolve(response);
        },function(error){
          toolBox.msgToast('出错了');
          deferred.reject(error);
        }).finally(function(){
          $timeout(function(){
            toolBox.hideLoading();
          },300)
        });
      return deferred.promise;
    }
    
    //地址详情
    function detailAdd(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.detailAdd,
        params:params
      }
      toolBox.http.post(config)
        .then(function(response){
          deferred.resolve(response);
        },function(error){
          toolBox.msgToast('出错了');
          deferred.reject(error);
        });
      return deferred.promise;
    }
    
    //获取省份
    function getprovince(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.getprovince,
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
    
    //获取市
    function getcity(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.getCity,
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
    
    //获取区
    function getarea(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.getDistrict,
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
    
    //新增地址
    function addAddress(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.addAddress,
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
    
    //修改地址
    function updataAddress(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.updataAddress,
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