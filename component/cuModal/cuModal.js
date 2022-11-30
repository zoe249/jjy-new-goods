// component/globalModal/globalModal.js
Component({
	options: {
		multipleSlots: true // 在组件定义时的选项中启用多slot支持
	},
	/**
	 * 组件的属性列表
	 */
	properties: {
		modalName: {
			type: String,
			value: ''
		},
		bgAllowClickHide: {
			type: Boolean,
			value: false
		},
		isVisible: {
			type: Boolean,
			value: false
		},
		header: {
			type: String,
			value: ''
		},
		content: {
			type: String,
			value: ''
		},
		// dialog 框体样式
		dialogBoxStyle: {
			type: String,
			value: ''
		},
		contentStyle: {
			type: String,
			value: ''
		},
		slot: {
			type: Boolean,
			value: true
		},
		hideFooter: {
			type: Boolean,
			value: false
		},
		bgAllowClickHide: {
			type: Boolean,
			value: false
		},
		footer: {
			type: Array,
			value: [{
				text: '取 消',
				style: '',
				className: 'btn-cancel',
				iconPath: '',
				iconStyle: '',
				bindClick: 'modalCancel'
			}, {
				text: '确 认',
				style: '',
				className: 'btn-confirm',
				iconPath: '',
				iconStyle: '',
				bindClick: 'modalConfirm',
			}]
		},
		eventDetail: {
			type: Object,
			value: {}
		},
		eventOption: {
			type: Object,
			value: {
				bubbles: false,
				composed: false,
				capturePhase: false,
			}
		},
	},
	observers: {
		'bgAllowClickHide'(_bgAllowClickHide) {
			if(_bgAllowClickHide != this.data.bgAllowClickHide){
				this.setData({
					bgAllowClickHide:_bgAllowClickHide
				})
			}
		}
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		isProcessing: false
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		modalConfirm(e) {
			let that = this;
			let {
				callbackName,
				eventDetail,
				eventOption
			} = e.currentTarget.dataset;
			eventDetail.callbackName = callbackName;
			that.triggerEvent('modalconfirm', eventDetail, eventOption);
			that.setData({
				isVisible: false
			})
		},
		modalCancel(e) {
			let that = this;
			let {
				callbackName,
				eventDetail,
				eventOption
			} = e.currentTarget.dataset;
			eventDetail.callbackName = callbackName;

			that.triggerEvent('modalcancel', eventDetail, eventOption);
			that.setData({
				modalName: null,
				isVisible: false,
				bgAllowClickHide: false
			})
		},
		_showModal(e) {
			let {
				callbackName,
				eventDetail,
				eventOption
			} = e.currentTarget.dataset;
			eventDetail.callbackName = callbackName;
			this.triggerEvent('showModal', eventDetail, eventOption);
		},
		_hideModal(e) {
			// let {
			// 	callbackName,
			// 	eventDetail,
			// 	eventOption
			// } = e.currentTarget.dataset;
			// eventDetail.callbackName = callbackName;
			this.setData({
				modalName: null,
				bgAllowClickHide: false
			})
			this.triggerEvent('hideModal', {}, {});
		},
	}
});