// pages/addressBook/addressBook.js
const {
  getOrderDetail
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
    tel: "",
    showAddressSelect: false,  
    receiverAddressList: {
      "isSender": false,
      "name": "这是收货人",
      "phone": "-",
      "address": "这是收货地址",
    },
    senderAddressList: {
      "isSender": true,
      "name": "这是发货人",
      "phone": "13813813813",
      "address": "这是发货地址",
    },
    orderDetailList: {}
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function (options) {
      var that = this;
      var orderId = options.orderId
      that.getOrder(orderId)
    },
    getOrder: function (orderId) {
      wx.showLoading({
        title: '加载中',
      })
      var that = this;
      getOrderDetail(orderId).then(res => {
        console.log(res)
        if(res.code == 0){
          that.setData({
            orderDetailList: res.data,
            tel: res.data.kefu_telephone
          })
        }
        wx.hideLoading()
      })
    },
    copyText: function (e) {
      // console.log(e)
      wx.setClipboardData({
        data: e.currentTarget.dataset.text,
        success: function (res) {
          wx.getClipboardData({
            success: function (res) {
              wx.showToast({
                title: '复制成功'
              })
            }
          })
        }
      })
    },
    // tel: function(){
    //   wx.makePhoneCall({
    //     phoneNumber: '13813813813',
    //     // success: function(){
    //     //   wx.showToast({
    //     //     title: '拨打成功',
    //     //     icon: 'success'
    //     //   })
    //     // },
    //     // fail: function(){
    //     //   wx.showToast({
    //     //     title: '拨打失败',
    //     //     icon: 'none'
    //     //   })
    //     // },
    //   })
    // }
  }
})