/*
 * zhangyafei 2018.4.26
 * goodsList
 * discount
 * goodsDetail
 * searchResult
 * */
//goodsList
(function(ng) {
  'use strict';
  angular.module('app.controllers')
    .controller('goodsList', goodsList);
  goodsList.$inject = ['$scope', '$stateParams', 'toolBox', 'goodsService', '$timeout'];

  function goodsList($scope, $stateParams, toolBox, goodsService, $timeout) {
    //数据模型
    var vm = this;
    vm.params = {
      cid: $stateParams.cid, //分类 
      obyzd: '',
      st: '',
      brand_id: '',
      mipe: '',
      mape: '',
      priceStr: '',
    };

    //统一的分页配置
    vm.page = {
      ids: [], //记录id,防止数据重复
      data: [], //存储数据
      currentPage: 1,
      pageSize: 14,
      noDate: false,
      hasmore: true,
    };
    vm.data = {
      idList: [],
      results: [],
    };
    vm.sortListHeight = ''; //获取筛选规格属性的高度
    vm.showGlTabPop = false;
    vm.showSortWrap = false; //显示筛选模态框
    vm.glTabPopId = 1;
    vm.obyzdList = [{
      id: 'ng.sales',
      name: '销售量'
    }, {
      id: 'ng.is_new',
      name: '新品'
    }, {
      id: 'ng.promotion_price',
      name: '价格'
    }, ];

    //事件
    vm.init = init; //初始化
    vm.showGlTabPopFn = showGlTabPopFn; //显示showGlTabPop 模态框
    vm.closeGlTabPopFn = closeGlTabPopFn; //关闭showGlTabPop 模态框
    vm.showSortWrapFn = showSortWrapFn; //显示筛选模态框
    vm.closeSortWrapFn = closeSortWrapFn; //关闭筛选模态框
    vm.sortFn = sortFn; //排序点击事件
    vm.restting = restting; //筛选pop-重置按钮
    vm.sortConfirm = sortConfirm; //筛选pop确认按钮
    vm.loadMore = loadMore; //上拉加载
    vm.doRefresh = doRefresh; //刷新
    vm.getData = getData; //取得商品列表
    vm.brandClick = brandClick; //品牌选择事件
    vm.priceClick = priceClick; //价格选择事件

    //价格选择事件
    function priceClick(item) {
      vm.params.mipe = item[0];
      vm.params.mape = item[1];
      vm.params.priceStr = item.price_str;
    }

    //进入页面时渲染执行的事件
    $scope.$on("$ionicView.beforeEnter", init);
    //初始化
    function init() {
      //取得当前的分类 id
      vm.params.cid = $stateParams.cid;
      var screenH = screen.height;
      vm.sortListHeight = screenH - 41 - 40;
      // 下拉加载|上拉刷新 配置信息
      $scope.loadOptions = {
        isScrollLoad: false, // 是否滚动加载|刷新
        hasmore: true,
        currentPage: 1,
        limitNum: 3
      };
//    vm.getData();
    }

    //下拉刷新
    function doRefresh() {
      vm.page.ids = [];
      vm.page.data = [];
      vm.page.currentPage = 1;
      vm.getData();
    }

    //上拉加载
    function loadMore() {
      console.log('上拉加载');      
      $timeout(function() { //延时器
        vm.getData();
      }, 300)
    }

    //获取数据
    function getData() {
      var params = {
        page: vm.page.currentPage,
        page_size: vm.page.pageSize,
        category_id: vm.params.cid,
        obyzd: vm.params.obyzd,
        st: vm.params.st,
        brand_id: vm.params.brand_id,
        mipe: vm.params.mipe,
        mape: vm.params.mape,
      };

      goodsService.getGoodsList(params).then(function(result) {
        vm.params.brands = result.category_brands;
        vm.params.prices = result.category_price_grades;
        vm.params.categoryList = result.goodsCategoryList;

        //处理分页事物        
        handlePage(result.goods_list);
      }, function(error) {}).finally(function() {
        $scope.$broadcast('scroll.refreshComplete');
      });

      // S 处理分页事物    
      function handlePage(data) {
        //分页数据不重复累加
        angular.forEach(data, function(item) {
          if (vm.page.ids.indexOf(item.goods_id) < 0) {
            vm.page.ids.push(item.goods_id);
            vm.page.data.push(item);
          }
        })

        //检测是否有数据-自动化处理
        if (vm.page.currentPage == 1 && data.length == 0) {
          vm.page.noDate = true;
          vm.page.hasmore = false;
        } else {
          vm.page.noDate = false;
          //检测是否最后一页
          if (data.length == 0 || data.length < vm.page.currentPage) {
            vm.page.hasmore = false;
          } else {
            $scope.$broadcast('scroll.infiniteScrollComplete');
            vm.page.hasmore = true;
            vm.page.currentPage++;
          }
        }
      };
      // E 处理分页事物   


    }

    //显示showGlTabPop 模态框
    function showGlTabPopFn(id) {
      vm.glTabPopId = id;
      vm.showGlTabPop = true;
      vm.showSortWrap = false;
    }

    //关闭showGlTabPop 模态框
    function closeGlTabPopFn(cid) {
      vm.showGlTabPop = false;
      if (cid && vm.params.cid != cid) {
        vm.params.cid = cid;
        vm.params.obyzd = '';
        vm.params.st = '';
        vm.params.brand_id = '';
        vm.params.priceStr = '';
        vm.params.mipe = '';
        vm.params.mape = '';
        vm.doRefresh();
      }
    }

    //显示筛选模态框
    function showSortWrapFn(id) {
      vm.showSortWrap = true;
      vm.showGlTabPop = false;
    }

    //关闭筛选模态框
    function closeSortWrapFn(cid) {
      vm.showSortWrap = false;
      if (cid && vm.params.cid != cid) {
        vm.params.cid = cid;
        vm.params.obyzd = '';
        vm.params.st = '';
        vm.params.brand_id = '';
        vm.params.mipe = '';
        vm.params.mape = '';
        vm.getGoodsList();
      }
    }

    //排序点击事件
    function sortFn(sortId) {
      vm.showGlTabPop = false;
      vm.params.obyzd = sortId;
      vm.doRefresh();
    }

    //筛选pop-重置按钮
    function restting() {
      vm.params.brand_id = '';
      vm.params.priceStr = '';
      vm.params.mipe = '';
      vm.params.mape = '';
    }

    //筛选pop确认按钮
    function sortConfirm() {
      vm.showSortWrap = false;
      vm.doRefresh();
    }

    //品牌
    function brandClick(id) {
      vm.params.brand_id = id;
    }
  }
})(angular);

