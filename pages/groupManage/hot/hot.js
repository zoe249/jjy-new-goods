// pages/groupManage/new/new.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    rows: 20,
    list: [],
    bannerList: [],
    noMore: false,
    emptyMsg: '暂无活动',
    showError: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getList();
    this.initPage();
  },

  getList() {
    let that = this;
    let {
      page,
      rows,
      list,
      noMore,
      showError
    } = that.data;
    UTIL.ajaxCommon(API.URL_ZB_QUERYPROMOTIONFORHOTSALEGOODS, {
      page,
      rows,
      entrance: 1,
      sectionType:2024
    }, {
      success: (res => {
        let ls = res._data || [];
        if  (ls.length<= rows){
          noMore = true
        }
        page++
        list = list.concat(ls);
        if(list.length == 0){
          showError = true
        }
        that.setData({
          list,
          page,
          noMore,
          showError
        })
      })
    })
  },
    /**
   * 商品列表跳转
   */
  jumpGoodsDetail(e) {
    let {
      item,
    } = e;
    if (e.detail.isComponent) {
      item = e.detail;
    }
    let {
      shareMemberId,
    } = this.data;
    let shopId = UTIL.getShopId();
    let {
      goodsId,
      proId
    } = item;
    let path = "/pages/groupManage/detail/detail" + "?&goodsId=" + goodsId + "&proId=" + proId + "&shopId=" + shopId;
    wx.navigateTo({
      url: path
    })
  },
  /**
   * 获取社区首页推荐数据
   */
  initPage() {

    let that = this;
    let {

      bannerList,
    } = that.data;
    let hasData = false;
    let emptyMsg = '当前门店暂无活动';
    // 推荐数据
    UTIL.ajaxCommon(API.URL_ZB_RECOMMEND_LIST, {
      channelType: 1896,
      centerShopId: 10000,
      entrance: 1
    }, {
      success: (res) => {
        if (res._code === API.SUCCESS_CODE && res._data) {
          let moduleList = res._data || [];
          if (moduleList && moduleList.length > 0) {
            for (let moduleItem of moduleList) {
              switch (moduleItem.sectionType) {
                case 1897:
                  break;
                case 1915:
                  moduleItem.newContentJson = JSON.parse(moduleItem.contentJson)
                  break;
                case 1914:
                  moduleItem.newContentJson = JSON.parse(moduleItem.contentJson)
                  break;
              }
              if (moduleItem.recommendList && moduleItem.recommendList.length > 0) {
                hasData = true;
                for (let item of moduleItem.recommendList) {
                  if (item.extendJson) {
                    item.extendJson = JSON.parse(item.extendJson)
                  }
                }
              }
              if (moduleItem.children) {
                for (let item of moduleItem.children) {
                  if (item.recommendList && item.recommendList.length > 0) {
                    hasData = true;
                    for (let subItem of item.recommendList) {
                      if (subItem.extendJson) {
                        subItem.extendJson = JSON.parse(subItem.extendJson)
                      }
                    }
                  }
                  if (moduleItem.sectionType == 1900) {
                    item.contentJson = JSON.parse(item.contentJson)
                  }
                  if (item.children) {
                    for (let subItem of item.children) {

                      if (subItem.recommendList && subItem.recommendList.length > 0) {
                        hasData = true;
                        for (let subSubItem of subItem.recommendList) {
                          if (subSubItem.extendJson) {
                            if (moduleItem.sectionType == 1900 && subSubItem.sectionType == 1227) {
                              subSubItem.extendJson = JSON.parse(subSubItem.extendJson)
                            } else {
                              subSubItem.extendJson = JSON.parse(subSubItem.extendJson)
                            }
                          }
                        }
                      }

                    }
                  }
                }
              }
              /** 广告位 */
              if (moduleItem.sectionType === 2024) {
                bannerList = moduleItem.recommendList
              }
            }

          }
          that.setData({
            bannerList,
          })
        }
      }
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  // onReachBottom: function () {
  //   this.getList();
  // }
})