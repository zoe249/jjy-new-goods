// component/arborDayTagBtn/arborDayTagBtn.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        tabBtnObj:{
            type: Object,
            detail: {}
          },
          indexTag:{
              type:Number,
              detail:0
          }

    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {
        handleTagClick:function handleTagClick(e)
        {
           
            let {index} = e.currentTarget.dataset;
            this.triggerEvent('TagClick', { choiceIndex: index,});
        }

    }
})
