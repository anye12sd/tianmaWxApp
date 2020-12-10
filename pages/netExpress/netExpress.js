// pages/DomesticExpress/DomesticExpress.js
const {
  getEmunList,
  postOrderInquiry,
  postOrder,
  getTelephone
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
    share_img: "",
    tel: "",
    car: 0,
    filter: 0,
    hasPhoneNum: "",
    phone: "",
    mapShow: false,
    distance: "",
    showAddressSelect: true,
    showShadow: false,
    carArray: [],
    weightMax: 0,
    volumeMax: 0,
    newCarArray: [],
    filterArray: [{
      value: "按载重"
    }, {
      value: "按体积"
    }],
    carSelect: {
      "label": "车型",
      "isSelect": true
    },
    carFilter: {
      "label": "车型筛选",
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
    weightList: {
      label: "装车重量（T）",
      placeholder: "0",
      isInput: true
    },
    volumeList: {
      label: "装车体积（m³）",
      placeholder: "0",
      isInput: true
    },
    priceItem: {
      totalPrice: "--",
      showOrderBtn: false,
      text: "本费用已含税，为预估费用，仅供参考"
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
      if (!that.data.carArray.length) {
        that.getEmun()
      }
      that.checkSelectedAddress()
      that.getTel()
    },
    getTel() {
      var that = this
      wx.showLoading({
        title: '加载中',
      })
      getTelephone('network_freight').then(res => {
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
      getEmunList('network_freight').then(res => {
        // console.log(res)
        if (res.code == 0) {
          var car = res.data.list[0].values
          car.unshift({
            value: '请选择'
          })
          that.setData({
            'carSelect.label': res.data.list[0].name,
            carArray: car,
            newCarArray: car,
            // 获取车载重量最大值
            weightMax: Math.max.apply(Math, car.map(function (item) {
              return item.weight << 0
            })),
            // 获取车载体积最大值
            volumeMax: Math.max.apply(Math, car.map(function (item) {
              return item.volume << 0
            }))
          })
          console.log(car)
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
    getCarSelectValue: function (e) {
      this.setData({
        car: e.detail.sonParam
      })
    },
    getCarFilterValue: function (e) {
      let that = this
      this.setData({
        filter: e.detail.sonParam,
        car: 0,
        weight: 0,
        volume: 0,
        newCarArray: that.data.carArray
      })
      console.log(this.data.filter)
    },
    getVolume: function (e) {
      // 筛选体积大于装车体积的车辆，如果没有，返回最大体积车辆
      let newArray = this.data.carArray.filter(item => item.volume > e.detail.sonParam)
      if (e.detail.sonParam >= this.data.volumeMax) {
        newArray = this.data.carArray.filter(item => item.volume == this.data.volumeMax)
      }
      this.setData({
        volume: e.detail.sonParam,
        newCarArray: newArray,
        car: 0
      })
    },
    getWeight: function (e) {
      // 筛选载重大于装车重量的车辆，如果没有，返回最大载重车辆
      let newArray = this.data.carArray.filter(item => item.weight > e.detail.sonParam)
      if (e.detail.sonParam >= this.data.weightMax) {
        newArray = this.data.carArray.filter(item => item.weight == this.data.weightMax)
      }
      this.setData({
        weight: e.detail.sonParam,
        newCarArray: newArray,
        car: 0
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
      var that = this
      that.getLocation(that.data.senderAddressList.address, "sender")
      that.getLocation(that.data.receiverAddressList.address, "receiver")
    },
    getOrder: function () {
      var that = this
      if (!that.data.newCarArray[that.data.car].id) {
        wx.showToast({
          title: '请选择车型',
          icon: 'none'
        })
        return false
      }
      let distance = [Math.round(parseFloat(that.data.distance) * 0.001), Math.round(parseFloat(that.data.distance) * 0.001) + 30]
      var params = {
        setting1: Math.round(parseFloat(that.data.distance) * 0.001),
        setting2: that.data.newCarArray[that.data.car].id,
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
        setting2: that.data.newCarArray[that.data.car].id,
        setting3: that.data.senderAddressList.address,
        setting4: that.data.receiverAddressList.address,
        nick_name: wx.getStorageSync('userInfo').nickName,
        mobile: that.data.phone || wx.getStorageSync('phone'),
      }
      console.log(params)
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
          postOrder('network_freight', params).then(res => {
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
    getLocation: function (address, type) {
      var that = this
      if (!that.data.newCarArray[that.data.car].id) {
        wx.showToast({
          title: '请选择车型',
          icon: 'none'
        })
        return false
      }
      wx.showLoading({
        title: '地图加载中',
      })
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
          console.log(data)
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
          if (data.paths.length && data.paths[0].distance) {
            console.log(data)
            that.setData({
              distance: data.paths[0].distance + '米'
            });
            // 延迟800ms后执行确保获取distance
            setTimeout(function(){
              that.getOrder()
            }, 800)
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
      wx.hideLoading({

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