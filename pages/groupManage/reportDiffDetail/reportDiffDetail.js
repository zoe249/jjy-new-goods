// pages/groupManage/reportDiffDetail/reportDiffDetail.js
import * as UTIL from '../../../utils/util.js';
import * as API from '../../../utils/API.js';
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadingHidden:true,
    //本次需要上传到服务端的图片数量
    num_need_toService:0,
    commentImages:[],
    maxImageNum:9,
    isEdit: false,
    types: ["货少","货多","质量问题"],
    statusDis:['待审核','审核通过','审核失败','已完结'],
    approvedStatus :["审核通过","审核失败"],
    index: 0,
    num:'',
    dec:'',
    isSub: false,
    emptyMsg:'',
    decLen:  0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let reportItem = APP.globalData.reportItem;
    let maxNum = reportItem.pricingMethod == 391?reportItem.goodsTotalWeight:reportItem.goodsNumReal;
    this.setData({
      isEdit: options.upStatus==0? true: false,
      batchId: reportItem.batchId,
      goodsSkuId:reportItem.goodsSkuId,
      shopId: options.shopId,
      addrId: options.addrId,
      maxNum,
      reportItem
    })
  },
  onShow(){
    if(!this.data.isEdit){
      this.getDetail();
    }
  },
  getDetail(){
    let {
      addrId,
      shopId,
      batchId,
      goodsSkuId,
    } = this.data;
    UTIL.ajaxCommon(API.URL_ZB_STOCKDIFF_VIEW, {
      addrId,
      shopId,
      batchId,
      goodsSkuId,
    }, {
      success: (res) => {
        if (res._code == API.SUCCESS_CODE) {
         // console.log(res);
          var img_s=[];
          if(res._data!=null&&res._data.imgUrl!=null&&res._data.imgUrl!='')
          {
            img_s= res._data.imgUrl.split(';');
          }
          // //测试
          // var cs="http://118.190.148.187/images/comment/24895/middle/f713e3c9-74ef-4a59-8857-f6a59c1953b2_887x1920.jpg;http://118.190.148.187/images/comment/24895/middle/005974a8-6918-4c80-973a-6e006bf536f0_1920x887.jpg;http://118.190.148.187/images/comment/24895/middle/06fa785c-36dc-4fd3-bb58-f3f10769789e_887x1920.jpg;http://118.190.148.187/images/comment/24895/middle/ead47795-1c62-40ea-b8b1-52632d1efee5_887x1920.jpg;http://118.190.148.187/images/comment/24895/middle/a5f50512-36c7-4d5b-be83-4faf33717817_1920x887.jpg;http://118.190.148.187/images/comment/24895/middle/b9b70bc9-2fdf-41e7-9011-e731b2ee7d03_887x1920.jpg;http://118.190.148.187/images/comment/24895/middle/31b5ea01-261e-4b67-b558-9f60a24cae9a_1920x887.jpg;http://118.190.148.187/images/comment/24895/middle/c98390fc-7676-4ba8-a057-32fe71083cec_887x1920.jpg;http://118.190.148.187/images/comment/24895/middle/90613878-d3c2-4810-9b7d-cee757b30a18_887x1920.jpg";
          // img_s= cs.split(';');

          this.setData({
            details: res._data,
            commentImages:img_s
          })
       

        } else {
          this.setData({
            empty: true,
            emptyMsg: res._msg
          })
        }
      }
    })
    // URL_ZB_STOCKDIFF_VIEW
  },
  bindPickerChange(e){
    this.setData({
      index: e.detail.value
    })
  },
  numChange(e){
    this.setData({
      num: e.detail.value
    })
  },
  decChange(e){
    let {value} = e.detail;
    value = UTIL.filterEmoji(value);
    value = value.replace(/\s+/g, "");
    this.setData({
      dec: value,
      decLen: value.length>120?120: value.length
    })
  },
  submiteFormData(e){
    let that = this;
    let {batchId,goodsSkuId,index,num,dec,isSub,maxNum,addrId,shopId} = this.data;
    let diffType = UTIL.FloatAdd(index,1);

    if(num<1){
      APP.showToast('请输入差异数量')
      return;
    }
    if (num > maxNum && index != 1){
      APP.showToast('差异数量不能大于签收数量');
      return;
    }
    if(UTIL.trim(dec) == ""){
      APP.showToast('请输入问题描述');
      return;
    }
    if(index==2&&that.data.commentImages.length==0)
    {
      //质量问题，图片必传
      APP.showToast('质量问题请上传图片');
      return;
    }
    let param = {
      batchId,
      diffDesc: dec,
      goodsSkuId,
      num:parseInt(num), 
      diffType,
      addrId:parseInt(addrId), 
      shopId:parseInt(shopId), 
     imgUrl:that.data.commentImages
    }
    if (isSub) return;
    that.setData({
      isSub: true
    })
    UTIL.ajaxCommon(API.URL_ZB_STOCKDIFF_SAVE, param, {
      success(res) {
        if (res&&res._code == API.SUCCESS_CODE) {
          APP.globalData.reportDiff = {
            batchId,
            goodsSkuId
          }
          that.getDetail();
          that.setData({
            isEdit: false
          })
          wx.navigateTo({
            url: `/pages/groupManage/reportSuc/reportSuc`,
          })
        }
      },
      complete(res){
        if (res._code != API.SUCCESS_CODE) {
          APP.showToast(res._msg || '网络异常，请稍后再试！')
        }  
        that.setData({
          isSub: false
        })
      }
    })
  },
  onUnload(){
    APP.globalData.reportItem = {}
  },
  showImg:function(event)
  {
    var that=this;
    let {fileUrl}=event.target.dataset;
    wx.previewImage({
      current: fileUrl, // 当前显示图片的http链接
      urls: that.data.commentImages // 需要预览的图片http链接列表
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
    let dWidth=wx.getSystemInfoSync().windowWidth;
    let {commentImages,maxImageNum}=this.data;
    let that=this;
    if(commentImages.length<maxImageNum){
      wx.chooseMedia({
        count: maxImageNum-commentImages.length, // 默认9
        mediaType: ['image'],
        sizeType: [ 'compressed'], // 可以指定是原图还是压缩图，默认二者都有 original 原图 compressed缩略图
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          let tempFiles = res.tempFiles;
          that.setData({loadingHidden:false});         
          let limit_size=300;
          var path_toService_array=[];
          for(let i=0;i<tempFiles.length;i++){
            let size= tempFiles[i].size;
            path_toService_array.push(tempFiles[i].tempFilePath);
            console.log("图片："+tempFiles[i].size/1024+'kb');
            //压缩处理
            // if(size>1024*limit_size)
            // {
            //   that.getLessLimitSizeImage('canvas',tempFiles[i].tempFilePath,limit_size,dWidth,function(img)
            //   {
            //     wx.getFileInfo({
            //       filePath: img,
            //       success:function(res)
            //       {
            //         console.log("压缩后："+res.size/1024+'kb');
            //         path_toService_array[i]=img;
                 
            //       }
            //     })
            //   }
            //   );
            // }
           that.uploadPicToService(path_toService_array,i);
            
         
          }
        }
      })
    }else{
      APP.showToast("已达上传图片最大数量");
    }
  },
  /**
   * 压缩前 处理
   */
    getLessLimitSizeImage:function(canvasId,imagePath,limitSize,window_width,callBack)
    {
      var that=this;
      this.checkImageSize(imagePath,limitSize,
        (moreRes)=>{
          wx.getImageInfo({
            src: imagePath,
            success:function(imageInfo)
            {
             // var maxSide=Math.max(imageInfo.width,imageInfo.height);
              var maxSide=imageInfo.width;
              var scale=1;
              console.log("原来",imageInfo.width,imageInfo.height);
              if(maxSide>window_width)
              {
                scale=window_width/maxSide
              }else{
                console.log("暂停止，可以再次设置压缩");
                callBack(imagePath)
                //scale=0.75; 
              }
              console.log("比例",scale);
              var imgW=Math.trunc(imageInfo.width*scale);
              var imgH=Math.trunc(imageInfo.height*scale);
              console.log("调整",imgW,imgH);
              that.getCanvasImage(canvasId,imagePath,imgW,imgH,
                (pressImgPath)=>{
                  console.log("再次调用 ",imgW,imgH);
                  that.getLessLimitSizeImage(canvasId,pressImgPath,limitSize,window_width,callBack);
                })

            }
          })
        },
        (lessRes) =>{
        callBack(imagePath)
      }
     )
      


    },

    
    /**
     * 画布处理
     */
    getCanvasImage(canvasId,imagePath,imageW,imageH,getImgsuccess)
    {
      var that=this;
      const ctx=wx.createCanvasContext(canvasId);
      ctx.drawImage(imagePath, 0, 0, imageW, imageH);
      setTimeout(function() { 

      ctx.draw(false, 
         setTimeout(function() { 
          wx.canvasToTempFilePath({
              canvasId: canvasId,
              x: 0,
              y: 0,
              width: imageW,
              height: imageH,
              quality: 1,
              success(res) {
                console.log('压缩成功');
                getImgsuccess(res.tempFilePath)
              }
              ,
              fail(res)
              {
                console.log("压缩失败:",res);
              }
            
          }
          );
         
        }, 200));
    
      },300);
    }
    ,
    /**
     * 判断图片是否满足大小要求
     */
    checkImageSize(imagePath,limitSize,moreCallBack,lessCallBack)
    {
      wx.getFileInfo({
        filePath: imagePath,
        success(res)
        {
          console.log("check:图片大小:",res.size/1024,'kb');
          if(res.size>1024*limitSize)
          {
            moreCallBack();
          }else{
            lessCallBack();
          }
        }
      })

    }
    ,
  /**
   * 上传单张图片至服务端
   */
  uploadPicToService:function(tempFiles,index)
  {
       let that=this;
       let fileName=`file${index}`;
       let formData={
         'token':UTIL.getToken(),
         'memberId': UTIL.getMemberId(),
       };
       formData[fileName]=tempFiles[index];
      var  commentImages=that.data.commentImages;
            wx.uploadFile({
              url: API.URL_USER_STOCKDIFF_UPLOADIMAGE, 
              filePath: tempFiles[index],
              name: fileName,
              formData:formData,
              success: function(res){
                res=res.data?JSON.parse(res.data):{}; 
                if(res._code==API.SUCCESS_CODE){
                  commentImages.push(res._data[0]);
                  that.setData({commentImages:commentImages});

                }else{
                  APP.showToast(res._msg||"网络请求出错");
                }
              },
              complete:function(res){
                that.setData({
                  num_need_toService:that.data.num_need_toService+1
                })
                if(that.data.num_need_toService==tempFiles.length){
                  that.setData({loadingHidden:true});
                  that.setData({
                    num_need_toService:0
                  })
                }else{
                  that.setData({loadingHidden:false});
                
                }
              }
            });
  }
})