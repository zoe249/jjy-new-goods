import * as $ from "../../common/js/js";
import getSectionType from "../../../../utils/sectionId.js";
import * as UTIL from "../../../../utils/util.js";
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    hotData: {
      // 必买爆品数据
      type: Array,
      value: [],
    },
    hotSectionId: {
      // 必买爆品的大板块sectionId
      type: Number,
      value: 0,
    },
    // 判断优鲜还是社团
    TypeShow: {
      type: Boolean,
      value: true,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    $: $,
    titleData: "", // 必买爆款的标题信息
    dataList: [], // 商品数据
    subImg: "", // 副标题背景图
    headImg: "", // 标题图片
    themeBg: "", // 顶部背景
    subtitle: "", // 标题
    mainSectionId: 0, // 必买爆品的sectionId  用于进入频道页
    mainChannelType: 0, // channeltype   用于进入频道页
    // loadingShow: false,
  },

  /**
   * 组件的方法列表
   */
  observers: {
    hotData(newVal) {
      console.log('必买爆款', newVal)
      let that = this
      that.processHotData(newVal)
    }
  },
  methods: {
    // 跳转方法
    autoJump(e) {
      let { url, index, item } = e.currentTarget.dataset;

      if (index && item) {
        let goodsItem = item.data;
        //必买爆品版块id
        let bmbp_sectionId = this.data.hotSectionId;
        UTIL.jjyFRLog({
          clickType: "C1002", //跳转页面
          conType: "B1002", //内容维度 商品维度
          sku: goodsItem.goodsSkuId, //商品sku
          goodsName:
            goodsItem.materielParentName ||
            goodsItem.goodsPromotionName ||
            goodsItem.shortTitle ||
            goodsItem.goodsName ||
            "", //商品名称
          goodsTag: goodsItem.goodsTag, //广告语
          promotionName:
            goodsItem.promotionList.length > 0
              ? goodsItem.promotionList[0].proName
              : "", //促销名称
          proPrice:
            goodsItem.proPrice < goodsItem.salePrice
              ? goodsItem.proPrice
              : goodsItem.salePrice, //售价
          originalPrice: goodsItem.salePrice, //原价
          inventory: goodsItem.goodsStock, //库存数
          pitLocation: index, //坑位
          parentSection: bmbp_sectionId, //父级版块
          grandfatherSection: bmbp_sectionId, //祖父级版块
        });
      }
      wx.navigateTo({
        url,
      });
    },
    // 添加购物车
    addCart(event) {
      let that = this;
      let { goods } = event.currentTarget.dataset;
      //必买爆品-添加购物车
      UTIL.jjyFRLog({
        clickType: "C1003", //动作类型：点击事件
        conType: "B1004", //页面维度：按钮维度
        operationId: "D1024", //事件id  TypeShow =true优鲜 false
        operationContent: "", //输入内容
        operationUrl: "", //输入链接
      });
      let num = UTIL.getNumByGoodsId(
        goods.goodsId,
        goods.goodsSkuId || goods.skuId
      );
      let limitBuyCondition = UTIL.getlimitBuyNumByGoodsItem(goods, num);
      console.log(limitBuyCondition);
      if (limitBuyCondition.isLimit) {
        return; // 促销限购
      }
      let herader = this.selectComponent("#cartAnimation");
      herader.touchOnGoods(event);
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
      //   // 记重处理
      // } else {
      if (num >= goods.goodsStock || goods.goodsStock == 0) {
        this.data.$.ti_shi("抱歉，该商品库存不足");
        return;
      }
      // }
      // 加入购物车方法
      UTIL.setCartNum(goods);
      // this.data.$.ti_shi('您选择的商品已加入购物车');
      this.triggerEvent("_updateCartTotal");
    },
    // 社团加入购物车
    STaddCart(event) {
      let { goods } = event.currentTarget.dataset;
      //   this.setData({
      //     loadingShow: true,
      //   });
      let shopId = UTIL.getShopId();
      let obj = {
        shopId: shopId,
        goodsId: goods.goodsId,
        proId: goods.proId,
      };
      //必买爆品-添加购物车
      UTIL.jjyFRLog({
        clickType: "C1003", //动作类型：点击事件
        conType: "B1004", //页面维度：按钮维度
        operationId: "D1022", //事件id  TypeShow =true优鲜 false
        operationContent: "", //输入内容
        operationUrl: "", //输入链接
      });
      this.data.$.getGoodsDetail(obj, (res) => {
        if (res) {
          // 调用子组件方法
          let herader = this.selectComponent("#cartAnimation");
          herader.touchOnGoods(event);
          // 获取购物车商品数量
          this.triggerEvent("_updateCartTotal");
          //   this.setData({
          //     loadingShow: false,
          //   });
        } else {
          //   this.setData({
          //     loadingShow: false,
          //   });
        }
      });
    },
    // 跳转到必买爆款频道页
    toClassification(event) {
      let SectionId = this.data.mainSectionId;
      let ChannelType = this.data.mainChannelType;
      let dataList = this.data.hotData;
      //页面入口 1优鲜 2社团
      let { entrance } = event.currentTarget.dataset;
      /*埋点*/
      UTIL.jjyFRLog({
        clickType: 'C1002', //跳转页面
        conType: 'B1003', //活动维度
        recommendTitle: '更多', //活动名称
        recommendId: '0', //活动ID
        pitLocation: '0', //坑位
        parentSection: dataList[0].sectionParent, //父级版块
        grandfatherSection: dataList[0].sectionParent //祖父级版块
      })
      wx.navigateTo({
        url: `/pages/AA-RefactorProject/pagesSubcontract/Explosives/index?sectionId=${SectionId}&channelType=${ChannelType}&entrance=${entrance}`,
      });
    },
    // 跳转商品详情页
    goGoodsDetail(event) {
      let { goods, index, item } = event.currentTarget.dataset;
      if (index && item) {
        //必买爆品版块id
        let bmbp_sectionId = this.data.hotSectionId;
        UTIL.jjyFRLog({
          clickType: "C1002", //跳转页面
          conType: "B1002", //内容维度 商品维度
          sku: goods.skuId, //商品sku
          goodsName:
            goods.materielParentName ||
            goods.goodsPromotionName ||
            goods.shortTitle ||
            goods.goodsName ||
            "", //商品名称
          goodsTag: goods.goodsTag, //广告语
          promotionName:
            goods.proType == 1888
              ? "社区拼团"
              : goods.proType == 1178
                ? "社区秒杀"
                : "直降", //促销名称  1888 拼团  1178 秒杀 289 直降
          proPrice: goods.goodsPrice, //售价
          originalPrice: goods.goodsPrimePrice, //原价
          inventory:
            goods.proType == 1888 ? goods.surplusStock : goods.totalStock,
          //  goods.proType == 1888 ? '社区拼团' : goods.surplusStock, //库存数
          pitLocation: index, //坑位
          parentSection: bmbp_sectionId, //父级版块
          grandfatherSection: bmbp_sectionId, //祖父级版块
        });
      }

      let shopId = UTIL.getShopId();
      let url =
        "/pages/groupManage/detail/detail" +
        "?from=shuidan&goodsId=" +
        goods.goodsId +
        "&proId=" +
        goods.proId +
        "&shopId=" +
        shopId;
      this.data.$.open(url);
    },
    processHotData(hotData) {
      // 获取必买爆款的标题、背景、商品等数据
      let dataList = [];
      let dataType = [];
      let dataTitle = [];
      let dataBg = [];
      // 判断优鲜还是社团
      try {
        if (this.properties.TypeShow) {
          dataType = getSectionType("hotDataList", hotData);
          dataTitle = getSectionType("hotTitle", hotData);
          dataBg = getSectionType("hotBg", hotData);
          let arr1 = [];
          let arr2 = [];
          dataType.recommendList.map((item) => {
            if (
              JSON.parse(item.extendJson) == null ||
              JSON.parse(item.extendJson) == "null"
            ) {
              return false;
            } else {
              let sale = false; // 是否参加直降的标识
              JSON.parse(item.extendJson).promotionList.forEach((item) => {
                if (item.proType == 289) sale = true;
              });
              if (item.bizType === 19) {
                if (JSON.parse(item.extendJson).goodsStock < 1) {
                  arr1.push({
                    data: JSON.parse(item.extendJson),
                    imgUrl: item.imgUrl,
                    title: item.recommendTitle,
                    sale,
                    sectionId: item.sectionId,
                  });
                } else if (JSON.parse(item.extendJson).promotionList[0]) {
                  if (
                    (JSON.parse(item.extendJson).proType == 1821 ||
                      JSON.parse(item.extendJson).proType == 999 ||
                      JSON.parse(item.extendJson).promotionList[0].proType ==
                      1821 ||
                      JSON.parse(item.extendJson).promotionList[0].proType ==
                      1888) &&
                    JSON.parse(item.extendJson).promotionList[0].proStock == 0
                  ) {
                    arr1.push({
                      data: JSON.parse(item.extendJson),
                      imgUrl: item.imgUrl,
                      sale,
                      title: item.recommendTitle,
                      sectionId: item.sectionId,
                    });
                  } else {
                    arr2.push({
                      data: JSON.parse(item.extendJson),
                      imgUrl: item.imgUrl,
                      sale,
                      title: item.recommendTitle,
                      sectionId: item.sectionId,
                    });
                  }
                } else {
                  arr2.push({
                    data: JSON.parse(item.extendJson),
                    imgUrl: item.imgUrl,
                    sale,
                    title: item.recommendTitle,
                    sectionId: item.sectionId,
                  });
                }
              }
            }
          });
          dataList = [...arr2, ...arr1];
          dataList.forEach(item => {
            if (item.data.proPrice < item.data.salePrice) {
              let newArr = item.data.proPrice.toString().split(".");
              item.data.int = newArr[0];
              item.data.dec = newArr[1];
            } else {
              let newArr = item.data.salePrice.toString().split(".");
              item.data.int = newArr[0];
              item.data.dec = newArr[1];
            }
          })
          if (dataList.length > 5)
            dataList.push({
              type: 1,
            }); // type=1 增加个查看更多
          if (dataList.length < 4 && dataList.length > 0)
            dataList.push({
              type: 2,
            }); // type=2 增加个暂无商品
          this.setData({
            titleData: dataTitle.recommendList[0]
              ? dataTitle.recommendList[0].recommendTitle
              : "",
            subtitle: dataTitle.recommendList[0]
              ? dataTitle.recommendList[0].describle
                ? JSON.parse(dataTitle.recommendList[0].describle).subTitle
                : ""
              : "",
            themeBg: dataBg.recommendList[0]
              ? dataBg.recommendList[0].describle
                ? JSON.parse(dataBg.recommendList[0].describle).themeBg
                : ""
              : "",
            headImg: dataTitle.recommendList[0]
              ? dataTitle.recommendList[0].imgUrl
              : "",
            subImg: dataTitle.recommendList[0]
              ? dataTitle.recommendList[0].imgBackGroundUrl
              : "",
            dataList,
            mainSectionId: this.data.hotSectionId,
            mainChannelType: dataType.channelType,
          });
        } else {
          dataType = getSectionType("manualDataList", hotData);
          dataTitle = getSectionType("manualTitle", hotData);
          dataBg = getSectionType("manualBg", hotData);
          let listYes = [];
          let listNo = [];
          dataType.recommendList.forEach((item) => {
            item.extendJson = JSON.parse(item.extendJson);
            if (item.extendJson) {
              // 判断是否有直降 有直降显示原价
              if (item.extendJson.proType == 289) {
                item.extendJson.proTypes = true;
              }
              // 售罄商品沉底
              if (
                (item.extendJson.proType == 1888 &&
                  item.extendJson.surplusStock <= 0) ||
                item.extendJson.ratio >= 100
              ) {
                listNo.push(item);
              } else {
                listYes.push(item);
              }
            }
          });
          dataList.push(...listYes);
          dataList.push(...listNo);
          dataList.forEach(item => {
            item.extendJson.goodsPrice
            let newArr = item.extendJson.goodsPrice.toString().split(".");
            item.extendJson.int = newArr[0];
            item.extendJson.dec = newArr[1];
          })
          if (dataList.length > 5)
            dataList.push({
              // type=1 增加个查看更多
              type: 1,
            });
          if (dataList.length < 4 && dataList.length > 0)
            dataList.push({
              // type=2 增加个暂无商品
              type: 2,
            });
          // console.log(dataList)
          this.setData({
            titleData: dataTitle.recommendList[0]
              ? dataTitle.recommendList[0].recommendTitle
              : "",
            headImg: dataTitle.recommendList[0]
              ? dataTitle.recommendList[0].imgUrl
              : "",
            subtitle: dataTitle.recommendList[0]
              ? dataTitle.recommendList[0].describle
              : "",
            subImg: dataTitle.recommendList[0]
              ? dataTitle.recommendList[0].imgBackGroundUrl
              : "",
            themeBg: dataBg.recommendList[0]
              ? dataBg.recommendList[0].describle
                ? JSON.parse(dataBg.recommendList[0].describle).themeBg
                : ""
              : "",
            dataList,
            mainSectionId: this.data.hotSectionId,
            mainChannelType: dataType.channelType,
          });
        }
      } catch (e) {
        console.log(e);
      }
    },
  },
  ready() {
    this.processHotData(this.data.hotData)
  },
});
