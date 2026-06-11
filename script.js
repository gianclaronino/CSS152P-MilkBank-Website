const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav a');
const reveals = document.querySelectorAll('.reveal');
const programRows = document.querySelectorAll('.program-row[data-program-volume]');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    siteNav.classList.toggle('is-open');
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (window.matchMedia('(max-width: 780px)').matches) {
        navToggle.setAttribute('aria-expanded', 'false');
        siteNav.classList.remove('is-open');
      }
    });
  });
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px',
    }
  );

  reveals.forEach((element) => observer.observe(element));
} else {
  reveals.forEach((element) => element.classList.add('is-visible'));
}

if (programRows.length) {
  const volumes = Array.from(programRows)
    .map((row) => Number(row.dataset.programVolume || 0))
    .filter((volume) => Number.isFinite(volume) && volume > 0);

  const maxVolume = volumes.length ? Math.max(...volumes) : 1;

  programRows.forEach((row) => {
    const volume = Number(row.dataset.programVolume || 0);
    const fill = row.querySelector('.program-fill');
    const percent = maxVolume ? Math.max(0, Math.min(100, (volume / maxVolume) * 100)) : 0;

    if (fill) {
      fill.style.width = `${percent}%`;
      fill.setAttribute('aria-hidden', 'true');
    }

    row.setAttribute('aria-label', `${row.querySelector('.batch-id')?.textContent || 'Program'}: ${volume.toLocaleString()} mL`);
  });
}
