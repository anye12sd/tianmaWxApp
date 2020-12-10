// pages/home/home.js
const app = getApp()
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
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function () {
      if (app.globalData.userInfo || wx.getStorageSync('userInfo')) {
        console.log(345)
        this.setData({
          userInfo: app.globalData.userInfo || wx.getStorageSync('userInfo'),
          hasUserInfo: true
        })
        console.log(this.data.userInfo)
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
    },
    onShow: function () {
      if (app.globalData.userInfo) {
        this.setData({
          userInfo: app.globalData.userInfo,
          hasUserInfo: true
        })
      }
    },
    toLogin: function (e) {
      const token = wx.getStorageSync('token') ? wx.getStorageSync('token') : ""
      if (!token) {
        wx.navigateTo({
          url: '../login/login'
        })
        return false
      }
      // console.log(e)
      // app.globalData.userInfo = e.detail.userInfo
      // this.setData({
      //   userInfo: e.detail.userInfo,
      //   hasUserInfo: true
      // })
    },
    a: function () {
      console.log(this.data.userInfo)
    },
    getPhoneNumber(e) {
      console.log(e.detail.errMsg)
      console.log(e.detail.iv)
      console.log(e.detail.encryptedData)
    },
    toPage: function (e) {
      var orderType = e.currentTarget.dataset.ordertype || ""
      var page = e.currentTarget.dataset.page
      if (orderType) {
        wx.navigateTo({
          url: '../' + page + '/' + page + '?status=' + orderType
        })
        return false
      }
      wx.navigateTo({
        url: '../' + page + '/' + page
      })
    }
  }
})