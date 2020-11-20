// pages/addressEdit/addressEdit.js
const {
  postAddAddress,
  putEditAddress
} = require('../../http/api.js');

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
    showAddress: false,
    areaText: "区域",
    switchChecked: false,
    showInput: true,
    addressId: "",
    name: "",
    phone: "",
    addressDetail: "",
    addressNew: false,
    addressNewList: "",
    province: "",
    city: "",
    county: "",
    item: {
      show: show
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function (options) {
      var that = this
      var item, addressNew = wx.getStorageSync('addressNew')
      if(addressNew){
        // 新增地址或者从网络货运过来的
        addressNew = JSON.parse(addressNew)
        console.log(addressNew)
        if(addressNew.type == "receiver"){
          that.setData({
            areaText: '收货区域',
          })
        }else {
          that.setData({
            areaText: '发货区域',
          })
          if(wx.getStorageSync("location")){
            that.setData({
              province: wx.getStorageSync("location").province,
              city: wx.getStorageSync("location").city,
              county: wx.getStorageSync("location").district,
              showAddress: true,
            })
            console.log(that.data.province)
          }
        }
        that.setData({
          addressNewList: addressNew,
          addressNew: addressNew.addressNew,
          showInput: false
        })
      } 
      if (options.item) {
        // 编辑地址
        item = JSON.parse(options.item)
        that.setData({
          addressId: item.id || "",
          name: item.real_name || "",
          showAddress: item.showAddress || false,
          phone: item.mobile || "",
          province: item.province || "",
          city: item.city || "",
          county: item.district || "",
          addressDetail: item.address || "",
          switchChecked: item.is_default || "",
        })
        wx.setNavigationBarTitle({
          title: '编辑地址',
        })
      }
    },
    //生命周期函数--监听页面初次渲染完成
    onReady: function (e) {
      var that = this;
      //请求数据
      model.updateAreaData(that, 0, e);
    },
    //点击选择城市按钮显示picker-view
    translate: function (e) {
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
    switchChange: function () {
      var that = this
      that.setData({
        switchChecked: !that.data.switchChecked
      })
    },
    saveEdit: function (options) {
      var that = this
      var reg = /^1([3578][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/
      if (!that.data.name || !that.data.phone || !that.data.province || !that.data.addressDetail) {
        wx.showToast({
          title: "请先完善表单",
          icon: 'none', //图标，支持"success"、"loading" 
          duration: 2000, //提示的延迟时间，单位毫秒，默认：1500 
          mask: true, //是否显示透明蒙层，防止触摸穿透，默认：false 
        })
        return false
      }
      if (!reg.test(this.data.phone)) {
        wx.showToast({
          title: "请输入正确的手机号",
          icon: 'none', //图标，支持"success"、"loading" 
          duration: 2000, //提示的延迟时间，单位毫秒，默认：1500 
          mask: true, //是否显示透明蒙层，防止触摸穿透，默认：false 
        })
        return false
      }
      var id = that.data.addressId, addressNew = that.data.addressNew
      if (!id) {
        if(addressNew){
          that.toPage()
        }else{
          that.addAddress()
        }
      } else {
        that.editAddress()
      }
    },
    editAddress: function () {
      console.log("是编辑地址")
      var that = this
      var id = that.data.addressId
      var setDefault = that.data.switchChecked ? "1" : "0"
      var params = {
        real_name: that.data.name,
        mobile: that.data.phone,
        province: that.data.province,
        city: that.data.city,
        district: that.data.county,
        address: that.data.addressDetail,
        is_default: setDefault
      }
      putEditAddress(id, params).then(res => {
        console.log(res)
        if (res.code === 0) {
          wx.showToast({
            title: "编辑成功",
            icon: 'success', //图标，支持"success"、"loading" 
            duration: 2000, //提示的延迟时间，单位毫秒，默认：1500 
            mask: true, //是否显示透明蒙层，防止触摸穿透，默认：false 
            success:function(){
              setTimeout(function () {
                //要延时执行的代码
                wx.navigateBack({
                  delta: 0,
                })
              }, 2000) //延迟时间
            }
          })
        }
      })
    },
    toPage: function(){
      var that = this
      var params = {
        real_name: that.data.name,
        mobile: that.data.phone,
        province: that.data.province,
        city: that.data.city,
        district: that.data.county,
        address: that.data.addressDetail,
      }
      var addressNewList = that.data.addressNewList
      if(addressNewList.type ==="sender"){
        addressNewList.item = params
        wx.setStorageSync('senderAddressSelected', JSON.stringify(addressNewList))
      }else{
        addressNewList.item = params
        wx.setStorageSync('receiverAddressSelected', JSON.stringify(addressNewList))
      }
      postAddAddress(params).then(res => {
        console.log(res)
        if (res.code === 0) {
          wx.showToast({
            title: "添加成功",
            icon: 'success', //图标，支持"success"、"loading" 
            duration: 2000, //提示的延迟时间，单位毫秒，默认：1500 
            mask: true, //是否显示透明蒙层，防止触摸穿透，默认：false 
            success:function(){
              setTimeout(function () {
                //要延时执行的代码
                wx.navigateBack({
                  delta: 0,
                })
              }, 2000) //延迟时间
            }
          })
        }
      })
    },
    addAddress: function () {
      var that = this
      var setDefault = that.data.switchChecked ? "1" : "0"
      var params = {
        real_name: that.data.name,
        mobile: that.data.phone,
        province: that.data.province,
        city: that.data.city,
        district: that.data.county,
        address: that.data.addressDetail,
        is_default: setDefault
      }
      console.log(params)
      postAddAddress(params).then(res => {
        console.log(res)
        if (res.code === 0) {
          wx.showToast({
            title: "添加成功",
            icon: 'success', //图标，支持"success"、"loading" 
            duration: 2000, //提示的延迟时间，单位毫秒，默认：1500 
            mask: true, //是否显示透明蒙层，防止触摸穿透，默认：false 
            success:function(){
              setTimeout(function () {
                //要延时执行的代码
                wx.navigateBack({
                  delta: 0,
                })
              }, 2000) //延迟时间
            }
          })
        }
      })
    },
    updateValue(e) {
      let name = e.currentTarget.dataset.name;
      let nameMap = {}
      nameMap[name] = e.detail && e.detail.value
      this.setData(nameMap)
    }
  }
})