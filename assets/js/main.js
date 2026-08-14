/* ============================================================
   main.js — tabbed single-page site. Loads JSON from /data and
   renders each tab. To change content edit /data; to restyle
   edit assets/css/style.css.
   ============================================================ */

const FLAGS = {
  ar: '<svg viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="16" fill="#fff"/><rect width="24" height="5.33" fill="#74acdf"/><rect y="10.67" width="24" height="5.33" fill="#74acdf"/><circle cx="12" cy="8" r="2.1" fill="#f6b40e"/></svg>',
  uk: '<svg viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg"><rect width="24" height="16" fill="#012169"/><path d="M0 0L24 16M24 0L0 16" stroke="#fff" stroke-width="3.2"/><path d="M0 0L24 16M24 0L0 16" stroke="#C8102E" stroke-width="1.7"/><path d="M12 0V16M0 8H24" stroke="#fff" stroke-width="5.2"/><path d="M12 0V16M0 8H24" stroke="#C8102E" stroke-width="3"/></svg>'
};
const ICON = {
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17 4.5 18 4.8 18 4.8c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5Z"/></svg>'
};

let DATA = {};
let lang = 'en';
const VIEWS = ['home','about','dedico','projects','outreach','contrib','datos','novedades','contact'];
const BAND_POS = { home:'top', about:'none', dedico:'none', projects:'bottom', outreach:'none', contrib:'bottom', datos:'top', novedades:'top', contact:'bottom' };

const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const el = (tag, cls, html) => { const e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; };
const t  = v => v==null ? '' : (typeof v==='object' ? (v[lang] ?? v.en ?? '') : v);
const boldName = s => (s||'').replace(/Armella(,?\s*M\.?\s*A\.?)?/g, m => `<strong>${m}</strong>`);

async function boot(){
  const files = ['site','profile','research','publications','projects','media','teaching','photos','news'];
  try{
    const res = await Promise.all(files.map(f => fetch(`data/${f}.json`).then(r=>{
      if(!r.ok) throw new Error(`data/${f}.json -> ${r.status}`); return r.json();
    })));
    files.forEach((f,i)=> DATA[f]=res[i]);
  }catch(err){
    document.body.insertAdjacentHTML('afterbegin',
      `<div style="padding:1rem;background:#3a1a12;color:#f0d0b0;font-family:monospace;font-size:.8rem">Could not load data files (${err.message}). If you opened index.html directly, run a local server - see README.</div>`);
    return;
  }
  lang = localStorage.getItem('lang') || DATA.site.config.defaultLang || 'en';
  document.documentElement.lang = lang;
  buildLangButton();
  buildNav();
  renderAll();
  setupNavToggle();
  setupLightbox();
  initCounter();
  window.addEventListener('hashchange', router);
  router();
  $('#year').textContent = new Date().getFullYear();
}

function socialHTML(extraClass){
  const L = DATA.site.config.links;
  const cls = extraClass ? ' '+extraClass : '';
  return `<div class="social${cls}">`+
    `<a href="mailto:${L.email}" title="Email" aria-label="Email">${ICON.mail}</a>`+
    `<a href="${L.orcid}" target="_blank" rel="noopener" class="badge" title="ORCID">iD</a>`+
    `<a href="${L.researchgate}" target="_blank" rel="noopener" class="badge" title="ResearchGate">RG</a>`+
    `<a href="${L.github}" target="_blank" rel="noopener" title="GitHub" aria-label="GitHub">${ICON.github}</a>`+
  `</div>`;
}

function buildLangButton(){
  const btn = $('#lang-btn');
  const paint = ()=>{ const toES = lang==='en'; btn.innerHTML = (toES?FLAGS.ar:FLAGS.uk) + `<span>${toES?'Español':'English'}</span>`; };
  paint();
  btn.onclick = ()=>{
    lang = lang==='en' ? 'es' : 'en';
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    paint(); renderAll();
  };
}

function buildNav(){
  const ul = $('#nav-links'); ul.innerHTML='';
  VIEWS.forEach(k=>{
    const a = el('a',null,t(DATA.site.ui.nav[k])); a.href='#'+k; a.dataset.nav=k;
    a.onclick = ()=> ul.classList.remove('open');
    ul.appendChild(el('li',null)).appendChild(a);
  });
  $('#nav-social').innerHTML = socialHTML();
}
function setupNavToggle(){ const ul=$('#nav-links'); $('#nav-toggle').onclick = ()=> ul.classList.toggle('open'); }

