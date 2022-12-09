let EVN_CONFIG = require('../env/index');
let WORK_TYPE = require('../env/worktype');
// const DISTRIBUTE_ENVIROMENT = __wxConfig && __wxConfig.envVersion? __wxConfig.envVersion : 'release';
const DISTRIBUTE_ENVIROMENT = WORK_TYPE.DISTRIBUTE_ENVIROMENT;

let {
	URL_PREFIX,
	URL_ZB_PREFIX,
	URL_BI_PRO,
	URL_FR_PRO,
	URL_PRIZE_PREFIX,
	URL_DATA_PREFIX
} = EVN_CONFIG[DISTRIBUTE_ENVIROMENT];

/* 浏览器的userAgent */
const userAgent = 'wxapp';

/** 当前小程序标识 */
const isBindWxCode = 2;
/* 共用Footer高度 */
const FOOTER_HEIGHT = 50;
/* 商品列表头部高度 */
const LIST_HEADER_HEIGHT = 44;

const PUBKEY =
	'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCpNE2MMr3H2uElnbRdMMxXMHemWkwf3g+JE/wE0iOAQ7+1KCqMHjz1BTeEV9dcqpRFAZIbmmZqLNeqLdYHkrjN2F8yo/3mtq4KDQ+u2sWvWUs30TNIQxdCx2yzo/M3aWuUYHc5/Qlvo/ggM2Dovhq+PYGJtw3fkDvnkev65lALnwIDAQAB';
const SUCCESS_CODE = '000000';
const OFFSHELF_CODE = '014001';

/* pricingMethod:商品计价方式(390-计数；391-计重) */
const PRICINGMETHOD_390 = 390;
const PRICINGMETHOD_391 = 391;
/* 评论的业务类型 (177:店铺,178:商铺, 179:商品 180:订单 181:评论)，目前只针对订单评论，*/
const EVALUATE_TYPE_177 = '177';
const EVALUATE_TYPE_178 = '178';
const EVALUATE_TYPE_179 = '179';
const EVALUATE_TYPE_180 = '180';
const EVALUATE_TYPE_181 = '181';
/* 商品评论好评 */
const EVALUATE_GOOD = '361';
/* 商品评论差评 */
const EVALUATE_BAD = '362';
/* 订单页没有评论 */
const EVALUATE_NO = '364';
/* 订单页已经评论 */
const EVALUATE_FINISHED = '365';

/* 设备号，在H5中，此字段为空 */
const DEVICECODE = '';
/* 终端类型(0:其他，1:安卓，2:苹果)，在H5中，此字段为空 */
const DEVICETYPE = 0;

/* 频道类型 21：启动页，22：首页，23：引导页，24：广告页, 173:搜索框, 678:发现, 1066:海购, M版-219, 1399:生活卡推荐列表； */
const CHANNELTYPE_21 = 21;
const CHANNELTYPE_22 = 22;
const CHANNELTYPE_23 = 23;
const CHANNELTYPE_24 = 24;
const CHANNELTYPE_173 = 173;
const CHANNELTYPE_678 = 678;
const CHANNELTYPE_1066 = 1066;
const CHANNELTYPE_1399 = 1399;

/*推荐版块类型25：轮播广告，26：独播版块，27：快速分类，28：精选推荐 ,174:搜索关键字*/
const SECTIONTYPE_25 = 25;
const SECTIONTYPE_26 = 26;
const SECTIONTYPE_27 = 27;
const SECTIONTYPE_28 = 28;
const SECTIONTYPE_174 = 174

/*商品的类型：62-超市；63-餐食；382-积分；383-会员；751-全国B2C；840-同城B2C；1037-全球苛选;1634-HI苛选*/
const GOODS_TYPE_MARKET = 62;
const GOODS_TYPE_FOOD = 63;
const GOODS_TYPE_MEMBER = 383;
const GOODS_TYPE_B2C = 751;
const GOODS_TYPE_CITYB2C = 840;
const GOODS_TYPE_SCORE = 382;
const GOODS_TYPE_GLOBAL = 1037;
const GOODS_TYPE_HIGLOBAL = 1634;
/* 用户来源：APP-C:30，M版:31 */
const MEMBERSOURCE_2C = 30;
const MEMBERSOURCE_M = 31;

/* 渠道来源  渠道ID：[ios-217；安卓-218；M版-219；小程序-220；线下-221] */
const CHANNERL_217 = 217;
const CHANNERL_218 = 218;
const CHANNERL_219 = 219;
const CHANNERL_220 = 220;
const CHANNERL_221 = 221;

/* 任务类型  任务类型ID：[206-完善个人信息（修改会员信息接口、修改会员头像接口）；207-每日打卡（会员签到接口）；208-订单商品评价；209-商品内容分享；210-营销内容分享；211-线上邀请好友注册] */
const TASKTYPE_206 = 206;
const TASKTYPE_207 = 207;
const TASKTYPE_208 = 208;
const TASKTYPE_209 = 209;
const TASKTYPE_210 = 210;
const TASKTYPE_211 = 211;

/* 支付方式，微信-432，支付宝-239 */
const PAYCHANEL_WX = 432;
const PAYCHANEL_ZFB = 239;
//支付方式:33-支付宝支付, 34-微信支付,496-积分兑换，497-生活卡支付，498-混合支付，499-余额支付 ,
const PAYTYPE_34 = 34;
const PAYTYPE_496 = 496;
const PAYTYPE_497 = 497;
const PAYTYPE_498 = 498;

//下单类型: 不传或传0为普通下单, 1-积分商品下单
const ORDERTYPE_0 = 0;
const ORDERTYPE_1 = 1;

/* 收藏-数据类型 商品87、店铺86、文章238、食谱728 */
const COLLECT_DATA_TYPE_236 = 236;
const COLLECT_DATA_TYPE_237 = 237;
const COLLECT_DATA_TYPE_238 = 238;
const COLLECT_DATA_TYPE_728 = 728;

/* 优惠券类型 266：满减，267：折扣，268：免费体验，269：免运费 */
const COUPONTYPE_266 = 266;
const COUPONTYPE_267 = 267;
const COUPONTYPE_268 = 268;
const COUPONTYPE_269 = 269;

/* 配送方式/用餐方式:110-送货上门, 111-自提, 112-外卖, 113-堂食 */
const SHIPPINGTYPE_110 = 110;
const SHIPPINGTYPE_111 = 111;
const SHIPPINGTYPE_112 = 112;
const SHIPPINGTYPE_113 = 113;
/* 79: '极速达',80: '闪电达' */
const DELIVERYTIME_79 = 79;
const DELIVERYTIME_80 = 80;
/* 验证码类型：1、注册;2、修改密码;3、忘记密码; */
const CODETYPE_1 = 1;
const CODETYPE_2 = 2;
const CODETYPE_3 = 3;
/* deliveryWay (integer, optional): 跨境配送类型：[1022-保税仓发货；1023-海外直邮；1024-国内发货； */
const DELIVERYWAY_1022 = 1022;
const DELIVERYWAY_1023 = 1023;
const DELIVERYWAY_1024 = 1024;

/* 支付方式 */
const PAYCHANEL_JSON = {
	34: '微信支付',
	33: '支付宝支付',
	496: '积分抵扣',
	497: '生活卡支付',
	498: '混合支付',
	499: '余额支付',
	403: 'POS支付',
	1317: '现金支付'
};
/* 配送方式或用餐方式 */
const ISPICKWAY_JSON = {
	110: "送货上门",
	111: "自提",
	112: "外卖",
	113: "堂食"
};

/* 是否送货上门 */
const ISEXPRESSTOHOME_JSON = {
	0: '到店自提',
	1: '送货上门'
};

/* 配送时效 */
const DISTRIBUTIONFLAG_JSON = {
	362: '一小时送达',
	363: '三到五小时送达',
	364: '三到五天送达',
	365: '五天以上送达'
};

/* 配送的时间范围 */
const DELIVERYTIME_JSON = {
	79: '极速达',
	80: '闪电达'
};

/* 售卖方式 */
const SELLWAY_JSON = {
	60: '自营',
	61: '联营'
};

/* 商品储藏条件 */
const STORAGECONDITION_JSON = {
	126: '常温',
	127: '冷冻',
	128: '冷藏'
};
/* 退款状态 */
const RETURNSTATUS_JSON = {
	441: "待审核",
	442: "退款中",
	443: "已退款",
	170: "审核不通过"
};
/* 订单状态 */
const ORDERSTATE_JSON = {
	53: '已支付',
	51: '待付款',
	41: '待配送',
	42: '配送中',
	44: '待自提',
	45: '待取餐',
	46: '已完成',
	47: '交易关闭',
	48: '订单取消',
	49: '订单关闭',
	115: '订单取消', //买家取消
	116: '订单取消', //卖家取消
	439: '已拒收', //已拒收
	952: '已售后', //已售后
	1: '待上传身份证',
	2: '待审核', //待验证身份证
	3: '审核不通过', //身份证验证不通过
	4: '组团中', //组团中
	1088: '已送达' //已送达
};
/* 订单状态 */
const ORDERSTATE_GLOBAL_JSON = {
	53: '已支付',
	51: '待付款',
	41: '待发货',
	42: '已发货',
	44: '待自提',
	45: '待取餐',
	46: '已完成',
	47: '订单关闭',
	48: '已取消',
	49: '订单关闭',
	115: '已取消', //买家取消
	116: '已取消', //卖家取消
	439: '已拒收', //已拒收
	952: '已售后', //已售后
	1: '待上传身份证',
	2: '待审核', //待验证身份证
	3: '审核不通过', //身份证验证不通过
	4: '组团中', //组团中
	1088: '已送达' //已送达
};

/*发票类型*/
const INVOICETYPE_JSON = {
	0: "不开发票",
	1: "纸质发票-个人",
	2: "纸质发票-公司",
	3: "电子发票-个人",
	4: "电子发票-公司",
	5: "补开发票",
	6: "发票已作废"
};
/* 订单类型 */
const ORDERTYPE_JSON = {
	55: '餐食订单',
	56: '商品订单'
};

/* 订单支付状态 */
const ORDER_PAY_STATE_JSON = {
	51: '待支付',
	52: '支付中',
	53: '已支付'
};

