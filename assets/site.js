const menuButton = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');

const homeBanner = document.querySelector('.hero');
if (homeBanner) {
  const banners = [
    'assets/banner-01.jpg',
    'assets/banner-02.png',
    'assets/banner-03.jpg',
    'assets/banner-04.jpg',
  ];
  const caption = homeBanner.querySelector('.hero-caption');
  const toggle = homeBanner.querySelector('.hero-toggle');
  const previous = homeBanner.querySelector('.hero-previous');
  const next = homeBanner.querySelector('.hero-next');
  let current = 0;
  let timer = null;
  let pausedByUser = false;

  function imageLoads(src) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = src;
    });
  }

  async function findBanner(number) {
    const stem = `assets/banner-${String(number).padStart(2, '0')}`;
    const candidates = ['jpg', 'jpeg', 'png', 'webp'].map(extension => `${stem}.${extension}`);
    const results = await Promise.all(candidates.map(imageLoads));
    return candidates[results.indexOf(true)] ?? null;
  }

  function showBanner(index) {
    current = index % banners.length;
    homeBanner.style.backgroundImage = `url("${banners[current]}")`;
    caption.textContent = `大虫地区の写真（${current + 1} / ${banners.length}）`;
  }

  function setPlaying(playing) {
    if (timer) window.clearInterval(timer);
    const shouldPlay = playing && banners.length > 1;
    timer = shouldPlay ? window.setInterval(() => showBanner((current + 1) % banners.length), 3000) : null;
    toggle.textContent = shouldPlay ? '一時停止' : '再開';
    toggle.setAttribute('aria-label', shouldPlay ? '写真の自動切り替えを一時停止' : '写真の自動切り替えを再開');
  }

  toggle.addEventListener('click', () => {
    pausedByUser = Boolean(timer);
    setPlaying(!pausedByUser);
  });
  previous.addEventListener('click', () => showBanner((current - 1 + banners.length) % banners.length));
  next.addEventListener('click', () => showBanner((current + 1) % banners.length));
  showBanner(0);
  setPlaying(true);

  (async () => {
    for (let number = 5; ; number += 1) {
      const banner = await findBanner(number);
      if (!banner) break;
      banners.push(banner);
      caption.textContent = `大虫地区の写真（${current + 1} / ${banners.length}）`;
    }
  })();
}

if (menuButton && siteNav) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    siteNav.classList.toggle('open', !isOpen);
  });
}

const newsletterFrame = document.querySelector('.newsletter-frame');
if (newsletterFrame) {
  const issueLabel = document.querySelector('#newsletter-issue');
  const pdfLink = document.querySelector('.newsletter-link');
  const pdfBase = 'https://www.city.echizen.lg.jp/office/090/030/070/24onigadake_d/fil/';

  function showPreviousMonthNewsletter() {
    const japanDate = Object.fromEntries(
      new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', year: 'numeric', month: 'numeric' })
        .formatToParts(new Date())
        .map(part => [part.type, part.value]),
    );
    const issueDate = new Date(Date.UTC(Number(japanDate.year), Number(japanDate.month) - 2, 1));
    const issueYear = issueDate.getUTCFullYear();
    const issueMonth = issueDate.getUTCMonth() + 1;
    const monthsAfterSeptember2026 = (issueYear - 2026) * 12 + issueMonth - 9;
    const pdfNumber = 217 + monthsAfterSeptember2026;
    const pdfUrl = `${pdfBase}${pdfNumber}.pdf`;
    const issueName = `${issueYear}年${issueMonth}月号`;

    issueLabel.textContent = issueName;
    newsletterFrame.title = `広報紙おにがだけ ${issueName}のPDF`;
    if (newsletterFrame.getAttribute('src') !== `${pdfUrl}#view=FitH`) {
      newsletterFrame.src = `${pdfUrl}#view=FitH`;
    }
    pdfLink.href = pdfUrl;
  }

  showPreviousMonthNewsletter();
  window.addEventListener('pageshow', showPreviousMonthNewsletter);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) showPreviousMonthNewsletter();
  });
}


