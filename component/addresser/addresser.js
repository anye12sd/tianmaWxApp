// component/addresser/addresser.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    addressList: Object,
    showAddressSelect: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    showAddressSelect: true
  },

  /**
   * 组件的方法列表
   */
  methods: {
    addressSelect: function(e){
      var type = e.currentTarget.dataset.type
      // var url = getCurrentPages()[getCurrentPages().length - 1].route.slice(6)
      // console.log(getCurrentPages(),url)
      // var selectParams = {type: type, url: url}
      var selectParams = {type: type}
      wx.setStorageSync('AddressSelect', JSON.stringify(selectParams))
      wx.navigateTo({
        url: '../addressBook/addressBook'
      })
    },
    toCreateAddress: function(e){
      var type = e.currentTarget.dataset.type
      var selectParams = {'type': type, 'addressNew': true}
      wx.setStorageSync('addressNew', JSON.stringify(selectParams))
      //无下列代码会出现网络货运-添加地址返回后地址栏为空的bug
      wx.setStorageSync('AddressSelect', JSON.stringify(selectParams))
      wx.navigateTo({
        url: '../addressEdit/addressEdit'
      })
    }
  }
})
