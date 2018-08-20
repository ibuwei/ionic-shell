/*
 * 2018.5.9 zhangyafei
 * orderList
 * orderDetail
 * evaluate
 * evaluateAgain
 * express
 * */
(function(){
	'use strict';
	angular.module('app.controllers').controller('orderList', orderList);
	orderList.$inject = [ '$scope', '$stateParams', '$state', 'toolBox', 'orderService', '$timeout'];
  function orderList( $scope, $stateParams, $state, toolBox, orderService, $timeout){
  	//数据模型
  	var vm = this;
    vm.order = '';
    vm.tabId = $stateParams.status;
    vm.page = {
      ids: [],
      data:[], //存储数据
      currentPage: 1,
      pageSize:6,
      noDate:false,
      hasmore:true,
    };
    
    //事件 
    vm.refresh = refresh; //下拉刷新
    vm.loadMore = loadMore; //上拉加载
    vm.getData= getData; //获取数据
    vm.tabChange = tabChange; //切换tab
    vm.getdelivery = getdelivery; //确认收货
    vm.logistics = logistics; //查看物流
    vm.evaluate = evaluate; //我要评价
    vm.delOrder = delOrder; //删除订单
    
    
    // start
    $scope.$on('$ionicView.beforeEnter',function(){
      vm.loadMore();
    })
    
    //确认收货
    function getdelivery(id, myindex){
      var params = {
        order_id: id
      }
      toolBox.showLoading();
      orderService.getdelivery(params).then(function(res){
        toolBox.msgToast('操作成功');
        vm.page.data.splice(myindex, 1);
        if(vm.page.data.length == 0){
          vm.page.noDate = true;
        }        
      },function(error){
        toolBox.msgToast('出错了');
      }).finally(function() {
        toolBox.hideLoading();
      }) 
    }
    
    // 查看物流
    function logistics(){
      
    }
    
    //我要评价
    function evaluate(){
      
    }
    
    //删除订单
    function delOrder(id, myindex){
      var params = {
        order_id: id
      }
      toolBox.showLoading();
      orderService.deleteOrder(params).then(function(res){
        toolBox.msgToast('操作成功');
        vm.page.data.splice(myindex, 1);
        if(vm.page.data.length == 0){
          vm.page.noDate = true;
        }        
      },function(error){
        toolBox.msgToast('出错了');
      }).finally(function() {
        toolBox.hideLoading();
      }) 
    }
    
    
    //下拉刷新
    function refresh(){
      vm.page.ids = [];
      vm.page.data = [];
      vm.page.currentPage = 1;
      vm.getData();
    } 
    
    //上拉加载
    function loadMore(){
      $timeout(function(){  //延时器
        vm.getData();
      },300)
    }
    
    function getData(){
      var params = {
        page: vm.page.currentPage, //当前页数
        status:vm.tabId
      }
      orderService.orderList(params).then(function(res){
        handlePage(res.data); //处理分页事物   
      },function(error){
        toolBox.msgToast('出错了');
      }).finally(function() {
        $scope.$broadcast('scroll.refreshComplete');
      }) 
      
      function handlePage(data){   
        angular.forEach(data, function(item) {
          if(vm.page.ids.indexOf(item.order_id) < 0){
            vm.page.ids.push(item.order_id);
            vm.page.data.push(item);
          }
        })
    
        //检测是否有数据-自动化处理
        if(vm.page.currentPage ==1 && data.length == 0){
          vm.page.noDate = true;
          vm.page.hasmore=false;
        }else{
          vm.page.noDate = false;
          //检测是否最后一页
          if( data.length == 0 || data.length < vm.page.currentPage ){ 
            vm.page.hasmore = false;
          }else{
            $scope.$broadcast('scroll.infiniteScrollComplete');//这里是告诉ionic更新数据完成，可以再次触发更新事件
            vm.page.hasmore = true;
            vm.page.currentPage++;                          
          }
        }
      }
    }
    
    function tabChange(id){
      vm.tabId = id;
      vm.refresh();
    }
    
    
    
  }
})();

/*
 * orderDetail
 * */
(function(){
	'use strict';
	angular.module('app.controllers').controller('orderDetail', orderDetail);
	orderDetail.$inject = [ '$scope', '$stateParams', '$state', 'toolBox', 'orderService'];
  function orderDetail( $scope, $stateParams, $state, toolBox, orderService){
  	//数据模型
  	var vm = this;
    vm.order = '';
    
    //事件 
    vm.getData = getData; 
    
    vm.getData();
    function getData(){
      var params = {
        order_id:$stateParams.id
      }
      
      orderService.orderDetail(params).then(function(res){
        vm.order = res;
      })
    }
  }
})();

