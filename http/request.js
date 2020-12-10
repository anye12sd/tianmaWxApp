const {
  baseUrl
} = require('./env.js').prod
const app = getApp();
// 专用域名
module.exports = {
  // 二次封装wx.request 
  // {String }url:请求的接口地址 
  // {String} method:请求方式 GET,POST.... 
  // {Object} data:要传递的参数 
  // { boolean }isSubDomain:表示是否添加二级子域名 true代表添加,false代表不添加 

  //二次封装wx.request
  request: (url, method, data) => {
    const token = wx.getStorageSync('token') ? wx.getStorageSync('token') : ""
    return new Promise((resolve, reject) => {
      console.log('url请求', baseUrl, url);
      if(url != '/share_img' && url != '/login' && url != '/layout' && url !='/cover' && url !='/banner' && url.indexOf('/article/') == '-1' && !token){
        wx.showToast({
          title: "请先登录",
          icon: 'none', //图标，支持"success"、"loading" 
          duration: 2000, //提示的延迟时间，单位毫秒，默认：1500 
          mask: true, //是否显示透明蒙层，防止触摸穿透，默认：false 
          success: function () {
            setTimeout(function () {
              //要延时执行的代码
              wx.redirectTo({
                url: '../login/login'
              })
            }, 1000) //延迟时间
          }
        })
        return false
      }
      // 拼接
      let _url = `${baseUrl}${url}`;
      // console.log(_url)
      wx.request({
        url: _url,
        data: data,
        method: method,
        timeout: 5000,
        header: {
          'content-type': ' application/x-www-form-urlencoded',
          'authorization': token
        },
        success: res => {
          // console.log('获取数据',res)
          // let {code}=res.data; 
          resolve(res.data)
        },
        fail: err => {
          wx.showToast({
            title: "请求超时",
            icon: 'none', //图标，支持"success"、"loading" 
            duration: 3000, //提示的延迟时间，单位毫秒，默认：1500 
            mask: true, //是否显示透明蒙层，防止触摸穿透，默认：false 
          })
          reject(err)
        }
      })
    })
  }
}