<script setup lang="ts">
const employmentLogos = ['1fcfbbe05d4813afea97.jpg', 'ee4c8ce78c36ae0605be.jpg', '7012d5bf9a521ee6df21.png', 'b9743af6734afad25ef2.png', '35f17405d576498b537c.png']
const educationLogos = ['717f94d0765cd7cfc1f2.png', 'fc1b19e25866235bce5f.png', 'de919efafa658b9336b9.png', '47ee93a6e68f648fa454.png', 'd5c8c74ae24992aa8db6.png', 'bb3db8a3df7bb35b8526.png', 'fb942493536acc834c70.png', 'e844449cc60d1a57f8ba.png', 'd52059083e4f03f387c9.png']
const employment = [
  { date: 'Февраль 2025 — По настоящее время', title: 'Менеджер продукта, Хабр' },
  { date: 'Октябрь 2023 — Февраль 2025', title: 'Менеджер продукта, Сравни' },
  { date: 'Ноябрь 2020 — Декабрь 2023', title: 'Менеджер продукта, Яндекс Практикум' },
  { date: 'Январь 2022 — Октябрь 2022', title: 'Менеджер продукта, Эйч' },
  { date: 'Август 2018 — Февраль 2020', title: 'HR Generalist, Частная практика' }
].map((item, index) => ({ ...item, logo: `/production-assets/${employmentLogos[index]}` }))
const education = [
  { date: 'Май 2026 — Май 2026', title: 'Продуктовый вайбкодинг-интенсив, Авторский курс Ивана Замесина' },
  { date: 'Январь 2025 — Февраль 2025', title: 'Симулятор SQL для продуктовой аналитики, GoPractice' },
  { date: 'Январь 2024 — Февраль 2024', title: 'Симулятор управления ростом и масштабированием продукта, GoPractice' },
  { date: 'Январь 2023 — Февраль 2023', title: 'Симулятор управления продуктом на основе данных, GoPractice' },
  { date: 'Сентябрь 2022 — Сентябрь 2022', title: 'Product Mindset Intermediate, Product Mindset, Илья Красинский' },
  { date: 'Январь 2021 — Июнь 2021', title: 'Менеджер проектов, Яндекс Практикум' },
  { date: 'Январь 2020 — Январь 2020', title: 'Software Product Management, Coursera: University of Alberta' },
  { date: 'Сентябрь 2014 — Июль 2019', title: 'Менеджмент, Управление персоналом, Высшая школа экономики' },
  { date: 'Январь 2016 — Январь 2016', title: 'Inspiring and Motivating Individuals, Coursera, University of Michigan' }
].map((item, index) => ({ ...item, logo: `/production-assets/${educationLogos[index]}` }))
</script>

<template>
  <div class="production-page" data-production-page="author">
    <SiteHeader family="simple" />
    <main class="production-page__container production-page__stack production-page__stack--compact production-page__stack--listing">
      <PersonHeader name="Николай Ширинкин" role="Менеджер продукта" avatar="/production-assets/ded056a9123e36c96699.jpg" company-logo="/production-assets/1fcfbbe05d4813afea97.jpg" linkedin="#linkedin" career="#career" email="mailto:author@example.com" />
      <Section space="s"><Prose width="full">Менеджер продукта в Edtech/HR-tech. За более чем 7 лет работы создал и масштабировал цифровые продукты в Edtech (Яндекс Практикум, Сравни Образование, Хабр Карьера). Через карьерные и образовательные продукты обучил и трудоустроил более 30.000 специалистов, а также провел более 1000+ часов менторских консультаций для начинающих специалистов Product менеджеров, Разработчиков и Аналитиков.</Prose></Section>
        <Section title="В чем эксперт?" space="s"><ul class="production-page__facts"><li>Разработка и запуск продукта</li><li>Продуктовая аналитика</li><li>Стратегическое и операционное планирование</li><li>Финансовое планирование, бюджетирование, P&amp;L и расчет юнит-экономики</li><li>HR-менеджмент, обучение и развитие персонала</li><li>Управление персоналом, построение команды</li></ul></Section>
        <Section title="Регалии и квалификации" space="s"><ul class="production-page__facts"><li>Product owner</li><li>Бакалавриат: Менеджмент, Управление персоналом</li></ul></Section>
      <ProfileHistory :employment="employment" :education="education" />
    </main>
    <SiteFooter />
  </div>
</template>