/* 配送员 */
const DELIVERY_JSON = {
	618: '自配送',
	619: '物流配送'
};
/* 消息类型：200、交易信息(订单)；201、物流助手；202、促销活动；203、通知消息 */
const MSGTYPE_200 = 200;
const MSGTYPE_201 = 201;
const MSGTYPE_202 = 202;
const MSGTYPE_203 = 203;
const MSGTYPE = {
	200: '交易信息',
	201: '物流助手',
	202: '促销活动',
	203: '知消息'
};
/*售后原因,*/
const APPLICATIONREASON_ALL = {
	1232: "重复下单/误下单",
	1233: "其他渠道价格更低",
	1234: "该产品降价了",
	1235: "不想买了",
	1236: "其他原因",
	1231: "操作有误(商品，地址等选错)",
	1230: "订单不能按预计时间发送",
	1125: "7天无理由",
	1126: "商家发错货",
	1127: "商品漏发/错发",
	1128: "商品质量问题",
	1129: "包装商品破损",
	566: "客户拒收",
	560: "取消订单",
	568: "其他",
	1130: "缺货出",
	1131: "仓内丢失",
	1295: "买卖家协商一致",
	1296: "快递一直未到",
	1297: "包裹少件 / 破损 / 空包",
	1298: "颜色 / 款式 / 图案 / 尺码等描述不符",
	1299: "发错货",
	1300: "其他",
	1343: "商品过期",
	1344: "商品变质",
	1345: "商品不新鲜",
	1346: "餐食有异物",
	1347: "超时未送达",
	1348: "配送员服务问题",
	1349: "不想要了",
	1374: "机器故障",
	1373: "库存不足",
	1372: "超时未出酒",
	1469: "收货信息填写错误",
	1468: "配送时间选错",
	1544: "整单缺",
	1545: "操作错误",
	1546: "服务不满意",
	564: "选错商品"
};
/*退回方式*/
const ISNEEDPICKUP_JSON = {
	1137: "物流发货",
	1136: "送货至门店",
	1191: "退款不退货",
	1188: "异常批次订单",
	1167: "客户未签收货物",
};
const LOGISTICS_STATUS = {
	100000: "待揽件",
	100001: "揽件成功",
	100002: "揽件失败",
	100003: "分配业务员",
	200001: "更新运输轨迹",
	300002: "开始派送",
	300003: "签收成功",
	300004: "签收失败",
	400001: "订单取消",
	400002: "订单滞留"

}
const MSG_COMMON_ERROR = '亲，网络不给力吧～';
const MSG_POSITION_ERROR = '您在火星上？定位失败，请重新定位吧～';
const MSG_NO_SERVICE = '周边暂无服务，我们正在使出洪荒之力为您准备中～';
const MSG_NO_GOODS = '好东西都被大饿魔吃完了～';
const MSG_NO_SHOPLIST = '周边暂无店铺，我们正在使出洪荒之力为您准备中～';
const MSG_NO_ORDERS = '暂无订单，寻找好东西下单吧～';
const MSG_NO_STOCKS = '库存不足，先买这么多吧~';
const MSG_LOADING_ERROR = '加载失败，请稍后再试~';
const MSG_SOFAR_ERROR = '你我之间的距离，超出了我的配送能力哦~';
const MSG_SELECT_SERVICE = '请选择服务时段，当天无可选时段时，可选下一天';
const MSG_SHARE_TITLE = '';
const MSG_YTJ_CJ = '登录成功！请在店内终端机前点击“开始抽奖”按钮';
const MSG_YTJ_YHJ = '优惠券，领取成功！';
const MSG_TASK_FINISH = '任务已完成～';
const MSH_INTEGRAL_NO_SERVICE = '积分商品不支持配送~';
const ORDERLOGISTICSSTATUS_JSON = {
	0: '暂无',
	1: '国际在途',
	2: '国际签收',
	3: '国内在途',
	4: '国内签收'
};

/** 
 * 订阅消息
 * 'aebKNSv6umweshxm2qRhqU1dliJOfmrQ13HjxEtO4nM', // 拼团成功通知
 * 'FmU5rhQyin8_Il7lrCN39SWWU_WTJfiaRM8REOaqfpI', // 退款通知
 * 'za4XE81NSl0k72Ru4nFh5l6lOPIGDSbdn9ezwBemZdA' // 提货通知
 * // 取餐
 */
const MSG_SUBSCRIBEMESSAGE_GROUP = 'aebKNSv6umweshxm2qRhqU1dliJOfmrQ13HjxEtO4nM';
const MSG_SUBSCRIBEMESSAGE_REFUND = 'FmU5rhQyin8_Il7lrCN39SWWU_WTJfiaRM8REOaqfpI';
const MSG_SUBSCRIBEMESSAGE_TPND = 'za4XE81NSl0k72Ru4nFh5l6lOPIGDSbdn9ezwBemZdA';
const MSG_SUBSCRIBEMESSAGE_PREFER = '';

/****************接口地址start****************/
/* 定位获取附近的商店 */
const URL_LOCATION_SHOPQUERYBYLOCATION = `${URL_PREFIX}/location/shopquerybylocation`;
/* 附近获取不到店铺时, 首页用来获取 "默认 banner + 店铺列表" 的接口 */
const URL_LOCATION_SHOPDEFAULTBYLOCATION = `${URL_PREFIX}/location/shopdefaultbylocation`;
/* 根据版块信息获取推荐数据 */
const URL_RECOMMEND_LIST = `${URL_PREFIX}/recommend/list`;
/**裂变分享弹幕*/
const URL_RECOMMEND_RECOMMENDLATELYINFO = `${URL_PREFIX}/recommend/recommendLatelyInfo`;
/* 根据版块信息分页获取推荐数据 */
const URL_RECOMMEND_LISTBYPAGE = `${URL_PREFIX}/recommend/listByPage`;
/* POST  获取初始化需要表单数据 */
const URL_MEMBER_INIT = `${URL_PREFIX}/member/init`;
/* 用户注册 */
const URL_MEMBER_REGISTER = `${URL_PREFIX}/member/register`;
/* 用户登录 */
const URL_MEMBER_LOGIN = `${URL_ZB_PREFIX}/member/login`;
/* 快捷登录 */
const URL_MEMBER_FASTLOGIN = `${URL_ZB_PREFIX}/member/fastlogin`;
/* 忘记密码 */
const URL_MEMBER_FORGET = `${URL_PREFIX}/member/forget`;
/* 修改密码 */
const URL_MEMBER_MODIFY_PWD = `${URL_PREFIX}/member/modify/pwd`;
/* 用户登出 */
const URL_MEMBER_LOGOUT = `${URL_ZB_PREFIX}/member/logout`;
/* 获取短信验证码 */
const URL_MEMBER_SEND_DENTIFYCODE = `${URL_ZB_PREFIX}/member/send/dentifycode`;
/* 修改个人信息 */
const URL_MEMBER_MODIFY_INFO = `${URL_PREFIX}/member/modify/info`;
/* 修改个人头像 */
const URL_MEMBER_MODIFY_PHOTO = `${URL_PREFIX}/member/modify/photo`;
/* 分享 */
const URL_MEMBER_SHARE = `${URL_PREFIX}/member/share`;
/* 获取会员信息及积分、生活卡余额、优惠券数量接口 */
const URL_MEMBER_GETMEMBERSCOREVALUECARDCOUPONTOTAL = `${URL_PREFIX}/member/getMemberScoreValueCardCouponTotal`;
/* 订单详情 */
const URL_ORDER_DETAIL = `${URL_PREFIX}/order/detail`;
/* 取消订单 */
const URL_ORDER_CANCEL = `${URL_PREFIX}/order/cancel`;
/* 确认收货-非自提 */
const URL_ORDER_RECEIVED = `${URL_PREFIX}/order/received`;
/* 确认收货-自提 */
const URL_ORDER_PICKUP = `${URL_PREFIX}/order/pickup`;
/* 订单详情再来一单 */
const URL_ORDER_REBUY = `${URL_PREFIX}/order/rebuy`;
/* 订单列表页面 */
const URL_ORDER_LIST = `${URL_PREFIX}/order/list`;
/* 下单 */
const URL_ORDER_CREATE = `${URL_PREFIX}/order/create`;
/* 虚拟商品(电子生活卡)下单 */
const URL_ORDER_CREATESPECIAL = `${URL_PREFIX}/order/createSpecial`;
/* 新增变更O2O拼团下单 */
const URL_ORDER_CREATEGROUPBUYINGO2O = `${URL_PREFIX}/order/createGroupBuyingO2O`;
/* order/topay 收银台确认支付*/
const URL_ORDER_TOPAY = `${URL_PREFIX}/order/topay`;
/* 收付款码 */
const URL_ORDER_OPENOFFLINEPAY = `${URL_PREFIX}/order/openOfflinePayView`;
/*  全球购下单[左永宾] */
const URL_ORDER_CREATEGLOBAL = `${URL_PREFIX}/order/createglobal`;
/* 苛选下单[杨波]*/
var URL_ZB_ORDER_CREATEHARSHSELECT = URL_ZB_PREFIX + '/order/createHarshSelect';
/* 积分兑换记录列表 */
const URL_ORDER_SCORERECORDLIST = `${URL_PREFIX}/order/scorerecordlist`;
/* 获取会员信息及积分、生活卡余额接口 */
const URL_MEMBER_GETMEMBERSCOREVALUECARD = `${URL_PREFIX}/member/getMemberScoreValueCard`;
/* 扫码 将订单与用户绑定*/
const URL_ORDER_SCANCODEORDERBINDMEMBER = `${URL_PREFIX}/order/scanCodeOrderBindMember`;

/* 再次支付 */
const URL_ORDER_PAYAGAIN = `${URL_PREFIX}/order/payagain`;

/* 商品详情页面 */
const URL_GOODS_GOODSDETAILT = `${URL_PREFIX}/goods/goodsDetail`;

/* 查询地址信息列表 */
const URL_ADDRESS_LIST = `${URL_PREFIX}/address/list`;
/* 设置默认地址 */
const URL_ADDRESS_DEFAULT = `${URL_PREFIX}/address/editisdefault`;
/* 新增或编辑地址 */
const URL_ADDRESS_EDIT = `${URL_PREFIX}/address/addoredit`;
/* 删除地址 */
const URL_ADDRESS_DELETE = `${URL_PREFIX}/address/delete`;
/* 查询地址信息 */
const URL_ADDRESS_QUERY = `${URL_PREFIX}/address/query`;
/* 根据用户的配送订单情况查询地址信息列表，最多显示3条 */
const URL_ADDRESS_LISTBYORDER = `${URL_PREFIX}/address/listByOrder`;
/* 根据定位查询地址信息列表 */
const URL_ADDRESS_LISTBYLOCATION = `${URL_PREFIX}/address/listbylocation`;
/* 清关证件列表 */
const URL_ADDRESS_CUSTOMSDOCLIST = `${URL_PREFIX}/address/customsDocList`;
/* 删除清关证件 */
const URL_ADDRESS_DELETECUSTOMSDOS = `${URL_PREFIX}/address/deleteCustomsDoc`;
/* 清关证件详情 */
const URL_ADDRESS_CUSTOMSDOC = `${URL_PREFIX}/address/customsDoc`;
/* 保存带图片的清关证件信息 */
const URL_ADDRESS_SAVECUSTOMSDOC = `${URL_PREFIX}/address/saveCustomsDoc`;
/* 通过姓名和身份证号添加清关证件 */
const URL_ADDRESS_SAVEADDRESSTOCUSTOMSDOC = `${URL_PREFIX}/address/saveAddressToCustomsDoc`;
/* 保存清关证件【胡子鹏】新实现 */
const URL_ADDRESS_SAVECUSTOMSDOCNEW = `${URL_PREFIX}/address/saveCustomsDocNew`;
/* 上传清关证件图片【胡子鹏】 */
const URL_ADDRESS_UPLOADCUSTOMSDOCIMAGE = `${URL_PREFIX}/address/uploadCustomsDocImage`;

