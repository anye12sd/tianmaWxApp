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
    startArray: ["请选择", "起始点1", "起始点2", "起始点3", "起始点4", "起始点5"],
    endArray: ["请选择", "终点1", "终点2", "终点3", "终点4", "终点5"],
    tel: "",
    startSelected: 0,
    endSelected: 0,
    declearRadioChecked: false,
    onLoadRadioChecked: true,
    showShadow: false,
    hasPhoneNum: "",
    phone: "",
    weight: "",
    volume: "",
    length: "",
    wide: "",
    height: "",
    amount: 0,
    locationSelect: {
      start: "起运机场",
      end: "目的机场",
      icon: "../../img/icon_08.png"
    },
    volumeList: {
      label: "体积（cm³）",
      placeholder: "0",
      isInput: true
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
    hasService: {
      label: "是否报关",
      isRadio: true
    },
    onLoadRadio: {
      label: "是否包含国内运输",
      isRadio: true
    },
    AmountList: {
      label: "票数（票）",
      placeholder: "0",
      isInput: true
    },
    priceItem: {
      totalPrice: "--",
      showOrderBtn: false,
      flag: 6,
      text: "本费用已含税，为预估费用，仅供参考"
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
      that.getTel()
    },
    getTel(){
      var that = this
      wx.showLoading({
        title: '加载中',
      })
      getTelephone('air_transport').then(res => {
        console.log(res)
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
      if (!that.data.length || !that.data.wide || !that.data.height || !that.data.weight) {
        wx.showToast({
          title: '请先完善表单',
          icon: 'none'
        })
        return false
      }
      var params = {
        setting1: that.data.startArray[that.data.startSelected].value,
        setting2: that.data.endArray[that.data.endSelected].value,
        setting3: parseFloat(parseFloat(that.data.length * that.data.wide * that.data.height).toFixed(2)),
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
      if (!that.data.length || !that.data.wide || !that.data.height || !that.data.weight) {
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
        setting3: parseFloat(parseFloat(that.data.length * that.data.wide * that.data.height).toFixed(2)),
        setting4: that.data.weight,
        setting5: that.data.declearRadioChecked ? 2 : 1,
        setting6: that.data.amount,
        nick_name: wx.getStorageSync('userInfo').nickName,
        mobile: that.data.phone || wx.getStorageSync('phone'),
        size: that.data.length + "," + that.data.wide + "," + that.data.height
      }
      console.log(params)
      wx.requestSubscribeMessage({
        tmplIds: ['4BlfpmT4MXeNSSqzo_CIqtLaiHAiByVRbzOx_ifnmQI'],
        success (res){
          
        },
        fail(err){
          wx.showToast({
            title: err.errMsg,
            icon: 'none',
            duration: 2000,
            mask: true,
          })
        },
        complete(){
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