function placeBand(key){
  const field=document.getElementById('field'), views=document.getElementById('views');
  if(!field||!views) return;
  const mode=BAND_POS[key]||'top', parent=views.parentNode;
  if(mode==='none'){ field.style.display='none'; return; }
  field.style.display='';
  field.classList.toggle('at-bottom', mode==='bottom');
  if(mode==='bottom'){ if(views.nextSibling!==field) parent.insertBefore(field, views.nextSibling); }
  else { if(field.nextSibling!==views) parent.insertBefore(field, views); }
}
function showView(key){
  if(!VIEWS.includes(key)) key = (DATA.site.config.defaultTab||'home');
  $$('#views .view').forEach(v=> v.classList.toggle('active', v.id===key));
  $$('#nav-links a').forEach(a=> a.classList.toggle('current', a.dataset.nav===key));
  placeBand(key);
  try{window.scrollTo(0,0);}catch(e){}
}
function router(){ showView((location.hash||'').replace('#','')); }

function renderAll(){
  $$('#nav-links a').forEach(a=> a.textContent = t(DATA.site.ui.nav[a.dataset.nav]));
  applyStaticLabels();
  renderBand();
  renderHome();
  renderAbout();
  renderDedico();
  renderProjects();
  renderOutreach();
  renderContrib();
  renderContact();
  renderNews();
  renderDatos();
}

function applyStaticLabels(){
  const S = DATA.site.ui;
  $$('[data-label]').forEach(n=>{ const k=n.dataset.label; const s=(S.sections[k]&&S.sections[k].label)||S.labels[k]; if(s) n.textContent=t(s); });
  $$('[data-title]').forEach(n=>{ const s=S.sections[n.dataset.title]; if(s&&s.title) n.innerHTML=t(s.title); });
  $$('[data-subtitle]').forEach(n=>{ const s=S.sections[n.dataset.subtitle]; if(s&&s.subtitle) n.textContent=t(s.subtitle); });
}