/* 熟食查询 */
const URL_STORE_STORELISTFOOD = `${URL_PREFIX}/store/storeListFood`;
/* 商品查询 */
const URL_GOODS_GOODSLIST = `${URL_PREFIX}/goods/goodsList`;
/* 食品商铺内查询 */
const URL_STORE_FOODLISTBYSTORE = `${URL_PREFIX}/store/foodListByStore`;
/* 商铺详情 */
const URL_STORE_GETSTOREDETAIL = `${URL_PREFIX}/store/getStoreDetail`;
/* 分类首页列表 */
const URL_CATEGORY_LIST = `${URL_PREFIX}/category/list`;
/* 根据名称查询对应商品数据 */
const URL_GOODS_NAMESEARCH = `${URL_PREFIX}/goods/nameSearch`;

/**
 *评价
 * /
 /* 商品评价 */
const URL_COMMENT_LIST = `${URL_PREFIX}/comment/list`;
/* 添加评论获取评论内容的列表 */
const URL_COMMENT_TOCOMMENT = `${URL_PREFIX}/comment/tocomment`;
/* 我的评论 */
const URL_COMMENT_MYCOMMENT = `${URL_PREFIX}/comment/mycomment`;
/* 发布评论 */
const URL_COMMENT_SAVE = `${URL_PREFIX}/comment/save`;
/* 批量上传评论图片 */
const URL_COMMENT_UPLOADCOMMENTIMAGES = `${URL_PREFIX}/comment/uploadcommentimages`;

/**
 * 家家悦优鲜会员
 */
/* 获取会员全部信息接口 */
const URL_MEMBER_GETMEMBERALLINFO = `${URL_ZB_PREFIX}/member/getmemberallinfo`;
/* 获取会员基本信息统一接口 */
const URL_MEMBER_GETMEMBERINFO = `${URL_PREFIX}/member/getmemberinfo`;
/* 会员等级接口列表 */
const URL_MEMBER_MEMBERLEVELLIST = `${URL_PREFIX}/member/getmemberlevellist`;
/* 会员权益列表*/
const URL_MEMBER_MEMBERREQUITYLIST = `${URL_PREFIX}/member/getmemberequitylist`;
/* 获取会员成长值明细列表 */
const URL_MEMBER_GETMEMBERGROWTHVALUELIST = `${URL_PREFIX}/member/getmembergrowthvaluelist`;
/* 获取会员积分明细列表 */
const URL_MEMBER_MEMBERSCORELIST = `${URL_PREFIX}/member/getmemberscorelist`;
/* 获取会员当前等级任务列表 */
const URL_MEMBER_MEMBERTASKLIST = `${URL_PREFIX}/member/getmembertasklist`;
/* 获取权益详细信息 */
const URL_MEMBER_MEMBEREQUITYINFOLIST = `${URL_PREFIX}/member/getmemberequityinfo`;
/* 会员签到 */
const URL_MEMBER_SETMEMBERSIGN = `${URL_PREFIX}/member/setmembersign`;
/* 获取权益详细信息 */
const URL_MEMBER_GETMEMBEREQUITYINFO = `${URL_PREFIX}/member/getmemberequityinfo`;
/* 积分商城商品列表数据 */
const URL_MEMBER_GETMEMBERINTEGRALGOODSLIST = `${URL_PREFIX}/member/integralGoodsList`;
/* 会员商城商品列表数据 */
const URL_MEMBER_GETMEMBERINTEGRGOODSLIST = `${URL_PREFIX}/member/memberGoodsList`;
/* 会员专属码生成 */
const URL_MEMBER_CREATEEXCLUSIVECODE = `${URL_PREFIX}/member/createexclusivecode`;
/* 会员专属码验证 */
const URL_MEMBER_CHECKEXCLUSIVECODE = `${URL_PREFIX}/member/checkexclusivecode`;
/* 修改会员头像 */
const URL_MEMBER_GETMEMBERMODIFYPHOTO = `${URL_PREFIX}/member/modify/photo`;
/* 查询生活卡购卡列表 */
const URL_GOODS_QUERYSTOREDVALUECARD = `${URL_PREFIX}/goods/queryStoredValueCard`;
/* 获取我余额明细接口 */
const URL_MEMBER_GETMYBALANCELOG = `${URL_PREFIX}/member/getmybalancelog`;
/* 生活卡(实体卡)绑定 */
const URL_MEMBER_BINDVALUECARD = `${URL_PREFIX}/member/bindvaluecard`;
/* 获取我的生活卡(我的卡包)接口 */
const URL_MEMBER_GETMYCARDPACK = `${URL_PREFIX}/member/getmycardpack`;
/* 获取我的历史卡包接口(我的卡包)接口 */
const URL_MEMBER_GETMYHISTORYCARDPACK = `${URL_PREFIX}/member/getmyhistorycardpack`;
/* 获取生活卡编号对应的消费明细信息 */
const URL_MEMBER_GETMYVALUECARDCONSUMELOG = `${URL_PREFIX}/member/getmyvaluecardconsumelog`;
/* 会员商城等级商品列表数据 */
const URL_MEMBER_MEMBERLEVELGOODSLIST = `${URL_PREFIX}/member/memberLevelGoodsList`;

/**
 * 优惠券模块
 */
/* 绑定优惠券 */
const URL_COUPON_BIND = `${URL_PREFIX}/coupon/bind`;
/** 绑定第三方密码券号优惠券 */
const URL_COUPON_BIND_THIRDCOUPON = `${URL_PREFIX}/coupon/bindThirdCoupon`
/* 领取优惠券 */
const URL_COUPON_DRAW = `${URL_PREFIX}/coupon/draw`;
/* 领取优惠券 裂变 */
const URL_COUPON_DRAW_AND_SHARE = `${URL_PREFIX}/coupon/drawAndShare`;
/**  口令领取优惠券[瞿博]*/
const URL_COUPON_DRAW_PASSWDCOUPON = `${URL_PREFIX}/coupon/drawPasswdCoupon`;
/* 查询是否已领取优惠券 */
const URL_COUPON_ISDRAWN = `${URL_PREFIX}/coupon/isDrawn`;
/* 查询我的优惠券 */
const URL_COUPON_MYLIST = `${URL_PREFIX}/coupon/myList`;
/* 查询订单可用优惠券 */
const URL_COUPON_USABLELIST = `${URL_PREFIX}/coupon/usableList`;
/* 查看优惠券详情 */
const URL_COUPON_COUPONDETAIL = `${URL_PREFIX}/coupon/couponDetail`;
/* 查看优惠券详情V2*/
const URL_COUPON_QUERYCOUPONDETAIL = `${URL_PREFIX}/coupon/queryCouponDetail`;
/* 根据优惠券信息查询商品列表 */
const URL_COUPON_GOODSLISTBYCOUPON = `${URL_PREFIX}/goods/goodsListByCoupon`;

/**
 * 收藏模块
 */
//取消收藏
const URL_COLLECT_CANCEL = `${URL_PREFIX}/collect/cancel`;
//收藏
const URL_COLLECT_COLLECT = `${URL_PREFIX}/collect/collect`;
//商品收藏列表
const URL_COLLECT_GOODSLIST = `${URL_PREFIX}/collect/goodsList`;
//文章收藏列表
const URL_COLLECT_ARTICLELIST = `${URL_PREFIX}/collect/articleList`;
//食谱收藏列表
const URL_COLLECT_RECIOELIST = `${URL_PREFIX}/collect/cookBookList`;
//店铺收藏列表
const URL_COLLECT_STORELIST = `${URL_PREFIX}/collect/storeList`;

/*
 * 我的关注
 */
//关注列表
const URL_GET_ATTENTION_LIST = `${URL_PREFIX}/attention/getFoodieList`;
/*
 * 渠道模块
 */
// 获取渠道模块数据
const URL_CHANNEL_FINDCHANNELSHOPLIST = `${URL_PREFIX}/channel/findChannelShopList`;
/**
 * 消息模块
 */
/* 消息列表 */
const URL_NEWS_MESSAGELIST2C = `${URL_PREFIX}/news/messagelist2c`;
/* 消息列表统计数据 */
const URL_NEWS_MESSAGESTAT2C = `${URL_PREFIX}/news/messagestat2c`;
/* 阅读发送的消息 */
const URL_NEWS_READMESSAGE = `${URL_PREFIX}/news/readAllNews`;
/* 上传小程序表单的fromId */
const URL_NEWS_UPLOADXCXFROMID = `${URL_PREFIX}/news/uploadXcxFromId`;


/**
 * 购物车模块 : 购物车商品校验及订单金额计算
 */
/* 获取分店地址及当前距离 */
const URL_CART_GETSHOPADDRESS = `${URL_PREFIX}/cart/getShopAddress`;
/* 下单确认页；计算优惠券 */
const URL_CART_GOODSCOUPONVALID = `${URL_PREFIX}/cart/goodsCouponValid`;
/* 商品校验；订单金额计算 */
const URL_CART_GOODSVALID = `${URL_PREFIX}/cart/goodsValid`;
/** 自提点刷本地存储数据 */
const URL_CART_GOODSVALIDCOMMUNITY = `${URL_PREFIX}/cart/goodsValidCommunity`;
/* 跨境下单确认页*/
var URL_CART_ORDERCONFIRM = `${URL_PREFIX}/cart/orderConfirm`;
/* 积分下单； 获取配送时间和自提时间 */
const URL_CART_INTEGRALOREDERTIME = `${URL_PREFIX}/cart/integralOrderTime`;
/* 去凑单商品列表 */
const URL_GOODS_QUERYADDONITEMGOODSLIST = `${URL_PREFIX}/goods/queryAddOnItemGoodsList`;
/* 猜你喜欢 */
const URL_CART_USUALLYBUYLIST = `${URL_PREFIX}/cart/usuallyBuyList`;

/**
 * 发现模块
 */
/* 点赞类型  753-内容评论  754-内容评论回复*/
const NICE_TYPE_COMMENT = 753;
const NICE_TYPE_REPLY = 754;

/* 发现首页 - 获取首页推荐的板块数据 */
const URL_DISCOVERY_RECOMMEND_LIST = `${URL_PREFIX}/recommend/list`;

/* 食谱首页 - 获取食谱分类列表 */
const URL_DISCOVERY_RECIPE_GET_COOKBOOK_CATEGORY_LIST = `${URL_PREFIX}/content/getCookbookCategoryList`;
const URL_DISCOVERY_RECIPE_GET_COOKBOOK_LIST = `${URL_PREFIX}/content/getCookbookList`;

/* 食谱详情页 - 获取食谱详情 */
const URL_DISCOVERY_RECIPE_GET_COOKBOOK = `${URL_PREFIX}/content/getCookbook`;
const URL_DISCOVERY_RECIPE_GET_WORKS_LIST = `${URL_PREFIX}/content/getWorksList`;

/* 知食家首页 - 获取食谱分类列表 */
const URL_DISCOVERY_GET_PROFESSOR_LIST = `${URL_PREFIX}/content/getFoodieList`;
const URL_DISCOVERY_GET_ARTICLE_LIST = `${URL_PREFIX}/content/getArticleList`;

