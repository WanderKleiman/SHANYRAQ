function initYandexMetrika() {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', function() {
      setTimeout(function() {
        (function(m,e,t,r,i,k,a){
          m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
        })(window, document,'script','https://mc.yandex.ru/metrika/tag.js', 'ym');
        
        if (typeof window.ym !== 'undefined') {
          window.ym(106496443, 'init', {
            ssr: true,
            webvisor: true,
            clickmap: true,
            ecommerce: "dataLayer",
            accurateTrackBounce: true
          });
        }
      }, 2000);
    });
  }
}

function ymTrackEvent(eventName, params = {}) {
  try {
    if (typeof window.ym !== 'undefined') {
      window.ym(106496443, 'reachGoal', eventName, params);
    }
  } catch (error) {
    console.error('Yandex Metrika tracking error:', error);
  }
}