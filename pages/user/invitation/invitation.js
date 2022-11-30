// pages/user/invitation/invitation.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    sectionId: '',
    formType: 1,
    channelType: 907,
    centerShopId: 10000,
    invitationData: {},
    t:+(new Date())
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu();
    let {sectionId} = options;

    if (!sectionId) {
      switch (API.DISTRIBUTE_ENVIROMENT) {
        case 'PROD':
          sectionId = 275;
          break;
        case 'PRE':
          sectionId = 275;
          break;
        default:
          sectionId = 275;
      }
    }

    this.setData({
      sectionId,
    });

    this.getActivityMsg();
  },

  getActivityMsg() {
    const { sectionId, formType, channelType,centerShopId } = this.data;
    UTIL.ajaxCommon(API.URL_RECOMMEND_LIST, {
      sectionId,
      formType,
      channelType,
      centerShopId
    }, {
      'success': (res) => {
        if(res._code == API.SUCCESS_CODE){
          for(let item of res._data[0].children){
            if(item.sectionType == 1739){
              if(item.recommendList && item.recommendList.length && item.recommendList[0].extendObj){
                this.setData({
                  invitationData: item.recommendList[0].extendObj
                });

                UTIL.imagePreloading(item.recommendList[0].extendObj.shareFriendImg)
              }
            }
          }
        } else {

        }
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
    const {from} = options;
    const {invitationData} = this.data;

    if(from == 'button'){
      return {
        'title': invitationData.shareFriendTitle,
        'path':`/${invitationData.urlXcx}`,
        'imageUrl': invitationData.shareFriendImg,
      }
    }
  }
})