/*
 * 2018.5.24
 * zhangyafei
 * evaluate
 * */
(function(){
  'use strict';
  angular.module('app.controllers').controller('evaluate', evaluate);
  evaluate.$inject = [ '$scope', '$stateParams', '$state', 'toolBox', 'orderService','Upload', 'systemConfig'];
  function evaluate( $scope, $stateParams, $state, toolBox, orderService, Upload, systemConfig){
    //数据模型
    var vm = this;
    vm.egUpBtnH;  //计算拍照上传btn的高度
    vm.data = {
      init:'',  //初始化数据
      scores: 5, //评价星级
      explain_type: 1, //1好评 2中评 3差评
      is_anonymous: 0, //是否匿名
    }
    
    //事件 
    
    vm.selected = selected; //选择图片
    vm.upImg = upImg; //上传图片
    vm.delImg = delImg; //删除图片
    vm.next = next; //发表评论
    
    // start
    $scope.$on('$ionicView.beforeEnter', function(){
      //计算拍照上传btn的高度
      vm.egUpBtnH = screen.width*0.92*0.22 + 'px';
      
      var params = {
        orderId: $stateParams.id
      }
      orderService.evaluateInit(params).then(function(res){
        vm.data.init = res;
        angular.forEach(vm.data.init.list, function (item,index){
          item.imgs = [];
          item.content = '';
        })
      })
    })
    
    //选择图片
    function selected(file, item){
      if(file.length > 0){
        var file = file[0];
        //如果图片>2m,就压缩
        if(file.size > 2000000){
          var resizeOptions = {
            quality: 0.9,
            ratio: '1:2'
          };
          Upload.resize(file, resizeOptions).then(function(resizedFile) {
            file = resizedFile;
            vm.upImg(file, item);
          });
        }else{
          vm.upImg(file, item);
        }
      }
    }
    
    //上传图片
    function upImg(file, item) {
      var params = {
        file_upload: file,
        file_path: 'upload/comment/',
      };
      
      toolBox.showLoading();
      Upload.upload({
        url: systemConfig.url + systemConfig.uploadImg,
        data: params
      }).success(function(data) {
        toolBox.hideLoading();
        if(data.data.code == 0){
          toolBox.msgToast(data.data.message);
        }else{
          item.imgs.push(data.data.data);
        }
      }).error(function(res) {
        toolBox.hideLoading();
      }).progress(function(evt) {
        $scope.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total)) + '%';
        $scope.progress == '100%' ? $('.tost').hide() : $('.tost').show().html('上传进度：' + $scope.progress);
      });
    }
    
    //删除图片
    function delImg(item, index){
      item.imgs.splice(index, 1);
    };
    
    //发表评论
    function next(){
      var testResult = true;  //校验结果
      //设置评价等级
      vm.data.explain_type = parseInt(vm.data.scores) > 1 ? 2: 3;
      vm.data.explain_type = parseInt(vm.data.scores) > 3 ? 1: vm.data.explain_type;
      
      //组装每个商品的评价
      var goodsEvaluate = [];
      angular.forEach(vm.data.init.list, function(item, index){
        goodsEvaluate[index]={};
        goodsEvaluate[index].order_goods_id = item.order_goods_id;
        goodsEvaluate[index].imgs = item.imgs.join(',');
        goodsEvaluate[index].img_num = item.imgs.length;
        goodsEvaluate[index].content = item.content;
        goodsEvaluate[index].scores = vm.data.scores;
        goodsEvaluate[index].explain_type = vm.data.explain_type;
        goodsEvaluate[index].is_anonymous = vm.data.is_anonymous;
        
        if(item.content == '' || item.content == undefined){
          testResult = false;
          toolBox.msgToast('请输入要评价的内容');
        }
      })
      
      var params = {
        order_id: $stateParams.id,
        order_no: vm.data.init.order_no,
        goodsEvaluate: JSON.stringify(goodsEvaluate),
      }
      
      if(testResult){
        toolBox.showLoading();
        orderService.evaluate(params).then(function(res){
          toolBox.msgToast('评价成功');
          toolBox.goBack();
        },function(error){
          toolBox.msgToast('评价失败');
        }).finally(function(){
          toolBox.hideLoading();
        })
      }else{
        toolBox.msgToast('请输入要评价的内容')
      }
    };
  }
})();


/*
 * 2018.5.25
 * zhangyafei
 * evaluateAgain
 * */
