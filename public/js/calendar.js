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
      selectedForRule: [],
      ruleBarPos: {top: 0, left: 0},
      extra: 0
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
    },
    monthLabel() {
      const d = new Date(this.week);
      return d.toLocaleDateString(undefined,{month:'long', year:'numeric'});
    },
    selectedAvg() {
      if(!this.selectedForRule.length) return 0;
      let sum = 0;
      this.selectedForRule.forEach(id => {
        const s = this.slots.find(sl=>sl.id===id);
        if(s) sum += s.count;
      });
      return Math.round(sum/this.selectedForRule.length);
    }
  },
  mounted() {
    this.loadSlots();
    setInterval(this.loadSlots, 5000);
  },
  updated() {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
      bootstrap.Tooltip.getInstance(el)?.dispose();
      new bootstrap.Tooltip(el, {trigger:'hover'});
    });
    const bar = document.getElementById('rule-bar');
    if(bar) {
      const style = this.ruleBarStyle();
      Object.assign(bar.style, style);
    }
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
    onSlotClick(slot, event) {
      if(!slot) return;
      if(this.ruleMode) {
        const idx = this.selectedForRule.indexOf(slot.id);
        if(idx>=0) this.selectedForRule.splice(idx,1);
        else this.selectedForRule.push(slot.id);
        if(event) {
          const rect = event.target.getBoundingClientRect();
          this.ruleBarPos = {top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX};
        }
      } else {
        this.toggleSlot(slot);
      }
    },
    toggleSlot(slot) {
      fetch(`/slots/${slot.id}/toggle`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({extra:this.extra})
      })
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
        this.ruleBarPos={top:0,left:0};
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
    },
    ruleBarStyle() {
      return {
        display: this.ruleMode && this.selectedForRule.length ? 'flex' : 'none',
        top: this.ruleBarPos.top + 'px',
        left: this.ruleBarPos.left + 'px'
      };
    }
  }
}).mount('#calendar-app');
