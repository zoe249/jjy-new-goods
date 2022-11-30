import * as $ from '../../common/js/js'
import getSectionType from "../../../../utils/sectionId.js";
import * as UTIL from "../../../../utils/util.js";
Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		// 传过来的商品数据
		mainRecomData: {
			type: Object,
			value: {}
		},
		hotSectionId: { // 必买爆品的大板块sectionId
			type: Number,
			value: 0
		},
		// 判断需要展示的背景
		itemIndex: {
			type: Number,
			value: 0
		},

	},

	/**
	 * 组件的初始数据
	 */
	data: {
		// 公共方法
		$: $,
		// 处理后的商品数据
		mainData: {}

	},
	observers: {
		mainRecomData(val) {
			console.log('今日主推----------------------', val)
			let todayPushTitle = getSectionType("todayPushTitle", val.children);
			let todayPushImg = getSectionType("todayPushImg", val.children);
			let todayPushCommodity = getSectionType("todayPushCommodity", val.children);
			// 对商品进行处理
			let dataList = []
			todayPushCommodity.recommendList.forEach(item => {
				item.extendJson = JSON.parse(item.extendJson)
				if (item.extendJson) {
					// 判断是否有直降 有直降显示原价
					if (item.extendJson.proType == 289) {
						item.extendJson.proTypes = true
					}
					dataList.push(item)
				} else {
					dataList.push({
						noShop: true
					})
				}
			})
			//console.log(dataList)
			this.setData({
				mainData: {
					titleObj: todayPushTitle.recommendList[0],
					commodityObj: dataList,
					mainSectionId: this.data.hotSectionId,
					mainChannelType: todayPushCommodity.channelType
				}
			})
		}
	},
	/**
	 * 组件的方法列表
	 */
	methods: {
		// 跳转到必买爆款频道页
		toClassification(e) {
			let {
				item
			} = e.currentTarget.dataset;
			let recommendTitle = null
			let recommendId = null
			if (item.titleObj) {
				recommendTitle = item.titleObj.recommendTitle
				recommendId = item.titleObj.recommendId
			}
			/*埋点*/
			UTIL.jjyFRLog({
				clickType: 'C1002', //跳转页面
				conType: 'B1003', //活动维度
				recommendTitle: recommendTitle, //活动名称
				recommendId: recommendId, //活动ID
				pitLocation: this.properties.itemIndex + 1, //坑位
				parentSection: item.mainSectionId, //父级版块
				grandfatherSection: item.mainSectionId //祖父级版块
			})

			let SectionId = this.data.mainData.mainSectionId
			let ChannelType = this.data.mainData.mainChannelType
			this.data.$.open(
				`/pages/AA-RefactorProject/pagesSubcontract/Explosives/index?sectionId=${SectionId}&channelType=${ChannelType}&itemIndex=${this.properties.itemIndex}`
			)
		},
	},

})