(function(){
  'use strict';
  angular.module('app.controllers').controller('evaluateAgain', evaluateAgain);
  evaluateAgain.$inject = [ '$scope', '$stateParams', '$state', 'toolBox', 'orderService','Upload', 'systemConfig'];
  function evaluateAgain( $scope, $stateParams, $state, toolBox, orderService, Upload, systemConfig){
    //数据模型
    var vm = this;
    vm.egUpBtnH;  //计算拍照上传btn的高度
    vm.data = {
      init:'',  //初始化数据
    }
    
    //事件 
    vm.selected = selected; //选择图片
    vm.upImg = upImg; //上传图片
    vm.delImg = delImg; //删除图片
    vm.next = next; //发表评论
    
    // start
    $scope.$on('$ionicView.beforeEnter', function(){
      //计算拍照上传btn的高度
      vm.egUpBtnH = screen.width*0.92*0.22 + 'px';
      
      var params = {
        orderId: $stateParams.id
      }
      orderService.evaluateAgainInit(params).then(function(res){
        vm.data.init = res;
        angular.forEach(vm.data.init.list, function (item,index){
          item.imgs = [];
          item.content = '';
        })
      })
    })
    
    //选择图片
    function selected(file, item){
      if(file.length > 0){
        var file = file[0];
        //如果图片>2m,就压缩
        if(file.size > 2000000){
          var resizeOptions = {
            quality: 0.9,
            ratio: '1:2'
          };
          Upload.resize(file, resizeOptions).then(function(resizedFile) {
            file = resizedFile;
            vm.upImg(file, item);
          });
        }else{
          vm.upImg(file, item);
        }
      }
    }
    
    //上传图片
    function upImg(file, item) {
      var params = {
        file_upload: file,
        file_path: 'upload/comment/',
      };
      
      toolBox.showLoading();
      Upload.upload({
        url: systemConfig.url + systemConfig.uploadImg,
        data: params
      }).success(function(data) {
        toolBox.hideLoading();
        if(data.data.code == 0){
          toolBox.msgToast(data.data.message);
        }else{
          item.imgs.push(data.data.data);
        }
      }).error(function(res) {
        toolBox.hideLoading();
      }).progress(function(evt) {
        $scope.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total)) + '%';
        $scope.progress == '100%' ? $('.tost').hide() : $('.tost').show().html('上传进度：' + $scope.progress);
      });
    }
    
    //删除图片
    function delImg(item, index){
      item.imgs.splice(index, 1);
    };
    
    //发表评论
    function next(){
      var testResult = true;  //校验结果
      //组装每个商品的评价
      var goodsEvaluate = [];
      angular.forEach(vm.data.init.list, function(item, index){
        goodsEvaluate[index]={};
        goodsEvaluate[index].order_goods_id = item.order_goods_id;
        goodsEvaluate[index].imgs = item.imgs.join(',');
        goodsEvaluate[index].img_num = item.imgs.length;
        goodsEvaluate[index].content = item.content;
        
        if(item.content == '' || item.content == undefined){
          testResult = false;
          toolBox.msgToast('请输入要评价的内容');
          
        }
      })
      
      var params = {
        order_id: $stateParams.id,
        order_no: vm.data.init.order_no,
        goodsEvaluate: JSON.stringify(goodsEvaluate),
      }
      
      if(testResult){
        toolBox.showLoading();
        orderService.evaluateAgain(params).then(function(res){
          toolBox.msgToast('评价成功');
          toolBox.goBack();
        },function(error){
          toolBox.msgToast('评价失败');
        }).finally(function(){
          toolBox.hideLoading();
        })
      }else{
        toolBox.msgToast('请输入要评价的内容')
      }
    };
  }
})();

/*
 * 2018.5.25
 * zhangyafei
 * express
 * */
(function(){
  'use strict';
  angular.module('app.controllers').controller('express', express);
  express.$inject = [ '$scope', '$stateParams', '$state', 'toolBox', 'orderService'];
  function express( $scope, $stateParams, $state, toolBox, orderService){
    //数据模型
    var vm = this;
    vm.data = {
      expressInfo:'',
      expressList:[],
    }
    
    //事件
    vm.expressInit = expressInit; //物流初始化 orderId
    vm.expressInfo = expressInfo; //物流信息 express_id
    
    //start
    $scope.$on('$ionicView.beforeEnter', function (){
      vm.expressInit();
    });
    
    //物流初始化
    function expressInit(){
      var params={
        orderId: $stateParams.id
      }
      orderService.expressInit(params).then(function(res){
        vm.data.expressInfo = res.goods_packet_list[0]
        var eId = res.goods_packet_list[0].express_id;
        vm.expressInfo(eId);
      })
    }
    
    //物流信息
    function expressInfo(id){
      var params={
        express_id: id
      }
      orderService.expressInfo(params).then(function(res){
        vm.data.expressList = res;
      })
    }
    
  }
})();
