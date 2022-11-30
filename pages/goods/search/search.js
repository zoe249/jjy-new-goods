// pages/goods/search/search.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
import { modalResult } from '../../../templates/global/global.js';
let currentLogId = 143;//埋点页面id
const APP = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    focusClass: 'focusClass',
    value: '',
    placeholderValue: '请您输入商品名称',
    hotList: [],
    historyList: [],
    formType: 0,
    channelType: 173,
    currentLogId:143
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { formType=0,cGroupType,isKx } = options;
    let { channelType } = this.data;

    if(formType == 1 || formType == 2){
      channelType = 1111;
    }

    this.setData({
      formType,
      channelType,
      cGroupType,
      isKx:isKx?isKx:0
    })
    
    this.getHotData();
    this.getHistoryData();
  },
  onshow(){
    UTIL.jjyBILog({
      e: 'page_view', //事件代码
      currentLogId: currentLogId
    });
  },
  onHide() {
    this.setData({
      focusClass: '',
    });
  },

  // 输入框获得焦点
  searchFocus(event) {
    this.setData({
      focusClass: 'focus',
    });
  },

  // 输入框值发生变化
  searchInput(event) {
    const { value } = event.detail;
    this.setData({
      value,
    });
  },

  // 输入框失去焦点
  searchBlur(event) {
    this.setData({
      focusClass: '',
    });
  },

  // 清空输入框
  clearSearch() {
    this.setData({
      value: '',
      focusClass: 'focusClass',
    })
  },

  // 点击完成
  doSearch(event) {
    let historyList = wx.getStorageSync('historyList');
    let { formType, placeholderValue,cGroupType,isKx } = this.data;
    let value = event.currentTarget.dataset.item || event.detail.value.trim() || placeholderValue;

    /**if (value == '') {
      APP.showToast('搜索内容不能为空');
      return false;
    }*/

    if (value != '请您输入商品名称'){
      if (historyList) {
        historyList = JSON.parse(historyList);
      } else {
        historyList = [];
      }

      historyList.unshift(value);

      historyList = UTIL.uniqueArray(historyList);

      if (historyList.length > 10) {
        historyList.splice(10, historyList.length);
      }

      this.setData({
        historyList,
      })

      wx.setStorage({
        key: 'historyList',
        data: JSON.stringify(historyList),
      });
      UTIL.jjyBILog({
        e: 'click', //事件代码
        oi: 394, //点击对象type，Excel表
        obi: value
      });
      UTIL.jjyBILog({
        e: 'page_end', //事件代码
      });
      wx.navigateTo({
        url: `/pages/goods/searchList/searchList?formType=${formType}&isKx=${isKx}&cGroupType=${cGroupType}&goodsName=${encodeURIComponent(value)}`,
      });
    } else {
      UTIL.jjyBILog({
        e: 'click', //事件代码
        oi: 394, //点击对象type，Excel表
        obi:''
      });
      UTIL.jjyBILog({
        e: 'page_end', //事件代码
      });
      wx.navigateTo({
        url: `/pages/goods/searchList/searchList?formType=${formType}&isKx=${isKx}&cGroupType=${cGroupType}&goodsName=`,
      });
    }
  },

  goBack() {
    wx.navigateBack({
      delta: 1
    });
  },

  // 获取热搜数据
  getHotData() {
    const { channelType } = this.data;
    UTIL.ajaxCommon(API.URL_RECOMMEND_LIST, {
      sectionType: 174,
      channelType,
    }, {
        success: (res) => {
          if (res&&res._code == API.SUCCESS_CODE) {
            if (res._data && res._data.length) {
              let hotList = [];
              for (let hotItem of res._data[0].recommendList) {
                hotList.push(...hotItem.recommendTitle.split(/\s+/));
              }

              if (res._data[1] && res._data[1].recommendList && res._data[1].recommendList.length){
                this.setData({
                  'placeholderValue': res._data[1].recommendList[0].recommendTitle
                })
              }
              if (hotList.length > 0){
                UTIL.jjyBILog({
                  e: 'click', //事件代码
                  oi: 395, //点击对象type，Excel表
                  obi: hotList
                });
              }
              this.setData({
                hotList,
              });
            }
          }
        },
      });
  },

  // 获取历史记录
  getHistoryData() {
    wx.getStorage({
      key: 'historyList',
      success: (res) => {
        if (res.errMsg == 'getStorage:ok') {
          const historyList = JSON.parse(res.data);
          if (historyList.length > 0){
            UTIL.jjyBILog({
              e: 'click', //事件代码
              oi: 396, //点击对象type，Excel表
              obi: historyList
            });
          }
          this.setData({
            historyList,
          });
        }
      },
    });
  },

  modalCallback(event) {
    if(modalResult(event)){
      this.setData({
        historyList: [],
      });

      wx.removeStorageSync('historyList');
    }
  },

  // 清除历史记录
  clearHistory() {
    APP.showModal({
      content: '是否清除历史记录？',
    });

    /*wx.showModal({
      title: '',
      content: '是否清除历史记录？',
      confirmColor: '#FF4752',
      success: (res) => {
        if (res.confirm && !res.cancel) {
          this.setData({
            historyList: [],
          });

          wx.removeStorageSync('historyList');
        }
      },
    })*/
  }
})