//discount
(function(ng) {
  'use strict';
  angular.module('app.controllers')
    .controller('discount', discount);
  discount.$inject = ['$scope', '$stateParams', 'toolBox', 'goodsService', '$timeout', '$interval'];

  function discount($scope, $stateParams, toolBox, goodsService, $timeout, $interval) {
    //数据模型
    var vm = this;

    //统一的分页配置
    vm.page = {
      ids: [],
      data: [], //存储数据
      currentPage: 1,
      pageSize: 14,
      noDate: false,
      hasmore: true,
    };
    vm.myinterval; //计时器

    //事件
    vm.init = init; //初始化
    vm.loadMore = loadMore; //上拉加载
    vm.doRefresh = doRefresh; //下拉刷新
    vm.getData = getData; //取得商品列表
    vm.timer = timer; //倒计时

    //进入页面时渲染执行的事件
    $scope.$on("$ionicView.beforeEnter", init);
    //初始化
    function init() {
      //取得当前的分类 id
      var screenH = screen.height;
      vm.sortListHeight = screenH - 41 - 40;
      // 下拉加载|上拉刷新 配置信息
      $scope.loadOptions = {
        isScrollLoad: true, // 是否滚动加载|刷新
        hasmore: true,
        currentPage: 1,
        limitNum: 3
      };
      vm.timer();
      
    }

    //下拉刷新
    function doRefresh() {
      //初始化数据
      vm.page.ids = [];
      vm.page.data = [];
      vm.page.currentPage = 1;
      vm.getData();
    }

    //上拉加载
    function loadMore() {
      console.log('上拉加载');
      $timeout(function() { //延时器
        vm.getData();
      }, 300)
    }

    //获取数据
    function getData() {
      var params = {
        page: vm.page.currentPage,
        page_size: vm.page.pageSize,
        category_id: 0,
      };

      goodsService.discountGoods(params).then(function(result) {
        $interval.cancel(vm.myinterval); //先结束上一个计时器
        vm.timer();

        //处理分页事物
        handlePage(result.data)
      }, function(error) {}).finally(function() {
        $scope.$broadcast('scroll.refreshComplete');
      });

      // S 处理分页事物    
      function handlePage(data) {
        //分页数据不重复累加
        angular.forEach(data, function(item) {
          if (vm.page.ids.indexOf(item.goods_id) < 0) {
            vm.page.ids.push(item.goods_id);
            vm.page.data.push(item);
          }
        })

        //检测是否有数据-自动化处理
        if (vm.page.currentPage == 1 && data.length == 0) {
          vm.page.noDate = true;
          vm.page.hasmore = false;
        } else {
          vm.page.noDate = false;
          //检测是否最后一页
          if (data.length == 0 || data.length < vm.page.currentPage) {
            vm.page.hasmore = false;
          } else {
            $scope.$broadcast('scroll.infiniteScrollComplete');
            vm.page.hasmore = true;
            vm.page.currentPage++;
          }
        }
      };
      // E 处理分页事物
    }

    //倒计时
    function timer() {
      var currentTime;
      var params = {};
      goodsService.discountCurrentTime(params).then(function(res) {
        currentTime = res.current_time;
        vm.myinterval = $interval(function() {
          currentTime = currentTime + 1000;
          angular.forEach(vm.page.data, function(item) {
            var newT = item.end_time - currentTime / 1000;
            newT > 0 ? item.timer = toolBox.countDown(newT) : item.timer = '活动已结束';
          });
        }, 1000)
      })
    }

    //离开页面时销毁倒计时
    $scope.$on('$ionicView.afterLeave', function() {
      $interval.cancel(vm.myinterval);
    })


  }

})(angular);

