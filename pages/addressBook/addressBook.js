// pages/addressBook/addressBook.js
const {
  getAddressList
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
    addressList: [],
    freshFlag: true,
    searchValue: "",
    page: 1,
    clientHight: "",
    totalPage: 0,
    allHeight: null, // 整个屏幕高度（包含不可见区域）
    clientHight: null, // 可见区域屏幕高度，不包含滚动条折叠不可见区域
    noMore: false, // 没有更多了
    gap: null, // 第二次后者更后面计算整个高度的时候（包含不可见区域）会有误差，需要加上这个误差
    num: 0
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
      that.setData({
        addressList: [],
        page: 1,
      })
      that.getList()
      that.pageScrollToBottom()
    },
    getList: function () {
      wx.showLoading({
        title: '加载中',
      })
      var that = this
      var params = {
        page: that.data.page,
        key_words: that.data.searchValue
      }
      // console.log(params)
      getAddressList(params).then(res => {
        // console.log(res)
        if (res.code === 0) {
          that.setData({
            addressList: that.data.addressList.concat(res.data.list),
            totalPage: res.data.total_page,
            freshFlag: true
          })
          if(res.data.total == 0){
            wx.showToast({
              title: '暂无可用地址，快去添加吧',
              icon: 'none',
              duration: 2000, //提示的延迟时间，单位毫秒，默认：1500 
              mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
            })
            return false
          }
          that.pageScrollToBottom()
          wx.hideLoading()
        }
      })
    },
    toEditAddress: function (e) {
      // console.log(e.currentTarget.dataset.item)
      var item = e.currentTarget.dataset.item || ""
      if (item) {
        item.showAddress = true
        item = JSON.stringify(item)
      }
      wx.navigateTo({
        url: '../addressEdit/addressEdit?item=' + item,
      })
    },
    chooseAddress(e) {
      var selectFlag = wx.getStorageSync('AddressSelect')
      if (selectFlag) {
        selectFlag = JSON.parse(selectFlag)
        var item = e.currentTarget.dataset.item || ""
        if (selectFlag.type === "sender") {
          selectFlag.item = item
          wx.setStorageSync('senderAddressSelected', JSON.stringify(selectFlag))
        } else {
          selectFlag.item = item
          wx.setStorageSync('receiverAddressSelected', JSON.stringify(selectFlag))
        }
        wx.navigateBack({
          delta: 0,
        })
      }
    },
    updateValue(e) {
      let nameMap = {}
      nameMap['searchValue'] = e.detail && e.detail.value
      this.setData(nameMap)
    },
    search(e) {
      var that = this
      // console.log(e.detail)
      that.setData({
        page: 1,
      })
      var params = {
        page: that.data.page,
        key_words: that.data.searchValue
      }
      getAddressList(params).then(res => {
        that.setData({
          addressList: res.data.list
        })
      })
    },
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
      if (that.data.allHeight - that.data.clientHight <= (e.scrollTop - 0)) { // 判断是否滚动动到底部
        // console.log("到底了")
        if (!that.data.noMore && that.data.freshFlag) {
          const page = that.data.page + 1
          if (page > that.data.totalPage) {
            wx.showToast({
              title: '已经到底了',
              icon: 'none'
            })
            // that.setData({
            //   noMore: true
            // })
            return false
          }
          // console.log(page)
          that.setData({
            isMore: true,
            page: page,
            freshFlag: false
          })
          that.getList()
        }
      }
    },
  }
})