/* 知食家主页 - 获取知食家详情 */
const URL_DISCOVERY_GET_PROFESSOR_DETAIL = `${URL_PREFIX}/content/getFoodie`;

/* 文章详情页 - 获取文章详情 */
const URL_DISCOVERY_GET_ARTICLE = `${URL_PREFIX}/content/getArticle`;
/* 文章详情页 - 关注 */
const URL_DISCOVERY_FOLLOW = `${URL_PREFIX}/attention/attention`;
/* 文章详情页 - 取消关注 */
const URL_DISCOVERY_UNFOLLOW = `${URL_PREFIX}/attention/cancel`;
/* 文章详情页 - 收藏 */
const URL_DISCOVERY_COLLECT = `${URL_PREFIX}/collect/collect`;
/* 文章详情页 - 取消收藏 */
const URL_DISCOVERY_CANCEL_COLLECT = `${URL_PREFIX}/collect/cancel`;

/* 文章详情页 - 发表评论 */
const URL_DISCOVERY_POST_COMMENT = `${URL_PREFIX}/comment/contentComment`;
/* 文章详情页 - 获取评论列表 */
const URL_DISCOVERY_GET_CONTENT_COMMENT_LIST = `${URL_PREFIX}/comment/contentCommentList`;
/* 文章详情页 - 点赞 */
const URL_DISCOVERY_NICE = `${URL_PREFIX}/attention/nice`;
/* 文章详情页 - 取消点赞 */
const URL_DISCOVERY_CANCEL_NICE = `${URL_PREFIX}/attention/cancelNice`;

/* 文章详情页 - 获取文章详情中闪购的相关商品 */
const URL_DISCOVERY_GET_CONTENT_GOODS_LIST = `${URL_PREFIX}/content/getContentGoodsList`;

/* 订阅首页 - 检查是否有订阅*/
const URL_CHECK_IS_COLLECT = `${URL_PREFIX}/content/getIsCollect`;

/* 订阅 - 获取已订阅列表 */
const URL_GET_COLUMN_CONTENT_LIST = `${URL_PREFIX}/content/getColumnContentList`;

/* 订阅 - 获取全部栏目列表 */
const URL_GET_ALLCOLUMN_CONTENT_LIST = `${URL_PREFIX}/content/getColumnList`;

/* 栏目详情页  通过id获取栏目详情 */
const URL_GET_COLUMN_DETAIL_BY_ID = `${URL_PREFIX}/content/getColumnById`;

/* 用户上传作品详情页 - 获取指定用户作品详情 */
const URL_DISCOVERY_GET_WORK_DETAIL = `${URL_PREFIX}/content/getWorks`;

/*订单逆向的接口*/
/* 取消售后退款信息 */
const URL_CUSTOMERSERVICE_CANCEL = `${URL_PREFIX}/customerService/cancel`;

/* 获取售后详情信息 */
const URL_CUSTOMERSERVICE_DETAILS = `${URL_PREFIX}/customerService/details`;

/* 发起售后退款信息*/
const URL_CUSTOMERSERVICE_SAVE = `${URL_PREFIX}/customerService/save`;

/* 售后列表信息接口 */
const URL_CUSTOMERSERVICE_LIST = `${URL_PREFIX}/customerService/list`;

/* 获得售后有效时间接口 */
const URL_CUSTOMERSERVICE_GETEFFECTIVETIME = `${URL_PREFIX}/customerService/getEffectiveTime`;

/* 订单sku及关联的促销商品集合 */
const URL_ORDER_PROMOTIONGOODS = `${URL_PREFIX}/order/promotiongoods`;

/*上传售后图片*/
const URL_CUSTOMERSERVICE_UPLOAD = `${URL_PREFIX}/customerService/upload`;

/*苛选上传售后图片*/
const URL_OVERSEASCUSTOMERSERVICE_UPLOAD = `${URL_PREFIX}/overseasCustomerService/upload`;

/* 获取售后申请原因*/
const URL_CUSTOMERSERVICE_GETAFTERSALEREASON = `${URL_PREFIX}/customerService/getAfterSaleReason`;

/* 苛选取消订单*/
const URL_OVERSEASCUSTOMERSERVICE_CANCELORDER = `${URL_PREFIX}/overseasCustomerService/cancelOrder`;

/* 苛选售后申请原因*/
const URL_OVERSEASCUSTOMERSERVICE_GETAFTERSALEREASON = `${URL_PREFIX}/overseasCustomerService/getAfterSaleReason`;

/* 苛选售后取消订单申请原因*/
const URL_OVERSEASCUSTOMERSERVICE_GETCANCELREASON = `${URL_PREFIX}/overseasCustomerService/getCancelReason`;

/* 苛选售后取消订单申请原因*/
const URL_OVERSEASCUSTOMERSERVICE_CANCEL = `${URL_PREFIX}/overseasCustomerService/cancel`;

/* 发起售后退款信息*/
const URL_OVERSEASCUSTOMERSERVICE_SAVE = `${URL_PREFIX}/overseasCustomerService/save`;

/* 团长拒收*/
const URL_CUSTOMERSERVICE_GROUPMEMBERREJECTED = `${URL_PREFIX}/customerService/groupMemberRejected`;

/* 自提点售后收货 */
const URL_CUSTOMERSERVICE_SELFPOINTRECEIPT = `${URL_PREFIX}/customerService/selfPointReceipt`;

/*订单详情海购延时收货*/
const URL_ORDER_DEPLAYRECEIVE = `${URL_PREFIX}/order/deplayReceive`;
/* 订单列表赠送优惠券弹窗 */
const URL_COUPON_QUERYCOUPONLISTBYORDERID = `${URL_PREFIX}/coupon/queryCouponListByOrderId`;
//我的订单-点击【抢红包】按钮，当前页面蒙层显示【红包】弹窗 [瞿博]
const URL_GRABREDPACKAGE_ORDERDRAWDIALOG = `${URL_PREFIX}/grabRedPackage/orderDrawDialog`;


/** 小程序用户信息绑定【梁少斌】*/
const URL_WX_SAVEWEIXINXCXUSERINFO = `${URL_ZB_PREFIX}/wx/saveWeixinXcxUserInfo`;

/** 小程序获取分享数据 梁少斌 */
const URL_WX_SHARESHORTLINKGB = `${URL_ZB_PREFIX}/invite/shareShortLinkGb`;
/** 小程序解析数据 梁少斌 */
const URL_WX_XCXLINKPARAMS = `${URL_ZB_PREFIX}/invite/xcxLinkParams`;
/** 小程序购卡解析数据 梁少斌 */
const URL_WX_XCXLINKPARAMSFORCARD = `${URL_ZB_PREFIX}/invite/xcxLinkParamsForCard`;
/* 小程序使用code码登录 */
const URL_MEMBER_XCXLOGIN = `${URL_ZB_PREFIX}/member/xcxLogin`;

/** 分享领红包 抽奖 瞿博 */
const URL_WX_DRAWREDPACKETS = `${URL_PREFIX}/grabRedPackage/drawRedPackets`;


/*校验用户是否存在核验单[左永宾]*/
const URL_ORDER_VERIFICATIONORDER = `${URL_PREFIX}/order/verificationOrder`;
/*[新增接口]闪电付购物车[李金辉]*/
const URL_CART_V2_LIGHTINGPAY = `${URL_PREFIX}/cart/v2/lightingPay`;
/* 闪电付下单确认 */
const URL_CART_LIGHTINGPAYCONFIRM = `${URL_PREFIX}/cart/lightingPayConfirm`;
/*[新增接口]扫码[李金辉]*/
const URL_GOODS_QUERYSCANCODE_V3 = `${URL_PREFIX}/goods/queryScanCode/v3`;



/** 拼团 */
/** 海购拼团列表 瞿博 */
const URL_GROUPBUYLIST = `${URL_PREFIX}/promotion/groupBuyList`;

/** o2o拼团列表 瞿博 */
const URL_OTOGROUPBUYLIST = `${URL_PREFIX}/promotion/otoGroupBuyList`;


/** 拼团成交人列表 牛超 */
const URL_GROUPBUYLATELYINFO = `${URL_PREFIX}/promotion/groupBuyLatelyInfo`;

/** 验证是否可开团、参团 瞿博 */
const URL_OTOVALIDATEJOINGROUPBUY = `${URL_PREFIX}/promotion/otoValidateJoinGroupBuy`;

/** o2o拼团详情 瞿博 */
const URL_OTOGROUPBUYDETAIL = `${URL_PREFIX}/promotion/otoGroupBuyDetail`;

/** o2o拼团详情 瞿博 */
const URL_OTOGROUPBUYDETAILWXSHARE = `${URL_PREFIX}/promotion/otoGroupBuyDetailWXShare`;

/** 海购拼团详情 瞿博 */
const URL_GROUPBUYDETAIL = `${URL_PREFIX}/promotion/groupBuyDetail`;
/* 2018-8-16新增变更订单数量查询[胡子鹏]*/
/** 拼团详情 瞿博 */
const URL_ORDER_ORDERCOUNT = `${URL_PREFIX}/order/orderCount`;

/**
 * 发票
 */
/** 查询最新的发票抬头信息 */
const URL_INVOICE_QUERYINVOICE = `${URL_PREFIX}/invoice/queryInvoice`;
/** 通过类型获取开票内容列表 */
const URL_INVOICE_QUERYINVOICECONTENTLIST = `${URL_PREFIX}/invoice/queryInvoiceContentList`;
/** 查询发票抬头信息 */
const URL_INVOICE_QUERYINVOICELIST = `${URL_PREFIX}/invoice/queryInvoiceList`;
/** 保存发票发送邮箱并发送邮件 */
const URL_INVOICE_SAVEINVOICEEMAIL = `${URL_PREFIX}/invoice/saveInvoiceEmail`;
/** 补开发票 */
const URL_INVOICE_SAVEINVOICEINFO = `${URL_PREFIX}/invoice/saveInvoiceInfo`;

/**
 * 小程序生活卡相关(已购生活卡列表, 分享生活卡)
 */
/* 获取生活卡购卡记录 */
var URL_VALUECARD_GETORDERVALUECARDPAGELIST = URL_PREFIX + '/valueCard/getOrderValueCardPageList';

/* 自己绑定生活卡 */
var URL_VALUECARD_BINDVALUECARDFROMBUY = URL_PREFIX + '/valueCard/bindValueCardFromBuy';

/* 分享自行绑定生活卡 */
var URL_VALUECARD_BINDVALUECARDFROMSHARE = URL_PREFIX + '/valueCard/bindValueCardFromShare';

/* 获取生活卡总金额、数量及推荐的生活卡版块及商品列表 */
var URL_VALUECARD_GETCARDLISTBYRECOMMEND = URL_PREFIX + '/valueCard/getCardListByRecommend';

/* 获取生活卡分享数据: 生活卡卡号、面额、卡口令、背景图、小程序跳转路径 */
var URL_VALUECARD_GETVALUECARDSHARE = URL_PREFIX + '/valueCard/getValueCardShare';



/* 发起售后保存填写物流信息*/
const URL_OVERSEASCUSTOMERSERVICE_SAVERETURNLOGISTICSINFO =
	`${URL_PREFIX}/overseasCustomerService/saveReturnLogisticsInfo`;

