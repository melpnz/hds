// Public company badges and contact links captured from the production people cards.
const contact = (href: string) => ({ href, name: href.startsWith('mailto:') ? 'email' : href.includes('linkedin.com') ? 'linkedin' : 'career', label: href.startsWith('mailto:') ? `Почта: ${href.slice(7)}` : href.includes('linkedin.com') ? 'LinkedIn' : 'Хабр Карьера' })
const details = (logo: string, links: string[]) => ({ companyLogo: `/production-assets/${logo}`, contacts: links.map(contact) })

export const productionPeopleContacts: Record<string, ReturnType<typeof details>> = {
  'Александр Вальцев': details('dd7e0b7a6e3b3167a448.jpg', ['https://www.linkedin.com/in/avaltsev/']),
  'Александр Минаков': details('a7054d4ca7eac7a03171.jpg', ['mailto:am@infodrive.pro']),
  'Александр Ульяницкий': details('c686fa7795cb9b2d04e0.png', ['https://www.linkedin.com/in/alexulyanitsky/']),
  'Алексей Поляков': details('b2d1e8de4d061ccc5563.png', ['mailto:im.poliakov@yandex.ru', 'https://career.habr.com/impoliakov']),
  'Алёна Меркушева': details('4975c46ebc62af950a11.jpg', ['https://www.linkedin.com/in/alyonamerkusheva', 'mailto:alenamerkusheva007@gmail.com']),
  'Валерий Полоцкий': details('563d24bc8ac6291a8205.png', ['https://www.linkedin.com/in/maximusnomad/', 'https://career.habr.com/maximusnomad', 'mailto:polotskiy.valera@mail.ru']),
  'Елена Куклина': details('8c1903d1ce35c6af258c.png', ['https://www.linkedin.com/in/elena-k-082ba61b8', 'https://career.habr.com/elenakuklina12']),
  'Елена Махова': details('49302cedb94ec024dd63.png', ['https://www.linkedin.com/in/edu-elena-makhova/']),
  'Анна Линская': details('0f4a6cbb2bc3d2a930cc.jpg', ['https://career.habr.com/shelsneg']),
  'Дарья Гуляева': details('568c576c9ad23c255c74.jpg', ['https://career.habr.com/gulyaevads', 'mailto:gulaeva@habr.team']),
  'Сергей Лобачев': details('de3c40fb46b9b32fdab1.jpg', ['https://linkedin.com/lobachevsy', 'https://career.habr.com/lobachevsy', 'mailto:lobachev@habr.team', 'mailto:lobachevsy@gmail.com']),
  'Степан Воеводин': details('694426284603c37886a1.jpg', ['https://www.linkedin.com/in/stepan-voevodin-a923b959/', 'https://career.habr.com/melpnz']),
  'Виктория Гонгина': details('207f45a329868053bd53.jpg', ['https://career.habr.com/exosphere', 'mailto:vgongina@yandex.ru']),
  'Анастасия Сичкаренко': details('9a42d878301aa05ba2c8.svg', ['https://career.habr.com/nstsch'])
}
