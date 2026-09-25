# Courses · композиция page-pattern через active provider

Отчёт генерируется `tools/normalize-patterns.mjs`. Page-pattern хранит порядок,
роль областей и поведение страницы; конкретную реализацию компонентов берём из
`courses-nuxt-kit@1.0.0` через provider mapping.
Статические HTML-страницы сохраняются только как evidence и GitHub fallback.

Общая оболочка всех шести страниц: `SiteHeader` + `SiteFooter` активного
provider. Вложенные `Avatar` и `EntityLogo` принадлежат карточкам и другим
компонентам, поэтому не дублируются как прямые дети page-pattern.

| Pattern | Область | Прямая композиция |
|---|---|---|
| `author` | `profile-header` | `PersonHeader` |
| `author` | `biography` | `Prose` |
| `author` | `expertise` | `Prose` |
| `author` | `qualifications` | `Prose` |
| `author` | `experience-education` | `ProfileHistory` |
| `authors` | `expert-process` | `CardGrid` → `StepCard` (×4) |
| `authors` | `experts-grid` | `CardGrid` → `PersonCard` (×8) |
| `courses-listing` | `rubrication-navigation` | нативный `<nav>` → `Link` (×4) |
| `courses-listing` | `advertising` | `Carousel` (variant=ad-slot) → `AdSlot` |
| `courses-listing` | `course-grid` | `CardGrid` → `CourseCard` (×8) |
| `courses-listing` | `authors` | `AuthorsBlock` |
| `courses-listing` | `separator` | нативный `<hr>` |
| `courses-listing` | `reviews` | `Section` → `Carousel` (variant=review-card) → `ReviewCard` (×5) |
| `courses-listing` | `promocodes` | `LinkGrid` |
| `courses-listing` | `popular-directions` | `LinkGrid` |
| `courses-listing` | `top-courses` | `NumberedCourseItem` (×3) |
| `courses-listing` | `school-rating` | `Section` → `RatingTable` |
| `education-center` | `page-title` | нативный `<h1>` |
| `education-center` | `school-header` | `EntityHeader` |
| `education-center` | `courses` | `Section` → `FilterBar` + `CardGrid` (variant=school-courses) → `CourseCard` (×8) |
| `education-center` | `ad-slot` | внешний слот `adfox` (не компонент kit) |
| `education-center` | `success-stories` | `Section` → `Carousel` (variant=article-card) → `ArticleCard` (×8) |
| `education-center` | `reviews` | `Section` → `Carousel` (variant=review-card) → `ReviewCard` (×8) |
| `education-center` | `general-info` | `InfoTable` |
| `education-centers-listing` | `advertising` | `Carousel` (variant=ad-slot) → `AdSlot` |
| `education-centers-listing` | `school-grid` | `CardGrid` → `SchoolCard` (×8) |
| `education-centers-listing` | `popular-courses` | `Section` → `FilterBar` + `Carousel` (variant=course-card) → `CourseCard` (×5) |
| `education-centers-listing` | `journal` | `Section` → `Carousel` (variant=article-card) → `ArticleCard` (×5) |
| `education-centers-listing` | `city-links` | `LinkGrid` (×2) |
| `rating` | `school-rating` | `RatingTable` |
| `rating` | `recommendations` | `Section` → `Carousel` (variant=course-card) → `CourseCard` (×5) |
