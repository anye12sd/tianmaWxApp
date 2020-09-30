// pages/feedback/feedback.js
const {
  postFeedback
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
    textareaValue: ""
  },

  /**
   * 组件的方法列表
   */
  methods: {
    updateValue(e) {
      let name = e.currentTarget.dataset.name;
      let nameMap = {}
      nameMap[name] = e.detail && e.detail.value
      this.setData(nameMap)
    },
    saveEdit: function () {
      var that = this
      if (!that.data.textareaValue) {
        wx.showToast({
          title: "请输入内容",
          icon: 'none', //图标，支持"success"、"loading" 
          duration: 2000, //提示的延迟时间，单位毫秒，默认：1500 
          mask: true, //是否显示透明蒙层，防止触摸穿透，默认：false 
        })
        return false
      }
      var params = {
        "content": that.data.textareaValue
      }
      wx.showLoading({
        title: '提交中',
      })
      postFeedback(params).then(res => {
        console.log(res)
        if (res.code === 0) {
          wx.showToast({
            title: "提交成功",
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
    }
  }
})