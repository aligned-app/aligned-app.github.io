// 主題切換（預設暗房，記住選擇）
(function(){
  var q = new URLSearchParams(location.search).get('theme');
  var saved = q || localStorage.getItem('aligned-theme');
  if (saved === 'light') document.documentElement.dataset.theme = 'light';
  document.addEventListener('click', function(e){
    if (e.target.closest('#themeToggle')){
      var light = document.documentElement.dataset.theme === 'light';
      if (light) { delete document.documentElement.dataset.theme; localStorage.setItem('aligned-theme','dark'); }
      else { document.documentElement.dataset.theme = 'light'; localStorage.setItem('aligned-theme','light'); }
    }
    // 點語言選單以外處收合
    document.querySelectorAll('details.lang[open]').forEach(function(d){
      if (!d.contains(e.target)) d.removeAttribute('open');
    });
  });
})();

// 外部連結一律開新分頁（原頁留著才回得來）；直接下載檔案的連結除外
(function(){
  document.querySelectorAll('a[href^="http"]').forEach(function(a){
    if (/\.(dmg|exe|zip|alignproj)$/i.test(a.pathname)) return;
    a.target = '_blank'; a.rel = 'noopener';
  });
})();

// hero 輪播：圓點同步＋箭頭捲動（滑動本身走原生 scroll-snap）
(function(){
  document.querySelectorAll('.carousel').forEach(function(car){
    var slides = [].slice.call(car.children);
    var ctrl = car.parentElement.querySelector('.car-ctrl');
    if (!ctrl || slides.length < 2) return;
    var dotsBox = ctrl.querySelector('.dots');
    var dots = slides.map(function(s, i){
      var b = document.createElement('button');
      b.className = 'dot'; b.setAttribute('aria-label', (i+1));
      b.addEventListener('click', function(){ go(i); });
      dotsBox.appendChild(b); return b;
    });
    function current(){
      var mid = car.scrollLeft + car.clientWidth/2, best = 0, dist = 1e9;
      slides.forEach(function(s, i){
        var c = s.offsetLeft + s.offsetWidth/2, d = Math.abs(c - mid);
        if (d < dist){ dist = d; best = i; }
      });
      return best;
    }
    function go(i){
      i = Math.max(0, Math.min(slides.length-1, i));
      var s = slides[i];
      car.scrollTo({left: s.offsetLeft + s.offsetWidth/2 - car.clientWidth/2, behavior:'smooth'});
    }
    function sync(){ var i = current(); dots.forEach(function(d, j){ d.classList.toggle('on', j === i); }); }
    car.addEventListener('scroll', sync, {passive:true});
    ctrl.querySelectorAll('.car-btn').forEach(function(b){
      b.addEventListener('click', function(){ go(current() + (+b.dataset.dir)); });
    });
    sync();
  });
})();

// 影片進視野才載入播放，離開就暫停（data-src 延遲載入）
(function(){
  var vids = document.querySelectorAll('video[data-src]');
  if (!('IntersectionObserver' in window)){
    vids.forEach(function(v){ v.src = v.dataset.src; });
    return;
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      var v = en.target;
      if (en.isIntersecting){
        if (!v.src) v.src = v.dataset.src;
        v.play().catch(function(){});
      } else if (v.src){
        v.pause();
      }
    });
  }, {rootMargin:'200px 0px', threshold:.1});
  vids.forEach(function(v){ io.observe(v); });
})();
