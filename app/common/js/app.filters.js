/**
 * Created by Shen7 on 0017 2017/04/15.
 */
/*替换所有满足条件文本
* param element: 被过滤数据
* param regexp: 匹配条件
* param replacement: 替换字符串*/
(function(ng, jp){
  'use strict';
  ng.module('app.filters')
    .filter('replaceAll', replaceAll);
  replaceAll.$inject = [];
  function replaceAll() {
    return function(element, regexp, replacement){
      if (regexp === '') return element;
      // 正则匹配
      regexp = new RegExp(regexp, 'gm');
      var data = element.replace(regexp, replacement || '');
      return data;
    };
  }
})(angular, jsonpath);

(function(ng, jp){
  'use strict';
  ng.module('app.filters')
    .filter('toTrusted', to_trusted);
  to_trusted.$inject = ['$sce'];
  function to_trusted($sce) {
    return function(text){
        return $sce.trustAsHtml(text);
    };
  }
})(angular, jsonpath);

(function(ng, jp){
  'use strict';
  ng.module('app.filters')
    .filter('trust2Html', trust2Html);
  trust2Html.$inject = ['$sce'];
  function trust2Html($sce) {
    return function(val) {  
        return $sce.trustAsHtml(val);   
    };
  }
})(angular, jsonpath);

/**
 * 13位int型时间的转换
 * @author lvwei
 * @date   2017-12-08T16:18:29+0800
 * @param  {[type]}                 ng [description]
 * @param  {[type]}                 jp [description]
 * @return {[type]}                    [description]
 */
(function(ng, jp){
  'use strict';
  ng.module('app.filters')
    .filter('longDateFormat', longDateFormat);
  longDateFormat.$inject = ['$filter'];
  function longDateFormat($filter) {
    return function(text){
        return $filter.trustAsHtml(text);
    };
  }
})(angular, jsonpath);
/**
 * 敏感字符串转星号
 * @author lvwei
 * @date   2017-12-08T16:35:34+0800
 * @param  {[type]}                 ng [description]
 * @param  {[type]}                 jp [description]
 * @return {[type]}                    [description]
 */
(function(ng, jp){
  'use strict';
  ng.module('app.filters')
    .filter('setStarString', setStarString);
  setStarString.$inject = ['$filter'];
  function setStarString($filter) {
    return function(content, frontNum, endNum, count){
      if (!content) return;
      if (!frontNum) frontNum = 0;
      if (!endNum) endNum = 0;
      if (!count) count = 3;
      if (frontNum >= content.length) {
        return content;
      }
      if (frontNum + endNum >= content.length) {
        return content;
      }
      // var starStr = "";
      // for (var i = 0; i < (content.length - frontNum - endNum); i++) {
      //   starStr = starStr + "*";
      // }
      var starStr = "";
      if (count > 0) {
        for (var i = 0; i < count; i++) {
          starStr = starStr + "*";
        }
      }
      return content.substring(0, frontNum) + starStr + content.substring(content.length - endNum, content.length);
    };
  }
})(angular, jsonpath);
/**
 * 字符串(英文智能)截取
 * @author lvwei
 * @date   2017-12-08T16:37:01+0800
 * @param  {[type]}                 ng [description]
 * @param  {[type]}                 jp [description]
 * @return {[type]}                    [description]
 */
(function(ng, jp){
  'use strict';
  ng.module('app.filters')
    .filter('cut', cutString);
  cutString.$inject = ['$filter'];
  function cutString($filter) {
    return function (value, wordwise, max, tail) {
      if (!value) return '';

      max = parseInt(max, 10);
      if (!max) return value;
      if (value.length <= max) return value;

      value = value.substr(0, max);
      if (wordwise) {
          var lastspace = value.lastIndexOf(' ');
          if (lastspace != -1) {
              value = value.substr(0, lastspace);
          }
      }
      return value + (tail || ' …');
    };
  }
})(angular, jsonpath);
/**
 * 过滤字符串中的空格
 * @author lvwei
 * @date   2017-12-08T19:18:57+0800
 * @param  {[type]}                 ng [description]
 * @param  {[type]}                 jp [description]
 * @return {[type]}                    [description]
 */
(function(ng, jp){
  'use strict';
  ng.module('app.filters')
    .filter('fiterspace', fiterspace);
  fiterspace.$inject = ['$filter'];
  function fiterspace($filter) {
    return function(value) {
      return value = value.split(" ").join("");
    };
  }
})(angular, jsonpath);

//public 的图片路径补全
(function(ng, jp){
  'use strict';
  ng.module('app.filters')
    .filter('imgFullPath', imgFullPath);
  imgFullPath.$inject = ['systemConfig'];
  function imgFullPath(systemConfig) {
    return function(src){
      if (src.indexOf('http://') < 0 && src.indexOf('https://')) {
        src = sprintf('%s/%s', systemConfig.host, src)
      }
      return src;
    };
  }
})(angular, jsonpath);

//js正则实现用户输入银行卡号的控制及格式化
function formatBankNo(BankNo){
    if (BankNo.value == "") return;
    var account = new String (BankNo.value);
    account = account.substring(0,22); /*帐号的总数, 包括空格在内 */
    if (account.match (".[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{7}") == null){
        /* 对照格式 */
        if (account.match (".[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{7}|" + ".[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{7}|" +
        ".[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{7}|" + ".[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{7}") == null){
            var accountNumeric = accountChar = "", i;
            for (i=0;i<account.length;i++){
                accountChar = account.substr (i,1);
                if (!isNaN (accountChar) && (accountChar != " ")) accountNumeric = accountNumeric + accountChar;
            }
            account = "";
            for (i=0;i<accountNumeric.length;i++){    /* 可将以下空格改为-,效果也不错 */
                if (i == 4) account = account + " "; /* 帐号第四位数后加空格 */
                if (i == 8) account = account + " "; /* 帐号第八位数后加空格 */
                if (i == 12) account = account + " ";/* 帐号第十二位后数后加空格 */
                account = account + accountNumeric.substr (i,1);
            }
        }
    }
    else
    {
        account = " " + account.substring (1,5) + " " + account.substring (6,10) + " " + account.substring (14,18) + "-" + account.substring(18,25);
    }
    if (account != BankNo.value) BankNo.value = account;
}