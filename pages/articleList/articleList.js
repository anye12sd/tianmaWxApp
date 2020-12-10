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
    articleList: [],
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
    onLoad: function(){
      var that = this;
      that.setData({
        'share_img': wx.getStorageSync('share_img')
      })
      that.data.articleList.length ? console.log(1) : that.getArticleList()
    },
    // onLoad: function(){
    //   var that = this
    //   that.getArticleList()
    // },
    getArticleList: function() {
      var that = this
      wx.showLoading({
        title: '加载中',
      })
      getArticleList("").then(res => {
        // console.log(res)
        if(res.code == 0){
          that.setData({
            articleList: res.data.list,
          })
          that.getArticleDetail(res.data.list[0].id)
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
    getArticleDetail: function(id){
      var that = this
      getArticleList(id).then(res => {
        // console.log(res)
        if(res.code == 0){
          that.setData({
            articleChildrenList: res.data[0].children ? res.data[0].children : [],
            "currentItem.title": res.data[0].title,
            "currentItem.content": res.data[0].content.replace(/<img/gi, '<img style="max-width:100%;height:auto;float:left;display:block;" ').replace(/<p/gi, '<p style="text-indent: 34px;text-align: justify;" '),
            background: res.data[0].cover,
          })
          wx.hideLoading()
        }else{
          wx.showToast({
            title: res.msg,
            icon: 'none'
          })
        }
      })
    },
    toArticle: function(e){
      var that = this
      that.setData({
        activeView: e.currentTarget.dataset.activeindex
      })
      var id = e.currentTarget.dataset.id
      getArticleList(id).then(res => {
        // console.log(res)
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
    toChildrenArticle: function(e){
      var id = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: '../article/article?id=' + id,
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