/*获取可售后最大数量*/
const URL_CUSTOMERSERVICE_GETSKUAFTERSALECOUNT = `${URL_PREFIX}/customerService/getSkuAfterSaleCount`;
/* 发起售后获取物流公司信息列表*/
const URL_OVERSEASCUSTOMERSERVICE_GETLOGISTICSCOMPANY = `${URL_PREFIX}/overseasCustomerService/getLogisticsCompany`;
/*获取集单前取消订单售后申请原因【刘杭*/
const URL_CUSTOMERSERVICE_GETCANCELORDERAFTERSALEREASON = `${URL_PREFIX}/customerService/getCancelOrderAfterSaleReason`;
/*O2O售后取消订单（申请售后 apply_for_refund）售后接口支付后集单前*/
const URL_CUSTOMERSERVICE_CANCELORDER = `${URL_PREFIX}/customerService/cancelOrder`;
/* 订单评价,获取我对该订单评价 */
const URL_COMMENT_ORDERCOMMENT = `${URL_PREFIX}/comment/ordercomment`;

/*多仓物流信息列表--查询不同发货地区商品物流信息*/
var URL_ORDER_QUERYREGIONLOGISTICSV2 = URL_PREFIX + '/order/queryregionlogisticsV2';
/* 查看物流 */
var URL_ORDER_QUERYLOGISTICSV2 = URL_PREFIX + '/order/querylogisticsV2';
/* 团长分查询门店 */
const URL_PROMOTIONCOLONEL_QUERYSHOPINFOBYSHOPID = URL_PREFIX + '/promotionColonel/queryShopInfoByShopId';
/****************接口地址end*****************/

/*********************** 社区业态 团长模块 ************************ */
// 直播页面接口
/* 根据名称查询对应商品数据 */
const URL_ZB_GOODS_NAMESEARCH = `${URL_ZB_PREFIX}/goods/nameSearch`;
/* 商品查询 */
const URL_ZB_GOODS_GOODSLIST = `${URL_ZB_PREFIX}/goods/goodsList`;
/* 商品详情页面 */
const URL_ZB_GOODS_GOODSDETAILT = `${URL_ZB_PREFIX}/goods/goodsDetail`;
/* 变式商品子码属性加载 */
const URL_ZB_GOODS_SUBCODE_GOODS_DETAIL_LIST = `${URL_ZB_PREFIX}/goods/subCodeGoodsDetailList`;
/** 小程序获取分享数据 */
const URL_ZB_WX_SHARESHORTLINKGB = `${URL_ZB_PREFIX}/invite/shareShortLinkGb`;
/** 拼团成交人列表 */
const URL_ZB_GROUPBUYLATELYINFO = `${URL_ZB_PREFIX}/promotion/groupBuyLatelyInfo`;
// 取消收藏
const URL_ZB_COLLECT_CANCEL = `${URL_ZB_PREFIX}/collect/cancel`;
// 收藏
const URL_ZB_COLLECT_COLLECT = `${URL_ZB_PREFIX}/collect/collect`;
/** 验证是否可开团、参团 */
const URL_ZB_OTOVALIDATEJOINGROUPBUY = `${URL_ZB_PREFIX}/promotion/otoValidateJoinGroupBuy`;

/* 获取会员基本信息统一接口 */
const URL_ZB_MEMBER_GETMEMBERINFO = `${URL_ZB_PREFIX}/member/getmemberinfo`;
/* 团长后台抢购 抢购分享-通过分享Scene获取团长默认收货地址接口 */
const URL_ZB_PROMOTIONCOLONEL_QUERYCOLONEADDRBYSCENE = `${URL_ZB_PREFIX}/promotionColonel/queryColoneAddrByScene`;
/* 团长分查询门店 */
const URL_ZB_QUERYSHOPINFOBYSHOPID = `${URL_ZB_PREFIX}/promotionColonel/queryShopInfoByShopId`;
/* 下单确认页；计算优惠券 */
const URL_ZB_CART_GOODSCOUPONVALID = `${URL_ZB_PREFIX}/cart/goodsCouponValid`;
/** 小程序解析数据 */
const URL_ZB_WX_XCXLINKPARAMS = `${URL_ZB_PREFIX}/invite/xcxLinkParams`;
/** POST  社区拼团和O2O抢购 列表 */
const URL_ZB_PROMOTIONCOLONEL_MIXEDPROBUYLIST = `${URL_ZB_PREFIX}/promotionColonel/mixedProBuyList`;
/* 根据版块信息获取推荐数据 */
const URL_ZB_RECOMMEND_LIST = `${URL_ZB_PREFIX}/recommend/list`;
/* 团长后台抢购 列表-商品的分页获取接口 */
const URL_ZB_PROMOTIONCOLONEL_QUERYPANICBUYINGPROMOTIONFORGOODS =
	`${URL_ZB_PREFIX}/promotionColonel/queryPanicBuyingPromotionForGoods`;
/* 团长后台拼团 列表-商品的分页获取接口 */
const URL_ZB_PROMOTIONCOLONEL_QUERYGROUPPROMOTIONFORGOODS =
	`${URL_ZB_PREFIX}/promotionColonel/queryGroupPromotionForGoods`;
/** 自提点刷本地存储数据 */
const URL_ZB_CART_GOODSVALIDCOMMUNITY = `${URL_ZB_PREFIX}/cart/goodsValidCommunity`;
/* 商品校验；订单金额计算 */
const URL_ZB_CART_GOODSVALID = `${URL_ZB_PREFIX}/cart/goodsValid`;
/* 团长后台水单 水单-查看水单详情团长信息接口 */
const URL_ZB_PCQGM_INFO = `${URL_ZB_PREFIX}/promotionColonel/queryGroupMemberInfo`;
/* 闪电付下单确认 */
const URL_ZB_CART_LIGHTINGPAYCONFIRM = `${URL_ZB_PREFIX}/cart/lightingPayConfirm`;
/* 查询订单可用优惠券 */
const URL_ZB_COUPON_USABLELIST = `${URL_ZB_PREFIX}/coupon/usableList`;
/* 团长分享下单 */
const URL_ZB_ORDER_GROUPCREATE = `${URL_ZB_PREFIX}/order/groupCreate`;
/* 新增变更O2O拼团下单 */
const URL_ZB_ORDER_CREATEGROUPBUYINGO2O = `${URL_ZB_PREFIX}/order/createGroupBuyingO2O`;
/* 下单 */
const URL_ZB_ORDER_CREATE = `${URL_ZB_PREFIX}/order/create`;
/* 团长后台抢购 列表-商品的分页获取接口 */
const URL_ZB_PROMOTIONCOLONEL_QUERYDIRECTOFFPROMOTIONFORGOODS =
	`${URL_ZB_PREFIX}/promotionColonel/queryDirectOffPromotionForGoods`;
/* 删除自提点 */
const URL_ZB_GROUPADDRESS_DELETE = `${URL_ZB_PREFIX}/groupAddress/delete`;
/* POST 查询自提点库存 */
const URL_ZB_GROUPADDRESS_STOCKINFO = `${URL_ZB_PREFIX}/groupAddress/groupMemberGoodsStockInfo`;
/* 查询团长店列表 */
const URL_ZB_GROUPADDRESS_GROUPMEMBERSHOPLIST = `${URL_ZB_PREFIX}/groupAddress/groupMemberShopList`;
/* 查询自提点 */
const URL_ZB_GROUPADDRESS_QUERY = `${URL_ZB_PREFIX}/groupAddress/query`;
/* 查询自提点列表 */
const URL_ZB_GROUPADDRESS_LIST = `${URL_ZB_PREFIX}/groupAddress/list`;
/* 查询团长自提点列表 */
const URL_ZB_GROUPADDRESS_MY_ADDRESS = `${URL_ZB_PREFIX}/groupAddress/myAddress`;
/* 保存自提点 */
const URL_ZB_GROUPADDRESS_SAVE = `${URL_ZB_PREFIX}/groupAddress/save`;
/* 团长后台水单 推广-推广、一键推广接口 */
const URL_ZB_PROMOTIONCOLONEL_MEMBERCOLONEEXTENSION = `${URL_ZB_PREFIX}/promotionColonel/memberColoneExtension`;
/* 团长后台水单 水单-查看水单详情接口 */
const URL_ZB_PCQGM_FLOWSHEETBYSHEETID = `${URL_ZB_PREFIX}/promotionColonel/queryGroupMemberFlowSheetBySheetId`;
/* 列表-搜索商品的分页获取接口 */
const URL_ZB_PCQG_FORNAME = `${URL_ZB_PREFIX}/promotionColonel/queryGoodsForName`;
/* 列表-搜索商品的分页获取接口 */
const URL_ZB_MEMBER_GROUPAPPLY = `${URL_ZB_PREFIX}/member/groupApply`;

/* 删除差异信息 [周庆磊] */
const URL_ZB_STOCKDIFF_DELETE = `${URL_ZB_PREFIX}/stockDiff/delete`;
/*POST 查询差异信息列表[周庆磊] */
const URL_ZB_STOCKDIFF_LIST = `${URL_ZB_PREFIX}/stockDiff/list`;
/* POST 保存差异信息[周庆磊] */
const URL_ZB_STOCKDIFF_SAVE = `${URL_ZB_PREFIX}/stockDiff/save`;
/* POST 差异上报：查看3天内批次列表[周庆磊] 废弃*/
const URL_ZB_STOCKDIFF_WAITINGDISTRIBUTTON = `${URL_ZB_PREFIX}/stockDiff/waitingDistribution`;

/* POST差异上报：商品列表[周庆磊]*/
const URL_ZB_STOCKDIFF_BATCHGOODSLIST = `${URL_ZB_PREFIX}/stockDiff/batchGoodsList`;
/* POST 差异上报：查看3天内批次列表[周庆磊]*/
const URL_ZB_STOCKDIFF_BATCHLIST = `${URL_ZB_PREFIX}/stockDiff/batchList`;
/* POST 差异上报：查看报差异信息[周庆磊]*/
const URL_ZB_STOCKDIFF_VIEW = `${URL_ZB_PREFIX}/stockDiff/view`;

/* 差异列表 */
const URL_ZB_REPORT_DIFF = `${URL_ZB_PREFIX}/member/reportDiff`;

/**
 * 社区拼团订单模块 : 包括到货签收、团员订单核销
 */
