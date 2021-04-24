// pages/dynamicLease/dynamicLease.js
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
    array: ["请选择", "发货1", "发货2", "发货3", "发货4", ],
    computedArray: [],
    tel: "",
    index: 0,
    computedIndex: 0,
    showDayVolumn: false,
    radioChecked: false,
    dayVolumn: "",
    square: "",
    weight: "",
    volume: "",
    length: "",
    wide: "",
    height: "",
    deliverAmount: "",
    hasPhoneNum: "",
    phone: "",
    operateIndex: 0,
    showShadow: false,
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
    computedSelect: {
      label: "请选择计算方式",
      isSelect: true
    },
    lengthList: {
      label: "长（cm）",
      placeholder: "0",
      isInput: true
    },
    wideList: {
      label: "宽（cm）",
      placeholder: "0",
      isInput: true
    },
    heightList: {
      label: "高（cm）",
      placeholder: "0",
      isInput: true
    },
    weightList: {
      label: "重量（kg）",
      placeholder: "0",
      isInput: true
    },
    squareList: {
      label: "预估日存储面积（m²）",
      placeholder: "0",
      category: "deliverAmount",
      isInput: true
    },
    deliverAmountList: {
      label: "预计日均发货数量（件）",
      placeholder: "0",
      category: "deliverAmount",
      isInput: true
    },
    dayVolumnList: {
      label: "预估日平均库存（件）",
      placeholder: "0",
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
      getTelephone('dynamic_lease').then(res => {
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
      getEmunList('dynamic_lease').then(res => {
        console.log(res)
        if (res.code == 0) {
          that.setData({
            'deliverWayList.label': res.data.list[0].name,
            array: res.data.list[0].values,
            computedArray: res.data.list[2].values,
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
    getcomputedValue: function(e){
      this.setData({
        computedIndex: e.detail.sonParam
      })
      if(this.data.computedArray[this.data.computedIndex].id == 2){
        this.setData({
          showDayVolumn: true
        })
      }else{
        this.setData({
          showDayVolumn: false
        })
      }
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
    getDayVolumn: function (e) {
      this.setData({
        dayVolumn: e.detail.sonParam
      })
    },
    // 长
    getLength: function (e) {
      this.setData({
        length: e.detail.sonParam
      })
    },
    // 宽
    getWide: function (e) {
      this.setData({
        wide: e.detail.sonParam
      })
    },
    // 高
    getHeight: function (e) {
      this.setData({
        height: e.detail.sonParam
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
    getDeliverAmount: function (e) {
      this.setData({
        deliverAmount: e.detail.sonParam
      })
    },
    operate: function (e) {
      // console.log(e.detail.sonParam)
      this.setData({
        operateIndex: e.detail.sonParam
      })
    },
    getOrderPrice: function () {
      var that = this
      if (!that.data.square || !that.data.deliverAmount || !that.data.length || !that.data.wide || !that.data.height || !that.data.weight) {
        wx.showToast({
          title: '请先完善表单',
          icon: 'none'
        })
        return false
      }
      if(that.data.showDayVolumn && !that.data.dayVolumn){
        wx.showToast({
          title: '请先完善表单',
          icon: 'none'
        })
        return false
      }
      var params = {
        setting1: that.data.square,
        setting2: that.data.deliverAmount,
        setting3: that.data.computedArray[that.data.computedIndex].id,
        setting4: that.data.dayVolumn,
      }
      // console.log(params)
      wx.showLoading({
        title: '请等待',
      })
      postOrderInquiry('dynamic_lease', params).then(res => {
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
      if (!that.data.square || !that.data.deliverAmount || !that.data.length || !that.data.wide || !that.data.height || !that.data.weight) {
        wx.showToast({
          title: '请先完善表单',
          icon: 'none'
        })
        return false
      }
      if(that.data.showDayVolumn && !that.data.dayVolumn){
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
        setting5: that.data.computedArray[that.data.computedIndex].id,
        setting6: that.data.weight,
        setting7: parseFloat(parseFloat(that.data.length * that.data.wide * that.data.height).toFixed(2)),
        setting8: that.data.dayVolumn,
        size: that.data.length + "," + that.data.wide + "," + that.data.height,
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
          postOrder('dynamic_lease', params).then(res => {
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