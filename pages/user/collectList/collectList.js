import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
import * as $ from '../../AA-RefactorProject/common/js/js.js';
import {
  modalResult
} from '../../../templates/global/global.js';
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    $:$,
    list:[],
    page:1,
    haveNextPage:true,
    rows:10,
    showNoMore:false,
    showError:false,
    emptyMsg:'稍后再试',
    cancelItem:{},
    tabIndex:1,
    collectionData:[],
    noScrollX:0,
  },
  onLoad: function (options) {
   
  },

  onShow() {
    let that=this;
    that.initList()
    this.getCollectionList()
  },
  getCollectionList(){
    let memberId = wx.getStorageSync('memberId')
    let shopAttribute = wx.getStorageSync('shopAttribute')
    let url = shopAttribute==1?API.COLLECTION_LIST:API.COLLECTION_LIST_ZB
    UTIL.ajaxCommon(url, {
      memberId,
      page:1,
      rows:100000,
      entrance:shopAttribute==1?'0':'1'
    }, {
        success: (res) => {
          let data = res._data
          data.forEach(item=>{
            if(item.type==603){
              console.log(item)
              let smallTitle=''
              if(item.material&&item.material.master){
                item.material.master.forEach((item1,index1)=>{
                  if(index1==0){
                    smallTitle = smallTitle+item1.name
                  }else{
                    smallTitle = smallTitle+','+item1.name
                  }
                })
              }
              item.smallTitle = smallTitle
            }
          })
          this.setData({collectionData:data})
        }
      });
  },
  selectTab(e){
    let index = e.currentTarget.dataset.index
    this.setData({tabIndex:index})
  },
  delCollect(e){
    let data=e.currentTarget.dataset.item;
    let cancelItem={
      shopId:data.shopId,
      skuId: data.skuId,
    };
    let modalData = {
      showFlag: true,
      content: "确定取消该收藏吗？",
      showCancel: true,
      "cancelText": '关闭'
    };
    this.setData({
      cancelItem,
      modalData
    });
  },
  deleteContentCollection(e){
    let that = this
    let {item} = e.currentTarget.dataset
    let shopAttribute = wx.getStorageSync('shopAttribute')
    let url = shopAttribute == 1?API.URL_COLLECT_CANCEL:API.URL_ZB_COLLECT_CANCEL
    let collectionData = this.data.collectionData
    console.log(e)
    wx.showModal({
      // 对话框的标题(选填)
      title: '取消收藏',
      // 对话框的内容(选填)
      content: '是否要取消该收藏',
      // 右边按钮的文字内容(选填，默认确定)
      confirmText: "确定",
      // 右边按钮的文字颜色(选填，默认#3cc51f)
      confirmColor: "#ff0000",
      success: function(res) {
        if (res.confirm) { // 点击了确定按钮
          UTIL.ajaxCommon(url, {
            "entrance": shopAttribute==1?'0':'1',
            "dataId": item.contentId,
            'dataType': item.type == 603?728:238
          }, {
            success: (res) => {
              if (res._code == API.SUCCESS_CODE) {
                collectionData.forEach(item1=>{
                  if(item1.contentId == item.contentId ){
                    item1.xmove = 0
                  }
                })
                that.setData({collectionData})
                $.ti_shi(res._msg)
                that.getCollectionList()
              } else {
                $.ti_shi(res._msg)
              }
            },
            fail: (res) => {
              $.ti_shi(res._msg)
            }
          });
        }
      }
    })
  },
  goToInfo(e){
    let {item} = e.currentTarget.dataset
    let {contentId} = item
    let shopAttribute =wx.getStorageSync('shopAttribute')
    if(item.type==603){
      wx.navigateTo({
        url:`/pages/AA-RefactorProject/pagesSubcontract/RecipeDetails/index?contentId=${contentId}&entrance=${shopAttribute==1?0:1}`,
      });
    }else{
      wx.navigateTo({
        url:`/pages/AA-RefactorProject/pagesSubcontract/ArticleDetails/index?contentId=${contentId}&entrance=${shopAttribute==1?0:1}`,
      });
    }
  },
  modalCallback(event) {
    let that = this;
    if (modalResult(event)) {
      let {cancelItem,list}=that.data;
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_COLLECT_CANCEL, {
        dataId: cancelItem.skuId,
        dataType: 236,
        shopId: cancelItem.shopId,
      }, {
          success: (res) => {
            if (res&&res._code == API.SUCCESS_CODE) {
              for (let i = 0; i < list.length;i++){
                if (list[i].shopId == cancelItem.shopId && list[i].skuId == cancelItem.skuId){
                  list[i].hideDelCollect=true;
                  break;
                }
              }
              that.setData({list});
              let showError = true
              list.forEach(item=>{
                if(!item.hideDelCollect){
                  showError = false
                }
              })
              this.setData({showError});
              APP.showToast('取消收藏成功');
            } else {
              APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
            }
            that.setData({
              "modalData": {},
              "cancelItem": {},
            });
            APP.hideGlobalLoading();
          },
          fail: (res) => {
            that.setData({
              "modalData": {},
              "cancelItem": {},
            });
            APP.hideGlobalLoading();
            APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
          }
        });
    } else {
      that.setData({
        "modalData": {},
        "cancelItem": {},
      });
    }
  },
  initList(){
    let that = this;
    let { page, list, haveNextPage, rows, showNoMore, showError, emptyMsg} = that.data;
    let inData = {
      latitude: wx.getStorageSync('latitude'),
      longitude: wx.getStorageSync('longitude'),
      page: 1,
      rows: rows,
    }
    if (haveNextPage) {
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_COLLECT_GOODSLIST, inData,
        {
          'complete': function (res) {
            APP.hideGlobalLoading();
            if (res&&res._code == API.SUCCESS_CODE) {
              if (res._data && res._data.length > 0) {
                list=res._data;
              }
              if (res._data && res._data.length == rows) {
                haveNextPage = true;
                showNoMore = false;
                showError = false;
              } else {
                haveNextPage = false;
                
                if (list.length > 0) { showNoMore = true; showError = false; } else {
                  showNoMore = false;
                  showError = true;
                  emptyMsg='暂无数据';
                }
              }
              list.forEach(item=>{
                item.xmove = 0
              })
              console.log(list)
              that.setData({
                list: list,
                haveNextPage: haveNextPage,
                showNoMore: showNoMore,
                showError: showError,
                emptyMsg: emptyMsg,
                page: 1,
              })
            } else {
              emptyMsg = res && res._msg ? res._msg : '网络出错请稍后再试';
              that.setData({
                list: list,
                haveNextPage: false,
                showNoMore :false,
                showError:true,
                emptyMsg: emptyMsg,
                page: 1,
              });
              APP.showToast(emptyMsg);
            }
          }
        });
    } 
  },
    /**
     * 处理touchstart事件
     */
     handleTouchStart(e) {
      this.startX = e.touches[0].pageX
  },

  /**
   * 处理touchend事件
   */
  handleTouchEnd(e) {
    if(this.data.noScrollX==1){
      this.setData({noScrollX:0})
    }else{
      if (e.changedTouches[0].pageX < this.startX && e.changedTouches[0].pageX - this.startX <= -30) {
        this.showDeleteButton(e)
      } else if (e.changedTouches[0].pageX > this.startX && e.changedTouches[0].pageX - this.startX < 30) {
        this.showDeleteButton(e)
      } else {
        this.hideDeleteButton(e)
      }
    }
  },
  onPageScroll(e) {
    this.setData({noScrollX:1})
  },
  /**
     * 显示删除按钮
     */
    showDeleteButton: function (e) {
      let index = e.currentTarget.dataset.index;
      this.setXmove(index, -65);
  },

  /**
   * 隐藏删除按钮
   */
  hideDeleteButton: function (e) {
      let index = e.currentTarget.dataset.index;
      this.setXmove(index, 0);
  },

  /**
   * 设置movable-view位移
   */
  setXmove: function (index, xmove) {
      let {list,tabIndex,collectionData} = this.data;
      if(tabIndex == 1){
        list[index].xmove = xmove;
        this.setData({
          list: list
        })
      }else{
        collectionData[index].xmove = xmove;
        this.setData({
          collectionData
        })
      }
  },

  /**
   * 处理movable-view移动事件
   */
  handleMovableChange: function (e) {
      if (e.detail.source === 'friction') {
          if (e.detail.x < -30) {
              this.showDeleteButton(e)
          } else {
              this.hideDeleteButton(e)
          }
      } else if (e.detail.source === 'out-of-bounds' && e.detail.x === 0) {
          this.hideDeleteButton(e)
      }
  },
  getList(){
    let that=this;
    let { page, list, haveNextPage, rows, showNoMore, showError, emptyMsg } = that.data;
    let inData={
      latitude: wx.getStorageSync('latitude'),
      longitude: wx.getStorageSync('longitude'),
      page: page,
      rows: rows,
    }
    if(haveNextPage){
      APP.showGlobalLoading();
      UTIL.ajaxCommon(API.URL_COLLECT_GOODSLIST, inData,
        {
          'complete':function(res){
            APP.hideGlobalLoading();
            if (res&&res._code == API.SUCCESS_CODE) {
              if (res._data && res._data.length > 0) {
                list=list.concat(res._data);
              }
              if (res._data && res._data.length == rows) {
                haveNextPage = true;
              } else {
                haveNextPage = false;
                if (list.length > 0) { showNoMore = true; } else {
                  showNoMore = false;
                }

              }
              list.forEach(item=>{
                item.xmove = 0
              })
              that.setData({
                list: list,
                haveNextPage: haveNextPage,
                showNoMore: showNoMore,
                showError: false,
                emptyMsg: emptyMsg
              })
            } else {
              emptyMsg = res && res._msg ? res._msg : '网络出错请稍后再试';
              if (page > 1) {
                page--;
                that.setData({ page: page });
              }
              APP.showToast(emptyMsg);
            }
          }
        });
    }else{

    }
  },
  onReachBottom() {
    let that = this;
    if (that.data.haveNextPage) {
      that.setData({ page: that.data.page++ });
      that.getList();
      }
    }
   
});