// pages/transferPage/transferPage.js
import * as UTIL from "../../utils/util";
import * as API from "../../utils/API";

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { scene } = options;

    if(scene){
      UTIL.ajaxCommon(API.URL_WX_XCXLINKPARAMS, {
        scene,
      }, {
        success: (res) => {
          if (res._code == API.SUCCESS_CODE) {
            const { longitude,latitude } = res._data;
            if(longitude && latitude){
              UTIL.getShopsByCustomLocation({
                longitude,
                latitude,
              }, () => {
                let paramsArr = [];

                for(let key in res._data){
                  if(res._data[key] && key != 'xcxPath' && key != 'longitude' && key != 'latitude'){
                    paramsArr.push(`${key}=${res._data[key]}`);
                  }
                }

                if(res._data.xcxPath){
                  wx.redirectTo({
                    url: `/${res._data.xcxPath}?${paramsArr.join('&')}`
                  });
                }
              });
            }
          }
        }
      });
    }
  },

})