// pages/form-input/formInput.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    dataList: Object,
    selectArray: {
      type: Array,
      observer: function (news, olds, path) {
        this.setData({
          selectIndex: 0
        })
      }
    },
    deliver: Object,
  },

  /**
   * 组件的初始数据
   */
  data: {
    stringInput: "",
    deliverAmount: "",
    radioChecked: false,
    selectIndex: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onReady: function() {
      console.log(3455)
    },
    onShow: function(){
      console.log(deliver)
    },
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
      let number = parseFloat(parseFloat(e.detail.value).toFixed(2))
      number = number ? number : 0
      var that = this
      that.setData({
        deliverAmount: number
      })
      this.triggerEvent('getValue', {sonParam: number})
    },
    setStringInput: function(e){
      let text = e.detail.value
      var that = this
      that.setData({
        stringInput: text
      })
      this.triggerEvent('getString', {sonParam: text})
    },
    amountChange: function(e){
      var that = this
      if(e.target.dataset.operate === 'add'){
        if(that.data.deliverAmount){
          that.setData({
            deliverAmount: parseFloat(parseFloat(that.data.deliverAmount += 1).toFixed(2))
          })
        }else{
          that.data.deliverAmount = 0
          that.setData({
            deliverAmount: parseFloat(parseFloat(that.data.deliverAmount += 1).toFixed(2))
          })
        }
      }else if(e.target.dataset.operate === 'sami'){
        // var amount = that.data.deliverAmount -= 1
        if(that.data.deliverAmount - 1 > 0){
          that.setData({
            deliverAmount: parseFloat(parseFloat(that.data.deliverAmount -= 1).toFixed(2))
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
