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
    startArray: [],
    endArray: [],
    loadEndArray: [],
    loadEndIndex: 0,
    loadStartArray: [],
    boxTypeArray:[],
    loadStartIndex: 0,
    startSelected: 0,
    endSelected: 0,
    boxTypeIndex: 0,
    declearRadioChecked: false,
    showShadow: false,
    hasPhoneNum: "",
    phone: "",
    onLoadRadioChecked: false,
    amount: 0,
    locationSelect: {
      start: "起运站",
      end: "目的站",
      icon: "../../img/icon_06.png"
    },
    loadLocationSelect: {
      start: "发货地址",
      end: "收货站/港",
      icon: "../../img/icon_07.png"
    },
    boxList: {
      label: "装箱数",
      placeholder: "0 箱",
      isInput: true
    },
    boxTypeList:{
      label: "集装箱类型",
      isSelect: true
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
      rmbPrice: "",
      showOrderBtn: false,
      text: "不包含提箱费等相关杂费，仅供参考"
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
      that.getLoadEmun()
    },
    getEmun() {
      var that = this
      wx.showLoading({
        title: '加载中',
      })
      getEmunList('railway').then(res => {
        console.log(res,res.data)
        if(res.code == 0){
          that.setData({
            startArray: res.data.list[0].values,
            endArray: res.data.list[1].values,
            loadEndArray: [res.data.list[0].values[0]],
            boxTypeArray: res.data.list[3].values,
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
    getLoadEmun(){
      var that = this
      getEmunList('land_route').then(res => {
        that.setData({
          loadStartArray: res.data.list[0].values
        })
      })
    },
    // 是否报关
    getDeclearRadioValue: function (e) {
      this.setData({
        declearRadioChecked: e.detail.sonParam
      })
    },
    // 装箱数
    getBox: function (e) {
      this.setData({
        box: e.detail.sonParam
      })
    },
    // 集装箱类型
    getBoxValue: function(e){
      this.setData({
        boxTypeIndex: e.detail.sonParam
      })
    },
    // 是否需要陆运
    getOnLoadRadioValue: function (e) {
      this.setData({
        onLoadRadioChecked: e.detail.sonParam
      })
    },
    // 票数
    getAmount: function (e) {
      this.setData({
        amount: e.detail.sonParam
      })
    },
    // 起始点
    getStartSelectValue(e) {
      var that = this
      console.log(e.detail.sonParam)
      this.setData({
        startSelected: e.detail.sonParam,
        loadEndArray: [that.data.startArray[e.detail.sonParam]]
      })
      console.log(that.data.loadEndArray)
    },
    // 目的地
    getEndSelectValue(e) {
      this.setData({
        endSelected: e.detail.sonParam
      })
    },
    // 陆运起始点
    getLoadStartSelectValue(e){
      this.setData({
        loadStartIndex: e.detail.sonParam
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
      // 若包含国内运输，需先计算国内陆路价格
      if(that.data.onLoadRadioChecked){
        var params = {
          setting1: that.data.loadStartArray[that.data.loadStartIndex].value,
          setting2: that.data.loadEndArray[0].value,
          setting3: that.data.box,
        }
        wx.showLoading({
          title: '请等待',
        })
        console.log(params)
        postOrderInquiry('land_route', params).then(res => {
          console.log(res)
          if(res.code == 0){
            that.getPrice(res.data.total_price)
          }else{
            wx.showToast({
              title: res.msg,
              icon: 'none'
            })
          }
        })
      }else{
        that.getPrice()
      }
    },
    getPrice: function(price){
      var that = this
      var params = {
        setting1: that.data.startArray[that.data.startSelected].value,
        setting2: that.data.endArray[that.data.endSelected].value,
        setting3: that.data.box,
        setting4: that.data.declearRadioChecked ? 2 : 1,
        setting5: that.data.amount,
        setting6: that.data.onLoadRadioChecked ? price : 0,
        setting7: that.data.boxTypeArray[that.data.boxTypeIndex].id,
      }
      wx.showLoading({
        title: '请等待',
      })
      console.log(params)
      postOrderInquiry('railway', params).then(res => {
        console.log(res)
        if(res.code == 0){
          that.setData({
            "priceItem.totalPrice": res.data.total_price,
            "priceItem.rmbPrice": res.data.rmb_price,
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
      if(that.data.onLoadRadioChecked){
        var params = {
          order_amount: that.data.priceItem.totalPrice,
          setting1: that.data.startArray[that.data.startSelected].id,
          setting2: that.data.endArray[that.data.endSelected].id,
          setting3: that.data.box,
          setting4: that.data.declearRadioChecked ? 2 : 1,
          setting5: that.data.amount,
          setting6: that.data.priceItem.rmbPrice || 0,
          setting7: that.data.boxTypeArray[that.data.boxTypeIndex].id,
          district_from: that.data.loadStartArray[that.data.loadStartIndex].value,
          nick_name: wx.getStorageSync('uesrInfo').nickName,
          mobile: that.data.phone,
        }
      }else{
        var params = {
          order_amount: that.data.priceItem.totalPrice,
          setting1: that.data.startArray[that.data.startSelected].id,
          setting2: that.data.endArray[that.data.endSelected].id,
          setting3: that.data.box,
          setting4: that.data.declearRadioChecked ? 2 : 1,
          setting5: that.data.amount,
          setting6: 0,
          setting7: that.data.boxTypeArray[that.data.boxTypeIndex].id,
          nick_name: wx.getStorageSync('uesrInfo').nickName,
          mobile: that.data.phone,
        }
      }
      wx.showLoading({
        title: '请等待',
      })
      postOrder('railway', params).then(res => {
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
              "priceItem.rmbPrice": '',
            })
          }
        }
      })
    }
  }
})