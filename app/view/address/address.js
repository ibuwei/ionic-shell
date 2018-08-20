/* 2018.5.2 zhangyafei
 * addressList
 * addAddress
 * 
 * */

/* addressList */
(function() {
  'use strict';
  angular.module('app.controllers').controller('addressList', addressList);
  addressList.$inject = ['addService', '$scope', 'toolBox', '$stateParams'];

  function addressList(addService, $scope, toolBox, $stateParams) {
    //数据模型
    var vm = this;
    vm.myfrom = $stateParams.from;
    vm.data = '';

    //事件
    vm.getData = getData; //获取数据
    vm.defAdd = defAdd, //设为默认地址
      vm.delAdd = delAdd, //删除地址

      // start
      $scope.$on('$ionicView.beforeEnter', function() {
        vm.getData();
      })

    //获取数据
    function getData() {
      var params = {};
      addService.addresslist(params).then(function(res) {
        vm.data = res.data.data;
      })
    }

    //设为默认地址
    function defAdd(id) {
      var params = {
        id: id
      };
      addService.defAdd(params).then(function(res) {

        angular.forEach(vm.data, function(item) {
          item.is_default = 0;
          if (item.id == id) {
            item.is_default = 1;
          }
        })

        if (vm.myfrom == 'submitOrder') {
          toolBox.goBack('submitOrder');
        } else {
          toolBox.msgToast('设置成功');
        }
      })
    }

    //删除地址
    function delAdd(data, myindex) {
      if (data.is_default == 1) {
        toolBox.msgToast('默认地址不能删除');
      } else {
        var params = {
          id: data.id
        };
        addService.delAdd(params).then(function(res) {
          if (res.data == '-2007') {
            toolBox.msgToast('默认地址不能删除');
          } else {
            toolBox.msgToast('删除成功');
            vm.data.splice(myindex, 1);
          }
        })
      }
    }

  }
})();

