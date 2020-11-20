// component/priceEntry/priceEntry.js
const {
  bindPhone,
} = require('../../http/api.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    priceItem: Object,
    hasPhoneNum: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    hasPhoneNum: ""
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onShow: function () {

    },
    getOrderPrice(e) { //点击弹出作品弹窗
      this.triggerEvent('getOrderPrice')
    },
    order(e) { //点击弹出作品弹窗
      this.triggerEvent('order')
    },
    getPhoneNumber(e) {
      var that = this
      var code
      wx.login({
        success(res) {
          if (res.code) {
            console.log(res)
            if (res.code) {
              code = res.code
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
                code: code,
                iv: e.detail.iv,
                encryptedData: e.detail.encryptedData
              }
              wx.showLoading({
                title: '请等待',
              })
              console.log(data)
              bindPhone(data).then(res => {
                console.log(res)
                if (res.code == 0) {
                  wx.setStorageSync('phone', res.data.phone_number)
                  that.setData({
                    hasPhoneNum: false,
                    phone: res.data.phone_number
                  })
                  wx.hideLoading()
                } else {
                  wx.showToast({
                    title: res.msg,
                    icon: 'none'
                  })
                }
              }).catch(err => {
                console.log(err)
              })
            }
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
          } else {
            console.log('登录失败！' + res.errMsg)
          }
        }
      })
    },
  }
})