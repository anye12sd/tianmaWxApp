// pages/dynamicLease/dynamicLease.js
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
    array: ["请选择", "发货1", "发货2", "发货3", "发货4", ],
    index: 0,
    radioChecked: true,
    square: "",
    deliverAmount: "",
    hasPhoneNum: "",
    phone: "",
    operateIndex: 0,
    showShadow: false,
    radioChecked: true,
    priceList: [],
    operateArray: [{
      id: 2,
      value: "单品操作"
    }, {
      id: 3,
      value: "组合操作"
    }],
    operate: {
      label: "操作方式",
      isSelect: true
    },
    squareList: {
      label: "预计日估存储面积",
      placeholder: "0 平方",
      category: "deliverAmount",
      isInput: true
    },
    deliverAmountList: {
      label: "预计日均发货数量",
      placeholder: "0 件",
      category: "deliverAmount",
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
    priceItem: {
      totalPrice: "--",
      showOrderBtn: false,
      text: "不包含单品/组合发货费用，仅供参考"
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
      getEmunList('dynamic_lease').then(res => {
        console.log(res)
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
      console.log(e.detail.sonParam)
      this.setData({
        index: e.detail.sonParam
      })
    },
    getRadioValue: function (e) {
      this.setData({
        radioChecked: e.detail.sonParam
      })
    },
    getSquare: function (e) {
      this.setData({
        square: e.detail.sonParam
      })
    },
    getDeliverAmount: function (e) {
      this.setData({
        deliverAmount: e.detail.sonParam
      })
    },
    operate: function (e) {
      console.log(e.detail.sonParam)
      this.setData({
        operateIndex: e.detail.sonParam
      })
    },
    getOrderPrice: function () {
      var that = this
      if (!that.data.square || !that.data.deliverAmount) {
        wx.showToast({
          title: '请先完善表单',
          icon: 'none'
        })
        return false
      }
      var params = {
        setting1: that.data.square,
        setting2: that.data.deliverAmount,
      }
      console.log(params)
      wx.showLoading({
        title: '请等待',
      })
      postOrderInquiry('dynamic_lease', params).then(res => {
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
      if (!that.data.square || !that.data.deliverAmount) {
        wx.showToast({
          title: '请先完善表单',
          icon: 'none'
        })
        return false
      }
      var params = {
        order_amount: that.data.priceItem.totalPrice,
        setting1: that.data.square,
        setting2: that.data.deliverAmount,
        setting3: that.data.radioChecked ? "1" : "0",
        setting4: that.data.array[that.data.index].id,
        // setting5: that.data.index
        nick_name: wx.getStorageSync('uesrInfo').nickName,
        mobile: that.data.phone,
      }
      wx.showLoading({
        title: '请等待',
      })
      console.log(params)
      postOrder('dynamic_lease', params).then(res => {
        console.log(res)
        if (res.code == 0) {
          wx.showToast({
            title: '下单成功',
            icon: 'success'
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