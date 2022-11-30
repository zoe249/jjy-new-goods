import * as UtilFile from '../../../../utils/util';
import * as API from '../../../../utils/API.js';

// 图片路径的公用部分
const img_src = "https://shgm.jjyyx.com/m/images/static";
const img_src2234 = "../../static";
// 社团的拼团爆炸贴地址和秒杀爆炸贴的地址
const societyBongImg = {
	group: 'http://118.190.148.187/images/public/20/middle/8d86cdd2-b1a8-4cec-aef3-3d33ae7e3d2f_142x142.png',
	spike: 'http://118.190.148.187/images/public/19/middle/966efef5-ae44-417b-8ea3-c1bbb0a527b8_142x142.png'
}
let APP = getApp();
// 图片预览函数
function look_img(current, urls) {
	wx.previewImage({
		current: current, // 当前显示图片的https链接
		urls: urls // 需要预览的图片https链接列表
	})
}

// 显示加载动画
function show(title = "加载中...", mask = true) {
	wx.showLoading({
		title: title,
		mask: mask,
	})
}
// 关闭加载动画
function hide() {
	wx.hideLoading();
}
// 提示框
function ti_shi(title, time = 1500, mask = true, icon = "none") {
	wx.showToast({
		// 提示的内容
		title: title,
		// 提示的时间
		duration: time,
		// 是否显示透明蒙层，防止触摸穿透(false)
		mask: mask,
		// 图标(success)
		icon: icon,
	})
}
// 对话框
function dui_hua(obj) {
	let showCancel = true;
	if (obj.l_show == false) {
		showCancel = false;
	}
	wx.showModal({
		// 对话框的标题(选填)
		title: obj.title || "",
		// 对话框的内容(选填)
		content: obj.content || "",
		// 是否显示左边的按钮(选填，默认显示)
		showCancel: showCancel,
		// 左边按钮的文字内容(选填，默认取消)
		cancelText: obj.l_text || "取消",
		// 左边按钮的文字颜色(选填，默认#000000)
		cancelColor: obj.l_color || "#000000",
		// 右边按钮的文字内容(选填，默认确定)
		confirmText: obj.r_text || "确定",
		// 右边按钮的文字颜色(选填，默认#3cc51f)
		confirmColor: obj.r_color || "rgb(12,115,28)",
		success: function(res) {
			if (res.confirm) { // 点击了确定按钮
				if (obj.r_fun) {
					obj.r_fun();
				}
			} else { // 点击了取消按钮
				if (obj.l_fun) {
					obj.l_fun();
				}
			}
		}
	})
}


// 打开一个新页面
function open(url) {
	wx.navigateTo({
		url: url
	})
}
// 关闭所有页面，然后打开一个新页面
function open_new(url) {
	wx.reLaunch({
		url: url
	});
}
// 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面。
function open_tab(url) {
	wx.switchTab({
		url: url
	});
}
// 当前页打开新页面
function href(url) {
	wx.redirectTo({
		url: url
	})
}
// 页面返回
function back(delta = 1) {
	wx.navigateBack({
		delta: delta
	})
}

// 将数据存到本地
function set_data(key, data) {
	wx.setStorageSync(key, data);
}
// 从本地获取数据
function get_data(key) {
	return wx.getStorageSync(key);
}
// 同步删除本地数据
function remove_data(key) {
	wx.removeStorageSync(key);
}
// 同步清除本地数据
function clear_data() {
	wx.clearStorage();
}
//非空
function is_null(tv) {
	if (tv == undefined || tv == null || tv == '') {
		return true;
	} else {
		return false
	}

}

// 非空验证
function is_text(text) {
	// 是否正确(默认不正确)
	let br = false;
	if (/\S/.test(text)) {
		br = true;
	}
	return br;
}
// 手机号验证
function is_phone(phone) {
	let br = true;
	if (!(/^0?(13[0-9]|14[01456879]|15[012356789]|16[2567]|17[0-9]|18[0-9]|19[0-3,5-9])[0-9]{8}$/.test(phone))) {
		ti_shi('手机号格式错误');
		br = false
	}
	return br
}
// 中文姓名验证
function is_name(name) {
	let br = true;
	if (!(/^[\u4E00-\u9FA5]{2,10}$/.test(name))) {
		ti_shi('姓名格式错误！');
		br = false
	}
	return br
}
// 正整数验证
function is_zheng_shu(number) {
	let br = true;
	if (!(/^[1-9]\d*$/.test(number))) {
		// ti_shi('姓名格式错误！');
		br = false
	}
	return br
}

