// pages/user/myCard/list/list.js

import * as UTIL from '../../../utils/util';
import * as API from '../../../utils/API';

//获取应用实例
let APP = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        cardListEmpty: false,

        filterOrderId: '',
        cardList: [],
        currentPageIndex: 1,
        pageSize: 40,
        noMore: false,
        otherMes:'',

        isCardShareContainerVisible: false,
        currentCardItem: {},
        currentShareInfo: {},
    },

    /**
     * 重置页面中所有的变量状态为初始化状态, 并重载页面数据
     */
    reLoadPageData() {
        let that = this;

        that.setData({
            cardList: [],
            currentPageIndex: 1,
            noMore: false,

            isCardShareContainerVisible: false,
            currentCardItem: {},
            currentShareInfo: {},
        });
        that.loadPageData();
    },

    /**
     * 根据页面中当前变量的状态, 获取页面数据
     */
    loadPageData() {
        let that = this;
        let postData = {
            page: that.data.currentPageIndex,
            rows: that.data.pageSize,
        };

        if (that.data.filterOrderId) {
            postData.orderId = that.data.filterOrderId;
            postData.goodsNum = that.data.goodsNum;
        }

        APP.showGlobalLoading();
        UTIL.ajaxCommon(API.URL_VALUECARD_GETORDERVALUECARDPAGELIST, postData, {
            success(response) {
                if (response._code === API.SUCCESS_CODE) {

                    // 没有更多了
                    if (response._data && response._data.length < that.data.pageSize) {
                        that.setData({
                            noMore: true
                        })
                    }

                    // 加载下一页数据
                    if (response._data && response._data.length !== 0) {
                        let newCardList = that.data.cardList.concat(response._data.map(function (item) {
                            item.valueCardClassName = ' card-value-' + item.valueCardDenomination;
                            item.statusClassName = [' card-activated', ' card-has-bind', ' card-invalid'][item.status - 1];
                            return item;
                        }));

                        that.setData({
                            cardList: newCardList
                        });

                        if (that.data.cardList.length === 0) {
                            that.setData({
                                cardListEmpty: true
                            })
                        }
                    } else if (that.data.currentPageIndex == 1) {
                      that.setData({
                        otherMes: 'empty'
                      }) 
                    }

                } else {
                    console.warn(response)
                }
            },
            complete() {
                APP.hideGlobalLoading();
                wx.stopPullDownRefresh();
            },
            needReloadWhenLoginBack: true
        })

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.hideShareMenu();
      if (UTIL.getMemberId() == 0) {
          wx.navigateTo({
            url: '/pages/user/wxLogin/wxLogin?needReloadWhenLoginBack=true',
          })
          return;
        }
        let that = this;

        if (options) {
            if (options.orderId) {
                that.setData({
                    filterOrderId: options.orderId,
                    goodsNum: options.goodsNum
                })
            }
            if (options.orderList || options.orderDetail) {
                wx.setNavigationBarTitle({
                    title: '购卡记录'
                })
            }
        }
        
        that.reLoadPageData();
    },

    /**
     * 复制卡密
     * @param cardItem
     */
    /*copyCardInfo(cardItem) {
        wx.setClipboardData({
            data: 'data',
            success: function(res) {
                wx.getClipboardData({
                    success: function(res) {
                        APP.showToast('卡号卡密复制成功~');
                    }
                })
            }
        })
    },*/

    openBindCardToSelfModal(e) {
        let that = this;
        let {item} = e.currentTarget.dataset;

        APP.showGlobalModal({
            header: '确认绑定生活卡',
            content: '亲，一旦将卡绑定到您的账号后，将无法做解绑操作。是否继续绑定生活卡？',
            slot: true,
            footer: [{
                text: '取 消',
                callbackName: ''
            }, {
                text: '继续绑定',
                callbackName: 'bindCardToSelf'
            }],
            eventDetail: item
        })
    },

    /**
     * 用于辅助执行全局通用模态框组件点击底部按钮之后的回调事件
     * @param e
     */
    modalCallbackHandler(e) {
        let that = this;
        let currentEventDetail = e.detail;

        if (currentEventDetail.callbackName) {
            that[currentEventDetail.callbackName](e);
        }
    },

    /**
     * 绑到我的账户
     * @param e
     */
    bindCardToSelf(e) {
        let that = this;
        let currentEventDetail = e.detail;

        let postData = {
            orderId: that.data.filterOrderId || currentEventDetail.orderId,
            valueCardCode: currentEventDetail.valueCardCode,
            valueCardCommand: currentEventDetail.valueCardCommand,
        };

        APP.showGlobalLoading();
        UTIL.ajaxCommon(API.URL_VALUECARD_BINDVALUECARDFROMBUY, postData, {
            success(response) {
                if (response._code === API.SUCCESS_CODE) {
                    APP.showGlobalModal({
                        header: '',
                        content: `绑定成功，金额${currentEventDetail.valueCardDenomination}元`,
                        slot: false,
                        footer: [{
                            text: '关 闭',
                            callbackName: ''
                        }, {
                            text: '去购物',
                            callbackName: 'jumpHome'
                        }],
                        eventDetail: {}
                    });

                    /**
                     * 绑卡成功时, 本地模拟修改当前卡片的状态
                     */
                    let targetData = {};
                    let targetPropStatus, targetPropStatusClassName;
                    let currentTargetIndex;
                    that.data.cardList.map(function (item, index) {
                        if (item.valueCardCode === currentEventDetail.valueCardCode) {
                            currentTargetIndex = index;
                        }
                    });
                    targetPropStatus = 'cardList[' + currentTargetIndex + '].status';
                    targetPropStatusClassName = 'cardList[' + currentTargetIndex + '].statusClassName';
                    targetData[targetPropStatus] = 2;
                    targetData[targetPropStatusClassName] = ' card-has-bind';

                    that.setData(targetData);

                } else {
                    APP.showToast(response._msg)
                }
            },
            complete() {
                APP.hideGlobalLoading();
            }
        })
    },

    /**
     * 回到首页
     */
    jumpHome() {
        wx.reLaunch({
            url: "/pages/index/index"
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
      
        if (UTIL.getMemberId() == 0){
            wx.navigateTo({
                url: '/pages/user/wxLogin/wxLogin?needReloadWhenLoginBack=true',
              })
            return;
        }
        if (APP.globalData.needReloadWhenLoginBack) {
            APP.globalData.needReloadWhenLoginBack = false;

            this.reLoadPageData();
        }

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        let that = this;

        // 页面下拉刷新时重置
        this.reLoadPageData(that);
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        let that = this;

        if (that.data.noMore) {
            console.warn('已经到底啦')
        } else {
            that.setData({
                currentPageIndex: that.data.currentPageIndex + 1
            });
            that.loadPageData();
        }
    },

    showCardShareContainer() {
        let that = this;

        that.setData({
            isCardShareContainerVisible: true
        });
    },

    hideCardShareContainer() {
        let that = this;

        that.setData({
            isCardShareContainerVisible: false
        });
    },

    /**
     * 转赠生活卡给朋友
     * @param e
     */
    openShareCardToFriendsModal(e) {
        let that = this;
        let {item} = e.currentTarget.dataset;

        APP.showGlobalLoading();
        UTIL.ajaxCommon(API.URL_VALUECARD_GETVALUECARDSHARE, {
            shareChannel: API.CHANNERL_220,
            path: '/pages/myCard/bindCard/bindCard',
            valueCardCode: item.valueCardCode
        }, {
            success(response) {
                if (response._code === API.SUCCESS_CODE) {
                    let data = response._data;

                  let wechatFriendContent = (data && data.wechatFriendContent) || 'hi朋友！送你一张生活卡，在家家悦家家悦优鲜购物任性花，赶紧去买买买吧！';
                  let wechatFriendImg = data && data.wechatFriendImg || 'https://shgm.jjyyx.com/m/images/myCard/bg@2x2.jpg';
                    let path = data && `${data.path}&wechatFriendContent=${wechatFriendContent}&wechatFriendImg=${wechatFriendImg}`;

                    that.setData({
                        currentShareInfo: {
                            title: wechatFriendContent,
                            path: path,
                            imageUrl: wechatFriendImg,
                            success: function (res) {
                              that.hideCardShareContainer();
                            }
                        },
                        currentCardItem: item
                    });
                    console.log(data, that.data.currentShareInfo);

                    that.showCardShareContainer();

                } else {
                    APP.showToast(response._msg);
                    console.warn(response)
                }
            },
            complete() {
                APP.hideGlobalLoading();
            },
            needReloadWhenLoginBack: true
        })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (e) {
        let that = this;
        console.log(e)
        return that.data.currentShareInfo;
    }
});