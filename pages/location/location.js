// pages/location/location.js

var app = getApp()
const amapFile = require('../../libs/amap-wx.js');
var markersData = {
  latitude: '', //纬度
  longitude: '', //经度
  key: "c8c321465eed63a6afacc84a201b767b" //申请的高德地图key
};
const {
  getLocationList
} = require('../../http/api.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    searchValue: "",
    showList: false,
    cityList:[],
    location: ""
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function(options){
      this.setData({
        location: options.location
      })
    },
    updateValue(e) {
      let nameMap = {}
      nameMap['searchValue'] = e.detail && e.detail.value
      this.setData(nameMap)
    },
    search(e) {
      var that = this
      var value = e.detail.value
      if(value === "市" || !value){
        wx.showToast({
          title: '请输入正确的城市名称',
          icon: 'none'
        })
        return false
      }
      var listArray = []
      wx.showLoading({
        title: '加载中',
      })
      var params = {key_words: value}
      getLocationList(params).then(res => {
        if(!res.data.list.length){
          wx.showToast({
            title: '未查找到城市',
            icon: 'none'
          })
          wx.hideLoading()
          return false
        }else{
          that.setData({
            cityList: res.data.list,
            showList: true
          })
        }
        wx.hideLoading()
      })
    },
    hideList: function(){
      this.setData({
        cityList: [],
        showList: false
      })
    },
    selectCity(e){
      app.globalData.selectCity = e.currentTarget.dataset.city
      wx.switchTab({
        url: '../index/index'
      })
    },
    //获取当前位置的经纬度
  getLocation: function () {
    var that = this;
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function (res) {
        var latitude = res.latitude //维度
        var longitude = res.longitude //经度
        console.log(res);
        that.loadCity(latitude, longitude);
      },
      fail: function (res) {
        console.log(res)
        that.setData({
          hasLocationAuth: false
        })
      }
    })
  },
  //把当前位置的经纬度传给高德地图，调用高德API获取当前地理位置，天气情况等信息
  loadCity: function (latitude, longitude) {
    var that = this;
    var myAmapFun = new amapFile.AMapWX({
      key: markersData.key
    });
    myAmapFun.getRegeo({
      location: '' + longitude + ',' + latitude + '', //location的格式为'经度,纬度'
      success: function (data) {
        console.log(data);
        that.setData({
          location: data[0].regeocodeData.addressComponent.district
        })
      },
      fail: function (info) {
        console.log(info)
      }
    });
  },
  getAuth: function () {
    var that = this
    wx.getSetting({
      success: function (res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.openSetting({
            success(res) {
              console.log(res.authSetting)
              // res.authSetting = {
              //   "scope.userInfo": true,
              //   "scope.userLocation": true
              // }
            },
            fail(err) {
              //未授权则跳转到中间页
              console.log(err)
            }
          })
        } else {
          that.getLocation()
        }
      }
    })
  },
  }
})
