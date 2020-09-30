//index.js
//获取应用实例
const app = getApp()
const {
  login,
  bindPhone,
  getLayoutList,
  getBannerList
} = require('../../http/api.js');
const amapFile = require('../../libs/amap-wx.js');
var markersData = {
  latitude: '', //纬度
  longitude: '', //经度
  key: "c8c321465eed63a6afacc84a201b767b" //申请的高德地图key
};
Page({
  data: {
    hasLocationAuth: true,
    location: '金华市',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    background: [],
    autoplay: false,
    interval: 2000,
    duration: 500,
    currentSwiper: 0,
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onShow: function () {
    wx.removeStorageSync('receiverAddressSelected')
    wx.removeStorageSync('senderAddressSelected')
    wx.removeStorageSync('addressNew')
    wx.removeStorageSync('AddressSelect')
    var that = this
    console.log(app.globalData.selectCity)
    app.globalData.selectCity ? this.setData({
      location: app.globalData.selectCity
    }) : that.getLocation()
  },
  onLoad: function () {
    var that = this
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    wx.showLoading({
      title: '加载中',
    })
    // 获取首页菜单
    that.getLayout()
    // 获取首页轮播图
    that.getBanner()
    wx.hideLoading()
  },
  getLayout: function () {
    getLayoutList().then(res => {
      console.log(res)
    })
  },
  getBanner: function () {
    var that = this
    getBannerList().then(res => {
      // console.log(res)
      that.setData({
        background: res.data.list
      })
    })
  },
  swiperChange: function (e) {
    this.setData({
      currentSwiper: e.detail.current
    })
  },
  getUserInfo: function (e) {
    if (!e.detail.userInfo) {
      wx.showToast({
        title: "用户拒绝了登录",
        icon: 'none', //图标，支持"success"、"loading" 
        duration: 2000, //提示的延迟时间，单位毫秒，默认：1500 
        mask: true, //是否显示透明蒙层，防止触摸穿透，默认：false 
      })
      return false
    }
    app.globalData.userInfo = e.detail.userInfo
    wx.login({
      success(res) {
        if (res.code) {
          //发起网络请求
          // wx.request({
          //   url: 'http://192.168.8.24:3000/wxapp/login',
          //   data: {
          //     "code": res.code,
          //     nickName: e.detail.userInfo.nickName,
          //     avatarUrl: e.detail.userInfo.avatarUrl
          //   },
          //   method: 'POST',
          //   header: {
          //     'content-type': 'application/json'
          //   },
          //   success: function (res) {
          //     console.log(res.data)
          //     wx.setStorageSync('token', res.data.data.token)
          //   }
          // })
          wx.setStorageSync('uesrInfo', {
            nickName: e.detail.userInfo.nickName,
            avatarUrl: e.detail.userInfo.avatarUrl
          })
          const data = {
            code: res.code,
            nick_name: e.detail.userInfo.nickName,
            avatar_url: e.detail.userInfo.avatarUrl,
          }
          login(data).then(res => {
            console.log(res)
            wx.setStorageSync('token', res.data.token)
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
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
        // console.log(res);
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
        app.globalData.selectCity = data[0].regeocodeData.addressComponent.district
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
  getPhoneNumber(e) {
    console.log(e)
    console.log(e.detail.errMsg)
    console.log(e.detail.iv)
    console.log(e.detail.encryptedData)
    if (!e.detail.encryptedData) {
      wx.showToast({
        title: "用户拒绝授权",
        icon: 'none', //图标，支持"success"、"loading" 
        duration: 2000, //提示的延迟时间，单位毫秒，默认：1500 
        mask: true, //是否显示透明蒙层，防止触摸穿透，默认：false 
      })
      return false
    }
    const data = {
      iv: e.detail.iv,
      encrypted_data: e.detail.encryptedData
    }
    bindPhone(data).then(res => {
      console.log(res)
      wx.setStorageSync('phone', res.data.phone_number)
    }).catch(err => {
      console.log(err)
    })
  },
  toPage: function (e) {
    const token = wx.getStorageSync('token') ? wx.getStorageSync('token') : ""
    if(!token){
      wx.navigateTo({
        url: '../login/login'
      })
      return false
    }
    var page = e.currentTarget.dataset.page
    console.log(page)
    wx.navigateTo({
      url: '../' + page + '/' + page
    })
  },
  toSelectCity: function () {
    var that = this
    wx.navigateTo({
      url: '../location/location?location=' + that.data.location
    })
  }
})