import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        content_toast:'如果以上常见问题没有您想了解的内容，请拨打总部客服电话。\n服务时间：',
        last_index:-1,
        questionData:[],
        limit_time:""

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getQuestionData();

    },
    getQuestionData:function()
    {
        let that=this;
       wx.showNavigationBarLoading();
       wx.request({
        url: API.URL_USER_QUESTIONLIST,
        method: "POST",
        data: {
        },
        success: (res) => {
          if (res.data._code == API.SUCCESS_CODE) {
              if(res.data._data!=null)
              {
                  //console.log("数量："+res.data._data.length);
                  var limit_data=[];
                  var limit_time="";
                  if(res.data._data.length==0)
                  {
                    wx.showToast({
                        title: "暂无数据",
                        icon:'none'
                      })
                  }else{
                      for(var i=0;i<res.data._data.length;i++)
                      {
                          if(res.data._data[i].questionid!=999)
                          {
                            limit_data.push(res.data._data[i]);
                          }else{
                            limit_time=res.data._data[i].content;
                          }

                      }

                    that.setData({
                        questionData:limit_data,
                        limit_time:limit_time
                    })
                  }
                 
              }else{
                wx.showToast({
                    title: "暂无数据",
                    icon:'none'
                  })
              }
           
          }else{
              wx.showToast({
                title: res.data._msg,
                icon:'none'
              })
          }
        },
        complete:(res)=>
        {
            wx.hideNavigationBarLoading({
              success: (res) => {},
            });
        }
      });
    }
,
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },
    /**
     * 标题点击 
     */
    titleClickAction:function(e)
    {
        let index = e.currentTarget.dataset.index;
        var questionData=this.data.questionData;
        if(questionData[index].isOpen==null||questionData[index].isOpen==false)
        {
            questionData[index].isOpen=true;
        }else{
            questionData[index].isOpen=false;
        }
        if(this.data.last_index!=-1&&this.data.last_index!=index)
        {
            questionData[this.data.last_index].isOpen=false;
        }
        this.setData({
            questionData,
            last_index:index
        })
        
    


    }
    ,
    /**
     * 拨打电话
     */
    callPhoneClickAction:function()
    {
        UTIL.jjyBILog({
        e: 'click', //事件代码
        oi: '429', //点击对象type，Excel表
        obi: ''
        });
        wx.makePhoneCall({
        phoneNumber: wx.getStorageSync('customerServiceHotline') ? wx.getStorageSync('customerServiceHotline') : '0631-5964556'
        })
    }
    ,

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

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})