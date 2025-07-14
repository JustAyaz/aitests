function refresh() {
  fetch('/api/slots').then(r => r.json()).then(data => {
    data.forEach(slot => {
      var row = document.querySelector('tr[data-id="' + slot.id + '"]');
      if (!row) return;
      row.querySelector('.count').textContent = slot.count;
      row.querySelector('.users').textContent = slot.users.join(', ');
      if (slot.count > 1) row.style.backgroundColor = '#ffeb3b';
      else row.style.backgroundColor = '';
    });
  });
}
setInterval(refresh, 5000);
