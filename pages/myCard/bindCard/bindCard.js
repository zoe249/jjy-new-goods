// pages/myCard/bindCard/bindCard.js
import * as API from "../../../utils/API";
import * as UTIL from "../../../utils/util";

//获取应用实例
let APP = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        options: {},
        showLoginDialog: false,
        bindingCardSuccess: false,
        bindingCardButtonDisabled: false,

        cardItem: {},
        currentShareInfo: {},
    },

    /**
     * 初始化 "当前生活卡" 的信息和 "分享文案"
     */
    loadPageData: function () {
        let that = this;
        let {
            valueCardCommand, valueCardCode, valueCardDenomination
            , wechatFriendContent, wechatFriendImg
        } = that.data.options;
        let path = that.getCurrentPageUrlWithArgs();

        // /pages/myCard/bindCard/bindCard?valueCardCommand=1070d4355e044c8ab4c56b00a1a72c75&valueCardCode=DQG0000033190&valueCardDenomination=7000

        that.setData({
            cardItem: {
                valueCardDenomination: valueCardDenomination,
                valueCardCode: valueCardCode,
                valueCardCommand: valueCardCommand,
            },
            currentShareInfo: {
                title: wechatFriendContent,
                path: path,
                imageUrl: wechatFriendImg
            }
        });

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this;

        // 设置页面入参到 data 中
        that.setData({
            options
        });

        that.loadPageData();

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
      UTIL.carryOutCurrentPageOnLoad()
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

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        let that = this;

        return that.data.currentShareInfo;
    },

    /**
     * 立即绑定按钮事件
     * @param isLoginSuccessFromLoginDialog 用于标识是否是从登陆弹窗登陆成功之后返回的
     * @returns {boolean}
     */
    bindingCard({isLoginSuccessFromLoginDialog = false}) {
        let that = this;

        if (that.data.bindingCardButtonDisabled) {
            console.warn('此卡已绑定');
            return false;
        }

        // 如果用户已经登录, 或者是从登陆弹窗登陆成功之后返回的, 则尝试直接绑卡
        if (UTIL.isLogin() || isLoginSuccessFromLoginDialog) {
            let cardItem = that.data.cardItem;
            let postData = {
                valueCardCode: cardItem.valueCardCode,
                valueCardCommand: cardItem.valueCardCommand,
                valueCardDenomination: cardItem.valueCardDenomination,
            };
            APP.showGlobalLoading();
            UTIL.ajaxCommon(API.URL_VALUECARD_BINDVALUECARDFROMSHARE, postData, {
                success(response) {
                    if (response._code === API.SUCCESS_CODE) {
                        APP.showToast('绑定成功');
                        that.setData({
                            bindingCardSuccess: true
                        })
                    } else {
                        APP.showToast(response._msg);

                        // 此卡已绑定
                        if (response._code === '001021') {
                            that.setData({
                                bindingCardButtonDisabled: true
                            })
                        }

                    }
                },
                complete() {
                    APP.hideGlobalLoading();
                }
            })
        }

        // 否则就弹出登录窗口走登录成功自动绑卡流程
        else {
            wx.navigateTo({
              url: '/pages/user/wxLogin/wxLogin?needReloadWhenLoginBack=true',
            })
            // that.setData({
            //     showLoginDialog: true
            // });
            return false;
        }
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
     * 全局登录组件 - 登陆成功/后关闭弹窗时的回调
     * @param params {Object} 返回的 params.detail.isLogin 用于标识用户是否在弹窗中成功登录, 方便后续逻辑判断
     */
    closeDialogCallback(params) {
        let that = this;
        const {isLogin} = params.detail;

        that.setData({
            isLogin: isLogin || false,
            showLoginDialog: false,
        });

        // 如果返回登录成功标识, 则尝试重新绑卡
        if (isLogin) {
            that.bindingCard({
                isLoginSuccessFromLoginDialog: true
            });
        }
    },

    /*获取当前页带参数的url*/
    getCurrentPageUrlWithArgs() {
        let pages = getCurrentPages(); // 获取加载的页面
        let currentPage = pages[pages.length - 1]; // 获取当前页面的对象
        let url = currentPage.route; // 当前页面url
        let options = currentPage.options; // 如果要获取url中所带的参数可以查看options

        //拼接url的参数
        let urlWithArgs = url + '?';
        for (let key in options) {
            if (options.hasOwnProperty(key)) {
                let value = options[key];
                urlWithArgs += key + '=' + value + '&'
            }
        }
        urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1);

        return urlWithArgs
    }

});