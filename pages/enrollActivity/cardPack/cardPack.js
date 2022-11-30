// pages/enrollActivity/cardHolder/cardHolder.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[]
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
  formData(timer){
    var data = new Date(parseFloat(timer));
    var y = data.getFullYear();
    var m = data.getMonth() + 1;
    var d = data.getDate();
    var str = y + '/' + m + '/' + d;
    return str;
  },
  /**
 * 获取卡列表
 */
  getCardList(){
    var res = ajaxCommon(URL_CONSUMECARD_CARDLIST, {});
    console.log(res);
    if(res && res._code == SUCCESS_CODE && res._data) {
      res._data.map(function (i) {
        var time1 = Date.parse(new Date());
        var time2 = i.validEndDate;
        var time3 = Math.abs(parseInt((time2 - time1) / 1000 / 3600 / 24));
        i.isExpire = time3;
      })
      var listHtml = template('effective_tpl', { list: res._data });
      $('.effective ul').append(listHtml)
    } else {
      var emptyHtml = template('noData-tpl', { "errorMsg": '暂时没有可用的卡', 'invalid': false })
      $('.effective ul').html(emptyHtml);
    }
    },

    /**
     * 过期卡列表
     */
    getCardLogList() {
      var res = ajaxCommon(URL_CONSUMECARD_INVALIDCARDLIST, {});
      console.log(res);
      if (res && res._code == SUCCESS_CODE && res._data) {
        var listHtml = template('invalid_tpl', { list: res._data });
        $('.invalid ul').append(listHtml);
      } else {
        $(".invalid").remove();
        // var emptyHtml = template('noData-tpl',{"errorMsg":'暂时没有失效的卡','invalid':true})
        // $('.invalid ul').html(emptyHtml);
      }
    },

    /**
     * 历史卡切换
     */
    showHistory() {
      $(".invalid h3").on("click", function () {
        if ($(".invalid").hasClass("slideOutUp")) {
          $(".invalid h3 em").text('查看已失效卡片');
          $(".invalid").removeClass("slideOutUp").addClass("slideOutDown");
        } else {
          $(".invalid h3 em").text('查看可用卡片');
          $(".invalid").addClass("slideOutUp");
        }
      })
    },

    /**
     * 卡详情
     */
    jumpDetails() {
      $(".card-wrap li").on("click", function () {
        var number = $(this).data('number');
        location.href = 'card_details.html?number=' + number;
      })
    }
})