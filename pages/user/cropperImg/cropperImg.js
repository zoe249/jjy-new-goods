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
    pageOpacity:0, 
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
    this.changePhoto()
  },
  changePhoto() {
    let that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths;
        // that.setData({
        //   showChooseImg: true
        // })
        //图片截取
        that.onLoadImg({
          pageOpacity:1,
          src: tempFilePaths[0],
          filePath: tempFilePaths[0]
        })
      },
      fail: ()=> {
        wx.navigateBack({
          
        })
      }
    })
  },
  /**修改头像 */
  modifyPhoto() {
    let _this = this;
    var formData = {
      "taskId ": 0,
      "taskType": 206,
      'token': UTIL.getToken(),
      'memberId': UTIL.getMemberId(),
    }
    var filePath = this.data.filePath;
    APP.showGlobalLoading();
    wx.uploadFile({
      url: API.URL_MEMBER_MODIFY_PHOTO,
      filePath: filePath,
      name: 'file',
      formData: formData,
      success(up_res) {
        wx.navigateBack({
          delta: 1,
        })
        APP.showToast('修改成功');
      },
      fail: function () {
        APP.showToast('修改失败');
      },
      complate: () => {
        APP.hideGlobalLoading();
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
          showChooseImg: false
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
      cropperOpt.src = option.src;
      delete this.cropper;
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
        });
      console.log(this.cropper)
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