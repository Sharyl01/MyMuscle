(() => {
  "use strict";
  const params = new URL(location.href).searchParams;
  const copy = {
    nl: ["Beveiligingscontrole laden…", "Controle voltooid. Je kunt verder in de app.", "De beveiligingscontrole is niet gelukt. Probeer opnieuw.", "Opnieuw proberen"],
    en: ["Loading security check…", "Check complete. You can continue in the app.", "The security check failed. Please try again.", "Try again"],
    es: ["Cargando la comprobación de seguridad…", "Comprobación completada. Puedes continuar en la app.", "La comprobación de seguridad ha fallado. Inténtalo de nuevo.", "Reintentar"],
    pt: ["A carregar a verificação de segurança…", "Verificação concluída. Podes continuar na aplicação.", "A verificação de segurança falhou. Tenta novamente.", "Tentar novamente"],
    de: ["Sicherheitsprüfung wird geladen…", "Prüfung abgeschlossen. Du kannst in der App fortfahren.", "Die Sicherheitsprüfung ist fehlgeschlagen. Bitte versuche es erneut.", "Erneut versuchen"],
    fr: ["Chargement du contrôle de sécurité…", "Contrôle terminé. Tu peux continuer dans l’application.", "Le contrôle de sécurité a échoué. Réessaie.", "Réessayer"],
    it: ["Caricamento del controllo di sicurezza…", "Controllo completato. Puoi continuare nell’app.", "Il controllo di sicurezza non è riuscito. Riprova.", "Riprova"],
    tr: ["Güvenlik kontrolü yükleniyor…", "Kontrol tamamlandı. Uygulamada devam edebilirsin.", "Güvenlik kontrolü başarısız oldu. Lütfen tekrar dene.", "Tekrar dene"],
    ar: ["جارٍ تحميل التحقق الأمني…", "اكتمل التحقق. يمكنك المتابعة في التطبيق.", "تعذّر إكمال التحقق الأمني. حاول مرة أخرى.", "إعادة المحاولة"],
    hi: ["सुरक्षा जाँच लोड हो रही है…", "जाँच पूरी हो गई। आप ऐप में आगे बढ़ सकते हैं।", "सुरक्षा जाँच पूरी नहीं हो सकी। कृपया फिर से कोशिश करें।", "फिर से कोशिश करें"],
  };
  const requestedLanguage = params.get("language");
  const language = Object.hasOwn(copy, requestedLanguage) ? requestedLanguage : "en";
  const messages = copy[language];
  const status = document.getElementById("status");
  const retry = document.getElementById("retry");
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  status.textContent = messages[0];
  retry.textContent = messages[3];
  retry.addEventListener("click", () => location.reload());
  const requestId = params.get("requestId") || "";
  let settled = false;
  let timeout;
  function deliver(value) {
    const message = { ...value, requestId };
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(message));
    else if (window.parent !== window) window.parent.postMessage(message, location.origin);
  }
  function fail() {
    clearTimeout(timeout);
    status.textContent = messages[2];
    retry.hidden = false;
    // Expiry must also clear a token previously delivered to a web form.
    settled = true;
    deliver({ type: "mymuscle-captcha-error" });
  }
  const sitekey = params.get("sitekey");
  if (!sitekey || !/^[a-zA-Z0-9_-]{10,100}$/.test(sitekey)) { fail(); return; }
  timeout = setTimeout(fail, 115_000);
  const script = document.createElement("script");
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  script.async = true;
  script.onerror = fail;
  script.onload = () => {
    if (settled) return;
    try {
      status.textContent = "";
      window.turnstile.render("#challenge", {
        sitekey, action: "authentication", theme: "light", size: "flexible", language,
        callback: token => {
          if (settled) return;
          if (typeof token !== "string" || !token || token.length > 2048) { fail(); return; }
          settled = true;
          clearTimeout(timeout);
          status.textContent = messages[1];
          deliver({ type: "mymuscle-captcha", token });
        },
        "error-callback": fail,
        "expired-callback": fail,
        "timeout-callback": fail,
      });
    } catch { fail(); }
  };
  document.head.appendChild(script);
})();
