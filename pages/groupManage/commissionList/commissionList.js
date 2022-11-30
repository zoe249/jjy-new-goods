// pages/groupManage/customerOrder/customerOrder.js
import * as UTIL from '../../../utils/util';
import * as API from '../../../utils/API';
const APP = getApp();
const $formateTel = (tel, start1 = 3, start2 = 7) => {
  let str = '';
  if (tel){
    str =tel.substring(0, start1) + "****" + tel.substring(start2);
  }else{
    str ='无电话号'
  }
  return str
};
//佣金状态
const $brokerageStatusStr = (brokerageStatus) => {
  let str = '';
  let s = brokerageStatus + '';
  // status (integer, optional): 提现状态：0:已提交;1:提现中;2:已完成;3:提现失败 / 佣金状态：4:未结算；5：已结算；6：已售后
  switch (s) {
    case '0':
      str = '已提交'
      break;
    case '1':
      str = '提现中'
      break;
    case '2':
      str = '已提现'
      break;
    case '4':
      str = '未结算'
      break;
    case '5':
      str = '已结算'
      break;
    case '6':
      str = '已售后'
      break;
    default:
      str = ''
  }
  return str
};
const $cashStatusNameStr = (shippingType) => {
  let str = '';
  let s = shippingType + '';
  // shippingType(integer, optional): 配送方式或用餐方式: 110 - 送货上门, 111 - 自提, 112 - 外卖, 113 - 堂食, 540 - B2C物流配送, 1022 - 免税仓发货，1023 - 海外直邮，1024 - 国内发货,
  switch (s) {
    case '110':
      str = '配送'
      break;
    case '111':
      str = '自提'
      break;
    case '112':
      str = '外卖'
      break;
    case '113':
      str = '堂食'
      break;
    case '540':
      str = '配送'
      break;
    case '1024':
      str = '配送'
      break;
    case '1023':
      str = '配送'
      break;
    case '1022':
      str = '配送'
      break;
    default:
      str = ''
  }
  return str
}
const $formateTimeShow = (time_str) => {
  var date = new Date(parseFloat(time_str));
  var y = date.getFullYear();
  var m = (date.getMonth() + 1);
  var d = date.getDate();
  var h = date.getHours();
  var min = date.getMinutes();
  var s = date.getSeconds();
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
  return (y + '/' + m + '/' + d + " " + h + ":" + min + ":" + s)
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    showError: false,
    emptyMsg: '',
    globalLoading: false,
    page: 1,
    haveNext: true,
    rows: 20,
    orderNum: 0,
    groupfansUserInfo: {},
    from:'',
    fromListType:'',//列表类型，今日收入明细：today，累计收入明细：total,我的佣金明细：my
    commissionMemberType:'',//自提点，合伙人
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
      this.setData({
        fromListType: options.fromListType || wx.getStorageSync('commissionFromListType')||'',
        commissionMemberType: options.commissionMemberType || wx.getStorageSync('commissionMemberType') || '',
        listBiztype:options.listBiztype || wx.getStorageSync('listBiztype') || ''
      });
      let titleName='';
      if (options && options.fromListType == 'total' || wx.getStorageSync('commissionFromListType') =='total'){
        titleName ='累计收入明细';
      } else if (options && options.fromListType == 'today' || wx.getStorageSync('commissionFromListType') == 'today'){
        titleName = '今日收入明细';
      } else if (options && options.fromListType == 'my' || wx.getStorageSync('commissionFromListType') == 'my'){
        titleName = '我的佣金明细';
      }
      wx.setNavigationBarTitle({
        title: titleName,
      }); 
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    this.reloadPage();

  },
  reloadPage: function() {
    let that = this;
    let {
      page,
      haveNext,
      rows,
      list,
      listBiztype
    } = that.data;
    let fromListType=that.data.fromListType || wx.getStorageSync('commissionFromListType') || '';
    let commissionMemberType = that.data.commissionMemberType || wx.getStorageSync('commissionMemberType') || '';
    let groupfansUserInfo = wx.getStorageSync('groupfansUserInfo');
    let data = {
      page: page,
      rows: rows,
      // shopId: APP.globalData.groupShopInfo.shopId,
      // warehouseId: APP.globalData.groupShopInfo.warehouseId,
      // centerShopId: APP.globalData.groupShopInfo.centerShopId,
      // centerWarehouseId: APP.globalData.groupShopInfo.centerWarehouseId
      brokerageType:commissionMemberType,
      bizType:listBiztype
    }
    that.setData({
      globalLoading: true,
    });
    let url = API.URL_ZB_BROKERAGE_COUNTBROKERAGELIST;
    if(fromListType=='today'){
      url = API.URL_ZB_BROKERAGE_TODAYBROKERAGELIST;
    }else if(fromListType=='total'){
      url = API.URL_ZB_BROKERAGE_COUNTBROKERAGELIST;
    }else if(fromListType=='my'){
      url = API.URL_ZB_BROKERAGE_MYBROKERAGELIST;
    }     
    UTIL.ajaxCommon(url, data, {
      "success": (res) => {
        if (res && res._code == API.SUCCESS_CODE) {
          if (res._data.length > 0) {
            for (let i = 0; i < res._data.length; i++) {
              if (res._data[i].createTime) {
                res._data[i].createTimeStr = $formateTimeShow(res._data[i].createTime);
              }
              res._data[i].statusStr = $brokerageStatusStr(res._data[i].status);
              if (res._data[i].memberTel && commissionMemberType==4){
                res._data[i].newMemberTel = $formateTel(res._data[i].memberTel);
              }
              //res._data[i].statusStr = $cashStatusNameStr(res._data[i].orderStatus);
            }
          }
          if (page == 1) {
            list = res._data;
          } else {
            list = list.concat(res._data);
          }
          if (list.length > 0) {
            if (res._data.length ==rows) {
              haveNext = true;
            } else {
              haveNext = false;
            }
          } else {
            haveNext = false;
          }
          that.setData({
            haveNext: haveNext,
            list: list,
            showError: page == 1 && list.length == 0 ? true : false,
            emptyMsg: page == 1 && list.length == 0 ? '暂无数据' : '',
            showMore: !haveNext && list.length > 0 ? true : false
          });
        } else {
          that.setData({
            list: list,
            showError: page == 1 && list.length == 0 ? true : false,
            emptyMsg: page == 1 ? (res&&res._msg?res._msg:"网络请求失败") : '',
            showMore: false,
            page: page == 1 ? 1 : page - 1,
          });
          APP.showToast(res&&res._msg?res._msg:"网络请求失败");
        }
      },
      fail(res) {
        that.setData({
          list: list,
          showError: page == 1 && list.length == 0 ? true : false,
          emptyMsg: page == 1 ? (res&&res._msg?res._msg:"网络请求失败") : '',
          showMore: false,
          page: page == 1 ? 1 : page - 1,
        });
        APP.showToast(res._msg || "网络请求失败");
      },
      complete() {
        that.setData({
          globalLoading: false,
        });
      }
    });
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
    let that = this;
    let {
      page,
      haveNext
    } = that.data;
    if (haveNext) {
      that.setData({
        page: ++page,
      });
      that.reloadPage();
    }
  },
})