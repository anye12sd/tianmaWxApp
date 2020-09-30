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
            "currentItem.content": res.data[0].content,
          })
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
        console.log(res)
        if(res.code == 0){
          that.setData({
            articleChildrenList: res.data[0].children ? res.data[0].children : [],
            "currentItem.title": res.data[0].title,
            "currentItem.content": res.data[0].content,
          })
        }else{
          wx.showToast({
            title: res.msg,
            icon: 'none'
          })
        }
      })
    },
  }
})
