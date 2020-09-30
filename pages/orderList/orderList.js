// pages/addressBook/addressBook.js
const {
  getOrderList,
  putOrderList
} = require('../../http/api.js');
var orderList = [

]
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
    orderList,
    page: 1,
    status: "",
    searchValue: "",
    clientHight: "",
    totalPage: 0,
    allHeight: null, // 整个屏幕高度（包含不可见区域）
    clientHight: null, // 可见区域屏幕高度，不包含滚动条折叠不可见区域
    gap: null, // 第二次后者更后面计算整个高度的时候（包含不可见区域）会有误差，需要加上这个误差
    num: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function (options) {
      var that = this;
      that.setTitle(options.status)
      that.setData({
        status: options.status
      })
      // 获取可见区域高度
      wx.getSystemInfo({
        success: function (res) {
          that.setData({
            clientHight: res.windowHeight
          })
        },
      })
      that.getOrder()
    },
    setTitle: function (status) {
      switch (status) {
        case "1":
          wx.setNavigationBarTitle({
            title: '待确认询价'
          })
          break;
        case "2":
          wx.setNavigationBarTitle({
            title: '已确认询价'
          })
          break;
        case "3":
          wx.setNavigationBarTitle({
            title: '已撤销询价'
          })
          break;
      }
    },
    getOrder: function () {
      wx.showLoading({
        title: '加载中',
      })
      var that = this;
      var params = {
        status: that.data.status,
        page: that.data.page
      }
      getOrderList(params).then(res => {
        console.log(res)
        that.setData({
          orderList: that.data.orderList.concat(res.data.list),
          totalPage: res.data.total_page
        })
        that.pageScrollToBottom()
        wx.hideLoading()
      })
    },
    updateValue(e) {
      let nameMap = {}
      nameMap['searchValue'] = e.detail && e.detail.value
      this.setData(nameMap)
    },
    search(e) {
      var that = this
      console.log(e.detail)
      that.setData({
        page: 1
      })
      var params = {
        page: that.data.page,
        order_id: that.data.searchValue
      }
      getOrderList(params).then(res => {
        console.log(params, res)
        that.setData({
          orderList: res.data.list
        })
      })
    },
    // 获取屏幕总高度（包含不可见区域）
    pageScrollToBottom: function () {
      const that = this
      wx.createSelectorQuery().select('#orderList').boundingClientRect(function (rect) {
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
      if (that.data.allHeight - that.data.clientHight <= (e.scrollTop + 1)) { // 判断是否滚动动到底部
        console.log("到底了")
        if (!that.data.noMore) {
          const page = that.data.page + 1
          if (page > that.data.totalPage) {
            wx.showToast({
              title: '没有更多了',
              icon: 'none',
              duration: 2000, //提示的延迟时间，单位毫秒，默认：1500 
              mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
            })
            return false
          }
          console.log(page)
          that.setData({
            page: page
          })
          that.getOrder()
        }
      }
    },
    cancelOrder: function (e) {
      var that = this
      wx.showModal({
        title: '确定撤销订单？',
        success: function (res) {
          if (res.confirm) { //点击确定后
            var orderId = e.currentTarget.dataset.orderid
            var params = {
              order_id: orderId
            }
            putOrderList(orderId, params).then(res => {
              if (res.code == 0) {
                wx.showToast({
                  title: '撤销成功',
                  icon: 'success',
                })
                var index = e.currentTarget.dataset.index
                var orderList = that.data.orderList
                orderList.splice(index, 1); //截取指定的内容
                that.setData({ //重新渲染列表
                  orderList: orderList
                })
              }
            })
          }
        }
      })
    },
    toOrderDetail: function(e){
      var that = this
      var orderId = e.currentTarget.dataset.orderid
      wx.navigateTo({
        url: '../orderDetail/orderDetail?orderId=' + orderId,
      })
    }
  }
})