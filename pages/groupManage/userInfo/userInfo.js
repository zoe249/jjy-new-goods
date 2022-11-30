import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
const APP = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        idPhotoFront: "",
        idPhotoRear: "",
        second: 60,
        sending: true
    },

    onLoad: function(options) {

    },

    onShow: function() {

    },
    inputChange(e) {
        let {
            types
        } = e.currentTarget.dataset;
        let value = e.detail.value;
        console.log(e);
        this.setData({
            [types]: value
        })
    },
    getIdPhotoFront() {
        let self = this;
        let flag = 0;
        this.updateImg(flag, function(b_res) {
            self.setData({
                idPhotoFront: b_res._data[0]
            })
        })
    },
    getIdPhotoRear() {
        let self = this;
        let flag = 1;
        this.updateImg(flag, function(b_res) {
            self.setData({
                idPhotoRear: b_res._data[0]
            })
        })
    },
    updateImg(flag, callback) {
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function(res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                let formData = {
                    'token': UTIL.getToken(),
                    'memberId': UTIL.getMemberId(),
                }
                wx.uploadFile({
                    url: API.URL_ADDRESS_UPLOADCUSTOMSDOCIMAGE,
                    filePath: res.tempFilePaths[0],
                    name: 'file' + flag,
                    formData: formData,
                    success(up_res) {
                        if (up_res.statusCode == 200) {
                            let result = JSON.parse(up_res.data);
                            callback && callback(result)
                        }

                    }
                })
            }
        })
    },
    getCode(e) {
        var countdown = 60;
        var that = this;
        var mobile = that.data.mobile;
        if ((mobile !== '') && UTIL.checkMobile(mobile)) {
            // 调用获取验证码接口
            var oData = {
                'channel': API.CHANNERL_220,
                'codeType': API.CODETYPE_1,
                'mobile': mobile
            };
            // 调用接口 showGlobalLoading() hideGlobalLoading()
            UTIL.ajaxCommon(API.URL_MEMBER_SEND_DENTIFYCODE, oData, {
                "success": function(res) {
                    if (res&&res._code == API.SUCCESS_CODE) {
                        APP.showToast('您的验证码已发送');
                        var verifyTimer = setInterval(function() {
                            var second = that.data.second - 1;
                            that.setData({
                                second: second,
                                sending: false,
                                verifyTimer: verifyTimer
                            })
                            if (second < 1) {
                                clearInterval(verifyTimer);
                                clearInterval(that.data.verifyTimer);
                                that.setData({
                                    second: 60,
                                    sending: true
                                })
                            }
                        }, 1000);
                    } else {
                    APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
                    }
                },
                "fail":(res)=>{
                    APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
                }
            });
        } else {
            APP.showToast("手机号码不正确")
        }
    },
    /**
     * 申请团长
     */
    bindApplyLeader() {
        let self = this;
        const {
            code,
            idCard,
            idPhotoFront,
            idPhotoRear,
            mobile,
            name
        } = this.data;
        var data = {
            accountFlag: API.isBindWxCode,
            code,
            idCard,
            idPhotoFront,
            idPhotoRear,
            mobile,
            name
        }
        UTIL.ajaxCommon(API.URL_MEMBER_GROUPAPPLY, data, {
            success: (res) => {
                if (res&&res._code == API.SUCCESS_CODE) {
                    wx.redirectTo({
                        url: '/pages/groupManage/commissionToWx/commissionToWx',
                    })
                } else {
                    APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
                }

            },fail:(res)=>{
                APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
            }
        })
    },
    onUnload: function() {
        var that = this;
        clearInterval(that.data.verifyTimer);
    }

})