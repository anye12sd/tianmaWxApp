// pages/seaFreight/seaFreight.js
const {
  getEmunList,
  postOrderInquiry,
  postOrder
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
    addressArray:["请选择","报关地1","报关地2","报关地3","报关地4","报关地5"],
    addressSelect: 0,
    amount: "",
    hasPhoneNum: "",
    phone: "",
    showShadow: false,
    addressList: {
      label: "报关地",
      isSelect: true
    },
    AmountList:{
      label: "票数",
      placeholder: "0 票",
      isInput: true
    },
    priceItem: {
      totalPrice: "--",
      showOrderBtn: false,
      text: "本费用为预估费用，仅供参考"
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onShow: function (){
      var that = this
      const phone = wx.getStorageSync('phone') ? wx.getStorageSync('phone') : ""
      console.log(phone)
      if (!phone) {
        that.setData({
          hasPhoneNum: true,
          phone:phone
        })
      } else {
        that.setData({
          hasPhoneNum: false,
          phone: phone
        })
      }
      that.getEmun()
    },
    getEmun(){
      var that = this
      wx.showLoading({
        title: '加载中',
      })
      getEmunList('gateway').then(res => {
        console.log(res)
        if(res.code == 0){
          that.setData({
            'addressList.label': res.data.list[0].name,
            addressArray: res.data.list[0].values
          })
          wx.hideLoading()
        }else{
          wx.showToast({
            title: res.msg,
            icon: 'none'
          })
        }
      })
    },
    // 报关地
    getSelectValue: function(e){
      this.setData({
        addressSelect: e.detail.sonParam
      })
    },
    // 票数
    getAmount: function(e){
      this.setData({
        amount: e.detail.sonParam
      })
    },
    getOrderPrice: function () {
      var that = this
      if (!that.data.amount) {
        wx.showToast({
          title: '请先完善表单',
          icon: 'none'
        })
        return false
      }
      var params = {
        setting1: that.data.amount,
        setting2: that.data.addressArray[that.data.addressSelect].id,
      }
      console.log(params)
      postOrderInquiry('gateway', params).then(res => {
        console.log(res)
        if(res.code == 0){
          that.setData({
            "priceItem.totalPrice": res.data.total_price,
            "priceItem.showOrderBtn": true,
            showShadow: true
          })
          wx.hideLoading()
        }else{
          wx.showToast({
            title: res.msg,
            icon: 'none'
          })
        }
      })
    },
    order: function(){
      var that = this
      if (!that.data.amount) {
        wx.showToast({
          title: '请先完善表单',
          icon: 'none'
        })
        return false
      }
      var params = {
        order_amount: that.data.priceItem.totalPrice,
        setting1: that.data.amount,
        setting2: that.data.addressArray[that.data.addressSelect].id,
        nick_name: wx.getStorageSync('userInfo').nickName,
        mobile: that.data.phone,
      }
      console.log(params)
      wx.showLoading({
        title: '请等待',
      })
      postOrder('gateway', params).then(res => {
        console.log(res)
        if(res.code == 0){
          wx.showToast({
            title: '下单成功',
            icon: 'success',
            duration: 2000,
            mask: true,
            success: function () {
              setTimeout(function () {
                //要延时执行的代码
                wx.navigateTo({
                  url: '../orderList/orderList?status=1',
                })
              }, 1000) //延迟时间
            }
          })
          that.setData({
            showShadow: false,
            "priceItem.showOrderBtn": false,
          })
        }else{
          wx.showToast({
            title: res.msg,
            icon: 'none'
          })
        }
      })
    },
    showReOrder: function () {
      var that = this
      wx.showModal({
        title: '提示',
        content: '您已询价，需要重新询价吗',
        success(res) {
          if (res.confirm) {
            that.setData({
              showShadow: false,
              "priceItem.showOrderBtn": false,
              "priceItem.totalPrice": '--',
            })
          }
        }
      })
    }
  }
})
