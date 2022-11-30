import * as API from '../../../utils/API'
import * as UTIL from '../../../utils/util'
import WeCropper from '../../../templates/we-cropper/we-cropper.js'

const APP = getApp()
const device = wx.getSystemInfoSync()
const width = device.windowWidth
const height = device.windowHeight - 50
Page({

  /**
   * 页面的初始数据
   */
  data: {
    array: ['男','女'],
    objectArray: [
      {
        id: 0,
        name: '男'
      },
      {
        id: 1,
        name: '女'
      }
    ],
    endTime:'',
    index: 0,
    birth: '',
    changeNickName:'',
    show:false,
    cropperOpt: {
      id: 'cropper',
      targetId: 'targetCropper',
      pixelRatio: device.pixelRatio,
      width,
      height,
      scale: 2.5,
      zoom: 8,
      cut: {
        x: (width - 300) / 2,
        y: (height - 300) / 2,
        width: 300,
        height: 300
      },
      boundStyle: {
        color: "#04b00f",
        mask: 'rgba(0,0,0,0.8)',
        lineWidth: 1
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      let year = new Date().getFullYear();
      let mon = (new Date().getMonth() + 1).toString().padStart(2, '0');
      let day = (new Date().getDate()).toString().padStart(2, '0');
      let endTime = year + "-" + mon + "-" + day;
      this.setData({
          endTime
      })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  
  onShow: function () {
    let endTime = this.data.endTime;
    let self = this;
    self.getUserAllInfo(function(){
      let allUserInfo =  self.data.allUserInfo
      var birth = allUserInfo.birth ? allUserInfo.birth : endTime;
      var index = allUserInfo.sex;
      if (index > 1) {
        index = 2;
      }
      self.setData({
        birth,
        index,
        allUserInfo
      })
    })
  
    
  },
  /**
   * 
   */
  bindGetUserInfo(){

  },
  getUserAllInfo(callback){
    let that = this;
    UTIL.ajaxCommon(API.URL_MEMBER_GETMEMBERALLINFO, { 'channel': API.CHANNERL_220 },
      {
        "success": function (res) {
          APP.hideGlobalLoading();
          if (res._code == API.SUCCESS_CODE) {
            that.setData({
              allUserInfo: res._data,
              loginFlag: 1
            })
            callback && callback();
          } else if (res._code == '001007') {
            that.setData({
              loginFlag: 0
            });
            wx.setStorageSync('loginFlag', 0);
            APP.showToast('登录信息失效，请您重新登录');
          }
        },
        'fail': function (res) {
          APP.hideGlobalLoading();
          setTimeout(function () {
            APP.showToast(res._msg);
          }, 100)
        }
      });
  },
  bindPickerChange: function (e) {
    let allUserInfo = this.data.allUserInfo;

    allUserInfo.sex = e.detail.value
    this.setData({
      index: e.detail.value,
      allUserInfo
    })
    this.changeUserInfo();
  },
  bindDateChange: function (e) {
    let allUserInfo = this.data.allUserInfo;

    allUserInfo.birth = e.detail.value;
    this.setData({
      allUserInfo,
      birth: e.detail.value
    })
    this.changeUserInfo();
  },
  showNickNameModal(){
    this.setData({
      show:true
    })
  },
  closeNickNameModal() {
    this.setData({
      show: false
    })
  },
  changeNickNameModal() {
    let allUserInfo = this.data.allUserInfo;
    let changeNickName = this.data.changeNickName ? this.data.changeNickName:'';
    allUserInfo.nickName = changeNickName;
    this.setData({
      allUserInfo,
      show: false
    })
    this.changeUserInfo();
  },
  inputChange(e){

    var changeNickName = e.detail.value;
    this.setData({
      changeNickName
    })
  },
  changePhoto(){
    let that = this;
    let allUserInfo = this.data.allUserInfo;
    
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths;
        that.setData({
          showChooseImg: true
        })
        //图片截取
        that.onLoadImg({
          src: tempFilePaths[0],
          filePath: tempFilePaths[0]
        })
      }
    })
  },
  modifyPhoto(){
    let _this = this;
    let allUserInfo = _this.data.allUserInfo;
        var formData = {
          "taskId ":0,
          "taskType":206,
          'token': UTIL.getToken(),
          'memberId': UTIL.getMemberId(),
        }
      var filePath = this.data.filePath;
        wx.uploadFile({
          url: API.URL_MEMBER_MODIFY_PHOTO,
          filePath: filePath,
          name: 'file',
          formData: formData,
          success(up_res) {
            
            var _data = JSON.parse(up_res.data)._data;
            var photoUrl = _data.photoUrl;
            allUserInfo.photo = photoUrl?photoUrl.replace(/http/, "https"):'https://shgm.jjyyx.com/m/images/custorm_photo.jpg?t=41801';
            _this.setData({
              allUserInfo: allUserInfo
            })
            _this.onShow();
            APP.showToast('修改成功');
          },
          fail:function(){
            APP.showToast('修改失败');
          }
        })
  },
  changeUserInfo(){
    var that = this;
    var param = {
      "birth": that.data.allUserInfo.birth, 
      "nickName": that.data.allUserInfo.nickName,
      "sex": that.data.allUserInfo.sex,
    }
    UTIL.ajaxCommon(API.URL_MEMBER_MODIFY_INFO,param,{
      success:function(res){
        wx.setStorageSync("nickName", that.data.allUserInfo.nickName)
        APP.showToast(res._msg);  
      }
    })
  },
  touchStart(e) {
    this.cropper.touchStart(e)
  },
  touchMove(e) {
    this.cropper.touchMove(e)
  },
  touchEnd(e) {
    this.cropper.touchEnd(e)
  },
  getCropperImage() {
    this.cropper.getCropperImage((avatar) => {
      if (avatar) {
        //  获取到裁剪后的图片
        this.setData({
          filePath: avatar,
          showChooseImg:false
        })
        this.modifyPhoto();
      } else {
        APP.showToast('获取图片失败，请稍后重试');
      }
    })
  },
  uploadTap() {
    const self = this

    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success(res) {
        const src = res.tempFilePaths[0]
        //  获取裁剪图片资源后，给data添加src属性及其值

        self.cropper.pushOrign(src)
      }
    })
  },
  onLoadImg(option) {
    const { cropperOpt } = this.data

    //cropperOpt.boundStyle.color = config.getThemeColor()

    this.setData({ cropperOpt })

    if (option.src) {
      cropperOpt.src = option.src
      this.cropper = new WeCropper(cropperOpt)
        .on('ready', (ctx) => {
        })
        .on('beforeImageLoad', (ctx) => {
          wx.showToast({
            title: '上传中',
            icon: 'loading',
            duration: 20000
          })
        })
        .on('imageLoad', (ctx) => {
          wx.hideToast()
        })
        .on('beforeDraw', (ctx, instance) => {
        })
    }
  },
  toChangePhoto(){
    wx.navigateTo({
      url: '/pages/user/cropperImg/cropperImg',
    })
  }
})