// goodsDetail
(function(ng, jp) {
  'use strict';
  angular.module('app.controllers').controller('goodsDetail', goodsDetail);
  goodsDetail.$inject = ['$scope', '$rootScope', '$state', '$stateParams', 'systemConfig', 'toolBox', 'goodsService', 'userService', '$timeout', '$ionicSlideBoxDelegate', '$interval'];

  function goodsDetail($scope,$rootScope, $state, $stateParams, systemConfig, toolBox, goodsService, userService, $timeout, $ionicSlideBoxDelegate, $interval) {
    //数据模型
    var vm = this;
    vm.collect = 'N'; //是否收藏
    vm.gdTabId = 1; //商品详情，商品属性，商品评价
    vm.evalueId = 1; //商品评价类型
    vm.showShopPop = false; //显示加入购物车，购买的模态框
    vm.shopPopBtnTxt = '' //购物车，购买的模态框按钮的文案
    vm.params = {
      id: $stateParams.id,
      quantity: 1,
      comments: {
        type: 0,
        page: 1
      }
    };
    vm.data = {
      detail: {},
      comments: [],
      evaluate: {},
      sku: '', //
    };
    vm.selectSku = selectSku; //规格参数点击事件
    vm.conuntDown = ''; //倒计时
    vm.myinterval; //计时器

    //事件
    vm.collectFn = collectFn; //收藏商品
    vm.showShopPopFn = showShopPopFn; //显示加入购物车，购买的模态框
    vm.closeShopPop = closeShopPop; //关闭加入购物车，购买的模态框
    vm.nextFn = nextFn; //下一步
    vm.getGoodsDetail = getGoodsDetail; //取得订单详情
    vm.getGoodsComments = getGoodsComments; //取得商品评价
    vm.getGoodsEvaluateCount = getGoodsEvaluateCount; //取得评价数量
    vm.switchCommentType = switchCommentType; //切换评价类型
    vm.goodsAdd = goodsAdd; //加减器
    vm.setFavoriteGoods = setFavoriteGoods; //商品收藏
    vm.timer = timer; //倒计时

    //倒计时
    function timer(endTime, currentTime) {
      vm.myinterval = $interval(function() {
        currentTime = currentTime + 1000;
        var newT = endTime - currentTime / 1000;
        newT > 0 ? vm.conuntDown = toolBox.countDown(newT) : vm.conuntDown = '活动已结束';
      }, 1000)
    }

    //进入页面时渲染执行的事件
    $scope.$on("$ionicView.beforeEnter", init);
    //初始化
    function init() {
      //取得当前的分类 id
      vm.params.id = $stateParams.id;
      if (!vm.params.id) {
        toolBox.msgToast('商品编号不存在, 请返回重新操作');
        toolBox.goBack();
      } else {
        var screenH = screen.height;
        vm.sortListHeight = screenH - 44 - 40 - 40;
        vm.getGoodsDetail();
      }
    }

    //收藏商品
    function collectFn() {
      var params = {
        fav_id: vm.data.detail.goods_id,
        fav_type: 'goods',
        log_msg: vm.data.detail.goods_name,
      };
      toolBox.showLoading();
      if (vm.collect == 'Y') {
        userService.cancelFavorites(params).then(function(result) {
          vm.collect == 'Y' ? vm.collect = 'N' : vm.collect = "Y";
        }).finally(function() {
          toolBox.hideLoading();
        });
      } else {
        userService.setFavoriteGoods(params).then(function(result) {
          vm.collect == 'Y' ? vm.collect = 'N' : vm.collect = "Y";
        }).finally(function() {
          toolBox.hideLoading();
        });
      }
    }

    //显示加入购物车，购买的模态框
    function showShopPopFn(id) {
      id == 1 ? vm.shopPopBtnTxt = '加入购物车' : vm.shopPopBtnTxt = "下一步";
      vm.showShopPop = true;
    }

    //关闭加入购物车，购买的模态框
    function closeShopPop() {
      vm.showShopPop = false;
    }

    //规格参数点击事件
    function selectSku(info) {
      var specList = vm.data.detail.spec_list;
      angular.forEach(specList, function(item) {
        if (item.spec_id == info.spec_id) {
          angular.forEach(item.value, function(item) {
            item.active = 'N';
            item.spec_value_id == info.spec_value_id ? item.active = 'Y' : '';
          })
        }
      })

      //筛选选中的sku
      var specs = [];
      angular.forEach(vm.data.detail.spec_list, function(item) {
        angular.forEach(item.value, function(item) {
          if (item.active == 'Y') {
            var a = item.spec_id + ':' + item.spec_value_id;
            specs.push(a);
          }
        })
      })
      specs = toolBox.sortarr(specs).join(';');
      //设置默认的sku
      ng.forEach(vm.data.detail.sku_list, function(item) {
        if (specs == item.attr_value_items) {
          vm.sku = item;
        }
      });
    }

    //下一步
    function nextFn() {
      vm.showShopPop = false;
      if (vm.shopPopBtnTxt == '加入购物车') {
        var cart_detail = {
          shop_id: 0,
          shop_name: '',
          trueId: vm.data.detail.goods_id,
          goods_name: vm.data.detail.goods_name,
          count: vm.params.quantity,
          select_skuid: vm.sku.sku_id,
          select_skuName: vm.sku.sku_name,
          price: vm.sku.member_price,
          cost_price: vm.sku.cost_price,
          picture: vm.data.detail.picture
        }
        var params = {
          cart_detail: JSON.stringify(cart_detail)
        };

        toolBox.showLoading();
        goodsService.addcart(params).then(function(result) {
          toolBox.msgToast(result.message);
        }, function(error) {
          toolBox.msgToast('添加购物车失败');
        }).finally(function() {
          toolBox.hideLoading();
        });
      } else {
        var tag = 1;
        var sku_list = vm.sku.sku_id + ':' + vm.params.quantity;
        var goods_type = vm.data.detail.goods_type;
        //判断是否是积分兑换商品
        vm.data.detail.point_exchange_type == 1 ? tag = 5 : tag = 1;
        $state.go('submitOrder', {
          tag: tag,
          sku: sku_list,
          goods_type: goods_type
        })

      }
    }

    /**
     * 取得商品详情
     * @author lvwei
     * @date   2018-05-11T09:54:41+0800
     * @return {[type]}                 [description]
     */
    function getGoodsDetail() {
      var params = {
        id: vm.params.id,
      };
      toolBox.showLoading();
      goodsService.getGoodsDetail(params).then(function(result) {
        $ionicSlideBoxDelegate.update();
        vm.data.detail = result;
        $timeout(function() {
          if (vm.data.detail.is_member_fav_goods === 1) {
            vm.collect = 'Y';
          } else {
            vm.collect = 'N';
          }
        });
        vm.getGoodsEvaluateCount();
        vm.getGoodsComments();

        //设置默认规格参数
        var specs = [];
        var list = jp.query(result, '$..value[:1]');
        ng.forEach(list, function(item) {
          item.active = 'Y';
          var a = item.spec_id + ':' + item.spec_value_id;
          specs.push(a);
        });
        specs = toolBox.sortarr(specs).join(';');

        //设置默认的sku
        ng.forEach(result.sku_list, function(item) {
          if (specs == item.attr_value_items) {
            vm.sku = item;
          }
        });

        //检测是否是限时折扣商品
        if (vm.data.detail.promotion_type == 2 && vm.data.detail.promotion_detail != '') {
          $interval.cancel(vm.myinterval);
          vm.timer(vm.data.detail.promotion_detail.end_time, vm.data.detail.current_time);
        }

      }).finally(function() {
        toolBox.hideLoading();
      });
    }
    /**
     * 取得商品评价
     * @author lvwei
     * @date   2018-05-11T11:19:22+0800
     * @return {[type]}                 [description]
     */
    function getGoodsComments() {
      var params = {
        goods_id: vm.params.id,
        comments_type: vm.params.comments.type,
        page: vm.params.comments.page
      };
      goodsService.getGoodsComments(params).then(function(result) {
        vm.data.comments = result;
      });
    }
    /**
     * 取得商品各评价类型数量
     * @author lvwei
     * @date   2018-05-11T11:41:49+0800
     * @return {[type]}                 [description]
     */
    function getGoodsEvaluateCount() {
      var params = {
        goods_id: vm.params.id,
      };
      goodsService.getGoodsEvaluateCount(params).then(function(result) {
        vm.data.evaluate = result;
      });
    }
    /**
     * 切换商品评价类型
     * @author lvwei
     * @date   2018-05-11T12:14:58+0800
     * @return {[type]}                 [description]
     */
    function switchCommentType(type) {
      vm.evalueId = type;
      vm.params.comments.type = type - 1;
      vm.params.comments.page = 1;
      vm.getGoodsComments();
    }
    /**
     * 加减商品数据
     * @author lvwei
     * @date   2018-05-11T13:52:10+0800
     * @param  {[type]}                 int [description]
     * @return {[type]}                     [description]
     */
    function goodsAdd(int) {
      if (angular.isNumber(int)) {
        vm.params.quantity += int;
      }
    }
    //监听购买数量model: vm.params.quantity 
    $scope.$watch('vm.params.quantity', function(newValue, oldValue) {
      if (!toolBox.hasPrototype(vm, "sku")) {
        return;
      }
      //如果数量大于库存则等于库存
      if (vm.params.quantity > vm.sku.stock) {
        vm.params.quantity = vm.sku.stock;
      }
      //如果数量小于0, 则为1
      if (vm.params.quantity <= 0) {
        vm.params.quantity = 1;
      }
    });

    /**
     * 商品收藏
     * @author lvwei
     * @date   2018-05-13T22:49:53+0800
     */
    function setFavoriteGoods() {
      var params = {
        fav_id: vm.data.detail.goods_id,
        fav_type: 'goods',
        log_msg: vm.data.detail.goods_name,
      };
      toolBox.showLoading();
      vm.setFavoriteGoods(params).then(function(result) {
        toolBox.msgToast('收藏成功');
      }).finally(function() {
        toolBox.hideLoading();
      });
    }

    //离开页面时销毁倒计时
    $scope.$on('$ionicView.afterLeave', function() {
      $interval.cancel(vm.myinterval);
    })

  }
})(angular, jsonpath);

