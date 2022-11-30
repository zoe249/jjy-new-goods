// pages/groupBuy/createGroup/createGroup.js
import * as UTIL from "../../../utils/util";
import * as API from "../../../utils/API";
import {modalResult} from "../../../templates/global/global";
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gbId: 0,
    groupDetail: {},
    formType: 0,
    buttonText: '',
    disabled: false,
    showLoginPop: false
  },
  // closePop: function () {
  //   this.setData({
  //     showLoginPop: false
  //   })
  // },
  // goLogin: function () {
  //   wx.navigateTo({
  //     url: '/pages/user/wxLogin/wxLogin',
  //   });
  //   this.setData({
  //     showLoginPop: false
  //   })
  // },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let { scene, q } = options;

    if(q){
      q = decodeURIComponent(q);

      let result = /scene=(.*)/.exec(q);

      if(result.length > 1){
        scene = result[1];
      }
    } else if(scene){
      scene = decodeURIComponent(scene);
    }

    if(scene){

      scene = decodeURIComponent(scene);

      that.resolveScene(scene, (res) => {
        const { latitude, longitude, proId=0, skuId=0,shopId=0} = res;
        that.setData({
          proId,
          skuId,
        });
        if(shopId){
          UTIL.byShopIdQueryShopInfo({shopId},() => {
            that.getGroupDetail();
          })
        }else if (longitude && latitude) {
          UTIL.getShopsByCustomLocation({
            longitude,
            latitude,
          }, () => {
            that.getGroupDetail();
          });
        } else {
          APP.showToast('参数错误，解析参数无定位');
        }
      });
    } else{
      const { proId = 0, skuId = 0 } = options;

      that.setData({
        proId,
        skuId,
      }, ()=> {
          that.getGroupDetail();
        });

    }

    wx.getStorage({
      key: 'loginFlag',
      success: (res) => {
        that.setData({
          isLogin: res.data == 1,
        });
      }
    });
    // if (!UTIL.isLogin()) {
    //   this.setData({
    //     showLoginPop: true
    //   })
    // }
  },

  onShow(){
    UTIL.clearCartData();

    let { isLogin } = this.data;

    wx.getStorage({
      key: 'loginFlag',
      success: (res) => {
        let loginFlag = res.data == 1;

        if(loginFlag != isLogin){
          this.getGroupDetail();
        }
      }
    });
  },
  // 拼团数量取消
  cancelPopGroupNum(){
    this.setData({
      showPopGroupNum:false
    });
  },
  // 拼团数量确认
  confirmPopGroupNum(e){
    let that=this;
    let {formType=0}=this.data;
    let goodsGroupInfo=e.detail;

    let groupInfoForFill = {
        proId: goodsGroupInfo.proId,
        proType: goodsGroupInfo.proType || 1821,
        groupAddress: goodsGroupInfo.groupAddress||'',
        groupMode: goodsGroupInfo.groupMode,
        shopId: goodsGroupInfo.shopId,
        groupMemberId: goodsGroupInfo.groupMemberId||'',
        storeList: [{
          storeId: goodsGroupInfo.storeId,
          storeType: goodsGroupInfo.storeType,
          goodsList: [{
            goodsId: goodsGroupInfo.goodsId,
            isAddPriceGoods: 0,
            isSelect: 1,
            num: goodsGroupInfo.num,
            pluCode: "",
            proId: goodsGroupInfo.proId,
            proType:goodsGroupInfo.proType || 1821,
            skuId: goodsGroupInfo.skuId,
            weightValue: goodsGroupInfo.weightValue,
          }],
        }],
        isPackage: 0,
        groupId: goodsGroupInfo.groupId||'',
      };
    wx.setStorageSync('groupInfo', groupInfoForFill);
    if (goodsGroupInfo.proType == 1888) {
      wx.navigateTo({
        url: `/pages/groupManage/fill/fill?isGroup=1${formType == 1 ? '&orderFlag=999&orderType=5' : ''}`,
      });
    } else {
      wx.navigateTo({
        url: `/pages/order/fill/fill?isGroup=1${formType == 1 ? '&orderFlag=999&orderType=5' : ''}`,
      });
    }
    this.setData({
      showPopGroupNum:false
    });
  },

  /* 解析scene */
  resolveScene(scene, callback){
    UTIL.ajaxCommon(API.URL_WX_XCXLINKPARAMS, {
      scene,
    }, {
      success: (res) => {
        if (res&&res._code == API.SUCCESS_CODE) {
          callback(res._data);
        }
      }
    });
  },

  /** 获取团详情 */
  getGroupDetail(){
    let {proId=0, skuId=0} = this.data;
    //proId=600;skuId=10898;
    if(proId && skuId){
      UTIL.ajaxCommon(`${API.URL_PREFIX}/promotion/otoGroupBuyDetailPrivate`, {
        proId,
        skuId,
      }, {
        'success': (res) => {
          if(res&&res._code == API.SUCCESS_CODE){
            if(!res._data.memberList){
              res._data.memberList = [];
            }

            res._data.memberList.length = Math.min(res._data.needJoinCount, 5);

            this.setData({
              groupDetail: res._data,
            });
          } else {
            APP.showToast(res&&res._msg?res._msg:'网络请求出错');
          }
        },
        fail:(res)=>{
          APP.showToast(res&&res._msg?res._msg:'网络请求出错')
        }
      })
    }else{
      APP.showToast('私有拼团参数出错');
    }
  },

  /** 我要参团 */
  joinGroup(){
    const { groupDetail,formType,resolveSceneJson} = this.data;
    let that=this;
    function join() {
      that.setData({
        showPopGroupNum:true,
        goodsGroupInfo:{
            coverImage:groupDetail.coverImage||'',//封面图
            salePrice:groupDetail.goodsPrice ,//商品拼团单价 ,
            goodsName:groupDetail.shortTitle||groupDetail.goodsName || '' ,//商品名称 
            proStock:groupDetail.surplusStock ,//促销库存 ,称重的是重量g,计件的是个数，称重的后台都是按g来的
            groupMode: groupDetail.groupMode,
            groupMemberId: resolveSceneJson && resolveSceneJson.shareMemberId ? resolveSceneJson.shareMemberId : 0,
            minBuyCount:groupDetail.minBuyCount||1, //起购量 ，称重的是重量，计数的是个数,
            minBuyCountUnit: groupDetail.minBuyCountUnit,//最小购买单位 ,
            groupAddress: (JSON.stringify(groupDetail.address) == '{}' || !groupDetail.address) ? null : groupDetail.address,
            pricingMethod:groupDetail.pricingMethod,//计价方式: 390-计数；391-计重 ,
            shopId: groupDetail.shopId,//当前商品所属门店
            storeId: groupDetail.storeId,
            storeType: groupDetail.storeType,
            groupId: groupDetail.gbId||'',
            goodsId: groupDetail.goodsId,
            "privateGroup": groupDetail.privateGroup,
            num: groupDetail.pricingMethod == 391 ? 1 : groupDetail.storeType == 1037 ? 1 : groupDetail.minBuyCount || 1,
            pluCode: "",
            proId: groupDetail.proId,
            proType:groupDetail.proType || 1821,
            skuId:groupDetail.skuId,
            weightValue: groupDetail.pricingMethod == 391 ? groupDetail.minBuyCount : 0 || 0,
            groupId: groupDetail.gbId||'',
          }      
      });
    }
    if(UTIL.isLogin()){
      if(!this.data.disabled){
        if(formType == 1){
          join();
        } else {
          this.setData({
            disabled: true,
          });

          UTIL.ajaxCommon(API.URL_OTOVALIDATEJOINGROUPBUY, {
            gbId: groupDetail.gbId,
            goodsSkuId: groupDetail.skuId,
            proId: groupDetail.proId,
            shopId: groupDetail.shopId,
            warehouseId: groupDetail.warehouseId,
            createGb: true,
          }, {
            'success': (res)=>{
              this.setData({
                disabled: false,
              });
              if(res&&res._code == API.SUCCESS_CODE){
                join();
              } else if (res&&res._code == '001113'){
                APP.showModal({
                  content: res&&res._msg?res._msg:'网络请求出错',
                  showCancel: false,
                  confirmText: '我知道了',
                });

                this.setData({
                  buttonText: '逛逛家家悦优鲜',
                });
              } else {
                APP.showModal({
                  content: res&&res._msg?res._msg:'网络请求出错',
                  showCancel: false,
                  confirmText: '我知道了',
                });
              }
            },
            fail:(res)=>{
              APP.showToast(res&&res._msg?res._msg:'网络请求出错')
            }
          });
        }
      }
    } else {
      wx.navigateTo({
        url: '/pages/user/wxLogin/wxLogin',
      });
    }
  },

  /** 查看我的团 */
  lookMyGroup(){
    const { groupDetail, formType } = this.data;

    if(groupDetail.gbEffectiveStatus == 2){
      wx.redirectTo({
        url: `/pages/order/detail/detail?orderId=${groupDetail.myOrderId || ''}`,
      });
    } else {
      wx.redirectTo({
        url: `/pages/groupBuy/groupBuyDetail/groupBuyDetail?gbId=${groupDetail.gbId}&formType=${formType}&orderId=${groupDetail.myOrderId||''}`,
      });
    }

  },

  jumpToGroupList(){
    const { from, formType } = this.data;

    if(from == 'groupBuyList'){
      wx.redirectTo({
        url: `/pages/groupBuy/groupBuyGoodsList/groupBuyGoodsList?from=groupBuyDetail&formType=${formType}`,
      });
    } else {
      wx.navigateTo({
        url: `/pages/groupBuy/groupBuyGoodsList/groupBuyGoodsList?from=groupBuyDetail&formType=${formType}`,
      });
    }

  },

  /** 逛逛家家悦优鲜 */
  goHome(){
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },

  modalCallback(event) {
    if(modalResult(event)){
      APP.hideModal();
    }
  },
})