// pages/seaFreight/seaFreight.js
const {
  getEmunList,
  postOrderInquiry,
  postOrder,
  getTelephone
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
    share_img: "",
    startArray: [],
    endArray: [],
    boxTypeArray: [],
    startSelected: 0,
    endSelected: 0,
    boxTypeIndex: 0,
    showShadow: false,
    hasPhoneNum: "",
    phone: "",
    box: "",
    locationSelect: {
      start: "发货地址",
      end: "收货站/港",
      icon: "../../img/icon_07.png"
    },
    boxList: {
      label: "装箱数（箱）",
      placeholder: "0",
      isInput: true
    },
    boxTypeList: {
      label: "集装箱类型",
      isSelect: true
    },
    priceItem: {
      totalPrice: "--",
      showOrderBtn: false,
      text: "价格已含税，不包含提箱费等相关杂费，仅供参考"
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onShow: function () {
      var that = this
      that.setData({
        'share_img': wx.getStorageSync('share_img')
      })
      const phone = wx.getStorageSync('phone') ? wx.getStorageSync('phone') : ""
      // console.log(phone)
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
      that.getTel()
    },
    getTel() {
      var that = this
      wx.showLoading({
        title: '加载中',
      })
      getTelephone('land_route').then(res => {
        // console.log(res)
        if (res.code == 0) {
          that.setData({
            tel: res.data.kefu_telephone
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
    getEmun() {
      var that = this
      wx.showLoading({
        title: '加载中',
      })
      getEmunList('land_route').then(res => {
        // console.log(res)
        if (res.code == 0) {
          that.setData({
            startArray: res.data.list[0].values,
            endArray: res.data.list[1].values,
            boxTypeArray: res.data.list[2].values,
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
    // 装箱数
    getBox: function (e) {
      this.setData({
        box: e.detail.sonParam
      })
    },
    // 集装箱类型
    getBoxValue: function (e) {
      this.setData({
        boxTypeIndex: e.detail.sonParam
      })
    },
    // 起始点
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
        setting3: that.data.box,
        setting4: that.data.boxTypeArray[that.data.boxTypeIndex].id,
      }
      // console.log(params)
      postOrderInquiry('land_route', params).then(res => {
        // console.log(res)
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
        setting4: that.data.boxTypeArray[that.data.boxTypeIndex].id,
        nick_name: wx.getStorageSync('userInfo').nickName,
        mobile: that.data.phone || wx.getStorageSync('phone'),
      }
      // console.log(params)
      wx.requestSubscribeMessage({
        tmplIds: ['4BlfpmT4MXeNSSqzo_CIqtLaiHAiByVRbzOx_ifnmQI'],
        success(res) {

        },
        fail(err) {
          wx.showToast({
            title: err.errMsg,
            icon: 'none',
            duration: 2000,
            mask: true,
          })
        },
        complete() {
          wx.showLoading({
            title: '请等待',
          })
          postOrder('land_route', params).then(res => {
            // console.log(res)
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
    },
    onShareAppMessage: async function () {
      var that = this
      return {
        title: '宏伟天马物流',
        path: `/pages/ad/ad`,
        imageUrl: that.data.share_img
      }
    },
  }
})