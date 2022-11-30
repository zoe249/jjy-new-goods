import * as $ from "../../common/js/js";
import getSectionType from "../../../../utils/sectionId.js";
import * as UTIL from "../../../../utils/util.js";
import * as API from "../../../../utils/API.js";
let APP = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // loading
    listLoading: {
      type: Boolean,
      value: false,
    },
    // 当期滚动高度
    scrollTop: {
      type: Number,
      value: 0,
    },
    // 首页全部数据
    allData: {
      type: Array,
      value: [],
    },
    // 是否启用默哀色
    isBlack: {
      type: Boolean,
      value: false,
    },
    bgTheme: {
      type: String,
      value: '',
    },
    titleOpacity: {
      type: Number,
      value: 0,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    $: $,
    fixedHeight: 0, // 顶部固定栏位高度
    showAlert: false, // 是否展示弹窗
    popupWinArray: [], // 每日弹窗
    alertData: {}, // 首页每日弹窗内容
    loginFlag: 0,
    page: 1,
    productList: [],
    yueXuanImg: {},
    i: 0,
    nowLength: 0,
    showList: true,
    shopId: 0,
    loadingShow: false,
    currentSwiper: 0,
    toBottom:false,
  },

  observers: {
    //监听scrollTop变动
    allData(val) {
      if (val.length > 0) {
        let alertData = getSectionType("homePageAlert", val);
        let yueXuan = getSectionType("yueXuan", val);
        let yueXuanImg = getSectionType("yueXuanImg", yueXuan.children).recommendList;
        let lunboImg = getSectionType("todayPushImg", yueXuan.children).recommendList;
        let yueXuanData = getSectionType("yueXuanData", yueXuan.children);
        let shopId = wx.getStorageSync('shopId')
        // 在组件实例进入页面节点树时执行
        let timeout = wx.getStorageSync(`${shopId}_showAlertTimeOutCommunity`);
        let now = Date.parse(new Date()) / 1000;
        if (now > timeout) {
          this.setData({
            showAlert: true,
          });
        }
        this.setData({
          alertData: alertData.recommendList[0],
          yueXuanImg,
          sectionId: yueXuanData.sectionId,
          shopId,
          yueXuan,
          lunboImg:lunboImg.length>0?lunboImg:null,
          page: 1,
          productList: [],
          nowLength: 0,
          i: 0,
        });
        //console.log(yueXuan);
        this.getCommodityData(yueXuanData.sectionId);
      }
    },
    toBottom(val){
      this.triggerEvent("_noBottomData", {
        toBottom: val
      });
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    getNewProductData() {
      this.getCommodityData(this.data.sectionId);
    },
    getCommodityData(sectionId) {
      const shopId = wx.getStorageSync("shopId");
      const warehouseId = wx.getStorageSync("warehouseId");
      UTIL.ajaxCommon(
        API.ST_NEW_LISTBYPAGE,
        {
          sectionId,
          page: this.data.page,
          shopId,
          warehouseId,
          pageNum: 10,
          entrance: 1,
        },
        {
          success: (res) => {
            let page = this.data.page;
            let productList = this.data.productList;
            let yueXuanImg = this.data.yueXuanImg;
            let lunboImg = this.data.lunboImg;
            let noItemArr = [];
            let hasItemArr = [];
            let i = this.data.i;
            let pictureList = yueXuanImg
            if (res._data.length > 0) {
              // 判断商品是否售罄，售罄做沉底
              res._data.forEach((item) => {
                if (item.bizType === 19 && item.extendJson !== "null") {
                  if (
                    (JSON.parse(item.extendJson).proType == 1888 &&
                      JSON.parse(item.extendJson).surplusStock > 0) ||
                    JSON.parse(item.extendJson).ratio < 100
                  ) {
                    noItemArr.push(JSON.parse(item.extendJson));
                  } else {
                    hasItemArr.push(JSON.parse(item.extendJson));
                  }
                }
              });
              productList = productList.concat(noItemArr);
              productList = productList.concat(hasItemArr);
              if (page == 1 && productList.length == 0)
                this.setData({
                  showList: false,
                });
              // 商品价格拆分为整数位和小数位
              productList.forEach((item,index) => {
                if (index < this.data.nowLength) return;
                if (item.length || item.length == 0) return;
                item.sale = true;
                let newArr = item.goodsPrice.toString().split(".");
                item.int = newArr[0];
                item.dec = newArr[1];
              });
              let newArr = [];
              // 如果有轮播图，将轮播图插入到商品数组最前端
              if(this.data.nowLength == 0&&lunboImg) productList.unshift(lunboImg)
              // 由于会在数组中插入图片，所以需要 提前生成一个用于循环的数组，数组长度要比商品数组大
              if (i == 0) {
                if (pictureList.length < 4) {
                  for (let a = 0; a < pictureList.length; a++) {
                    newArr.push("");
                  }
                } else {
                  for (let a = 0; a < 4; a++) {
                    newArr.push("");
                  }
                }
              }else if(productList.length>i&&productList.length<40){
                for(let a=0;a<4;a++){
                  newArr.push('')
                }
              }
              let forEachArr = [...productList, ...newArr];
              // 将广告图插入到商品数组里
              forEachArr.forEach((item, index) => {
                if (index < this.data.nowLength) return;
                if ([5, 8 , 12 , 17,21,24,29,33,36].indexOf(index) !== -1) {
                  if (pictureList[i]) {
                    productList.splice(index, 0, pictureList[i]);
                    i++;
                  }
                }
              });
              this.setData({
                productList,
                page: page + 1,
                nowLength: productList.length,
                i,
              });
            }else{
              if(this.data.productList.length==0){
                if(this.data.nowLength == 0&&lunboImg) productList.unshift(lunboImg)
                pictureList.forEach((item, index) => {
                  productList.push(item)
                })
                this.setData({
                  productList,
                  i:pictureList.length
                });
              }else{
                //如果商品数量不够展示广告，则在最后把所有广告都展示出来
                pictureList.forEach((item, index) => {
                  if(index<i) return
                  productList.push(item)
                })
                this.setData({
                  productList,
                  i:pictureList.length
                });
              }
              this.setData({toBottom:true})
			      }
          },
          error: (err) => {
            console.log(err);
          },
        }
      );
    },
    /**
     *
     * banner组件,参数:item
     * @param {*} e
     */
    autoJump: function (e) {
      let that = this;
      let { item } = e.detail;
      //console.log("首页组件autoJump:" + item);
    },
    // 跳转页面
    jumpToPage(e) {
      let {
        url,
        needlogin,
        item,adverindex,productIndex,goback
      } = e.currentTarget.dataset;
      let baseNum = 0;
      //获取坑位ID
      let productList = this.data.productList;
      if(productList && productList.length>0){
          baseNum = productList[0].length;
      }
      let pitIndex = 0;
      //广告埋点
      if(adverindex){
          if(productIndex == 0){
          pitIndex = adverindex
          }else {
          pitIndex = productIndex+baseNum;
          }
      }else if(productIndex){
          pitIndex = productIndex+baseNum;
      }
      //广告坑位
      if(adverindex){
          UTIL.jjyFRLog({
          clickType:'C1002', //跳转页面
          conType:'B1003', //活动维度
          recommendTitle:item.recommendTitle, //活动名称
          recommendId:item.recommendId, //获取ID
          pitLocation:pitIndex, //坑位
          parentSection:item.sectionParent==0 ?item.sectionId: item.sectionParent, //父级版块
          grandfatherSection:item.sectionParent==0 ?item.sectionId: item.sectionParent //祖父级版块
          })
          
      }else{
          UTIL.jjyFRLog({
              clickType: 'C1002', //跳转页面
              conType:'B1002', //内容维度 商品维度
              sku: item.skuId, //商品sku
              goodsName: item.materielParentName||item.goodsPromotionName||item.shortTitle||item.goodsName||"", //商品名称
              goodsTag: item.goodsTag, //广告语
              promotionName: item.proType == 1888?'社区拼团':item.proType==1178?'社区秒杀':'直降', //促销名称  1888 拼团  1178 秒杀 289 直降
              proPrice: item.goodsPrice, //售价
              originalPrice: item.goodsPrimePrice, //原价
              inventory:  item.proType == 1888 ?item.surplusStock:item.totalStock - item.buyStock, //库存数
              pitLocation:pitIndex, //坑位
              parentSection:this.data.yueXuan.sectionId, //父级版块
              grandfatherSection:this.data.yueXuan.sectionId //祖父级版块
          })
      }
      if(goback){
        let shopId = wx.getStorageSync('shopId')
        let latitude = wx.getStorageSync('latitude')
        let longitude = wx.getStorageSync('longitude')
        let obj = {shopId,latitude,longitude}
        wx.setStorageSync('communityObj',obj)
      }
			// 直播入口
			if (item && item.describle && item.describle.indexOf('roomId') >= 0) {
				let describle = JSON.parse(item.describle);
				let {
					roomId
				} = describle;
				if (roomId) {
					//填写具体的房间号，可通过下面【获取直播房间列表】 API 获取
					let customParams = encodeURIComponent(JSON.stringify({})) // 开发者在直播间页面路径上携带自定义参数（如示例中的path和pid参数），后续可以在分享卡片链接和跳转至商详页时获取，详见【获取自定义参数】、【直播间到商详页面携带参数】章节（上限600个字符，超过部分会被截断）
					wx.navigateTo({
						url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}&custom_params=${customParams}`
					})
					return;
				}
			}
      if (needlogin) {
        this.setData({
          loginFlag: wx.getStorageSync("loginFlag")
            ? wx.getStorageSync("loginFlag")
            : 0,
        });
        if (this.data.loginFlag == 1) {
          wx.navigateTo({
            url,
          });
        } else {
          wx.navigateTo({
            url: `/pages/user/wxLogin/wxLogin` + "?pages=" + url,
          });
        }
      } else {
        wx.navigateTo({
          url,
        });
      }
    },
    // 添加购物车
    addCart(event) {
      let { goods } = event.currentTarget.dataset;
      UTIL.jjyFRLog({
        clickType: 'C1003', //动作类型：点击事件
        conType: 'B1004', //页面维度：按钮维度
        operationId: 'D1022', //事件id  TypeShow =true优鲜 false
        operationContent: '', //输入内容
        operationUrl: '' //输入链接
      })
      this.setData({
        loadingShow: true,
      });
      let shopId = UTIL.getShopId();
      let obj = {
        shopId: shopId,
        goodsId: goods.goodsId,
        proId: goods.proId,
      };
      this.data.$.getGoodsDetail(obj, (res) => {
        if (res) {
          // 调用子组件方法
          let herader = this.selectComponent("#cartAnimation");
          herader.touchOnGoods(event, this.data.busPos);
          // 获取购物车商品数量
          this.CartNum();
          this.triggerEvent("_updateCartTotal");
          this.setData({
            loadingShow: false,
          });
        } else {
          this.setData({
            loadingShow: false,
          });
        }
      })
    
    },
    // 轮播图改变后触发
    swiperChange: function (e) {
      this.setData({
        currentSwiper: e.detail.current,
      });
    },
    changeTitleIndex(){
      let dom = this.selectComponent(".yxIndexTitle");
      dom.changeTitleIndex();
    },
    // 获取新的购物车数量
    CartNum() {
      this.setData({
        CartCount: UTIL.getGroupManageCartCount(),
      });
    },
    // 从yxindextitle组件获取顶部固定栏高度
    fixHeightData(data) {
      this.setData({
        fixedHeight: data.detail.height,
      });
			this.triggerEvent("_getFixHeightData", {
				height: data.detail.height
			});
    },
    // 更新购物车内商品数量
    updateCartTotal(e) {
      this.triggerEvent("_updateCartTotal");
    },
    // 关闭首页弹窗，记录第二天0点时间，超过0点再弹窗
    closeShowAlert() {
			let shopId = wx.getStorageSync('shopId')
      this.setData({
        showAlert: false,
      });
      let date = new Date();
      date.setDate(date.getDate() + 1);
      let y = date.getFullYear();
      let m = date.getMonth() + 1;
      let d = date.getDate();
      if (m < 10) {
        m = "0" + m;
      }
      if (d < 10) {
        d = "0" + d;
      }
      let time = y + "-" + m + "-" + d;
      let date2 = new Date(`${time} 00:00:00`);
      let timeout = Date.parse(date2) / 1000;
      wx.setStorageSync(`${shopId}_showAlertTimeOutCommunity`, timeout);
    },
  },
  //自小程序基础库版本 2.2.3 起，组件的的生命周期也可以在 lifetimes 字段内进行声明（这是推荐的方式，其优先级最高）。
  lifetimes: {
    attached: function () {
    },
    ready() {
      let that = this
      // 登录判断
      this.setData({
        loginFlag: wx.getStorageSync("loginFlag")
          ? wx.getStorageSync("loginFlag")
          : 0,
      });
      let ping=this.createIntersectionObserver()
      ping.relativeToViewport().observe('.content',(res)=>{
        if(res.intersectionRatio>0){
          that.triggerEvent("_showGoTop", {
            goTop: true
          });
        }else{
          that.triggerEvent("_showGoTop", {
            goTop: false
          });
        }
      })
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },

  // 以下是旧式的定义方式，可以保持对 <2.2.3 版本基础库的兼容
  attached: function () {},
  detached: function () {},
});
