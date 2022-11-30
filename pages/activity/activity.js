// pages/activity/activity.js
// 获取应用实例

import * as UTIL from "../../utils/util";
import * as API from "../../utils/API";

let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scene: '',
    cityAllowList:{
      '北京市':'北京市',
      '威海市': '威海市',
      '济南市': '济南市',
      '青岛市': '青岛市',
      '张家口市': '张家口市',
      '烟台市': '烟台市',
      '廊坊市': '廊坊市',
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
      this.setData({
        scene,
      });
    } else {
      wx.reLaunch({
        url: '/pages/home/home',
      });
    }
  },

  onShow(){
    const { scene, cityAllowList} = this.data;
    console.log("onshow activity")
    if(scene){
      wx.getSetting({
        success:(res) => {
          console.log(res)
          // 如果用户是第一次打开小程序, 或是之前拒绝了定位授权的情况下, 就会进入这个逻辑
          // 备注: 如果用户之前拒绝了定位授权, 那么在 wx.authorize 的时候, 并不会弹窗请求授权
          // , 并且始终会执行 fail -> complete 的逻辑流
          if (!res.authSetting['scope.userLocation']) {
            wx.authorize({
              scope: 'scope.userLocation',
              success:() => {
                // 用户已经同意小程序使用定位功能
                wx.getLocation({
                  type: 'gcj02',
                  success: (res) => {
                    //张掖 37.586305,121.162286
                    // res = {
                    //   latitude:37.586305, 
                    //   longitude:121.162286
                    // }
                    const { latitude, longitude } = UTIL.translateGcj02ToBd09(res);
                    console.log("log")
                    console.log(latitude)
                    console.log(longitude)
                    UTIL.getCityInfoByCoordinate({
                      latitude,
                      longitude,
                    }, {
                      success: (addRes) => {

                        if(addRes.statusCode == 200 && addRes.errMsg === 'request:ok'){
                          try {
                            const { city } = addRes.data.result.ad_info;
                            // if (!!cityAllowList[city]){
                              UTIL.getShopsByCustomLocation({
                                longitude,
                                latitude,
                              }, (shopInfo) => {
                                if (!shopInfo || shopInfo.shopId == 0) {
                                  /** 定位不到店铺时，默认六里桥店 */
                                  /*let latitude = "39.933271";
                                  let longitude =  "116.469183";*/

                                  // let latitude = "39.884627";
                                  // let longitude =  "116.318627";

                                  UTIL.getShopsByCustomLocation({
                                    longitude,
                                    latitude,
                                  }, () => {
                                    if (scene) {
                                      this.translateScene(scene);
                                    }
                                  });
                                } else {
                                  if (scene) {
                                    this.translateScene(scene);
                                  }
                                }
                              })
                              
                            // } else {
                            //   this.transferNotFound();
                            // } 
                          } catch (e) {
                            this.transferNotFound();
                          }
                        }

                      }
                    });
                  }
                });
              },
              fail() {
                /*redirect 开启定位页*/
                wx.navigateTo({
                  url: '/pages/wxAuth/wxAuth',
                })
              },
            })
          } else {
            // 非首次打开小程序, 且之前用户已经允许了定位授权情况下的首页初始化入口
            wx.getLocation({
              type: 'gcj02',
              success: (res) => {
                //张掖
                // res = {
                //   latitude:37.586305, 
                //   longitude:121.162286
                // }
                const { latitude, longitude } =  UTIL.translateGcj02ToBd09(res);
                console.log("log")
                console.log(latitude)
                console.log(longitude)
                UTIL.getCityInfoByCoordinate({
                  latitude,
                  longitude,
                }, {
                  success: (addRes) => {
                    
                    if(addRes.statusCode == 200 && addRes.errMsg === 'request:ok'){
                      try {
                        const { city } = addRes.data.result.ad_info;
                        // if (cityAllowList[city]) {
                          UTIL.getShopsByCustomLocation({
                            longitude,
                            latitude,
                          }, (shopInfo) => {
                            if (!shopInfo || shopInfo.shopId == 0) {

                              /** 定位不到店铺时，默认六里桥店 */
                              /*let latitude = "39.933271";
                              let longitude =  "116.469183";*/

                              // let latitude = "39.884627";
                              // let longitude =  "116.318627";

                              UTIL.getShopsByCustomLocation({
                                longitude,
                                latitude,
                              }, () => {
                                if (scene) {
                                  this.translateScene(scene);
                                }
                              });
                            } else {
                              if (scene) {
                                this.translateScene(scene);
                              }
                            }
                          })
                          
                        // } else {
                        //   this.transferNotFound();
                        // }
                      } catch (e) {
                        this.transferNotFound();
                      }
                    }
                  }
                });
              }
            });
          }
        }
      });
    }
  },

  transferNotFound(){
    wx.showToast({
      title: '歪！你已超出范围，快回来哟！',
      icon:'none'
    })
    this.setData({
      localEmptyDataDI:true
    })
    // wx.redirectTo({
    //   url: '/pages/activity/fission/notFoundShop/notFoundShop'
    // });
  },

  translateScene(scene){
    let that = this;
    if(scene !== 'DQG_fission'){
      UTIL.ajaxCommon(API.URL_WX_XCXLINKPARAMS, {
        scene,
      }, {
        success: (res) => {
          if (res._code == API.SUCCESS_CODE) {
            let paramsArr = [];

            for(let key in res._data){
              if(key != 'path'){
                paramsArr.push(`${key}=${res._data[key]}`);
              }
            }

            if(res._data.path){

            } else {
              console.log("成功调起进入活动页fission")
              wx.redirectTo({
                url: `/pages/activity/fission/fission?${paramsArr.join('&')}`,
                fail(){
                  wx.reLaunch({
                    url: '/pages/index/index',
                  });
                }
              });
            }
          } else {
            wx.showToast({
              title: res._msg,
              icon: 'none'
            })
            that.transferNotFound();
          }
        },
        fail: (res)=>{
          wx.showToast({
            title: '歪！你已超出范围，快回来哟！',
            icon: 'none'
          })
          that.transferNotFound();
        }
      });
    } else {
      console.log("DQG_fission 进入fission");
      wx.redirectTo({
        url: `/pages/activity/fission/fission?from=scanCode`,
        fail(){
          wx.reLaunch({
            url: '/pages/index/index',
          });
        }
      });
    }
  }
})