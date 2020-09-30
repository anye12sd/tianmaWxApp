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
    startArray:["请选择","起始点1","起始点2","起始点3","起始点4","起始点5"],
    endArray:["请选择","终点1","终点2","终点3","终点4","终点5"],
    startSelected: 0,
    endSelected: 0,
    showShadow: false,
    hasPhoneNum: "",
    phone: "",
    box: "",
    locationSelect: {
      start: "发货地址",
      end: "收货站/港",
      icon: "../../img/icon_07.png"
    },
    boxList:{
      label: "装箱数",
      placeholder: "0 箱",
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
          phone: phone
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
      getEmunList('land_route').then(res => {
        console.log(res)
        if(res.code == 0){
          that.setData({
            startArray: res.data.list[0].values,
            endArray: res.data.list[1].values
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
    // 装箱数
    getBox: function(e){
      this.setData({
        box: e.detail.sonParam
      })
    },
    // 起始点
    getStartSelectValue(e){
      this.setData({
        startSelected: e.detail.sonParam
      })
    },
    // 目的地
    getEndSelectValue(e){
      this.setData({
        endSelected: e.detail.sonParam
      })
    },
    getOrderPrice: function () {
      var that = this
      if (!that.data.box) {
        wx.showToast({
          title: '请先完善表单',
          icon: 'none'
        })
        return false
      }
      var params = {
        setting1: that.data.startArray[that.data.startSelected].value,
        setting2: that.data.endArray[that.data.endSelected].value,
        setting3: that.data.box
      }
      console.log(params)
      postOrderInquiry('land_route', params).then(res => {
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
      if (!that.data.box) {
        wx.showToast({
          title: '请先完善表单',
          icon: 'none'
        })
        return false
      }
      var params = {
        order_amount: that.data.priceItem.totalPrice,
        setting1: that.data.startArray[that.data.startSelected].id,
        setting2: that.data.endArray[that.data.endSelected].id,
        setting3: that.data.box,
        nick_name: wx.getStorageSync('uesrInfo').nickName,
        mobile: that.data.phone,
      }
      console.log(params)
      wx.showLoading({
        title: '请等待',
      })
      postOrder('land_route', params).then(res => {
        console.log(res)
        if(res.code == 0){
          wx.showToast({
            title: '下单成功',
            icon: 'success'
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
