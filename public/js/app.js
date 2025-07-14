function refresh() {
  fetch('/api/slots?week=' + WEEK).then(r => r.json()).then(data => {
    data.forEach(slot => {
      var cell = document.querySelector('[data-slot-id="' + slot.id + '"]');
      if (!cell) return;
      cell.querySelector('.count').textContent = slot.count;
      cell.querySelector('.users').textContent = slot.users.join(', ');
      if (slot.count > 1) cell.style.backgroundColor = '#ffeb3b';
      else cell.style.backgroundColor = '';
    });
  });
}
setInterval(refresh, 5000);
