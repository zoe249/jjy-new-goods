// pages/shopList/shopList.js
import * as UTIL from '../../utils/util.js';
import * as API from '../../utils/API.js';
import { relocateByShopLocation } from '../../templates/storeItem/storeItem.js';

const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isChose:false,
    //服务端返回的数据
    //storeListService: [],
    storeListSearchResult:[],
    storeListUIShow:[],
    page: 0,
    scrollTop: 0,
    pageNum:4,
    inputContent:''
  },
  // 清空输入框
  clearSearch() {
    this.setData({
        inputContent: '',
    })
    this.getStoreList();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.setData({
          isGroupManage: options.isGroupManage ? options.isGroupManage:0,
          isChose:!!wx.getStorageSync("shopId")?true:false,
          longitude:options.longitude,
          latitude:options.latitude
      })
    this.getStoreList();
    
  },
  /**
   * 前端分页加载
   */
  freshStoreList()
  {
    var that=this;
      if(that.data.storeListSearchResult.length==that.data.storeListUIShow.length)
      {
        console.log("无需分页加载");
          return;
      }
      console.log("分页加载");
    
      var storeListUIShow =that.data.storeListSearchResult.slice(0,(that.data.page+1)*that.data.pageNum);
      that.setData({
        storeListUIShow:storeListUIShow,
        page:that.data.page+1,
        emptyData:null
      })
      
  },
  /*
  键盘搜索
  */
//   doSearch()
//   {
//       var data_search=[];
//       this.data.storeListService.forEach(element => {
//         var n=element.shopName.indexOf(this.data.inputContent);
//         if(n!=-1)
//         {
//             data_search.push(element);
//         }
//       });
//       this.setData({
//           storeListSearchResult:data_search,
//           page:0,
//           storeListUIShow:[]
//       })
//       this.freshStoreList();

//   }
 // ,
  // 输入框值发生变化
  searchInput(event) {
    const {
      value
    } = event.detail;
    this.setData({
      inputContent: value,
    });
    this.getStoreList();
  },
  getStoreList() {
      this.setData({
        storeListSearchResult:[],
        storeListUIShow:[],
        page:0
      })
    let { longitude, latitude } = APP.globalData.locationInfo;
    if ((!APP.globalData.locationInfo || !APP.globalData.locationInfo.longitude) && this.data.longitude ){
      longitude = this.data.longitude;
      latitude = this.data.latitude;
    } else {
      longitude = UTIL.getLongitude();
      latitude = UTIL.getLatitude();
    }
    let shopName=this.data.inputContent;
    
    UTIL.ajaxCommon(`${API.URL_PREFIX}/location/shopdefaultbylocation`, {
      longitude,
      latitude,
      shopName
    }, {
      success: (res)=>{
        if (res._code == API.SUCCESS_CODE){
          if(res._data && res._data.shopList.length > 0){
            let list = res._data.shopList.filter(item => item.shopAttribute != 3)
            this.setData({
                storeListSearchResult: list,
            });
            this.freshStoreList();

          } else {
            this.setData({
              emptyData:{
                emptyMsg:'暂未查询到门店'
              }
            })
          }
        }
      },
      complete:(res)=>{
        if(res._code != API.SUCCESS_CODE){
          this.setData({
            emptyData:{
              emptyMsg:'暂未查询到门店'
            }
          })
        }
      }
    });
  },
  onUnload(){
    APP.globalData.needReloadCurrentPageOnShow = !this.data.isChose
  },
  relocateByShopLocation,
})