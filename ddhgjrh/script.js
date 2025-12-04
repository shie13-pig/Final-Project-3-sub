/* ----------------------------- CONFIG / WEATHER API ----------------------------- */
const WEATHER_API_KEY = "36969dd54b3df2a4e17f7731a1903fcd";

/* ----------------------------- Simple SPA Router ----------------------------- */
const routes = {
  '/': renderHome,
  '/guidelines': renderGuidelines,
  '/calendar': renderCalendar,
  '/map': renderMapPage,
  '/notes': renderNotes,
  '/login': renderLogin,
  '/weather': renderWeatherPage
};

function navigate() {
  const path = location.hash.replace('#','') || '/';
  const view = routes[path] || renderNotFound;
  document.getElementById('view').innerHTML = '';
  view();
  updateAuthLink();
  // Kining linya ang atong gidugang aron mag-update sa title
  updatePageTitle(path); 
}

// Bag-ong function para sa title update
function updatePageTitle(path) {
    const title = document.getElementById('pageTitle');
    let pageName = 'Home';
    switch (path) {
        case '/guidelines': pageName = 'Guidelines'; break;
        case '/calendar': pageName = 'Crop Calendar'; break;
        case '/map': pageName = 'Map'; break;
        case '/notes': pageName = 'My Notes'; break;
        case '/weather': pageName = 'Weather'; break;
        case '/login': pageName = 'Login'; break;
        default: pageName = 'Dashboard'; break;
    }
    // Giusab ang H1 sa HTML (nga gitago sa CSS) aron magamit sa browser
    title.textContent = `WILDWOOD — ${pageName}`;
    document.title = `WILDWOOD — ${pageName}`;
}


window.addEventListener('hashchange', navigate);
window.addEventListener('load', navigate);

/* ----------------------------- Auth (simulation) ----------------------------- */
function isLoggedIn() { return !!localStorage.getItem('agro_session'); }
// (ANG UBANG BAHIN SA JS CODE WALA NA GI-APIL DINHI ARON DILI KAAYO TAAS, KOPYAHON LANG ANG IMONG NAUNA NGA JS CODE GIKAN DINHI PADA UBOS)
// ...
// ... (Kini ang imong daan nga script.js gikan sa linya 37 padulong sa katapusan)
// ...

function updateAuthLink() {
  const a = document.getElementById('authLink');
  if (isLoggedIn()) {
    a.textContent = 'Logout';
    a.href = '#/';
    a.onclick = () => { localStorage.removeItem('agro_session'); navigate(); }
  } else {
    a.textContent = 'Login';
    a.href = '#/login';
    a.onclick = null;
  }
}
// ----------------------------- Pages ----------------------------- 
// Kopyahon lang ang tanang function gikan sa renderHome hangtod sa katapusan...
// ...
// ...