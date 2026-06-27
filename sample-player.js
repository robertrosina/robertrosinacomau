(function () {
  let currentAudio = null;
  let currentButton = null;
  function resetButton(button) {
    if (button) button.textContent = '▶';
  }
  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    resetButton(currentButton);
    currentAudio = null;
    currentButton = null;
  }
  document.addEventListener('click', function (event) {
    const button = event.target.closest('[data-sample-src]');
    if (!button) return;
    const src = button.getAttribute('data-sample-src');
    if (currentButton === button && currentAudio && !currentAudio.paused) {
      stopAudio();
      return;
    }
    stopAudio();
    currentAudio = new Audio(src);
    currentButton = button;
    button.textContent = 'Ⅱ';
    currentAudio.addEventListener('ended', stopAudio);
    currentAudio.addEventListener('error', function () {
      button.textContent = 'Missing';
      currentAudio = null;
      currentButton = null;
    });
    currentAudio.play().catch(function () {
      button.textContent = 'Play';
    });
  });
})();
