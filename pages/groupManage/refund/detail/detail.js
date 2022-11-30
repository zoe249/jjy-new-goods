// pages/refund/detail/detail.js
const UTIL = require('../../../../utils/util.js');
const API = require('../../../../utils/API.js');
import {
  modalResult
} from '../../../../templates/global/global.js';
let APP = getApp();
let noOnShow = false;
const $formateTimeShow = function(time_str) {
  let date = new Date(parseFloat(time_str));
  let y = date.getFullYear();
  let m = (date.getMonth() + 1);
  let d = date.getDate();
  let h = date.getHours();
  let min = date.getMinutes();
  let s = date.getSeconds();

  if (m < 10) {
    m = '0' + m;
  }
  if (h < 10) {
    h = '0' + h;
  }
  if (min < 10) {
    min = '0' + min;
  }
  if (s < 10) {
    s = '0' + s;
  }
  if (d < 10) {
    d = '0' + d;
  }
  return (y + '-' + m + '-' + d + " " + h + ":" + min + ":" + s)
};
const $price1 = function(time_str) {
  let time_str1 = (time_str + "").split(".");
  return time_str1[0]
};
const $price2 = function(time_str) {
  let time_str2 = (time_str + "").split(".");
  return time_str2.length > 1 && time_str2[1] != "0" && time_str2[1] != "00" ? "." + time_str2[1] : ''
};
/*const $APPLICATIONREASON_ALL=function(num) {
  return API.APPLICATIONREASON_ALL[num]||"其他"
};
const $ISNEEDPICKUP_JSON=function(num) {
  return API.ISNEEDPICKUP_JSON[num]||"其他"
};*/
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tab: 1, //切换的标签
    loadingHidden: true, //loading
    showErrorPage: false,
    errorPageMsg: '',
    popRefundLogistics: false,
    showWeightPop: false,
    customerReturnFreight: '',
    logisticsOddNumber: '',
    logisticsCompanyName: '请选择物流公司（必填）',
    logisticsCompanyValue: -1,
    logisticsCompanyNameNow: '请选择物流公司（必填）',
    logisticsCompanyValueNow: -1,
    canClick: true,
    showCancelRefund: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let newOptions = options || {};
    let refundInfoId = options.refundInfoId || '';
    this.setData({
      options: newOptions,
      refundInfoId: refundInfoId,
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  /*展示取消售后*/
  showCancelRefund: function() {
    this.setData({
      showCancelRefund: true,
    });
  },
  /*取消售后确定*/
  cancelRefundCancel: function() {
    this.setData({
      showCancelRefund: false,
    });
  },
  /*取消售后确定*/
  cancelRefundConfirm: function() {
    let that = this;
    let nickName = wx.getStorageSync('nickName');
    let {
      result,
      refundInfoId,
      canClick
    } = that.data;
    let cancelData = {
      memberName: result.orderType == 'OVERSEAS_ELECTION' ? nickName || result.userPhone : nickName,
      refundInfoId: refundInfoId
    };
    if (canClick) {
      that.setData({
        loadingHidden: false,
        canClick: false,
      });
      let url = result.orderType == 'OVERSEAS_ELECTION' ? API.URL_OVERSEASCUSTOMERSERVICE_CANCEL : API.URL_CUSTOMERSERVICE_CANCEL;
      UTIL.ajaxCommon(url, cancelData, {
        success(res) {
          if (res&&res._code == API.SUCCESS_CODE) {
            APP.showToast(res&&res._msg?res._msg: "取消成功");
            that.renderPage();
          } else {
            APP.showToast(res&&res._msg?res._msg:"取消失败");
          }
        },
        fail(res) {
          APP.showToast(res&&res._msg?res._msg:"取消失败");
        },
        complete() {
          that.setData({
            loadingHidden: true,
            canClick: true,
            showCancelRefund: false,
          });
        }
      });
    }
  },
  /*确认提交苛选提交物流信息的信息*/
  confirmSubmit: function() {
    let that = this;
    let {
      canClick,
      result,
      logisticsCompanyName,
      logisticsOddNumber,
      customerReturnFreight,
      logisticsCompanyValue
    } = that.data;
    if (canClick) {
      let saveSubmitData = {
        customerReturnFreight: customerReturnFreight, // 顾客回寄运费,单位元，保留两位小数【必填】 ,
        isNeedPickup: 1137, //物流发货-1137；送货至门店-1136；上门取件-1135；退款不退货-1191；异常批次订单-1188；客户未签收货物-1167）【必填】 ,
        logisticsCompanyName: logisticsCompanyName, //物流公司名称【必填】 ,
        logisticsOddNumber: logisticsOddNumber, //物流单号【必填】 ,
        memberName: result.userName, //会员昵称,有就填没有就不填 ,
        memberPhone: result.userPhone, //会员手机号【必填】 ,
        receiverAddress: result.receiverAddress, //供应商收货人地址【必填】 ,
        receiverName: result.receiverName, //供应商收货人名称【必填】 ,
        receiverPhone: result.receiverPhone, //供应商收货人手机号【必填】 ,
        refundInfoId: result.id, //退款申请主键ID【必填】,
        supplierId: result.supplierId, //供应商ID【必填】 ,
        supplierName: result.supplierName //供应商名称【必填】 ,
      };
      if (logisticsCompanyValue == -1) {
        APP.showToast("物流公司选择不能为空");
      } else if (!logisticsOddNumber) {
        APP.showToast("物流单号填写不能为空");
      } else if (!(/(^[1-9]\d*$)/.test(customerReturnFreight))) {
        APP.showToast("回寄运费填写不能为空");
      } else {
        saveSubmitData.logisticsCompanyName = logisticsCompanyName;
        saveSubmitData.customerReturnFreight = customerReturnFreight;
        saveSubmitData.logisticsOddNumber = logisticsOddNumber;
        that.setData({
          loadingHidden: false,
          canClick: false,
        });
        UTIL.ajaxCommon(API.URL_OVERSEASCUSTOMERSERVICE_SAVERETURNLOGISTICSINFO, saveSubmitData, {
          success(res) {
            if (res&&res._code == API.SUCCESS_CODE) {
              APP.showToast(res&&res._msg?res._msg: "提交成功");
              that.renderPage();
            } else {
              APP.showToast(res&&res._msg?res._msg:"提交失败");
            }
          },
          fail() {
            APP.showToast("网络请求失败，稍后再试");
          },
          complete() {
            that.setData({
              loadingHidden: true,
              canClick: true,
            });
          },
        });
      }
    } else {

    }
  },
  /*输入运费*/
  customerReturnFreight: function(event) {
    let {
      value
    } = event.detail;
    value = UTIL.filterEmoji(value);
    value = value.replace(/\s+/g, "");
    if (value.length == 1) {
      value = value.replace(/[^1-9]/g, 0);
      if (value == 0) {
        value = '';
      }
    } else {
      value = value.replace(/\D/g, '')
    }
    console.log(value);
    if (value > 100) {
      value = 100;
    }
    this.setData({
      customerReturnFreight: value
    });
  },
  /*输入物流单号*/
  logisticsOddNumber: function(event) {
    let {
      value
    } = event.detail;
    value = UTIL.filterEmoji(value);
    value = value.replace(/\s+/g, "");
    this.setData({
      logisticsOddNumber: value
    });
  },
  /*确认选择物流*/
  confirmSelectLogistics: function() {
    let that = this;
    this.setData({
      popRefundLogistics: false,
      logisticsCompanyName: that.data.logisticsCompanyNameNow,
      logisticsCompanyValue: that.data.logisticsCompanyValueNow,
    })
  },
  /*取消选择物流*/
  cancelSelectLogistics: function() {
    let that = this;
    this.setData({
      popRefundLogistics: false,
      logisticsCompanyNameNow: that.data.logisticsCompanyName,
      logisticsCompanyValueNow: that.data.logisticsCompanyValue,
    })
  },
  /*选择物流*/
  selectLogistics: function(event) {
    let logisticsCompanyValueNow = event.currentTarget.dataset.logisticsValue;
    let logisticsCompanyNameNow = event.currentTarget.dataset.logisticsText;
    this.setData({
      logisticsCompanyNameNow: logisticsCompanyNameNow,
      logisticsCompanyValueNow: logisticsCompanyValueNow,
    });

  },
  /*展示物流公司*/
  showRefundLogistics: function() {
    this.setData({
      popRefundLogistics: true,
    })
  },

  /*展示称重弹窗*/
  showWeightClick: function() {
    this.setData({
      showWeightPop: true,
    });
  },
  closeWeightClick: function() {
    this.setData({
      showWeightPop: false,
    });
  },
  renderPage: function() {
    let that = this;
    let {
      refundInfoId
    } = that.data;
    that.setData({
      loadingHidden: false,
    });
    let nickName = wx.getStorageSync('nickName');
    let mobile = wx.getStorageSync('mobile');
    UTIL.ajaxCommon(API.URL_CUSTOMERSERVICE_DETAILS, {
      refundInfoId: refundInfoId
    }, {
      success(res) {
        if (res&&res._code == API.SUCCESS_CODE) {
          let result = res._data;
          result.newAttachment = result.attachment && result.attachment.length > 0 ? result.attachment.split(",") || [] : [];
          result.supplierAnnexImg = result.supplierAnnex && result.supplierAnnex.length > 0 ? result.supplierAnnex.split(",") || [] : [];
          let logisticsArr = [];
          result.selectLogisticsList = logisticsArr;
          result.nickName = nickName;
          result.userPhone = result.userPhone;
          result.mobile = mobile;
          let refundGoodsTotalCount = 0;
          if (result.detailOutputList) {
            for (let i = 0; i < result.detailOutputList.length; i++) {
              refundGoodsTotalCount += result.detailOutputList[i].refundGoodsCount;
            }
          }
          result.refundGoodsTotalCount = refundGoodsTotalCount;
          result.formateCreateTime = $formateTimeShow(result.createTime);
          result.price1 = $price1(result.amountDue);
          result.price2 = $price2(result.amountDue);
          that.setData({
            showErrorPage: false,
            result: result,
          });
          if (result.orderType == 'OVERSEAS_ELECTION' && result.isLogisticsReturn == true) {
            that.setData({
              loadingHidden: false,
            });
            UTIL.ajaxCommon(API.URL_OVERSEASCUSTOMERSERVICE_GETLOGISTICSCOMPANY, {}, {
              success(res2) {
                if (res2&&res2._code == API.SUCCESS_CODE) {
                  let logisticsArr = res2._data || [];
                  let {
                    result
                  } = that.data;
                  result.selectLogisticsList = logisticsArr;
                  that.setData({
                    result: result
                  });
                } else {
                  that.setData({
                    showErrorPage: true,
                    errorPageMsg: res2&&res2._msg?res2._msg:'网络出错，请稍后再试',
                  });
                  APP.showToast(res2&&res2._msg?res2._msg:'网络出错，请稍后再试');
                }
              },
              fail(res2) {
                that.setData({
                  showErrorPage: true,
                  errorPageMsg: res2&&res2._msg?res2._msg:'网络出错，请稍后再试',
                });
                APP.showToast(res2&&res2._msg?res2._msg:'网络出错，请稍后再试');
              },
              complete() {
                that.setData({
                  loadingHidden: true,
                });
              }
            });
          }
        } else {
          that.setData({
            showErrorPage: true,
            errorPageMsg: res&&res._msg?res._msg:'网络出错，请稍后再试',
          });
          APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
        }
      },
      fail(res) {
        that.setData({
          showErrorPage: true,
          errorPageMsg: res._msg,
        });
        APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
      },
      complete() {
        that.setData({
          loadingHidden: true,
        });
      },
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    if (noOnShow) {
      noOnShow = false;
      return;
    }
    that.renderPage();
  },
  /*切换tab*/
  switchNav: function(event) {
    let {
      tab
    } = event.currentTarget.dataset;
    this.setData({
      tab: tab,
    });
  },
  /*图片的预览查看大图*/
  previewImage: function(event) {
    let that = this;
    noOnShow = true;
    let {
      urlArr,
      url
    } = event.currentTarget.dataset;
    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls: urlArr // 需要预览的图片http链接列表
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },
});