import * as UTIL from '../../../../utils/util';
import * as API from '../../../../utils/API';
import {modalResult} from '../../../../templates/global/global.js';
import {cityPickerConfig} from 'cityPickerConfig';
import * as request from '../../../../pages/AA-RefactorProject/common/js/httpCommon.js'
import * as $ from '../../../../pages/AA-RefactorProject/common/js/js.js'

// choice.js
//获取应用实例
let APP = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isLogin: UTIL.isLogin(),

        // 是否显示选择城市面板
        /*showSelectCityPanel: false,*/

        // 当前已开放的城市列表
        /*opendCityList: API.opendCityList,*/

        // 初始化城市选择器
        cityPickerConfig,
        selectedMultiIndex: [0, 0],
        selectedMultiArray: [cityPickerConfig, cityPickerConfig[0].sub],

        // 当前搜索限定的城市
        currentCity: '',

        // 输入框的激活状态
        isSearchBoxActive: false,

        // 是否显示清空搜索框内容按钮
        showClearSearchButton: false,

        // 输入框内容
        searchText: '',

        // 是否显示页面主面板
        showChoiceAddress: true,

        // 是否显示搜索结果列表面板
        showSearchList: false,

        // 根据用户当前坐标定位所得出的地理位置信息
        detailAddress: '定位中...',
        isLocating: true,
        currentUserRealLocation: {},

        // 标识 App 是否有获取用户地址位置的权限, 如果没有权限, 则需要隐藏精准定位
        // 当前的精准定位使用的是小程序原生组件, 由于该组件当前要求必须获取用户授权才可以正常使用,
        // 所以在用户拒绝定位授权时, 暂时隐藏精准定位的入口
        canAppGetUserLocation: APP.globalData.canAppGetUserLocation,

        // 当前登录用户的收货地址列表
        shippingAddressList: [],

        // 搜索结果列表
        searchList: [],

        // 历史搜索记录列表
        locateHistoryList: [],

        // 是否显示搜索关键词错误提示块
        showSearchError: false,

        // 是否显示 GPS 错误提示块
        showGPSError: false,

        //选中地址
        choiceddrId: false,

        // locationInfo
        locationInfo: APP.globalData.locationInfo
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        let that = this;

        that.setData({
            canAppGetUserLocation: APP.globalData.canAppGetUserLocation
        });

        if (APP.globalData.isBackFromAuthPage) {
            APP.globalData.isBackFromChoiceAddressPage = true;
            APP.globalData.needReloadCurrentPageOnShow = true;
        }

        let memberId = wx.getStorageSync('memberId');

        // 获取用户当前位置并显示
        UTIL.getLocation(function (locationInfo) {
            that.setData({
                isLocating: false,
                currentUserRealLocation: locationInfo,
                /*detailAddress: APP.globalData.locationInfo.detailAddress*/
                detailAddress: locationInfo.detailAddress
            });
        });

        // 更新历史记录列表
        let locateHistoryList = JSON.parse(wx.getStorageSync('historyLocation_' + memberId) || '{"historyWords": []}');
        this.setData({
            locateHistoryList
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
        let that = this;
        var choiceddrId = wx.getStorageSync('choice_addr_id') ? wx.getStorageSync('choice_addr_id') : false;
        that.setData({
            isLogin: UTIL.isLogin(),
            choiceddrId: choiceddrId,
            currentCity: wx.getStorageSync('cityName'),
            locationInfo: {
                longitude: wx.getStorageSync('longitude'),
                latitude: wx.getStorageSync('latitude'),
                cityName: wx.getStorageSync('cityName'),
                detailAddress: wx.getStorageSync('detailAddress')
            },
        });
        if (!that.data.currentCity){
          wx.getStorage({
            key: 'cityName',
            success: function(res) {
              that.setData({
                currentCity: res.data
              })
            },
          })
        }
        if (UTIL.isLogin()) {
            // 初始化 - 当前登录用户的收货地址列表
            UTIL.ajaxCommon(API.URL_ADDRESS_LISTBYORDER, {}, {
                "success": function (res) {
                    that.setData({
                        shippingAddressList: res._data,
                        isLogin: UTIL.isLogin()
                    });
                }
            });
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

    autoJump(e) {
        let {url} = e.currentTarget.dataset;

        if (typeof url === 'string') {
            wx.navigateTo({
                url: url
            })
        }
    },

    // 用户在打开城市选择器之后, 选择了取消
    bindMultiPickerCancel: function (e) {
        let that = this;
        // 重置选择器
        that.setData({
            selectedMultiIndex: [0, 0],
            selectedMultiArray: [cityPickerConfig, cityPickerConfig[0].sub]
        });
    },

    // 用户选择了新的城市
    bindMultiPickerChange: function (e) {
        let that = this;
        console.log('picker发送选择改变，携带值为', e.detail.value);
        that.setData({
            currentCity: that.data.selectedMultiArray[1][e.detail.value[1]].name
        });
        APP.globalData.currentCity = that.data.currentCity;
        wx.setStorageSync('cityName', that.data.currentCity);

        // 重置选择器
        that.setData({
            selectedMultiIndex: [0, 0],
            selectedMultiArray: [cityPickerConfig, cityPickerConfig[0].sub]
        });
    },

    // 城市选择器列发生变化的事件
    bindMultiPickerColumnChange: function (e) {
        console.log('修改的列为', e.detail.column, '，值为', e.detail.value);

        let selectedMultiArray = this.data.selectedMultiArray;
        let selectedMultiIndex = this.data.selectedMultiIndex;

        selectedMultiIndex[e.detail.column] = e.detail.value;

        if (e.detail.column === 0) {
            let currentProvinceIndex = selectedMultiIndex[0];
            selectedMultiIndex[1] = 0;
            selectedMultiArray[1] = cityPickerConfig[currentProvinceIndex].sub;
        }

        this.setData({
            selectedMultiArray,
            selectedMultiIndex
        });
    },

    /**
     * 选择一个具体的地址并跳转回首页
     */
    jumpHome(e) {
        let that = this;
        /*let {from, locationInfo, addrid} = e.currentTarget.dataset;*/
        let from = e.currentTarget.dataset.from;
        let locationInfo = e.currentTarget.dataset.locationInfo;
        let addrid = e.currentTarget.dataset.addrid;
        let currentLocationData;

        // 如果以上情况都无法匹配, 则认为用户点击的是通过 GPS 自动定位的地址
        if (from === 'userRealLocation') {

            if (this.data.isLocating) {
                APP.showToast('正在定位中, 请稍后~');
                return false;
            }

            if (APP.globalData.isBackFromAuthPage) {
                APP.showToast('无法根据当前位置定位, 请在上方手动搜索您的位置');
                return false;
            }

            currentLocationData = {
                lng: locationInfo.longitude,
                lat: locationInfo.latitude,
                address: locationInfo.detailAddress,
                city: locationInfo.cityName
            };

        }
        // 已登录用户点击自己之前添加的收货地址时
        else if (from === 'shippingListLocation') {

            // 当用户选中的是 "收货地址" 时记录下地址 ID
            wx.setStorageSync('choice_addr_id', addrid);

            that.setData({
                choiceddrId: addrid
            });

            currentLocationData = {
                lng: locationInfo.longitude,
                lat: locationInfo.latitude,
                address: locationInfo.address,
                city: locationInfo.cityName
            };

        }

        // 点击 "搜索结果列表/历史记录列表/地图精确定位" 时
        else if (from === 'historyListLocation' || from === 'searchListLocation' || from === 'mapSelectLocation') {

            currentLocationData = {
                lng: locationInfo.lng,
                lat: locationInfo.lat,
                address: locationInfo.address,
                city: locationInfo.city
            };
        }

        // 保存到历史记录
        if (currentLocationData.address) {
            // 保存搜索历史
            this.saveToLocateHistoryList(currentLocationData);
        }

        // 记录用户主动设置地址的行为, 首页不再进行自动定位
        APP.globalData.hasSwitchPos = 1;
        wx.setStorageSync('hasSwitchPos', APP.globalData.hasSwitchPos);
        wx.removeStorageSync('shopAttribute');
        // 带着用户选择的经纬度信息返回首页(老版)
        // wx.reLaunch({
        //     url: '../../../index/index?isSwitchPosActionMadeByUser=1&lng=' + currentLocationData.lng + '&lat=' + currentLocationData.lat + '&address=' + currentLocationData.address + '&city=' + currentLocationData.city
        // })
        this.getShopInfoByLocation(currentLocationData);
    },
    getShopInfoByLocation(currentLocationData) {
        var that=this;
        wx.setStorageSync('latitude', currentLocationData.lat);
        wx.setStorageSync('longitude', currentLocationData.lng);
        request.getYXOrGroupShops("0", function (shopInfo) {
            if ($.is_null(shopInfo.shop) && $.is_null(shopInfo.groupAddress)) {
                console.log("未--获取到团购门店，降级进入配置项：云超or 其他");
                //接口可配置的降级页面，需默认设置
                var gotoPage = '/pages/yunchao/home/home';
                if ($.is_null(shopInfo) == false) {
                    let setting = JSON.parse(shopInfo.setting);
                    gotoPage = setting.otherDefaultIndex;
                }
                wx.reLaunch({
                    url: gotoPage,
                })
            } else {      
                if (shopInfo.groupAddress && shopInfo.groupAddress.shopId) {
                    $.batchSaveObjectItemsToStorage(shopInfo.shop);
                    //新老版本判断-开始
                    var isNewVersion = shopInfo.shop.is_new_home;
                    if (isNewVersion == 1) {
                        wx.reLaunch({
                            url: '/pages/AA-RefactorProject/pages/Community/index',
                        })
                    } else {
                        wx.reLaunch({
                            url: '/pages/groupManage/home/home',
                        })
                    }
                    //新老版本判断-结束
                } else {
                    $.batchSaveObjectItemsToStorage(shopInfo.shop);
                    //新老版本判断-开始
                    var isNewVersion = shopInfo.shop.isNewHome;
                    if (isNewVersion == 1) {
                        wx.reLaunch({
                            //type=0 优鲜，type=1 社团
                            url: '/pages/AA-RefactorProject/pages/index/index?type=0',
                        })
                    } else {
                        //进入老版无需再次刷新，新老版接口
                        wx.reLaunch({
                            url: '../../../index/index?isSwitchPosActionMadeByUser=1&lng=' + currentLocationData.lng + '&lat=' + currentLocationData.lat + '&address=' + currentLocationData.address + '&city=' + currentLocationData.city+ '&getYXOrGroupShops=1'
                        })
                    }
                    //新老版本判断-结束
                }
            }

        })


    }
    ,

    /**
     * 输入框获得焦点
     */
    onSearchBoxFocus() {
        this.setData({
            isSearchBoxActive: true
        })
    },

    /**
     * 输入框失去焦点
     */
    onSearchBoxBlur() {
        this.setData({
            isSearchBoxActive: false
        })
    },

    /**
     * 根据搜索框输入内容, 显示/隐藏清除按钮
     * @param e
     */
    onSearchBoxInput(e) {
        if (e.detail.value !== '') {
            // 显示 input 清除按钮
            this.setData({
                showClearSearchButton: true
            });
        } else {
            // 隐藏 input 清除按钮
            this.setData({
                showClearSearchButton: false
            });
        }
    },

    /**
     * 清空搜索框内容
     */
    clearSearchBox() {
        this.setData({
            searchText: '',
            showClearSearchButton: false,
            showChoiceAddress: true,
            showSearchList: false
        });
        wx.hideNavigationBarLoading();
    },

    /**
     * 搜索关键字相关地址
     */
    search(e) {
        let that = this;
        let name = e.detail.value;
        if (name) {

            // 隐藏选择地址面板, 显示搜索结果列表面板
            this.setData({
                showChoiceAddress: false,
                showSearchList: true
            });

            // 显示Loading
            wx.showNavigationBarLoading();

            //百度地图地址
            wx.request({
                url: 'https://api.map.baidu.com/place/v2/suggestion',
                data: {
                    ak: 'Tnj7ybU8MpbRW1u8lvGxU0fo5VRbGjaA',
                    region: this.data.currentCity,
                    query: name,
                    output: 'json',
                    city_limit: true
                },
                dataType: 'jsonp',
                success: function (results) {
                    wx.hideNavigationBarLoading();

                    let searchList = JSON.parse(results.data).result || [];
                    searchList = searchList.map(function (obj) {
                        obj.lng = obj.location && obj.location.lng;
                        obj.lat = obj.location && obj.location.lat;
                        obj.address = obj.name;
                        delete obj.location;
                        return obj;
                    });
                    that.setData({
                        searchList: searchList,
                        showSearchError: !searchList || searchList.length === 0
                    });

                },
                error: function (err) {
                }
            });

            //$('.choice-address-result').height(winHeight - 45);

        } else {

            this.setData({
                showChoiceAddress: true,
                showSearchList: false
            });

        }
    },

    /**
     * 点击精确定位时, 打开地图供用户选择
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
                            let geoLocationBd09 = UTIL.translateGcj02ToBd09(res);

                            let mockEvent = {
                                currentTarget: {
                                    dataset: {
                                        from: 'mapSelectLocation',
                                        locationInfo: {
                                            "city": response.data.result.ad_info.city,
                                            "address": res.name, // res.address
                                            "lng": geoLocationBd09.longitude,
                                            "lat": geoLocationBd09.latitude
                                        }
                                    }
                                }
                            };

                            this.jumpHome(mockEvent)

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
     * 保存定位的历史记录
     */
    saveToLocateHistoryList(historyItem) {
        let memberId = wx.getStorageSync('memberId')
        let historyLocation = JSON.parse(wx.getStorageSync('historyLocation_' + memberId) || '{"historyWords": []}');

        // 如果历史记录中已经存在当前地址的选择记录, 则移除旧记录
        for (let i = 0; i < historyLocation.historyWords.length; i++) {
            if (historyLocation.historyWords[i].address === historyItem.address) {
                historyLocation.historyWords.splice(i, 1);
            }
        }

        // 添加选择的地址到记录顶端
        historyItem.timeStamp = Date.now();
        historyLocation.historyWords.unshift(historyItem);

        // 持久化
        wx.setStorageSync('historyLocation_' + memberId, JSON.stringify(historyLocation));

        // 更新历史记录列表
        this.setData({
            locateHistoryList: historyLocation
        });

    },

    /**
     * 清除搜索定位历史
     */
    modalCallback(event) {
        if (modalResult(event)) {
            let that = this;
            wx.getStorage({
                key: 'memberId',
                success: res => {
                    wx.setStorage({
                        key: "historyLocation_" + res.data,
                        data: ""
                    });
                    that.setData({
                        locateHistoryList: []
                    });
                }
            });
        }
    },
    clearLocateHistory() {
        APP.showModal({
            content: '是否清空历史记录？',
        });
        /*let that = this;
         wx.showModal({
         title: '',
         content: '是否清空历史记录？',
         confirmText: "确定",
         cancelText: "取消",
         success: function (res) {
         if (res.confirm && !res.cancel) {
         wx.getStorage({
         key: 'memberId',
         success: res => {
         wx.setStorage({
         key:"historyLocation_" + res.data,
         data:""
         });
         that.setData({
         locateHistoryList: []
         });
         }
         });
         }
         }
         });*/
    }

});