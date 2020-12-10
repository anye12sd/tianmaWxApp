// pages/articleList/articleList.js
const {getArticleList} = require("../../http/api.js")
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
    background: [],
    autoplay: false,
    interval: 2000,
    duration: 500,
    currentSwiper: 0,
    articleChildrenList: [],
    activeView: 0,
    currentItem: {
      title: "",
      content: ""
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function(options){
      var that = this
      that.setData({
        'share_img': wx.getStorageSync('share_img')
      })
      that.getArticleDetail(options.id)
    },
    getArticleDetail: function(id){
      var that = this
      getArticleList(id).then(res => {
        console.log(res)
        if(res.code == 0){
          if(!res.data.length){
            wx.showToast({
              title: '暂无内容',
              icon: 'none',
              duration: 2000,
              mask: true,
              success: function () {
                setTimeout(function () {
                  //要延时执行的代码
                  wx.navigateBack({
                    delta: 0,
                  })
                }, 2000) //延迟时间
              }
            })
            return false
          }
          that.setData({
            articleChildrenList: res.data[0].children ? res.data[0].children : [],
            "currentItem.title": res.data[0].title,
            "currentItem.content": res.data[0].content.replace(/<img/gi, '<img style="max-width:100%;height:auto;float:left;display:block" '),
            background: res.data[0].cover,
          })
          console.log(that.data.currentItem.content)
        }else{
          wx.showToast({
            title: res.msg,
            icon: 'none'
          })
        }
      })
    },
    swiperChange: function (e) {
      this.setData({
        currentSwiper: e.detail.current
      })
    },
    toArticle: function(e){
      var that = this
      that.setData({
        activeView: e.currentTarget.dataset.activeindex
      })
      var id = e.currentTarget.dataset.id
      getArticleList(id).then(res => {
        console.log(res)
        if(res.code == 0){
          that.setData({
            articleChildrenList: res.data[0].children ? res.data[0].children : [],
            "currentItem.title": res.data[0].title,
            "currentItem.content": res.data[0].content,
            background: res.data[0].cover,
          })
        }else{
          wx.showToast({
            title: res.msg,
            icon: 'none'
          })
        }
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
