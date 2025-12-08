// theme-toggle.js — Dark/Light theme toggle
(function(){
  const key='neptune-theme';
  const html=document.documentElement;
  const stored=localStorage.getItem(key);
  if(stored){html.setAttribute('data-theme',stored);}else{html.setAttribute('data-theme','dark');}
  window.toggleTheme=function(){
    const cur=html.getAttribute('data-theme')==='light'?'light':'dark';
    const next=cur==='light'?'dark':'light';
    html.setAttribute('data-theme',next);
    localStorage.setItem(key,next);
  }
})();
