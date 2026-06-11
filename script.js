const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const navLinks = document.querySelectorAll('.site-nav a');
const reveals = document.querySelectorAll('.reveal');
const programRows = document.querySelectorAll('.program-row[data-program-volume]');
const donorWizard = document.querySelector('[data-donor-wizard]');

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

if (donorWizard) {
  const track = donorWizard.querySelector('.donor-wizard-track');
  const steps = Array.from(donorWizard.querySelectorAll('.donor-step'));
  const stepLabel = donorWizard.querySelector('[data-step-label]');
  const stepTotal = donorWizard.querySelector('[data-step-total]');
  const stepTitle = donorWizard.querySelector('[data-step-title]');
  const backButton = donorWizard.querySelector('[data-step-action="back"]');
  const nextButton = donorWizard.querySelector('[data-step-action="next"]');
  const saveButton = donorWizard.querySelector('[data-step-action="save"]');

  let currentStep = 0;

  const updateWizard = () => {
    steps.forEach((step, index) => {
      step.classList.toggle('is-active', index === currentStep);
    });

    if (track) {
      track.style.transform = `translateX(-${currentStep * 100}%)`;
    }

    if (stepLabel) {
      stepLabel.textContent = String(currentStep + 1);
    }

    if (stepTotal) {
      stepTotal.textContent = String(steps.length);
    }

    if (stepTitle) {
      stepTitle.textContent = steps[currentStep]?.dataset.stepTitle || '';
    }

    if (backButton) {
      backButton.disabled = currentStep === 0;
    }

    if (nextButton) {
      nextButton.textContent = currentStep === steps.length - 1 ? 'Submit Registration' : 'Next';
    }
  };

  const validateStep = (step) => {
    const controls = Array.from(step.querySelectorAll('input, select, textarea')).filter((control) => !control.disabled);
    const password = step.querySelector('#password');
    const confirmPassword = step.querySelector('#confirm-password');

    for (const control of controls) {
      if (control.type === 'checkbox' && !control.checked) {
        control.setCustomValidity('Please check this box before continuing.');
      } else if (control.type === 'checkbox') {
        control.setCustomValidity('');
      }

      if (!control.checkValidity()) {
        control.reportValidity();
        control.focus();
        return false;
      }
    }

    if (password && confirmPassword && password.value && confirmPassword.value && password.value !== confirmPassword.value) {
      confirmPassword.setCustomValidity('Passwords do not match.');
      confirmPassword.reportValidity();
      confirmPassword.focus();
      return false;
    }

    if (confirmPassword) {
      confirmPassword.setCustomValidity('');
    }

    return true;
  };

  if (backButton) {
    backButton.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep -= 1;
        updateWizard();
      }
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      const activeStep = steps[currentStep];

      if (!validateStep(activeStep)) {
        return;
      }

      if (currentStep < steps.length - 1) {
        currentStep += 1;
        updateWizard();
        return;
      }

      window.location.href = 'consent.html';
    });
  }

  if (saveButton) {
    saveButton.addEventListener('click', () => {
      alert('Draft saved locally.');
    });
  }

  updateWizard();
}
