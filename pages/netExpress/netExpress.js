// pages/DomesticExpress/DomesticExpress.js
const {
  getEmunList,
  postOrderInquiry,
  postOrder
} = require('../../http/api.js');
const amapFile = require('../../libs/amap-wx.js');
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
    car: 0,
    hasPhoneNum: "",
    phone: "",
    mapShow: false,
    distance: "",
    showAddressSelect: true,
    showShadow: false,
    carArray: ["请选择", "车型1", "车型2", "车型3", "车型4", "车型5"],
    carSelect: {
      "label": "车型",
      "isSelect": true
    },
    senderAddressList: {
      "isSender": true,
      "name": "这是发货人",
      "address": "这是发货地址",
    },
    receiverAddressList: {
      "isSender": false,
      "name": "这是收货人",
      "address": "这是收货地址",
    },
    priceItem: {
      totalPrice: "--",
      showOrderBtn: false,
      text: "本费用为预估费用，仅供参考"
    },
    markers: [{
      iconPath: "../../img/mapicon_navi_s.png",
      id: 1,
      latitude: "",
      longitude: "",
      width: 23,
      height: 33
    }, {
      iconPath: "../../img/mapicon_navi_e.png",
      id: 0,
      latitude: "",
      longitude: "",
      width: 24,
      height: 34
    }],
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
      that.checkSelectedAddress()
    },
    getEmun() {
      var that = this
      wx.showLoading({
        title: '加载中',
      })
      getEmunList('network_freight').then(res => {
        // console.log(res)
        if (res.code == 0) {
          that.setData({
            'carSelect.label': res.data.list[0].name,
            carArray: res.data.list[0].values
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
    getCarSelectValue: function (e) {
      this.setData({
        car: e.detail.sonParam
      })
    },
    getVolume: function (e) {
      this.setData({
        volume: e.detail.sonParam
      })
    },
    getWeight: function (e) {
      this.setData({
        weight: e.detail.sonParam
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
    getOrderPrice: function () {
      // console.log(3454)
      var that = this
      that.getLocation(that.data.senderAddressList.address, "sender")
      that.getLocation(that.data.receiverAddressList.address, "receiver")
    },
    getLocation: function (address, type) {
      var that = this
      wx.request({
        url: 'https://restapi.amap.com/v3/geocode/geo?address=' + address + '&output=JSON&key=25d11906d5f5421fc88e01cc52576119',
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          console.log(res.data)
          if (!res.data.geocodes.length) {
            var sender = type == "sender" ? "发货人" : "收货人"
            wx.showToast({
              title: '未查询到' + sender + '地址',
              icon: 'none'
            })
            return false
          }
          if (type == "sender") {
            var latitude = res.data.geocodes[0].location.split(",")[1]
            var longitude = res.data.geocodes[0].location.split(",")[0]
            that.setData({
              'markers[0].latitude': latitude,
              'markers[0].longitude': longitude
            })
          } else {
            var latitude = res.data.geocodes[0].location.split(",")[1]
            var longitude = res.data.geocodes[0].location.split(",")[0]
            that.setData({
              'markers[1].latitude': latitude,
              'markers[1].longitude': longitude,
              mapShow: true
            })
            that.getMap()
          }
        }
      })
    },
    getMap: function () {
      var that = this;
      var key = 'c8c321465eed63a6afacc84a201b767b';
      var myAmapFun = new amapFile.AMapWX({
        key: key
      });
      myAmapFun.getDrivingRoute({
        origin: that.data.markers[0].longitude + ',' + that.data.markers[0].latitude,
        destination: that.data.markers[1].longitude + ',' + that.data.markers[1].latitude,
        success: function (data) {
          var points = [];
          if (data.paths && data.paths[0] && data.paths[0].steps) {
            var steps = data.paths[0].steps;
            for (var i = 0; i < steps.length; i++) {
              var poLen = steps[i].polyline.split(';');
              for (var j = 0; j < poLen.length; j++) {
                points.push({
                  longitude: parseFloat(poLen[j].split(',')[0]),
                  latitude: parseFloat(poLen[j].split(',')[1])
                })
              }
            }
          }
          that.setData({
            polyline: [{
              points: points,
              color: "#0091ff",
              width: 6
            }]
          });
          if (data.paths[0] && data.paths[0].distance) {
            // console.log(data.paths[0].distance)
            that.setData({
              distance: data.paths[0].distance + '米'
            });
            that.getOrder()
          } else {
            wx.showToast({
              title: '未获取到距离',
              icon: 'none'
            })
          }
          // if(data.taxi_cost){
          //   that.setData({
          //     cost: '打车约' + parseInt(data.taxi_cost) + '元'
          //   });
          // }  
        },
        fail: function (info) {
          wx.showToast({
            title: '地图创建失败',
            icon: 'none'
          })
        }
      })
    },
    getOrder: function () {
      var that = this
      var params = {
        setting1: parseFloat(that.data.distance) * 0.001,
        setting2: that.data.carArray[that.data.car].id,
      }
      wx.showLoading({
        title: '请等待',
      })
      console.log(params)
      postOrderInquiry('network_freight', params).then(res => {
        console.log(res)
        if (res.code == 0) {
          that.setData({
            showShadow: true,
            "priceItem.totalPrice": res.data.price,
            "priceItem.showOrderBtn": true,
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
      var params = {
        order_amount: that.data.priceItem.totalPrice,
        setting1: parseFloat(that.data.distance) * 0.001,
        setting2: that.data.carArray[that.data.car].id,
        setting3: that.data.senderAddressList.address,
        setting4: that.data.receiverAddressList.address,
        nick_name: wx.getStorageSync('uesrInfo').nickName,
        mobile: that.data.phone,
      }
      wx.showLoading({
        title: '请等待',
      })
      console.log(params)
      postOrder('network_freight', params).then(res => {
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
  }
})