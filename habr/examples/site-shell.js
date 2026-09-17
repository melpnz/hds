/* Shared public shell for isolated examples.
   The light DOM is intentional: production classes must keep using ui/habr.css,
   and the viewer can switch the same document between light-v2 and dark-v2. */

const defaultAssetRoot = '../../../../';

function assetRoot(element) {
  const value = element.getAttribute('asset-root') || defaultAssetRoot;
  return value.endsWith('/') ? value : `${value}/`;
}

class HabrSiteHeader extends HTMLElement {
  connectedCallback() {
    if (this.dataset.ready === 'true') return;
    this.dataset.ready = 'true';
    this.style.display = 'contents';
    const root = assetRoot(this);
    const withFeature = this.hasAttribute('feature');
    this.innerHTML = `
      <header class="tm-header${withFeature ? ' tm-header_with-feature' : ''}">
        ${withFeature ? '<div class="header-feature tm-header__feature" data-header-feature><a class="link" href="#">Найдите курс под свою цель</a><span class="adv">Реклама</span></div>' : ''}
        <div class="tm-page-width">
          <div class="tm-header__container">
            <button aria-expanded="false" aria-label="Меню" class="burger-button tm-header__button tm-header__burger" type="button"><span class="line top"></span><span class="line middle"></span><span class="line bottom"></span></button>
            <span class="tm-header__logo-wrap"><a class="tm-header__logo tm-header__logo_hl-ru" href="#"><svg class="tm-svg-img tm-header__icon"><title>Хабр</title><use href="${root}ui/assets/icons/logo/habr-logo-ru.svg#logo"></use></svg></a></span>
            <span class="tm-header__divider"></span>
            <a class="tm-header__all-flows" href="#">Все потоки</a>
            <div class="tm-header-user-menu tm-header__user-menu">
              <a class="tm-header-user-menu__search" href="#" aria-label="Поиск"><svg class="tm-svg-img tm-header-user-menu__icon" width="24" height="24"><title>Поиск</title><use href="${root}ui/assets/icons/megazord.svg#search"></use></svg></a>
              <a class="tm-header-user-menu__write" href="#" aria-label="Написать"><svg class="tm-svg-img tm-header-user-menu__icon" width="24" height="24"><title>Написать</title><use href="${root}ui/assets/icons/megazord.svg#pencil"></use></svg></a>
              <button class="tm-header__button" type="button" aria-label="Настройки"><svg class="tm-svg-img tm-header-user-menu__icon" width="24" height="24"><title>Настройки</title><use href="${root}ui/assets/icons/megazord.svg#page-settings"></use></svg></button>
              <a class="tm-header-user-menu__login" href="#">Войти</a>
            </div>
          </div>
        </div>
      </header>`;
    this.placeFeature = this.placeFeature.bind(this);
    this.placeFeature();
    addEventListener('resize', this.placeFeature);
  }

  disconnectedCallback() {
    removeEventListener('resize', this.placeFeature);
  }

  placeFeature() {
    const feature = this.querySelector('[data-header-feature]');
    if (!feature) return;
    const header = this.querySelector('.tm-header');
    const container = this.querySelector('.tm-header__container');
    if (matchMedia('(min-width: 768px)').matches) container.insertBefore(feature, container.querySelector('.tm-header-user-menu'));
    else header.insertBefore(feature, header.firstElementChild);
  }
}

class HabrSiteFooter extends HTMLElement {
  connectedCallback() {
    if (this.dataset.ready === 'true') return;
    this.dataset.ready = 'true';
    this.style.display = 'contents';
    if (document.body.querySelector('habr-site-header')) document.body.classList.add('has-complete-site-shell');
    const root = assetRoot(this);
    this.innerHTML = `
      <nav class="tm-footer-menu" aria-label="Разделы сайта">
        <div class="tm-page-width"><div class="tm-footer-menu__container">
          <section class="tm-footer-menu__block"><h2 class="tm-footer-menu__block-title">Ваш аккаунт</h2><ul class="tm-footer-menu__list"><li class="tm-footer-menu__list-item"><a href="#">Войти</a></li><li class="tm-footer-menu__list-item"><a href="#">Регистрация</a></li></ul></section>
          <section class="tm-footer-menu__block"><h2 class="tm-footer-menu__block-title">Разделы</h2><ul class="tm-footer-menu__list"><li class="tm-footer-menu__list-item"><a href="#">Статьи</a></li><li class="tm-footer-menu__list-item"><a href="#">Новости</a></li><li class="tm-footer-menu__list-item"><a href="#">Хабы</a></li><li class="tm-footer-menu__list-item"><a href="#">Авторы</a></li></ul></section>
          <section class="tm-footer-menu__block"><h2 class="tm-footer-menu__block-title">Информация</h2><ul class="tm-footer-menu__list"><li class="tm-footer-menu__list-item"><a href="#">Устройство сайта</a></li><li class="tm-footer-menu__list-item"><a href="#">Для авторов</a></li><li class="tm-footer-menu__list-item"><a href="#">Документы</a></li></ul></section>
          <section class="tm-footer-menu__block"><h2 class="tm-footer-menu__block-title">Услуги</h2><ul class="tm-footer-menu__list"><li class="tm-footer-menu__list-item"><a href="#">Корпоративный блог</a></li><li class="tm-footer-menu__list-item"><a href="#">Медийная реклама</a></li><li class="tm-footer-menu__list-item"><a href="#">Нативные проекты</a></li></ul></section>
        </div></div>
      </nav>
      <footer class="tm-footer"><div class="tm-page-width"><div class="tm-footer__container">
        <h2 class="tm-footer__title"><a class="tm-footer__title-link" href="#"><svg class="tm-svg-img"><title>Хабр</title><use href="${root}ui/assets/icons/logo/habr-logo-ru.svg#logo"></use></svg></a></h2>
        <div class="tm-footer__social" aria-label="Хабр в социальных сетях">
          <a class="social-icon" href="#" aria-label="Telegram"><svg><use href="${root}ui/assets/social-icons.svg#social-logo-telegram"></use></svg></a>
          <a class="social-icon" href="#" aria-label="ВКонтакте"><svg><use href="${root}ui/assets/social-icons.svg#social-logo-vk"></use></svg></a>
          <a class="social-icon" href="#" aria-label="YouTube"><svg><use href="${root}ui/assets/social-icons.svg#social-logo-youtube"></use></svg></a>
          <a class="social-icon" href="#" aria-label="Дзен"><svg><use href="${root}ui/assets/social-icons.svg#social-logo-dzen"></use></svg></a>
        </div>
        <button class="tm-footer__link" type="button"><svg class="tm-svg-img tm-footer__icon"><use href="${root}ui/assets/icons/megazord.svg#lang"></use></svg>Настройки языка</button>
        <a class="tm-footer__link" href="#">Техническая поддержка</a>
        <div class="tm-footer__notice">На информационном ресурсе применяются <a href="#">рекомендательные технологии</a></div>
        <div class="tm-copyright"><a class="tm-copyright__link" href="#">© 2006–2026, Habr</a></div>
      </div></div></footer>`;
  }
}

if (!customElements.get('habr-site-header')) customElements.define('habr-site-header', HabrSiteHeader);
if (!customElements.get('habr-site-footer')) customElements.define('habr-site-footer', HabrSiteFooter);
