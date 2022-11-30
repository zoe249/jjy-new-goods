import * as UTIL from '../../utils/util';
import * as API from '../../utils/API';
const APP = getApp();
/**
 * openParty 开票方：0、家家悦优鲜;1、第三方-海购；2、第三方-苛选；
 * invoiceSupportType 门店发票支持类型：0-都不支持；1-电子发票；2-纸质发票；3-都支持 ,
 * orderTypeFlag 是否是生活卡订单: 0-普通订单，1-生活卡订单,2-积分商城订单,998-抢购订单，999-团购订单，3-1元购订单，1479-POS实体卡,1709-儿童乐园 ,
 * 
 * 
 */
Page({
    data: {
        invoiceAgreement: [
            "o2oInvoice",
            "haigouInvoice",
            "kexuanInvoice"
        ],
        show: 0,
        text: '开企业抬头发票，请准确填写对应的"纳税人识别号"，以免影响您的发票报销。',
        invoiceInfo: {
            open: true,
            invoiceTitleType: 447, //个人，公司
            invoiceTitleTypeDetail: {
                447: '个人',
                448: '公司'
            },
            invoicePaperOrElectronic: 1356, //发票纸质/电子类型
            invoicePaperOrElectronicDetail: {
                1355: '纸质发票',
                1356: '电子发票'
            },
            detail: '',
            invoiceTitle: '', //发票抬头 
            invoiceContent: '', //发票内容
            invoiceNo: '', //纳税人识别号
            invoiceContentType: 0, //发票内容id
        },
        contentList: [],
        showHistoryInvoice: false
    },
    onLoad: function(options) {
        var localInvoiceInfo = wx.getStorageSync('localInvoiceInfo') ? wx.getStorageSync('localInvoiceInfo') : {};

        let {
            invoiceSupportType,
            shopName,
            openParty,
            orderId,
            isCardPay,
            orderStoreId,
            storeId,
            orderTypeFlag,
            addrName,
            addrMobile,
            addrFull
        } = options;
        var addressInfo={'receiverName':addrName,'receiverMobile':addrMobile,'receiverAddress':addrFull}
        var invoicePaperOrElectronic = invoiceSupportType == 2 ? 1355 : 1356;
        var invoiceInfo = this.data.invoiceInfo;
        invoiceInfo.invoicePaperOrElectronic = invoicePaperOrElectronic;

        if (orderStoreId) {
            storeId = orderStoreId;
        }
        this.setData({
            addressInfo,
            shopName: shopName ? shopName : '总部',
            storeId,
            localInvoiceInfo,
            openParty: openParty ? openParty : 0,
            invoiceSupportType: invoiceSupportType ? invoiceSupportType : 0,
            invoiceInfo,
            orderId: orderId ? orderId : false,
            orderStoreId: orderStoreId ? orderStoreId : false,
            isCardPay: isCardPay ? isCardPay:0,
            orderTypeFlag: orderTypeFlag ? orderTypeFlag : 0
        })
    },
    onShow: function() {
        var storeId = this.data.storeId;
        var localInvoiceInfo = this.data.localInvoiceInfo;
        if (localInvoiceInfo[storeId] && localInvoiceInfo[storeId].open) {
            this.setInitIvoiceData();
        }
        this.queryInvoiceContentList();
        this.queryInvoiceList(); //查询开票title记录
    },
    /**
     * 显示历史开票记录
     */
    bindShowHistoryInvoice() {
        console.log(1)
        this.setData({
            showHistoryInvoice: true
        })
    },
    /**
     *  隐藏历史开票记录
     */
    bindHideHistoryInvoice() {
        this.setData({
            // showHistoryInvoice: false
        })
    },
    /**
     * 选择历史开票
     */
    selectHistoryInvoice(e) {

        var invoiceInfo = this.data.invoiceInfo;
        var {
            invoiceTitle,
            invoiceNo
        } = e.target.dataset.detai;

        invoiceInfo.invoiceTitle = invoiceTitle;
        invoiceInfo.invoiceNo = invoiceNo;
        console.log(invoiceInfo)
        this.setData({
            showHistoryInvoice: false,
            invoiceInfo,
        })
    },
    /**
     * 公告隐藏
     */
    closeMod() {
        this.setData({
            closeMo: true
        })
    },
    /**
     * 有开具发票记录
     */
    setInitIvoiceData: function() {
        var storeId = this.data.storeId;
        var localInvoiceInfo = this.data.localInvoiceInfo;
        this.setData({
            invoiceInfo: localInvoiceInfo[storeId]
        })
    },
    /**
     * 通过类型获取开票内容列表
     */
    queryInvoiceContentList: function() {
        var that = this;
        var openParty = that.data.openParty;
        UTIL.ajaxCommon(API.URL_INVOICE_QUERYINVOICECONTENTLIST, {
            type: openParty
        }, {
            "success": function(res) {
                if (res._code == API.SUCCESS_CODE) {
                    var invoiceInfo = that.data.invoiceInfo;
                    if (res._data && res._data.length > 0) {
                        invoiceInfo.invoiceContent = res._data[0].invoiceContent;
                        invoiceInfo.invoiceContentType = res._data[0].invoiceContentType;
                    }
                    that.setData({
                        contentList: res._data ? res._data : []
                    })
                } else {
                    APP.showToast(res._msg);
                }
            }
        })
    },
    /**
     * 选择
     * 
     */
    bindRadio: function(e) {
        var that = this;
        let invoiceInfo = that.data.invoiceInfo;
        let {
            type,
            val,
            info
        } = e.target.dataset;
        //e发票纸质/电子类型   t个人，公司  c内容
        let invoiceObj = {
            e: function(callback) {
                invoiceInfo.invoicePaperOrElectronic = val
            },
            t: function(callback) {
                invoiceInfo.invoiceTitleType = val
            },
            c: function(callback) {
                invoiceInfo.invoiceContentType = val
            },
            listen: function(param) {
                this[param]();
                that.setData({
                    invoiceInfo: invoiceInfo
                })
            }
        };
        invoiceObj.listen(type);
    },
    showTips: function() {

        var show = this.data.show;

        if (show == 0) {
            show = 1;
        } else {
            show = 0
        }
        this.setData({
            show: show
        })
    },
    /**
     * 清除公司发票信息
     */
    clearInputText: function(e) {
        var name = e.currentTarget.dataset.name;
        let invoiceInfo = this.data.invoiceInfo;
        invoiceInfo[name] = '';
        this.setData({
            invoiceInfo: invoiceInfo
        })
    },
    /**
     * 发票信息录入
     */
    bindInputChange: function(e) {
        var val = e.detail.value;
        var name = e.currentTarget.dataset.name;
        let invoiceInfo = this.data.invoiceInfo;
        invoiceInfo[name] = val;
        this.setData({
            invoiceInfo: invoiceInfo,
            showHistoryInvoice:false
        })
    },
    /**
     * 地址信息录入
     */
    bindAddInputChange: function(e) {
        var val = e.detail.value;
        var name = e.currentTarget.dataset.name;
        let addressInfo = this.data.addressInfo;
        addressInfo[name] = val;
        this.setData({
            addressInfo: addressInfo
        })
    },
    /**
     * 补开发票
     * 
     */
    saveInvoiceInfo: function() {
        var that = this;
        var {
            invoiceInfo,
            storeId,
            localInvoiceInfo,
            openParty,
            orderId,
            orderStoreId,
            addressInfo
        } = this.data;
        var isFromOrder = !!orderId;
        var {
            open,
            invoiceTitle,
            invoiceNo,
            invoiceTitleType,
            invoiceContentType,
            invoiceTitleTypeDetail,
            invoicePaperOrElectronic,
            invoicePaperOrElectronicDetail
        } = invoiceInfo;
        /**
         * 订单详情不开发票入参
         */
        var makeUpParam = {
            invoiceContentType,
            invoiceTitle,
            invoiceNo,
            invoicePaperOrElectronic,
            openParty, // 开票方：0、家家悦优鲜;1、第三方-海购；2、第三方-苛选；
            orderId,
            orderStoreId,
            receiverName:addressInfo.receiverName,
            receiverMobile:addressInfo.receiverMobile,
            receiverAddress:addressInfo.receiverAddress
        }

        makeUpParam.invoiceType = invoiceTitleType;
        if (invoiceTitleType == 448) {
            if (invoiceInfo.invoiceTitle == '') {
                APP.showToast('请输入发票抬头');
                return;
            }
            if (invoiceNo == '') {
                APP.showToast('请输入纳税人识别号');
                return;
            }
            if (invoiceNo.length < 15 || invoiceNo.length > 20) {
                APP.showToast('纳税人识别号由数字、英文字母15~20位组合');
                return;
            }
            if (!/^[0-9a-zA-Z]{15,20}$/.test(invoiceNo)) {
                APP.showToast('纳税人识别号只能是数字或英文字母');
                return;
            }
        }
        invoiceInfo.detail = invoiceTitleTypeDetail[invoiceTitleType] + ' - ' + invoicePaperOrElectronicDetail[invoicePaperOrElectronic];
        if (open == false) {
            invoiceInfo.invoiceTitleType = 466;
            invoiceInfo.invoiceNo = '';
            invoiceInfo.invoiceTitle = '';
            invoiceInfo.invoicePaperOrElectronic = '';
            invoiceInfo.invoiceContentType = '';
            invoiceInfo.detail = '不开具发票';
        }
        localInvoiceInfo[storeId] = invoiceInfo;
        if (!isFromOrder) {
            //下单页发票保存
            wx.setStorageSync('localInvoiceInfo', localInvoiceInfo);
            wx.navigateBack()
        } else {
            //订单详情保存
            if (open == false){
                wx.navigateBack({})
            } else {
                UTIL.ajaxCommon(API.URL_INVOICE_SAVEINVOICEINFO, makeUpParam, {
                    success: function(res) {
                        if (res._code == API.SUCCESS_CODE) {
                            APP.showToast(res._msg||'');
                        } else {
                            APP.showToast(res._msg||'');
                        }
                    },
                    fail: function(res) {
                        APP.showToast(res._msg||'');
                    }
                })
                setTimeout(function () {
                    if (that.data.isCardPay == 0) {
                        wx.setStorageSync("isCardPay", 4);
                    }
                    wx.navigateBack({})
                }, 500)
            }
        }
    },
    /**
     * 查询发票抬头信息
     */
    queryInvoiceList: function() {
        var that = this;
        var data = {
            "shopId": UTIL.getShopId(),
            "openParty": that.data.openParty //openParty开票方，家家悦优鲜020:0，第三方海购1
        };
        UTIL.ajaxCommon(API.URL_INVOICE_QUERYINVOICELIST, data, {
            success: function(res) {
                if (res._code == API.SUCCESS_CODE) {
                    that.setData({
                        invoiceOutput: res._data
                    })
                } else {
                    APP.showToast(res._msg);
                }
            }
        })
    },
    switchChange: function(e) {
        var invoiceInfo = this.data.invoiceInfo;
        invoiceInfo.open = e.detail.value;
        this.setData({
            invoiceInfo: invoiceInfo
        })
    },
    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {
        var that = this;
        clearInterval(that.data.invoiceInterval);
    }
})