// pages/login/login.js
const app = getApp()
const {
  login,
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

  },

  /**
   * 组件的方法列表
   */
  methods: {
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
            console.log(res)
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
            wx.showLoading({
              title: '请等待',
            })
            login(data).then(res => {
              console.log(res)
              if (res.code == 0) {
                wx.setStorageSync('token', res.data.token)
                wx.showToast({
                  title: '登录成功',
                  icon: 'success',
                  duration: 2000,
                  mask: true,
                  success: function () {
                    setTimeout(function () {
                      //要延时执行的代码
                      wx.navigateBack({
                        delta: 0,
                      })
                    }, 2000) //延迟时间
                  }
                })
              } else {
                wx.showToast({
                  title: res.msg,
                  icon: 'none'
                })
              }
            })
          } else {
            console.log('登录失败！' + res.errMsg)
          }
        }
      })
    },
  }
})