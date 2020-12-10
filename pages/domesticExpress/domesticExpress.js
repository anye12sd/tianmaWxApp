// pages/DomesticExpress/DomesticExpress.js
const {
  getEmunList,
  bindPhone,
  postOrderInquiry,
  postOrder,
  getTelephone
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
    share_img: "",
    expressIndex: 0,
    tel: "",
    weight: "",
    number: 1, // 发货数量，目前默认写死为1
    hasPhoneNum: "",
    phone: "",
    JDFlag: false, // 判断当前快递是否为京东
    province: "浙江省",
    provinceLimit: "",
    city: "金华市",
    county: "永康市",
    showProvince: "",
    showAddressSelect: true,
    addressReadonly: true, // 控制发货区域时候可选择，只有京东可选择发货区域
    showAddress: true,
    queryPrice: [],
    expressArray: [],
    expressFixedArray: [], // 此数组不可变，用于快递模糊查询匹配不到快递的时候归零使用
    expressArrayQueried: [],
    expressString: "",
    queried: false, // 是否显示重新询价按钮
    // 屏幕下拉刷新
    page: 1,
    page_size: 10,
    clientHight: "",
    showVolume: false, // 在品牌为邮政或者京东快递时显示长宽高
    length: 0,
    wide: 0,
    height: 0,
    totalPage: 0,
    allHeight: null, // 整个屏幕高度（包含不可见区域）
    clientHight: null, // 可见区域屏幕高度，不包含滚动条折叠不可见区域
    noMore: false, // 没有更多了
    gap: null, // 第二次后者更后面计算整个高度的时候（包含不可见区域）会有误差，需要加上这个误差
    num: 0,
    canRefresh: false,
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
    expressQuery: {
      label: "快递品牌查询",
      isStringInput: true,
      placeholder: "请输入",
    },
    weightList: {
      label: "预估重量（kg）",
      isInput: true,
      placeholder: "0"
    },
    numberList: {
      label: "预估件数（件）",
      isInput: true,
      placeholder: "0"
    },
    volumeList: {
      label: "预估体积（cm³）",
      isInput: true,
      placeholder: "0"
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
      }),
      that.pageScrollToBottom()
    },
    onShow: function () {
      var that = this
      that.setData({
        'share_img': wx.getStorageSync('share_img')
      })
      const phone = wx.getStorageSync('phone') ? wx.getStorageSync('phone') : ""
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
      // that.checkSelectedAddress()
    },
    getTel(){
      var that = this
      wx.showLoading({
        title: '加载中',
      })
      getTelephone('china_express_new').then(res => {
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
    getEmun: function () {
      var that = this
      wx.showLoading({
        title: '加载中',
      })
      getEmunList('china_express_new').then(res => {
        let provinceLimitArray = res.data.list[1].values
        let provinceLimitNewArray = []
        for(var i = 0; i < provinceLimitArray.length; i++){
          provinceLimitNewArray.push(provinceLimitArray[i].value)
        }
        if(res.code == 0){
          that.setData({
            'expressSelect.label': res.data.list[0].name,
            expressArray: res.data.list[0].values,
            expressFixedArray: res.data.list[0].values,
            provinceLimit: provinceLimitNewArray,
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
    getPhoneNumber(e) {
      var that = this
      var code
      wx.login({
        success(res) {
          if (res.code) {
            if (res.code) {
              code = res.code
              // console.log(e)
              // console.log(e.detail.errMsg)
              // console.log(e.detail.iv)
              // console.log(e.detail.encryptedData)
              if (!e.detail.encryptedData) {
                wx.showToast({
                  title: "用户拒绝授权",
                  icon: 'none', //图标，支持"success"、"loading" 
                  duration: 2000, //提示的延迟时间，单位毫秒，默认：1500 
                  mask: true, //是否显示透明蒙层，防止触摸穿透，默认：false 
                })
                return false
              }
              const data = {
                code: code,
                iv: e.detail.iv,
                encryptedData: e.detail.encryptedData
              }
              wx.showLoading({
                title: '请等待',
              })
              // console.log(data)
              bindPhone(data).then(res => {
                // console.log(res)
                if (res.code == 0) {
                  wx.setStorageSync('phone', res.data.phone_number)
                  that.setData({
                    hasPhoneNum: false,
                    phone: res.data.phone_number
                  })
                  wx.hideLoading()
                } else {
                  wx.showToast({
                    title: res.msg,
                    icon: 'none'
                  })
                }
              }).catch(err => {
                // console.log(err)
              })
            }
            //发起网络请求
            // wx.request({
            //   url: 'http://192.168.8.24:3000/wxapp/login',
            //   data: {
            //     "code": res.code,
            //     nickName: e.detail.userInfo.nickName,
            //     avatarUrl: e.detail.userInfo.avatarUrl
            //   },
            //   method: 'POST',
            //   header: {
            //     'content-type': 'application/json'
            //   },
            //   success: function (res) {
            //     console.log(res.data)
            //     wx.setStorageSync('token', res.data.data.token)
            //   }
            // })
          } else {
            // console.log('登录失败！' + res.errMsg)
          }
        }
      })
    },
    checkSelectedAddress: function () {
      var that = this
      var selectedAddress = wx.getStorageSync('AddressSelect')
      // console.log(selectedAddress)
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
          // console.log(receiverAddressSelected)
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
      // console.log(e,e.detail.sonParam)
      var that = this
      this.setData({
        expressIndex: e.detail.sonParam,
        queried: false,
        page: 1,
      })
      // console.log(that.data.expressArray[e.detail.sonParam])
      // 当快递品牌为或者京东快递时候，显示长宽高
      if (that.data.expressArray[e.detail.sonParam].value == '邮政' || that.data.expressArray[e.detail.sonParam].value == '京东快递') {
        this.setData({
          showVolume: true
        })
      }else{
        this.setData({
          showVolume: false
        })
      }
      that.pageScrollToBottom()
      // 当快递品牌为京东时激活发货地址选项，其它不能
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
    getExpressQuery: function (e) {
      this.setData({
        expressString: e.detail.sonParam,
        queried: false,
        page: 1,
      })
      this.queryExpress(e.detail.sonParam)
    },
    getWeight: function (e) {
      this.setData({
        weight: e.detail.sonParam,
        queried: false,
        page: 1,
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
    getNumber: function (e) {
      this.setData({
        number: e.detail.sonParam,
        queried: false,
        page: 1,
      })
    },
    queryExpress: function(value){
      let that = this
      let express = []
      that.setData({
        expressArrayQueried: []
      })
      // console.log(value)
      for (let i = 0; i < that.data.expressFixedArray.length; i++){
        if(that.data.expressFixedArray[i].value.indexOf(value) >= 0){
          express.push(that.data.expressFixedArray[i])
        }
      }
      // console.log(express)
      if(express.length){
        that.setData({
          expressArray: express,
          expressIndex: 0,
        })
      }else{
        wx.showToast({
          title: '暂无匹配到快递信息',
          icon: 'none'
        })
        that.setData({
          expressIndex: 0,
          expressArray: that.data.expressFixedArray,
        })
      }
      that.getExpressValue({detail:{sonParam: 0}})
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
      var volume = (that.data.length * that.data.wide * that.data.height).toFixed(2)
      // console.log(that.data.length , that.data.wide , that.data.height)
      if (!that.data.weight || !that.data.number || !that.data.province || !that.data.city || !that.data.county || ((that.data.expressArray[that.data.expressIndex].value === '邮政' || that.data.expressArray[that.data.expressIndex].value === '京东快递') && (!that.data.length || !that.data.wide || !that.data.height))) {
        wx.showToast({
          title: '请先完善表单',
          icon: 'none'
        })
        return false
      }
      if(that.data.expressArray[that.data.expressIndex].value === '京东' && that.data.provinceLimit.indexOf(that.data.city) < 0){
        // 京东下只有固定区域可发货
        // console.log(that.data.provinceLimit)
        wx.showToast({
          // title: '目前京东只支持' +that.data.provinceLimit.toString()+ '地区发货',
          title: '目前快递只支持' +that.data.provinceLimit.toString()+ '地区发货',
          icon: 'none'
        })
        return false
      }
      var params = {
        setting1: that.data.expressArray[that.data.expressIndex].value,
        setting2: that.data.JDFlag ? that.data.city : '永康市',
        setting3: that.data.weight,
        setting4: that.data.number,
        page: that.data.page,
      }
      if(that.data.expressArray[that.data.expressIndex].value === '邮政' || that.data.expressArray[that.data.expressIndex].value === '京东快递'){
        params.setting5 = volume
        params.size = that.data.length + "," + that.data.wide + "," + that.data.height
      }
      wx.showLoading({
        title: '请等待',
      })
      // console.log(params)
      postOrderInquiry('china_express_new', params).then(res => {
        // console.log(res)
        if (res.code == 0) {
          if(!that.data.queried){
            // 第一次查询
            that.order()
            that.setData({
              queryPrice: res.data.list,
              showProvince: that.data.JDFlag ? that.data.province : '永康市',
              totalPage: res.data.total_page,
              queried: true,
            })
          }else{
            // 第二次查询
            that.setData({
              queryPrice: that.data.queryPrice.concat(res.data.list),
              showProvince: that.data.JDFlag ? that.data.province : '永康市',
              totalPage: res.data.total_page,
              queried: true,
            })
          }
          setTimeout(function(){
            that.setData({
              canRefresh: false
            })
          }, 300)
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
      var id
      // 京东可发全国，其余快递只能永康，返回id
      if(that.data.expressArray[that.data.expressIndex].value == '京东'){
        id = 1
      }else{
        id = 2
      }
      var params = {
        setting1: that.data.expressArray[that.data.expressIndex].id,
        setting2: id,
        setting3: that.data.weight,
        setting4: that.data.number,
        nick_name: wx.getStorageSync('userInfo').nickName,
        mobile: that.data.phone || wx.getStorageSync('phone'),
      }
      if(that.data.expressArray[that.data.expressIndex].value === '邮政' || that.data.expressArray[that.data.expressIndex].value === '京东快递' ){
        params.setting5 = (that.data.length * that.data.wide * that.data.height).toFixed(2)
        params.size = that.data.length + "," + that.data.wide + "," + that.data.height
      }
      // console.log(params)
      wx.showLoading({
        title: '请等待',
      })
      postOrder('china_express_new', params).then(res => {
        // console.log(res)
        if(res.code == 0){
          // console.log("success")
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
      // 请求数据
      model.updateAreaData(that, 0, e);
      // 港澳台地区不显示
      let provinces = that.data.item.provinces.splice(that.data.item.provinces.length - 3, 3)
      that.setData({
        'that.data.item.provinces': provinces
      })
    },
    //点击选择城市按钮显示picker-view
    translate: function (e) {
      var that = this
      if (that.data.addressReadonly) {
        wx.showToast({
          // title: '目前京东只支持' +that.data.provinceLimit.toString()+ '地区发货',
          title: '目前快递只支持' +that.data.provinceLimit.toString()+ '地区发货',
          icon: 'none'
        })
        return false
      }
      model.animationEvents(this, 0, true, 400);
    },
    //隐藏picker-view
    hiddenFloatView: function (e) {
      // console.log("id = " + e.target.dataset.id)
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
      let item = this.data.item;
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
      if (that.data.allHeight - that.data.clientHight <= (e.scrollTop + 2)) { // 判断是否滚动动到底部
        // console.log("到底了")
        if (!that.data.noMore && !that.data.canRefresh) {
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
            page: page,
            canRefresh: true
          })
          that.getOrderPrice()
        }
      }
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