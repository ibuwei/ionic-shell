/*
 * 2018.5.10 zhangyafei 
 * login 
 * register
 * 
 * */
(function(ng){
	'use strict';
	angular.module('app.controllers')
    .controller('LoginCtrl', register);
	register.$inject = ['$rootScope', '$scope', '$stateParams', 'Session','toolBox', 'userService'];
  function register($rootScope, $scope, $stateParams, Session, toolBox, userService){
  	//数据模型
  	var vm = this;
  	vm.params = { //注册时的参数
  		user:'',
  		pwd:'',
  		confirmPwd:''
  	}
  	
  	//事件
  	vm.register = register;	//注册
    vm.login = loginAct; //登录
    $scope.xgoBack = $scope.iosSwipe = goBack;
    function goBack() {
      $rootScope._isLoginGoBack = true;
      toolBox.goBack();
    }
  	
  	/**
     * 注册
     * @author lvwei
     * @date   2018-05-11T14:35:43+0800
     * @return {[type]}                 [description]
     */
  	function register() {
  		//检查用户名
      var msg = userService.showValidMsg('name', vm.params.user);
      if (msg !== true) {
        toolBox.msgToast(msg);
        return;
      }
      //检查用户密码
      msg = userService.showValidMsg('password', vm.params.pwd);
      if (msg !== true) {
        toolBox.msgToast(msg);
        return;
      }
      //检查密码与密码确认是否一致
      if (vm.params.pwd !== vm.params.confirmPwd) {
        toolBox.msgToast("两次输入的密码不一致");
        return;
      }
      //注册处理
      var params = {
        username: vm.params.user,
        password: vm.params.pwd,
      };
      toolBox.showLoading();
      userService.register(params).then(function(result) {
        toolBox.msgToast("注册成功");
        Session.setToken(result.token);
        Session.set('userInfo', result.member_info);
        //成功后跳转我的页面
        var state = {
          name: 'tab.my',
          params: {},
        };
        toolBox.direction.back(state);
        //注册成功后调用登录
        // vm.login();
      }).finally(function() {
        toolBox.hideLoading();
      });
  	}
    /**
     * 登录
     * @author lvwei
     * @date   2018-05-11T14:59:11+0800
     * @return {[type]}                 [description]
     */
    function loginAct() {
      //检查用户名
      var msg = userService.showValidMsg('name', vm.params.user);
      if (msg !== true) {
        toolBox.msgToast(msg);
        return;
      }
      //检查用户密码
      msg = userService.showValidMsg('password', vm.params.pwd);
      if (msg !== true) {
        toolBox.msgToast(msg);
        return;
      }
      //登录处理
      var params = {
        username: vm.params.user,
        password: vm.params.pwd,
      };
      toolBox.showLoading();
      userService.login(params).then(function(result) {
        toolBox.msgToast("登录成功");
        Session.setToken(result.token);
        Session.set('userInfo', result.member_info);
        //成功后跳转
        var state = {
          name: 'tab.my',
          params: {},
        };
        toolBox.direction.back(state);
      }).finally(function() {
        toolBox.hideLoading();
      });
    }
  }
})(angular);