/* 核销: 核销社区拼团查询团员订单 */
const URL_ZB_ORDER_COLONEL_CHECK = `${URL_ZB_PREFIX}/order/colonel/check`;
/* 核销:社区拼团查询团员待核销订单 */
const URL_ZB_ORDER_COLONEL_VALIDATE = `${URL_ZB_PREFIX}/order/colonel/validate`;
/* 接收: 团长验收配送批次 */
const URL_ZB_ORDER_COLONEL_RECEIVEDISTRIBUTION = `${URL_ZB_PREFIX}/order/colonel/receiveDistribution`;
/* 接收:团长查看待配送批次 */
const URL_ZB_ORDER_COLONEL_WAITINGDISTRIBUTION = `${URL_ZB_PREFIX}/order/colonel/waitingDistribution`;
/* 领取优惠券 */
const URL_ZB_COUPON_DRAW = `${URL_ZB_PREFIX}/coupon/draw`;
/* 领取优惠券 裂变 */
const URL_ZB_COUPON_DRAW_AND_SHARE = `${URL_ZB_PREFIX}/coupon/drawAndShare`;
/**  口令领取优惠券[瞿博]*/
const URL_ZB_COUPON_DRAW_PASSWDCOUPON = `${URL_ZB_PREFIX}/coupon/drawPasswdCoupon`;
/** 下单 */
const URL_ZB_ORDER_TOPAY = `${URL_ZB_PREFIX}/order/topay`;
/** 小程序用户信息绑定【梁少斌】*/
const URL_ZB_WX_SAVEWEIXINXCXUSERINFO = `${URL_ZB_PREFIX}/wx/saveWeixinXcxUserInfo`;
/**
 * 团长订单
 */
/* 团长后台订单详情 */
const URL_ZB_ORDER_GROUPDETAIL = `${URL_ZB_PREFIX}/order/groupDetail`;
/* 团长后台订单列表*/
const URL_ZB_ORDER_GROUPLIST = `${URL_ZB_PREFIX}/order/groupList`;
/* 团长后台客户列表*/
const URL_ZB_MEMBER_GROUP_LIST = `${URL_ZB_PREFIX}/member/group/list`;
/* 团长后台客户列表*/
const URL_ZB_MEMBER_GROUP_MYADDRESS = `${URL_ZB_PREFIX}/member/group/myAddress`;
/* 团长后台客户备注列表*/
const URL_ZB_MEMBER_GROUP_SAVEREMARK = `${URL_ZB_PREFIX}/member/group/saveRemark`;
/* 团长后台客户订单信息*/
const URL_ZB_ORDER_GROUPMEMBERFANSINFO = `${URL_ZB_PREFIX}/order/groupMemberFansInfo`;
/* 团长后台订单列表订单数目*/
const URL_ZB_ORDER_GROUPORDERCOUNT = `${URL_ZB_PREFIX}/order/groupOrderCount`;


/* 查询团长佣提现记录列表*/
const URL_ZB_BROKERAGE_ALREADYPAYLIST = `${URL_ZB_PREFIX}/brokerage/alreadyPayList`;
/* 我的佣金*/
const URL_ZB_BROKERAGE_QUERYBROKERAGEINFO = `${URL_ZB_PREFIX}/brokerage/queryBrokerageInfo`;

/* 我的佣金新的。周庆磊*/
const URL_ZB_BROKERAGE_QUERYNEWBROKERAGEINFO = `${URL_ZB_PREFIX}/brokerage/queryNewBrokerageInfo`;

/* 查询团长佣金已结算收入列表*/
const URL_ZB_BROKERAGE_SETTLEDLIST = `${URL_ZB_PREFIX}/brokerage/settledList`;
/* 查询团长佣金预计收入列表*/
const URL_ZB_BROKERAGE_UNSETTLEDLIST = `${URL_ZB_PREFIX}/brokerage/unsettledList`;

/* 判断团长是否认证身份证*/
const URL_ZB_BROKERAGE_ISGROUPAUTHENTICATION = `${URL_ZB_PREFIX}/brokerage/isGroupAuthentication`;
/* 团长佣金提现*/
const URL_ZB_BROKERAGE_ALREADYPAY = `${URL_ZB_PREFIX}/brokerage/alreadyPay`;
/* 我的最新版佣金新的。周庆磊20191028*/
const URL_ZB_BROKERAGE_QUERYMEMBERGROUPBROKERAGEINFO = `${URL_ZB_PREFIX}/brokerage/queryMemberGroupBrokerageInfo`;
/* 累计收入明细*/
const URL_ZB_BROKERAGE_COUNTBROKERAGELIST = `${URL_ZB_PREFIX}/brokerage/countBrokerageList`;
/* 今日收入明细 */
const URL_ZB_BROKERAGE_TODAYBROKERAGELIST = `${URL_ZB_PREFIX}/brokerage/todayBrokerageList`;
/* 我的佣金明细*/
const URL_ZB_BROKERAGE_MYBROKERAGELIST = `${URL_ZB_PREFIX}/brokerage/myBrokerageList`;

/* 团长后台水单 水单-查询水单接口 */
const URL_ZB_PROMOTIONCOLONEL_QUERYGROUPMEMBERFLOWSHEET = URL_PREFIX + '/promotionColonel/queryGroupMemberFlowSheet';
/* 团长后台水单 水单-生成水单接口 */
const URL_ZB_PROMOTIONCOLONEL_GREATGROUPMEMBERFLOWSHEET = URL_PREFIX + '/promotionColonel/greatGroupMemberFlowSheet';
// 新上 
const URL_ZB_QUERYDIRECTOFFPROMOTIONFORGOODS = `${URL_ZB_PREFIX}/promotionColonel/queryDirectOffPromotionForGoods`;
// 热卖 
const URL_ZB_QUERYPROMOTIONFORHOTSALEGOODS = `${URL_ZB_PREFIX}/promotionColonel/queryPromotionForHotSaleGoods`;
/**
 * 云超
 */
/* 抢购列表 */
const URL_ZB_PROMOTION_SELECTKXPANICBUYINGLIST = `${URL_ZB_PREFIX}/promotion/selectKXPanicBuyingList`;

/*********************** 社区业态 团长模块  END ************************ */


/* /goods/goodsPlusRecommendList [调整接口]根据分类查询对应商品数据[韦海武]*/
var URL_GOODS_GOODSPLUSRECOMMENDLIST = URL_PREFIX + '/goods/goodsPlusRecommendList';
/*/goods/foodDineIn[调整接口]根据分类查询对应堂食数据[韦海武]*/
var URL_GOODS_FOODDINEIN = URL_PREFIX + '/goods/foodDineIn';
// 获取二级分类
var URL_FIND_FIRST = URL_PREFIX + '/goods/findVirtualCatesByFirst';


/* 活动 - 三店同庆 小票抽奖接口 */
// 获取奖品列表
var URL_PRIZE_LIST = URL_PRIZE_PREFIX + '/smartScreen-api/prize/selectPrizeList';
// 获取奖品列表 & 抽奖机底部广告图列表(暂只有下期预告一张图)
var URL_PRIZE_LIST_V3 = URL_PRIZE_PREFIX + '/smartScreen-api/prize/v3/selectPrizeList';
// 获取用户信息(含剩余抽奖次数)
var URL_GET_PRIZE_DRAW_MEMBER_INFO = URL_PRIZE_PREFIX + '/smartScreen-api/prizeDrawMember/getPrizeDrawMemberInfo';
// 抽奖
var URL_PRIZE_DRAW = URL_PRIZE_PREFIX + '/smartScreen-api/prize/prizeDraw';

/**
 * 家家悦定制接口
 */
/** 获取家家悦会员信息 */
var URL_MEMBER_JJYMEMBERINFO = `${URL_PREFIX}/member/jjyMemberInfo`;
/** 电子零钱包明细查询接口 */
var URL_MEMBER_JJYCHANGEINFO = `${URL_PREFIX}/member/jjyChangeInfo`;
/** 家家悦电子券明细查询接口 */
var URL_MEMBER_JJYPAPERINFO = `${URL_PREFIX}/member/jjyPaperInfo`;
/** 家家悦积分明细查询接口 */
var URL_MEMBER_JJYSCOREINFO = `${URL_PREFIX}/member/jjyScoreInfo`;

/** 家家悦宝贝食空 活动卡列表[*/
var URL_GOODS_ACTIVITYCARD = `${URL_PREFIX}/goods/activityCard`;


/* 查询团长佣金预计收入列表*/
var URL_ZB_BROKERAGE_ANTICIPATEREVENUELIST = `${URL_ZB_PREFIX}/brokerage/anticipatedRevenueList`;

/*********************** 团长模块 end ******************** */


/* 团长后台苛选 列表-商品的分页获取接口 */
var URL_ZB_PROMOTIONCOLONEL_QUERYKEXUANPANICBUYINGPROMOTIONFORGOODS = URL_ZB_PREFIX +
	'/promotionColonel/queryKeXuanPanicBuyingPromotionForGoods';
/** 苛选抢购列表 瞿博 */
const URL_ZB_SELECTKXPANICBUYINGLIST = `${URL_ZB_PREFIX}/promotion/selectKXPanicBuyingList`;
/* 商铺列表 */
const URL_ZB_STORE_STORELISTINRANKING = `${URL_ZB_PREFIX}/store/storeListInRanking`;

/* 云超热卖 */
const URL_ZB_GOODS_HOTSALE = `${URL_ZB_PREFIX}/goods/hotSale`;

/* 通过姓名和身份证号添加清关证件 */
const URL_ZB_ADDRESS_SAVEADDRESSTOCUSTOMSDOC = `${URL_ZB_PREFIX}/address/saveAddressToCustomsDoc`;
/** 根据门店查询对应自提柜地址数据[韦海武] */
var URL_SELFPICKUPBOXES_LIST = `${URL_PREFIX}/selfPickupBoxes/list`;
// 获取用户的订单数据
var URL_ZB_QUERYYCLOGISTICSLOG = `${URL_PREFIX}/logistics/queryYcLogisticsLog`;
/** 浇水活动  获取活动详情*/
const URL_GAME_WATERACTIVITY_INFO = `${URL_PREFIX}/activity/info`;
/** 浇水活动  参与活动*/
const URL_GAME_WATERACTIVITY_JOIN = `${URL_PREFIX}/activity/join`;
/** 浇水活动  签到、 */
const URL_GAME_WATERACTIVITY_GoToGetWater = `${URL_PREFIX}/activity/getCredit`;
/** 浇水活动  获取当天领取情况 */
const URL_GAME_WATERACTIVITY_GetStateList = `${URL_PREFIX}/activity/getScore`;
/** 浇水活动  判断是否参加了活动 */
const URL_GAME_WATERACTIVITY_checkState = `${URL_PREFIX}/activity/judge`;
/** 浇水活动  判断当天是否付款 */
const URL_GAME_WATERACTIVITY_getPayState = `${URL_PREFIX}/activity/getStatus`;
/**常见问题 */
const URL_USER_QUESTIONLIST = `${URL_PREFIX}/question/questionserver`;
/**上传图片 */
const URL_USER_STOCKDIFF_UPLOADIMAGE = `${URL_PREFIX}/stockDiff/uploadImages`;