/* addAddress */
(function() {
  'use strict';
  angular.module('app.controllers').controller('addAddress', addAddress);
  addAddress.$inject = ['$scope', '$stateParams', 'addService', 'toolBox', '$state'];

  function addAddress($scope, $stateParams, addService, toolBox, $state) {
    //数据模型
    var vm = this;
    vm.addId = '';
    vm.editAddInfo = ''; //修改时地址列表传来的的地址信息
    vm.title = '添加收货地址';

    vm.addTap = 1; //tab省市区
    vm.showAddPop = false;
    vm.addInfo = {
      userName: '', //姓名
      phone: '', //手机号
      detailAdd: '', //详细地址
      pros: [],
      citys: [],
      areas: [],
      proId: '',
      proName: '请选择',
      cityId: '',
      cityName: '请选择',
      areaId: "",
      areaName: "请选择",
      showCityTab: false, //显示市的tab
      showAreaTab: false, //显示区的tab
    }

    //事件
    vm.detailAdd = detailAdd; //详细地址（修改）
    vm.showAddPopFn = showAddPopFn; //显示地址弹出框
    vm.closeAddPop = closeAddPop; //关闭地址弹出框
    vm.addTapFn = addTapFn; //地址tab选择
    vm.getprovince = getprovince; //获取省份
    vm.proClick = proClick; //省点击事件， 获取市
    vm.cityClick = cityClick; //市点击事件，获取区
    vm.areaClick = areaClick; //区点击事件
    vm.next = next; //保存

    // Start
    $scope.$on('$ionicView.beforeEnter', function() {
      vm.getprovince();
      //判断是否是修改
      vm.addId = $stateParams.id;
      if (vm.addId != undefined) {
        vm.title = '修改地址';
        vm.editAddInfo = $stateParams.address_info.split('&nbsp;');
      }
    })

    //详细地址
    function detailAdd() {
      var params = {
        id: vm.addId
      }
      addService.detailAdd(params).then(function(res) {
        vm.addInfo.showCityTab = true;
        vm.addInfo.showAreaTab = true;
        vm.addInfo.userName = res.data.consigner;
        vm.addInfo.phone = res.data.mobile;
        vm.addInfo.proId = res.data.province;
        vm.addInfo.proName = vm.editAddInfo[0];
        vm.addInfo.cityId = res.data.city;
        vm.addInfo.cityName = vm.editAddInfo[1];
        vm.addInfo.areaId = res.data.district;
        vm.addInfo.areaName = vm.editAddInfo[2];
        vm.addInfo.detailAdd = res.data.address;
        //选中省份
        angular.forEach(vm.addInfo.pros, function(item) {
          item.selected = false;
          if (item.province_id == vm.addInfo.proId) {
            item.selected = true;
          }
        })
      })
    }

    //显示地址弹出框
    function showAddPopFn() {
      vm.showAddPop = true;
    }

    //关闭地址弹出框
    function closeAddPop() {
      vm.showAddPop = false;
    }

    //地址tab选择
    function addTapFn(id) {
      vm.addTap = id;
    }

    //获取省份
    function getprovince() {
      //处理tab
      vm.addInfo.cityId = '';
      vm.addInfo.cityName = '请选择';
      vm.addInfo.areaId = '';
      vm.addInfo.areaName = '请选择';
      vm.addInfo.showCityTab = false;
      vm.addInfo.showAreaTab = false;

      //获取省
      vm.addInfo.pros = [];
      var params = {};
      addService.getprovince(params).then(function(res) {
        vm.addInfo.pros = res;
        vm.addInfo.pros[0].selected = true;
        vm.addInfo.proId = vm.addInfo.pros[0].province_id;
        vm.addInfo.proName = vm.addInfo.pros[0].province_name;

        if (vm.addId != undefined) {
          vm.detailAdd();
        }
      })
    }

    //省点击事件， 获取市
    function proClick(data) {
      //处理选中效果
      angular.forEach(vm.addInfo.pros, function(item) {
        item.selected = false;
        if (item.province_id == data.province_id) {
          item.selected = true;
          vm.addInfo.proId = item.province_id;
          vm.addInfo.proName = item.province_name;
        }
      })
      vm.addInfo.cityId = '';
      vm.addInfo.cityName = '请选择';
      vm.addInfo.areaId = '';
      vm.addInfo.areaName = '请选择';
      vm.addInfo.showCityTab = true;
      vm.addInfo.showAreaTab = false;

      //获取市
      vm.addInfo.citys = [];
      vm.addTap = 2;
      var params = {
        province_id: data.province_id
      };
      addService.getcity(params).then(function(res) {
        vm.addInfo.citys = res;
        vm.addInfo.citys[0].selected = true;

        vm.addInfo.cityId = vm.addInfo.citys[0].city_id;
        vm.addInfo.cityName = vm.addInfo.citys[0].city_name;
      })
    }

    //市点击事件，获取区
    function cityClick(data) {
      //处理选中效果
      angular.forEach(vm.addInfo.citys, function(item) {
        item.selected = false
        if (item.city_id == data.city_id) {
          item.selected = true;
          vm.addInfo.cityId = item.city_id;
          vm.addInfo.cityName = item.city_name;
        }
      })
      vm.addInfo.areaId = '';
      vm.addInfo.areaName = '请选择';
      vm.addInfo.showAreaTab = true;

      //获取区
      vm.addInfo.areas = [];
      vm.addTap = 3;
      var params = {
        city_id: data.city_id
      };
      addService.getarea(params).then(function(res) {
        vm.addInfo.areas = res;
        vm.addInfo.areas[0].selected = true;
        vm.addInfo.areaId = vm.addInfo.areas[0].district_id;
        vm.addInfo.areaName = vm.addInfo.areas[0].district_name;
      })
    }

    //区点击事件
    function areaClick(data) {
      vm.showAddPop = false;
      angular.forEach(vm.addInfo.areas, function(item) {
        item.selected = false;
        if (item.district_id == data.district_id) {
          item.selected = true;
          vm.addInfo.areaId = item.district_id;
          vm.addInfo.areaName = item.district_name;
        }
      })
    }

    //保存
    function next() {
      var params = {
        consigner: vm.addInfo.userName,
        mobile: vm.addInfo.phone,
        phone: '',
        province: vm.addInfo.proId,
        city: vm.addInfo.cityId,
        district: vm.addInfo.areaId,
        address: vm.addInfo.detailAdd
      }
      //校验参数
      if (params.consigner.length < 1) {
        toolBox.msgToast('请输入收件人名称');
      } else if (!G.phoneReg.test(params.mobile)) {
        toolBox.msgToast('请输入正确额手机号');
      } else if (params.city == '') {
        toolBox.msgToast('请选择所在地区');
      } else if (params.address.length < 1) {
        toolBox.msgToast('请输入详细地址');
      } else {
        //判断是否是修改
        if (vm.addId == undefined) {
          toolBox.showLoading();
          addService.addAddress(params).then(function(res) {
            toolBox.msgToast('新增成功');
            toolBox.hideLoading();

            sucFn();
          })
        } else {
          params.id = vm.addId;
          toolBox.showLoading();
          addService.updataAddress(params).then(function(res) {
            toolBox.msgToast('修改成功');
            toolBox.hideLoading();
            sucFn();
          })
        }
      }
    }
    
    function sucFn() {
      if ($stateParams.from == 'submitOrder') {
        toolBox.goBack('submitOrder');
      } else {
        toolBox.goBack('addressList');
      }
    }

  }
})();