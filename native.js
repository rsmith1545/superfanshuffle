/* SuperFan Shuffle — native bridge.
   Loads on both web and inside the Capacitor app. On the plain web PWA,
   SFS.native is false and every method is a safe no-op, so the web build
   behaves exactly as before. Inside the native app it drives the real
   iOS/Android capabilities the web sandbox can't. */
(function () {
  var Cap = window.Capacitor;
  var native = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
  var P = (Cap && Cap.Plugins) || {};
  function safe(fn){ try { fn(); } catch (e) {} }

  window.SFS = {
    native: native,
    lockLandscape:    function(){ safe(function(){ P.ScreenOrientation && P.ScreenOrientation.lock({ orientation: 'landscape' }); }); },
    unlockOrientation:function(){ safe(function(){ P.ScreenOrientation && P.ScreenOrientation.unlock(); }); },
    hideStatusBar:    function(){ safe(function(){ P.StatusBar && P.StatusBar.hide(); }); },
    showStatusBar:    function(){ safe(function(){ P.StatusBar && P.StatusBar.show(); }); },
    keepAwake:        function(){ safe(function(){ P.KeepAwake && P.KeepAwake.keepAwake(); }); },
    allowSleep:       function(){ safe(function(){ P.KeepAwake && P.KeepAwake.allowSleep(); }); },
    haptic: function(kind){ safe(function(){
      if (!P.Haptics) return;
      var s = (kind === 'heavy') ? 'HEAVY' : (kind === 'light' ? 'LIGHT' : 'MEDIUM');
      P.Haptics.impact({ style: s });
    }); }
  };

  if (native) {
    document.documentElement.classList.add('is-native');
    // immersive everywhere in the app
    window.SFS.hideStatusBar();
  }
})();
