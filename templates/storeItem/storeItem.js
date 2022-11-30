// templates/storeItem/storeItem.js
import * as $ from '../../pages/AA-RefactorProject/common/js/js.js'
const APP = getApp();
/**
 * 当用户点击首页默认推荐的店铺列表项时, 以当前用户选择的店铺的经纬度作为用户当前位置, 进而方便查询周围店铺
 * @param e tap 事件的 currentTarget 里保存着当前选择的店铺定位数据
 */
function relocateByShopLocation(e) {
  // 初始化
  let { item, isGroupManage} = e.currentTarget.dataset;
  let { longitude, latitude, cityName, shopAddress,shopId} = item;
  // 用于避免理论上: 从 分享页/活动页 等页面进入门店列表页时, hasSwitchPos 为 0, 导致无法根据门店坐标进行定位的问题
  console.log(item)
  APP.globalData.hasSwitchPos = 1;
  wx.removeStorageSync('hasSwitchPos');
  wx.removeStorageSync('shopAttribute');
    var url = "";
    //是否做选择门店操作
    this.setData({
      isChose:true
    })
    //新老版本判断-开始
    wx.setStorageSync('isNewHome', item.is_new_home);
    wx.setStorageSync('is_new_home', item.is_new_home);
    if(item.is_new_home==1)
    {
        wx.setStorageSync('shareLgt',{longitude:item.longitude,latitude:item.latitude})
        delete item.longitude
        delete item.latitude
        $.batchSaveObjectItemsToStorage(item);
        if(item.shopAttribute==2)
        {
            // APP.globalData.selfMentionPoint = {...item,provinceName:item.provinceName,address:item.shopAddress,addrTag:item.shopName}
            //社团门店 跳转到社团界面
            url='/pages/AA-RefactorProject/pages/Community/index?needShareLgt=1'
        }else{
            //跳转到 优鲜界面
            $.batchSaveObjectItemsToStorage(item);
            url= '/pages/AA-RefactorProject/pages/index/index?needShareLgt=1'
        }
       

    }else{
      delete item.longitude
      delete item.latitude
      $.batchSaveObjectItemsToStorage(item);
         //旧版
         if (isGroupManage){
            url = '/pages/groupManage/index/index?isChangeShopPositionByUser=1&lng=' + longitude + '&lat=' + latitude + '&address=' + shopAddress + '&city=' + cityName+'&getYXOrGroupShops=1&shopId='+shopId
        } else {
            url = '/pages/index/index?isChangeShopPositionByUser=1&lng=' + longitude + '&lat=' + latitude + '&address=' + shopAddress + '&city=' + cityName+'&getYXOrGroupShops=1&shopId='+shopId
        }

    }
    console.log(url)
   //新老版本判断-结束
    wx.reLaunch({
        url
    })
}

export {
  relocateByShopLocation,
}