// pages/ad/ad.js
const {
  getCover
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
    img:[],
    countDown: "",
    timer: "",
    autoplay: false,
    duration: 500,
    currentSwiper: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function(){
      var that = this
      that.getCover()
    },
    getCover(){
      var that = this
      getCover().then(res => {
        console.log(res)
        if (res.code === 0) {
          that.setData({
            img: res.data.list,
            countDown: res.data.list[0].count_down
          })
          that.countDown()
        }
      })
    },
    swiperChange: function (e) {
      this.setData({
        currentSwiper: e.detail.current
      })
    },
    countDown: function () {
      let that = this;
      let countDown = that.data.countDown;
      that.setData({
        timer: setInterval(function () {
          countDown--;
          that.setData({
            countDown: countDown
          })
          if (countDown == 0) {
            clearInterval(that.data.timer);
            wx.switchTab({
              url: '../index/index',
            })
          }
        }, 1000)
      })
    },
    toIndex: function(){
      var that = this
      clearInterval(that.data.timer);
      wx.switchTab({
        url: '../index/index',
      })
    }
  }
})
