// pages/staticLease/staticLease.js
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
    array: [],
    priceList: [],
    operateArray: [{
      id: 2,
      value: "单品操作"
    }, {
      id: 3,
      value: "组合操作"
    }],
    tel: "",
    index: 0,
    radioChecked: true,
    hasPhoneNum: "",
    month: 0,
    square: 0,
    day: 0,
    deliver: 21,
    operateIndex: 0,
    showShadow: false,
    phone: "",
    monthList: {
      label: "月数（月）",
      placeholder: "0",
      isInput: true
    },
    squareList: {
      label: "平方数（m²）",
      placeholder: "0",
      isInput: true
    },
    dayList: {
      label: "天数（天）",
      placeholder: "0",
      isInput: true
    },
    hasService: {
      label: "是否包含操作服务",
      isRadio: true
    },
    deliverWayList: {
      label: "发货方式",
      isSelect: true
    },
    operate: {
      label: "操作方式",
      isSelect: true
    },
    priceItem: {
      totalPrice: "--",
      showOrderBtn: false,
      text: "价格已含税，不包含单品/组合发货费用，仅供参考"
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
      getTelephone('fixed_lease').then(res => {
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
      getEmunList('fixed_lease').then(res => {
        // console.log(res)
        if (res.code == 0) {
          that.setData({
            'deliverWayList.label': res.data.list[0].name,
            array: res.data.list[0].values,
            priceList: res.data.list[1].values,
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
    getSelectValue: function (e) {
      // console.log(e.detail.sonParam)
      this.setData({
        index: e.detail.sonParam
      })
    },
    // operate: function (e) {
    //   console.log(e.detail.sonParam)
    //   this.setData({
    //     operateIndex: e.detail.sonParam
    //   })
    // },
    getRadioValue: function (e) {
      this.setData({
        radioChecked: e.detail.sonParam
      })
    },
    getMonth: function (e) {
      // console.log(e.detail.sonParam)
      this.setData({
        month: e.detail.sonParam
      })
    },
    getSquare: function (e) {
      this.setData({
        square: e.detail.sonParam
      })
    },
    getDay: function (e) {
      var that = this
      that.setData({
        day: e.detail.sonParam,
      })
      // if(e.detail.sonParam > 31){
      //   wx.showToast({
      //     title: '天数不得大于31天',
      //     icon: 'none',
      //     success: function(){
      //       setTimeout(function(){
      //         that.setData({
      //           day: 21,
      //           "dayList.placeholder": 21
      //         })
      //       }, 1000)
      //     }
      //   })
      // }
    },
    getOrderPrice: function () {
      var that = this
      // 平方数不能为空，天数和月数可以有一项为空
      if (!that.data.square || (!that.data.month && !that.data.day)) {
        wx.showToast({
          title: '请先完善表单',
          icon: 'none'
        })
        return false
      }
      if (that.data.day > 30) {
        wx.showToast({
          title: '天数不得大于30天',
          icon: 'none'
        })
        return false
      }
      var params = {
        setting1: that.data.month,
        setting2: that.data.square,
        setting3: that.data.day,
        // setting3: that.data.radioChecked ? "1" : "0",
        // setting4: that.data.radioChecked ? that.data.operateIndex : "",
        // setting5: that.data.index
      }
      wx.showLoading({
        title: '请等待',
      })
      // console.log(params)
      postOrderInquiry('fixed_lease', params).then(res => {
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
      // 平方数不能为空，天数和月数可以有一项为空
      if (!that.data.square || (!that.data.month && !that.data.day)) {
        wx.showToast({
          title: '请先完善表单',
          icon: 'none'
        })
        return false
      }
      var params = {
        order_amount: that.data.priceItem.totalPrice,
        setting1: that.data.month,
        setting2: that.data.square,
        setting3: that.data.day,
        // setting3: that.data.radioChecked ? "1" : "0",
        // setting4: that.data.array[that.data.index].id,
        // setting5: that.data.index,
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
          postOrder('fixed_lease', params).then(res => {
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