// 邮箱验证
function is_email(email) {
	// 是否正确(默认不正确)
	let br = false;
	if (/^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/.test(email)) {
		br = true;
	}
	return br;
}
// 密码验证
function is_password(password) {
	// 是否正确(默认正确)
	let br = true;
	if (!(/^[a-zA-Z0-9]{6,12}$/.test(password))) {
		br = false
	}
	if (!(/^(?![^a-zA-Z]+$)(?!\D+$)/.test(password))) {
		br = false
	}
	return br
}
// 身份证验证
function is_sfz(code) {
	//身份证号合法性验证
	//支持15位和18位身份证号  
	//支持地址编码、出生日期、校验位验证  
	var city = {
		11: "北京",
		12: "天津",
		13: "河北",
		14: "山西",
		15: "内蒙古",
		21: "辽宁",
		22: "吉林",
		23: "黑龙江 ",
		31: "上海",
		32: "江苏",
		33: "浙江",
		34: "安徽",
		35: "福建",
		36: "江西",
		37: "山东",
		41: "河南",
		42: "湖北 ",
		43: "湖南",
		44: "广东",
		45: "广西",
		46: "海南",
		50: "重庆",
		51: "四川",
		52: "贵州",
		53: "云南",
		54: "西藏 ",
		61: "陕西",
		62: "甘肃",
		63: "青海",
		64: "宁夏",
		65: "新疆",
		71: "台湾",
		81: "香港",
		82: "澳门",
		91: "国外 "
	};
	let row = true;
	// ti_shi("验证成功")

	if (!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|[xX])$/.test(code)) {
		ti_shi("身份证号格式错误")
		row = false
	} else if (!city[code.substr(0, 2)]) {
		ti_shi("身份证号地址编码错误")
		row = false
	} else {
		//18位身份证需要验证最后一位校验位  
		if (code.length == 18) {
			code = code.split('');
			//∑(ai×Wi)(mod 11)  
			//加权因子  
			var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
			//校验位  
			var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
			var sum = 0;
			var ai = 0;
			var wi = 0;
			for (var i = 0; i < 17; i++) {
				ai = code[i];
				wi = factor[i];
				sum += ai * wi;
			}
			if (parity[sum % 11] != code[17].toUpperCase()) {
				ti_shi("身份证号校验位错误")
				row = false
			}
		}
	}
	return row;
}

// 复制
function copy(text) {
	wx.setClipboardData({
		data: text,
		success: () => {
			ti_shi("复制成功");
		}
	});
}

// 拨打电话
function call(phone) {
	wx.makePhoneCall({
		phoneNumber: phone,
	})
}

// ios输入框或文本框失去焦点时触发，页面自动回到顶部
function blur() {
	wx.getSystemInfo({
		success: function(res) {
			if (res.platform == "ios") {
				wx.pageScrollTo({
					scrollTop: 0,
					duration: 300
				});
			}
		}
	});
}

// 打开地图选择地址
function choose_address(success) {
	wx.chooseLocation({
		success: function(res) {
			success({
				// 地点名称
				name: res.name,
				// 详细地址
				address: res.address,
				// 经纬度
				lng: res.longitude,
				lat: res.latitude
			});
		},
	});
}
// 打开地图
function open_map(lng, lat, name) {
	wx.openLocation({
		longitude: lng - 0,
		latitude: lat - 0,
		name: name,
	})
}

// 获取用户当前位置所在的经纬度 
function get_lng_lat(success) {
	wx.getLocation({
		type: 'gcj02',
		geocode: true,
		success: (res) => {
			success({
				root: true,
				type: 1,
				data: res,
			});
		},
		fail: (res) => {
			//console.log(res)
			success({
				root: true,
				type: 2,
			});
		},
		cancel: (res) => {
			success({
				root: true,
				type: 1,
				data: {}
			});
		}
	});
}
// 微信扫一扫
function sys(success) {
	// 允许从相机和相册扫码
	wx.scanCode({
		success: function(res) {
			// app上还没处理过，等处理时再整理
			//console.log('条码类型：' + res.scanType);
			//console.log('条码内容：' + res.result);
		}
	});
}
// 获取收货地址
function get_shdz(success) {
	wx.chooseAddress({
		success(res) {
			success(res);
		}
	})
}