// 新增周年庆小游戏接口开始
// 判断首页跑酷图标的显示时间
const URL_GAME_PARKOUR_INFO = `${URL_PREFIX}/activity/info`;
// 获取游戏次数
const URL_GAME_PARKOUR_CHANCES = `${URL_PREFIX}/activity/getChances`;
// 点击GO开始游戏
const URL_GAME_PARKOUR_STARTGAME = `${URL_PREFIX}/activity/startGame`;
// 获取游戏内容
const URL_GAME_PARKOUR_GAMEINFO = `${URL_PREFIX}/activity/getGameInfo`;
// 回答问题
const URL_GAME_PARKOUR_FINISHANSWERQUESTION = `${URL_PREFIX}/activity/finishAnswerQuestion`;
// 优鲜首页新版数据
const URL_YX_NEW_DATA = `${URL_PREFIX}/recommend/list/v2`
// 社团首页新版数据
const ST_URL_YX_NEW_DATA = `${URL_ZB_PREFIX}/recommend/list/v2`
// 新版必买爆款数据(优鲜)
const NEW_SECTIONDEATAIL = `${URL_PREFIX}/recommend/sectionDetail/v2`
// 新版必买爆款数据(社团)
const ST_NEW_SECTIONDEATAIL = `${URL_ZB_PREFIX}/recommend/sectionDetail/v2`
// 按板块分页加载商品(优鲜)
const NEW_LISTBYPAGE = `${URL_PREFIX}/recommend/listByPage/v2`
// 按板块分页加载商品(社团)
const ST_NEW_LISTBYPAGE = `${URL_ZB_PREFIX}/recommend/listByPage/v2`
// 查询新版导航接口
const NEW_NAVIGATION = `${URL_PREFIX}/recommend/navigation`
//定位取附近的优鲜门店或者社团
const URL_YX_SHOPLOCATION = `${URL_PREFIX}/location/shopQueryByLocation/V2`;

//根据定位获取配送范围重叠的门店
const URL_QUERYINTERSECTEDBYLOCATION = `${URL_PREFIX}/location/queryIntersectedByLocation`;

// 判断是否展示闪电付等
const URL_YX_NEARBY = `${URL_PREFIX}/address/nearby`;
// 领券中心获取各种券信息
const SECTION_MORE_DETAIL = `${URL_PREFIX}/recommend/sectionMoreDetail/v2`
const ST_SECTION_MORE_DETAIL = `${URL_ZB_PREFIX}/recommend/sectionMoreDetail/v2`

// 2022-08 小程序改版二期接口
// 优鲜
// 食谱详情页面接口
const GET_COOK_BOOKV2 = `${URL_PREFIX}/content/getCookbookV2`;
// 查询文章详情 
const GET_ARTICLEV2 = `${URL_PREFIX}/content/getArticleV2`;
// 查询闪购商品
const GET_CONTENT_GOODS_LIST = `${URL_PREFIX}/content/getContentGoodsList`;
// 生活馆查询
const GET_LIFE_HALL = `${URL_PREFIX}/content/getLifeHall`;
// 社团
// 食谱详情页面接口
const GET_COOK_BOOKV2_ZB = `${URL_ZB_PREFIX}/content/getCookbookV2`;
// 查询文章详情 
const GET_ARTICLEV2_ZB = `${URL_ZB_PREFIX}/content/getArticleV2`;
// 查询闪购商品
const GET_CONTENT_GOODS_LIST_ZB = `${URL_ZB_PREFIX}/content/getContentGoodsList`;
// 生活馆查询
const GET_LIFE_HALL_ZB = `${URL_ZB_PREFIX}/content/getLifeHall`;
// 收藏列表
const COLLECTION_LIST = `${URL_PREFIX}/collect/contentList`;
// 社团收藏列表
const COLLECTION_LIST_ZB = `${URL_ZB_PREFIX}/collect/contentList`;

