import * as UTIL from '../../../../utils/util.js';
import * as API from '../../../../utils/API.js';
const APP = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentLogId: 395,
    idPhotoFront: "",
    idPhotoRear: "",
    second: 60,
    sending: true,
    isCheck: 0,
    items: [
      { name: '否', value: '否', checked: 'true' },
      { name: '是', value: '是' }
    ]
  },

  onLoad: function (options) {
    this.setData({
      scene: options.scene
    })
  },

  onShow: function () {
    UTIL.jjyBILog({
      e: 'page_view',
      currentLogId: 395
    });
  },
  inputChange(e) {
    let {
      types
    } = e.currentTarget.dataset;
    let value = e.detail.value;
    this.setData({
      [types]: value
    })
  },
  getIdPhotoFront() {
    let self = this;
    let flag = 0;
    this.updateImg(flag, function (b_res) {
      self.setData({
        idPhotoFront: b_res._data[0]
      })
    })
  },
  getIdPhotoRear() {
    let self = this;
    let flag = 1;
    this.updateImg(flag, function (b_res) {
      self.setData({
        idPhotoRear: b_res._data[0]
      })
    })
  },
  updateImg(flag, callback) {
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let formData = {
          'token': UTIL.getToken(),
          'memberId': UTIL.getMemberId(),
        }
        wx.uploadFile({
          url: API.URL_ADDRESS_UPLOADCUSTOMSDOCIMAGE,
          filePath: res.tempFilePaths[0],
          name: 'file' + flag,
          formData: formData,
          success(up_res) {
            if (up_res.statusCode == 200) {
              let result = JSON.parse(up_res.data);
              callback && callback(result)
            }
          }
        })
      }
    })
  },
  getCode(e) {
    var countdown = 60;
    var that = this;
    var mobile = that.data.mobile;

    if ((mobile !== '') && UTIL.checkMobile(mobile)) {
      // 调用获取验证码接口
      var oData = {
        'channel': API.CHANNERL_220,
        'codeType': API.CODETYPE_1,
        'mobile': mobile
      };
      if (!that.data.isclicked) {
        that.data.isclicked = true
        // 调用接口 showGlobalLoading() hideGlobalLoading()
        UTIL.ajaxCommon(API.URL_MEMBER_SEND_DENTIFYCODE, oData, {
          "success": function (res) {
            if (res._code == API.SUCCESS_CODE) {
              APP.showToast('您的验证码已发送');
              var verifyTimer = setInterval(function () {
                var second = that.data.second - 1;
                that.setData({
                  second: second,
                  sending: false,
                  verifyTimer: verifyTimer
                })
                if (second < 1) {
                  clearInterval(verifyTimer);
                  clearInterval(that.data.verifyTimer);
                  delete that.data.verifyTimer
                  that.setData({
                    second: 60,
                    sending: true,
                    isclicked: false
                  })
                }
              }, 1000);
            } else {
              that.setData({
                isclicked: false
              })
              APP.showToast(res._msg);
            }
          }
        });
      }
    } else {
      APP.showToast("手机号码不正确")
    }
  },
  radioChange: function (e) {
    this.setData({
      isCheck: e.detail.value == '是' ? 1 : 0
    })
  },
  /**
   * 申请团长
   */
  bindApplyLeader(e) {
    let self = this;
    let data = self.data;
    let { code, idPhotoFront, idPhotoRear, mobile, name, scene, isCheck } = data;
    let subEventData = e.detail.value;
    let { idCard = '' } = subEventData;
    if (!name || !name.trim()) {
      APP.showToast("请输入真实姓名");
      return
    }
    if (!UTIL.checkMobile(mobile)) {
      APP.showToast("请输入正确的手机号码");
      return
    }
    console.log(idCard)
    if (idCard == '' || !UTIL.checkID(idCard)) {
      APP.showToast("请输入正确的身份证号码");
      return
    }

    // 选择有相关经验必填些相关信息

    if (isCheck) {
      let retMsgObj = {
        'platformName': '请输入平台名称',
        'communitySize': '请输入社群数量',
        'monthlySales': '请输入月销售额'
      }

      if (subEventData.platformName == '') {
        APP.showToast(retMsgObj.platformName);
        return
      }
      if (subEventData.communitySize == '') {
        APP.showToast(retMsgObj.communitySize);
        return
      }
      if (subEventData.monthlySales == '') {
        APP.showToast(retMsgObj.monthlySales);
        return
      }
    }
    var paramData = {
      accountFlag: API.isBindWxCode,
      code: code,
      idCard: idCard,
      idPhotoFront: idPhotoFront,
      idPhotoRear: idPhotoRear,
      mobile: mobile,
      name: name,
      scene: scene,
      // 是否有经验
      experienceType: isCheck,
      platformName: subEventData.platformName,
      communitySize: subEventData.communitySize,
      monthlySales: subEventData.monthlySales
    }
    UTIL.jjyBILog({
      e: 'click', //事件代码
      oi: 442, //点击对象type，Excel表
      obi: ''
    });
    UTIL.ajaxCommon(API.URL_MEMBER_GROUPAPPLY, paramData, {
      success: (res) => {
        console.log(res);
        if (res._code === API.SUCCESS_CODE) {
          APP.showToast("申请提交成功，请您耐心等待审核！");
          self.data.timer = setTimeout(function () {
            clearTimeout(self.data.timer);
            wx.reLaunch({
              url: '/pages/user/user',
            })
          }, 3000)
        } else {
          APP.showToast(res._msg);
        }
        // wx.redirectTo({
        //     url: '/pages/groupManage/apply/comfirm/comfirm',
        // })
      }
    })
  },
  onUnload: function () {
    var self = this;
    if (self.data.timer) clearTimeout(self.data.timer);
    clearInterval(self.data.verifyTimer);
    delete self.data.verifyTimer
  }

})