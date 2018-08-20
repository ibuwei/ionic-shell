/**
 * Created by lvwei on 2017/2/18.
 */
(function(ng, $, jp) {//商品 新增 和 编辑
  'use strict';
  ng.module('app.controllers')
    .controller('PromptBox', PromptBox);

  PromptBox.$inject = ['$scope', 'toolBox', 'msgService','$state', '$rootScope','Session', 'systemConfig', '$timeout', 'GlobalSysConfig'];
  function PromptBox($scope, toolBox, msgService,$state, $rootScope,Session, systemConfig, $timeout, GlobalSysConfig) {
    //confirm 需确认的弹窗响应事件
    $scope.$on('event:message-confirm', function(event, content, option) {
      /* option 示例
       var option = {
       title: "提示",
       btn: parseInt("0011",2),
       onOk: function(){
       console.log("点击确认啦");
       },
       onCancel: function() {}
       };
       */
      //content && window.wxc.xcConfirm(content, "custom", option);
    });
    //alert 不需确认的弹窗响应事件
    /*$scope.$on('event:message-alert', function(event, content, option) {
      /!*
       var option = {
       title: "提示",
       onOk: function(){
       console.log("点击确认啦");
       }
       };
       *!/
      //content && window.wxc.xcConfirm(content, window.wxc.xcConfirm.typeEnum.info, option); //只有确定按钮
    });*/
    //toast 信息提示响应事件
    $scope.$on('event:message-error-toast', function(event, code, replace, position, duration) {
      //消息提示的处理逻辑(方法)
      function _showMessage(code, replace, position, duration) {
        if (!code) return;
        var resultCode = '';
        var content = "";
        //通过code取得errorMsg中的提示信息, 如果没有对应的提示信息, 则直接取 code 的内容
        if (ng.isObject(code.data)&&toolBox.hasPrototype(code.data, 'code')) {
          resultCode = code.data.resultCode;
          //取得访问的 url 对应的接口 key
          var _url = toolBox.urlParse(code.config.url);
          var pathname = _url.pathname.replace(GlobalSysConfig.api, '');
          //先取得所有接口配置的列表
          var apiList = [];
          ng.forEach(systemConfig, function(apiPath) {
            apiList.push(apiPath);
          });
          //取得请求的路径对应接口配置的位置
          var pos = apiList.indexOf(pathname);
          var apiKey = '';
          if (pos>=0) {
            //根据位置取得对应接口的 key
            apiKey = Object.keys(systemConfig)[pos];
          } else {
            //如果没有取得接口位置, 这里将截掉最后一个'/'(restfull方式的请求), 然后再来查找一次接口对应的 key
            pathname = pathname.substr(0, pathname.lastIndexOf('/'));
            if (pathname) {
              pos = apiList.indexOf(pathname);
              if (pos>=0) apiKey = Object.keys(systemConfig)[pos];
            }
          }
          content = undefined;
          //var content = msgService.errorMsg(code.data.resultCode) || code.data.reason;
          if (code.data.resultCode == 999 && code.data.reason) {
            content = code.data.reason;
          } else {
            //取得错误信息的内容
            content = msgService.errorMsg(code.data.resultCode);
          }
          if (content===undefined&&code.data.resultCode!=1000) {
            if (code.data.reason) {
              content = code.data.reason;
            } else {
              //如果没有可提示的消息, 则使用默认错误提示
              content = msgService.errorMsg(500);
            }
          } else if (content==='') {
            //消息为空则不提示
            return false;
          } else {
            //检查调用的 接口名 是否有对应的业务提示信息配置, 有则做占位符替换
            if (apiKey && (msgService.handleFirm())[apiKey]) {
              content = sprintf(content, (msgService.handleFirm())[apiKey]);
            }
          }
        } else {
          resultCode = code;
          content = msgService.errorMsg(code) || code;
        }
        if (ng.isString(content) && content.length > 0) {
          if (content.trim().indexOf(':') == 0) {
            content = content.trim().replace(':', '').trim();
          }
        }
        //初始化提示类型
        var hintType = 0;
        //如果返回码是数值型, 检查返回码对应的提示类型
        if (ng.isNumber(resultCode)) {
          hintType = (msgService.msgHintType())[resultCode] || 0;
        }
        //如果replace 是个数组, 则使用 sprint 来 替换提示信息 中的%s
        if (replace instanceof Array) {
          replace.unshift(content);//将提示信息加入到数组的头部
          content = sprintf.apply(this, replace);//这里相当于执行 sprint(content, arg1, arg2...)
        }
        if (!position) position = 'center';
        if (!duration) {
          duration = 'ex_short';
          if (ng.isString(content) && content.length > 8) {
            duration = 'my_short';
          }
        }
        if (code&&hintType===0) {
          ng.isString(content) && window.plugins.toast.show(content, duration, position); //显示信息
        } else if (code) {
          //弹出提示框
          var options = {
            template: content
          };
          toolBox.popup('alert', options);
        }
      }
      //如果是业务端的 toast 提示, 则直接提示
      if ($rootScope._isBlockToastMessage==true) {
        _showMessage(code, replace, position, duration);
      }
      //延迟0.2秒做消息提示
      $timeout(function() {
        var flag = true;//初始化是否允许 提示信息
        //如果消息提示的显示标识为 true:则显示, false:则不显示
        if ($rootScope._isBlockToastMessage==true) {
          flag = false;//如果业务端已提示, 则这里不做提示
        } else if ($rootScope._isBlockPopupMessage==true) {
          flag = false;//如果业务端已提示, 则这里不做提示
        }
        var timeFlag = false;//初始化 指定时间内 是否允许提示信息
        var timestamp = new Date().getTime();//取得当前时间(毫秒级)
        //判断上一次提示记录的时间是否存在
        if (!$rootScope._lastShowMessageTime) {
          timeFlag = true;
        } else if ($rootScope._lastShowMessageTime && (timestamp-$rootScope._lastShowMessageTime)>300) {
          //当前时间减去上一次提示的时间为300毫秒, 则提示下一个错误(即300毫秒内只能跳出一次提示框)
          timeFlag = true;
        }
        if (flag && timeFlag) {//如果业务端没有提示 并且 时间上也允许提示, 则提示
          _showMessage(code, replace, position, duration);
          /* 提示完成后做时间记录, 用于防止一次性弹出多个提示信息 */
          $rootScope._lastShowMessageTime = new Date().getTime();
        }
        //恢复显示标识的状态
        $rootScope._isBlockToastMessage = false;
        $rootScope._isBlockPopupMessage = false;
      }, 200);

    });
    //强制用户登录的响应事件
    $scope.$on('event:auth-userLogin-Required', function(event, o) {
      //如果 全局标记 登录后退状态为 true, 则直接后退到上一页
      if ($rootScope._isLoginGoBack===true) {
        $rootScope._isLoginGoBack = false;
        $timeout(function() {
          if ($rootScope._isGoBack == false)
            $rootScope.xgoBack('-1');
        }, 300);
      }else if($rootScope.mkfrom == 'android') {
        window.androidInterface.loginPage();
        $rootScope.clickAble = true;
      }else if($rootScope.mkfrom == 'ios') {
        window.interface.iosInterface.loginPage();
        $rootScope.clickAble = true;
      }else {//false 则进入登录页
        Session.remove("authorizationToken");
        Session.remove("refreshToken");
        var stateList = ['tab.shopcar', 'tab.my'];
        if (stateList.indexOf($state.current.name)>=0) {
          window.location.replace('#/login');//IDverifyOther
        } else {
          $state.go('login',{}, {reload:true});
        }
        //window.location.replace('#/login');
        //$state.go('login',{reload:true});
      }
    });
    $scope.$on('event:auth-userLoginOut', function(event, o) {
      // 这里处理登出
      userService.logout().then(function(result){
        if(result.resultCode == 1000) {
          $state.go('login',{reload:true});
          Session.remove('authorizationToken');
          Session.remove('refreshToken');
          Session.remove('addressRegion');
          Session.remove('userinfo');
          Session.remove('bindToken');
          $rootScope._noNeedToSave = true;
        }
      });
    });
    //跳转身份认证
    $scope.$on('event:auth-userIdVerify', function(event, o) {
      //继续后退的标识
      if ($rootScope._isLoginGoBack===true) {
        $rootScope._isLoginGoBack = false;
        $timeout(function() {
          $rootScope.xgoBack();
        }, 200);
      } else {
        // 跳转身份认证
        $state.go('IDverify', {reload:true});
      }
    });
    //ionic 页面离开前的响应事件
    $scope.$on('$ionicView.beforeLeave', function(event, o) {
      console.log('#####:',event, o);
    });
  }
})(angular, jQuery, jsonpath);
