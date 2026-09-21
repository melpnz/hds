(() => {
  const itemSelector = '.crs-carousel__slide, .crs-ad-slot-demo__card';

  const initCarousel = carousel => {
    if (carousel.dataset.carouselReady === 'true') return;

    const track = carousel.querySelector('.crs-carousel__track, .crs-ad-slot-demo__track');
    const previous = carousel.querySelector('.crs-carousel__control--prev');
    const next = carousel.querySelector('.crs-carousel__control--next');
    if (!track || !previous || !next) return;

    carousel.dataset.carouselReady = 'true';
    const originalItems = [...track.children].filter(item => item.matches(itemSelector));
    const loops = carousel.dataset.variant === 'ad-slot' && originalItems.length > 1;
    let index = Math.max(0, originalItems.findIndex(item => item.dataset.current === 'true'));
    let items = originalItems;
    let resetTimer;
    let scrollFrame;

    const makeClone = item => {
      const clone = item.cloneNode(true);
      clone.dataset.carouselClone = 'true';
      clone.removeAttribute('data-current');
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach(control => {
        control.setAttribute('tabindex', '-1');
      });
      return clone;
    };

    if (loops) {
      track.prepend(...originalItems.map(makeClone));
      track.append(...originalItems.map(makeClone));
      items = [...track.children].filter(item => item.matches(itemSelector));
      index += originalItems.length;
    }

    const itemLeft = (item, centered) => {
      const padding = parseFloat(getComputedStyle(track).paddingLeft) || 0;
      const start = item.offsetLeft - padding;
      return centered ? start - (track.clientWidth - item.offsetWidth) / 2 : start;
    };

    const scrollToIndex = (behavior = 'smooth') => {
      const item = items[index];
      if (!item) return;
      track.scrollTo({ left: itemLeft(item, loops), behavior });
    };

    const jumpToIndex = () => {
      const item = items[index];
      if (!item) return;
      const previousBehavior = track.style.scrollBehavior;
      track.style.scrollBehavior = 'auto';
      track.scrollLeft = itemLeft(item, loops);
      track.getBoundingClientRect();
      track.style.scrollBehavior = previousBehavior;
    };

    const updateCurrent = () => {
      originalItems.forEach(item => item.removeAttribute('data-current'));
      const normalized = loops
        ? (index - originalItems.length + originalItems.length) % originalItems.length
        : index;
      originalItems[normalized]?.setAttribute('data-current', 'true');
    };

    const updateDisabled = () => {
      if (loops) {
        previous.disabled = false;
        next.disabled = false;
        return;
      }
      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      previous.disabled = track.scrollLeft <= 1;
      next.disabled = track.scrollLeft >= maxScroll - 1;
    };

    const normalizeLoop = () => {
      if (!loops) return;
      if (index < originalItems.length) {
        index += originalItems.length;
        jumpToIndex();
      } else if (index >= originalItems.length * 2) {
        index -= originalItems.length;
        jumpToIndex();
      }
      updateCurrent();
    };

    const move = direction => {
      if (loops) {
        index += direction;
      } else {
        const currentLeft = track.scrollLeft;
        const candidates = items.map(item => itemLeft(item, false));
        if (direction > 0) {
          index = candidates.findIndex(left => left > currentLeft + 1);
          if (index < 0) index = items.length - 1;
        } else {
          index = candidates.reduce((result, left, candidate) => left < currentLeft - 1 ? candidate : result, 0);
        }
      }

      scrollToIndex('smooth');
      updateCurrent();
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        normalizeLoop();
        updateDisabled();
      }, 420);
    };

    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = requestAnimationFrame(updateDisabled);
    }, { passive: true });
    track.addEventListener('scrollend', () => {
      normalizeLoop();
      updateDisabled();
    });

    const align = () => {
      jumpToIndex();
      updateCurrent();
      updateDisabled();
    };
    requestAnimationFrame(() => requestAnimationFrame(align));
    window.addEventListener('load', align, { once: true });
    new ResizeObserver(align).observe(track);
  };

  document.querySelectorAll('.crs-carousel').forEach(initCarousel);
})();