export {
	URL_GAME_PARKOUR_INFO,
	URL_GAME_PARKOUR_CHANCES,
	URL_GAME_PARKOUR_STARTGAME,
	URL_GAME_PARKOUR_GAMEINFO,
	URL_GAME_PARKOUR_FINISHANSWERQUESTION,
	URL_COUPON_MYLIST,
	URL_FIND_FIRST,

	URL_CHANNEL_FINDCHANNELSHOPLIST,
	URL_USER_STOCKDIFF_UPLOADIMAGE,
	URL_USER_QUESTIONLIST,
	URL_GAME_WATERACTIVITY_getPayState,
	URL_GAME_WATERACTIVITY_checkState,
	URL_GAME_WATERACTIVITY_GetStateList,
	URL_GAME_WATERACTIVITY_GoToGetWater,
	URL_GAME_WATERACTIVITY_JOIN,
	URL_GAME_WATERACTIVITY_INFO,
	URL_ZB_QUERYYCLOGISTICSLOG,
	URL_SELFPICKUPBOXES_LIST,
	URL_ZB_BROKERAGE_ANTICIPATEREVENUELIST,
	URL_ZB_ADDRESS_SAVEADDRESSTOCUSTOMSDOC,
	URL_ZB_GOODS_HOTSALE,
	URL_ZB_STORE_STORELISTINRANKING,
	URL_ZB_PROMOTIONCOLONEL_QUERYKEXUANPANICBUYINGPROMOTIONFORGOODS,
	URL_ZB_SELECTKXPANICBUYINGLIST,
	URL_ZB_STOCKDIFF_BATCHGOODSLIST,
	URL_ZB_STOCKDIFF_BATCHLIST,
	URL_ZB_STOCKDIFF_VIEW,
	URL_ZB_STOCKDIFF_DELETE,
	URL_ZB_STOCKDIFF_LIST,
	URL_ZB_STOCKDIFF_SAVE,
	URL_ZB_STOCKDIFF_WAITINGDISTRIBUTTON,
	isBindWxCode,
	DISTRIBUTE_ENVIROMENT,
	URL_OVERSEASCUSTOMERSERVICE_SAVE,
	URL_OVERSEASCUSTOMERSERVICE_CANCEL,
	URL_OVERSEASCUSTOMERSERVICE_GETCANCELREASON,
	URL_OVERSEASCUSTOMERSERVICE_GETAFTERSALEREASON,
	URL_OVERSEASCUSTOMERSERVICE_CANCELORDER,
	URL_OVERSEASCUSTOMERSERVICE_UPLOAD,
	URL_CUSTOMERSERVICE_CANCEL,
	URL_CUSTOMERSERVICE_DETAILS,
	URL_CUSTOMERSERVICE_SAVE,
	URL_CUSTOMERSERVICE_LIST,
	URL_CUSTOMERSERVICE_GETEFFECTIVETIME,
	URL_ORDER_PROMOTIONGOODS,
	URL_CUSTOMERSERVICE_UPLOAD,
	URL_CUSTOMERSERVICE_GETAFTERSALEREASON,
	URL_MEMBER_MEMBERSCORELIST,
	URL_MEMBER_GETMEMBERSCOREVALUECARD,
	URL_MEMBER_GETMEMBERSCOREVALUECARDCOUPONTOTAL,
	URL_MEMBER_GETMYVALUECARDCONSUMELOG,
	URL_ORDER_DEPLAYRECEIVE,
	PUBKEY,
	CHANNERL_220,
	CHANNELTYPE_22,
	CHANNELTYPE_1066,
	CHANNELTYPE_1399,
	GOODS_TYPE_MARKET,
	GOODS_TYPE_FOOD,
	GOODS_TYPE_CITYB2C,
	GOODS_TYPE_SCORE,
	GOODS_TYPE_GLOBAL,
	GOODS_TYPE_HIGLOBAL,
	URL_LOCATION_SHOPQUERYBYLOCATION,
	URL_LOCATION_SHOPDEFAULTBYLOCATION,
	URL_RECOMMEND_LIST,
	URL_RECOMMEND_RECOMMENDLATELYINFO,
	URL_RECOMMEND_LISTBYPAGE,
	URL_ORDER_LIST,
	URL_PREFIX,
	URL_ZB_PREFIX,
	ORDERSTATE_JSON,
	CODETYPE_1,
	CODETYPE_2,
	CODETYPE_3,
	DELIVERYWAY_1022,
	DELIVERYWAY_1023,
	DELIVERYWAY_1024,
	URL_MEMBER_SEND_DENTIFYCODE,
	URL_MEMBER_MODIFY_INFO,
	SUCCESS_CODE,
	DEVICECODE,
	DEVICETYPE,
	URL_MEMBER_INIT,
	URL_MEMBER_FASTLOGIN,
	URL_MEMBER_LOGIN,
	URL_MEMBER_GETMYBALANCELOG,
	URL_MEMBER_GETMYHISTORYCARDPACK,
	URL_MEMBER_MEMBERLEVELGOODSLIST,
	URL_MEMBER_GETMEMBERINTEGRGOODSLIST,
	URL_MEMBER_JJYCHANGEINFO,
	URL_MEMBER_JJYPAPERINFO,
	URL_MEMBER_JJYSCOREINFO,
	URL_ORDER_CANCEL,
	URL_ORDER_PAYAGAIN,
	URL_ORDER_PICKUP,
	URL_ORDER_RECEIVED,
	userAgent,
	URL_ORDER_DETAIL,
	URL_MEMBER_FORGET,
	URL_MEMBER_MODIFY_PHOTO,
	URL_MEMBER_SHARE,
	PAYCHANEL_JSON,
	URL_MEMBER_GETMEMBERALLINFO,
	URL_ADDRESS_LISTBYLOCATION,
	URL_ADDRESS_LISTBYORDER,
	URL_ADDRESS_EDIT,
	URL_ADDRESS_DELETE,
	URL_ADDRESS_QUERY,
	URL_ADDRESS_CUSTOMSDOCLIST,
	URL_ADDRESS_DELETECUSTOMSDOS,
	URL_ADDRESS_CUSTOMSDOC,
	URL_ADDRESS_SAVECUSTOMSDOC,
	URL_ADDRESS_SAVEADDRESSTOCUSTOMSDOC,
	URL_ADDRESS_SAVECUSTOMSDOCNEW,
	URL_ADDRESS_UPLOADCUSTOMSDOCIMAGE,
	URL_CART_GOODSVALID,
	URL_CART_GOODSVALIDCOMMUNITY,
	URL_CART_USUALLYBUYLIST,
	URL_CART_ORDERCONFIRM,
	URL_GOODS_QUERYADDONITEMGOODSLIST,
	URL_MEMBER_BINDVALUECARD,
	GOODS_TYPE_B2C,
	GOODS_TYPE_MEMBER,
	URL_CART_GOODSCOUPONVALID,
	URL_COUPON_USABLELIST,
	URL_COUPON_COUPONDETAIL,
	URL_COUPON_QUERYCOUPONDETAIL,
	URL_COUPON_GOODSLISTBYCOUPON,
	URL_COUPON_BIND_THIRDCOUPON,
	URL_COUPON_DRAW,
	URL_COUPON_DRAW_AND_SHARE,
	URL_COUPON_ISDRAWN,
	URL_COUPON_DRAW_PASSWDCOUPON,
	URL_MEMBER_GETMYCARDPACK,
	COUPONTYPE_266,
	COUPONTYPE_267,
	COUPONTYPE_268,
	COUPONTYPE_269,
	SHIPPINGTYPE_110,
	SHIPPINGTYPE_111,
	SHIPPINGTYPE_112,
	SHIPPINGTYPE_113,
	PAYTYPE_34,
	PAYTYPE_496,
	PAYTYPE_497,
	PAYTYPE_498,
	PRICINGMETHOD_390,
	PRICINGMETHOD_391,
	URL_ORDER_CREATE,
	URL_ORDER_CREATESPECIAL,
	URL_ORDER_CREATEGROUPBUYINGO2O,
	URL_MEMBER_GETMEMBERINFO,
	URL_MEMBER_CREATEEXCLUSIVECODE,
	RETURNSTATUS_JSON,
	URL_MEMBER_MODIFY_PWD,
	URL_ORDER_TOPAY,
	URL_ORDER_OPENOFFLINEPAY,
	URL_ORDER_CREATEGLOBAL,
	URL_ZB_ORDER_CREATEHARSHSELECT,
	URL_ORDER_SCANCODEORDERBINDMEMBER,
	INVOICETYPE_JSON,
	URL_COUPON_QUERYCOUPONLISTBYORDERID,
	URL_GRABREDPACKAGE_ORDERDRAWDIALOG,
	URL_WX_SAVEWEIXINXCXUSERINFO,
	URL_ORDER_VERIFICATIONORDER,
	URL_CART_V2_LIGHTINGPAY,
	URL_CART_LIGHTINGPAYCONFIRM,
	URL_GOODS_QUERYSCANCODE_V3,
	URL_WX_SHARESHORTLINKGB,
	URL_WX_XCXLINKPARAMS,
	URL_WX_XCXLINKPARAMSFORCARD,
	URL_MEMBER_XCXLOGIN,
	URL_WX_DRAWREDPACKETS,
	URL_GROUPBUYLIST,
	URL_OTOGROUPBUYLIST,
	URL_GROUPBUYLATELYINFO,
	URL_OTOVALIDATEJOINGROUPBUY,
	URL_OTOGROUPBUYDETAIL,
	URL_OTOGROUPBUYDETAILWXSHARE,
	URL_GROUPBUYDETAIL,
	URL_ORDER_ORDERCOUNT,
	URL_INVOICE_QUERYINVOICE,
	URL_INVOICE_QUERYINVOICECONTENTLIST,
	URL_INVOICE_QUERYINVOICELIST,
	URL_INVOICE_SAVEINVOICEEMAIL,
	URL_INVOICE_SAVEINVOICEINFO,
	URL_OVERSEASCUSTOMERSERVICE_SAVERETURNLOGISTICSINFO,
	URL_CUSTOMERSERVICE_GETSKUAFTERSALECOUNT,
	APPLICATIONREASON_ALL,
	ISNEEDPICKUP_JSON,
	LOGISTICS_STATUS,
	URL_OVERSEASCUSTOMERSERVICE_GETLOGISTICSCOMPANY,
	URL_CUSTOMERSERVICE_GETCANCELORDERAFTERSALEREASON,
	URL_CUSTOMERSERVICE_CANCELORDER,
	URL_COMMENT_TOCOMMENT,
	URL_COMMENT_UPLOADCOMMENTIMAGES,
	URL_COMMENT_SAVE,
	URL_COMMENT_ORDERCOMMENT,
	EVALUATE_TYPE_180,
	URL_COMMENT_LIST,
	URL_COMMENT_MYCOMMENT,
	URL_CATEGORY_LIST,
	URL_GOODS_GOODSLIST,
	URL_GOODS_GOODSDETAILT,
	URL_COLLECT_CANCEL,
	URL_COLLECT_COLLECT,
	URL_GOODS_NAMESEARCH,
	URL_STORE_GETSTOREDETAIL,
	URL_STORE_FOODLISTBYSTORE,
	URL_VALUECARD_GETORDERVALUECARDPAGELIST,
	URL_VALUECARD_BINDVALUECARDFROMBUY,
	URL_VALUECARD_BINDVALUECARDFROMSHARE,
	URL_VALUECARD_GETCARDLISTBYRECOMMEND,
	URL_VALUECARD_GETVALUECARDSHARE,
	ORDERSTATE_GLOBAL_JSON,
	URL_ORDER_QUERYREGIONLOGISTICSV2,
	ORDERLOGISTICSSTATUS_JSON,
	ISPICKWAY_JSON,
	URL_ORDER_QUERYLOGISTICSV2,
	URL_DATA_PREFIX,
	URL_COLLECT_GOODSLIST,
	URL_NEWS_MESSAGESTAT2C,
	URL_NEWS_READMESSAGE,
	URL_NEWS_MESSAGELIST2C,
	URL_NEWS_UPLOADXCXFROMID,
	//社区、团长模块 START
	URL_ZB_GOODS_NAMESEARCH,
	URL_ZB_GOODS_GOODSLIST,
	URL_ZB_GOODS_GOODSDETAILT,
	URL_ZB_GOODS_SUBCODE_GOODS_DETAIL_LIST,
	URL_ZB_WX_SHARESHORTLINKGB,
	URL_ZB_GROUPBUYLATELYINFO,
	URL_ZB_COLLECT_CANCEL,
	URL_ZB_COLLECT_COLLECT,
	URL_ZB_OTOVALIDATEJOINGROUPBUY,
	URL_ZB_GROUPADDRESS_LIST,
	URL_ZB_GROUPADDRESS_MY_ADDRESS,
	URL_ZB_MEMBER_GETMEMBERINFO,
	URL_ZB_PROMOTIONCOLONEL_QUERYCOLONEADDRBYSCENE,
	URL_ZB_QUERYSHOPINFOBYSHOPID,
	URL_ZB_CART_GOODSCOUPONVALID,
	URL_ZB_WX_XCXLINKPARAMS,
	URL_ZB_PROMOTIONCOLONEL_MIXEDPROBUYLIST,
	URL_ZB_RECOMMEND_LIST,
	URL_ZB_PROMOTIONCOLONEL_QUERYPANICBUYINGPROMOTIONFORGOODS,
	URL_ZB_PROMOTIONCOLONEL_QUERYGROUPPROMOTIONFORGOODS,
	URL_ZB_CART_GOODSVALIDCOMMUNITY,
	URL_ZB_CART_GOODSVALID,
	URL_ZB_PCQGM_INFO,
	URL_ZB_CART_LIGHTINGPAYCONFIRM,
	URL_ZB_COUPON_USABLELIST,
	URL_ZB_ORDER_GROUPCREATE,
	URL_ZB_ORDER_CREATEGROUPBUYINGO2O,
	URL_ZB_ORDER_CREATE,
	URL_ZB_PROMOTIONCOLONEL_QUERYDIRECTOFFPROMOTIONFORGOODS,
	URL_ZB_GROUPADDRESS_DELETE,
	URL_ZB_GROUPADDRESS_STOCKINFO,
	URL_ZB_GROUPADDRESS_GROUPMEMBERSHOPLIST,
	URL_ZB_GROUPADDRESS_QUERY,
	URL_ZB_GROUPADDRESS_SAVE,
	URL_ZB_PROMOTIONCOLONEL_MEMBERCOLONEEXTENSION,
	URL_ZB_PCQGM_FLOWSHEETBYSHEETID,
	URL_ZB_PCQG_FORNAME,
	URL_ZB_MEMBER_GROUPAPPLY,
	URL_ZB_REPORT_DIFF,

	URL_ZB_ORDER_GROUPLIST,
	URL_ZB_ORDER_GROUPDETAIL,
	URL_ZB_MEMBER_GROUP_LIST,
	URL_ZB_MEMBER_GROUP_MYADDRESS,
	URL_ZB_MEMBER_GROUP_SAVEREMARK,
	URL_ZB_ORDER_GROUPMEMBERFANSINFO,
	URL_ZB_ORDER_GROUPORDERCOUNT,
	URL_ZB_ORDER_COLONEL_CHECK,
	URL_ZB_ORDER_COLONEL_VALIDATE,
	URL_ZB_ORDER_COLONEL_RECEIVEDISTRIBUTION,
	URL_ZB_ORDER_COLONEL_WAITINGDISTRIBUTION,
	URL_ZB_COUPON_DRAW,
	URL_ZB_ORDER_TOPAY,
	URL_ZB_WX_SAVEWEIXINXCXUSERINFO,
	URL_ZB_BROKERAGE_ALREADYPAYLIST,
	URL_ZB_BROKERAGE_QUERYBROKERAGEINFO,
	URL_ZB_BROKERAGE_SETTLEDLIST,
	URL_ZB_BROKERAGE_UNSETTLEDLIST,
	URL_ZB_BROKERAGE_ISGROUPAUTHENTICATION,
	URL_ZB_BROKERAGE_ALREADYPAY,
	URL_ZB_BROKERAGE_QUERYNEWBROKERAGEINFO,
	URL_ZB_BROKERAGE_QUERYMEMBERGROUPBROKERAGEINFO,
	/* 累计收入明细*/
	URL_ZB_BROKERAGE_COUNTBROKERAGELIST,
	/* 今日收入明细 */
	URL_ZB_BROKERAGE_TODAYBROKERAGELIST,
	/* 我的佣金明细*/
	URL_ZB_BROKERAGE_MYBROKERAGELIST,
	URL_ZB_QUERYDIRECTOFFPROMOTIONFORGOODS,
	URL_ZB_QUERYPROMOTIONFORHOTSALEGOODS,
	URL_ZB_PROMOTION_SELECTKXPANICBUYINGLIST,
	// END 
	URL_GOODS_QUERYSTOREDVALUECARD,
	URL_PROMOTIONCOLONEL_QUERYSHOPINFOBYSHOPID,
	URL_CUSTOMERSERVICE_GROUPMEMBERREJECTED,
	URL_CUSTOMERSERVICE_SELFPOINTRECEIPT,
	URL_GOODS_GOODSPLUSRECOMMENDLIST,
	URL_GOODS_FOODDINEIN,
	//家家悦
	URL_MEMBER_JJYMEMBERINFO,
	URL_BI_PRO,
	URL_FR_PRO,
	URL_GOODS_ACTIVITYCARD,
	/** 抽奖  */
	URL_PRIZE_LIST,
	URL_PRIZE_LIST_V3,
	URL_GET_PRIZE_DRAW_MEMBER_INFO,
	URL_PRIZE_DRAW,
	MSG_SUBSCRIBEMESSAGE_GROUP,
	MSG_SUBSCRIBEMESSAGE_REFUND,
	MSG_SUBSCRIBEMESSAGE_TPND,
	MSG_SUBSCRIBEMESSAGE_PREFER,
	URL_YX_NEW_DATA,
	ST_URL_YX_NEW_DATA,
	NEW_SECTIONDEATAIL,
	ST_NEW_SECTIONDEATAIL,
	NEW_LISTBYPAGE,
	ST_NEW_LISTBYPAGE,
	NEW_NAVIGATION,
	URL_YX_SHOPLOCATION,
	URL_QUERYINTERSECTEDBYLOCATION,
	URL_YX_NEARBY,
	SECTION_MORE_DETAIL,
	ST_SECTION_MORE_DETAIL,
	// 2022-08 小程序改版二期接口
	// 食谱详情页面接口
	GET_COOK_BOOKV2,
	GET_ARTICLEV2,
	GET_CONTENT_GOODS_LIST,
	GET_LIFE_HALL,
	GET_COOK_BOOKV2_ZB,
	GET_ARTICLEV2_ZB,
	GET_CONTENT_GOODS_LIST_ZB,
	GET_LIFE_HALL_ZB,
	COLLECTION_LIST,
	COLLECTION_LIST_ZB
}
