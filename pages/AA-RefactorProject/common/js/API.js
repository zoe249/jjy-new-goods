let EVN_CONFIG = require('../../../../env/index');
let WORK_TYPE = require('../../../../env/worktype');
const DISTRIBUTE_ENVIROMENT = WORK_TYPE.DISTRIBUTE_ENVIROMENT;

let {
	URL_PREFIX,
	URL_ZB_PREFIX,
	URL_BI_PRO,
	URL_PRIZE_PREFIX,
	URL_DATA_PREFIX
} = EVN_CONFIG[DISTRIBUTE_ENVIROMENT];

/****************新版接口地址****************/
//定位取附近的优鲜门店或者社团
const URL_YX_SHOPLOCATION = `${URL_PREFIX}/location/shopQueryByLocation/V2`;




/****************测试数据接口地址  后期删除****************/
/* 优鲜首页板块数据，旧版接口测试用*/
const URL_YX_SY_CeShi = `${URL_PREFIX}/recommend/list`;
export{
    URL_YX_SHOPLOCATION,
    URL_YX_SY_CeShi,
}
