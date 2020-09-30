// pages/DomesticExpress/DomesticExpress.js
const {
  getEmunList,
  postOrderInquiry,
  postOrder
} = require('../../http/api.js');
var sendArray = []
var model = require('../../component/model/model.js')
var show = false;
var item = {};
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
    expressIndex: 0,
    weight: "",
    hasPhoneNum: "",
    JDFlag: false,
    province: "浙江省",
    provinceLimit: "",
    city: "金华市",
    county: "永康市",
    showProvince: "",
    showAddressSelect: true,
    addressReadonly: true,
    showAddress: true,
    queryPrice: [],
    expressArray: [],
    // 屏幕下拉刷新
    page: 1,
    page_size: 10,
    clientHight: "",
    totalPage: 0,
    allHeight: null, // 整个屏幕高度（包含不可见区域）
    clientHight: null, // 可见区域屏幕高度，不包含滚动条折叠不可见区域
    noMore: false, // 没有更多了
    gap: null, // 第二次后者更后面计算整个高度的时候（包含不可见区域）会有误差，需要加上这个误差
    num: 0,
    // 屏幕下拉刷新
    expressSelect: {
      label: "快递品牌",
      isSelect: true
    },
    senderAddress: {
      label: "发货区域",
      isSelect: true
    },
    senderAddressArray: [],
    weightList: {
      label: "预估重量",
      isInput: true,
      placeholder: "0 公斤"
    },
    volumeList: {
      label: "预估体积",
      isInput: true,
      placeholder: "0 立方米"
    },
    senderAddressList: {
      "isSender": true,
      "name": "这是发货人",
      "phone": "13813813813",
      "address": "这是发货地址",
    },
    receiverAddressList: {
      "isSender": false,
      "name": "这是收货人",
      "phone": "-",
      "address": "这是收货地址",
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
    onLoad: function () {
      var that = this
      // 获取可见区域高度
      wx.getSystemInfo({
        success: function (res) {
          that.setData({
            clientHight: res.windowHeight
          })
        },
      })
    },
    onShow: function () {
      var that = this
      const phone = wx.getStorageSync('phone') ? wx.getStorageSync('phone') : ""
      console.log(phone)
      if (!phone) {
        that.setData({
          hasPhoneNum: true
        })
      } else {
        that.setData({
          hasPhoneNum: false
        })
      }
      that.getEmun()
      // that.checkSelectedAddress()
    },
    getEmun: function () {
      var that = this
      wx.showLoading({
        title: '加载中',
      })
      getEmunList('china_express').then(res => {
        console.log(res)
        if(res.code == 0){
          that.setData({
            'expressSelect.label': res.data.list[0].name,
            expressArray: res.data.list[0].values,
            provinceLimit: res.data.list[1].values[0].value
          })
          sendArray = res.data.list[0].values
          wx.hideLoading()
        }else{
          wx.showToast({
            title: res.msg,
            icon: 'none'
          })
        }
      })
    },
    checkSelectedAddress: function () {
      var that = this
      var selectedAddress = wx.getStorageSync('AddressSelect')
      console.log(selectedAddress)
      if (selectedAddress) {
        selectedAddress = JSON.parse(selectedAddress)
        var senderAddressSelected = wx.getStorageSync('senderAddressSelected')
        var receiverAddressSelected = wx.getStorageSync('receiverAddressSelected')
        if (senderAddressSelected) {
          var senderAddressSelected = JSON.parse(senderAddressSelected).item
          that.setData({
            'senderAddressList.phone': senderAddressSelected.mobile,
            'senderAddressList.name': senderAddressSelected.real_name,
            'senderAddressList.address': senderAddressSelected.province + senderAddressSelected.city + senderAddressSelected.district + senderAddressSelected.address
          })
        }
        if (receiverAddressSelected) {
          var receiverAddressSelected = JSON.parse(receiverAddressSelected).item
          console.log(receiverAddressSelected)
          that.setData({
            'receiverAddressList.phone': receiverAddressSelected.mobile,
            'receiverAddressList.name': receiverAddressSelected.real_name,
            'receiverAddressList.address': receiverAddressSelected.province + receiverAddressSelected.city + receiverAddressSelected.district + receiverAddressSelected.address
          })
        }
        // wx.removeStorageSync("AddressSelect")
      }
    },
    // 快递品牌选择
    getExpressValue: function (e) {
      var that = this
      this.setData({
        expressIndex: e.detail.sonParam
      })
      console.log(that.data.expressArray[e.detail.sonParam])
      if (that.data.expressArray[e.detail.sonParam].value !== '京东') {
        this.setData({
          JDFlag: false,
          addressReadonly: true,
          showAddress: true,
          province: "浙江省",
          city: "金华市",
          county: "永康市"
        })
      } else {
        this.setData({
          JDFlag: true,
          addressReadonly: false,
          senderAddressArray: sendArray
        })
      }
    },
    // getVolume: function(e){
    //   this.setData({
    //     volume: e.detail.sonParam
    //   })
    // },
    getWeight: function (e) {
      this.setData({
        weight: e.detail.sonParam
      })
    },
    // senderAddressSelect: function(){
    //   var url = getCurrentPages()[getCurrentPages().length - 1].route.slice(6)
    //   console.log(getCurrentPages(),url)
    //   var selectParams = {type: "sender", url: url}
    //   wx.setStorageSync('AddressSelect', JSON.stringify(selectParams))
    //   // wx.redirectTo({
    //   //   url: '../addressBook/addressBook'
    //   // })
    // },
    // receiverAddressSelect: function(){
    //   var url = getCurrentPages()[getCurrentPages().length - 1].route.slice(6)
    //   console.log(getCurrentPages(),url)
    //   var selectParams = {type: "receiver", url: url}
    //   wx.setStorageSync('AddressSelect', JSON.stringify(selectParams))
    //   // wx.redirectTo({
    //   //   url: '../addressBook/addressBook'
    //   // })
    // }
    getOrderPrice: function () {
      var that = this
      if (!that.data.weight || !that.data.province || !that.data.city || !that.data.county) {
        wx.showToast({
          title: '请先完善表单',
          icon: 'none'
        })
        return false
      }
      if(that.data.expressArray[that.data.expressIndex].value === '京东' && that.data.provinceLimit.indexOf(that.data.province) < 0){
        // 京东下只有固定区域可发货
        wx.showToast({
          title: '目前京东只支持' +that.data.provinceLimit.toString()+ '地区发货',
          icon: 'none'
        })
        return false
      }
      var params = {
        setting1: that.data.expressArray[that.data.expressIndex].value,
        setting2: that.data.JDFlag ? that.data.province : '永康市',
        setting3: that.data.weight,
        page: that.data.page,
      }
      wx.showLoading({
        title: '请等待',
      })
      console.log(params)
      postOrderInquiry('china_express', params).then(res => {
        console.log(res)
        if (res.code == 0) {
          that.setData({
            queryPrice: res.data.list,
            showProvince: that.data.JDFlag ? that.data.province : '永康市',
            totalPage: res.data.total_page
          })
          that.order()
          that.pageScrollToBottom()
          wx.hideLoading()
        } else {
          wx.showToast({
            title: res.msg,
            icon: 'none'
          })
        }
      })
    },
    order: function(){
      var that = this
      var params = {
        order_amount: 0,
        setting1: 0,
        setting2: 0,
        setting3: 0,
        nick_name: wx.getStorageSync('uesrInfo').nickName,
        mobile: that.data.phone,
      }
      console.log(params)
      wx.showLoading({
        title: '请等待',
      })
      postOrder('china_express', params).then(res => {
        console.log(res)
        if(res.code == 0){
          console.log("success")
        }else{
          wx.showToast({
            title: res.msg,
            icon: 'none'
          })
        }
      })
    },
    //生命周期函数--监听页面初次渲染完成
    onReady: function (e) {
      var that = this;
      //请求数据
      model.updateAreaData(that, 0, e);
    },
    //点击选择城市按钮显示picker-view
    translate: function (e) {
      var that = this
      if (that.data.addressReadonly) {
        return false
      }
      model.animationEvents(this, 0, true, 400);
    },
    //隐藏picker-view
    hiddenFloatView: function (e) {
      console.log("id = " + e.target.dataset.id)
      model.animationEvents(this, 200, false, 400);
      //点击确定按钮更新数据(id=444是背后透明蒙版 id=555是取消按钮)
      if (e.target.dataset.id == 666) {
        this.updateShowData()
      }
    },
    //滑动事件
    bindChange: function (e) {
      model.updateAreaData(this, 1, e);
      //如果想滑动的时候不实时更新，只点确定的时候更新，注释掉下面这行代码即可。
      this.updateShowData()
    },
    //更新顶部展示的数据
    updateShowData: function (e) {
      item = this.data.item;
      this.setData({
        province: item.provinces[item.value[0]].name,
        city: item.citys[item.value[1]].name,
        county: item.countys[item.value[2]].name
      });
      this.setData({
        showAddress: true
      })
    },

    // 滚动下拉触发刷新
    // 获取屏幕总高度（包含不可见区域）
    pageScrollToBottom: function () {
      const that = this
      wx.createSelectorQuery().select('#container').boundingClientRect(function (rect) {
        // console.log(rect)
        // 计算第一次的差值，这时候才能算出真正的高度，第二次及以后bottom的值不正确
        if (that.data.num === 0) {
          const gap = rect.bottom - rect.height
          that.setData({
            gap: gap
          })
        }
        const num = that.num + 1
        that.setData({
          num: num
        })
        that.setData({
          allHeight: rect.height + that.data.gap // 
        })
      }).exec()
    },
    // 监听屏幕滚动事件，只要屏幕往上或者往下滚动都会触发此方法
    onPageScroll: function (e) {
      var that = this
      // console.log(e)
      // console.log(that.data.allHeight, that.data.clientHight)
      if (that.data.allHeight - that.data.clientHight <= (e.scrollTop - 60)) { // 判断是否滚动动到底部
        console.log("到底了")
        if (!that.data.noMore) {
          const page = that.data.page + 1
          if(page > that.data.totalPage){
            wx.showToast({
              title: '到底了',
              icon: 'none'
            })
            // that.setData({
            //   noMore: true
            // })
            return false
          }
          that.setData({
            isMore: true,
            page: page
          })
          that.getOrderPrice()
        }
      }
    },
  }
})