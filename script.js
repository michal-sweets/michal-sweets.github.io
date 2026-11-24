/* =========================================================
   הגדרות – כאן מדביקים את מפתח ה-Web3Forms
   (מקבלים אותו בחינם ב-https://web3forms.com)
   ========================================================= */
const WEB3FORMS_ACCESS_KEY = "PASTE_KEY_HERE";

const WEB3FORMS_URL = "https://api.web3forms.com/submit";
const PHONE_DISPLAY = "054-8411733";
const PHONE_TEL = "0548411733";

(function () {
  "use strict";

  /* ---------- תפריט עליון ---------- */
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");

  function setNav(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "סגירת התפריט" : "פתיחת התפריט");
    nav.classList.toggle("is-open", open);
  }

  toggle.addEventListener("click", function () {
    setNav(toggle.getAttribute("aria-expanded") !== "true");
  });

  // סגירה בלחיצה על קישור, בלחיצה מחוץ לתפריט, או ב-Esc
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setNav(false);
  });
  document.addEventListener("click", function (e) {
    if (nav.classList.contains("is-open") && !e.target.closest(".site-header")) setNav(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setNav(false);
      toggle.focus();
    }
  });

  // צל קטן לכותרת אחרי שמתחילים לגלול
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- הופעה עדינה בגלילה ---------- */
  const reveals = document.querySelectorAll(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Lightbox ---------- */
  const lb = document.getElementById("lightbox");
  const lbImg = lb.querySelector(".lb-img");
  const lbCap = lb.querySelector(".lb-caption");
  const btnClose = lb.querySelector(".lb-close");
  const btnPrev = lb.querySelector(".lb-prev");
  const btnNext = lb.querySelector(".lb-next");
  let items = [];
  let index = 0;
  let lastFocus = null;

  function showItem() {
    const trigger = items[index];
    const img = trigger.querySelector("img");
    lbImg.src = img.getAttribute("src");
    lbImg.alt = img.alt;
    lbCap.textContent = trigger.dataset.caption || "";
    const multi = items.length > 1;
    btnPrev.hidden = !multi;
    btnNext.hidden = !multi;
  }

  function openLightbox(trigger) {
    const gallery = trigger.closest("[data-gallery]");
    items = gallery ? Array.from(gallery.querySelectorAll("[data-zoom]")) : [trigger];
    index = items.indexOf(trigger);
    lastFocus = trigger;
    showItem();
    lb.hidden = false;
    document.body.classList.add("lb-open");
    btnClose.focus();
  }

  function closeLightbox() {
    lb.hidden = true;
    document.body.classList.remove("lb-open");
    lbImg.removeAttribute("src");
    if (lastFocus) lastFocus.focus();
  }

  function step(dir) {
    index = (index + dir + items.length) % items.length;
    showItem();
  }

  document.addEventListener("click", function (e) {
    const trigger = e.target.closest("[data-zoom]");
    if (trigger) openLightbox(trigger);
  });

  btnClose.addEventListener("click", closeLightbox);
  btnPrev.addEventListener("click", function () { step(-1); });
  btnNext.addEventListener("click", function () { step(1); });

  // לחיצה מחוץ לתמונה סוגרת
  lb.addEventListener("click", function (e) {
    if (e.target === lb || e.target.classList.contains("lb-stage")) closeLightbox();
  });

  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") { closeLightbox(); return; }
    // באתר מימין לשמאל: חץ שמאלה = הבא
    if (e.key === "ArrowLeft" && items.length > 1) step(1);
    if (e.key === "ArrowRight" && items.length > 1) step(-1);

    // שמירת הפוקוס בתוך החלון
    if (e.key === "Tab") {
      const focusables = Array.from(lb.querySelectorAll("button")).filter(function (b) { return !b.hidden; });
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- טופס הזמנה ---------- */
  const form = document.getElementById("order-form");
  const statusBox = document.getElementById("form-status");
  const submitBtn = form.querySelector(".btn-submit");
  const submitLabel = submitBtn.textContent;
  const nameInput = document.getElementById("f-name");
  const phoneInput = document.getElementById("f-phone");
  const dateInput = document.getElementById("f-date");

  // אי אפשר לבחור תאריך שכבר עבר
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  dateInput.min = today.toISOString().slice(0, 10);

  function normalizePhone(value) {
    let digits = value.replace(/[\s\-().]/g, "");
    if (digits.startsWith("+972")) digits = "0" + digits.slice(4);
    else if (digits.startsWith("972")) digits = "0" + digits.slice(3);
    return digits;
  }

  // נייד (05X / 07X – 10 ספרות) או קווי (02/03/04/08/09 – 9 ספרות)
  function isValidIsraeliPhone(value) {
    const d = normalizePhone(value);
    return /^0[57]\d{8}$/.test(d) || /^0[23489]\d{7}$/.test(d);
  }

  function setError(input, message) {
    const field = input.closest(".field");
    const err = document.getElementById(input.id + "-err");
    field.classList.toggle("is-invalid", !!message);
    input.setAttribute("aria-invalid", message ? "true" : "false");
    if (err) err.textContent = message || "";
  }

  function validate() {
    let firstInvalid = null;

    if (nameInput.value.trim().length < 2) {
      setError(nameInput, "נא למלא שם מלא");
      firstInvalid = firstInvalid || nameInput;
    } else {
      setError(nameInput, "");
    }

    if (!phoneInput.value.trim()) {
      setError(phoneInput, "נא למלא מספר טלפון");
      firstInvalid = firstInvalid || phoneInput;
    } else if (!isValidIsraeliPhone(phoneInput.value)) {
      setError(phoneInput, "מספר הטלפון לא תקין. לדוגמה: 050-1234567");
      firstInvalid = firstInvalid || phoneInput;
    } else {
      setError(phoneInput, "");
    }

    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  // מנקים את הודעת השגיאה ברגע שמתקנים
  [nameInput, phoneInput].forEach(function (input) {
    input.addEventListener("input", function () {
      if (input.closest(".field").classList.contains("is-invalid")) setError(input, "");
    });
  });

  // בונים את ההודעה מאלמנטים (בלי innerHTML) – בטוח יותר ותואם למדיניות האבטחה
  function showStatus(type, title, text, withPhone) {
    statusBox.className = "form-status is-" + type;
    statusBox.replaceChildren();
    const strong = document.createElement("strong");
    strong.textContent = title;
    statusBox.append(strong, document.createElement("br"), text);
    if (withPhone) {
      const a = document.createElement("a");
      a.href = "tel:" + PHONE_TEL;
      a.dir = "ltr";
      a.textContent = PHONE_DISPLAY;
      statusBox.append(a);
    }
    statusBox.hidden = false;
    statusBox.focus();
  }

  function showSuccess() {
    showStatus("success", "תודה רבה! הפנייה נשלחה בהצלחה.", "נחזור אליכם תוך 24 שעות לתיאום הפרטים.", false);
  }

  function showError() {
    showStatus("error", "אופס, השליחה לא הצליחה.", "אפשר לנסות שוב, או להתקשר אלינו ישירות: ", true);
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    submitBtn.textContent = loading ? "שולחים..." : submitLabel;
    form.setAttribute("aria-busy", String(loading));
  }

  function formatDate(iso) {
    if (!iso) return "";
    const p = iso.split("-");
    return p[2] + "/" + p[1] + "/" + p[0];
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    statusBox.hidden = true;

    // honeypot: אם בוט סימן את השדה הנסתר – מעמידים פנים שהצליח ולא שולחים
    if (form.elements.botcheck.checked) {
      form.reset();
      showSuccess();
      return;
    }

    if (!validate()) return;

    if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY === "PASTE_KEY_HERE") {
      console.warn("Web3Forms: חסר access key. יש להדביק אותו בראש הקובץ script.js");
      showError();
      return;
    }

    const name = nameInput.value.trim();
    const interests = Array.from(form.querySelectorAll('input[name="interests"]:checked'))
      .map(function (cb) { return cb.value; })
      .join(", ");

    const payload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: "פנייה חדשה מהאתר – " + name,
      from_name: "אתר מיכל – מתיקות מוקצפת",
      botcheck: false,
      "שם מלא": name,
      "טלפון": phoneInput.value.trim(),
      "סוג אירוע": form.elements.event_type.value || "לא צוין",
      "תאריך האירוע": formatDate(dateInput.value) || "לא צוין",
      "מספר אורחים משוער": form.elements.guests.value || "לא צוין",
      "מה מעניין": interests || "לא צוין",
      "הערות": form.elements.notes.value.trim() || "אין"
    };

    setLoading(true);
    try {
      const res = await fetch(WEB3FORMS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(function () { return {}; });
      if (!res.ok || !data.success) throw new Error(data.message || "HTTP " + res.status);
      form.reset();
      showSuccess();
    } catch (err) {
      console.error("Web3Forms error:", err);
      showError();
    } finally {
      setLoading(false);
    }
  });

  /* ---------- מייל מוסתר מבוטים ----------
     הכתובת לא כתובה בקוד בגלוי – היא נבנית כאן מחלקים מקודדים */
  document.querySelectorAll(".js-mail").forEach(function (el) {
    try { el.textContent = atob(el.dataset.a) + "@" + atob(el.dataset.b); } catch (e) { /* משאירים ריק */ }
  });

  /* ---------- שנה בפוטר ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
