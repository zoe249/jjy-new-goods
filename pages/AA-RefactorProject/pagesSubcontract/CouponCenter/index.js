import * as $ from "../../common/js/js.js";
import * as UTIL from "../../../../utils/util.js";
import * as API from "../../../../utils/API.js";
import getSectionType from "../../../../utils/sectionId";

Page({
  data: {
    // 公用的js
    $: $,
    selectTitle: 0, // 顶部导航栏当前选中的index
    titleIsOpen: false, // 顶部导航栏的下拉按钮是否打开
    capsuleBottomHeight: 0, // 右上角胶囊底部位置
    capsuleTopHeight: 0, // 右上角胶囊顶部位置
    scrollOn: false, // 滚动条是否已经开始滚动（滚动高度是否为0）
    scrollTop: 0, // 滚动条滚动距离
    heightArr:[], // 小版块标题距离页面顶部高度的数组
    scrollViewHeight:0, // 领券中心最顶部标题内容高度
    titleInfoHeight:0, // 领券中心最顶部标题
    channelType:0,
    entrance:0,
    sectionId:0,
    couponArr:[],
    couponData:[],
    couponStorageData:[],
    refresh:0,
    stopScroll:false,
    isRefresh:false,
    fromShare:false,
     //埋点数据页面ID --  A1009优鲜领券中心  A2009 社团
	  currentPageId: '',
    topFixed:false,
    topEnable:true,
    scrollViewTop:0,
    couponTitleArr:[] // 顶部导航的数组
  },
  // 页面加载
  onLoad(e) {
    if(e.refresh){
      this.setData({refresh:1})
    }
    this.getTopHeight();
    this.setData({
        channelType:e.channelType,
        sectionId:e.sectionId,
        entrance:e.entrance,
        //埋点数据页面ID
        currentPageId:e.entrance==0?'A1009':'A2009'
    })
    // 获取领券中心大板块数据
    this.getCouponCenter(this.data.channelType,this.data.sectionId,this.data.entrance)
  },
  // 页面显示
  onShow() {
    let pages = getCurrentPages();
    if(pages.length==1){
      this.setData({fromShare:true})
    }
    if(this.data.isRefresh){
      this.setData({couponStorageData:[]})
      // 获取领券中心大板块数据
      this.getCouponCenter(this.data.channelType,this.data.sectionId,this.data.entrance)
      this.setData({isRefresh:false})
    }
    setTimeout(()=>{
        if(this.data.currentPageId!=''){
            UTIL.jjyFRLog({
                clickType: 'C1001', //打开页面
            })
        }
    },1)
  },
  // 领券中心分享
  onShareAppMessage() {
    let url = `/pages/AA-RefactorProject/pagesSubcontract/CouponCenter/index?entrance=${this.data.entrance}&sectionId=${this.data.sectionId}&channelType=${this.data.channelType}`
		let shopId = wx.getStorageSync('shopId')
    return {
			title: '领券中心',
			path: `pages/AA-RefactorProject/pages/wxAuth/wxAuth?url=${encodeURIComponent(url)}&entrance=0&shopId=${shopId}`,
		};
	},
  // 分享进到领券中心，左上角小房子直接返回定位页
  goBack(){
    if(this.data.fromShare){
      wx.navigateTo({
        url: '/pages/AA-RefactorProject/pages/wxAuth/wxAuth',
      })
    }else{
      wx.navigateBack()
    }
  },
  // 获取大板块信息
  getCouponCenter(channelType,sectionId,entrance){
    UTIL.ajaxCommon(this.data.entrance==0?API.NEW_SECTIONDEATAIL:API.ST_NEW_SECTIONDEATAIL, {
			"channelType": channelType,
			"sectionId": sectionId,
			"entrance": entrance
		},{
      success:(res)=>{
        let couponArr = []
        let couponTitleArr= []
        let data = res._data.children
        data.forEach(item=>{
          let title =item.children.find(item1=>{
            return item1.sectionType ==1630
          })
          if(title&&title.recommendList[0]){
            item.couponName = title.recommendList[0].recommendTitle
          }
          couponArr.push(item)
          // 判断小版块是否可用，可用就直接加入到数组中
          let enable = true
          let infoEnable = false
          item.children.forEach(item1=>{
            if(item1.sectionType==1630){
              if(!item1.recommendList[0]) enable = false
            }else {
              if(item1.children){
                item1.children.forEach(item2=>{
                  if(item2.sectionType==1812){
                    if(item2.recommendList[0]) infoEnable = true
                  }
                })
              }
            }
          })
          if(!infoEnable) enable = false
          if(enable){
            couponTitleArr.push(title.recommendList[0].recommendTitle)
          }
        })
        this.setData({couponArr,couponTitleArr})
        // 通过大板块信息，循环获取小版块
        this.forEachCoupon(channelType,entrance)
      },
      fail: (res) => {
      }
    })
  },
  // 获取小版块数据
  forEachCoupon(channelType,entrance){
    let couponArr = this.data.couponArr
    let couponStorageData =this.data.couponStorageData
    // 判断大板块的数组是否还有值，如果没有值代表全部获取完成，如果有值则继续获取第一项，拿完第一项数据后删除第一项
    if(couponArr.length>0){
      this.getCouponData(couponArr[0].sectionId,channelType,entrance).then(res=>{
        if(couponArr[0].couponName&&res.length>0){
          couponStorageData.push({name:couponArr[0].couponName,info:res,sectionId:couponArr[0].sectionId})
        }
        // 获取成功后删除第一项
        couponArr.shift()
        this.setData({couponStorageData,couponArr})
        this.setData({couponData:couponStorageData})
        // 再次循环大板块数组
        this.forEachCoupon(channelType,entrance)
      })
    }else{
      console.log(couponStorageData)
      this.setData({couponData:couponStorageData})
      let heightArr = [];
      // 所有数据获取完成后，获得每个小版块标题的位置，方便点击顶部导航的定位
      
      let viewPort = wx.createSelectorQuery().in(this).selectViewport()
      viewPort.scrollOffset(res=>{
        console.log(res)
        let scrollTop = res.scrollTop
        this.data.couponData.forEach((item, index) => {
          wx.createSelectorQuery().in(this).select(`#quan_${index}`)
          .boundingClientRect((rect) => {
              console.log(scrollTop)
              heightArr.push(rect.top+scrollTop);
            })
            .exec(()=>{
              if(index == this.data.couponData.length - 1){
                console.log(heightArr)
                this.setData({heightArr: heightArr})
              }
            });
        });
      }).exec(()=>{
      })
    }
  },
  clickButton(e){
      let loginFlag = wx.getStorageSync('loginFlag') ? wx.getStorageSync('loginFlag') : 0
      let entrance = this.data.entrance; //0 优鲜 1 社区团购
      if(loginFlag == 1){
        let {coupon,show,index ,infoindex} = e.currentTarget.dataset
        if(coupon.extendObj[0].status==1){
            //埋点数据-立即领取
            UTIL.jjyFRLog({
                clickType:'C1003', //点击事件
                conType:'B1003', //动作类型：活动维度
                recommendTitle: '立即领取', //活动名称
                recommendId: this.data.couponData[index].sectionId, //活动ID
                pitLocation: infoindex + 1, //坑位
                parentSection: this.data.couponData[index].sectionId, //父级版块
                grandfatherSection: this.data.sectionId //祖父级版块
            })
          this.receiveCoupon(coupon.extendObj[0].couponId,index,infoindex)
        }else if(coupon.extendObj[0].status==4){
          this.jumpUseCoupon(coupon.extendObj[0].couponCodeId,coupon.extendJson[0].templateId,show,index ,infoindex)
        }
      }else{
        this.setData({isRefresh:true})
        let url = `/pages/AA-RefactorProject/pagesSubcontract/CouponCenter/index?entrance=${this.data.entrance}&sectionId=${this.data.sectionId}&channelType=${this.data.channelType}&refresh=1`
        wx.navigateTo({
          url: `/pages/user/wxLogin/wxLogin` + "?pages=" + url
        })
      }
  },
  jumpUseCoupon(codeId,templateId,show,index ,infoindex) {
    UTIL.ajaxCommon(API.URL_COUPON_QUERYCOUPONDETAIL, {
      "codeId": codeId,
      "templateId": templateId,
    }, {
      success: (res) => {
        if (res._code == API.SUCCESS_CODE) {
          let couponInfoData = res._data
          var forwardType = couponInfoData.forwardType;
          var templateId = couponInfoData.templateId;
          var codeId = couponInfoData.codeId;
          var singleGoods = couponInfoData.singleGoods;
          var useNow = couponInfoData.useNow;
          if(show==1){
            //埋点数据-展示券码
            UTIL.jjyFRLog({
                clickType:'C1002', //跳转事件
                conType:'B1003', //动作类型：活动维度
                recommendTitle: '展示券码', //活动名称
                recommendId: this.data.couponData[index].sectionId, //活动ID
                pitLocation: infoindex + 1, //坑位
                parentSection: this.data.couponData[index].sectionId, //父级版块
                grandfatherSection: this.data.sectionId //祖父级版块
            })
            wx.navigateTo({
              url: `/pages/user/couponDetails/couponDetails?codeId=${codeId}&templateId=${templateId}`,
            })
            return
          }
          // if (useNow == 0) return;
            //埋点数据-立即使用
            UTIL.jjyFRLog({
                clickType:'C1002', //跳转事件
                conType:'B1003', //动作类型：活动维度
                recommendTitle: '立即使用', //活动名称
				        recommendId: this.data.couponData[index].sectionId, //活动ID
                pitLocation: infoindex + 1, //坑位
                parentSection: this.data.couponData[index].sectionId, //父级版块
                grandfatherSection: this.data.sectionId //祖父级版块
            })
          if(!forwardType){
            $.dui_hua({
              title: "提 示",
              content: "此券无法在当前门店使用",
              r_text:'查看详情',
              r_color:'#ff0000',
							r_fun: () => {
								wx.navigateTo({
                  url: `/pages/user/couponDetails/couponDetails?codeId=${codeId}&templateId=${templateId}`,
                })
							}
						})
          }
          switch (forwardType){
            case 1:
              if(this.data.entrance==0){
                wx.reLaunch({
                  url: '/pages/AA-RefactorProject/pages/index/index',
                })
              }else{
                wx.reLaunch({
                  url: '/pages/AA-RefactorProject/pages/Community/index',
                })
              }
            break;
            case 2:
              wx.navigateTo({
                url: '/pages/goods/detail/detail?goodsId=' + singleGoods,
              })
              break;
              
            case 3:
              wx.navigateTo({
                url: '/pages/user/couponGoodsList/couponGoodsList?codeId=' + codeId+'&templateId='+templateId
              })
              break;
            case 4:
              // 服务列表,
              console.log(4);
              break;
            case 5:
            // 服务单品详情
              console.log(5);
              break;
          }
        }
      }
    });
    
  },
  
  receiveCoupon(couponId,index,infoindex) {
    UTIL.ajaxCommon(API.URL_COUPON_DRAW, {
      couponId,
      batchType:271,
    }, {
      success: (res) => {
        $.ti_shi(res._msg)
        if(res._code =='000000'){
          let couponData = this.data.couponData
          let nowDate = Date.parse(new Date())
          let sectionId = couponData[index].info[infoindex].coupon.sectionId
          let extendObj = couponData[index].info[infoindex].coupon.recommendList[0].extendObj[0]
          let {channelType,entrance} = this.data
          UTIL.ajaxCommon(entrance==0?API.SECTION_MORE_DETAIL:API.ST_SECTION_MORE_DETAIL, {
            "channelType": channelType,
            "sectionId": sectionId,
            "entrance": entrance
          },{
            success:(res)=>{
              if(res._code=='000000'){
                extendObj.couponCodeId=res._data.recommendList[0].extendObj[0].couponCodeId
                if(nowDate>=extendObj.beginTime&&nowDate<=extendObj.endTime){
                  extendObj.status=4
                }else{
                  extendObj.status=3
                }
                this.setData({couponData})
              }
            }
          })
        }
        // this.setData({couponStorageData:[]})
        // this.getCouponCenter(channelType,sectionId,entrance)
      },
      fail:(res)=>{}
    })
  },
  getCouponData(sectionId,channelType,entrance){
    let coupon = 1812
    let couponCommodity = 1911
    return new Promise((resolve, reject)=>{
      UTIL.ajaxCommon(entrance==0?API.SECTION_MORE_DETAIL:API.ST_SECTION_MORE_DETAIL, {
        "channelType": channelType,
        "sectionId": sectionId,
        "entrance": entrance
      },{
        success:(res)=>{
          let arr = []
          let topArr = []
          let lastArr=[]
          try{
            res._data.children.forEach(item=>{
              let data = {}
              if(item.children){
                item.children.forEach(item2=>{
                  if(item2.sectionType==coupon){
                    if(item2.recommendList[0]){
                      item2.recommendList[0].extendJson = JSON.parse(item2.recommendList[0].extendJson)
                      item2.recommendList[0].extendJson[0].templateRule=JSON.parse(item2.recommendList[0].extendJson[0].templateRule)
                      var date = new Date(item2.recommendList[0].extendObj[0].batchBeginTime)
                      item2.recommendList[0].extendObj[0].time=`${date.getMonth()+1}月${date.getDate()}日`
                      data.coupon = item2
                    }
                  }else if(item2.sectionType==couponCommodity){
                    let finnalArr = []
                    item2.recommendList.forEach(item3=>{
                      if(item3.extendJson!='null'){
                        item3.extendJson = JSON.parse(item3.extendJson)
                        finnalArr.push(item3)
                      }
                    })
                    item2.recommendList = finnalArr
                    data.couponCommodity = item2
                  }
                })
                if(data.couponCommodity&&data.coupon&&data.couponCommodity.recommendList.length>0){
                  topArr.push(data)
                }else if(data.coupon){
                  lastArr.push(data)
                }
              }else if(item.sectionType==coupon){
                if(item.recommendList[0]){
                  item.recommendList[0].extendJson = JSON.parse(item.recommendList[0].extendJson)
                  item.recommendList[0].extendJson[0].templateRule=JSON.parse(item.recommendList[0].extendJson[0].templateRule)
                  var date = new Date(item.recommendList[0].extendObj[0].batchBeginTime)
                  item.recommendList[0].extendObj[0].time=`${date.getMonth()+1}月${date.getDate()}日`
                  data.coupon = item
                }
                if(data.coupon) lastArr.push(data)
              }
            })
            arr=[...topArr,...lastArr]
          }catch (e) {
            console.log(e)
          }
          resolve(arr)
        },
        fail: (res) => {
        }
      })
    })
  },
  // 自定义方法开始
  gotoScroll(e){
    let { index ,item } = e.currentTarget.dataset;
    let heightArr = this.data.heightArr
    let scrollViewHeight = this.data.scrollViewHeight
    let capsuleBottomHeight = this.data.capsuleBottomHeight
    let titleInfoHeight = this.data.titleInfoHeight
    this.setData({stopScroll:true,selectTitle:index,titleIsOpen:false})
    UTIL.jjyFRLog({
        clickType:'C1003', //动作类型：按钮维度
        conType:'B1003', //内容类型：活动维度
        recommendTitle:item.name, //活动名称
        recommendId: item.sectionId, //活动id
        pitLocation: index+1, //坑位
        parentSection: item.sectionId, //父级版块
        grandfatherSection: this.data.sectionId //祖父级版块
    })
    wx.pageScrollTo({
      scrollTop: this.data.titleIsOpen?heightArr[index]-scrollViewHeight-capsuleBottomHeight-10-titleInfoHeight:heightArr[index]-scrollViewHeight-capsuleBottomHeight-10,
      duration: 300
	  })
  },
  getTopHeight() {
    let menuInfo = wx.getMenuButtonBoundingClientRect();
	wx.createSelectorQuery()
        .in(this)
        .select('.titleContent')
        .boundingClientRect((rect) => {
			this.setData({scrollViewHeight:rect.height,scrollViewTop:rect.top})
        })
        .exec();
    this.setData({
      capsuleBottomHeight: menuInfo.bottom,
      capsuleTopHeight: menuInfo.top,
    });
  },
  openRules(e) {
    let { firstindex, secondindex } = e.target.dataset;
    let { firstIndex, secondIndex } = this.data;
    if (firstIndex == firstindex && secondindex == secondIndex) {
      this.setData({ firstIndex: null, secondIndex: null });
    } else {
      this.setData({ firstIndex: firstindex, secondIndex: secondindex });
    }
  },
  openTitle() {
    let titleIsOpen = this.data.titleIsOpen;
    this.setData({ titleIsOpen: !titleIsOpen });
  //   wx.createSelectorQuery()
  //   .in(this)
  //   .select('.titleContent')
  //   .boundingClientRect((rect) => {
  // this.setData({scrollViewHeight:rect.height})
  //   })
  //   .exec();
	//   wx.createSelectorQuery()
  //       .in(this)
  //       .select('.titleInfo')
  //       .boundingClientRect((rect) => {
	// 		    if(rect&&this.data.titleInfoHeight==0) this.setData({titleInfoHeight:rect.height})
  //       })
  //       .exec();
  },
  onPageScroll(e) {
    let scroll = e.scrollTop;
    this.setData({ scrollTop: scroll });
	  let heightArr = this.data.heightArr
    let scrollOn = this.data.scrollOn;
    let scrollViewHeight = this.data.scrollViewHeight;
    let scrollViewTop = this.data.scrollViewTop;
    let capsuleBottomHeight = this.data.capsuleBottomHeight;
    let titleInfoHeight = this.data.titleInfoHeight;
    if (scroll > 0 && !scrollOn) {
      this.setData({ scrollOn: true });
    } else if (scroll == 0 && scrollOn) {
      this.setData({ scrollOn: false });
    }
    if(scroll>=(scrollViewTop-capsuleBottomHeight-10)&&!this.data.topFixed){
      this.setData({ topFixed:true})
    }else if(scroll<(scrollViewTop-capsuleBottomHeight-10)&&this.data.topFixed){
      this.setData({topFixed:false})
    }
    if(this.data.stopScroll){
      if(!this.data.timeout){
        let timeout = setTimeout(() =>{
          this.setData({stopScroll:false,timeout:null})
        },400)
        this.setData({timeout})
      }
    }else{
      try{
        heightArr.forEach((item,index)=>{
          let needScroll = this.data.titleIsOpen?item-scrollViewHeight-capsuleBottomHeight-10-titleInfoHeight:item-scrollViewHeight-capsuleBottomHeight-10
          if(scroll<needScroll){

            if(this.data.selectTitle!==(index==0?index:index-1)){
              this.setData({ selectTitle: index==0?index:index-1})
            }
            throw new Error("end")
          }else{
            if(index == heightArr.length-1){
              console.log(index)
              this.setData({ selectTitle: index})
            }
          }
        })
      }catch(e){
      }
    }
  },
  // 自定义方法结束
  // 计算属性
  computed: {},
  // 侦听器
  watch: {},
  // 页面隐藏
  onHide() {},
  // 页面卸载
  onUnload() {},
  // 触发下拉刷新
  onPullDownRefresh() {
    this.setData({couponStorageData:[]})
    this.getCouponCenter(this.data.channelType,this.data.sectionId,this.data.entrance)
  },
  // 页面上拉触底事件的处理函数
  onReachBottom() {},
});
