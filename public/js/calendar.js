const { createApp } = Vue;
createApp({
  data() {
    return {
      week: WEEK,
      prevWeek: PREV_WEEK,
      nextWeek: NEXT_WEEK,
      slots: [],
      ruleMode: false,
      ruleText: '',
      selectedForRule: []
    };
  },
  computed: {
    days() {
      const start = new Date(this.week);
      start.setHours(0,0,0,0);
      return Array.from({length:7}, (_,i)=>new Date(start.getTime()+i*86400000));
    },
    times() {
      const start = new Date(this.week);
      start.setHours(8,0,0,0);
      return Array.from({length:20}, (_,i)=>new Date(start.getTime()+i*1800000));
    }
  },
  mounted() {
    this.loadSlots();
    setInterval(this.loadSlots, 5000);
  },
  updated() {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
      new bootstrap.Tooltip(el);
    });
  },
  methods: {
    formatDay(d) {
      return new Date(d).toLocaleDateString(undefined,{weekday:'short',day:'numeric'});
    },
    formatTime(t) {
      return new Date(t).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false});
    },
    findSlot(day,time) {
      const dt = new Date(day.getFullYear(), day.getMonth(), day.getDate(), time.getHours(), time.getMinutes());
      return this.slots.find(s => new Date(s.time).getTime() === dt.getTime());
    },
    loadSlots() {
      fetch(`/api/slots?week=${this.week}`)
        .then(r=>r.json())
        .then(data=>{ this.slots = data; });
    },
    onSlotClick(slot) {
      if(!slot) return;
      if(this.ruleMode) {
        const idx = this.selectedForRule.indexOf(slot.id);
        if(idx>=0) this.selectedForRule.splice(idx,1);
        else this.selectedForRule.push(slot.id);
      } else {
        this.toggleSlot(slot);
      }
    },
    toggleSlot(slot) {
      fetch(`/slots/${slot.id}/toggle`, {method:'POST'})
        .then(()=>this.loadSlots());
    },
    applyRule() {
      if(!this.selectedForRule.length) return;
      fetch('/slots/set_rule', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({slot_ids:this.selectedForRule, note:this.ruleText})
      }).then(()=>{
        this.ruleMode=false;
        this.selectedForRule=[];
        this.ruleText='';
        this.loadSlots();
      });
    },
    cellStyle(slot) {
      if(!slot) return {};
      if(slot.note) return {backgroundColor:'#d4edda'};
      const max = 5;
      const intensity = Math.min(slot.count, max)/max;
      return {backgroundColor:`rgba(0,123,255,${0.2+intensity*0.6})`};
    },
    slotTitle(slot) {
      return slot && slot.users.length ? slot.users.join(', ') : '';
    },
    slotClasses(slot) {
      return { 'rule-select': this.selectedForRule.includes(slot?.id) };
    }
  }
}).mount('#calendar-app');
