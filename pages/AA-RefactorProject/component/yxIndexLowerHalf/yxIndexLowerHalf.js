// pages/AA-RefactorProject/component/yxIndexLowerHalf/yxIndexLowerHalf.js
import * as $ from "../../common/js/js.js";
import getSectionType from "../../../../utils/sectionId.js";
import * as UTIL from "../../../../utils/util.js";
import * as API from "../../../../utils/API.js";
Component({
  properties: {
    // 判断是否触底进行加载
    listLoading: {
      type: Boolean,
      value: false,
    },
    // 顶部固定栏的高度
    fixedHeight: {
      type: Number,
      value: 0,
    },
    // 首页获取到的全部数据
    allData: {
      type: Array,
      value: [],
    },
    // 默哀色是否开启
    isBlack: {
      type: Boolean,
      value: false,
    },
  },

  /**
   * 页面的初始数据
   */
  data: {
    $: $,
    // 下方主体标题数据
    list: [],
    currentSwiper: 0, //轮播图当前选中点位
    scrollH: 0, // scroll组件高度，用于固定定位后设置占位的view高度
    selectTitle: 0, // 当前选中的主题
    discountImage: "", // 最上方图片地址
    i: 0, // 商品数组中插入的广告图数据数量
    nowLength: 0, // 当前商品数组长度
    productList: [], // 商品数组
    selectTitleSectionId: 0, // 选中的大小主题sectionId
    page: 1, // 商品页码

    fixedHeightData: 0, // 顶部导航栏高度
    showList: true, // 是否展示大小主题
    themeAllData: [], //大小主题所有数据,
    bigSmallThemeHeight: 0, // 大小主题菜单栏高度
    toBottom: false,
    showBottom: false,
    dataCatch: [],
    listLoadingNow: false,
  },

  observers: {
    fixedHeight(val) {
      console.log('切换大小主题', val)
      this.setData({
        fixedHeightData: val,
      });
      if (val > 0) {
        wx.createSelectorQuery()
          .in(this)
          .select("#swiperContent")
          .boundingClientRect((rect) => {
            if (rect) {
              this.setData({
                bigSmallThemeHeight: rect.height,
                scrollTitleHeight: rect.top - this.data.fixedHeight,
              });
            }
            wx.createSelectorQuery()
              .in(this)
              .select(".scrollList")
              .boundingClientRect((rect) => {
                this.setData({
                  scrollH: rect.height,
                });
              })
              .exec();
          })
          .exec();
      }
    },
    allData(val) {
      if (val.length > 0) {
        let themeData = getSectionType("bigSmallTheme", val);
        let list = [];
        try {
          themeData.children.forEach((child) => {
            let titleObj = getSectionType("bigSmallThemeTitle", child.children);
            let imgObj = getSectionType("bigSmallThemeImg", child.children);
            let lunboImg = getSectionType("todayPushImg", child.children);
            let commodityObj = getSectionType(
              "bigSmallThemeCommodity",
              child.children
            );
            if (titleObj) {
              imgObj.recommendList.forEach(item => {
                item.extendJson1 = JSON.parse(item.extendJson)
              })

              // 对食谱,文章处理
              if (lunboImg.recommendList && lunboImg.recommendList.length != 0) {
                lunboImg.recommendList.forEach((item, index) => {
                  if (item.imgUrl == null) {
                    if (item.bizType === 673 || item.bizType === 674) {
                      item.extendJson = JSON.parse(item.extendJson)
                      item.imgUrl = item.extendJson.imageCover
                    }
                  }
                })
              }

              list.push({
                recommendTitle: titleObj.recommendList[0]
                  ? titleObj.recommendList[0].recommendTitle
                  : "",
                describle: titleObj.recommendList[0]
                  ? titleObj.recommendList[0].describle
                    ? JSON.parse(titleObj.recommendList[0].describle).subTitle
                    : ""
                  : "",
                sectionId: commodityObj.sectionId,
                imgArr: imgObj.recommendList,
                lunboImg: lunboImg ? lunboImg.recommendList.length > 0 ? lunboImg.recommendList : null : null
              });
            }
          });
        } catch (e) {
          console.log(e);
        }
        let index = 0;
        let dataCatch = this.data.dataCatch
        list.forEach((item, index1) => {
          if (item.recommendTitle && item.recommendTitle != "") {
            dataCatch.push([])
          }
          if ((!item.recommendTitle || item.recommendTitle == "") && index == index1) {
            index++;
          }
        });
        if (index > list.length - 1) {
          this.setData({
            showList: false,
          });
        } else {
          this.setData({
            // discountImage:val[16].recommendList[0].imgUrl,
            list,
            selectTitleSectionId: list[index].sectionId,
            page: 1,
            productList: [],
            nowLength: 0,
            i: 0,
            currentSwiper: 0,
            toBottom: false,
            selectTitle: 0
          });
          this.getCommodityData(list[index].sectionId);
        }
        this.setData({
          themeAllData: themeData
        })
      }
    },
    toBottom(val) {
      this.triggerEvent("_noBottomData", {
        toBottom: val
      });
    }
  },
  methods: {
    // 获取下方商品列表
    getCommodityData(sectionId, type, showBottom) {
      let that = this
      this.setData({ listLoadingNow: true })
      if (showBottom) {
        this.setData({ showBottom: true })
      } else {
        this.setData({ showBottom: false })
      }
      // 切换大小主题时将滚动条滚动到上方
      if (type) {

        let fixedHeight = this.data.fixedHeight
        wx.createSelectorQuery()
          .in(that)
          .select(".scrollListContent")
          .boundingClientRect((rect) => {
            if (rect.top == fixedHeight) {
              that.triggerEvent("checkoutNextTheme", {
                height: that.data.scrollTitleHeight
              });
            }
          })
          .exec();
      }
      const shopId = wx.getStorageSync("shopId");
      const warehouseId = wx.getStorageSync("warehouseId");
      UTIL.ajaxCommon(
        API.NEW_LISTBYPAGE,
        {
          sectionId,
          page: this.data.page,
          shopId: shopId,
          warehouseId: warehouseId,
          pageNum: 10,
        },
        {
          success: (res) => {
            let page = this.data.page;
            let themeData = this.data.list.filter((item) => {
              return item.sectionId == sectionId;
            })[0];
            let productList = type ? [] : this.data.productList;
            let noItemArr = []
            let hasItemArr = []
            let i = this.data.i;
            let pictureList = themeData.imgArr;
            // 判断商品是否售罄，售罄商品做沉底
            if (res._data.length > 0) {
              if (res._data.length < 10) {
                this.setData({ showBottom: true, toBottom: true })
              }
              res._data.forEach((item) => {
                if (item.bizType === 19) {
                  if (JSON.parse(item.extendJson).goodsStock == 0) {
                    noItemArr.push(JSON.parse(item.extendJson))
                  } else {
                    hasItemArr.push(JSON.parse(item.extendJson))
                  }
                }
              });
              productList = productList.concat(hasItemArr);
              productList = productList.concat(noItemArr);
              //判断当前价格，将价格分为整数和小数，同时判断是否参与直降
              productList.forEach((item, index) => {
                if (index < this.data.nowLength) return;
                if (item.length || item.length == 0) return;
                let sale = false;
                // if(item.promotionList[0]&&item.promotionList[0].proType ==289) sale = true;
                item.promotionList.forEach((items) => {
                  if (items.proType == 289) sale = true
                })



                item.sale = sale;
                if (item.proPrice < item.salePrice) {
                  let newArr = item.proPrice.toString().split(".");
                  item.int = newArr[0];
                  item.dec = newArr[1];
                } else {
                  let newArr = item.salePrice.toString().split(".");
                  item.int = newArr[0];
                  item.dec = newArr[1];
                }
              });
              // 将轮播图插入到商品列表最前端
              if (this.data.nowLength == 0 && themeData.lunboImg) productList.unshift(themeData.lunboImg)
              let newArr = []
              // 由于会在数组中插入图片，所以需要 提前生成一个用于循环的数组，数组长度要比商品数组大
              if (i == 0) {
                if (pictureList.length < 4) {
                  for (let a = 0; a < pictureList.length; a++) {
                    newArr.push('')
                  }
                } else {
                  for (let a = 0; a < 4; a++) {
                    newArr.push('')
                  }
                }
              } else if (productList.length > i && productList.length < 40) {
                for (let a = 0; a < 4; a++) {
                  newArr.push('')
                }
              }
              let forEachArr = [...productList, ...newArr];
              // 在商品数组中插入广告图
              forEachArr.forEach((item, index) => {
                if (index < this.data.nowLength) return;

                if ([5, 8, 12, 17, 21, 24, 29, 33, 36].indexOf(index) !== -1) {
                  if (pictureList[i]) {
                    productList.splice(index, 0, pictureList[i]);
                    i++;
                  }
                }
              });
              let dataCatch = this.data.dataCatch
              let selectTitle = this.data.selectTitle
              dataCatch[selectTitle] = productList
              this.setData({
                productList,
                page: page + 1,
                nowLength: productList.length,
                i,
                dataCatch
              });
              this.setData({ listLoadingNow: false })
            } else {
              // 判断是不是完全没有商品
              if (this.data.productList.length == 0) {
                // 如果没有商品，将轮播图和广告依次插入数组
                if (this.data.nowLength == 0 && themeData.lunboImg) productList.unshift(themeData.lunboImg)
                pictureList.forEach((item, index) => {
                  productList.push(item)
                })
                this.setData({
                  productList,
                  i: pictureList.length
                });
              } else {
                let dataCatch = this.data.dataCatch
                let selectTitle = this.data.selectTitle
                dataCatch[selectTitle] = productList
                //如果商品数量不够展示广告，则在最后把所有广告都展示出来
                pictureList.forEach((item, index) => {
                  if (index < i) return
                  productList.push(item)
                })
                this.setData({
                  productList,
                  i: pictureList.length,
                  dataCatch
                });
              }
              this.setData({ listLoadingNow: false })
              this.setData({ toBottom: true, showBottom: true })
            }
          },
          error: (err) => {
            this.setData({ listLoadingNow: false })
            console.log(err);
          },
        }
      );
    },
    // 选中上方主题后触发
    checkTitle(e) {
      let {
        item,
        index
      } = e.currentTarget.dataset;
      //顶部导航埋点
      if (item) {
        let themeAllData = this.data.themeAllData;
        UTIL.jjyFRLog({
          clickType: 'C1003', //动作类型：点击事件
          conType: 'B1003', //页面维度：活动维度
          recommendTitle: item.recommendTitle, //活动名称
          recommendId: item.recommendId || item.sectionId, //活动ID
          // pitLocation:index+1, //坑位
          pitLocation: index + 1, //坑位
          parentSection: themeAllData.children[e.currentTarget.dataset.index].sectionId, //父级版块
          grandfatherSection: themeAllData.sectionId //祖父级版块
        })
      }
      let dataCatch = this.data.dataCatch
      this.setData({
        selectTitle: e.currentTarget.dataset.index,
        selectTitleSectionId: e.currentTarget.dataset.sectionid,
        page: 1,
        productList: dataCatch[index],
        nowLength: 0,
        i: 0,
        toBottom: false,
      });
      this.getCommodityData(e.currentTarget.dataset.sectionid, true);
    },
    // 轮播图改变后触发
    swiperChange: function (e) {
      this.setData({
        currentSwiper: e.detail.current,
      });
    },
    // 添加购物车
    addCart(event) {
      //大小主题-添加购物车
      UTIL.jjyFRLog({
        clickType: 'C1003', //动作类型：点击事件
        conType: 'B1004', //页面维度：按钮维度
        operationId: 'D1024', //事件id
        operationContent: '', //输入内容
        operationUrl: '' //输入链接
      })
      let herader = this.selectComponent("#cartAnimation");
      let that = this;
      let { goods } = event.currentTarget.dataset;
      //console.log(goods);
      let num = UTIL.getNumByGoodsId(
        goods.goodsId,
        goods.goodsSkuId || goods.skuId
      );
      let limitBuyCondition = UTIL.getlimitBuyNumByGoodsItem(goods, num);
      if (limitBuyCondition.isLimit) return;// 促销限购
      if (limitBuyCondition.returnNum > 0) {
        // 起购量
        if (num >= 1) {
          num = limitBuyCondition.returnNum - num;
        } else {
          num = limitBuyCondition.returnNum;
        }
        goods.num = num;
      }
      // if (goods.pricingMethod == 391) {
      // 	herader.touchOnGoods(event);
      //   // 记重处理
      // } else {
      if (num >= goods.goodsStock || goods.goodsStock == 0) {
        this.data.$.ti_shi("抱歉，该商品库存不足");
        return;
      }
      herader.touchOnGoods(event);
      // }
      // 加入购物车方法
      UTIL.setCartNum(goods);
      // 获取购物车商品数量
      this.CartNum();
      // this.data.$.ti_shi('您选择的商品已加入购物车');
      this.triggerEvent("_updateCartTotal");

    },
    // 跳转商品和广告
    autoJump(e) {
      let { url, item, adverindex, productIndex } = e.currentTarget.dataset;
      let baseNum = 0;
      //获取坑位ID
      let productList = this.data.productList;
      if (productList && productList.length > 0) {
        baseNum = Array.isArray(productList[0]) ? productList[0].length : 1;
      }
      let pitIndex = 0;
      //广告埋点
      if (adverindex) {
        if (productIndex == 0) {
          pitIndex = adverindex
        } else {
          pitIndex = productIndex + baseNum;
        }
      } else {
        pitIndex = productIndex + baseNum;
      }
      let themeAllData = this.data.themeAllData;
      //广告坑位
      if (adverindex) {
        UTIL.jjyFRLog({
          clickType: 'C1002', //跳转页面
          conType: 'B1003', //活动维度
          recommendTitle: item.recommendTitle, //活动名称
          recommendId: item.recommendId, //获取ID
          pitLocation: pitIndex, //坑位
          parentSection: themeAllData.children[this.data.selectTitle].sectionId, //父级版块
          grandfatherSection: themeAllData.sectionId //祖父级版块
        })
      } else {
        //商品坑位
        UTIL.jjyFRLog({
          clickType: 'C1002', //跳转页面
          conType: 'B1002', //商品维度
          sku: item.goodsSkuId, //商品sku
          goodsName: item.materielParentName || item.goodsPromotionName || item
            .shortTitle || item.goodsName || "", //商品名称
          goodsTag: item.goodsTag, //广告语
          promotionName: item.promotionList.length > 0 ? item.promotionList[0]
            .proName : '', //促销名称
          proPrice: item.proPrice < item.salePrice ? item.proPrice : item
            .salePrice, //售价
          originalPrice: item.salePrice, //原价
          inventory: item.goodsStock, //库存数
          pitLocation: pitIndex, //坑位
          parentSection: themeAllData.children[this.data.selectTitle].sectionId, //父级版块
          grandfatherSection: themeAllData.sectionId //祖父级版块
        })
      }
      console.log(item.bizType)
      // 判断是否是文章和食谱
      if (item.bizType == 673) {
        // 食谱
        let url = ''
        let extendJson = ''
        if (typeof item.extendJson == 'string') {
          extendJson = JSON.parse(item.extendJson)
        } else {
          extendJson = item.extendJson
        }
        url = "/pages/AA-RefactorProject/pagesSubcontract/RecipeDetails/index?contentId=" + extendJson
          .contentId + "&entrance=0"
        this.data.$.open(url)
      } else if (item.bizType == 674) {
        // 文章
        let url = ''
        let extendJson = ''
        if (typeof item.extendJson == 'string') {
          extendJson = JSON.parse(item.extendJson)
        } else {
          extendJson = item.extendJson
        }
        url = "/pages/AA-RefactorProject/pagesSubcontract/ArticleDetails/index?contentId=" + extendJson
          .contentId + "&entrance=0"
        this.data.$.open(url)
      } else {
        wx.navigateTo({
          url,
        });
      }
    },
    // 获取新的购物车数量
    CartNum() {
      this.setData({
        CartCount: UTIL.getCartCount(),
      });
    },
  },
  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
    },
    ready: function () {
      // 获取scroll高度
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },
});
