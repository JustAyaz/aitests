const { createApp } = Vue;
createApp({
  data() {
    return {
      week: WEEK,
      prevWeek: PREV_WEEK,
      nextWeek: NEXT_WEEK,
      slots: [],
      activeSlot: null
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
  methods: {
    formatDay(d) {
      return new Date(d).toLocaleDateString(undefined,{weekday:'short',day:'numeric'});
    },
    formatTime(t) {
      return new Date(t).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false});
    },
    findSlot(day, time) {
      const dt = new Date(day.getFullYear(), day.getMonth(), day.getDate(), time.getHours(), time.getMinutes());
      return this.slots.find(s => new Date(s.time).getTime() === dt.getTime());
    },
    loadSlots() {
      fetch(`/api/slots?week=${this.week}`)
        .then(r=>r.json())
        .then(data=>{ this.slots = data; });
    },

    openSlot(slot) {
      if(!slot) return;
      this.activeSlot = slot;
      new bootstrap.Modal(document.getElementById('slotModal')).show();
    },
    toggleSlot(slot) {
      if(!slot) return;
      fetch(`/slots/${slot.id}/toggle`, {method:'POST'})
        .then(()=>this.loadSlots());
    },
    cellStyle(slot) {
      if(!slot) return {};
      const max = 5;
      const intensity = Math.min(slot.count, max)/max;
      return {backgroundColor:`rgba(0,123,255,${0.2+intensity*0.6})`};
    },
    selected(slot) {
      return slot && slot.selected;
    }
  },
  watch: {
    slots() {
      if(this.activeSlot) {
        const updated = this.slots.find(s=>s.id===this.activeSlot.id);
        if(updated) this.activeSlot = updated;
      }
    }
  }
}).mount('#calendar-app');
