import * as UTIL from '../../../../utils/util';
import * as API from '../../../../utils/API';
import {modalResult} from '../../../../templates/global/global.js';

//获取应用实例
let APP = getApp();

// pages/user/address/add/add.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        /* 收货地址数据 */
        formData_addrId: '',
        formData_addrName: '',
        formData_addrPhone: '',
        formData_mapAddress: '',
        formData_poiAddr: '',
        formData_addrTag: 0,
        formData_isDefault: 0,

        /* 用来标识提交按钮是否被禁用 */
        isSubmitButtonDisabled: true,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this;

        // 如果 url 包含参数 id, 则进入编辑模式, 加载 id 对应的地址信息
        if (options.id) {

            wx.setNavigationBarTitle({
                title: "编辑地址",
            });

            this.setData({
                formData_addrId: options.id
            });

            UTIL.ajaxCommon(API.URL_ADDRESS_QUERY, {
                addrId: this.data.formData_addrId
            }, {
                success(response) {
                    that.setData({
                        formData_addrId: response._data.addrId,
                        formData_addrName: response._data.addrName,
                        formData_addrPhone: response._data.addrPhone,
                        formData_mapAddress: {
                            latitude: response._data.latitude,
                            longitude: response._data.longitude,
                            areaId: response._data.areaId,
                            areaName: response._data.areaName,
                            cityId: response._data.cityId,
                            cityName: response._data.cityName,
                            provinceId: response._data.provinceId,
                            provinceName: response._data.provinceName,
                            address: response._data.address
                        },
                        formData_poiAddr: response._data.poiAddr,
                        formData_addrTag: response._data.addrTag === null ? 0 : response._data.addrTag,
                        formData_isDefault: response._data.isDefault,
                    });
                    that.detectFormData();
                }
            })

        }

    },

    detectFormData() {
        let {formData_addrName, formData_addrPhone, formData_mapAddress, formData_poiAddr, formData_addrTag, formData_isDefault} = this.data;

        if (UTIL.isValidBizSafeValue(formData_addrName)
            && UTIL.isValidBizSafeValue(formData_addrPhone)
            && UTIL.isValidBizSafeValue(formData_mapAddress)
            && UTIL.isValidBizSafeValue(formData_poiAddr)
            && UTIL.isValidBizSafeValue(formData_addrTag)
            && UTIL.isValidBizSafeValue(formData_isDefault)
        /*&& UTIL.checkMobile(formData_addrPhone)*/) {
            this.setData({
                isSubmitButtonDisabled: false
            })
        }
    },

    /**
     * 地址相关的 input 输入框内容发生变化时触发此事件
     * @param e
     */
    userInputChanged(e) {
        let {type} = e.currentTarget.dataset;
        let currentValue = e.detail.value;

        switch (type) {
            case 'name':
                this.setData({
                    formData_addrName: UTIL.filterEmoji(currentValue)
                });
                break;
            case 'phone':
                this.setData({
                    formData_addrPhone: currentValue
                });
                break;
            case 'address':
                this.setData({
                    formData_poiAddr: currentValue
                });
                break;
        }

        this.detectFormData();
    },

    /**
     * 地址相关的 input 输入框失去焦点时触发此事件
     * @param e
     */
    userInputBlur(e) {
        this.userInputChanged(e)
    },

    /**
     * 地址相关的用户选择项发生变化时触发此事件
     * @param e
     */
    userSelectChanged(e) {
        let {type, addrtag} = e.currentTarget.dataset;

        switch (type) {
            case 'addrtag':
                this.setData({
                    formData_addrTag: addrtag
                });
                break;
        }

        this.detectFormData();
    },

    /**
     * 通过地图选择定位时触发此事件
     * @param e
     */
    userMapSelectChanged(e) {
        let {type, map_address} = e.currentTarget.dataset;

        switch (type) {
            case 'map_address':
                this.setData({
                    formData_mapAddress: map_address
                });
                break;
        }

        this.detectFormData();
    },

    /**
     * 点击精确定位时, 打开地图供用户选择
     * 用户选择位置并确认后,
     */
    mapSelectLocation() {
        wx.chooseLocation({
            success: res => {
                if (res.errMsg === 'chooseLocation:ok') {

                    UTIL.getCityInfoByCoordinate({
                        longitude: res.longitude,
                        latitude: res.latitude
                    }, {
                        success: response => {

                            // 初始化 "火星坐标系" 对应的 "百度坐标系" 坐标
                            let geoLocationBd09 = UTIL.translateGcj02ToBd09({
                                longitude: response.data.result.location.lng,
                                latitude: response.data.result.location.lat
                            });

                            let mockEvent = {
                                currentTarget: {
                                    dataset: {
                                        type: 'map_address',
                                        map_address: {
                                            longitude: geoLocationBd09.longitude,
                                            latitude: geoLocationBd09.latitude,
                                            areaId: '',
                                            areaName: response.data.result.address_component.district,
                                            cityId: '',
                                            cityName: response.data.result.address_component.city,
                                            provinceId: '',
                                            provinceName: response.data.result.address_component.province,
                                            //poiAddr: response.data.result.address_component.street_number, // 收货地址门牌号
                                            address: res.name
                                        }
                                    }
                                }
                            };

                            this.userMapSelectChanged(mockEvent);

                        }
                    });

                } else {
                }
            },
            cancel: res => {

            },
            fail: res => {
                APP.showToast('没有选中任何地址, 请重新选择~');
                /*this.mapSelectLocation();*/
            },
            complete: res => {

            }
        })
    },

    /**
     * 保存收货地址
     * 使用 throttle 节流机制, 避免用户短时间内多次点击保存地址按钮, 导致同一地址被保存两次的问题.
     */
    saveAddress: UTIL.throttle(function () {
        let that = this;

        // 修复魅族测试机型问题: 输入法中文状态下输入英文字母, 如果不通过主动选择候选框的某一项让内容上屏,
        // 直接点击保存按钮时, 最后一次在输入框中输入的内容不会及时更新到输入框中, 导致内容丢失,
        // 为了兼容, 这里在提交保存之前做了 100ms 的延时等待, 以确保输入框中的内容为最新.
        setTimeout(function () {

            if (!UTIL.checkMobile(that.data.formData_addrPhone)) {
                APP.showToast('请您输入正确的手机号码');
                return false;
            }

            let dataWillPost = Object.assign({}, {
                addrId: that.data.formData_addrId,
                addrName: that.data.formData_addrName,
                addrPhone: that.data.formData_addrPhone,
                poiAddr: that.data.formData_poiAddr,
                addrTag: that.data.formData_addrTag,
                isDefault: that.data.formData_isDefault,
            }, that.data.formData_mapAddress);

            UTIL.ajaxCommon(API.URL_ADDRESS_EDIT, dataWillPost, {
                success(response) {
                    if (response._code === "000000") {
                        var groupManageCartFillAddress = wx.getStorageSync("groupManageCartFillAddress") ? JSON.parse(wx.getStorageSync("groupManageCartFillAddress")) : null;
                        if(groupManageCartFillAddress&&groupManageCartFillAddress.addrId){
                            if(groupManageCartFillAddress.addrId==that.data.formData_addrId){
                                groupManageCartFillAddress.addrName= that.data.formData_addrName
                                groupManageCartFillAddress.addrPhone=that.data.formData_addrPhone
                                groupManageCartFillAddress.address=that.data.formData_mapAddress.address
                                groupManageCartFillAddress.areaName=that.data.formData_mapAddress.areaName
                                groupManageCartFillAddress.cityName=that.data.formData_mapAddress.cityName
                                groupManageCartFillAddress.provinceName=that.data.formData_mapAddress.provinceName
                                groupManageCartFillAddress.poiAddr=that.data.formData_poiAddr
                                wx.setStorageSync("groupManageCartFillAddress", JSON.stringify(groupManageCartFillAddress));
                            }
                        }
                        wx.navigateBack();
                    }
                }
            })
        }, 100)

    }, 1000, {
        leading: true,
        trailing: false
    }),

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

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

    }
})