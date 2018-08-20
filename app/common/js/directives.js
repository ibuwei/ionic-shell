//var mod = angular.module('app.directive', []);
angular.module('app.directive').directive('tost', function() { //1s提示框
  return {
    restrict: 'AE',
    template: '<div class="tost"></div>'
  };
});

angular.module('app.directive').directive('loading', function() { //加载动画
  return {
    restrict: 'AE',
    template: '<div class="loadingWrap">' +
      '<div class="myLoading">' +
      '<div class="loadingContent">' +
      '<img src="common/img/loading.gif" alt="" />' +
      '<div class="txt">加载中...</div>' +
      '</div>' +
      '</div>' +
      '</div>'
  };
});
angular.module('app.directive').directive('nonet', function() { //无网图
  return {
    restrict: 'AE',
    template: '<div class="noNetwork">' +
      '<div class="noNetworkIn absolute">' +
      '<img class="noNetworkPic" src="common/img/noNet.jpg" alt="" />' +
      '<div class="noNetworkTxt">啊哦...服务器去月球了~~</div>' +
      '<button class="noNetReloadBtn" ng-click="reload()">刷新</button>' +
      '</div>' +
      '</div>'
  };
});

angular.module('app.directive').directive('idcode', function() { //验证码
  return {
    restrict: 'AE',
    template: '<div class="IDCodeWrap">' +
      "<div class='IDCode '>获取验证码</div>" +
      "<div class='IDCodeAct'>获取验证码</div>" +
      '</div>'
  };
});
//倒计时
(function(ng) {
  angular.module('app.directive').
    directive('timerbutton', timerbutton);
  timerbutton.$inject = ['$timeout', '$interval'];
  function timerbutton($timeout, $interval){
    return {
      restrict: 'AE',
      transclude: true,
      scope: {
        showTimer: '=',
        onClick: '&',
        timeout: '='
      },
      link: function(scope, element, attrs){
        scope.timer = true;
        scope.timerCount = scope.timeout;
        var counter = $interval(function(){
          scope.timerCount = scope.timerCount - 1000;
        }, 1000);
        //console.log('xxxx:', scope.onClick());
        
        $timeout(function(){
           scope.timer = false;
           $interval.cancel(counter);
           scope.showTimer = false;
        }, scope.timeout);
      },
      template: '<button ng-click="onClick()" ng-disabled="timer"><span ng-transclude></span>&nbsp<span ng-if="showTimer">({{ timerCount / 1000 }}s)</span></button>'
    };
  }
})(angular);
//PluginManager
var ionicshell;
! function(ionicshell) {
  "use strict";
  var PluginManager = function() {
    function PluginManager() {
      this.inCordovaRuntime = !!window.cordova;
    }
    return PluginManager.prototype.register = function(namespace, plugin) {
      var isRegister = this.inCordovaRuntime || this.createNS(namespace, plugin);
      if (!window.plugins) window.plugins = {};
    }, PluginManager.prototype.createNS = function(namespace, plugin) {
      var NSArray = namespace.split("."),
        NS = null;
      angular.forEach(NSArray, function(NSPart, index) {
        "window" == NSPart ? NS = window : NS.hasOwnProperty(NSPart) ? NS = NS[NSPart] : index == NSArray.length - 1 ? NS[NSPart] = plugin : NS = NS[NSPart] = {};
      });
    }, PluginManager;
  }();
  ionicshell.pluginManager = new PluginManager;
}(ionicshell || (ionicshell = {}));

//Toast
var ionicshell;
! function(ionicshell) {
  "use strict";
  var tipDom = null,
    msgDom = null,
    timeTag = null,
    timeValue = {
      ex_short: 1e3,
      my_short: 2e3,
      "short": 3e3,
      "long": 5e3
    },
    Toast = function() {
      function Toast() {}
      return Toast.prototype.show = function(message, duration, position) {
        return this._createDialog(message, position || "center"), "block" == tipDom.style.display ? (clearTimeout(timeTag), this._close(duration || "short"), null) : (tipDom.style.display = "block", void this._close(duration || "short"));
      }, Toast.prototype.showExShortTop = function(message) {
        this.show(message, "ex_short", "top");
      }, Toast.prototype.showExShortCenter = function(message) {
        this.show(message, "ex_short", "center");
      }, Toast.prototype.showExShortBottom = function(message) {
        this.show(message, "ex_short", "bottom");
      }, Toast.prototype.showShortTop = function(message) {
        this.show(message, "short", "top");
      }, Toast.prototype.showShortCenter = function(message) {
        this.show(message, "short", "center");
      }, Toast.prototype.showShortBottom = function(message) {
        this.show(message, "short", "bottom");
      }, Toast.prototype.showLongTop = function(message) {
        this.show(message, "long", "top");
      }, Toast.prototype.showLongCenter = function(message) {
        this.show(message, "long", "center");
      }, Toast.prototype.showLongBottom = function(message) {
        this.show(message, "long", "bottom");
      }, Toast.prototype._createDialog = function(message, position) {
        tipDom || (tipDom = document.createElement("div"),
            tipDom.classList.add("toastWrap"),
            tipDom.style.display = "none",
            msgDom = document.createElement("span"),
            tipDom.appendChild(msgDom),
            document.body.appendChild(tipDom)),
          msgDom.innerHTML = message;
        var p = this._initPostion(position);
        p.top > -1 && (tipDom.style.top = p.top + "px"), p.left > -1 && (tipDom.style.left = p.left + "px");
      }, Toast.prototype._close = function(duration) {
        timeTag = setTimeout(function() {
          tipDom.style.display = "none";
        }, timeValue[duration]);
      }, Toast.prototype._replace = function(data) {
        return "";
      }, Toast.prototype._initPostion = function(pos) {
        var height = window.innerHeight,
          point = {
            top: -1,
            left: -1
          };
        window.innerWidth;
        switch (pos) {
          case "top":
            point.top = 0;
            break;
          case "bottom":
            point.top = height - 50;
            break;
          case "center":
          default:
            point.top = height / 2 - 15;
        }
        return point;
      }, Toast;
    }();
  ionicshell.pluginManager.register("window.plugins.toast", new Toast);
  if (!window.plugins.hasOwnProperty('toast')) window.plugins.toast = new Toast;
}(ionicshell || (ionicshell = {}));