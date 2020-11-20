const {
  request
} = require('./request.js');
// 基于业务封装的数据请求
module.exports = {
  getBannerList: () => {
    // 获取首页轮播图
    return request("/banner", "GET");
  },
  getCover: () => {
    // 获取主页广告图
    return request("/cover", "GET");
  },
  getLayoutList: () => {
    // 获取主页菜单
    return request("/layout", "GET");
  },
  login: (params) => {
    // 登录接口
    return request("/login", "POST", params);
  },
  bindPhone: (params) => {
    // 绑定手机
    return request("/phone", "POST", params);
  },
  getEmunList: (data) => {
    // 获取物流方式
    return request("/emun/"+ data, "GET");
  },
  getAddressList: (params) => {
    // 获取地址列表
    return request("/address", "GET", params);
  },
  postAddAddress: (params) => {
    // 添加新收货地址
    return request("/address/", "POST", params);
  },
  putEditAddress: (data, params) => {
    // 编辑收货地址
    return request("/address/" + data, "PUT", params);
  },
  getArticleList: (data) => {
    // 获取服务介绍列表
    return request("/article/" + data, "GET");
  },

  // 订单
  getOrderList: (params) => {
    // 获取订单列表
    return request("/order", "GET", params);
  },
  putOrderList: (data, params) => {
    // 撤掉订单
    return request("/order/" + data, "PUT", params);
  },
  postOrderInquiry: (data, params) => {
    // 查询订单单价
    return request("/inquiry/" + data, "POST", params);
  },
  getOrderDetail: (data) => {
    // 查询指定订单
    return request("/order/" + data, "GET");
  },
  postOrder: (data, params) => {
    // 下单
    return request("/orders/" + data, "POST", params);
  },

  getLocationList: (params) => {
    // 定位
    return request("/chinamap/", "GET", params);
  },

  postFeedback: (params) => {
    // 提交反馈
    return request("/feedback", "POST", params)
  }
}