// Neon 4D Slider — improved with preloading + fallback + spinner
const imageEl = document.getElementById('slider-image');
const textEl = document.getElementById('hover-text');
const spinner = document.getElementById('spinner');

const buttons = {
  up: document.getElementById('up'),
  down: document.getElementById('down'),
  left: document.getElementById('left'),
  right: document.getElementById('right'),
};

const captions = [
  "Explore the unknown",
  "Wander through light",
  "Dreams beyond pixels",
  "Breathe in colors",
  "Where silence glows"
];

// fallback image (picsum) in case Unsplash fails repeatedly
const FALLBACK = 'https://picsum.photos/1920/1080';

// milliseconds matching CSS transition
const TRANSITION_MS = 800;

// helper: show spinner
function showSpinner() { spinner.style.display = 'block'; }
// helper: hide spinner
function hideSpinner() { spinner.style.display = 'none'; }

// safe preload + swap
function preloadAndSwap(nextUrl, direction) {
  showSpinner();
  // keep outgoing animation on the visible image
  imageEl.classList.add(`slide-${direction}`);
  textEl.style.opacity = 0;

  // preload
  const temp = new Image();
  let loaded = false;
  const timeout = setTimeout(() => {
    if (!loaded) {
      // if image taking too long, fall back to fallback image
      temp.src = FALLBACK + '?t=' + Date.now();
    }
  }, 4000); // 4s if remote is slow

  temp.onload = () => {
    loaded = true;
    clearTimeout(timeout);
    // set real src after outgoing slide completes
    setTimeout(() => {
      imageEl.src = temp.src;
      imageEl.classList.remove(`slide-${direction}`);
      // update caption and fade in
      textEl.innerText = captions[Math.floor(Math.random() * captions.length)];
      textEl.style.opacity = 1;
      hideSpinner();
    }, TRANSITION_MS);
  };

  temp.onerror = () => {
    clearTimeout(timeout);
    // try fallback immediately
    temp.src = FALLBACK + '?t=' + Date.now();
    // if fallback also errors, still swap to fallback after transition
    setTimeout(() => {
      imageEl.src = temp.src;
      imageEl.classList.remove(`slide-${direction}`);
      textEl.innerText = 'Visual unavailable';
      textEl.style.opacity = 1;
      hideSpinner();
    }, TRANSITION_MS);
  };

  // start load (with robust cache-busting)
  temp.src = `${nextUrl}?sig=${Date.now()}`;
}

// main slide function
function slide(direction) {
  // prevent rapid double clicks by ignoring if spinner active
  if (spinner.style.display === 'block') return;

  // unsplash random endpoint
  const unsplash = 'https://source.unsplash.com/random/1920x1080';
  preloadAndSwap(unsplash, direction);
}

// attach listeners
Object.keys(buttons).forEach(dir => {
  buttons[dir].addEventListener('click', () => slide(dir));
});

// keyboard arrows
document.addEventListener('keydown', (e) => {
  if (spinner.style.display === 'block') return;
  if (e.key === 'ArrowUp') slide('up');
  if (e.key === 'ArrowDown') slide('down');
  if (e.key === 'ArrowLeft') slide('left');
  if (e.key === 'ArrowRight') slide('right');
});

// swipe support
let startX = 0, startY = 0;
document.addEventListener('touchstart', e => {
  if (e.touches && e.touches[0]) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }
});
document.addEventListener('touchend', e => {
  if (!e.changedTouches || !e.changedTouches[0]) return;
  const endX = e.changedTouches[0].clientX;
  const endY = e.changedTouches[0].clientY;
  const diffX = startX - endX;
  const diffY = startY - endY;
  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (diffX > 30) slide('left');
    else if (diffX < -30) slide('right');
  } else {
    if (diffY > 30) slide('up');
    else if (diffY < -30) slide('down');
  }
});
