// const list =[
//     {name:'',sectionType:0},
//     {name:'hotData',sectionType:2154},  // 必买爆款
//     {name:'hotTitle',sectionType:1630},  // 必买爆款标题
//     {name:'hotBg',sectionType:1370},  // 必买爆款背景
//     {name:'hotTitleImg',sectionType:1326},  // 必买爆款促销头图
//     {name:'hotDataList',sectionType:2163},   // 必买爆款商品
//     {name:'bigSmallTheme',sectionType:2155},  // 大小主题板块
//     {name:'bigSmallThemeTitle',sectionType:1630},  // 大小主题标题
//     {name:'bigSmallThemeImg',sectionType:1703}, // 大小主题广告图片
//     {name:'bigSmallThemeCommodity',sectionType:2164},  // 大小主题商品
//     {name:'homePageAlert',sectionType:1751},    // 首页弹窗
//     {name:'channelList',sectionType:1925},    // 顶部频道栏
//     {name:'topImg',sectionType:25},    // 顶部轮播图
//     {name:'todayPushTitle',sectionType:1630},    // 今日主推标题
//     {name:'todayPushImg',sectionType:1326},    // 今日主推图片
//     {name:'todayPushCommodity',sectionType:2168},    // 今日主推商品
//     {name:'todayPushData',sectionType:2157},    // 今日主推商品
//     {name:'todayPushBg',sectionType:1370},    // 今日主推背景
// 	{name:'manual',sectionType:2166},  // 手工推荐
// 	{name:'manualTitle',sectionType:1630},  // 手工推荐标题
// 	{name:'manualBg',sectionType:1370},  // 手工推荐背景
// 	{name:'manualTitleImg',sectionType:1326},  // 手工推荐促销头图
// 	{name:'manualDataList',sectionType:2167},   // 手工推荐商品
// 	{name:'yueXuan',sectionType:2158},   // 家家悦选
// 	{name:'yueXuanImg',sectionType:1703},   // 家家悦选广告图
// 	{name:'yueXuanData',sectionType:2165},   // 家家悦选商品
// 	{name:'bgTheme',sectionType:1704},   // 家家悦选商品
// 	{name:'fenleiqiu',sectionType:27},   // 分类球板块
// 	{name:'daodianchi',sectionType:1903},   // 到店吃板块
// 	{name:'needHot',sectionType:2154},   // 必买爆品板块
// 	{name:'advertisement',sectionType:1906},   // 广告板块
// 	{name:'rollingAnnouncement',sectionType:26},   // 滚动公告板块
// ]

const list =[
    {name:'',sectionType:0},
    {name:'hotData',sectionType:2172},  // 必买爆款
    {name:'hotTitle',sectionType:1630},  // 必买爆款标题
    {name:'hotBg',sectionType:1370},  // 必买爆款背景
    {name:'hotTitleImg',sectionType:1326},  // 必买爆款促销头图
    {name:'hotDataList',sectionType:2173},   // 必买爆款商品
    {name:'bigSmallTheme',sectionType:2174},  // 大小主题板块
    {name:'bigSmallThemeTitle',sectionType:1630},  // 大小主题标题
    {name:'bigSmallThemeImg',sectionType:1703}, // 大小主题广告图片
    {name:'bigSmallThemeCommodity',sectionType:2175},  // 大小主题商品
    {name:'homePageAlert',sectionType:1751},    // 首页弹窗
    {name:'channelList',sectionType:1925},    // 顶部频道栏
    {name:'topImg',sectionType:25},    // 顶部轮播图
    {name:'todayPushTitle',sectionType:1630},    // 今日主推标题
    {name:'todayPushImg',sectionType:1326},    // 今日主推图片
    {name:'todayPushCommodity',sectionType:2179},    // 今日主推商品
    {name:'todayPushData',sectionType:2178},    // 今日主推商品
    {name:'todayPushBg',sectionType:1370},    // 今日主推背景
	{name:'manual',sectionType:2176},  // 手工推荐
	{name:'manualTitle',sectionType:1630},  // 手工推荐标题
	{name:'manualBg',sectionType:1370},  // 手工推荐背景
	{name:'manualTitleImg',sectionType:1326},  // 手工推荐促销头图
	{name:'manualDataList',sectionType:2177},   // 手工推荐商品
	{name:'yueXuan',sectionType:2180},   // 家家悦选
	{name:'yueXuanImg',sectionType:1703},   // 家家悦选广告图
	{name:'yueXuanData',sectionType:2181},   // 家家悦选商品
	{name:'bgTheme',sectionType:1704},   // 家家悦选商品
	{name:'fenleiqiu',sectionType:27},   // 分类球板块
	{name:'daodianchi',sectionType:1903},   // 到店吃板块
	{name:'needHot',sectionType:2172},   // 必买爆品板块
	{name:'advertisement',sectionType:1906},   // 广告板块
	{name:'rollingAnnouncement',sectionType:26},   // 滚动公告板块
    {name:'getCoupon',sectionType:1419},   // 领券中心
	{name:'coupon',sectionType:1812},   // 券
	{name:'couponCommodity',sectionType:1911},   // 券对应商品
	{name:'lifeCenter',sectionType:750},   // 生活馆
	{name:'lifeCenterInfo',sectionType:677},   // 生活馆内容
    {name:'LivingHallTitle',sectionType:1630},   // 生活馆标题
	{name:'LivingHallImg',sectionType:1326},   // 生活馆头图
	{name:'LivingHallIndexImg',sectionType:2146},   // 生活馆头图
	{name:'activityFenlei',sectionType:2198},   // 活动品类球
]


export default function filterData(name,arr,type){
    let filterType = list.filter(item=>{
        return item.name == name
    })
    if(filterType.length<1) return {}
    let finnalData=arr.filter(item=>{
        return item.sectionType == filterType[0].sectionType
    })
    if(type){
        return filterType[0].sectionType
    }else{
        return finnalData[0]
    }
}