// 从聊天记录中上传文件
function lx_sc_wj(success) {
	wx.chooseMessageFile({
		count: 1,
		type: 'file',
		success(res) {
			success(res)
		}
	})
}
/**
 * 根据提供的坐标反查城市名称等信息
 * @param geoLocationGcj02 {Object} 经纬度对象
 *      {
 *          longitude,
 *          latitude
 *      }
 * @param options {Object=} 可选配置, 用于配置成功回调等信息
 *      {
 *          success
 *      }
 */
// function getCityInfoByCoordinate(geoLocationGcj02, options) {
// 	wx.showNavigationBarLoading();
// 	UtilFile.QQMapSDK.reverseGeocoder({
// 		location: geoLocationGcj02,
// 		success: function (response) {
// 			if (options && options.success) {
// 				options.success(response)
// 			}
// 		},
// 		fail: function (response) {
// 			if (options && options.fail) {
// 				options.fail(response)
// 			}
// 		},
// 		complete: function (response) {
// 			if (options && options.complete) {
// 				options.complete(response)
// 			}
// 			wx.hideNavigationBarLoading();
// 		}
// 	});
// }
/**
 * 定位，生成并返回 "火星坐标系" 对应的 "百度坐标系" 坐标
 * @param geoLocationGcj02 {object} 接受一个含有 longitude 和 latitude 属性的对象类型
 * @returns {{longitude: *, latitude: *}}
 */
function getLocationToBaiDuAddress(callback, info) {
	wx.showNavigationBarLoading();
	if (info) {
		let geoLocationGcj02 = info;
		//console.log(info.data)
		let geoLocationBd09 = gcj02tobd09(geoLocationGcj02.longitude, geoLocationGcj02.latitude);
		var result = {
			longitude: geoLocationBd09[0],
			latitude: geoLocationBd09[1]
		}
		if (geoLocationBd09[0].toString() === wx.getStorageSync('longitude').toString() &&
			geoLocationBd09[1].toString() === wx.getStorageSync('latitude').toString() &&
			wx.getStorageSync('cityName') &&
			wx.getStorageSync('detailAddress')) {
			//无需再次查询城市信息
			let locationInfo = {
				'longitude': geoLocationBd09[0],
				'latitude': geoLocationBd09[1],
				'cityName': wx.getStorageSync('cityName'),
				'provinceName': wx.getStorageSync('provinceName'),
				'detailAddress': wx.getStorageSync('detailAddress')
			};
			APP.globalData.locationInfo = locationInfo;
			wx.setStorageSync('latitude', geoLocationBd09[1]);
      wx.setStorageSync('longitude', geoLocationBd09[0]);
			callback(result);
		} else {
			UtilFile.getCityInfoByCoordinate(geoLocationGcj02, {
				success: function(response) {
					// 初始化 - 定位信息
					let locationInfo = {
						'latitude': geoLocationBd09[1],
						'longitude': geoLocationBd09[0],
						'cityName': response.data.result.ad_info.city,
						'provinceName': response.data.result.ad_info.province,
						'detailAddress': response.data.result.address,
						formattedAddress: response.data.result.formatted_addresses.recommend
					};
					// 初始化 - 用户信息
					// let userInfo = {
					//     'memberId': getMemberId(),
					//     'token': getToken()
					// };
					// 将获取到的 "定位信息和用户信息" 缓存到本地
					batchSaveObjectItemsToStorage(Object.assign({}, locationInfo), function() {
						// 将获取到的 "定位信息与用户登录状态" 加载到 globalData 中
						APP.globalData.locationInfo = locationInfo;
            // 触发回调
						callback(result);
					});
				}
			});
		}
	} else {
		get_lng_lat(function(res) {
			let data = ""
			if (res.type == 1) {
				data = res.data
				set_data("addressWX", data)
			} else {
				if (get_data("addressWX")) {
					data = get_data("addressWX")
				}
			}
			let geoLocationGcj02 = data;
			let geoLocationBd09 = gcj02tobd09(geoLocationGcj02.longitude, geoLocationGcj02.latitude);
			var result = {
				longitude: geoLocationBd09[0],
				latitude: geoLocationBd09[1]
			}
			if (geoLocationBd09[0].toString() === wx.getStorageSync('longitude').toString() &&
				geoLocationBd09[1].toString() === wx.getStorageSync('latitude').toString() &&
				wx.getStorageSync('cityName') &&
				wx.getStorageSync('detailAddress')) {
				//无需再次查询城市信息
				let locationInfo = {
					'longitude': geoLocationBd09[0],
					'latitude': geoLocationBd09[1],
					'cityName': wx.getStorageSync('cityName'),
					'provinceName': wx.getStorageSync('provinceName'),
					'detailAddress': wx.getStorageSync('detailAddress')
				};
				APP.globalData.locationInfo = locationInfo;
				wx.setStorageSync('latitude', geoLocationBd09[1]);
        wx.setStorageSync('longitude', geoLocationBd09[0]);
				callback(result);
			} else {
				UtilFile.getCityInfoByCoordinate(geoLocationGcj02, {
					success: function(response) {
						// 初始化 - 定位信息
						let locationInfo = {
							'latitude': geoLocationBd09[1],
							'longitude': geoLocationBd09[0],
							'cityName': response.data.result.ad_info.city,
							'provinceName': response.data.result.ad_info.province,
							'detailAddress': response.data.result.address,
							formattedAddress: response.data.result.formatted_addresses.recommend
						};
						// 初始化 - 用户信息
						// let userInfo = {
						//     'memberId': getMemberId(),
						//     'token': getToken()
						// };
						// 将获取到的 "定位信息和用户信息" 缓存到本地
						batchSaveObjectItemsToStorage(Object.assign({}, locationInfo), function() {
							// 将获取到的 "定位信息与用户登录状态" 加载到 globalData 中
							APP.globalData.locationInfo = locationInfo;
              // 触发回调
							callback(result);
						});
					}
				});
			}
		})
	}
}


