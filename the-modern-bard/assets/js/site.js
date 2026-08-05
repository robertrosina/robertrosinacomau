
const header=document.querySelector('[data-header]');const toggle=document.querySelector('.menu-toggle');const mobile=document.querySelector('.mobile-menu');if(toggle){toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));toggle.setAttribute('aria-label',open?'Open menu':'Close menu');mobile.classList.toggle('open',!open);header.classList.toggle('menu-open',!open);document.body.style.overflow=open?'':'hidden'});}document.querySelectorAll('.nav-folder>button').forEach(btn=>{btn.addEventListener('click',()=>{const p=btn.parentElement;p.classList.toggle('open');btn.setAttribute('aria-expanded',String(p.classList.contains('open')));});});const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.08});document.querySelectorAll('.fade-up').forEach(el=>io.observe(el));


// Linked repertoire excerpt buttons. Buttons on each page share one player so only one excerpt plays at a time.
(() => {
  const buttons = [...document.querySelectorAll('.song-play[data-audio]')];
  if (!buttons.length) return;
  const player = new Audio();
  let activeButton = null;

  const reset = () => {
    if (activeButton) activeButton.classList.remove('is-playing');
    activeButton = null;
  };

  buttons.forEach((button) => {
    button.addEventListener('click', async () => {
      const source = button.dataset.audio;
      if (activeButton === button && !player.paused) {
        player.pause();
        reset();
        return;
      }
      if (activeButton) activeButton.classList.remove('is-playing');
      activeButton = button;
      button.classList.add('is-playing');
      if (!player.src.endsWith(source)) player.src = source;
      try {
        await player.play();
      } catch (error) {
        reset();
        console.warn('The audio excerpt could not be played.', error);
      }
    });
  });
  player.addEventListener('ended', reset);
  player.addEventListener('pause', () => {
    if (player.currentTime > 0 && player.currentTime < player.duration) reset();
  });
})();


// Live repertoire filters.
(() => {
  const filters = [...document.querySelectorAll('.filter-button[data-filter]')];
  const songs = [...document.querySelectorAll('.filterable-song-groups li[data-categories]')];
  const count = document.querySelector('[data-song-count]');
  if (!filters.length || !songs.length) return;
  filters.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filters.forEach((item) => item.classList.toggle('active', item === button));
      let visible = 0;
      songs.forEach((song) => {
        const categories = (song.dataset.categories || '').split(/\s+/);
        const show = filter === 'all' || categories.includes(filter);
        song.hidden = !show;
        if (show) visible += 1;
      });
      if (count) count.textContent = String(visible);
    });
  });
})();
