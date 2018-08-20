/*
 * zhangyafei 2018.5.18
 * newsList
 * newsDetail
 * mail
 * */
//newsList
(function(ng) {
	'use strict';
	angular.module('app.controllers')
		.controller('newsList', newsList);
	newsList.$inject = ['$scope', '$stateParams', 'toolBox', 'newsService', '$timeout'];

	function newsList($scope, $stateParams, toolBox, newsService, $timeout) {
	  //数据模型
	  var vm = this;
	  vm.newsClassData;
	  vm.tabSeltedId = '';
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
	  vm.newsClass = newsClass;  //获取分类
	  vm.tabClick = tabClick;  //tab点击事件
	  
    	  
	  //start
	  $scope.$on('$ionicView.beforeEnter', function(){
	    vm.newsClass();
	    vm.getData();
	  })
	  
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
    
    //文章列表newsList
    function getData(){
      var params = {
        class_id: vm.tabSeltedId,
        page: vm.page.currentPage
      };
      newsService.newsList(params).then(function(data){
        handlePage(data.data); //处理分页事物 
        
      },function(error) {
      }).finally(function() {
        $scope.$broadcast('scroll.refreshComplete');
      })
      
      function handlePage(data){   
        angular.forEach(data, function(item){
          if(vm.page.ids.indexOf(item.article_id) < 0){
            vm.page.ids.push(item.article_id);
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
	  
	  //获取分类
		function newsClass(){
		  var params = {};
		  newsService.newsClass(params).then(function(res){
		    vm.newsClassData = res.data;
		  })
		}		
    
		//tab点击事件
		function tabClick(id){
		  vm.tabSeltedId = id;
		  vm.refresh();
		}
		
	}
})(angular);


// newsDetail
(function(ng, jp) {
	'use strict';
	angular.module('app.controllers').controller('newsDetail', newsDetail);
	newsDetail.$inject = ['$scope', '$state', '$stateParams', 'newsService'];

	function newsDetail($scope, $state, $stateParams, newsService) {
		//数据模型
    var vm = this;
    vm.data ;
   
    //事件
    vm.getData = getData; 
    
    
    //start
    $scope.$on('$ionicView.beforeEnter', function() {
      vm.getData();
    });
    
    //
    function getData() {
      var params = {
        article_id: $stateParams.id
      }
      newsService.newsDetail(params).then(function(res){
        vm.data = res;
      })
    }
    
    
	}
})(angular, jsonpath);

// mail
(function(ng, jp) {
  'use strict';
  angular.module('app.controllers').controller('mail', mail);
  mail.$inject = ['$scope', '$state', '$stateParams', 'newsService'];

  function mail($scope, $state, $stateParams, newsService) {
    //数据模型
    var vm = this;
    vm.data ;
   
    //事件
    vm.getData = getData; 
    
    //start
    $scope.$on('$ionicView.beforeEnter', function() {
      vm.getData();
    });
    
    function getData() {
      var params = {
        id: 2
      }
      newsService.mailArticle(params).then(function(res){
        vm.data = res;
      })
    }
    
  }
})(angular, jsonpath);

