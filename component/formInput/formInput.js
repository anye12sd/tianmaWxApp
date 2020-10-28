// pages/form-input/formInput.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    dataList: Object,
    selectArray: Array,
  },

  /**
   * 组件的初始数据
   */
  data: {
    deliverAmount: "",
    radioChecked: false,
    selectIndex: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindPickerChange: function(e) {
      console.log('picker发送选择改变，携带值为', e.detail.value)
      this.setData({
        selectIndex: e.detail.value
      })
      this.triggerEvent('getSelectValue', {sonParam: e.detail.value})
    },
    toggleRadioCheck: function(e) {
      var that = this
      this.setData({
        radioChecked: !that.data.radioChecked
      })
      this.triggerEvent('getRadioValue', {sonParam: that.data.radioChecked})
    },
    setDeliverAmount: function(e){
      this.setData({
        deliverAmount: parseInt(e.detail.value)
      })
      this.triggerEvent('getValue', {sonParam: e.detail.value})
    },
    amountChange: function(e){
      var that = this
      if(e.target.dataset.operate === 'add'){
        if(that.data.deliverAmount){
          that.setData({
            deliverAmount: that.data.deliverAmount += 1
          })
        }else{
          that.data.deliverAmount = 0
          that.setData({
            deliverAmount: that.data.deliverAmount += 1
          })
        }
      }else if(e.target.dataset.operate === 'sami'){
        // var amount = that.data.deliverAmount -= 1
        if(that.data.deliverAmount){
          that.setData({
            deliverAmount: that.data.deliverAmount -= 1
          })
        }else{
          // that.setData({
          //   deliverAmount: ""
          // })
          return false
        }
      }
      this.triggerEvent('getValue', {sonParam: that.data.deliverAmount})
    }
  }
})
