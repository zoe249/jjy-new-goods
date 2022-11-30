// pages/refund/submit.js
const UTIL = require('../../../../utils/util.js');
const API = require('../../../../utils/API.js');
let APP = getApp();
const $formateTimeDate=(time_str)=>{
  let date = new Date(parseFloat(time_str));
  let y = date.getFullYear();
  let m = (date.getMonth() + 1);
  let d = date.getDate();
  let h = date.getHours();
  let min = date.getMinutes();
  let s = date.getSeconds();

  if (m < 10) {
    m = '0' + m;
  }
  if (h < 10) {
    h = '0' + h;
  }
  if (min < 10) {
    min = '0' + min;
  }
  if (s < 10) {
    s = '0' + s;
  }
  if (d < 10) {
    d = '0' + d;
  }
  return (y + '-' + m + '-' + d )
};
const $timeSelectFormate=(time_str)=>{
  let date = new Date(parseFloat(time_str));
  let y = date.getFullYear();
  let m = (date.getMonth() + 1);
  let d = date.getDate();
  let h = date.getHours();
  let min = date.getMinutes();
  let s = date.getSeconds();
  let week = "";
  switch (date.getDay()) {
    case 0:
      week = "星期日";
      break;
    case 1:
      week = "星期一";
      break;
    case 2:
      week = "星期二";
      break;
    case 3:
      week = "星期三";
      break;
    case 4:
      week = "星期四";
      break;
    case 5:
      week = "星期五";
      break;
    case 6:
      week = "星期六";
      break;
  };
  if (m < 10) {
    m = '0' + m;
  }
  if (h < 10) {
    h = '0' + h;
  }
  if (min < 10) {
    min = '0' + min;
  }
  if (s < 10) {
    s = '0' + s;
  }
  if (d < 10) {
    d = '0' + d;
  }
  return (y + '/' + m + '/' + d +' '+week)
};

