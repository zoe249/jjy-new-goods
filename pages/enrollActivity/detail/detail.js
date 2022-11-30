// pages/enrollActivity/cardDetails/cardDetails.js
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

  },
  /**
 * 时间格式化
 */
  formData(timer) {
    var data = new Date(parseFloat(timer));
    var y = data.getFullYear();
    var m = data.getMonth() + 1;
    var d = data.getDate();
    var str = y + '/' + m + '/' + d;
    return str;
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  /**
 * 获取详情
 */
  getDetails(){
    var cardNo = getParamValueByName('number');//type 1：有效 2：失效
    var orderId = getParamValueByName('orderId');
    var orderStoreId = getParamValueByName('orderStoreId');
    var data = {
      "cardNo": cardNo ? cardNo : null,
    }
    if(orderId) {
        data.orderId = orderId;
      }
    if(orderStoreId) {
        data.orderStoreId = orderStoreId
      }
    var res = ajaxCommon(URL_CONSUMECARD_DETAIL, data);
      var cardHtml = template('card_tpl', res._data[0]);
      $(".container").html(cardHtml);
    if(res._data[0].states == 1721){
    new QRCode(document.getElementById("qr_code"), {
      width: 150,
      height: 150
    }).makeCode(res._data[0].cardNo);
    disableContextMenu(['qr_code']);
  }
  },
  /**
   * disableContextMenu
   * @param  {[type]} touchObj Array
   * @return {[type]}          null
   */
  disableContextMenu(touchObj) {
    $.each(touchObj, function (k, v) {
      var t;
      var pointer = document.querySelector('#' + v);
      var cancelTimeout = function () {
        if (t) {
          clearTimeout(t);
          t = null;
        }
      };
      pointer.addEventListener('touchstart', function (e) {
        t = setTimeout(function () {
          cancelTimeout();
        }, 300);
        e.preventDefault();
        return false;
      });
      pointer.addEventListener('touchend', cancelTimeout);
      pointer.addEventListener('touchcancel', cancelTimeout)
    });
    //禁止右键
    document.oncontextmenu = function () {
      return false;
    };
  },

  /**
   * 卡信息
   */
  jumpInstro() {
    session.removeItem('kabaoIntro');
    $(".instro").on("click", function () {
      var intro = $(this).data("intro");
      session.kabaoIntro = intro;
      location.href = '../agreement/card_description.html'
    })
  },

  /**
   * 卡记录
   */
  jumpRecords() {
    $('.records').on("click", function () {
      var no = $(this).data("no");
      var name = $(this).data("name");
      var num = $(this).data("num");
      if (num > 0) {
        location.href = 'use_records.html?cardNo=' + no + '&name=' + name;
      }
    })
  }
})