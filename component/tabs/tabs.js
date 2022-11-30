// components/tabs/tabs.js
Component({
  options: {
    addGlobalClass: true,
    pureDataPattern: /^_/,
    multipleSlots: true
  },
  properties: {
    tabs: { type: Array, value: [] },
    partClass: {type: String, value: ''}, // 区域特指class
    isFlex: {type: Boolean, value: false},  //flex 平分布局
    isSticky: {type: Boolean, value: false},
    setTitle: {type: String, value: ''},
    tabClass: { type: String, value: '' },
    activeClass: { type: String, value: '' },
    tabUnderlineColor: { type: String, value: '' },
    tabActiveTextColor: { type: String, value: '#0F3F69' },
    tabInactiveTextColor: { type: String, value: '' },
    tabBackgroundColor: { type: String, value: '' },
    activeTab: { type: Number, value: 0 },
    duration: { type: Number, value: 500 },
    notTrigger: {type: Boolean, value: false},
  },
  data: {
    currentView: 0
  },
  observers: {
    activeTab: function activeTab(_activeTab) {
      let notTrigger = this.data.notTrigger;
      if (!notTrigger){
        var len = this.data.tabs.length;
        if (len === 0) return;
        var currentView = _activeTab - 1;
        if (currentView < 0) currentView = 0;
        if (currentView > len - 1) currentView = len - 1;
        this.setData({ currentView: currentView });
      };
    }
  },
  lifetimes: {
    created: function created() { }
  },
  methods: {
    handleTabClick: function handleTabClick(e) {
      let {index, item} = e.currentTarget.dataset;
      let notTrigger = this.data.notTrigger;
      if (!notTrigger){
        this.setData({ activeTab: index });
      }
      this.triggerEvent('tabclick', { index: index, item:item });
    },
  }
})