/**
 * 将对象分解为单个项, 保存在 localStorage 中, 这是一个异步方法
 * @obj {Object} 要分解存储的对象
 * @callback {Function=} 对象所有属性存储完毕之后的回调函数, 可选参数,
 * 如果需要在保存到 localStorage 之后立即取用, 则需要将相关逻辑放在此回调函数中, 以确保调用成功.
 */
function batchSaveObjectItemsToStorage(obj, callback) {
	if (obj) {
		let asyncCounter = 0;
		let objLength = Object.keys(obj).length;
		for (let item of Object.keys(obj)) {
			wx.setStorage({
				key: item,
				data: obj[item],
				fail(err) {},
				complete() {
					asyncCounter++;
					if (asyncCounter === objLength) {
						typeof callback === "function" && callback(obj);
					}
				}
			})
		}
	} else {
		typeof callback === "function" && callback(obj);
	}
}
/**
 * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换
 * 即谷歌、高德 转 百度
 * @param lng
 * @param lat
 * @returns {*[]}
 */
var gcj02tobd09 = function gcj02tobd09(lng, lat) {
	var x_PI = 3.14159265358979324 * 3000.0 / 180.0;
	var lat = +lat;
	var lng = +lng;
	var z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_PI);
	var theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_PI);
	var bd_lng = z * Math.cos(theta) + 0.0065;
	var bd_lat = z * Math.sin(theta) + 0.006;
	return [bd_lng, bd_lat]
};


// 封装社团加入购物车方法
// 获取商品详情
function getGoodsDetail(obj, callback) {
	UtilFile.ajaxCommon(API.URL_ZB_GOODS_GOODSDETAILT, {
		entrance: 1, //区分是社区后台商品，还是c端，1：社区商品，0：c端默认c端0
		initSubCodeGoodsDetailFlag: true,
		goodsId: obj.goodsId,
		proId: obj.proId,
		shopId: obj.shopId
	}, {
		success: (res) => {
			if (res && res._code == API.SUCCESS_CODE) {
				if (res._data && res._data.goods) {
					addCart(res._data, callback)
				}
			} else if (res && res._code == '002003') {
				ti_shi('该商品已下架')
			} else {
				ti_shi('加入失败请再次再试')
			}
		},
		fail: (res) => {
			//console.log(res)
			ti_shi('加入失败请再次再试')
		}
	});
}

