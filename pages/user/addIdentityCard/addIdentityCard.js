import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
const APP = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        tempFilePaths: [],
        positive: null,
        reverse: null,
        name: '',
        idCard: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.loading = this.selectComponent("#globalLoading");
        var {
            customsDocId,
            isCheck
        } = options;
        this.setData({
            customsDocId: customsDocId ? customsDocId : false,
            isCheck: isCheck ? isCheck : false
        });
        if (customsDocId) {
            this.getDetai();
        }
    },
    /**
     * 获取详情
     */
    getDetai() {
        var that = this;
        var {
            customsDocId
        } = this.data;
        UTIL.ajaxCommon(API.URL_ADDRESS_CUSTOMSDOC, {
            customsDocId
        }, {
            success: (res) => {
                if (res && res._code == API.SUCCESS_CODE) {
                    that.setData({
                        docInfor: res._data
                    });
                    if (res._data.approvalNote) {
                        APP.showGlobalModal({
                            header: '提示',
                            content: res._data.approvalNote,
                            contentStyle: 'text-align: center;',
                            slot: true,
                            footer: [{
                                text: '稍后再说',
                                callbackName: ''
                            }, {
                                text: '立刻编辑',
                                callbackName: ''
                            }],
                            eventDetail: {}
                        })
                    }
                }
            },
            fail: (res) => {

            }
        });
    },
    inputChange(e) {
        var types = e.target.id;
        var val = e.detail.value;
        if (types == 'name') {
            this.setData({
                name: val
            })
        } else {
            this.setData({
                idCard: val
            })
        }
    },
    /**
     * 选择照片或相机
     */
    chooseImage(e) {

        var that = this;
        var cur = e.target.dataset.cur;
        var customsDocId = this.data.customsDocId;
        var tempFilePaths = that.data.tempFilePaths;
        var docInfor = that.data.docInfor;

        var formData = {
            'token': UTIL.getToken(),
            'memberId': UTIL.getMemberId(),
        }

        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function(res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                tempFilePaths[cur] = res.tempFilePaths[0]
                wx.uploadFile({
                    url: API.URL_ADDRESS_UPLOADCUSTOMSDOCIMAGE,
                    filePath: tempFilePaths[cur],
                    name: 'file' + cur,
                    formData: formData,
                    success(up_res) {

                        var _data = JSON.parse(up_res.data)._data;

                        tempFilePaths[cur] = _data[0];
                        if (cur == 0) {
                            if (docInfor && customsDocId) {
                                docInfor.idPhotoFront = _data[0];
                            }

                            that.setData({
                                positive: _data[0]
                            })
                        } else {
                            if (docInfor && customsDocId) {
                                docInfor.idPhotoRear = _data[0];
                            }

                            that.setData({
                                reverse: _data[0]
                            })
                        }
                        that.setData({
                            tempFilePaths,
                            docInfor: docInfor && customsDocId ? docInfor : false
                        })

                    }
                })
            }
        })
    },

    /**
     * 保存证件信息
     */
    saveInfo(e) {
        var that = this;
        var {
            tempFilePaths,
            customsDocId,
            positive,
            reverse
        } = this.data
        var {
            name,
            idCard
        } = e.detail.value;
        var idPhotoFront = positive;
        var idPhotoRear = reverse;
        var action = 3;
        if (positive) {
            action = 1
        }
        if (reverse) {
            action = 2
        }
        if (positive && reverse) {
            action = 0
        }
        var data = {
            name,
            idCard,
            idPhotoFront,
            idPhotoRear
        }
        if (name == '') {
            APP.showToast('请填写真实姓名');
            return false;
        }
        if (idCard == '') {
            APP.showToast('请填写身份证号码');
            return false;
        };
        if (!UTIL.checkID(idCard) && !customsDocId) {
            APP.showToast('姓名和身份证号码不匹配请核对后重新提交');
            return false;
        }
        if (positive && reverse) {} else {
            APP.showToast('请上传身份证正反面照片');
            return false;
        }
        if (customsDocId) {
            data.customsDocId = customsDocId;
        }
        that.loading.showLoading();
        UTIL.ajaxCommon(API.URL_ADDRESS_SAVECUSTOMSDOCNEW, data, {
            success: (res) => {
                that.loading.hideLoading();
                if (res && res._code == API.SUCCESS_CODE) {
                    APP.showToast(res._msg);
                    wx.setStorageSync("reflresh", 1)
                    wx.navigateBack({

                    })
                } else {
                    APP.showToast(res._msg);
                }
            },
            fail: (res) => {
                that.loading.hideLoading();
            }
        });
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
})