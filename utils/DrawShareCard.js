/**
 * 获取字符长度
 */
const getStringLength = (str, unit)=> {
  let strLen = str.indexOf('.') < 0? 24: 0;
  for (let i = 0, len = str.length; i < len; i++) {
    strLen += unit*0.7
  }
	return strLen
}
/**
 * 对应促销返回标
 * @param {*} type 
 */
const proTypeStr = (type, groupMode = 0) => {
  // 接龙团
  type = type == 1888 && groupMode == 2029?2029:type
  let proArr = {
    2029: '接龙价',
    1888: '拼团价',
    1178: '秒杀价',
    1640: '秒杀价',
    289: '特惠价'
  }
  return proArr[type]
}

const titStr = (type) => {
  let proArr = {
    2029: '呼朋唤友玩接龙',
    1888: '呼朋唤友去拼团',
    1178: '呼朋唤友来秒杀',
    1640: "购全球 享好物",
    289: '呼朋唤友享特惠',
    
    
  }
  return proArr[type]
}
const btnStr = (type) => {
  // 接龙团
  let proArr = {
    2029: '去接龙',
    1888: '去拼团',
    1178: '马上抢',
    1640: '马上抢',
    289: '马上抢'
  }
  return proArr[type]
}


export default class DrawShareCard {
  type; // 'listCard'-列表，singleCard-单品, homeCard-首页
  proType; // 1888-团，289-特惠，1178-秒杀，2029-接龙.1640-云超秒杀
  goods; // 单品数据
  list; // 商品列表
  qrCode;
  headTit;
  homeImg;
  proArray = [1178,1888,289,2029];
  constructor(options){
    this.type = options.type
    this.proType = options.proType
    this.qrCode = options.qrCode
    this.goods = options.goods
    this.headTit=options.headTit
    this.homeImg=options.homeImg
    this.list =options.list?options.list.slice(0,3):[]
    this.headTpl = this.returnHeader()
  }
  returnHeader() {
    return [{
      "type": "text",
      "text": `${this.headTit?this.headTit:"超值好货·近在咫尺"}`,
      "css": {
        "color": "#ffffff",
        "background": "",
        "width": "656px",
        "height": "63.279999999999994px",
        "top": "32px",
        "left": "0px",
        "rotate": "0",
        "borderRadius": "",
        "borderWidth": "",
        "borderColor": "",
        "shadow": "",
        "padding": "0px",
        "fontSize": "56px",
        "fontWeight": "bold",
        "maxLines": "1",
        "lineHeight": "62.160000000000004px",
        "textStyle": "fill",
        "textDecoration": "none",
        "fontFamily": "",
        "textAlign": "center"
      }
    }]
  }
  homeCard() {
    let tpl = {
      "width": "656px",
      "height": "864px",
      "background": "#F8F8F8",
      "views": [
        {
          "type": "text",
          "text":  `${this.headTit?this.headTit:"超值好货·近在咫尺"}`,
          "css": {
            "color": "#CBAD7E",
            "background": "",
            "width": "656px",
            "height": "63.279999999999994px",
            "top": "32px",
            "left": "0px",
            "rotate": "0",
            "borderRadius": "",
            "borderWidth": "",
            "borderColor": "",
            "shadow": "",
            "padding": "0px",
            "fontSize": "56px",
            "fontWeight": "bold",
            "maxLines": "1",
            "lineHeight": "62.160000000000004px",
            "textStyle": "fill",
            "textDecoration": "none",
            "fontFamily": "",
            "textAlign": "center"
          }
        },
        {
          "type": "image",
          
          "url": `${this.homeImg?this.homeImg:"https://shgm.jjyyx.com/m/images/share/shareHome.jpg"}`,
          // "url": "",
          "css": {
            "width": "588px",
            "height": "474px",
            "top": "127px",
            "left": "34px",
            "rotate": "0",
            "borderRadius": "24px",
            "borderWidth": "2px",
            "borderColor": "#ffffff",
            "shadow": "",
            "mode": "scaleToFill"
          }
        },
        {
          "type": "image",
          "url":`${this.qrCode}`,
          "css": {
            "color": "#000000",
            "background": "rgba(0,0,0,0)",
            "width": "176px",
            "height": "176px",
            "top": "624px",
            "left": "74px",
            "rotate": "0",
            "borderRadius": "80px"
          }
        },
        {
          "type": "text",
          "text": "长按识别二维码",
          "css": {
            "color": "#0C0C21",
            "background": "rgba(0,0,0,0)",
            "width": "244px",
            "height": "33.9px",
            "top": "656px",
            "left": "282px",
            "rotate": "0",
            "borderRadius": "",
            "borderWidth": "",
            "borderColor": "#000000",
            "shadow": "",
            "padding": "0px",
            "fontSize": "30px",
            "fontWeight": "400",
            "maxLines": "1",
            "lineHeight": "33.300000000000004px",
            "textStyle": "fill",
            "textDecoration": "none",
            "fontFamily": "",
            "textAlign": "left"
          }
        },
        {
          "type": "text",
          "text": "立即抢购 立享实惠",
          "css": {
            "color": "#000000",
            "background": "rgba(0,0,0,0)",
            "width": "318px",
            "height": "51.480000000000004px",
            "top": "704px",
            "left": "282px",
            "rotate": "0",
            "borderRadius": "",
            "borderWidth": "",
            "borderColor": "#000000",
            "shadow": "",
            "padding": "0px",
            "fontSize": "36px",
            "fontWeight": "bold",
            "maxLines": "2",
            "lineHeight": "51.94800000000001px",
            "textStyle": "fill",
            "textDecoration": "none",
            "fontFamily": "",
            "textAlign": "left"
          }
        }
      ]
    }
    return tpl
  }
  listCard() {
    let list = this.list;
    let len = list.length; // 624
    let tpl = {
      "width": "656px",
      "height": `${len*208+422}px`, // 1120px
      "background": "#CBAD7E",
      "views": [
        {
          "type": "text",
          "text":titStr(this.proType),
          "css": {
            "color": "#ffffff",
            "background": "",
            "width": "656px",
            "height": "34px",
            "top": "104px",
            "left": "0px",
            "rotate": "0",
            "borderRadius": "",
            "borderWidth": "",
            "borderColor": "",
            "shadow": "",
            "padding": "0px",
            "fontSize": "30px",
            "fontWeight": "normal",
            "maxLines": "1",
            "lineHeight": "34px",
            "textStyle": "fill",
            "textDecoration": "none",
            "fontFamily": "",
            "textAlign": "center"
          }
        },
        {
          "type": "rect",
          "css": {
            "background": "#ffffff",
            "width": "624px",
            "height": `${len*208+48}px`, // 672px
            "top": "160px",
            "left": "16px",
            "rotate": "0",
            "borderRadius": "24px",
            "shadow": "",
            "color": "#ffffff"
          }
        }
      ]
    }
    for (let i =0; i<len; i++){
      let item = list[i]
      let {goodsPrimePrice, goodsPrice} = item;
      let price ='';
      if (goodsPrimePrice > 0 && goodsPrimePrice !=goodsPrice) { 
        price = goodsPrimePrice
      }
      let boxTop = i*208
      let goodsTpl = [{
        "type": "image",
        "url": `${item.coverImage?item.coverImage.replace("http://","https://"):'https://shgm.jjyyx.com/m/images/detail_goods_s.png'}`,
        "css": {
          "width": "192px",
          "height": "192px",
          "top": `${boxTop+192}px`,
          "left": "32px",
          "rotate": "0",
          "borderRadius": "16px",
          "borderWidth": "",
          "borderColor": "#000000",
          "shadow": "",
          "mode": "scaleToFill"
        }
      },
      {
        "type": "text",
        "text": `${item.shortTitle || item.goodsName|| ''}`,
        "css": {
          "color": "#0C0C21",
          "background": "rgba(0,0,0,0)",
          "width": "377px",
          "height": "33.9px",
          "top": `${boxTop+198}px`,
          "left": "240px",
          "rotate": "0",
          "borderRadius": "",
          "borderWidth": "",
          "borderColor": "#000000",
          "shadow": "",
          "padding": "0px",
          "fontSize": "30px",
          "fontWeight": "none",
          "maxLines": "1",
          "lineHeight": "33.300000000000004px",
          "textStyle": "fill",
          "textDecoration": "none",
          "fontFamily": "",
          "textAlign": "left"
        }
      },
      {
        "type": "text",
        "text": `${item.goodsTag}`,
        "css": {
          "color": "#9E9EA6",
          "background": "rgba(0,0,0,0)",
          "width": "378px",
          "height": "27.119999999999997px",
          "top": `${boxTop+240}px`,
          "left": "240px",
          "rotate": "0",
          "borderRadius": "",
          "borderWidth": "",
          "borderColor": "#000000",
          "shadow": "",
          "padding": "0px",
          "fontSize": "24px",
          "fontWeight": "400",
          "maxLines": "1",
          "lineHeight": "26.64px",
          "textStyle": "fill",
          "textDecoration": "none",
          "fontFamily": "",
          "textAlign": "left"
        }
      },
      {
        "type": "rect",
        "css": {
          "background": "#ffffff",
          "width": "96px",
          "height": "32px",
          "top": `${boxTop+297}px`,
          "left": "242px",
          "rotate": "0",
          "borderWidth": "1px",
          "borderColor": "#EC414D",
          "borderRadius": "16px",
          "shadow": "",
          "color": "#ffffff"
        }
      },
      {
        "type": "text",
        "text": proTypeStr(this.proType),
        "css": {
          "color": "#EC414D",
          "background": "rgba(0,0,0,0)",
          "width": "96px",
          "height": "32px",
          "top": `${boxTop+297}px`,
          "left": "242px",
          "rotate": "0",
          "borderRadius": "",
          "borderWidth": "",
          "borderColor": "",
          "shadow": "",
          "padding": "4px 0",
          "fontSize": "24px",
          "fontWeight": "none",
          "maxLines": "1",
          "lineHeight": "32px",
          "textStyle": "fill",
          "textDecoration": "none",
          "fontFamily": "",
          "textAlign": "center"
        }
      },
      {
        "type": "text",
        "text": `¥ ${item.goodsPrimePrice}`,
        "css": {
          "color": "#6E6D79",
          "background": "rgba(0,0,0,0)",
          "width": "107px",
          "height": "27.119999999999997px",
          "top": `${boxTop+345}px`,
          "left": "367px",
          "rotate": "0",
          "borderRadius": "",
          "borderWidth": "",
          "borderColor": "",
          "shadow": "",
          "padding": "0px",
          "fontSize": "24px",
          "fontWeight": "400",
          "maxLines": "1",
          "lineHeight": "26.64px",
          "textStyle": "fill",
          "textDecoration": "line-through",
          "fontFamily": "",
          "textAlign": "left"
        }
      },
      {
        "type": "text",
        "text": `¥ ${item.goodsPrice}`,
        "css": {
          "color": "#EC414D",
          "background": "rgba(0,0,0,0)",
          "width": "139.99999999999997px",
          "height": "45.199999999999996px",
          "top": `${boxTop+331}px`,
          "left": "241px",
          "rotate": "0",
          "borderRadius": "",
          "borderWidth": "",
          "borderColor": "",
          "shadow": "",
          "padding": "0px",
          "fontSize": "40px",
          "fontWeight": "bold",
          "maxLines": "1",
          "lineHeight": "44.400000000000006px",
          "textStyle": "fill",
          "textDecoration": "none",
          "fontFamily": "",
          "textAlign": "left"
        }
      },
      {
        "type": "rect",
        "css": {
          "background": "#EC414D",
          "width": "104px",
          "height": "40px",
          "top": `${boxTop+339}px`,
          "left": "521px",
          "rotate": "0",
          "borderWidth": "",
          "borderColor": "",
          "borderRadius": "20px",
          "shadow": "",
          "color": "#EC414D"
        }
      },
      {
        "type": "text",
        "text":btnStr(this.proType) ,
        "css": {
          "color": "#ffffff",
          "background": "rgba(0,0,0,0)",
          "width": "104px",
          "height": "24px",
          "top": `${boxTop+342}px`,
          "left": "521px",
          "rotate": "0",
          "borderRadius": "20px",
          "borderWidth": "",
          "borderColor": "",
          "shadow": "",
          "padding": "0px",
          "fontSize": "24px",
          "fontWeight": "400",
          "maxLines": "1",
          "lineHeight": "24px",
          "textStyle": "fill",
          "textDecoration": "none",
          "fontFamily": "",
          "textAlign": "center"
        }
      }]
      tpl.views = tpl.views.concat(goodsTpl)
    }
    let ftpl = [

      {
        "type": "rect",
        "css": {
          "background": "#ffffff",
          "width": "180px",
          "height": "180px",
          "top": `${len*208+222}px`,
          "left": "72px",
          "rotate": "",
          "borderWidth": "",
          "borderColor": "",
          "borderRadius": "90px",
          "shadow": "",
          "color": "#ffffff"
        }
      },
      {
        "type": "image",
        "url": `${this.qrCode}`,
        "css": {
          "width": "176px",
          "height": "176px",
          "top": `${len*208+224}px`, // 928px
          "left": "74px",
          "rotate": "0",
          "borderRadius": "88px",
          "borderWidth": "",
          "borderColor": "",
          "shadow": "",
          "mode": "scaleToFill"
        }
      },
      {
        "type": "text",
        "text": "长按识别二维码",
        "css": {
          "color": "#ffffff",
          "background": "",
          "width": "274px",
          "height": "33.9px",
          "top": `${len*208+256}px`,// 960px 
          "left": "280px",
          "rotate": "0",
          "borderRadius": "",
          "borderWidth": "",
          "borderColor": "",
          "shadow": "",
          "padding": "0px",
          "fontSize": "30px",
          "fontWeight": "400",
          "maxLines": "1",
          "lineHeight": "33.300000000000004px",
          "textStyle": "fill",
          "textDecoration": "none",
          "fontFamily": "",
          "textAlign": "left"
        }
      },
      {
        "type": "text",
        "text": "立即抢购 立享实惠",
        "css": {
          "color": "#ffffff",
          "background": "",
          "width": "339px",
          "height": "40.67999999999999px",
          "top": `${len*208+304}px`, // 1008px
          "left": "280px",
          "rotate": "0",
          "borderRadius": "",
          "borderWidth": "",
          "borderColor": "",
          "shadow": "",
          "padding": "0px",
          "fontSize": "36px",
          "fontWeight": "bold",
          "maxLines": "1",
          "lineHeight": "39.96px",
          "textStyle": "fill",
          "textDecoration": "none",
          "fontFamily": "",
          "textAlign": "left"
        }
      }]
    tpl.views = tpl.views.concat(ftpl)
    tpl.views = this.headTpl.concat(tpl.views)
    return tpl
  }
  singleCard() {
    let {goodsPrimePrice, goodsPrice} = this.list[0];
    let price ='';
    if (goodsPrimePrice > 0 && goodsPrimePrice !=goodsPrice) { 
      price = goodsPrimePrice
    }

    let tpl = {
      "width": "656px",
      "height": "1039px",
      "background": "#CBAD7E",
      "views": [
        {
          "type": "rect",
          "css": {
            "background": "#ffffff",
            "width": "624px",
            "height": "896px",
            "top": "127px",
            "left": "16px",
            "rotate": "0",
            "borderRadius": "24px",
            "shadow": "",
            "color": "#ffffff"
          }
        },
        {
          "type": "image",
          "url": `${this.list[0].coverImage?this.list[0].coverImage.replace("http://","https://"):'https://shgm.jjyyx.com/m/images/detail_goods_s.png'}`,
          "css": {
            "width": "592px",
            "height": "592px",
            "top": "159px",
            "left": "32px",
            "rotate": "0",
            "borderRadius": "16px",
            "borderWidth": "16px",
            "borderColor": "#ffffff",
            "shadow": "",
            "mode": "scaleToFill"
          }
        },
        {
          "type": "text",
          "text": `${this.list[0].shortTitle || this.list[0].goodsName|| ''}`,
          "css": {
            "color": "#000000",
            "background": "rgba(0,0,0,0)",
            "width": "390px",
            "height": "86.96999999999998px",
            "top": "783px",
            "left": "32px",
            "rotate": "0",
            "borderRadius": "",
            "borderWidth": "",
            "borderColor": "#0C0C21",
            "shadow": "",
            "padding": "0px",
            "fontSize": "30px",
            "fontWeight": "bold",
            "maxLines": "2",
            "lineHeight": "43.290000000000006px",
            "textStyle": "fill",
            "textDecoration": "none",
            "fontFamily": "",
            "textAlign": "left"
          }
        },
        {
          "type": "rect",
          "css": {
            "background": "#EC414D",
            "width": "112px",
            "height": "48px",
            "top": "880px",
            "left": "32px",
            "rotate": "0",
            "borderRadius": "24px",
            "shadow": "",
            "color": "#EC414D"
          }
        },
        {
          "type": "text",
          "text": proTypeStr(this.list[0].proType, this.list[0].groupMode || 0),
          "css": {
            "color": "#ffffff",
            "background": "",
            "width": "112px",
            "height": "48px",
            "top": "883px",
            "left": "32px",
            "rotate": "0",
            "borderRadius": "24px",
            "borderWidth": "",
            "borderColor": "#0C0C21",
            "shadow": "",
            "padding": "0",
            "fontSize": "30px",
            "fontWeight": "400",
            "maxLines": "1",
            "lineHeight": "48px",
            "textStyle": "fill",
            "textDecoration": "none",
            "fontFamily": "",
            "textAlign": "center"
          }
        },
        {
          "type": "text",
          "text": goodsPrice?`¥${goodsPrice}`:'',
          "css": {
            "color": "#EC414D",
            "background": "rgba(0,0,0,0)",
            "width": "200px",
            "height": "63.279999999999994px",
            "top": "928px",
            "left": "32px",
            "rotate": "0",
            "borderRadius": "",
            "borderWidth": "",
            "borderColor": "#0C0C21",
            "shadow": "",
            "padding": "0px",
            "fontSize": "56px",
            "fontWeight": "normal",
            "maxLines": "1",
            "lineHeight": "62.160000000000004px",
            "textStyle": "fill",
            "textDecoration": "none",
            "fontFamily": "",
            "textAlign": "left"
          }
        },
        {
          "type": "text",
          "text": price?`¥${price}`:'',
          "css": {
            "color": "#6E6D79",
            "background": "rgba(0,0,0,0)",
            "width": "80px",
            "height": "27.119999999999997px",
            "top": "956px",
            "left": getStringLength('¥'+goodsPrice, 56) +`px`,
            "rotate": "0",
            "borderRadius": "",
            "borderWidth": "",
            "borderColor": "#0C0C21",
            "shadow": "",
            "padding": "0px",
            "fontSize": "24px",
            "fontWeight": "normal",
            "maxLines": "1",
            "lineHeight": "26.64px",
            "textStyle": "fill",
            "textDecoration": "line-through",
            "fontFamily": "",
            "textAlign": "left"
          }
        },
        {
          "type": "image",
          "url": `${this.qrCode}`,
          "css": {
            "width": "160px",
            "height": "160px",
            "top": "767px",
            "left": "460px",
            "rotate": "0",
            "borderRadius": "80px"
          }
        },
        {
          "type": "text",
          "text": "长按识别二维码 立享实惠",
          "css": {
            "color": "#6E6D79",
            "background": "rgba(0,0,0,0)",
            "width": "170px",
            "height": "56px",
            "top": "927px",
            "left": "457px",
            "rotate": "0",
            "borderRadius": "",
            "borderWidth": "",
            "borderColor": "#0C0C21",
            "shadow": "",
            "padding": "0px",
            "fontSize": "24px",
            "fontWeight": "400",
            "maxLines": "2",
            "lineHeight": "28px",
            "textStyle": "fill",
            "textDecoration": "none",
            "fontFamily": "",
            "textAlign": "center"
          }
        }
      ]
    };
    tpl.views = this.headTpl.concat(tpl.views)
    return tpl
    
  }
}
