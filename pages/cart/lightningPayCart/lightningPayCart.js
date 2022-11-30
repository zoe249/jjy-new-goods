// pages/cart/lightningPayCart/lightningPayCart.js
const UTIL = require('../../../utils/util.js');
const API = require('../../../utils/API.js');
import { modalResult } from '../../../templates/global/global.js';
let APP = getApp();
/*operaType (integer, optional): 商品操作类型:(按位&操作：[是否能删除商品4][是否最后一个2][是否能添加商品1]) ,
* 能删除4567，最后一个：2367，能加：1357
* */
Page({
  /**
   * 页面的初始数据
   */
  data: {
    loadingHidden:true,//false显示，隐藏
    lightningPayLocationSuccess:false,//闪电购是否已经定位成功
    showBagPop:false,//展示购物袋
    showLocationFailPop:false,//定位失败展示弹窗
    showShopChangePop:false,//展示门店信息变化
    showClearCartPop:false,//清除购物车按钮弹窗
    showDelGoodsPop:false,//删除单个商品
    showLocationFailPage:false,//展示定位rue失败页面
    showInputPage:false,//展示输入条形码页面
    showErrorPage:false,//展示错误页面
    errorData:{},//错误信息
    showData:false,//展示数据页面
    showLocationNoPop:false,//当前定位不存在，接口返回showLocationNoPop
    storageLightningPayCartList:{

    },
    outPutgoodsList:{},//购物车出参
    newGoods:{},//每次操作的商品参数
    verificationShopLocation:{

    },//门店不一致或者不存在的时候返回的信息
    totalNum:0,
    shopName:wx.getStorageSync('shopName')||'',
    barCode:'',
    delGoods:'',
    inputValue:'',
    storageShoppingBagGoods:[],//购物袋
    nowBag:{},//现在选择的购物袋信息
    isIphoneX: APP.globalData.isIphoneX,
    addBackgroundClass:false,
    addBackgroundSkuId:"",
    addBackgroundPluCode:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 进入指定的业务模块
    // 进入指定的业务模块
    // getApp().actionReport('SET_BUSINESS_TYPE', {
    //   // 业务类型(必须)
    //   // 可选值:
    //   //   DEFAULT - 首页
    //   //   O2O     - O2O到家(或电商)
    //   //   SCANGO  - 扫码购
    //   business_type: /* 你的业务类型 */ 'SCANGO'
    // });
    wx.getStorageSync('storageLightningPayCartList');
  },
  confirmBag:function(){
    let that=this;
    let go=false;
      for(let i=0;i<that.data.storageShoppingBagGoods.length;i++){
        if(that.data.storageShoppingBagGoods[i].num>0){
          go=true;
        }
      }
    if(go){
      wx.setStorageSync('storageShoppingBagGoods',that.data.storageShoppingBagGoods);
      that.resetLightningPayCartList();//处理后给小弟
      that.setData({
        showBagPop:false,
        lightningPayLocationSuccess:false,
        storageShoppingBagGoods:[],
      });
      wx.navigateTo({
        url: '/pages/order/fill/fill?orderType=2'
      });
    }else{
      APP.showToast("您尚未选择购物袋");
    }

  },
  /*不需要购物袋*/
  noNeedBag:function(){
    let that=this;
    wx.setStorageSync('storageShoppingBagGoods',[]);
    that.setData({
      showBagPop:false,
      lightningPayLocationSuccess:false,
      storageShoppingBagGoods:[],
    });
    that.resetLightningPayCartList();//下单入参
    wx.navigateTo({
      url: '/pages/order/fill/fill?orderType=2'
    });
  },
  /*q切换购物袋*/
  changeBag:function(event){
    let that=this;
    let skuId=event.target.dataset.skuId;
    let nowBag=that.data.nowBag;
    let storageShoppingBagGoods=that.data.storageShoppingBagGoods;
    for(let i=0;i<storageShoppingBagGoods.length;i++){
      if(storageShoppingBagGoods[i].skuId==skuId){
        nowBag=storageShoppingBagGoods[i];
      }
    }

    this.setData({
      nowBag:nowBag,
    })
  },
  /*购物袋的加*/
  bagMinus:function(event){
    let that=this;
    let num=event.target.dataset.num;
    let skuId=event.target.dataset.skuId;
    let storageShoppingBagGoods=that.data.storageShoppingBagGoods;
    let nowBag=that.data.nowBag;
    if(num>0){
      for(let i=0;i<storageShoppingBagGoods.length;i++){
        if(storageShoppingBagGoods[i].skuId==skuId){
          storageShoppingBagGoods[i].num=num-1;
        }
      }
      nowBag.num=num-1;
      that.setData({
        storageShoppingBagGoods:storageShoppingBagGoods,
        nowBag:nowBag,
      })
    }
  },
  /*购物袋的加*/
  bagPlus:function(event){
    let that=this;
    let num=event.target.dataset.num;
    let skuId=event.target.dataset.skuId;
    let storageShoppingBagGoods=that.data.storageShoppingBagGoods;
    let nowBag=that.data.nowBag;
    for(let i=0;i<storageShoppingBagGoods.length;i++){
      if(storageShoppingBagGoods[i].skuId==skuId){
        storageShoppingBagGoods[i].num=num+1;
      }
    }
    nowBag.num=num+1;
    that.setData({
      storageShoppingBagGoods:storageShoppingBagGoods,
      nowBag:nowBag,
    })
  },
  /*去结算*/
  goPay:function(){
    let that=this;
    let storageLightningPayCartList=wx.getStorageSync('storageLightningPayCartList')||[];
    let storageShoppingBagGoods=[];
    wx.setStorageSync('storageShoppingBagGoods',[]);
    that.setData({
      storageLightningPayCartList:storageLightningPayCartList,
      storageShoppingBagGoods:storageShoppingBagGoods,
    });
    let oData={
      goodsList:storageLightningPayCartList,
      newGoods:{},
    };
    that.setData({loadingHidden:false});
    UTIL.ajaxCommon(API.URL_CART_V2_LIGHTINGPAY,oData, {
      success: function (res) {
        if (res && res._code == API.SUCCESS_CODE) {
          if (res._data.cartMsg) {
            APP.showToast(res._data.cartMsg);
            let newList = [];
            let newLi = {
              goodsId: '',
              num: '',
              pluCode: '',
              skuId: '',
              storeId: '',
              storeType: '',
            };
            let totalNum = 0;
            for (let i = 0; i < res._data.goodsList.length; i++) {
              newLi = {
                goodsId: res._data.goodsList[i].goodsId,
                num: res._data.goodsList[i].num,
                pluCode: res._data.goodsList[i].pluCode,
                skuId: res._data.goodsList[i].skuId,
                storeId: res._data.goodsList[i].storeId,
                storeType: res._data.goodsList[i].storeType,
              };
              totalNum += parseInt(res._data.goodsList[i].num);
              newList.push(newLi);
            }
            wx.setStorageSync('storageLightningPayCartList', newList);
            if (res._data.realPayPrice) {
              res._data.realPayPriceSmall = res._data.realPayPrice.split(".")[1] || '';
              res._data.realPayPriceBig = res._data.realPayPrice.split(".")[0] || 0;
            } else {
              res._data.realPayPriceSmall = 0;
              res._data.realPayPriceBig = 0;
            }
            that.setData({
              outPutgoodsList: res._data,
              totalNum: totalNum,
            });
          }else if(res._data.shoppingBagGoods&&res._data.shoppingBagGoods.length>0){
            /*购物袋*/
            for(let i=0;i<res._data.shoppingBagGoods.length;i++){
              res._data.shoppingBagGoods[i].num=0;
              storageShoppingBagGoods.push(res._data.shoppingBagGoods[i]);
            }
            that.setData({
              storageShoppingBagGoods:storageShoppingBagGoods,
              showBagPop:true,
              nowBag:storageShoppingBagGoods[0],
            });
          }else{
            that.resetLightningPayCartList();//处理后给小弟
            that.setData({
              lightningPayLocationSuccess:false,
              storageShoppingBagGoods:[],
            });
            wx.navigateTo({
              url: '/pages/order/fill/fill?orderType=2'
            });
          }
        } else {
          APP.showToast(res&&res._msg?res._msg:'请求出错，稍后再试');
        }
      },
      fail: function (res) {
        APP.showToast(res&&res._msg?res._msg:'请求出错，稍后再试');
      },
      complete:function(){
        that.setData({loadingHidden:true});
      }
    });
  },
  // 点击输入取消
  clickCancelInput:function(){
    this.setData({
      showInputPage: false,
      barCode: '',
      inputValue: ''
    });
  },
  /*点击输入完成*/
  clickFinishInput:function(){
    let that=this;
    let oData={
      barCode:that.data.inputValue,
      scanScene:1,
      latitude:wx.getStorageSync("latitude"),
      longitude:wx.getStorageSync("longitude"),
    };
    if(!that.data.inputValue){
     APP.showToast('输入内容不能为空')
    }else{
      that.setData({loadingHidden:false});
      UTIL.ajaxCommon(API.URL_GOODS_QUERYSCANCODE_V3,oData,{
        success:function(res){
          if(res&&res._code==API.SUCCESS_CODE){
            that.setData({
              showInputPage:false,
              newGoods:{
                goodsId:res._data.goods.goods.goodsId,
                num:res._data.goods.goods.pluCode&&res._data.goods.goods.pricingMethod==390?res._data.goods.goods.weightValue:1,
                pluCode:res._data.goods.goods.pluCode,
                skuId:res._data.goods.goods.skuId,
                storeId:res._data.goods.store.storeId,
                storeType:res._data.goods.store.storeType,
              },
              inputValue:'',
              addBackgroundClass:true,
              addBackgroundSkuId:res._data.goods.goods.skuId,
              addBackgroundPluCode:res._data.goods.goods.pluCode,
            });
            that.renderGoods();
          }else{
            APP.showToast(res&&res._msg?res._msg:"请求失败");
          }
        },
        fail:(res)=>{
          APP.showToast(res&&res._msg?res._msg:"请求失败");
        },
        complete:function(){
          that.setData({loadingHidden:true,barCode:""});
        }
      });
    }

  },
  /*获取输入的值*/
  getinputValue:function(e){
    this.setData({
      inputValue:e.detail.value.replace(/\s+/g, ""),
    });
  },
  /*取消删除商品*/
  confirmDelGoods:function(){
    let that=this;
    that.setData({
      showDelGoodsPop:false,
      newGoods:that.data.delGoods,
    });
    this.renderGoods();
  },
  /*取消删除商品*/
  cancelDelGoods:function(){
    this.setData({showDelGoodsPop:false,})
  },
  /*商品的减*/
  minusGoods:function(event){
    let that=this;
    if(event.target.dataset.operaType==2||event.target.dataset.operaType==3||event.target.dataset.operaType==7||event.target.dataset.operaType==6){
      that.setData({
        showDelGoodsPop:true,
        delGoods:{
          goodsId:event.target.dataset.goodsId,
          num:-1,
          pluCode:event.target.dataset.pluCode,
          skuId:event.target.dataset.skuId,
          storeId:event.target.dataset.storeId,
          storeType:event.target.dataset.storeType,
        },
        addBackgroundClass:false,
        addBackgroundSkuId:"",
        addBackgroundPluCode:"",
      });
    }else{
      that.setData({
        newGoods:{
          goodsId:event.target.dataset.goodsId,
          num:-1,
          pluCode:event.target.dataset.pluCode,
          skuId:event.target.dataset.skuId,
          storeId:event.target.dataset.storeId,
          storeType:event.target.dataset.storeType,
        },
        addBackgroundClass:false,
        addBackgroundSkuId:"",
        addBackgroundPluCode:"",
      });
      this.renderGoods();
    }
  },
  /*商品的加*/
  plusGoods:function(event){
    let that=this;
      this.setData({
        newGoods:{
          goodsId:event.target.dataset.goodsId,
          num:1,
          pluCode:event.target.dataset.pluCode,
          skuId:event.target.dataset.skuId,
          storeId:event.target.dataset.storeId,
          storeType:event.target.dataset.storeType,
        },
        addBackgroundClass:false,
        addBackgroundSkuId:"",
        addBackgroundPluCode:"",
      });
      this.renderGoods();
  },
  /*手动输入显示*/
  inputShow:function(){
    this.setData({
      showInputPage:true,
    });
  },
  /*清空购物车*/
  clearCart:function(){
    if(this.data.totalNum&&this.data.totalNum!=0){
      this.setData({
        showClearCartPop:true,
        addBackgroundClass:false,
        addBackgroundSkuId:'',
        addBackgroundPluCode:"",
      });
    }else{
      //APP.showToast("购物车数据已经为空");
    }

  },
  /*确认删除购物车*/
  confirmClearCart:function(){
    wx.setStorageSync('storageLightningPayCartList','');
    this.setData({
      showClearCartPop:false,
      newGoods:{},
    });
    this.renderGoods();
  },
  /*取消删除购物车*/
  cancelClearCart:function(){
    this.setData({
      showClearCartPop:false,
    });
  },
  /*渲染页面*/
  renderGoods:function(){
    let that=this;
    let storageLightningPayCartList=wx.getStorageSync('storageLightningPayCartList')||[];
    that.setData({loadingHidden:false});
    that.setData({
      storageLightningPayCartList:storageLightningPayCartList,
      shopName:wx.getStorageSync('shopName')||'',
      barCode:'',
      inputValue:''
    });
    let oData={
      goodsList:storageLightningPayCartList,
      newGoods:that.data.newGoods,
    };
    let newGoods=that.data.newGoods;
    UTIL.ajaxCommon(API.URL_CART_V2_LIGHTINGPAY,oData,{
      success:function(res){
        if(res&&res._code==API.SUCCESS_CODE){
          let newList=[];
          let newLi={
                goodsId:'',
                num:'',
                pluCode:'',
                skuId:'',
                storeId:'',
                storeType:'',
              };
          let totalNum=0;
          if(res._data.cartMsg){
            APP.showToast(res._data.cartMsg);
          }
          for(let i=0;i<res._data.goodsList.length;i++){
            newLi={
              goodsId:res._data.goodsList[i].goodsId,
              num:res._data.goodsList[i].num,
              pluCode:res._data.goodsList[i].pluCode,
              skuId:res._data.goodsList[i].skuId,
              storeId:res._data.goodsList[i].storeId,
              storeType:res._data.goodsList[i].storeType,
            };
            let goodsJson=res._data.goodsList[i];
            totalNum+=parseInt(res._data.goodsList[i].num);
            newList.push(newLi);
            if(newGoods){
              if(newGoods.num>0&&newGoods.goodsId==newLi.goodsId&&newGoods.pluCode==newLi.pluCode&&newGoods.skuId==newLi.skuId&&newGoods.storeId==newLi.storeId&&newGoods.storeType==newLi.storeType){
                // 加入购物车
                // getApp().actionReport('ADD_TO_CART', {
                //   // 条码(可选, 和商品ID二选一)
                //   //barcode: '6930450802814',
                //   // 商品ID(可选, 和条码二选一)
                //   sku_id: newLi.skuId,
                //   // 商品名称(必须)
                //   sku_name: goodsJson.skuName,
                //   // 商品价格(可选, 单位: 分)
                //   sku_price: goodsJson.goodsTotalSrcPrice * 100 || 0,
                // });
              }
            }
          }
          wx.setStorageSync('storageLightningPayCartList',newList);
          if(res._data.realPayPrice){
            res._data.realPayPriceSmall=res._data.realPayPrice.split(".")[1]||'';
            res._data.realPayPriceBig=res._data.realPayPrice.split(".")[0]||0;
          }else{
            res._data.realPayPriceSmall=0;
            res._data.realPayPriceBig=0;
          }
          that.setData({
            outPutgoodsList:res._data,
            totalNum:totalNum,
            showData:true,
            loadingHidden:true,
          });
        }else{
          APP.showToast(res&&res._msg?res._msg:'请求出错，稍后再试');
          that.setData({
            addBackgroundClass:false,
            addBackgroundSkuId:'',
            addBackgroundPluCode:"",
            loadingHidden:true,
          });
        }

      },
      fail:function(res){
        APP.showToast(res&&res._msg?res._msg:'请求出错，稍后再试');
        that.setData({
          loadingHidden:true,
          addBackgroundClass:false,
          addBackgroundSkuId:'',
          addBackgroundPluCode:"",
        });
      },
      complete:function(){
        that.setData({
          newGoods:{},
          barCode:"",
        });
      }
    });
  },
  /*改变定位*/
  changLocation:function(){
    let that=this;
    let verificationShopLocation=that.data.verificationShopLocation.shop;
    let shopInfo = {
      'shopName':verificationShopLocation.shopName,
      'shopId': verificationShopLocation.shopId,
      'centerShopId': verificationShopLocation.centerShopId,
      'cityShopId': verificationShopLocation.cityShopId,
      'warehouseId': verificationShopLocation.warehouseId,
      'centerWarehouseId': verificationShopLocation.centerWarehouseId,
      'cityWarehouseId': verificationShopLocation.cityWarehouseId,
      'channelType': API.CHANNELTYPE_22
    };
    let locationInfo = {
      'latitude':verificationShopLocation.latitude, // response.data.result.ad_info.location.lat,
      'longitude':verificationShopLocation.longitude, // response.data.result.ad_info.location.lng,
      'cityName': verificationShopLocation.cityName,
      'detailAddress': verificationShopLocation.shopAddress
    };
    UTIL.batchSaveObjectItemsToStorage(locationInfo, function () {
          // 更新定位信息到 session
          APP.globalData.locationInfo = locationInfo;
    });
    // 将获取到的 "附近店铺与仓库信息" 缓存到本地
    UTIL.batchSaveObjectItemsToStorage(shopInfo, function () {
      // 将获取到的 "附近店铺与仓库信息" 加载到 globalData 中
      APP.globalData.shopInfo = shopInfo;
      that.setData({
        showShopChangePop:false,
      });
      // getApp().actionReport('SET_STORE_ID', {
      //   // 门店ID(必须, 商户自己的门店ID, 这里仅做唯一标识用)
      //   store_id: verificationShopLocation.shopId || '',
      //   // 门店名称(必须)
      //   store_name: verificationShopLocation.shopName || '',
      //   // 门店所在城市(必须, 请使用城市中文全称, 勿使用行政区划代码或自定义的城市ID等)
      //   store_city: verificationShopLocation.cityName || '',
      // });
      if(wx.getStorageSync('storageLightningPayCartList')){
        APP.showToast("因定位门店位置变化，清空购物车数据");
        wx.setStorageSync('storageLightningPayCartList',[]);
      }
      APP.globalData.needReloadCurrentPageOnShow = true;
      that.renderGoods();
    });
  },
  /**
   * 获取用户当前 GPS 位置坐标
   * 成功时,查处位置信息和店的情况
   */
  lightingGetLocation:function() {
    let that=this;
    wx.showNavigationBarLoading();
    that.setData({loadingHidden:false});
    wx.getLocation({
      type: 'gcj02',
      success: function (geoLocationGcj02) {
        // 初始化 "火星坐标系" 对应的 "百度坐标系" 坐标
        let geoLocationBd09 = UTIL.translateGcj02ToBd09(geoLocationGcj02);
        let locationInfo;
        that.setData({loadingHidden:false,showLocationFailPage:false});
        console.log(geoLocationGcj02);
        UTIL.getCityInfoByCoordinate(geoLocationGcj02, {
          success: function (response1) {
            // 初始化 - 定位信息
            locationInfo = {
              'latitude':geoLocationBd09.latitude, // response.data.result.ad_info.location.lat,
              'longitude':geoLocationBd09.longitude, // response.data.result.ad_info.location.lng,
              'cityName': response1.data.result.ad_info.city,
              'detailAddress': response1.data.result.address
            };
            //家家悦调试数据 7145ceshi
            // locationInfo.latitude = "39.967091";
            // locationInfo.longitude = "116.474910";
            //济南
            // locationInfo.latitude="36.671127";
            // locationInfo.longitude="117.027666";
            /*UTIL.ajaxCommon(API.URL_LOCATION_SHOPQUERYBYLOCATION, locationInfo, {
             success: function (response2) {
             if(response2._code==API.SUCCESS_CODE){
             shopInfo = {
             'shopId': response2._data.shopId,
             'centerShopId': response2._data.centerShopId,
             'cityShopId': response2._data.cityShopId,
             'warehouseId': response2._data.warehouseId,
             'centerWarehouseId': response2._data.centerWarehouseId,
             'cityWarehouseId': response2._data.cityWarehouseId,
             'channelType': API.CHANNELTYPE_22
             };
             that.setData({
             lightningPayLocationInfo:response2._data,
             })
             }else{
             that.setData({
             showErrorPage:true,//展示错误页面
             errorData:response2,//错误信息
             });
             }
             console.log(response2);
             },
             complete: function () {
             wx.hideNavigationBarLoading();
             }
             }
             );*/
            let verificationOrder= {
              channel: 220,//[ios-217；安卓-218；M版-219；小程序-220；线下-221；线下扫码-428] ,
              latitude: locationInfo.latitude ,
              longitude: locationInfo.longitude ,
            };
            /*查询位置信息结果，是否有未核单*/
            UTIL.ajaxCommon(API.URL_ORDER_VERIFICATIONORDER, verificationOrder, {
                  success: function (response3) {
                    if(response3&&response3._code==API.SUCCESS_CODE){
                      if(response3._data.exist==1){
                        wx.redirectTo({
                          url: '/pages/order/lightningPayStatus/lightningPayStatus?status=0'
                        });
                      }else if(response3._data.verificationShopLocation){
                        that.setData({
                          verificationShopLocation:response3._data.verificationShopLocation
                        });
                        if(response3._data.verificationShopLocation.currentShop==1){
                          that.setData({
                            showShopChangePop:true,
                            lightningPayLocationSuccess:true,
                          });
                          //APP.showToast("您还没有选购商品");
                        }else{
                          that.setData({
                            showLocationNoPop:true,
                            showLocationFailPage:true,
                          });
                        }
                      }else{
                        that.setData({
                          showData:true,
                          lightningPayLocationSuccess:true,
                        });
                        // getApp().actionReport('SET_STORE_ID', {
                        //   // 门店ID(必须, 商户自己的门店ID, 这里仅做唯一标识用)
                        //   store_id: wx.getStorageSync('shopId') || '',
                        //   // 门店名称(必须)
                        //   store_name: wx.getStorageSync('shopName') || '',
                        //   // 门店所在城市(必须, 请使用城市中文全称, 勿使用行政区划代码或自定义的城市ID等)
                        //   store_city: wx.getStorageSync('cityName') || '',
                        // });
                        that.renderGoods();
                      }
                    }else{
                      that.setData({
                        showErrorPage:true,//展示错误页面
                        errorData:response3,//错误信息
                      });
                    }
                  },
                  fail:function(response3){
                    that.setData({
                      showErrorPage:true,//展示错误页面
                      errorData:response3||{},//错误信息
                    });
                  },
                  complete: function () {
                    wx.hideNavigationBarLoading();
                    that.setData({loadingHidden:true});
                  }
                }
            );
          },
          fail:function(){
            that.setData({loadingHidden:true});
          }
        });
      },
      fail: function (error) {
        that.setData({
          showLocationFailPop:true,
          showLocationFailPage:true,
        });
        that.setData({loadingHidden:true});
      },
      complete: function (response) {
        wx.hideNavigationBarLoading();
      }
    });
  },
  /*定位失败，地图失败*/
  clickLocationFail:function(){
      this.setData({
        showLocationFailPop:false,
        showLocationFailPage:true,
      });
     /* wx.redirectTo({
        url:'/pages/index/index'
      });*/
    },
  /*定位没有门店*/
  clickLocationNo:function(){
      this.setData({
        showLocationNoPop:false,
      });
      wx.redirectTo({
        url:'/pages/index/index'
      });
  },
  /*扫码接口请求*/
  scanCodeResult:function(){
    let that=this;
    let oData={
      barCode:that.data.barCode,
      scanScene:1,
      latitude:wx.getStorageSync("latitude"),
      longitude:wx.getStorageSync("longitude"),
    };
    UTIL.ajaxCommon(API.URL_GOODS_QUERYSCANCODE_V3,oData,{
      success:function(res){
        if(res&&res._code==API.SUCCESS_CODE){
          that.setData({
            newGoods:{
              goodsId:res._data.goods.goods.goodsId,
              num:res._data.goods.goods.pluCode&&res._data.goods.goods.pricingMethod==390?res._data.goods.goods.weightValue:1,
              pluCode:res._data.goods.goods.pluCode,
              skuId:res._data.goods.goods.skuId,
              storeId:res._data.goods.store.storeId,
              storeType:res._data.goods.store.storeType,
            },
            addBackgroundClass:true,
            addBackgroundSkuId:res._data.goods.goods.skuId,
            addBackgroundPluCode:res._data.goods.goods.pluCode,
          });
          // 扫描到商品(扫码购模块上报)
          // getApp().actionReport('SCAN_CODE', {
          //   // 条码(必须)
          //   barcode: that.data.barCode,
          //   // 商品名称(可选)
          //   sku_name: res._data.goods.goods.skuName || '',
          //   // 商品价格(可选, 单位: 分)
          //   sku_price: (res._data.goods.goods.pluCode ? res._data.goods.goods.weightTotalPrice * 100 : res._data.goods.goods.salePrice * 100) || 0,
          // });
          that.renderGoods();
        }else{
          APP.showToast(res&&res._msg?res._msg:"请求失败");
        }
      },
      fail:(res)=>{
        APP.showToast(res&&res._msg?res._msg:"请求失败");
      },
      complete:function(){
        that.setData({
          barCode:""
        });
      }
    });
  },
  /**
   * 处理闪电付本地数据
   */
  resetLightningPayCartList(){
    let lightningPayCartList = [];
    let outPutgoodsList = this.data.outPutgoodsList||{};
    let storageShoppingBagGoods=this.data.storageShoppingBagGoods;
    let ObjArrGoodsList = outPutgoodsList.goodsList;
    for(let i=0;i<storageShoppingBagGoods.length;i++){
      if(storageShoppingBagGoods[i].num>0){
        ObjArrGoodsList.push(storageShoppingBagGoods[i]);
      }
    }
    let storeArrlist = [];//商店数据处理
    ObjArrGoodsList.forEach(function (obj) {
      let { goodsId, isAddPriceGoods, pluCode, num, proId, proType, skuId, isSelect, storeId, storeType, weightValue} = obj;
      let newGoodsObj = {
        goodsId,
        isAddPriceGoods,
        num,
        proId,
        pluCode,
        proType,
        skuId,
        isSelect,
        weightValue
      };
      let storeItem = {
        goodsList: [newGoodsObj],
        storeId: storeId,
        storeType: storeType,
        isPackage: 0,
      };
      let ispush = false;
      if (!isDefine(storeArrlist)){
        storeArrlist.push(storeItem);
      } else {
        storeArrlist.map(function(item){
          if (item.storeId == storeId){
            item.goodsList.push(newGoodsObj);
            ispush = true;
          }
        });
        if (!ispush){
          storeArrlist.push(storeItem);
        }
      }
    });
    /**
     * 变量是否存在或已经定义
     * @para var 直接传入变量即可
     */
    function isDefine(para) {
      if (typeof para == 'undefined' || para == '' || para == null || para == undefined) return false;
      else return true;
    }
    wx.setStorageSync("lightningPayComfirm", JSON.stringify(storeArrlist));
    return storeArrlist;
  },

  /*
  * 调用扫一扫*/
  lightingScanCode:function(){
    let that=this;
    this.setData({
      showInputPage:false,
      barCode:'',
      inputValue:''
    });
    // 开始扫码(扫码购模块上报)
    // getApp().actionReport('START_SCAN_CODE');
    // 只允许从相机扫码
    wx.scanCode({
      onlyFromCamera: true,
      scanType:['barCode'],//扫码类型，参数类型是数组，二维码是'qrCode'，一维码是'barCode'，DataMatrix是‘datamatrix’，pdf417是‘pdf417’
      success: (res) => {
        this.setData({
          barCode:res.result
        });
        that.scanCodeResult();
      },
      fail:(res)=>{
        //APP.showToast('扫码失败');
      }
    })
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
    if(!UTIL.isLogin()){
      wx.navigateTo({
        url: "./../../user/wxLogin/wxLogin?from=cart"
      });
    }else{
      if(this.data.lightningPayLocationSuccess){
       /* this.setData({
          verificationShopLocation:{
            shop:{
                "shopId":10002,
                "shopName":"家家悦优鲜北京博瑞店",
                "shopLevel":82,
                "cityName":"北京市",
                "nearMsg":null,
                "nearShop":1,
                "shopAddress":"北京市朝阳区东三环北路28号博瑞大厦B座1层1#1",
                "longitude":"116.469183",
                "latitude":"39.933271",
                "warehouseId":10003,
                "centerShopId":10000,
                "centerWarehouseId":10014,
                "shopPointList":[{"lat":39.927278,"lng":116.497149},{"lat":39.923073,"lng":116.481626},{"lat":39.923848,"lng":116.446269},{"lat":39.945535,"lng":116.448568},{"lat":39.953611,"lng":116.49413},{"lat":39.953611,"lng":116.49413},{"lat":39.940453,"lng":116.496098}],
                "cityShopId":0,
                "cityWarehouseId":0,
                'channelType': API.CHANNELTYPE_22
              }
          },
          showData:true
        });
        this.changLocation();*/
        this.renderGoods();
      }else{
        this.lightingGetLocation();
      }

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
});