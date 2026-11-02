(() => {
  const scroller = document.querySelector('.showcase .scroller');
  const prev = document.querySelector('.showcase .scroll-btn.prev');
  const next = document.querySelector('.showcase .scroll-btn.next');
  const cards = [...scroller.querySelectorAll('.card')];

  /* ---------- Pages: 1st, 3rd, 5th... card; the last one is clamped ---------- */
  const stops = () => {
    const max = scroller.scrollWidth - scroller.clientWidth;
    const list = cards.filter((_, i) => i % 2 === 0).map(c => Math.min(c.offsetLeft, max));
    return [...new Set(list)];
  };

  const go = (dir, from = scroller.scrollLeft) => {
    const s = stops();
    const target = dir > 0
      ? s.find(p => p > from + 2)
      : [...s].reverse().find(p => p < from - 2);
    if (target !== undefined) scroller.scrollTo({ left: target, behavior: 'smooth' });
  };

  /* ---------- Arrow buttons ---------- */
  const update = () => {
    const max = scroller.scrollWidth - scroller.clientWidth;
    prev.disabled = scroller.scrollLeft <= 2;
    next.disabled = scroller.scrollLeft >= max - 2;
  };
  scroller.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));

  /* ---------- Mouse drag (touch swipe and trackpads already work natively) ---------- */
  let down = false, dragged = false, startX = 0, startLeft = 0;

  scroller.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    down = true; dragged = false;
    startX = e.clientX; startLeft = scroller.scrollLeft;
  });

  window.addEventListener('mousemove', e => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (!dragged && Math.abs(dx) > 5) {
      dragged = true;
      scroller.classList.add('dragging');
    }
    if (dragged) scroller.scrollLeft = startLeft - dx;
  });

  window.addEventListener('mouseup', e => {
    if (!down) return;
    down = false;
    if (!dragged) return;
    const dx = e.clientX - startX;
    if (dx < -60) go(1, startLeft);
    else if (dx > 60) go(-1, startLeft);
    else scroller.scrollTo({ left: startLeft, behavior: 'smooth' });
    setTimeout(() => scroller.classList.remove('dragging'), 450);
  });

  // A drag must not count as a click on a card
  scroller.addEventListener('click', e => {
    if (dragged) { e.stopPropagation(); e.preventDefault(); dragged = false; }
  }, true);

  /* ---------- Popup ---------- */
  const modal = document.getElementById('showcase-modal');
  const modalImg = modal.querySelector('.modal-img');
  const modalBody = modal.querySelector('.modal-body');

  const openModal = card => {
    const img = card.querySelector('img');
    modalImg.src = img.src;
    modalImg.alt = img.alt;
    modalBody.innerHTML = card.querySelector('.card-details').innerHTML;
    modal.showModal();
  };

  cards.forEach(card => {
    card.addEventListener('click', () => openModal(card));
    card.addEventListener('keydown', e => {          // makes the div behave like a button
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card); }
    });
  });

  modal.querySelector('.modal-close').addEventListener('click', () => modal.close());
  modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
})();
