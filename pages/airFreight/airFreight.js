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
    startArray: ["请选择", "起始点1", "起始点2", "起始点3", "起始点4", "起始点5"],
    endArray: ["请选择", "终点1", "终点2", "终点3", "终点4", "终点5"],
    startSelected: 0,
    endSelected: 0,
    declearRadioChecked: false,
    onLoadRadioChecked: true,
    showShadow: false,
    hasPhoneNum: "",
    phone: "",
    weight: "",
    volume: "",
    amount: 0,
    locationSelect: {
      start: "起运机场",
      end: "目的机场",
      icon: "../../img/icon_08.png"
    },
    volumeList: {
      label: "体积",
      placeholder: "0 立方米",
      isInput: true
    },
    weightList: {
      label: "重量",
      placeholder: "0 千克",
      isInput: true
    },
    hasService: {
      label: "是否报关",
      isRadio: true
    },
    onLoadRadio: {
      label: "是否包含国内运输",
      isRadio: true
    },
    AmountList: {
      label: "票数",
      placeholder: "0 票",
      isInput: true
    },
    priceItem: {
      totalPrice: "--",
      showOrderBtn: false,
      flag: 6,
      text: "本费用为预估费用，仅供参考"
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onShow: function () {
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
    getEmun() {
      var that = this
      wx.showLoading({
        title: '加载中',
      })
      getEmunList('air_transport').then(res => {
        console.log(res)
        if (res.code == 0) {
          that.setData({
            startArray: res.data.list[0].values,
            endArray: res.data.list[1].values
          })
          wx.hideLoading()
        } else {
          wx.showToast({
            title: res.msg,
            icon: 'none'
          })
        }
      })
    },
    // 是否报关
    getDeclearRadioValue: function (e) {
      this.setData({
        declearRadioChecked: e.detail.sonParam
      })
    },
    // 体积
    getVolume: function (e) {
      this.setData({
        volume: e.detail.sonParam
      })
    },
    // 重量
    getWeight: function (e) {
      this.setData({
        weight: e.detail.sonParam
      })
    },
    // 票数
    getAmount: function (e) {
      this.setData({
        amount: e.detail.sonParam
      })
    },
    // 是否需要陆运
    getOnLoadRadioValue: function (e) {
      this.setData({
        onLoadRadioChecked: e.detail.sonParam
      })
    },
    // 起始站
    getStartSelectValue(e) {
      this.setData({
        startSelected: e.detail.sonParam
      })
    },
    // 目的地
    getEndSelectValue(e) {
      this.setData({
        endSelected: e.detail.sonParam
      })
    },
    getOrderPrice: function () {
      var that = this
      if (!that.data.volume || !that.data.weight) {
        wx.showToast({
          title: '请先完善表单',
          icon: 'none'
        })
        return false
      }
      var params = {
        setting1: that.data.startArray[that.data.startSelected].value,
        setting2: that.data.endArray[that.data.endSelected].value,
        setting3: that.data.volume,
        setting4: that.data.weight,
        setting5: that.data.declearRadioChecked ? 2 : 1,
        setting6: that.data.amount
      }
      console.log(params)
      postOrderInquiry('air_transport', params).then(res => {
        console.log(res)
        if (res.code == 0) {
          that.setData({
            "priceItem.totalPrice": res.data.total_price,
            "priceItem.showOrderBtn": true,
            showShadow: true
          })
          wx.hideLoading()
        } else {
          wx.showToast({
            title: res.msg,
            icon: 'none'
          })
        }
      })
    },
    order: function () {
      var that = this
      if (!that.data.volume || !that.data.weight) {
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
        setting3: that.data.volume,
        setting4: that.data.weight,
        setting5: that.data.declearRadioChecked ? 2 : 1,
        setting6: that.data.amount,
        nick_name: wx.getStorageSync('userInfo').nickName,
        mobile: that.data.phone,
      }
      console.log(params)
      wx.showLoading({
        title: '请等待',
      })
      postOrder('air_transport', params).then(res => {
        console.log(res)
        if (res.code == 0) {
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
        } else {
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