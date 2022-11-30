import * as UTIL from '../../../utils/util';
import * as API from '../../../utils/API';
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageSize:40,
    list: [],
    page: 1,
    emptyObj: {
      emptyMsg: '暂无积分消费记录！',
    },
    recordeType:1,
    otherMes: '',
    noMore:false
  },
  jumpDocument(e){
    var mod = e.currentTarget.dataset.mod
    wx.navigateTo({
      url: "/pages/documents/documents?mod="+mod,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
   /**
    * 获取用户信息
    */
   getJJYmemberInfo(callback) {
     let self = this;
    UTIL.ajaxCommon(API.URL_MEMBER_JJYMEMBERINFO, {}, {
      success: (res) => {
        if (res._code == API.SUCCESS_CODE) {
          self.setData({
            account: res._data.account
          })
        }
      },
      timeout: 50000
    })
  },
  /**
   * 获取积分数据
   */
  getIntegralData(){
    var that = this;
    var {page} = that.data;
    var result = UTIL.ajaxCommon(API.URL_MEMBER_JJYSCOREINFO, {page: page},
      {
        "success": function (res) {
          if (res._code == API.SUCCESS_CODE) {
            //@TODO
            // res._data = [{amount:12  ,//(string, optional): 消费金额
            //   consDate:'2019-02-02' ,//(string, optional): 时间 
            //   integralVal:40,// (string, optional): 本次变动积分数 
            //   memo:'类型',//(string, optional): 积分类型
            //   storeName:'门店名称' ,//(string, optional): 门店名称 
            //   totalIntegral:'' //(string, optional): 总积分
            // },
            // {amount:12  ,//(string, optional): 消费金额
            //   consDate:'2019-02-02' ,//(string, optional): 时间 
            //   integralVal:40,// (string, optional): 本次变动积分数 
            //   memo:'类型',//(string, optional): 积分类型
            //   storeName:'门店名称' ,//(string, optional): 门店名称 
            //   totalIntegral:'' //(string, optional): 总积分
            // }
            // ]
            if (page == 1 && res._data.length == 0){
              that.setData({
                otherMes: 'empty',
              })
            } else {
              that.setData({
                otherMes: ''
              })
            }

            let resList = res._data;
            let purchaseList = [];
            for (let resItem of resList) {
              let purchaseItem = {};
              purchaseItem.purchaseTitle = resItem.memo;
              purchaseItem.purchaseDate = resItem.consDate;
              purchaseItem.purchaseVal = resItem.integralVal;
              purchaseList.push(purchaseItem);
            }
            that.setData({
              list: purchaseList
            });
            // 没有更多了
            if (res._data.length < that.data.pageSize) {
              that.setData({
                noMore: true
              })
            }
          } else if (res._code == '001007') {
            that.setData({
              loginFlag: 0
            });
            wx.setStorageSync('loginFlag', 0);
            APP.showToast('登录信息失效，请您重新登录');
          }
        }
      }
    );
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getJJYmemberInfo();
    this.getIntegralData();
  },



  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var page = this.data.page + 1;
    this.setData({
      page: page
    })
    this.getIntegralData();
  }
})