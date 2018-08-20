/**
 * Created by xy on 2017/2/22.
 */
(function(ng) {
  "use strict";
  ng.module('app.services')
    .factory('userService', userService);

  userService.$inject = ['$http', '$q', '$rootScope', 'Session', 'toolBox', 'systemConfig', 'globalLoginOption','requestHttpCode', '$base64'];
  function userService($http, $q, $rootScope, Session, toolBox, systemConfig, globalLoginOption, requestHttpCode, $base64) {
    var service = {
      login : loginAct,  //登陆
      logout : logout,  //退出
      getCode : getCode,  //请求验证码
      needSecVerify : needSecVerify, //二次验证码
      register : register,  //注册
      forget : forget ,//找回密码
      userExit : userExit, //用户存在否
      userinfo : userinfo, //用户信息
      getUserInfo : getUserInfo,  //用户信息
      getMenberIndex: getMenberIndex, //用户相关统计数据
      editUserInfo : editUserInfo,  //修改用户信息
      showValidMsg : showValidMsg,
      orderStatusCount : orderStatusCount,  //订单状态统计
      quickLogin : quickLogin,   //快捷登录
      codeAccessToken : codeAccessToken,
      getInviteCode: getInviteCode, //获取邀请码
      setFavoriteGoods: setFavoriteGoods, //商品收藏
      cancelFavorites: cancelFavorites, //取消收藏
      getMyCollection: getMyCollection, //我的收藏列表
      getAccountInfo: getAccountInfo, //取得账户信息
      getRecordsList: getRecordsList, //取得用户积分列表
      modifyPsd: modifyPsd, //修改密码
    };
    return service;

    /**
     * 登录事件
     * @author lvwei
     * @date   2017-12-19T21:16:33+0800
     * @param  {[type]}                 params [description]
     * @return {[type]}                        [description]
     */
    function loginAct(params) {
      var deferred = $q.defer();
      //对密码进行加密
      // if (params.password.length > 0) {
      //   params.password = $base64.encode(md5(params.password));
      // }
      var config = {
        url: systemConfig.login,
        params: params
      };
      toolBox.http.post(config).then(function(data) {
        deferred.resolve(data.data);
      }, function(error) {
        //如果返回登录 token, 则再次调用登录
        if ($rootScope.loginToken) {
          toolBox.msgToast("");
          config.params.__login_token__ = $rootScope.loginToken;
          toolBox.http.post(config).then(function(data) {
            deferred.resolve(data.data);
          }, function(error) {
            deferred.reject(error);
          });
        } else {
          deferred.reject(error);
        }
      });
      return deferred.promise;
    }

    /**
     * 快捷登录
     * @param param
     * @returns {Promise}
     */
    function quickLogin(params) {
      var deferred = $q.defer();
      var config = {
        method: 'POST',
        params : params,
        url: systemConfig.quickLogin
      };
      toolBox.http(config).then(function(result) {
        deferred.resolve(result);
      }, function(error) {
        deferred.reject(error);
      });

      return deferred.promise;
    }

    //通过code获取access_token
    function codeAccessToken(params){
      var deferred = $q.defer();
      var codeParam = {
        code : params.code,
        appid : globalLoginOption.APP_ID,
        secret : globalLoginOption.SECRET,
        grant_type:globalLoginOption.GRANT_TYPE
      };
      $http.post(systemConfig.loginUrl+systemConfig.codeAccessToken,{params:codeParam}).then(function(response){
        var result = response.data;
        var refresh_token = {
          refresh_token : result.data.refresh_token,
          expirationTime : result.data.expirationTime,
          nowTime : result.nowTime
        };
        Session.set('refreshToken', refresh_token);
        Session.set('authorizationToken', result.data.access_token);
        userinfo();
        deferred.resolve(result);
      },function(reject){
        deferred.reject(reject);
      });
      return deferred.promise;
    }
    /**
     * 退出登陆
     */
    function logout(params){
      var deferred = $q.defer();
      var config = {
        method: 'POST',
        params : params || {},
        url: systemConfig.logout
      };
      toolBox.http(config).then(function(result) {
        // 登出就是清除session
        Session.setToken("");
        Session.remove("refresh_token");
        Session.remove("userInfo");
        var data = {
          resultCode: 1000
        };
        deferred.resolve(result);
      }, function(error) {
        deferred.reject(error);
      });
      return deferred.promise;
    }

    /**
     * 请求验证码
     * @param params
     */
    function getCode(params){
      var config = {
        params: params,
        url: systemConfig.captcha
      };
      return toolBox.http.get(config).then(function(result) {
        return result;
      });
    }

    /**
     * 滑块验证码
     * @param params
     */
    function needSecVerify(params){
      var config = {
        params: params,
        url: systemConfig.secCaptcha
      };
      return toolBox.http.get(config).then(function(result) {
        return result;
      });
    }

    /**
     * 注册
     * @param params
     */
    function register(params){
      var config = {
        params: params,
        url: systemConfig.register
      };
      var deferred = $q.defer();
      toolBox.http.post(config).then(function(result) {
        var resultCode = result.resultCode;
        if(resultCode == requestHttpCode.RESULT_OK) {
          var loginParams = {
            account: params.account,
            password : params.password
          };
          service.login(loginParams).then(function(response){
            deferred.resolve(response);
          });
        }else {
          deferred.resolve(result);
        }
      },function(result){
        deferred.reject(result);
      });
      return deferred.promise;
    }

    /**
     * 找回密码
     * @param params
     */
    function forget(params){
      var config = {
        params: params,
        url: systemConfig.password
      };
      var deferred = $q.defer();
      toolBox.http.post(config).then(function(result) {
        var resultCode = result.resultCode;
        if(resultCode == requestHttpCode.RESULT_OK) {
          var loginParams = {
            account: params.account,
            password : params.password
          };
          login(loginParams).then(function(response){
            deferred.resolve(response);
          });
        }else {
          deferred.resolve(result);
        }
      },function(error){
        deferred.reject(error);
      });
      return deferred.promise;
    }

    /**
     * 用户存在否
     * @param params
     */
    function userExit(params){
      var config = {
        params: params,
        url: systemConfig.exists
      };
      var deferred = $q.defer();
      toolBox.http.get(config).then(function(result) {
        deferred.resolve(result);
      }, function(error){
        deferred.reject(error);
      });
      return deferred.promise;
    }

    /**
     * 用户信息
     * @param params
     */
    function userinfo(){
      var config = {
        url: systemConfig.userinfo
      };
      var deferred = $q.defer();
      toolBox.http.get(config).then(function(result) {
        var data = result.data;
        // 校验用户信息是否为空
        if(toolBox.isEmptyObject(data)) {
          deferred.resolve(result.data);
          return;
        }

        var userinfo = {
          addressId: data.addressId || 0,
          aiteId: data.aiteId || "",
          nickName: data.alias || "",
          birthday: data.birthday || "未知",
          ecSalt: data.ecSalt || '"',
          email: data.email || "",
          idNum: data.idNum || "",
          idType: data.idType || "",
          jobs: data.jobs || "",
          lastIp: data.lastIp || "",
          lastLogin: data.lastLogin || null,
          mobilePhone: data.mobilePhone || "",
          msn: data.msn || "",
          parentId: data.parentId || 0,
          // password: data.password || "",
          payPoints: data.payPoints || 0,
          avatar: data.photo || '/img/user-head.png',
          qq: data.qq || "",
          regTime: data.regTime || null,
          salt: data.salt || "",
          sex: data.sex || 0,
          gender: data.sex == 0 ? '保密' : (data.sex == 1 ? '男' : '女'),
          source: data.source || "",
          status: data.status || 0,
          totalPoints: data.totalPoints || 0,
          trueName: data.trueName || "",
          userId: data.userId || null,
          userName: data.userName || "",
          // phoneNumber: data.userName || "",
          level: data.userRank || 0
        };
        // 将更新的用户信息缓存到本地
        Session.set('userinfo', userinfo);
        deferred.resolve(userinfo);
      }, function(error){
        deferred.reject(error);
      });
      return deferred.promise;
    }

    //取得用户信息
    function getUserInfo(params) {
      var config = {
        method: 'POST',
        params : params || {},
        url: systemConfig.memberDetail
      };
      return getPromise(config);
    }

    /**
     * 订单状态
     * @returns {*}
     */
    function orderStatusCount(){
      var config = {
        url: systemConfig.orderStatusCount
      };
      var deferred = $q.defer();
      toolBox.http.get(config).then(function(result) {
        deferred.resolve(result.data);
      }, function(error){
        deferred.reject(error);
      });
      return deferred.promise;
    }

    /**
     * 修改用户信息
     * @param params
     */
    function editUserInfo(params){
      var config = {
        url: systemConfig.userinfoSave,
        method : 'POST',
        params : params
      };
      var deferred = $q.defer();
      toolBox.http(config).then(function(result) {
        deferred.resolve(result);
      }, function(error){
        deferred.reject(error);
      });
      return deferred.promise;
    }

    //输入框信息的验证
    function showValidMsg(type,params){
      var msg = true;
      if(type == "account") {
        if(!params) {
          msg = 'PHONE_NULL';
        }else {
          var pattern = /^(13[0-9]|15[012356789]|17[013678]|18[0-9]|14[57])+\d{8}$/;
          var isMatch = pattern.test(params);
          if(!isMatch) {
            msg = 'PHONE_ERROR';
          }
        }

      }
      else if(type == "password") {
        if(!params) {
          msg = 'PASSWD_NULL';
        }else {
          //var pattern = /^[0-9a-zA-Z~\\!@\\?\\#\\$%\^&\\*\\(\\)_\\+\\{\\}\\|\\:\\<\\>\\=;',.\\[\\]]?/;
          var pattern = /^.{6,16}$/;
          var isMatch = pattern.test(params);
          if(!isMatch) {
            msg = 'PASSWD_ERROR';
          }
        }
      }
      else if(type == "code") {
        if(!params){
          msg = 'CODE_NULL';
        }else {
          var pattern = /^\d{6}$/;
          var isMatch = pattern.test(params);
          if(!isMatch) {
            msg = 'CODE_ERROR';
          }
        }

      }else if(type == "idCard") {
        if(!params){
          msg = 'IDCARD_NULL';
        }else {
          var pattern = /(^\d{15}$)|(^\d{17}([0-9]|X|x)$)/;
          var isMatch = pattern.test(params);
          if(!isMatch) {
            msg = 'IDCARD_ERROR';
          }
        }
      }else if(type == "address") {
        var pattern = /^[\u4e00-\u9fa5a-zA-Z0-9_()/,\\.'#（），。“”\\-]?/;
        var isMatch = pattern.test(params);
        if(!isMatch) {
          msg = 'ADDRESS_ERROR';
        }
      }else if(type == "zipcode") {
        var pattern = /^[0-9]+\d{5}$/;
        var isMatch = pattern.test(params);
        if(!isMatch) {
          msg = 'ZIPCODE_ERROR';
        }
      }
      else if(type == "name") {
        if(!params){
          msg = 'USERNAME_NULL';
        }else {
          var pattern = /^[\u4e00-\u9fa5a-zA-Z.]?/;
          var isMatch = pattern.test(params);
          if(!isMatch) {
            msg = 'USERNAME_ERROR';
          }
        }

      }else if(type == "bankCard") {
        if(!params){
          msg = 'BANKCARD_NULL';
        }else {
          var pattern = /^\d{12,19}$/;
          var isMatch = pattern.test(params);
          if(!isMatch) {
            msg = 'BANKCARD_ERROR';
          }
        }

      }
      return msg;
    }
    //取得邀请码信息
    function getInviteCode(params) {
      var config = {
        url: systemConfig.getInvitationCode,
        method : 'POST',
        params : params,
        _api_path: systemConfig.loginApi
      };
      var deferred = $q.defer();
      toolBox.http.post(config).then(function(result) {
        deferred.resolve(result.data);
      }, function(error){
        deferred.reject(error);
      });
      return deferred.promise;
    }
    //通用http方法
    function getPromise(config) {
      var deferred = $q.defer();
      toolBox.http.post(config).then(function(result) {
        deferred.resolve(result.data);
      }, function(error) {
        deferred.reject(error);
      });

      return deferred.promise;
    }
    /**
     * 取得用户相关的统计数据
     * @author lvwei
     * @date   2018-05-11T16:04:31+0800
     * @param  {[type]}                 params [description]
     * @return {[type]}                        [description]
     */
    function getMenberIndex(params) {
      var config = {
        url: systemConfig.memberIndex,
        params : params || {},
      };
      var deferred = $q.defer();
      toolBox.http.post(config).then(function(response) {
        deferred.resolve(response.data);
      }, function(error){
        deferred.reject(error);
      });
      return deferred.promise;
    }
    /**
     * 设置商品收藏
     * @author lvwei
     * @date   2018-05-13T19:43:13+0800
     * @param  {[type]}                 params [description]
     */
    function setFavoriteGoods(params) {
      var config = {
        url: systemConfig.favoriteGoods,
        params: params
      };
      var deferred = $q.defer();
      toolBox.http.post(config).then(function(response) {
        deferred.resolve(response.data);
      }, function(error){
        deferred.reject(error);
      });
      return deferred.promise;
    }
    /**
     * 取消收藏
     * @author lvwei
     * @date   2018-05-13T20:14:40+0800
     * @param  {[type]}                 params [description]
     * @return {[type]}                        [description]
     */
    function cancelFavorites(params) {
      var config = {
        url: systemConfig.cancelFavorites,
        params: params,
      };
      var deferred = $q.defer();
      toolBox.http.post(config).then(function(response) {
        deferred.resolve(response.data);
      }, function(error){
        deferred.reject(error);
      });
      return deferred.promise;
    }
    /**
     * 我的商品收藏列表
     * @author lvwei
     * @date   2018-05-13T20:36:59+0800
     * @param  {[type]}                 params [description]
     * @return {[type]}                        [description]
     */
    function getMyCollection(params) {
      var config = {
        url: systemConfig.myCollection,
        params: params,
      };
      var deferred = $q.defer();
      toolBox.http.post(config).then(function(response) {
        deferred.resolve(response.data);
      }, function(error){
        deferred.reject(error);
      });
      return deferred.promise;
    }
    /**
     * 取得账户信息
     * @author lvwei
     * @date   2018-05-14T11:35:41+0800
     * @param  {[type]}                 params [description]
     * @return {[type]}                        [description]
     */
    function getAccountInfo(params) {
      var config = {
        url: systemConfig.accountInfo,
        params: params,
      };
      var deferred = $q.defer();
      toolBox.http.post(config).then(function(response) {
        deferred.resolve(response.data);
      }, function(error){
        deferred.reject(error);
      });
      return deferred.promise;
    }
    /**
     * 取得用户积分列表
     * @author lvwei
     * @date   2018-05-14T11:35:50+0800
     * @param  {[type]}                 params [description]
     * @return {[type]}                        [description]
     */
    function getRecordsList(params) {
      var config = {
        url: systemConfig.accountRecordsList,
        params: params,
      };
      var deferred = $q.defer();
      toolBox.http.post(config).then(function(response) {
        deferred.resolve(response.data);
      }, function(error){
        deferred.reject(error);
      });
      return deferred.promise;
    }
    
    /*
     * 2018.5.21
     * zhangyafei
     * */
    function modifyPsd(params){
      var config = {
        url: systemConfig.modifyPsd,
        params: params,
      };
      var deferred = $q.defer();
      toolBox.http.post(config).then(function(response) {
        deferred.resolve(response.data);
      }, function(error){
        deferred.reject(error);
      });
      return deferred.promise;
    }
    
  }
})(angular);