Page({
  /**
   * 页面的初始数据
   */
  data: {
    refundNum:1,
    refundReason:-1,
    refundReasonText:'请选择退款原因(必填)',
    refundReasonNow:-1,
    refundReasonTextNow:'请选择退款原因(必填)',
    showRefundReason:false,
    commentImages:[],
    isNeedPickup:1136,//isNeedPickup (integer, optional): 是否需要取货（物流发货-1137；送货至门店-1136；上门取件-1135；退款不退货-1191；异常批次订单-1188；客户未签收货物-1167）【必填】 ,
    remarks:'',//原因输入框
    minTextNum:5,//原因最少输入字数
    maxTextNum:200,//原因最多字数
    refundSkuJson:{},//售后的商品列表
    dateList:[],//日历时间列表
    dateTime:'',
    dateText:'请点击日历选择取件时间',//售后日历
    dateTimeNow:'',//上门时间现在选择的
    showPopDateBox:false,
    shippingTypeNow:'',//当前配送类型
    forMPage:'',//对应的m版跳转的页面
    refundGoodsSkuJson:{},//订单详情的skuid等字段
    detailData:{},//订单详情的所有数据
    showErrorPage:false,
    errorPageMsg:'',
    loadingHidden:true,
    maxImageNum:3,
    userName:'',
    userPhone:'',
    orderItemId:'',
    permitReturnCount:0,
    canShowToHome:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
    let refundGoodsSkuJson=options.refundGoodsSkuJson?JSON.parse(options.refundGoodsSkuJson):{};
    let orderId=options.orderId;
    let orderStoreId=options.orderStoreId;
    let forMPage=options.forMPage||'';
    let orderItemId=refundGoodsSkuJson.orderItemId||'';
    that.setData({
      refundGoodsSkuJson:refundGoodsSkuJson,
      forMPage:forMPage,
      orderId:orderId,
      orderStoreId:orderStoreId,
      orderItemId:orderItemId,
    });

  },
  /*输入联系人*/
  inputName:function(event){
    let name=event.detail.value;
    name=UTIL.filterEmoji(name);
    name=name.replace(/\s+/g, "");
    this.setData({
      userName:name,
    });
  },
  /*输入手机号*/
  inputPhone:function(event){
    let phone=event.detail.value;
    phone=UTIL.filterEmoji(phone);
    phone=phone.replace(/\s+/g, "");
    if(phone.length==1){phone=phone.replace(/[^1-9]/g,'')}else{phone=phone.replace(/\D/g,'')};
    this.setData({
      userPhone:phone
    });
  },
  /*删除图片*/
  delImg:function(event){
    let {fileUrl}=event.target.dataset;
    let newImage=[];
    this.data.commentImages.map(function(value,index){
      if(value.fileUrl!=fileUrl){
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
             'orderStoreId':that.data.orderStoreId,
           };
           formData[fileName]=tempFilePaths[i];
           wx.uploadFile({
             url: API.URL_CUSTOMERSERVICE_UPLOAD, //仅为示例，非真实的接口地址
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
    }

  },
  /*更改取货方式*/
  changeIsNeedPickup(event){
    let {isNeedPickup}=event.target.dataset;
    this.setData({
      'isNeedPickup':isNeedPickup
    })
  },
  /*提交售后申请*/
  btnSubmit(){
    let that=this;
    let shippingTypeNow=that.data.shippingTypeNow;
    let goodsSence=that.data.detailData.goodsSence;
    that.setData({
      userName:UTIL.filterEmoji(that.data.userName).trim(''),
      userPhone:UTIL.filterEmoji(that.data.userPhone).trim(''),
      remarks:UTIL.filterEmoji(that.data.remarks).trim(''),
    });
    if(that.data.refundReason==-1){
      APP.showToast("请选择退款原因");
    }else if(that.data.refundNum <= 0){
      APP.showToast("申请数量不能为0");
    }else if(that.data.minTextNum>that.data.remarks.length){
      APP.showToast(`问题描述信息至少为${that.data.minTextNum}个汉字`);
    }else if(!that.data.userName&&(shippingTypeNow==1022||shippingTypeNow==1023||shippingTypeNow==1024)){
      APP.showToast("请填写联系人");
    }else if(!that.data.userPhone&&(shippingTypeNow==1022||shippingTypeNow==1023||shippingTypeNow==1024)){
      APP.showToast("请填写联系人手机号");
    }else if(that.data.commentImages.length==0){
      APP.showToast("请上传图片");
    }else {
      let canSubmit = true;
      let img=that.data.commentImages;
      let fileNameArr=[];
      that.data.commentImages.map(function(value,index){
        fileNameArr.push(value.fileName);
      });
      let saveData = {
        orderGoodsCount:that.data.detailData.allOrderGoodsCount,
        address: that.data.detailData.addrFull,//具体地址【如需要上门取货必填】 ,
        aftermarketSource: 1101,//售后来源,配送员-928;400客服-613;用户-1101;系统自动生成-1138【必填】 ,
        aftermarketType: 1169,//售后类型，1168-换货;1169-退货（一期只有退货，没有换货）【必填】 ,
        applicationReason: that.data.refundReason, //售后原因,1093-7天无理由;1095-商家发错货;1094-少件/漏发;1097-商品质量问题;096-商品破损/污渍;566-客户拒收;560-取消订单;568-其他;1130-缺货出;1130-仓内丢失【必填】 ,
        attachment: fileNameArr.join(",")||"", //附件,多个附件中间用逗号分隔 ,
        bespeakEndTime: that.data.dateTime?$formateTimeDate(that.data.dateTime) + " 23：59：59":'',//预约结束时间【如需要上门取货必填】 ,
        bespeakStartTime: that.data.dateTime?$formateTimeDate(that.data.dateTime) + " 00：00：00":'',//预约开始时间【如需要上门取货必填】 ,
        city: "", //市编码 ,
        cityName: "",//市名称 ,
        county: "",// 区编码 ,
        countyName: "",// 区名称 ,
        detailInputList: [
          {
            goodCount: that.data.refundSkuJson.goodsNum,//商品数量，三级订单上的购买商品的总数量【必填】 ,
            orderItemId: that.data.refundSkuJson.orderItemId,//商品单ID，三级订单ID【必填】 ,
            returnedNumber: that.data.refundNum,// 退货数量【必填】
          }
        ],//退款商品集合 ,
        isDeliveryFee: false,// 是否退配送费（整单售后才可以退换配送费）需要判断退货数量是否为商品的购买数量 ,
        isNeedPickup:that.data.isNeedPickup,//shippingTypeNow==111||shippingTypeNow==113?1136:1135,// 是否需要取货（物流发货-1137；送货至门店-1136；上门取件-1135）【必填】 ,
        isWhole: false,// 是否整单退款 ,
        orderId: that.data.orderId||'',//支付单ID，一级订单ID【必填】 ,
        orderStoreId: that.data.orderStoreId||'',//店铺单ID，二级订单ID【必填】 ,
        province: "",// 省编码 ,
        provinceName: "",//省名称 ,
        refundMethod: 570, //退款方式；现金-571;原路返回-570。客户端发起只有【原路返回-570】【必填】 ,
        remarks: "",//问题描述 ,
        userName:that.data.userName||'',// 联系人姓名【必填】 ,
        userPhone: that.data.userPhone||'',//联系人手机号【必填】 ,
      };
      if(that.data.detailData.orderType==55){
        saveData.isNeedPickup=1191;
        that.setData({
          isNeedPickup:1191,
        });
      }
      if (that.data.isNeedPickup == 1135) {
        saveData.address = that.data.detailData.addrFull ? that.data.detailData.addrFull : that.data.detailData.shopAddr;
        if (that.data.dateTime.toString().length>0) {
          saveData.bespeakEndTime = $formateTimeDate(that.data.dateTime) + " 23：59：59";
          saveData.bespeakStartTime = $formateTimeDate(that.data.dateTime) + " 00：00：00";
        } else {
          canSubmit = false;
          APP.showToast("请选择取件时间");
        }
      } else {
        saveData.address = that.data.detailData.shopAddr;
      }
      if (canSubmit){
        saveData.applicationReason=that.data.refundReason;
        saveData.remarks=that.data.remarks;
        saveData.detailInputList.returnedNumber=that.data.refundNum;
        canSubmit=false;
        let url=(shippingTypeNow==1022||shippingTypeNow==1023||shippingTypeNow==1024)?API.URL_OVERSEASCUSTOMERSERVICE_SAVE:API.URL_CUSTOMERSERVICE_SAVE;
        UTIL.ajaxCommon(url,saveData,{
          success(res){
            if (res&&res._code == API.SUCCESS_CODE) {
              let aftermarketType = res._data.aftermarketType;
              let createTime = res._data.createTime;
              let id =res._data.id;
              let servicePhone=that.data.detailData.servicePhone;
              wx.redirectTo({
                url: `/pages/groupManage/refund/success/success?from=refundSubmit&servicePhone=${servicePhone}&shippingTypeNow=${shippingTypeNow}&id=${id}&aftermarketType=${aftermarketType}&createTime=${createTime}&goodsSence=${goodsSence}`
              });
            } else {
              canSubmit=true;
              APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
            }
          },
          fail(res){
            canSubmit=true;
            APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
          }
        });

      }
    }
  },
  /*展示选择日期*/
   showPopDateBoxHandler(){
    this.setData({
      showPopDateBox:true
    });
  },
  /*取消选择日期*/
  cancelDate(){
    let dateTime=this.data.dateTime;
    this.setData({
      dateTimeNow:dateTime,
      showPopDateBox:false,
      dateText:dateTime?$timeSelectFormate(dateTime):'请点击日历选择取件时间',
    });
  },
  /*确认选择的日期*/
  confirmDate(){
    let dateTime=this.data.dateTimeNow;
    this.setData({
      dateTime:dateTime,
      showPopDateBox:false,
      dateText:dateTime?$timeSelectFormate(dateTime):'请点击日历选择取件时间',
    });
  },
  /*选择日期*/
  selectDate(event){
    let {dateTime}=event.target.dataset;
    this.setData({
      dateTimeNow:dateTime
    });
  },
  /*输入问题描述*/
  bindInputQuestion(event){
    let {value}=event.detail;
    value=UTIL.filterEmoji(value);
    value=value.replace(/\s+/g, "");
    this.setData({
      remarks:value
    });
  },
  /*选择售后原因*/
  selectRefundReason(event){
    let refundReasonNow=event.target.dataset.refundReason;
    let refundReasonTextNow=event.target.dataset.refundReasonText;
    this.setData({
      refundReasonTextNow:refundReasonTextNow,
      refundReasonNow:refundReasonNow
    });
  },
  /*确定售后原因*/
  confirmReason(){
    let {refundReasonNow,refundReasonTextNow,shippingTypeNow,detailData,refundSkuJson,canShowToHome,isNeedPickup,refundNum}=this.data;
    canShowToHome=true;
   let sevenDaysLimitAmount=detailData.sevenDaysLimitAmount?parseFloat(detailData.sevenDaysLimitAmount)/100:0;
    if(shippingTypeNow!=1022&&shippingTypeNow!=1023&&shippingTypeNow!=1024&&detailData.orderType!=55){
      if(refundNum*refundSkuJson.goodsPriceStr<=sevenDaysLimitAmount&&(refundReasonNow==1349||refundReasonNow==1235||refundReasonNow==1236||refundReasonNow==1125||refundReasonNow==568||refundReasonNow==1300)){
        isNeedPickup = 1136;
        canShowToHome=false;
      }
    }
    this.setData({
      isNeedPickup:isNeedPickup,
      canShowToHome:canShowToHome,
      refundReasonTextNow:refundReasonTextNow,
      refundReasonNow:refundReasonNow,
      refundReasonText:refundReasonTextNow,
      refundReason:refundReasonNow,
      showRefundReason:false
    });


  },
  /*取消售后原因*/
  cancelReason(){
    let {refundReason,refundReasonText}=this.data;
    this.setData({
      refundReasonTextNow:refundReasonText,
      refundReasonNow:refundReason,
      refundReasonText:refundReasonText,
      refundReason:refundReason,
      showRefundReason:false
    });
  },

  /*选择售后原因确定*/

  /*数量减*/
  minusCatchTap(){
    let refundNum=this.data.refundNum;
    if(refundNum>1){
      this.setData({
        refundNum:--refundNum
      });
    }
  },
  showRefundReason(){
    this.setData({
      showRefundReason:true
    });
  },
  plusCatchTap(event){
    let refundNum=this.data.refundNum;
    if(refundNum<event.target.dataset.maxNum){
      this.setData({
        refundNum:++refundNum
      });
    }
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
    let that=this;
    let {refundGoodsSkuJson,orderId,orderStoreId}=that.data;
    that.setData({
      loadingHidden:false,
    });
    let oData={
      "orderId":orderId||'',
      "orderStoreId":orderStoreId||'',
    };
    UTIL.ajaxCommon(API.URL_ORDER_DETAIL, oData,{
      success(res){
        if (res&&res._code == API.SUCCESS_CODE) {
          let skuJson={};
          for(let i=0;i<res._data.storeGoodsList.length;i++){
            if(res._data.storeGoodsList[i].storeId==refundGoodsSkuJson.storeId){
              for(let j=0;j<res._data.storeGoodsList[i].goodsList.length;j++){
                if(res._data.storeGoodsList[i].goodsList[j].goodsSkuId==refundGoodsSkuJson.goodsSkuId&&res._data.storeGoodsList[i].goodsList[j].isGift==refundGoodsSkuJson.isGift){
                  skuJson=res._data.storeGoodsList[i].goodsList[j];
                  for(let k in res._data.storeGoodsList[i]){
                    if(k!="goodsList"){
                      skuJson[k]=res._data.storeGoodsList[i][k];
                    }
                  }
                }
              }
            }
          }
          let shippingTypeNow = skuJson.shippingType;
          that.setData({
            shippingTypeNow:shippingTypeNow,
            isNeedPickup:(shippingTypeNow==111||shippingTypeNow==113)?1136:(shippingTypeNow==1022||shippingTypeNow==1023||shippingTypeNow==1024)?1137:1135,
          });
          let userName='';
          let userPhone='';
          if(shippingTypeNow==111||shippingTypeNow==113){
            userName=wx.getStorageSync('nickName')||'';
            userPhone=wx.getStorageSync('mobile')||'';
          }else{
            userName=res._data.addrName||wx.getStorageSync('nickName')||'';
            userPhone=res._data.addrMobile||wx.getStorageSync('mobile')||'';
          }
          res._data.newSevenDaysLimitAmount=res._data.sevenDaysLimitAmount?res._data.sevenDaysLimitAmount/100:0;
          /*上门取件费用*/
          res._data.newPickupChargeAmount=res._data.pickupChargeAmount?res._data.sevenDaysLimitAmount/100:0;
          that.setData({
            refundSkuJson:skuJson,
            refundGoodsSkuJson:refundGoodsSkuJson,
            detailData:res._data,
            userName:userName,
            userPhone:userPhone,
            showErrorPage:false,
            maxImageNum:(res._data.isB2C==1037||res._data.isB2C==1634)?6:3
          });
          that.onShowInit();
        }else{
          APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
          that.setData({
            showErrorPage:true,
            errorPageMsg:res&&res._msg?res._msg:'网络出错，请稍后再试'
          });
        }
      },
      fail(res){
        APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
        that.setData({
          showErrorPage:true,
          errorPageMsg:res&&res._msg?res._msg:'网络出错，请稍后再试'
        });
      },
      complete(){
        that.setData({
          loadingHidden:true,
        });
      }
    });



  },
  onShowInit:function(){
    let that=this;
    let refundSkuJson=that.data.refundSkuJson;
    let shippingTypeNow = refundSkuJson.shippingType;
    let orderItemId=that.data.orderItemId;

    let {canShowToHome,isNeedPickup}=this.data;
    isNeedPickup=(shippingTypeNow==111||shippingTypeNow==113)?1136:(shippingTypeNow==1022||shippingTypeNow==1023||shippingTypeNow==1024)?1137:1135;
    if(!canShowToHome){
        isNeedPickup = 1136;
    }
    that.setData({
      shippingTypeNow:shippingTypeNow,
      isNeedPickup:isNeedPickup,
    });
    UTIL.ajaxCommon(API.URL_CUSTOMERSERVICE_GETSKUAFTERSALECOUNT,{orderStoreId:that.data.orderStoreId, orderItemId:orderItemId},{
      success(res){
        if (res&&res._code == API.SUCCESS_CODE) {
          that.setData({permitReturnCount:res._data.permitReturnCount});
        }else{
          APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
        }
      },
      fail:(res)=>{
        APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
      }
    });
    if(that.data.forMPage=='submit'){

    }
    UTIL.ajaxCommon(API.URL_CUSTOMERSERVICE_GETEFFECTIVETIME, {"orderStoreId": that.data.orderStoreId},{
      success(res){
        if (res&&res._code == API.SUCCESS_CODE) {
          let dateList=[];
          if (res._data.effectiveDays > 0) {
            for (let i = 0; i < res._data.effectiveDays; i++) {
              let timeJson={
                dateText:$formateTimeDate(parseFloat(res._data.startDate) + i * 86400000),
                dateTime:parseFloat(res._data.startDate) + i * 86400000
              };
              dateList.push(timeJson);
            }
            that.setData({
              dateList:dateList
            });
          }
        }else{
          APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
        }
      },
      fail:(res)=>{
        APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
      }
    });
    if(shippingTypeNow==1022||shippingTypeNow==1023||shippingTypeNow==1024){
      UTIL.ajaxCommon(API.URL_OVERSEASCUSTOMERSERVICE_GETAFTERSALEREASON, {},{
        success(res){
          if (res&&res._code == API.SUCCESS_CODE) {
            that.setData({refundReasonList:res._data});
          }else{
            APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
          }
        },
        fail:(res)=>{
          APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
        }
      });
    }else{
      UTIL.ajaxCommon(API.URL_CUSTOMERSERVICE_GETAFTERSALEREASON, {},{
        success(res){
          if (res&&res._code == API.SUCCESS_CODE) {
            that.setData({refundReasonList:res._data});
          }else{
            APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
          }
        },
        fail:(res)=>{
          APP.showToast(res&&res._msg?res._msg:'网络出错，请稍后再试');
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
});