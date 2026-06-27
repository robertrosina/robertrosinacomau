
(function () {
  const songs = window.REPERTOIRE_SONGS || [];
  const listEl = document.getElementById('song-list');
  const countEl = document.getElementById('song-count');
  const searchEl = document.getElementById('song-search');
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  const selectedListEl = document.getElementById('selected-songs');
  const selectedCountEl = document.getElementById('selected-count');
  const clearBtn = document.getElementById('clear-setlist');
  const copyBtn = document.getElementById('copy-setlist');
  const emailBtn = document.getElementById('email-setlist');
  const activeFiltersEl = document.getElementById('active-filters');
  const STORAGE_KEY = 'rrm-selected-setlist';

  let activeFilter = 'All';
  let query = '';
  let selected = loadSelected();
  let currentAudio = null;
  let currentButton = null;

  function loadSelected() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch (e) {
      return [];
    }
  }

  function saveSelected() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
  }

  function matches(song) {
    const text = `${song.title} ${song.artist || ''} ${(song.tags || []).join(' ')}`.toLowerCase();
    const queryMatch = !query || text.includes(query);
    const filterMatch = activeFilter === 'All' || (activeFilter === 'Playable snippets' ? !!song.proofSnippet : (song.tags || []).includes(activeFilter));
    return queryMatch && filterMatch;
  }

  function renderSongs() {
    const visible = songs.filter(matches);
    countEl.textContent = `${visible.length} songs shown`;
    activeFiltersEl.textContent = activeFilter === 'All' ? 'Showing all songs.' : (activeFilter === 'Playable snippets' ? 'Showing songs with audio snippets.' : `Filtered by ${activeFilter}.`);
    listEl.innerHTML = visible.map(song => {
      const isSelected = selected.includes(song.id);
      const tags = (song.tags || []).slice(0, 7).map(tag => `<span>${escapeHtml(tag)}</span>`).join('');
      const playControl = song.proofSnippet && song.snippet
        ? `<button class="snippet-btn" type="button" data-src="${escapeHtml(song.snippet)}" aria-label="Play snippet for ${escapeHtml(song.title)}">▶</button>`
        : '';
      return `<article class="song-card ${song.proofSnippet ? 'has-snippet' : 'no-snippet'}" data-id="${song.id}">
        <div class="song-main">
          ${playControl}
          <div class="song-copy">
            <h3>${escapeHtml(song.title)}</h3>
            ${song.artist ? `<p class="song-artist">${escapeHtml(song.artist)}</p>` : '<p class="song-artist">&nbsp;</p>'}
            <div class="song-tags">${tags}</div>
          </div>
        </div>
        <button class="add-song-btn ${isSelected ? 'is-added' : ''}" type="button" data-add="${song.id}">${isSelected ? 'Added' : 'Add'}</button>
      </article>`;
    }).join('');
  }

  function renderSelected() {
    selectedCountEl.textContent = `${selected.length} selected`;
    if (!selected.length) {
      selectedListEl.innerHTML = '<li class="empty-setlist">Choose songs from the library.</li>';
      return;
    }
    selectedListEl.innerHTML = selected.map(id => {
      const song = songs.find(s => s.id === id);
      if (!song) return '';
      const line = song.artist ? `${song.title} — ${song.artist}` : song.title;
      return `<li><span>${escapeHtml(line)}</span><button type="button" data-remove="${song.id}" aria-label="Remove ${escapeHtml(song.title)}">×</button></li>`;
    }).join('');
  }

  function selectedText() {
    if (!selected.length) return '';
    return selected.map((id, idx) => {
      const song = songs.find(s => s.id === id);
      if (!song) return '';
      return `${idx + 1}. ${song.artist ? `${song.title} — ${song.artist}` : song.title}`;
    }).filter(Boolean).join('\n');
  }

  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    if (currentButton) currentButton.textContent = '▶';
    currentAudio = null;
    currentButton = null;
  }

  document.addEventListener('click', event => {
    const playButton = event.target.closest('.snippet-btn');
    if (playButton) {
      const src = playButton.getAttribute('data-src');
      if (currentButton === playButton && currentAudio && !currentAudio.paused) {
        stopAudio();
        return;
      }
      stopAudio();
      currentAudio = new Audio(src);
      currentButton = playButton;
      playButton.textContent = 'Ⅱ';
      currentAudio.addEventListener('ended', stopAudio);
      currentAudio.addEventListener('error', () => {
        playButton.textContent = 'Missing';
        currentAudio = null;
        currentButton = null;
      });
      currentAudio.play().catch(() => {
        playButton.textContent = 'Play';
      });
      return;
    }

    const addButton = event.target.closest('[data-add]');
    if (addButton) {
      const id = addButton.getAttribute('data-add');
      if (!selected.includes(id)) selected.push(id);
      saveSelected();
      renderSongs();
      renderSelected();
      return;
    }

    const removeButton = event.target.closest('[data-remove]');
    if (removeButton) {
      const id = removeButton.getAttribute('data-remove');
      selected = selected.filter(item => item !== id);
      saveSelected();
      renderSongs();
      renderSelected();
    }
  });

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      activeFilter = button.getAttribute('data-filter');
      filterButtons.forEach(btn => btn.classList.toggle('is-active', btn === button));
      renderSongs();
    });
  });

  searchEl.addEventListener('input', () => {
    query = searchEl.value.trim().toLowerCase();
    renderSongs();
  });

  clearBtn.addEventListener('click', () => {
    selected = [];
    saveSelected();
    renderSongs();
    renderSelected();
  });

  copyBtn.addEventListener('click', async () => {
    const text = selectedText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = 'Copied';
      setTimeout(() => { copyBtn.textContent = 'Copy list'; }, 1400);
    } catch (e) {
      const fallback = document.createElement('textarea');
      fallback.value = text;
      document.body.appendChild(fallback);
      fallback.select();
      document.execCommand('copy');
      fallback.remove();
    }
  });

  emailBtn.addEventListener('click', () => {
    const text = selectedText() || 'No songs selected yet.';
    const subject = encodeURIComponent('Setlist enquiry');
    const body = encodeURIComponent(`Hi Robert,\n\nI am interested in these songs:\n\n${text}\n\nEvent details:\nDate:\nVenue/suburb:\nOccasion:\nTiming:\n\nKind regards,`);
    window.location.href = `mailto:robertariamusic@gmail.com?subject=${subject}&body=${body}`;
  });

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[char]));
  }

  renderSongs();
  renderSelected();
})();
