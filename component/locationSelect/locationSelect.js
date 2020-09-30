// component/locationSelect/locationSelect.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    dataList: Object,
    startArray: Array,
    endArray: Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    startIndex: 0,
    endIndex: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindStartPickerChange: function(e) {
      console.log('picker发送选择改变，携带值为', e.detail.value)
      this.setData({
        startIndex: e.detail.value
      })
      this.triggerEvent('getStartSelectValue', {sonParam: e.detail.value})
    },
    bindEndPickerChange: function(e) {
      console.log('picker发送选择改变，携带值为', e.detail.value)
      this.setData({
        endIndex: e.detail.value
      })
      this.triggerEvent('getEndSelectValue', {sonParam: e.detail.value})
    },
  }
})
