/**
 * Created by AaronYuan on 5/4/15.
 */
var ncc;
(function(ncc) {
  var loadHelper = (function() {
    function loadHelper() {
      this.fileName = this.getFileName();
      this.allFiles = this.getFileNames();
    }
    loadHelper.prototype.load = function(url, callback) {
      var node = document.createElement("script");
      node[window.addEventListener ? "onload" : "onreadystatechange"] = function() {
        if(window.addEventListener || /loaded|complete/i.test(node.readyState)) {
          (!!callback) && callback();
          node.onreadystatechange = null;
        }
      };
      node.onerror = function() {
        console.log('loading ' + url + ', failed!!');
      };
      node.src = url;
      var head = document.getElementsByTagName("head")[0];
      //head.insertBefore(node,head.firstChild);
      head.appendChild(node);
    };
    loadHelper.prototype.loadMany = function(urls, callback) {
      var self = this;
      if(!urls || urls.length == 0) {
        return;
      }
      var loadManyCount = urls.length;
      var loaded = function() {
        loadManyCount--;
        if(loadManyCount <= 0) {
          callback && callback();
        }
      };
      for(var i = urls.length - 1; i >= 0; i--) {
        self.load(urls[i], loaded);
      }
    };
    loadHelper.prototype.loadJS = function() {
      // 不支持开发模式
      if(!!this.fileName) {
        this.load(this.fileName, null);
      }
    };
    loadHelper.prototype.loadAllJS = function() {
      this.loadMany(this.allFiles, null);
    };
    loadHelper.prototype.getFileName = function() {
      var dom = document.getElementById('asyncLoading');
      if(!dom) {
        return null;
      }
      return dom.getAttribute('data-asyncLoading');
    };
    loadHelper.prototype.getFileNames = function() {
      var dom = document.getElementsByClassName('asyncLoading');
      var urls = [];
      if(!dom || dom.length == 0) {
        return urls;
      }
      for(var i = 0; i < dom.length; i++) {
        if(dom[i].getAttribute('data-asyncLoading')) {
          urls.push(dom[i].getAttribute('data-asyncLoading'));
        }
      }
      return urls;
    };
    return loadHelper;
  }());
  ncc.loader = new loadHelper();
  ncc.loader.loadJS();
  ncc.loader.loadAllJS();
})(ncc || (ncc = {}));
//# sourceMappingURL=load.js.map