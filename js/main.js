(function () {
  const root = document.querySelector(".ag-root");
  if (!root) return;

  const routeConfigs = {
    "product-rfq": {
      route: "sourcing-flow",
      label: "Caut produs / materie primă",
      targetChannel: "angrosist-rfq",
      whatsappLabel: "Trimite cerere de sourcing pe WhatsApp",
      whatsappHelper: "Mesaj pregătit pentru produs, cantitate și livrare.",
      whatsappText: "Buna ziua. Am nevoie de sourcing B2B. Produs/categorie: ___ · Cantitate: ___ · Livrare: ___"
    },
    "recurring-supply": {
      route: "sourcing-flow",
      label: "Caut aprovizionare recurentă",
      targetChannel: "angrosist-rfq",
      whatsappLabel: "Trimite cererea recurentă pe WhatsApp",
      whatsappHelper: "Mesaj pregătit pentru produs, cantitate estimată, frecvență și livrare.",
      whatsappText: "Buna ziua. Caut aprovizionare recurenta. Produs/categorie: ___ · Cantitate estimata: ___ · Frecventa: ___ · Livrare: ___"
    },
    "product-list": {
      route: "sourcing-flow",
      label: "Vreau să trimit o listă de produse",
      targetChannel: "angrosist-rfq",
      whatsappLabel: "Trimite lista pe WhatsApp",
      whatsappHelper: "Mesaj pregătit pentru categorii principale și livrare.",
      whatsappText: "Buna ziua. Vreau sa trimit o lista de produse pentru cerere oferta B2B. Categorii principale: ___ · Livrare: ___"
    },
    "standard-supplier": {
      route: "seller-flow",
      label: "Sunt furnizor cu marfă standard",
      targetChannel: "angrosist-supplier",
      whatsappLabel: "Trimite oferta de furnizor pe WhatsApp",
      whatsappHelper: "Mesaj pregătit pentru categorie, locație stoc și disponibilitate.",
      whatsappText: "Buna ziua. Sunt furnizor B2B cu marfa standard/recurenta. Categorie: ___ · Tara/stoc: ___ · Disponibilitate: ___"
    },
    "clearance-redirect": {
      route: "seller-flow",
      label: "Am stoc clearance / overstock",
      targetChannel: "palletclearance",
      whatsappLabel: "Trimite detalii clearance pe WhatsApp",
      whatsappHelper: "Mesaj pregătit pentru PalletClearance: categorie, cantitate și locație.",
      whatsappText: "Buna ziua. Am stoc clearance/overstock si vreau sa discut prin PalletClearance. Categorie: ___ · Cantitate: ___ · Locatie: ___"
    },
    "other-b2b": {
      route: "other-b2b-flow",
      label: "Altă oportunitate B2B",
      targetChannel: "euro-intermed-triage",
      whatsappLabel: "Contactează Euro Intermed pe WhatsApp",
      whatsappHelper: "Mesaj general pentru oportunități B2B mixte sau neclare.",
      whatsappText: "Buna ziua. Am o oportunitate B2B si vreau sa discut cu Euro Intermed. Detalii: ___"
    }
  };

  const nav = root.querySelector("[data-ag-nav]");
  const menu = root.querySelector("[data-ag-menu]");
  const menuToggle = root.querySelector("[data-ag-menu-toggle]");
  const form = root.querySelector("[data-ag-form]");
  const intentSelect = root.querySelector("[data-ag-intent-select]");
  const routeInput = root.querySelector("[data-ag-route-input]");
  const intentInput = root.querySelector("[data-ag-intent-input]");
  const targetChannelInput = root.querySelector("[data-ag-target-channel]");
  const whatsappLinks = root.querySelectorAll("[data-ag-whatsapp-link]");
  const whatsappHelper = root.querySelector("[data-ag-whatsapp-helper]");
  const formStatus = root.querySelector("[data-ag-form-status]");
  const submitButton = root.querySelector("[data-ag-submit]");
  const aiWidgetContainer = root.querySelector("#ai-widget-container");
  const clearancePanel = root.querySelector("[data-ag-clearance-panel]");
  const mobileCta = root.querySelector("[data-ag-mobile-cta]");
  let currentIntent = "";

  function setMenu(open) {
    if (!menu || !menuToggle) return;
    menu.classList.toggle("ag-is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
  }

  function updateNavState() {
    if (!nav) return;
    nav.classList.toggle("ag-is-scrolled", window.scrollY > 18);
  }

  function scrollToForm() {
    const target = root.querySelector("#ag-rfq-form");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function clearErrors() {
    root.querySelectorAll(".ag-has-error").forEach((field) => field.classList.remove("ag-has-error"));
    root.querySelectorAll("[data-error-for]").forEach((error) => {
      error.textContent = "";
    });
  }

  function setError(fieldName, message) {
    const field = root.querySelector(`[data-field="${fieldName}"]`);
    const error = root.querySelector(`[data-error-for="${fieldName}"]`);
    if (field) field.classList.add("ag-has-error");
    if (error) error.textContent = message;
  }

  function setStatus(message, type) {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.classList.remove("ag-is-success", "ag-is-error");
    if (type) formStatus.classList.add(`ag-is-${type}`);
  }

  function setFieldsetState(intent) {
    root.querySelectorAll("[data-intent-fields]").forEach((group) => {
      const isActive = group.getAttribute("data-intent-fields") === intent;
      group.hidden = !isActive;
      group.querySelectorAll("input, select, textarea").forEach((field) => {
        field.disabled = !isActive;
        if (field.hasAttribute("data-intent-required")) {
          field.required = isActive;
        }
      });
    });
  }

  function updateRouteButtons(intent) {
    root.querySelectorAll("[data-intent]").forEach((button) => {
      const isSelected = button.getAttribute("data-intent") === intent;
      button.classList.toggle("ag-is-selected", isSelected);
      if (button.hasAttribute("aria-pressed")) {
        button.setAttribute("aria-pressed", String(isSelected));
      }
    });
  }

  function updateWhatsApp(intent) {
    const config = routeConfigs[intent] || routeConfigs["product-rfq"];
    const href = `https://wa.me/40765934455?text=${encodeURIComponent(config.whatsappText)}`;
    whatsappLinks.forEach((link) => {
      link.href = href;
      if (link.hasAttribute("data-ag-whatsapp-link")) {
        link.textContent = config.whatsappLabel;
      }
    });
    if (whatsappHelper) whatsappHelper.textContent = config.whatsappHelper;
  }

  function selectIntent(intent, options = {}) {
    const config = routeConfigs[intent];
    if (!config) return;
    currentIntent = intent;
    clearErrors();
    setStatus("", "");
    if (intentSelect) intentSelect.value = intent;
    if (routeInput) routeInput.value = config.route;
    if (intentInput) intentInput.value = intent;
    if (targetChannelInput) targetChannelInput.value = config.targetChannel;
    if (aiWidgetContainer) aiWidgetContainer.dataset.defaultRoute = config.route;
    if (clearancePanel) clearancePanel.hidden = intent !== "clearance-redirect";
    updateRouteButtons(intent);
    setFieldsetState(intent);
    updateWhatsApp(intent);
    if (options.scroll) scrollToForm();
  }

  function fieldValue(name) {
    const field = form ? form.elements[name] : null;
    if (!field) return "";
    return String(field.value || "").trim();
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validateForm() {
    if (!form) return false;
    clearErrors();
    setStatus("", "");
    let valid = true;
    const intent = fieldValue("ag_intent") || fieldValue("request_type");
    const email = fieldValue("email");
    const phone = fieldValue("phone");

    if (!intent || !routeConfigs[intent]) {
      setError("intent", "Te rugăm să alegi ce descrie cel mai bine cererea ta.");
      valid = false;
    }

    [
      ["company_name", "Adaugă numele companiei."],
      ["company_country", "Adaugă țara companiei."],
      ["contact_person", "Adaugă persoana de contact."]
    ].forEach(([name, message]) => {
      if (!fieldValue(name)) {
        setError(name, message);
        valid = false;
      }
    });

    if (!email && !phone) {
      setError("phone", "Adaugă fie un număr de telefon/WhatsApp, fie o adresă de email.");
      setError("email", "Adaugă fie o adresă de email, fie un număr de telefon/WhatsApp.");
      valid = false;
    }

    if (email && !validateEmail(email)) {
      setError("email", "Adaugă o adresă de email validă.");
      valid = false;
    }

    if (intent) {
      root.querySelectorAll(`[data-intent-fields="${intent}"] [data-intent-required]`).forEach((field) => {
        if (!String(field.value || "").trim()) {
          const wrapper = field.closest("[data-field]");
          const fieldName = wrapper ? wrapper.getAttribute("data-field") : field.name;
          setError(fieldName, "Câmp obligatoriu pentru ruta selectată.");
          valid = false;
        }
      });
    }

    if (!form.elements.b2b_confirmed.checked || !form.elements.contact_consent.checked) {
      setError("consent", "Confirmă că solicitarea este B2B și că putem folosi datele pentru a-ți răspunde.");
      valid = false;
    }

    return valid;
  }

  function resetSubmitState() {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Trimite cererea";
    }
  }

  async function submitForm(event) {
    event.preventDefault();
    if (!form) return;
    if (!validateForm()) {
      setStatus("Te rugăm să verifici câmpurile obligatorii și să încerci din nou.", "error");
      const firstError = root.querySelector(".ag-has-error input, .ag-has-error select, .ag-has-error textarea");
      if (firstError) firstError.focus();
      return;
    }

    if (window.location.protocol === "file:") {
      setStatus("Formularul este valid, dar trimiterea reală necesită rularea printr-un server PHP.", "error");
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Se trimite...";
    }

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Formularul nu a putut fi trimis.");
      }
      setStatus(data.message || "Am primit cererea ta B2B. Echipa va verifica disponibilitatea, condițiile comerciale și următorii pași.", "success");
      form.reset();
      currentIntent = "";
      updateRouteButtons("");
      setFieldsetState("");
      if (routeInput) routeInput.value = "";
      if (intentInput) intentInput.value = "";
      if (targetChannelInput) targetChannelInput.value = "";
      if (clearancePanel) clearancePanel.hidden = true;
      updateWhatsApp("product-rfq");
    } catch (error) {
      setStatus("Nu am putut trimite cererea. Te rugăm să verifici câmpurile obligatorii sau să ne contactezi direct pe WhatsApp/email.", "error");
    } finally {
      resetSubmitState();
    }
  }

  function initFaq() {
    root.querySelectorAll(".ag-faq__question").forEach((button) => {
      button.addEventListener("click", () => {
        const target = root.querySelector(`#${button.getAttribute("aria-controls")}`);
        const open = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!open));
        if (target) target.hidden = open;
      });
    });
  }

  function initMobileCtaObserver() {
    if (!mobileCta || !("IntersectionObserver" in window)) return;
    const formSection = root.querySelector("#ag-rfq-form");
    if (!formSection) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          mobileCta.classList.toggle("ag-is-hidden", entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(formSection);
  }

  function initCategoryButtons() {
    root.querySelectorAll("[data-ag-category]").forEach((button) => {
      button.addEventListener("click", () => {
        selectIntent("product-rfq", { scroll: true });
        const field = form ? form.elements.needed_product : null;
        if (field && !field.value) field.value = button.getAttribute("data-ag-category") || "";
      });
    });
  }

  window.addEventListener("scroll", updateNavState, { passive: true });
  updateNavState();

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
    });
  }

  if (menu) {
    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenu(false);
    });
  }

  root.querySelectorAll("[data-intent]").forEach((button) => {
    button.addEventListener("click", () => {
      selectIntent(button.getAttribute("data-intent"), { scroll: true });
    });
  });

  if (intentSelect) {
    intentSelect.addEventListener("change", () => {
      selectIntent(intentSelect.value, { scroll: false });
    });
  }

  root.querySelectorAll("[data-ag-ai-trigger]").forEach((button) => {
    button.addEventListener("click", () => {
      selectIntent(button.getAttribute("data-ag-intent") || currentIntent || "product-rfq", { scroll: true });
      setStatus("Asistentul nu este disponibil momentan. Poți trimite în continuare cererea prin formular sau WhatsApp.", "error");
    });
  });

  if (form) form.addEventListener("submit", submitForm);

  setFieldsetState("");
  updateWhatsApp("product-rfq");
  initFaq();
  initCategoryButtons();
  initMobileCtaObserver();
})();
