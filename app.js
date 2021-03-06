const {
  getShareImg, login
} = require('./http/api.js');
//app.js
App({
  onShow: function(){
    wx.checkSession({
      success() {
        //session_key 未过期，并且在本生命周期一直有效
      },
      fail() {
        // session_key 已经失效，需要重新执行登录流程
        wx.removeStorageSync('token')
        wx.login({
          success: res => {
            const data = {
              code: res.code,
            }
            login(data).then(res => {
              console.log(res)
            })
          }
        })
      }
    })
  },
  onLaunch: function () {
    // 展示本地存储能力
    var that = this;
    // 获取分享封面图存在stroage里面
    getShareImg().then(res => {
      wx.showLoading({
        title: '请等待',
      })
      console.log(res)
      if (res.code == 0) {
        wx.setStorageSync('share_img', res.data)
        wx.hideLoading()
      } else {
        wx.showToast({
          title: res.msg,
          icon: 'none'
        })
      }
    })

    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    // 登录
    // wx.login({
    //   success: res => {
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //     console.log(res)
    //   }
    // })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    phone: null,
    token: null,
    selectCity: null
  }
})