// 加入购物车
function addCart(shopList, callback) {
	var storeType = shopList.store.storeType;
	var goods = shopList.goods.skus[0];
	goods.pricingMethod = shopList.goods.pricingMethod
	//购物车数量
	let num = UtilFile.groupManageCartGetNumByGoodsId(goods.goodsId, goods.skuId, shopList.store.storeId);
	let limitBuyCondition = UtilFile.getlimitBuyNumByGoodsItem(goods, num);
	if (limitBuyCondition.isLimit) {
		callback(false)
		return; // 促销限购
	}
	if (limitBuyCondition.returnNum > 0) {
		// 起购量
		//如果购物车里面已经有商品了
		if (num >= 1) {
			num = limitBuyCondition.returnNum - num
		} else {
			num = limitBuyCondition.returnNum;
		}
		goods.num = num;
	}
	let promotionList = goods.promotionList;
	let proItem = {};
	if (promotionList && promotionList.length > 0) {
		proItem = promotionList[0]
	} else {
		proItem = {
			proId: 0
		}
	}
	if (goods.pricingMethod == 391) {
		var purchaseAmount = proItem.minEditCount || goods.purchaseAmount;
		var purchaseBegin = proItem.minBuyCount || goods.purchaseBegin;
		// 记重处理
		if (proItem.proId) {
			if (purchaseBegin + (goods.num - 1) * purchaseAmount > proItem.proStock || proItem
				.proStock == 0) {
				ti_shi('抱歉，该商品库存不足');
				callback(false)
				return;
			}
		} else {
			if (goods.num > goods.goodsStock || goods.goodsStock == 0) {
				ti_shi('抱歉，该商品库存不足');
				callback(false)
				return;
			}
		}
	} else {
		if (proItem.proId) {
			if (goods.num > proItem.proStock || proItem.proStock == 0) {
				ti_shi('抱歉，该商品库存不足');
				callback(false)
				return;
			}
		} else {
			if (goods.num > goods.goodsStock || goods.goodsStock == 0) {
				ti_shi('抱歉，该商品库存不足');
				callback(false)
				return;
			}
		}
	}

	if (proItem && proItem.proType == 1178) {
		goods.promotionMinBuyCount = proItem.minBuyCount;
		goods.promotionMinEditCount = proItem.minEditCount;
	}
	UtilFile.setGroupManageCartNum(goods, storeType);
	callback(true)
}
function judgeLocationEnable(callback){
	wx.getSystemInfo({
		success:(res)=>{
			if(!res.locationEnabled){
				wx.showModal({
					// 对话框的标题(选填)
					title: '手机定位未开启',
					// 对话框的内容(选填)
					content: '请开启系统定位和微信APP位置权限',
					// 右边按钮的文字内容(选填，默认确定)
					confirmText: "返回首页",
					// 右边按钮的文字颜色(选填，默认#3cc51f)
					confirmColor: "#FF4752",
					success: function(res) {
						if (res.confirm) { // 点击了确定按钮
							wx.reLaunch({
								url: '/pages/AA-RefactorProject/pages/wxAuth/wxAuth'
							});
						}
					}
				})
			}else{
				callback()
			}
		}
	})
}

module.exports = {
	// 图片的公共路径
	img_src,
	img_src2234,
	// 社团的拼团爆炸贴地址和秒杀爆炸贴的地址
	societyBongImg,
	// 图片预览函数
	look_img,
	// 显示加载动画
	show,
	// 关闭加载动画
	hide,
	// 提示框
	ti_shi,
	// 对话框
	dui_hua,
	// 打开一个新页面
	open,
	// 关闭所有页面，然后打开一个新页面
	open_new,
	// 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面。
	open_tab,
	// 当前页打开新页面
	href,
	// 页面返回
	back,
	// 将数据存到本地
	set_data,
	// 从本地获取数据
	get_data,
	// 同步删除本地数据
	remove_data,
	// 同步清除本地数据
	clear_data,
	// 非空验证
	is_text,
	// 手机号验证
	is_phone,
	// 验证姓名
	is_name,
	//验证正整数
	is_zheng_shu,
	// 邮箱验证
	is_email,
	// 密码验证
	is_password,
	// 身份证验证
	is_sfz,
	// 复制
	copy,
	// 拨打电话
	call,
	// ios输入框或文本框失去焦点时触发，页面自动回到顶部
	blur,
	// 打开地图选择地址
	choose_address,
	// 打开地图
	open_map,
	// 获取用户当前位置所在的经纬度
	get_lng_lat,
	// 微信扫一扫
	sys,
	// 获取收获地址
	get_shdz,
	//从聊天记录上传文件
	lx_sc_wj,
	//定位，返回转换的百度坐标
	getLocationToBaiDuAddress,
	//非空
	is_null,
	//对象存储
	batchSaveObjectItemsToStorage,
	// 社团加入购物车方法
	getGoodsDetail,
	// 判断用户手机是否打开定位
	judgeLocationEnable
}
