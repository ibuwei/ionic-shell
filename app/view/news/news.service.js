/*
* 2018.5.18 zhangyafei
* newsList
* newsDetail
* mail
*/

(function(ng, jp) {
  ng.module('app.services')
    .factory('newsService', newsService);

  newsService.$inject = ['toolBox', 'systemConfig', '$q'];
  function newsService(toolBox, systemConfig, $q) {
    var service = {
      newsClass: newsClass, //文章类型
      newsList: newsList, //文章列表
      newsDetail: newsDetail, //文章详情
      mailArticle: mailArticle, //物流承诺
    };
    return service;

    /*
    * 2018.5.18 zhangyafei
    * newsClass
    */
    function newsClass(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.newsClass,
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
    * 2018.5.18 zhangyafei
    * newsList
    */
    function newsList(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.newsList,
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
    * 2018.5.18 zhangyafei
    * newsDetail
    */
    function newsDetail(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.newsDetail,
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
    * 2018.6.22 zhangyafei
    * mailArticle
    */
    function mailArticle(params) {
      var deferred = $q.defer();
      var config = {
        url: systemConfig.mailArticle,
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