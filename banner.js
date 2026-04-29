(function () {
  var DISMISS_KEY = 'pm_install_dismissed';
  if (sessionStorage.getItem(DISMISS_KEY)) return;

  var standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
  if (standalone) return;

  var ua = navigator.userAgent;
  var isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  var isChromeIOS = /CriOS/.test(ua);
  var deferred = null;

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    show();
  });

  window.addEventListener('appinstalled', function () {
    var b = document.getElementById('pm-install-banner');
    if (b) b.remove();
  });

  setTimeout(show, 1500);

  function show() {
    if (document.getElementById('pm-install-banner')) return;
    if (!document.body) return;

    var b = document.createElement('div');
    b.id = 'pm-install-banner';
    b.innerHTML =
      '<style>' +
      '#pm-install-banner{position:fixed;bottom:16px;left:16px;right:16px;max-width:480px;margin:0 auto;background:#0a1628;color:#fff;border-radius:16px;padding:12px 14px;display:flex;align-items:center;gap:12px;box-shadow:0 12px 40px rgba(0,0,0,.5);font-family:system-ui,-apple-system,sans-serif;z-index:99999;animation:pmSlide .3s ease-out}' +
      '@keyframes pmSlide{from{transform:translateY(120%);opacity:0}to{transform:translateY(0);opacity:1}}' +
      '#pm-install-logo{width:46px;height:46px;border-radius:11px;background:#0a1628;border:2px solid #3b82f6;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#3b82f6;font-weight:800;font-size:26px;line-height:1;font-family:Teko,system-ui,sans-serif;overflow:hidden}' +
      '#pm-install-logo img{width:100%;height:100%;object-fit:cover}' +
      '#pm-install-text{flex:1;min-width:0}' +
      '#pm-install-title{margin:0 0 2px;font-weight:700;font-size:14px;line-height:1.2}' +
      '#pm-install-sub{margin:0;color:rgba(255,255,255,.55);font-size:12px;line-height:1.3}' +
      '#pm-install-cta{background:#3b82f6;color:#fff;border:0;border-radius:999px;padding:9px 16px;font-weight:600;font-size:13px;cursor:pointer;flex-shrink:0;white-space:nowrap}' +
      '#pm-install-cta:active{background:#2563eb}' +
      '#pm-install-close{background:transparent;border:0;color:rgba(255,255,255,.4);font-size:22px;line-height:1;cursor:pointer;padding:0 4px;flex-shrink:0}' +
      '.pm-ios-step{display:flex;align-items:center;gap:8px;margin:6px 0;font-size:13px;color:#fff;line-height:1.4}' +
      '.pm-ios-num{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:999px;background:#3b82f6;color:#fff;font-weight:700;font-size:12px;flex-shrink:0}' +
      '.pm-ios-icon{display:inline-block;width:18px;height:18px;vertical-align:middle;flex-shrink:0}' +
      '#pm-install-banner.expanded{flex-direction:column;align-items:stretch;padding:16px;gap:8px}' +
      '#pm-install-banner.expanded .pm-row{display:flex;align-items:center;gap:12px;justify-content:space-between}' +
      '</style>' +
      '<div id="pm-install-logo">P</div>' +
      '<div id="pm-install-text">' +
      '<p id="pm-install-title">Download Our App</p>' +
      '<p id="pm-install-sub">Add Pen MindState to your home screen</p>' +
      '</div>' +
      '<button id="pm-install-cta" type="button">Download</button>' +
      '<button id="pm-install-close" type="button" aria-label="Dismiss">&times;</button>';

    document.body.appendChild(b);

    document.getElementById('pm-install-cta').addEventListener('click', onInstallClick);
    document.getElementById('pm-install-close').addEventListener('click', onDismiss);
  }

  function onInstallClick() {
    var b = document.getElementById('pm-install-banner');
    if (!b) return;

    if (deferred) {
      deferred.prompt();
      deferred.userChoice.then(function (c) {
        deferred = null;
        if (c && c.outcome === 'accepted') b.remove();
        else dismissAndRemove();
      });
      return;
    }

    if (isIOS) {
      showIOSInstructions(b);
      return;
    }

    if (isChromeIOS) {
      b.innerHTML = wrapInstructions(
        'To install, please open this site in <strong>Safari</strong>, then tap <strong>Share</strong> &rarr; <strong>Add to Home Screen</strong>.'
      );
      return;
    }

    b.innerHTML = wrapInstructions(
      'Open your browser menu and choose <strong>Install app</strong> or <strong>Add to Home Screen</strong>.'
    );
  }

  function showIOSInstructions(b) {
    b.classList.add('expanded');
    b.innerHTML =
      '<div class="pm-row">' +
      '<p id="pm-install-title" style="margin:0;font-weight:700;font-size:15px">Install Pen MindState</p>' +
      '<button type="button" aria-label="Close" id="pm-install-close-x" style="background:transparent;border:0;color:rgba(255,255,255,.5);font-size:22px;cursor:pointer;padding:0 4px;line-height:1">&times;</button>' +
      '</div>' +
      '<div class="pm-ios-step"><span class="pm-ios-num">1</span>Tap the <strong>Share</strong> button ' +
      '<svg class="pm-ios-icon" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>' +
      '</div>' +
      '<div class="pm-ios-step"><span class="pm-ios-num">2</span>Scroll and tap <strong>Add to Home Screen</strong></div>' +
      '<div class="pm-ios-step"><span class="pm-ios-num">3</span>Tap <strong>Add</strong> in the top right</div>';
    document.getElementById('pm-install-close-x').addEventListener('click', onDismiss);
  }

  function wrapInstructions(html) {
    return (
      '<div style="flex:1;font-size:13px;line-height:1.5;color:#fff">' +
      html +
      '</div><button type="button" aria-label="Close" id="pm-install-close-x" style="background:transparent;border:0;color:rgba(255,255,255,.5);font-size:22px;cursor:pointer;padding:0 4px">&times;</button>'
    );
  }

  function onDismiss() {
    sessionStorage.setItem(DISMISS_KEY, '1');
    var b = document.getElementById('pm-install-banner');
    if (b) b.remove();
  }

  function dismissAndRemove() {
    onDismiss();
  }

  document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'pm-install-close-x') onDismiss();
  });
})();
