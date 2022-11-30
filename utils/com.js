/**
 * 获取url
 * @param type 
   不传值:当前页面对象,
   url:获取url,
   arg：获取url参数对象,
   argStr:参数带问号字符串，
   ua：获取url+arg,
 */
export const getCurrentPageCustom = function(type) {
  type = type?type:'page'
  return new Promise((resovle) => {
    let pages = getCurrentPages() //获取加载的页面
    let page = pages[pages.length - 1] //获取当前页面的对象
    switch(type){
      case 'ua':
        resovle(page.route+`?`+parse(page.options))
        break
      case 'url':
        resovle(page.route)
        break
      case 'arg':
        resovle(page.options)
        break
      case 'argStr':
        resovle(`?`+parse(page.options))
        break
      default:
        resovle(page)
    }
    function parse(data) {
      let arr = [];
      for (let key in data) {
        arr.push(key + '=' + data[key]);
      }
      return arr.join('&');
    } 
  })
}
/**
 * 验证是否弹窗入账微信卡包
 */
export const validSendCoupon = function (obj){
  if (obj && obj.sign) {
    return true
  } else {
    false
  }
}