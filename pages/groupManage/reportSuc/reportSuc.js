// pages/groupManage/reportSuc/reportSuc.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cuntinue: 3,
    complete: 2
  },
  
  //返回
  backPage(e){
    let {back} = e.currentTarget.dataset;
      let pageList = getCurrentPages();
      let pageLen = pageList.length;
      pageList.map((item,idx) => {
        if (back == 1){
          if (item.route.indexOf('pages/groupManage/reportDiffList/reportDiffList')>= 0){
            wx.navigateBack({
              delta: pageLen-1-idx,
            })
          }
        }
        if (back == 2){
          if (item.route.indexOf('pages/groupManage/userSelf/userSelf')>= 0){
            wx.navigateBack({
              delta: pageLen-1-idx,
            })
          }
        }
      })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      cuntinue: options.cun,
      complete: options.com
    })
  }
})