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
      extra: 0,
      dayView: null,
      infoSlot: null
    };
  },
  computed: {
    days() {
      const start = new Date(this.week);
      start.setHours(0,0,0,0);
      return Array.from({length:28}, (_,i)=>new Date(start.getTime()+i*86400000));
    },
    weeks() {
      const arr = [];
      for (let i = 0; i < 4; i++) {
        arr.push(this.days.slice(i * 7, i * 7 + 7));
      }
      return arr;
    },
    weekdayNames() {
      const start = new Date(this.week);
      start.setHours(0,0,0,0);
      const opts = { weekday: 'short' };
      return Array.from({length:7}, (_,i)=>{
        const d = new Date(start.getTime()+i*86400000);
        return d.toLocaleDateString(undefined, opts);
      });
    },
    times() {
      const start = new Date(this.week);
      start.setHours(15,0,0,0);
      return Array.from({length:19}, (_,i)=>new Date(start.getTime()+i*1800000));
    },
    monthLabel() {
      const start = new Date(this.week);
      const end = new Date(start.getTime()+27*86400000);
      const opt = {month:'long', year:'numeric'};
      return `${start.toLocaleDateString(undefined,opt)} - ${end.toLocaleDateString(undefined,opt)}`;
    },
    slotsByDay() {
      const map={};
      this.days.forEach((_,i)=>map[i]=[]);
      this.slots.forEach(s=>{
        const d=new Date(s.time);
        const idx=Math.floor((d-this.getStartOfWeek())/86400000);
        if(map[idx] !== undefined) map[idx].push(s);
      });
      return map;
    },
    maxPerDay() {
      return this.days.map((_,i)=>{
        let max=0; let note=false;
        (this.slotsByDay[i]||[]).forEach(s=>{
          if(s.count>max) max=s.count;
          if(s.note) note=true;
        });
        return {max, note};
      });
    },
    infoUsers() {
      return this.infoSlot ? this.infoSlot.users : [];
    }
  },
  mounted() {
    this.loadSlots();
    setInterval(this.loadSlots, 5000);
  },
  updated() {
    const bar = document.getElementById('rule-bar');
    if(bar) {
      const style = this.ruleBarStyle();
      Object.assign(bar.style, style);
    }
  },
  methods: {
    getStartOfWeek(){
      const d=new Date(this.week); d.setHours(0,0,0,0); return d.getTime();
    },
    formatDay(d) {
      return new Date(d).toLocaleDateString(undefined,{day:'numeric',month:'numeric',weekday:'short'});
    },
    formatDayFull(d) {
      return new Date(d).toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'numeric'});
    },
    formatTime(t) {
      const start = new Date(t);
      const end = new Date(t.getTime()+30*60*1000);
      const opts = {hour:'2-digit', minute:'2-digit', hour12:false};
      const startStr = start.toLocaleTimeString([],opts);
      if(startStr === '00:00') return '00:00+';
      return `${startStr}-${end.toLocaleTimeString([],opts)}`;
    },
    findSlot(day,time) {
      const d = new Date(day);
      d.setHours(time.getHours(), time.getMinutes(), 0, 0);
      if(time.getDate() !== day.getDate()) {
        d.setDate(d.getDate() + 1);
      }
      return this.slots.find(s => new Date(s.time).getTime() === d.getTime());
    },
    findSlotByIndex(dayIndex,time){
      const day=this.days[dayIndex];
      return this.findSlot(day,time);
    },
    loadSlots() {
      fetch(`/api/slots?week=${this.week}`)
        .then(r=>r.json())
        .then(data=>{
          this.slots = data;
          if(this.infoSlot){
            const updated = this.slots.find(s=>s.id===this.infoSlot.id);
            if(updated) this.infoSlot = updated;
          }
        });
    },
    onSlotClick(slot, event) {
      if(!slot) return;
      if(this.ruleMode) {
        const idx = this.selectedForRule.indexOf(slot.id);
        if(idx>=0) this.selectedForRule.splice(idx,1);
        else this.selectedForRule.push(slot.id);
        if(event) {
          const rect = event.currentTarget.getBoundingClientRect();
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
    dayStyle(info){
      if(!info) return {};
      if(info.note) return {backgroundColor:'#8fbc8f'};
      const max=5;
      const intensity=Math.min(info.max,max)/max;
      return {backgroundColor:`rgba(0,123,255,${0.2+intensity*0.6})`};
    },
    openDay(i){
      this.dayView=i;
    },
    closeDay(){
      this.dayView=null;
      this.ruleMode=false;
      this.selectedForRule=[];
      this.ruleText='';
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
      if(slot.note) return {backgroundColor:'#8fbc8f'};
      const max = 5;
      const intensity = Math.min(slot.count, max)/max;
      return {backgroundColor:`rgba(0,123,255,${0.2+intensity*0.6})`};
    },
    slotTitle(slot) {
      return slot && slot.users.length ? slot.users.join(', ') : '';
    },
    slotClasses(slot) {
      return {
        'rule-select': this.selectedForRule.includes(slot?.id),
        'has-note': !!slot?.note
      };
    },
    ruleBarStyle() {
      return {
        display: this.ruleMode && this.selectedForRule.length ? 'flex' : 'none',
        top: this.ruleBarPos.top + 'px',
        left: this.ruleBarPos.left + 'px'
      };
    },
    showInfo(slot){
      this.infoSlot = slot;
      const modal = new bootstrap.Modal(document.getElementById('infoModal'));
      modal.show();
    }
  }
}).mount('#calendar-app');
