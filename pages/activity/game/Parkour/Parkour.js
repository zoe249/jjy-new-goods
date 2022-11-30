import * as UTIL from '../../../../utils/util.js';
import * as API from '../../../../utils/API.js';
const APP = getApp();
// 图片的公共路径
const ImgSrc = "https://shgm.jjyyx.com/m/images/xcy/"
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		// 埋点使用 对应pi值
		currentLogId: 488,
		// 图片的公共路径
		img_src: ImgSrc,
		// 背景图
		bgImg: ImgSrc + 'GameBg.jpg',
		//icon图片信息
		iconImg: ImgSrc + 'Position.png',
		// 点标记的移动位置
		baseX: "0",
		baseY: "0",
		// 初始图标是否显示
		iconShow: false,
		//移动的序列数组
		progressPoints: [
			[{
				baseX: "-5vw",
				baseY: "-1vh"
			}, {
				baseX: "-6vw",
				baseY: "-10.3vh"
			}, {
				baseX: "4vw",
				baseY: "-9vh"
			}, {
				baseX: "7vw",
				baseY: "-15vh",
			}, {
				baseX: "2vw",
				baseY: "-18.5vh"
			}],
			[{
				baseX: "-5vw",
				baseY: "-19vh"
			}, {
				baseX: "-7vw",
				baseY: "-26vh"
			}, {
				baseX: "-3vw",
				baseY: "-35vh"
			}, {
				baseX: "15vw",
				baseY: "-35vh"
			}, {
				baseX: "15vw",
				baseY: "-39vh"
			}],
			[{
				baseX: "16vw",
				baseY: "-44vh"
			}, {
				baseX: "23vw",
				baseY: "-48vh"
			}, {
				baseX: "12vw",
				baseY: "-53.7vh"
			}, {
				baseX: "0vw",
				baseY: "-54vh"
			}],
			[{
				baseX: "-6vw",
				baseY: "-56vh"
			}, {
				baseX: "-2vw",
				baseY: "-64vh",
			}, {
				baseX: "4vw",
				baseY: "-71vh"
			}, {
				baseX: "-1vw",
				baseY: "-76.5vh"
			}, {
				baseX: "-13vw",
				baseY: "-72.5vh"
			}],
			[{
				baseX: "-22vw",
				baseY: "-64.5vh"
			}, {
				baseX: "-23vw",
				baseY: "-59.5vh"
			}, {
				baseX: "-24vw",
				baseY: "-54.5vh"
			}, {
				baseX: "-24vw",
				baseY: "-47.5vh",
			}, {
				baseX: "-38vw",
				baseY: "-44.5vh"
			}],
			[{
				baseX: "-59vw",
				baseY: "-40.5vh"
			}, {
				baseX: "-53vw",
				baseY: "-37.5vh"
			}, {
				baseX: "-36vw",
				baseY: "-28.5vh"
			}, {
				baseX: "-39vw",
				baseY: "-26.5vh"
			}, {
				baseX: "-31vw",
				baseY: "-16.5vh"
			}]
		],
		// 当前移动的位置 0起点 1山东 2江苏 3安徽 4内蒙 5河北 6北京
		schedule: 0,
		// 移动延迟的时间
		time: 1000,
		// 随即后的问题信息
		questionList: "",
		//后台返回的所有问题数据
		AllQuestionList: "",
		// 顶部红包弹出框
		tipshow: false,
		Tooltip: 'hide',
		// 活动信息
		ParkourObj: "",
		// 游戏次数
		GameNum: 0,
		// 判断当前是展示哪个弹出框
		// -1不弹框 1通关攻略 2活动规则 3中奖记录 4回答问题 5回答正确 6回答错误 7无游戏机会 8通关成功
		Tcknumber: -1,
		// 问题的弹出框点击是否可以打开
		questionTckShow: false,
		// 中奖记录信息列表	
		zjjllist: [],
		// 回答问题弹出框倒计时时间
		countdown: 60,
		// 判断是否通关
		TgShow: false,
		// 是否显示次数兑换优惠券提示
		endCoupon: false,
		// 顶部发放优惠券文本
		TopTcktext: {
			title: "",
			content: ""
		},
		//判断是否允许继续倒计时
		DjsShow: true,
		// 最后一步是否弹出优惠券
		endYhqTcShow: true,
		//发放的优惠券id
		YhqId: "",
		//记录优惠券发放是否成功
		answerCode: ""
	},
	// 页面加载
	onLoad(e) {
		
	},
	// 页面显示
	onShow() {
		// 判断是否登录
		this.checkLoginAndGoToPage()
	},
	// 自定义方法开始部分
	// 判断是否登录
	checkLoginAndGoToPage() {
		if (!UTIL.isLogin()) {
			this.ti_shi('登录信息失效，请您重新登录~')
			setTimeout(() => {
				let nowLink = `/pages/activity/game/Parkour/Parkour`;
				wx.navigateTo({
					url: `/pages/user/wxLogin/wxLogin?pages=${nowLink}`,
				});
			}, 1000);
		}else{
			// 获取活动id
			this.getParkourShow()
			// 获取游戏内容
			this.getGameInfo()
		}
		return true;
	},
	// 获取活动id
	getParkourShow() {
		UTIL.ajaxCommon(API.URL_GAME_PARKOUR_INFO, {}, {
			success: (res) => {
				if (res._code == API.SUCCESS_CODE) {
					if (!res._data) return
					// 活动信息
					this.setData({
						ParkourObj: res._data
					})
					// 格式化开始时间
					let startTimeString = res._data.startTime.replace(/\-/g, '/')
					// 格式化结束时间
					let endTimeString = res._data.endTime.replace(/\-/g, '/')
					// 将时间转换为时间戳方便对比
					let startTime = new Date(startTimeString).getTime()
					let endTime = new Date(endTimeString).getTime()
					let today_date = new Date().getTime()
					// 开始判断首页跑酷按钮是否显示
					if (startTime > today_date) {
						// 未开始
						this.setData({
							ParkourShow: false
						})
						this.dui_hua({
							title: "提 示",
							content: "活动尚未开始，敬请期待！",
							l_show: false,
							r_fun: () => {
								this.GoIndex()
							}
						})
					} else if (today_date > endTime) {
						// 已结束
						this.setData({
							ParkourShow: false
						})
						this.dui_hua({
							title: "提 示",
							content: "活动已经结束！",
							l_show: false,
							r_fun: () => {
								this.GoIndex()
							}
						})
					} else {
						// 进行中
						this.setData({
							ParkourShow: true
						})
						// 获取游戏次数
						this.getGameNum()
					}
				} else {
					console.log("失败：" + res._msg);
				}
			},
			fail: (res) => {
				console.log("失败：" + res._msg);
			}
		})
	},
	// 获取游戏次数
	getGameNum() {
		UTIL.ajaxCommon(API.URL_GAME_PARKOUR_CHANCES, {
			activityID: this.data.ParkourObj.id
		}, {
			success: (res) => {
				if (res._code == API.SUCCESS_CODE) {
					if (res._data >= 1) {
						this.setData({
							GameNum: res._data
						})
					} else {
						// 处于答题阶段不提示 无次数
						if (!this.data.DjsShow && this.data.schedule != 0) {
							console.log('答题阶段')
						} else {
							// 没有游戏次数提示
							this.setData({
								Tcknumber: 7,
								questionTckShow: false
							})
						}
					}
					// 判断是否处于答题阶段
					if (!this.data.DjsShow && this.data.schedule != 0) {
						// 恢复倒计时
						this.setData({
							Tcknumber: 4,
							questionTckShow: false,
							DjsShow: true
						})
						this.test()
					}
				} else if (res._code == "000011") {
					this.setData({
						baseX: "-31vw",
						baseY: "-16.5vh",
						time: 0,
						TgShow: true,
						endYhqTcShow: false
					})
					// 通关提示
					this.setData({
						Tcknumber: 8,
						questionTckShow: false
					})
				} else {
					this.ti_shi(res._msg)
				}
				this.setData({
					iconShow: true
				})
			},
			fail: (res) => {
				this.ti_shi(res._msg)
			}
		});
	},
	// 获取游戏内容
	getGameInfo() {
		UTIL.ajaxCommon(API.URL_GAME_PARKOUR_GAMEINFO, {
			activityID: this.data.ParkourObj.id
		}, {
			success: (res) => {
				if (res._code == API.SUCCESS_CODE) {
					// 保存所有问题的数据
					this.setData({
						AllQuestionList: res._data
					})
				} else {
					this.ti_shi(res._msg)
				}

			},
			fail: (res) => {
				this.ti_shi(res._msg)
			}
		});
	},
	// 点击开始游戏
	ClickGame() {
		// 增加埋点
		UTIL.jjyBILog({
			e: 'click', //事件代码
			oi: 490,
		});
		if (this.data.schedule == 0) {
			this.dui_hua({
				title: '提示',
				content: '您确定要开始游戏吗？',
				r_fun: () => {
					// 定义点标记之间移动的时间
					this.setData({
						time: 1000
					})
					UTIL.ajaxCommon(API.URL_GAME_PARKOUR_STARTGAME, {
						activityID: this.data.ParkourObj.id
					}, {
						success: (res) => {
							if (res._code == API.SUCCESS_CODE) {
								// 更改游戏次数
								this.setData({
									GameNum: res._data
								})
								// 开始移动一次点标记
								this.newMovlist()
							} else {
								this.ti_shi(res._msg)
							}
						},
						fail: (res) => {
							this.ti_shi(res._msg)
						}
					});
				}
			})
		} else {
			this.ti_shi('游戏正在进行中！')
		}
	},
	// 移动的序列
	newMovlist() {
		// 处理点标记的移动序列
		this.data.progressPoints[this.data.schedule].forEach((item, index) => {
			setTimeout(() => {
				this.setData({
					baseX: item.baseX,
					baseY: item.baseY
				})
			}, this.data.time * index);
		})
		// 弹出问题的时间
		let time = this.data.progressPoints[this.data.schedule].length
		// 弹出问题
		setTimeout(() => {
			// 获取当前站点信息
			let newlist = this.data.AllQuestionList.activityStepMap[this.data.schedule]
			// 随机问题
			let num = newlist.questionList.length - 0
			let listIndex = Math.floor(Math.random() * num)
			// 做多选的处理
			let manylist = []
			let jsoncontent = JSON.parse(newlist.questionList[listIndex].content)
			for (let [key, value] of Object.entries(jsoncontent)) {
				manylist.push({
					"key": key,
					"title": value,
					"choose": 0
				})
			}
			newlist.questionList[listIndex].content = manylist
			let obj = {
				stepInfo: newlist.stepInfo,
				chooseList: newlist.questionList[listIndex]
			}
			// 赋值数据，显示弹出框
			this.setData({
				questionList: obj,
				Tcknumber: 4,
				countdown: 60
			})
			// 开始答题倒计时
			this.test()
		}, this.data.time * time);
		// 更改步骤地点
		this.setData({
			schedule: this.data.schedule + 1
		})
	},
	// 答题的选择
	clickAnswer(e) {
		let questionList = this.data.questionList
		// 判断是单选还是多选 0单选 1多选
		if (this.data.questionList.chooseList.multiple == 1) {
			if (e.currentTarget.dataset.item.choose == 0) {
				questionList.chooseList.content[e.currentTarget.dataset.index].choose = 1
			} else {
				questionList.chooseList.content[e.currentTarget.dataset.index].choose = 0
			}

		} else {
			questionList.chooseList.content.forEach((item, index) => {
				item.choose = 0
			})
			questionList.chooseList.content[e.currentTarget.dataset.index].choose = 1
		}
		this.setData({
			questionList: questionList
		})
	},
	// 回答问题
	answer() {
		// 判断是否选择答案
		let chooseShow = false
		let chooseYeslist = []
		this.data.questionList.chooseList.content.forEach((item, index) => {
			if (item.choose == 1) {
				chooseShow = true
				chooseYeslist.push(item.key)
			}
		})
		if (chooseShow) {
			if (this.data.schedule <= 6) {
				let data = {
					activityID: this.data.ParkourObj.id,
					bz: this.data.questionList.stepInfo.id,
					questionId: this.data.questionList.chooseList.id,
					stepContent: chooseYeslist.join('')
				}
				// 判断是否为最后一次提交
				if (this.data.schedule == 6) {
					// 获取最后一步的id
					let endIndex = this.data.AllQuestionList.activityStepMap
					let endId = this.data.AllQuestionList.activityStepMap[Object.values(endIndex).length - 1]
						.stepInfo.id
					data.lastStepId = endId
				}
				UTIL.ajaxCommon(API.URL_GAME_PARKOUR_FINISHANSWERQUESTION, data, {
					success: (res) => {
						if (res._code == API.SUCCESS_CODE || res._code == "000013") {
							let YhqZt = res._data
							let answerCode = res._code
							// 判断是否为最后一次提交
							if (this.data.schedule == 6) {
								// 判断是否剩下次数
								if (this.data.GameNum >= 1) {
									// 通关成功弹窗
									this.setData({
										Tcknumber: 8,
										questionTckShow: false,
										GameNum: 0,
										TgShow: true,
										endCoupon: true,
										YhqId: YhqZt,
										answerCode: answerCode
									})
								} else {
									// 通关成功弹窗
									this.setData({
										Tcknumber: 8,
										questionTckShow: false,
										GameNum: 0,
										TgShow: true,
										endCoupon: false,
										YhqId: YhqZt,
										answerCode: answerCode
									})
								}
							} else {
								// 展示回答正确弹窗
								this.setData({
									Tcknumber: 5,
									questionTckShow: false,
									YhqId: YhqZt,
									answerCode: answerCode
								})
							}
							// 还原倒计时
							this.setData({
								DjsShow: false
							})
							setTimeout(() => {
								this.setData({
									DjsShow: true,
									countdown: 60
								})
							}, 2000);
						} else if (res._code == "000007") {
							// 回答错误
							this.setData({
								Tcknumber: 6,
								questionTckShow: false
							})
							// 还原倒计时
							this.setData({
								DjsShow: false
							})
							setTimeout(() => {
								this.setData({
									DjsShow: true,
									countdown: 60
								})
							}, 1000);
						} else {
							this.ti_shi(res._msg)
						}

					},
					fail: (res) => {
						this.ti_shi(res._msg)
					}
				});
			} else {
				this.ti_shi('游戏已经结束')
			}

		} else {
			this.ti_shi('请选择答案！')
		}
	},
	// 获取优惠券列表
	couponList() {
		this.show('加载中...')
		// 拿取活动优惠券的id
		let businessIdList = []
		Object.values(this.data.AllQuestionList.activityStepMap).forEach((item, index) => {
			if (item.stepInfo.business_id) {
				let business_idList = []
				item.stepInfo.business_id.split(",").forEach(items => {
					business_idList.push(Number(items))
				})
				businessIdList.push(...business_idList)
			}
		})
		let newList = []
		// 获取所有优惠券列表
		UTIL.ajaxCommon(API.URL_COUPON_MYLIST, {
			couponStatus: 0
		}, {
			success: (res) => {
				if (res._code == API.SUCCESS_CODE) {
					// 对优惠券列表进行筛选
					res._data.forEach(item => {
						if (businessIdList.indexOf(item.couponId) != -1) {
							newList.push(item)
						}
					})
					this.setData({
						zjjllist: newList
					})
					this.hide()
					this.setData({
						Tcknumber: 3
					})
				} else {
					this.ti_shi(res._msg)
				}

			},
			fail: (res) => {
				this.ti_shi(res._msg)
			}
		});
	},
	// 页面上弹出框按钮的点击
	clickbtn(e) {
		// 中奖记录
		if (e.currentTarget.dataset.index == 3) {
			this.couponList()
		} else {
			// 其他
			this.setData({
				Tcknumber: e.currentTarget.dataset.index
			})
		}
	},
	// 顶部弹出框
	TckFun(obj) {
		// 对文本框进行赋值
		this.setData({
			TopTcktext: obj
		})
		// 显示弹出文本
		this.setData({
			tipshow: true,
			Tooltip: 'show'
		})
		// 掩藏弹出文本
		setTimeout(() => {
			this.setData({
				Tooltip: 'hide'
			})
		}, 3800);
	},
	// 关闭弹出框
	cloneTck() {
		// 答题阶段
		if (this.data.Tcknumber == 4) {
			this.setData({
				Tcknumber: -1,
				questionTckShow: true
			})
			// 暂停倒计时
			this.setData({
				DjsShow: false
			})
		} else if (this.data.Tcknumber == 5) {
			let obj = ""
			if (this.data.YhqId) {
				//发放了
				obj = {
					title: "恭喜您，获得优惠券一张！",
					content: "恭喜您，获得一张" + this.data.questionList.stepInfo.note + "，游戏结束后，可在我的-优惠券中查看。"
				}
			} else {
				//优惠券发放失败了
				obj = {
					title: "很抱歉，优惠券发放失败！",
					content: "工作人员会在稍后给您补发优惠券，请您明天在我的优惠券中查看补发的优惠券"
				}
			}
			// 关闭回答正确
			this.setData({
				Tcknumber: -1,
				questionTckShow: false
			})
			// 顶部弹出框
			this.TckFun(obj)
			// 开始移动一次点标记
			this.newMovlist()
		} else if (this.data.Tcknumber == 6) {
			// 回答错误
			this.setData({
				Tcknumber: -1,
				questionTckShow: false
			})
			// 回答错误回到起点
			this.wrongAnswer()
		} else if (this.data.Tcknumber == 8) {
			// 通关成功
			this.setData({
				Tcknumber: -1,
				questionTckShow: false
			})
			if (this.data.endYhqTcShow) {
				let obj = ""
				// 判断是否发放了优惠券
				if (this.data.YhqId) {
					let YhqList = this.data.YhqId.split(",")
					// 存在一张券发放失败
					if (this.data.answerCode == '000013') {
						let business_idList = []
						this.data.questionList.stepInfo.business_id.split(",").forEach(items => {
							business_idList.push(Number(items))
						})
						console.log(business_idList)
						if (business_idList.indexOf(YhqList[0]) == -1) {
							obj = {
								title: "恭喜您，获得优惠券一张！",
								content: "恭喜您，获得一张" + this.data.questionList.stepInfo.note +
									"，游戏结束后，可在我的-优惠券中查看。"
							}
							// 顶部弹出框
							this.TckFun(obj)
							setTimeout(() => {
								obj = {
									title: "很抱歉，优惠券发放失败！",
									content: "工作人员会在稍后给您补发优惠券，请您明天在我的优惠券中查看补发的优惠券"
								}
								setTimeout(() => {
									this.setData({
										tipshow: false
									})
									// 顶部弹出框
									this.TckFun(obj)
								}, 1000);
							}, 2800);
						} else {
							obj = {
								title: "很抱歉，优惠券发放失败！",
								content: "工作人员会在稍后给您补发优惠券，请您明天在我的优惠券中查看补发的优惠券"
							}
							// 顶部弹出框
							this.TckFun(obj)
							setTimeout(() => {
								let endIndex = this.data.AllQuestionList.activityStepMap
								let endnote = this.data.AllQuestionList.activityStepMap[Object.values(
									endIndex).length - 1].stepInfo.note
								obj = {
									title: "恭喜您，获得优惠券一张！",
									content: "恭喜您，获得一张" + endnote + "，游戏结束后，可在我的-优惠券中查看。"
								}
								setTimeout(() => {
									this.setData({
										tipshow: false
									})
									// 顶部弹出框
									this.TckFun(obj)
								}, 1000);
							}, 2800);
						}
					} else {
						if (YhqList.length > 1) {
							// 有次数券
							obj = {
								title: "恭喜您，获得优惠券一张！",
								content: "恭喜您，获得一张" + this.data.questionList.stepInfo.note +
									"，游戏结束后，可在我的-优惠券中查看。"
							}
							// 顶部弹出框
							this.TckFun(obj)
							setTimeout(() => {
								let endIndex = this.data.AllQuestionList.activityStepMap
								let endnote = this.data.AllQuestionList.activityStepMap[Object.values(
									endIndex).length - 1].stepInfo.note
								obj = {
									title: "恭喜您，获得优惠券一张！",
									content: "恭喜您，获得一张" + endnote + "，游戏结束后，可在我的-优惠券中查看。"
								}
								setTimeout(() => {
									this.setData({
										tipshow: false
									})
									// 顶部弹出框
									this.TckFun(obj)
								}, 1000);
							}, 2800);
						} else {
							// 没次数券
							obj = {
								title: "恭喜您，获得优惠券一张！",
								content: "恭喜您，获得一张" + this.data.questionList.stepInfo.note +
									"，游戏结束后，可在我的-优惠券中查看。"
							}
							// 顶部弹出框
							this.TckFun(obj)
						}
					}
				} else {
					if (this.data.endCoupon) {
						// 优惠券发放失败了
						obj = {
							title: "很抱歉，优惠券发放失败！",
							content: "工作人员会在稍后给您补发优惠券，请您明天在我的优惠券中查看补发的优惠券"
						}
						// 顶部弹出框
						this.TckFun(obj)
						setTimeout(() => {
							// 顶部弹出框
							this.TckFun(obj)
						}, 3800);
					} else {
						// 优惠券发放失败了
						obj = {
							title: "很抱歉，优惠券发放失败！",
							content: "工作人员会在稍后给您补发优惠券，请您明天在我的优惠券中查看补发的优惠券"
						}
						// 顶部弹出框
						this.TckFun(obj)
					}

				}
			}
		} else {
			this.setData({
				Tcknumber: -1,
				endCoupon: false
			})
		}

	},
	// 打开弹出框
	openTck() {
		if (this.data.questionTckShow) {
			this.setData({
				Tcknumber: 4,
				questionTckShow: false
			})
			// 恢复倒计时
			this.setData({
				DjsShow: true
			})
			this.test()
		}
	},
	// 没次数点击开始游戏
	noGamne() {
		// 埋点
		UTIL.jjyBILog({
			e: 'click', //事件代码
			oi: 490,
		});
		if (this.data.schedule == 0 || this.data.schedule == 6) {
			// 判断是否通关
			if (this.data.TgShow) {
				this.setData({
					Tcknumber: 8,
					questionTckShow: false,
					endCoupon: false,
					endYhqTcShow: false
				})
			} else {
				this.setData({
					Tcknumber: 7,
					questionTckShow: false
				})
			}
		} else {
			this.ti_shi('游戏正在进行中！')
		}

	},
	// 回答错误回到起点
	wrongAnswer() {
		// 获取游戏内容
		this.getGameInfo()
		this.setData({
			questionList: "",
			schedule: 0,
			baseX: "0",
			baseY: "0",
			time: 0
		})
	},
	// 60s倒计时
	test() {
		let time = this.data.countdown
		setTimeout(() => {
			time--;
			if (time > 0) {
				this.setData({
					countdown: time
				})
				// 判断下时候允许继续倒计时
				if (this.data.DjsShow) {
					this.test()
				}
			} else {
				this.setData({
					countdown: 0
				})
				this.ti_shi('答题时间到！')
				setTimeout(() => {
					// 回答错误
					this.setData({
						Tcknumber: 6,
						questionTckShow: false
					})
				}, 1000);
			}
		}, 1000);
	},
	// 跳转首页
	GoIndex() {
		this.open_new('/pages/index/index')
	},
	// 自定义方法结束部分
	// 监听页面初次渲染完成
	onReady() {

	},
	// 页面隐藏
	onHide() {
		// 暂停倒计时
		this.setData({
			DjsShow: false
		})
	},
	// 页面卸载
	onUnload() {

	},
	// 触发下拉刷新
	onPullDownRefresh() {
		// 延迟关闭刷新动画
		setTimeout(() => {
			wx.stopPullDownRefresh();
		}, 1000);
	},
	// 页面上拉触底事件的处理函数
	onReachBottom() {

	},
	// 点击右上角分享
	onShareAppMessage: function() {

	},
	// 封装的公共方法开始
	// 显示加载动画
	show(title = "加载中...", mask = true) {
		wx.showLoading({
			title: title,
			mask: mask,
		})
	},
	// 关闭加载动画
	hide() {
		wx.hideLoading();
	},
	// 关闭所有页面，然后打开一个新页面
	open_new(url) {
		wx.reLaunch({
			url: url
		});
	},
	// 提示框
	ti_shi(title, time = 1500, mask = true, icon = "none") {
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
	},
	// 对话框
	dui_hua(obj) {
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
			confirmColor: obj.r_color || "#1F87FD",
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
	// 封装的公共方法结束
})
