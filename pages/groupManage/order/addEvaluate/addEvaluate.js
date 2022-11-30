// pages/order/lookInvoice/lookInvoice.js
const UTIL = require('../../../../utils/util.js');
const API = require('../../../../utils/API.js');
let APP = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loadingHidden:true,//loading
    showErrorPage:false,
    errorPageMsg:'',
    options:{},
    canClick:true,
    commentImages:[],
    maxImageNum:10,
    textStarArr:["","差", "一般", "不错", "好", "非常好"],
    minInf:10,
    commentGoodsInputList:[],
    commentLabelsSelect:{},
    contentInfo: '',
    distributionStar: 0,
    storeStar:0,//
    labelList:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {

    this.setData({
      options:options,//orderId // 订单IDorderStoreId =  // 订单商铺IDisB2C||0;/
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },
  /*评价星星*/
  startClick:function(event){
    let {value,type}=event.currentTarget.dataset;
    if(type=='distributionStar'){
      this.setData({
        distributionStar:parseInt(value),
      });
    }else if(type=='storeStar'){
      this.setData({
        storeStar:parseInt(value),
      });
    }
  },
  /*输入框*/
  textareaBlur:function(event){
    let contentInfo=event.detail.value;
    contentInfo=contentInfo.replace(/\s+/g, "");
    this.setData({
      contentInfo:contentInfo,
    });
  },
  /*选择类型标签*/
  selectLable:function(event){
    let {labelList}=this.data;
    let {labelId}=event.currentTarget.dataset;
    for(let i=0;i<labelList.length;i++){
      if(labelList[i].id==labelId){
        labelList[i].select=!labelList[i].select;
      }
    }
    this.setData({
      labelList:labelList,
    });
  },
  /*提交评价*/
  submitEvaluate:function(){
    let that=this;
    let {result,options,commentImages,contentInfo,commentGoodsInputList,distributionStar,storeStar,canClick,labelList}=that.data;
    let shippingType = result.shippingType;
    let canSubmit=true;
    let commentLabels=[];
    if(canClick) {
      for (let i = 0; i < commentGoodsInputList.length; i++) {
        if (!commentGoodsInputList[i].commentGoodsStatus) {
          canSubmit = false;
          break;
        }
      }
      if(shippingType == 110 || shippingType == 112) {
          if(!distributionStar||!storeStar){
            canSubmit = false;
          }
      }else{
        if(!storeStar){
          canSubmit = false;
        }
      }
      if(canSubmit){
        let releaseData = {
          bizId: options.orderStoreId,
          bizType:options.isB2C==1037||options.isB2C==1634?1352:API.EVALUATE_TYPE_180,
          commentGoodsInputList: [],
          commentImages: [],
          commentLabels: [],
          contentInfo: '',
          distributionStar: '',
          storeId: '',
          storeStar: '',
          deliveryTime: '',
          orderTime: '',
          shippingType: '',
          taskType: 208,
          taskId: 0,
          offlineOrderType:""//线下订单类型，线下POS-1122，线下闪电付-1123 ,
        };
        for(let i=0;i<labelList.length;i++){
          if(labelList[i].select){
            commentLabels.push(labelList[i].id);
          }
        }
        releaseData.storeId = result.storeId;
        releaseData.deliveryTime = result.deliveryTime;
        releaseData.orderTime = result.orderTime;
        releaseData.shippingType = result.shippingType;
        releaseData.offlineOrderType=result.offlineOrderType||0;
        releaseData.commentGoodsInputList = commentGoodsInputList;
        releaseData.commentImages = commentImages;
        releaseData.commentLabels = commentLabels;
        releaseData.contentInfo = contentInfo;
        releaseData.distributionStar = distributionStar;
        releaseData.storeStar = storeStar;
        that.setData({
          loadingHidden:false,
          canClick:false,
        });
        UTIL.ajaxCommon(API.URL_COMMENT_SAVE, releaseData,{
          success(res){
            if (res&&res._code == API.SUCCESS_CODE){
              APP.showToast(res._msg||'您的评论提交成功');
              wx.navigateBack({
                delta:1
              });
            }else{
              APP.showToast(res&&res._msg?res._msg:'网络请求出错');
            }
          },
          fail(res){
            APP.showToast(res&&res._msg?res._msg:'网络请求出错');
          },
          complete(){
            that.setData({
              loadingHidden:true,
              canClick:true,
            });
          },
        });
      }else {
        APP.showToast("请填写完整评论信息");
      }
    }
  },
  /*商品评价*/
  goodsEvaluate:function(event){
    let that=this;
    let {commentGoodsInputList}=that.data;
    let {skuId,commentGoodsStatus}=event.currentTarget.dataset;
    for (let i = 0; i < commentGoodsInputList.length; i++) {
      if (commentGoodsInputList[i].skuId ==skuId) {
        commentGoodsInputList[i].commentGoodsStatus = commentGoodsStatus
      }
    }
    that.setData({
      commentGoodsInputList:commentGoodsInputList,
    })
  },
  /*删除图片*/
  delImg:function(event){
    let {fileUrl}=event.target.dataset;
    let newImage=[];
    this.data.commentImages.map(function(value,index){
      if(value!=fileUrl){
        newImage.push(value);
      }
    });
    this.setData({
      commentImages:newImage,
    })
  },
  /*上传图片*/
  updataImage(){
    let {commentImages,maxImageNum}=this.data;
    let that=this;
    if(commentImages.length<maxImageNum){
      wx.chooseImage({
        count: maxImageNum-commentImages.length, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
          let tempFilePaths = res.tempFilePaths;
          that.setData({loadingHidden:false});
          let imgArr=[];
          let num=0;
          for(let i=0;i<tempFilePaths.length;i++){
            let fileName=`file${i}`;
            let formData={
              'token':UTIL.getToken(),
              'memberId': UTIL.getMemberId(),
            };
            formData[fileName]=tempFilePaths[i];
            wx.uploadFile({
              url: API.URL_COMMENT_UPLOADCOMMENTIMAGES, //接口地址
              filePath: tempFilePaths[i],
              name: fileName,
              formData:formData,
              success: function(res){
                res=res.data?JSON.parse(res.data):{};
                //{data: "{"_code":"000000","_msg":null,"_data":[{"fileName"…c78-5dcc-4c54-aa1d-8a36e631f429_1080x1440.jpg"}]}", statusCode: 200, errMsg: "uploadFile:ok"}data: "{"_code":"000000","_msg":null,"_data":[{"fileName":"e973bc78-5dcc-4c54-aa1d-8a36e631f429_1080x1440.jpg","fileUrl":"https://test.images.eartharbor.com/images/customerservice/11036085664541/big/e973bc78-5dcc-4c54-aa1d-8a36e631f429_1080x1440.jpg"}]}"errMsg: "uploadFile:ok"statusCode: 200__proto__: Object
                if(res._code==API.SUCCESS_CODE){
                  commentImages.push(res._data[0]);
                    that.setData({commentImages:commentImages});

                }else{
                  APP.showToast(res._msg||"网络请求出错");
                }
              },
              complete:function(res){
                num++;
                if(num==tempFilePaths.length){
                  that.setData({loadingHidden:true});
                }else{
                  that.setData({loadingHidden:false});
                }
              }
            });
          }
        }
      })
    }else{
      APP.showToast("已达上传图片最大数量");
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that=this;
    let {options,labelList,commentGoodsInputList}=that.data;
    let oData = {
      orderId: options.orderId,
      orderStoreId: options.orderStoreId,
      isB2C:options.isB2C,
    };
    that.setData({
      loadingHidden:false
    });
    UTIL.ajaxCommon(API.URL_COMMENT_TOCOMMENT, oData,{
        success(res){
          if (res._code == API.SUCCESS_CODE){
            let result=res._data;
            commentGoodsInputList=commentGoodsInputList.length>0?commentGoodsInputList:result.goodsList;
            let commentLabelsSelect={};
            if(labelList.length==0){
              for(let i=0;i<result.labelList.length;i++){
                result.labelList[i].select=false;
                labelList.push(result.labelList[i]);
              }
            }
            that.setData({
              labelList:labelList,
              result:result,
              commentLabelsSelect:commentLabelsSelect,
              showErrorPage:false,
              loadingHidden:true,
              errorPageMsg:'',
              commentGoodsInputList:commentGoodsInputList,
            });
          }else{
            that.setData({
              showErrorPage:true,
              errorPageMsg:res._msg||'网络超时，请稍后再试',
            });
            APP.showToast(res._msg||'网络超时，请稍后再试');
          }
        },
        fail(res){
          that.setData({
            showErrorPage:true,
            errorPageMsg:res._msg||'网络超时，请稍后再试',
          });
          APP.showToast('网络超时，请稍后再试');
        },
        complete(){
          that.setData({
            loadingHidden:true,
          });
        },
      });
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