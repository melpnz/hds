const form = document.querySelector('[data-feedback-form]');
const methodButtons = [...form.querySelectorAll('[data-contact-method]')];
const contactInput = form.querySelector('[data-contact-input]');
const contactIcon = form.querySelector('[data-contact-icon]');

const methods = {
  telegram: {
    icon: '../../../ui/assets/icons/contact-telegram.svg',
    type: 'text',
    placeholder: 'Username',
    label: 'Username в Телеграме'
  },
  phone: {
    icon: '../../../ui/assets/icons/contact-phone.svg',
    type: 'tel',
    placeholder: 'Телефон',
    label: 'Телефон'
  }
};

methodButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const method = methods[button.dataset.contactMethod];
    methodButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle('crs-button-group__item--selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    contactIcon.src = method.icon;
    contactInput.type = method.type;
    contactInput.placeholder = method.placeholder;
    contactInput.setAttribute('aria-label', method.label);
  });
});

form.querySelector('form').addEventListener('submit', (event) => {
  event.preventDefault();
  form.dataset.state = 'success';
});