/* persistent band (shown on every tab) */
function renderBand(){
  const esc = s => s.replace(/"/g,'&quot;');
  const html = DATA.photos.band.map(ph=>{ const cap=t(ph.caption);
    return `<div class="band-item" data-full="${ph.src.replace('/thumb/','/')}" data-cap="${esc(cap)}"><div class="ph"><img src="${ph.src}" alt="${esc(cap)}" loading="lazy"></div><div class="band-cap">${cap}</div></div>`; }).join('');
  $('#band-track').innerHTML = html + html;
}

function photoCards(arr){
  const esc = s => s.replace(/"/g,'&quot;');
  return arr.map(ph=>{ const cap=t(ph.caption);
    return `<div class="photo-card" data-full="${ph.src}" data-cap="${esc(cap)}"><div class="ph"><img src="${ph.src}" alt="${esc(cap)}" loading="lazy"></div><div class="cap">${cap}</div></div>`; }).join('');
}

function renderHome(){
  const p = DATA.profile, B = DATA.site.ui.buttons;
  if(DATA.photos.heroBg) $('#home-bg').style.backgroundImage = `linear-gradient(180deg,rgba(13,11,8,.78),rgba(13,11,8,.92)),url('${DATA.photos.heroBg}')`;
  $('#home-eyebrow').textContent = t(p.eyebrow);
  $('#home-title').innerHTML = p.heroTitleHtml;
  $('#home-phrase').textContent = t(p.homePhrase);
  $('#home-ctas').innerHTML =
    `<a href="#contrib" class="btn btn-primary">${t(B.viewContributions)}</a>`+
    `<a href="#novedades" class="btn btn-ghost">${t(B.news)}</a>`+
    `<a href="#contact" class="btn btn-ghost">${t(B.getInTouch)}</a>`;
  $('#home-social').innerHTML = socialHTML('big');
  const ph = DATA.photos.hero;
  $('#home-portrait').innerHTML = `<img src="${ph.src}" alt="${ph.alt||''}" loading="eager">`;
}

function flankSplit(cards){
  const n=cards.length, per=Math.floor(n/2);
  return { left:cards.slice(0,per), right:cards.slice(per,per*2), below:cards.slice(per*2) };
}
function renderAbout(){
  const p = DATA.profile;
  $('#about-heading').innerHTML = t(p.about.heading);
  $('#about-paragraphs').innerHTML = p.about.paragraphs.map(par=>`<p${par.lead?' class="lead"':''}>${t(par)}</p>`).join('');
  $('#about-positions').innerHTML = p.positions.map(pos=>{
    const main = pos.url ? `<a href="${pos.url}" target="_blank" rel="noopener">${t(pos.main)}</a>` : t(pos.main);
    return `<li><span class="pos-dot"></span><div><span class="pos-main">${main}</span><span class="pos-inst">${t(pos.inst)}</span></div></li>`; }).join('');
  $('#about-interests').innerHTML = p.interests.map(i=>`<div class="interest-tag">${t(i)}</div>`).join('');
  const ap = DATA.photos.about;
  $('#about-photo').innerHTML = `<img src="${ap.src}" alt="${ap.alt||''}" loading="lazy">`;
  const s = flankSplit(DATA.photos.personal||[]);
  $('#about-imgs-left').innerHTML = photoCards(s.left);
  $('#about-imgs-right').innerHTML = photoCards(s.right);
  $('#about-imgs-below').innerHTML = photoCards(s.below);
}

function renderDedico(){
  $('#research-grid').innerHTML = DATA.research.map(c=>`<div class="research-card"><div class="rc-title">${t(c.title)}</div><p class="rc-desc">${t(c.desc)}</p></div>`).join('');
  $('#fieldwork-grid').innerHTML = photoCards(DATA.photos.fieldwork||[]);
  $('#lab-grid').innerHTML = photoCards(DATA.photos.lab||[]);
  $('#collections-grid').innerHTML = photoCards(DATA.photos.collections||[]);
}

function renderProjects(){
  $('#proj-grid').innerHTML = DATA.projects.items.map(pr=>
    `<div class="proj-card"><span class="proj-badge">${pr.status==='active'?(lang==='es'?'Vigente':'Active'):(lang==='es'?'Finalizado':'Closed')}</span><div class="proj-title">${t(pr.title)}</div><div class="proj-info">${pr.funder}</div><div class="proj-role">${t(pr.role)}</div></div>`).join('');
}

function renderOutreach(){
  const B = DATA.site.ui.buttons;
  $('#media-grid').innerHTML = DATA.media.items.map(m=>{
    const label = m.type==='video'?t(B.watch):t(B.readArticle);
    return `<div class="media-card"><div class="media-outlet">${m.outlet}</div><div class="media-headline">${t(m.headline)}</div><div class="media-year">${m.year}</div><a href="${m.url}" target="_blank" rel="noopener" class="media-link">${label}</a></div>`; }).join('');
  const row = it => `<div class="teaching-item"><span class="ti-role">${t(it.role)}</span><span class="ti-inst">${t(it.inst)}</span><span class="ti-period">${t(it.period)}</span></div>`;
  $('#teaching-positions').innerHTML = DATA.teaching.positions.map(row).join('');
  $('#teaching-supervision').innerHTML = DATA.teaching.supervision.map(row).join('');
  const s = flankSplit(DATA.photos.outreach||[]);
  $('#outreach-imgs-left').innerHTML = photoCards(s.left);
  $('#outreach-imgs-right').innerHTML = photoCards(s.right);
  $('#outreach-imgs-below').innerHTML = photoCards(s.below);
}

function renderContrib(){
  const pubs = DATA.publications.items.slice().sort((a,b)=> b.year - a.year);
  $('#contrib-list').innerHTML = pubs.map(p=>{
    const q = p.q ? t(p.q) : p.title;
    const head = p.link ? `<a href="${p.link}" target="_blank" rel="noopener">${q}</a>` : q;
    return `<div class="contrib-item"><span class="contrib-year">${p.year}</span><div class="contrib-body"><div class="contrib-q">${head}</div><div class="contrib-cite">${boldName(p.authors)} — <em>${p.title}</em>. ${p.journal||''}</div></div></div>`;
  }).join('');
  $('#pub-list').innerHTML = pubs.map(p=>{
    const title = p.link ? `<a href="${p.link}" target="_blank" rel="noopener">${p.title}</a>` : p.title;
    return `<div class="pub-item"><span class="pub-year">${p.year}</span><div><div class="pub-title">${title}</div><div class="pub-journal">${p.journal||''}</div><div class="pub-authors">${boldName(p.authors)}</div></div></div>`;
  }).join('');
  const cfg = DATA.site.config, B = DATA.site.ui.buttons;
  $('#cv-row').innerHTML = cfg.cvEnabled
    ? `<a href="${cfg.links.cv}" class="btn btn-ghost" download>${t(B.downloadCV)}</a>`
    : `<button class="btn btn-ghost" disabled title="coming soon">${t(B.downloadCV)}</button>`;
}

function renderDatos(){
  const box=$('#datos-cards'); if(!box) return;
  const items=[
    {title:{en:"Deep time · Tucumán",es:"Tiempo profundo · Tucumán"},desc:{en:"An interactive activity: turn the whole history of Earth into a walk across Tucumán and see where each great moment of life falls. Bilingual, with a real map.",es:"Una actividad interactiva: convertí toda la historia de la Tierra en una caminata por Tucumán y mirá dónde cae cada gran momento de la vida. Bilingüe, con mapa real."},url:"actividades/tiempo-profundo-tucuman.html",status:"live"},
    {title:{en:"Deep time · Catamarca",es:"Tiempo profundo · Catamarca"},desc:{en:"Coming soon.",es:"Próximamente."},status:"soon"},
    {title:{en:"Deep time · Jujuy",es:"Tiempo profundo · Jujuy"},desc:{en:"Coming soon.",es:"Próximamente."},status:"soon"}
  ];
  const uc=lang==='es'?'En construcción':'Under construction';
  const open=lang==='es'?'Abrir actividad →':'Open activity →';
  box.innerHTML=items.map(it=>{
    const head='<div class="datos-ct">'+t(it.title)+'</div><p class="datos-cd">'+t(it.desc)+'</p>';
    return it.status==='live'
      ? '<a class="datos-card live" href="'+it.url+'" target="_blank" rel="noopener">'+head+'<span class="datos-open">'+open+'</span></a>'
      : '<div class="datos-card soon">'+head+'<span class="datos-badge">'+uc+'</span></div>';
  }).join('');
}

function renderNews(){
  const list=$('#news-list'); if(!list) return;
  const items=(DATA.news&&DATA.news.items)||[];
  if(!items.length){
    const S=DATA.site.ui.labels;
    list.innerHTML=`<div class="under-construction"><img class="uc-img" src="photos/under_construction.png" alt=""><div class="uc-sub">${t(S.underConstructionSub)}</div></div>`;
    return;
  }
  list.innerHTML=items.map(n=>{
    const link=n.link?`<a href="${n.link.url}" target="_blank" rel="noopener" class="news-link">${t(n.link.label)}</a>`:'';
    return `<div class="news-item"><div class="news-date">${n.date||''}</div><div class="news-body"><div class="news-title">${t(n.title)}</div><p class="news-text">${t(n.body)}</p>${link}</div></div>`;
  }).join('');
}
function renderContact(){
  const c = DATA.profile.contact, L = DATA.site.config.links;
  $('#contact-quote').innerHTML = `${t(c.quote)}<span class="qa">${c.quoteAuthor}</span>`;
  const g = DATA.photos.contact || (DATA.photos.fieldwork && DATA.photos.fieldwork[0]) || (DATA.photos.lab && DATA.photos.lab[1]);
  if(g) $('#contact-photo').innerHTML = `<img src="${g.src}" alt="${g.alt||t(g.caption)||''}" loading="lazy">`;
  const emails = c.emails.map(e=>`<a href="mailto:${e}">${e}</a>`).join('<br>');
  const links = c.academic.map(a=>`<a href="${a.url}" target="_blank" rel="noopener" class="acad-link">${a.label}</a>`).join('');
  $('#contact-details').innerHTML =
    `<div>${socialHTML('big')}</div>`+
    `<div><div class="contact-label">Email</div><div class="contact-val">${emails}</div></div>`+
    `<div><div class="contact-label">${lang==='es'?'Institución':'Main institution'}</div><div class="contact-val">${t(c.institution)}</div></div>`+
    `<div><div class="contact-label">${lang==='es'?'Perfiles académicos':'Academic profiles'}</div><div class="academic-links">${links}</div></div>`+
    `<div><div class="contact-label">${lang==='es'?'Ubicación':'Location'}</div><div class="contact-val">${t(c.location)}</div></div>`;
}

function setupLightbox(){
  const lb=$('#lightbox'), img=$('#lb-img'), cap=$('#lb-cap');
  const open=(src,c)=>{ img.src=src; cap.textContent=c||''; lb.classList.add('open'); };
  const close=()=>{ lb.classList.remove('open'); img.src=''; };
  document.addEventListener('click', e=>{ const it=e.target.closest('.band-item,.photo-card'); if(it) open(it.dataset.full,it.dataset.cap); });
  $('#lb-close').onclick = close;
  lb.addEventListener('click', e=>{ if(e.target===lb) close(); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') close(); });
}

async function initCounter(){
  const c = DATA.site.config.counter; if(!c||!c.enabled) return;
  const box=$('#visit-counter'), num=$('#vc-num');
  const base = Number(c.startAt)||0;
  const show = n => { num.textContent = (base + Number(n)).toLocaleString(); box.hidden=false; };
  const cached = sessionStorage.getItem('vc'); if(cached){ show(cached); return; }
  try{
    const r = await fetch(`https://api.counterapi.dev/v1/${encodeURIComponent(c.namespace)}/${encodeURIComponent(c.key)}/up`);
    const j = await r.json(); const n = j.count ?? j.value ?? j.Count;
    if(n!=null){ sessionStorage.setItem('vc', n); show(n); }
  }catch(_){}
}

document.addEventListener('DOMContentLoaded', boot);
