const {
  getCurrentPageCustom
} = require('../../utils/com')
const APP = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    sendCouponData: {
      type: Object,
      value: {}
    },
    sendVisible: {
      type: Boolean,
      value: false
    },
    sendData: {
      type: Object,
      value: {}
    }
  },
  observers: {
    'sendData': function (_sendData) {
      console.log(_sendData)
      this.setData({
        sendCouponData: _sendData
      })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    _sendComplete(e) {
      getCurrentPageCustom().then(pages => {
        pages.setData({
          sendVisible: false
        })
      })
      this.setData({
        sendVisible: false
      })
      this.triggerEvent('sendComplete')
    },
    getcoupon(e) {
      let detail = e.detail;
      if (detail.errcode === 'OK') {
        let sendResult = detail.send_coupon_result[0];
        if (sendResult && sendResult.code && sendResult.code !=='SUCCESS') {
          APP.showToast(sendResult.message || '同步卡包失败！')
        }
      } else {
        APP.showToast(detail.msg ||'同步卡包失败！')
      }
    },
    bindConfirm(e) {
      this._sendComplete()
    }
  }
})