//searchResult
(function(ng, jp) {
  ng.module('app.controllers').controller('SearchResult', searchResult);
  searchResult.$inject = ['$rootScope', '$scope', '$stateParams', '$state', 'systemConfig', 'commonFn', 'toolBox', 'goodsService', '$timeout'];

  function searchResult($rootScope, $scope, $stateParams, $state, systemConfig, commonFn, toolBox, goodsService, $timeout) {
    //数据模型
    var vm = this;
    vm.params = {
      searchName: '',
      st: '',
      obyzd: '',
    };

    vm.page = {
      ids: [], //记录id,防止数据重复
      data: [],
      currentPage: 1,
      pageSize: 6,
      noDate: false,
      hasmore: true,
    }

    //事件
    vm.goodsSearch = goodsSearch; //商品搜索
    vm.addCart = addCart; //加入购物车
    vm.loadMore = loadMore; //上拉加载
    vm.refresh = refresh; //下拉刷新
    vm.tabClick = tabClick;

    // start 
    $scope.$on("$ionicView.beforeEnter", init);

    function init() {
      //参数初始化
      vm.params.searchName = $stateParams.keywords;
      vm.goodsSearch();
    }

    //上拉加载
    function loadMore() {
      $timeout(function() { //延时器
        vm.goodsSearch();
      }, 300)
    }

    //下拉刷新
    function refresh() {
      vm.page.ids = [];
      vm.page.data = [];
      vm.page.currentPage = 1;
      vm.goodsSearch();
    }

    /**
     * 商品搜索
     * @author lvwei
     * @date   2018-05-14T15:17:18+0800
     * @return {[type]}                 [description]
     */
    function goodsSearch() {
      var params = {
        search_name: vm.params.searchName,
        st: vm.params.st,
        obyzd: vm.params.obyzd,
        page: vm.page.currentPage,
      };
      goodsService.goodsSearch(params).then(function(result) {
        handlePage(result);
      }).finally(function() {
        $scope.$broadcast('scroll.refreshComplete');
      });

      function handlePage(data) {
        angular.forEach(data, function(item) {
          if (vm.page.ids.indexOf(item.goods_id) < 0) {
            vm.page.ids.push(item.goods_id);
            vm.page.data.push(item);
          }
        })

        var pageData = data; //后台的分页数组
        //检测是否有数据-自动化处理
        if (vm.page.currentPage == 1 && pageData.length == 0) {
          vm.page.noDate = true;
          vm.page.hasmore = false;
        } else {
          vm.page.noDate = false;
          //检测是否最后一页
          if (pageData.length < vm.page.pageSize || pageData.length == 0) {
            vm.page.hasmore = false;
          } else {
            $scope.$broadcast('scroll.infiniteScrollComplete'); //这里是告诉ionic更新数据完成，可以再次触发更新事件
            vm.page.hasmore = true;
            vm.page.currentPage++;
          }
        }
      }
    }

    /**
     * 加入购物车
     * @author lvwei
     * @date   2018-05-14T14:42:51+0800
     * @param  {[type]}                 goods [description]
     */
    function addCart($event, goods) {
      $event.stopPropagation();
      toolBox.msgToast('实现加入购物车');
    }

    function tabClick(id) {
      vm.params.obyzd = id;
      vm.refresh();
    }

  }
})(angular, jsonpath);