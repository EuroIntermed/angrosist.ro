/**
 * Copy dictionary for both locales (Angrosist). RO is authoritative; EN is
 * idiomatic parity (not a literal translation). Copy is benefit-led, concise and
 * scannable — the shared content standard for all three ecosystem sites. Every
 * user-facing string on the site resolves through here.
 */

export type Locale = 'ro' | 'en'

const ro = {
  meta: {
    homeTitle:
      'Angrosist.ro | Sourcing B2B pentru materii prime și produse vrac',
    homeDescription:
      'Trimite necesarul și primești o ofertă B2B potrivită pentru materii prime, produse vrac, FMCG și aprovizionare recurentă — în funcție de cantitate și livrare.',
    produseTitle: 'Produse | Catalog B2B orientativ — Angrosist.ro',
    produseDescription:
      'Catalog orientativ de categorii și produse B2B: materii prime, condimente, cereale, oleaginoase, făinuri și FMCG. Comandă rapid pe WhatsApp sau cu asistentul AI.',
    howTitle: 'Cum funcționează | Sourcing B2B — Angrosist.ro',
    howDescription:
      'De la necesar la ofertă personalizată în patru pași simpli, fără cont și fără coș de cumpărături inutil. Vezi ce să incluzi pentru o cerere B2B mai clară.',
    contactTitle: 'Contact | Angrosist.ro',
    contactDescription:
      'Continuă pe WhatsApp cu cererea deja completată sau discută cu asistentul AI. Sourcing, aprovizionare recurentă sau ofertă de furnizor.',
    notFoundTitle: 'Pagină negăsită | Angrosist.ro',
  },
  brand: {
    name: 'Angrosist.ro',
    tagline: 'Sourcing B2B',
    mark: 'AG',
  },
  nav: {
    skip: 'Sari la conținut',
    home: 'Acasă',
    produse: 'Produse',
    how: 'Cum funcționează',
    faq: 'Întrebări',
    contact: 'Contact',
    cta: 'Scrie-ne pe WhatsApp',
    openMenu: 'Deschide meniul',
    closeMenu: 'Închide meniul',
  },
  hero: {
    badge: 'Exclusiv B2B · Sourcing · Materii prime · Produse vrac',
    title: 'Trimite necesarul. Primești o ofertă B2B potrivită.',
    lead: 'Angrosist.ro ajută companiile să găsească rapid materii prime, produse vrac, FMCG și soluții de aprovizionare pentru producție, distribuție, retail și HoReCa. Ofertele sunt personalizate în funcție de produs, cantitate, disponibilitate și locație de livrare.',
    primary: 'Vezi produsele',
    secondary: 'Cum funcționează',
    whatsapp: 'Trimite necesarul pe WhatsApp',
    whatsappText:
      'Buna ziua. Am nevoie de sourcing B2B. Produs/categorie: ___ · Cantitate: ___ · Livrare: ___',
    trustLine:
      'Răspuns pe baza cererii · Exclusiv firme · Oferte în funcție de volum și destinație',
    panel: {
      kicker: 'Cerere B2B · exemplu',
      status: 'În calificare',
      product: { label: 'Produs', value: 'Semințe chia' },
      quantity: { label: 'Cantitate', value: '100 kg / lunar' },
      delivery: { label: 'Livrare', value: 'Brașov, RO' },
      flow: ['Necesar', 'Calificare', 'Ofertă personalizată'],
    },
  },
  value: {
    eyebrow: 'De ce Angrosist',
    title: 'De la materii prime la aprovizionare recurentă',
    copy: 'Un punct de pornire clar pentru cereri B2B — fără să transformăm pagina într-un catalog aglomerat sau într-un magazin online.',
    items: [
      {
        title: 'Ofertă în funcție de cerere',
        body: 'Trimiți produsul, cantitatea și livrarea. Prețul se stabilește pe volum, ambalare și destinație.',
      },
      {
        title: 'Exclusiv B2B, verificat după CUI',
        body: 'Lucrăm cu firme, producători, distribuitori, retaileri și HoReCa — nu cu persoane fizice.',
      },
      {
        title: 'Răspuns pe WhatsApp, în minute',
        body: 'Fără formulare lungi. Scrii pe WhatsApp sau asistentului AI și primești primul pas rapid.',
      },
      {
        title: 'Aprovizionare recurentă',
        body: 'Pentru volume lunare, forecast, comenzi repetate și condiții comerciale planificate.',
      },
    ],
  },
  categories: {
    eyebrow: 'Categorii B2B',
    title: 'Categorii orientative, nu listări publice de prețuri',
    copy: 'Explorează catalogul orientativ sau trimite o descriere scurtă dacă necesarul este mixt.',
    cta: 'Vezi catalogul',
    moqNote:
      'Minimum ~100 kg per produs (SKU); loturi standard 250 / 500 / 750 / 1000 kg. Mai multe produse pot cumula volumul.',
    items: [
      {
        name: 'Materii prime & auxiliare',
        body: 'Ingrediente, grăsimi, arome, aditivi, îndulcitori, sare, zahăr și materii auxiliare.',
      },
      {
        name: 'Condimente, ierburi & mixuri',
        body: 'Condimente simple, mixuri, ierburi aromatice, plante uscate, ceaiuri vrac.',
      },
      {
        name: 'Cereale, semințe & pseudocereale',
        body: 'Cereale, semințe, boabe, produse gluten free și materii prime pentru ambalare.',
      },
      {
        name: 'Nuci, oleaginoase & fructe uscate',
        body: 'Alune, miez de nucă, migdale, semințe crude sau coapte, fructe uscate.',
      },
      {
        name: 'Făinuri, pudre & produse speciale',
        body: 'Făinuri, pudre, ingrediente speciale, produse la cerere și variante pentru producție.',
      },
      {
        name: 'FMCG & produse standard B2B',
        body: 'Produse ambalate, non-food standard, distribuție, retail și private label.',
      },
    ],
  },
  stats: {
    srTitle: 'Angrosist în cifre',
    items: [
      { value: '1.320+', label: 'produse în catalog' },
      { value: '13', label: 'categorii B2B' },
      { value: 'de la 100 kg', label: 'MOQ pe produs' },
      { value: '24–48h', label: 'timp de răspuns' },
    ],
  },
  moq: {
    anchor: 'de la 100 kg / lot',
    note: 'Minimum ~100 kg per produs; loturi standard 250 / 500 / 750 / 1000 kg.',
  },
  segments: {
    eyebrow: 'Pentru cine',
    title: 'Aprovizionăm tot lanțul B2B',
    copy: 'Producție · Distribuție · Retail · HoReCa — aceleași standarde de verificare și livrare pentru fiecare.',
    items: [
      { name: 'Producție', body: 'Materii prime și ingrediente pentru linii de producție.' },
      { name: 'Distribuție', body: 'Volume recurente și forecast pentru distribuitori.' },
      { name: 'Retail', body: 'FMCG, private label și produse standard pentru raft.' },
      { name: 'HoReCa', body: 'Aprovizionare constantă pentru bucătării și lanțuri.' },
    ],
  },
  process: {
    eyebrow: 'Cum funcționează',
    title: 'Trei pași până la ofertă',
    steps: [
      {
        title: 'Trimiți necesarul',
        body: 'Produsul, cantitatea, destinația și orice cerință specială. Fără cont, fără formulare.',
      },
      {
        title: 'Verificăm disponibilitatea',
        body: 'Stoc, termen de livrare, documente și opțiuni comerciale.',
      },
      {
        title: 'Primești oferta personalizată',
        body: 'Preț, ambalare, termen, condiții logistice și documente disponibile.',
      },
    ],
    cta: 'Vezi fluxul complet',
  },
  trust: {
    eyebrow: 'Încredere',
    title: 'B2B, verificat și conform',
    items: [
      {
        title: 'Doar B2B, verificat după CUI',
        body: 'Verificăm firmele după CUI. Fără persoane fizice și fără liste publice de prețuri.',
      },
      {
        title: 'Conform GDPR',
        body: 'Consimțământ, drepturi GDPR și ștergerea datelor la cerere.',
      },
      {
        title: 'Companie reală, din România',
        body: 'Operat în ecosistemul EURO INTERMED SOLUTIONS · J8/735/2018 · CUI 39132147 · Brașov.',
      },
    ],
  },
  ecosystem: {
    eyebrow: 'Ecosistemul Euro Intermed',
    title: 'Ruta greșită? Te trimitem unde trebuie',
    copy: 'Angrosist este canalul de sourcing. Pentru clearance sau alte oportunități, folosește canalul potrivit din ecosistem.',
    pillars: [
      {
        key: 'hub',
        badge: 'Hub B2B',
        name: 'Euro Intermed',
        line: 'Punctul central care direcționează fiecare cerere pe canalul potrivit.',
        cta: 'Deschide Euro Intermed',
        roadmap: false,
      },
      {
        key: 'palletclearance',
        badge: 'Clearance & Overstock',
        name: 'PalletClearance',
        line: 'Stoc blocat, near-expiry, lichidare sau overstock — vinde pe loturi.',
        cta: 'Deschide PalletClearance',
        roadmap: false,
      },
      {
        key: 'skalyou',
        badge: 'În dezvoltare',
        name: 'SkalYou',
        line: 'Scalare B2B asistată de AI — în construcție.',
        cta: 'Află despre SkalYou',
        roadmap: true,
      },
    ],
  },
  faq: {
    eyebrow: 'Întrebări frecvente',
    title: 'Clarificări înainte de primul contact',
    items: [
      {
        q: 'Lucrați și cu persoane fizice?',
        a: 'Nu. Angrosist.ro este dedicat solicitărilor B2B și lucrăm cu firme, producători, distribuitori, retaileri, HoReCa, procesatori și alți cumpărători sau furnizori comerciali.',
      },
      {
        q: 'De ce nu afișați prețuri fixe pentru toate produsele?',
        a: 'În B2B, prețul depinde de cantitate, ambalare, disponibilitate, termen, locație de livrare, frecvență și documentele necesare. De aceea, ofertele sunt personalizate pe cerere.',
      },
      {
        q: 'Pot trimite o listă de produse?',
        a: 'Da. Poți trimite o listă scurtă pe WhatsApp sau cu asistentul AI. Dacă lista este mai amplă, echipa îți va indica cea mai bună metodă de transmitere.',
      },
      {
        q: 'Am stoc overstock sau near-expiry. Este potrivit pentru Angrosist?',
        a: 'Pentru clearance, overstock, near-expiry, lichidări sau stocuri blocate, folosim PalletClearance. Angrosist este pentru aprovizionare standard, sourcing și cereri B2B recurente.',
      },
      {
        q: 'Trebuie să folosesc asistentul AI?',
        a: 'Nu. Poți folosi WhatsApp sau emailul. Asistentul AI este doar o metodă de calificare a cererii atunci când este disponibil.',
      },
    ],
  },
  contactCta: {
    eyebrow: 'Începe acum',
    title: 'Ai nevoie de materii prime sau produse vrac?',
    copy: 'Trimite-ne necesarul cât mai clar, iar noi verificăm disponibilitatea și revenim cu următorii pași. CUI-ul, documentele și prețurile se discută ulterior.',
    primary: 'Trimite necesarul pe WhatsApp',
    secondary: 'Vezi opțiunile de contact',
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Continuă pe WhatsApp',
    lead: 'Fără formulare. Alege ce descrie cererea ta, iar noi pregătim mesajul de WhatsApp pentru tine. Poți folosi și asistentul AI din colțul paginii — același flux, calificat în timp real.',
    chooseLabel: 'Alege ce descrie cererea ta',
    intentOptions: [
      {
        value: 'sourcing-flow',
        label: 'Caut produs / furnizor',
        wa: 'Buna ziua. Am nevoie de sourcing B2B. Produs/categorie: ___ · Cantitate: ___ · Livrare: ___',
      },
      {
        value: 'recurring-supply',
        label: 'Aprovizionare recurentă',
        wa: 'Buna ziua. Caut aprovizionare recurenta. Produs/categorie: ___ · Cantitate estimata: ___ · Frecventa: ___ · Livrare: ___',
      },
      {
        value: 'product-list',
        label: 'Listă de produse',
        wa: 'Buna ziua. Vreau sa trimit o lista de produse pentru cerere oferta B2B. Categorii principale: ___ · Livrare: ___',
      },
      {
        value: 'standard-supplier',
        label: 'Sunt furnizor standard',
        wa: 'Buna ziua. Sunt furnizor B2B cu marfa standard/recurenta. Categorie: ___ · Tara/stoc: ___ · Disponibilitate: ___',
      },
      {
        value: 'clearance-redirect',
        label: 'Clearance / overstock',
        wa: 'Buna ziua. Am stoc clearance/overstock si vreau sa discut prin PalletClearance. Categorie: ___ · Cantitate: ___ · Locatie: ___',
      },
      {
        value: 'other-b2b',
        label: 'Altă oportunitate B2B',
        wa: 'Buna ziua. Am o oportunitate B2B si vreau sa discut cu Euro Intermed. Detalii: ___',
      },
    ],
    whatsapp: {
      helper: 'Mesajul de WhatsApp se precompletează în funcție de ruta aleasă.',
      cta: 'Scrie-ne pe WhatsApp',
    },
    widget: {
      eyebrow: 'Asistent B2B',
      title: 'Sau discută cu asistentul AI',
      body: 'Asistentul din colțul din dreapta-jos califică și direcționează cererea ta în timp real, pe același flux ca WhatsApp.',
    },
    next: {
      eyebrow: 'Ce urmează',
      items: [
        'Cererea este analizată în funcție de ruta aleasă.',
        'Echipa verifică disponibilitatea și poate cere detalii suplimentare.',
        'CUI-ul, documentele și prețurile se discută ulterior, nu la primul pas.',
      ],
    },
    direct: {
      eyebrow: 'Contact direct',
      email: 'Email',
      phone: 'Telefon',
      calendlyCta: 'Deschide Calendly',
    },
  },
  catalog: {
    eyebrow: 'Catalog B2B',
    title: 'Produse orientative, comandă în câteva secunde',
    lead: 'Catalog orientativ de categorii și produse B2B. Prețurile finale se stabilesc pe cerere, în funcție de volum, ambalare și destinație. Apasă „Comandă" și continuă pe WhatsApp sau cu asistentul AI.',
    // Categories overview (/produse) + per-category pages (/produse/[slug]).
    overviewEyebrow: 'Catalog B2B',
    overviewTitle: 'Explorează categoriile de produse',
    overviewLead: 'Alege o categorie ca să vezi produsele disponibile. Prețurile se stabilesc pe cerere, în funcție de volum, ambalare și destinație — apasă „Comandă" și continuă pe WhatsApp sau cu asistentul AI.',
    categoriesWord: 'categorii',
    viewProducts: 'Vezi produsele',
    backToCategories: 'Toate categoriile',
    // 3-level browse: L1 page section headings.
    subcategoriesTitle: 'Subcategorii',
    directProductsTitle: 'Produse din {category}',
    // Search + multi-select toolbar on a category page.
    searchPlaceholder: 'Caută în categorie…',
    searchEmpty: 'Niciun produs pentru „{q}".',
    headSelect: 'Selectează',
    selectAll: 'Selectează tot',
    selectedCount: '{n} selectate',
    orderSelected: 'Comandă selectate',
    clearSelection: 'Renunță',
    selectHint: 'Bifează produsele și trimite o singură cerere pentru toate.',
    categoryIntro:
      'Produse din categoria „{category}". Prețurile se stabilesc pe cerere; apasă „Comandă" pentru a continua pe WhatsApp sau cu asistentul AI.',
    categoryMetaTitle: '{category} | Catalog B2B — Angrosist.ro',
    categoryMetaDescription:
      'Produse B2B din categoria {category} ({count} produse orientative). Comandă rapid pe WhatsApp sau cu asistentul AI — preț pe cerere, în funcție de volum și livrare.',
    filterAll: 'Toate',
    filterLabel: 'Filtrează după categorie',
    loading: 'Se încarcă catalogul…',
    empty: 'Catalogul se actualizează. Revino curând sau trimite necesarul pe WhatsApp.',
    error: 'Nu am putut încărca catalogul. Încearcă din nou sau scrie-ne pe WhatsApp.',
    retry: 'Reîncearcă',
    sampleNote:
      'Catalog demonstrativ. Produsele reale sunt actualizate de echipă.',
    orderCta: 'Comandă',
    priceLabel: 'Preț orientativ',
    unitLabel: 'Unitate',
    perUnit: '/',
    imageAlt: 'Imagine produs',
    headImage: 'Imagine',
    headProduct: 'Produs',
    headCategory: 'Categorie',
    headDesc: 'Descriere',
    seeMore: 'Vezi mai mult',
    seeLess: 'Vezi mai puțin',
    headUnit: 'Unitate',
    headPrice: 'Preț',
    headOrder: 'Comandă',
    priceEmpty: '—',
    results: 'produse',
    // Product detail modal (opened by tapping a row).
    detailsTitle: 'Detalii produs',
    labelSku: 'Cod SKU',
    labelCategory: 'Categorie',
    labelUnit: 'Unitate',
  },
  order: {
    sheetTitle: 'Cum vrei să comanzi?',
    sheetBody: 'Alege canalul preferat. Mesajul se precompletează cu produsul ales.',
    whatsapp: 'Continuă pe WhatsApp',
    widget: 'Continuă în chat',
    close: 'Închide',
    // {product} / {sku} / {category} / {unit} / {details} placeholders filled at runtime.
    message:
      'Bună ziua! Vreau să comand prin Angrosist.\nProdus: {product}\nCod SKU: {sku}\nCategorie: {category}\nAmbalaj: {unit}\nDetalii: {details}\nCantitate: ___\nLivrare: ___\nSursă: catalog online',
    // Multiple products: an intro line, one numbered {product}/{sku}/{unit}/{details}
    // line per item, then an outro.
    messageMultiIntro:
      'Bună ziua! Vreau să comand prin Angrosist următoarele produse din categoria {category}:',
    messageMultiItem: '{n}. {product} — Cod SKU: {sku} — Ambalaj: {unit} — Detalii: {details}',
    messageMultiOutro: 'Cantitate per produs: ___\nLivrare: ___\nSursă: catalog online',
  },
  how: {
    eyebrow: 'Cum funcționează',
    title: 'Un flux simplu, fără cont și fără coș de cumpărături inutil',
    lead: 'Angrosist funcționează ca punct de pornire pentru cereri B2B clare. Descrii necesarul, noi verificăm disponibilitatea și revenim cu o ofertă personalizată.',
    steps: [
      {
        title: 'Trimiți necesarul',
        body: 'Ne spui produsul, cantitatea, destinația și orice cerință specială. Pe WhatsApp sau cu asistentul AI.',
      },
      {
        title: 'Verificăm disponibilitatea',
        body: 'Verificăm stocul, termenul de livrare, documentele și opțiunile comerciale.',
      },
      {
        title: 'Primești oferta personalizată',
        body: 'Oferta poate include preț, ambalare, termen, condiții logistice și documente disponibile.',
      },
      {
        title: 'Construim recurența',
        body: 'Pentru clienți B2B, putem lucra pe forecast, comenzi repetate și aprovizionare planificată.',
      },
    ],
    checklist: {
      eyebrow: 'Răspuns mai util',
      title: 'Ce să incluzi pentru o cerere mai clară',
      items: [
        'Produs sau categorie',
        'Cantitate estimată',
        'Localitate / țară de livrare',
        'Frecvența comenzii, dacă este recurentă',
        'Ambalare sau documente importante',
        'Metoda preferată de contact',
      ],
    },
    cta: {
      title: 'Gata să trimiți necesarul?',
      copy: 'Un mesaj scurt e suficient pentru primul pas.',
      primary: 'Trimite pe WhatsApp',
      secondary: 'Vezi produsele',
    },
  },
  footer: {
    tagline:
      'Canal de sourcing B2B pentru materii prime, produse vrac, FMCG și aprovizionare recurentă. Operat în ecosistemul EURO INTERMED SOLUTIONS.',
    explore: 'Explorează',
    ecosystem: 'Ecosistem',
    legal: 'Legal',
    contact: 'Contact',
    linkProduse: 'Produse',
    linkHow: 'Cum funcționează',
    linkContact: 'Contact',
    privacy: 'Politică de confidențialitate',
    terms: 'Termeni și condiții',
    gdpr: 'GDPR & ștergerea datelor',
    legalNote: 'Textele juridice sunt în curs de revizuire finală înainte de lansarea publică.',
    rights: '© 2026 EURO INTERMED SOLUTIONS',
    reg: 'Reg. Com.: J8/735/2018 · CUI: 39132147',
  },
  cookie: {
    message:
      'Folosim cookie-uri de analiză pentru a înțelege traficul. Nu se activează fără acordul tău.',
    accept: 'Accept',
    reject: 'Refuz',
    label: 'Consimțământ cookie',
  },
  theme: { toggle: 'Schimbă tema', light: 'Temă deschisă', dark: 'Temă întunecată' },
  notFound: {
    title: 'Pagina nu a fost găsită',
    body: 'Pagina căutată nu există sau a fost mutată. Revino la pagina principală.',
    cta: 'Înapoi la pagina principală',
  },
  legal: {
    backToSite: 'Înapoi la site',
    updated: 'Ultima actualizare',
  },
}

const en: typeof ro = {
  meta: {
    homeTitle: 'Angrosist.ro | B2B sourcing for raw materials and bulk products',
    homeDescription:
      'Send your needs and get the right B2B offer for raw materials, bulk products, FMCG and recurring supply. Quotes based on product, quantity and delivery location.',
    produseTitle: 'Products | Indicative B2B catalog — Angrosist.ro',
    produseDescription:
      'Indicative catalog of B2B categories and products: raw materials, spices, grains, nuts, flours and FMCG. Order fast on WhatsApp or with the AI assistant.',
    howTitle: 'How it works | B2B sourcing — Angrosist.ro',
    howDescription:
      'From your needs to a tailored offer in four simple steps — no account, no unnecessary shopping cart. See what to include for a clearer B2B request.',
    contactTitle: 'Contact | Angrosist.ro',
    contactDescription:
      'Continue on WhatsApp with your request pre-filled or talk to the AI assistant. Sourcing, recurring supply or a supplier offer.',
    notFoundTitle: 'Page not found | Angrosist.ro',
  },
  brand: {
    name: 'Angrosist.ro',
    tagline: 'B2B sourcing',
    mark: 'AG',
  },
  nav: {
    skip: 'Skip to content',
    home: 'Home',
    produse: 'Products',
    how: 'How it works',
    faq: 'FAQ',
    contact: 'Contact',
    cta: 'Message us on WhatsApp',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
  },
  hero: {
    badge: 'B2B only · Sourcing · Raw materials · Bulk products',
    title: 'Send your needs. Get the right B2B offer.',
    lead: 'Angrosist.ro helps companies quickly find raw materials, bulk products, FMCG and supply solutions for production, distribution, retail and HoReCa. Offers are tailored to product, quantity, availability and delivery location.',
    primary: 'See products',
    secondary: 'How it works',
    whatsapp: 'Send your needs on WhatsApp',
    whatsappText:
      'Hello. I need B2B sourcing. Product/category: ___ · Quantity: ___ · Delivery: ___',
    trustLine:
      'Reply based on your request · Companies only · Offers by volume and destination',
    panel: {
      kicker: 'B2B request · example',
      status: 'Qualifying',
      product: { label: 'Product', value: 'Chia seeds' },
      quantity: { label: 'Quantity', value: '100 kg / month' },
      delivery: { label: 'Delivery', value: 'Brașov, RO' },
      flow: ['Needs', 'Qualification', 'Tailored offer'],
    },
  },
  value: {
    eyebrow: 'Why Angrosist',
    title: 'From raw materials to recurring supply',
    copy: 'A clear starting point for B2B requests — without turning the page into a crowded catalog or an online shop.',
    items: [
      {
        title: 'Offer based on your request',
        body: 'Send the product, quantity and delivery. Price is set by volume, packaging and destination.',
      },
      {
        title: 'B2B only, CUI-verified',
        body: 'We work with companies, producers, distributors, retailers and HoReCa — not individuals.',
      },
      {
        title: 'Reply on WhatsApp, in minutes',
        body: 'No long forms. Message us on WhatsApp or the AI assistant and get the first step fast.',
      },
      {
        title: 'Recurring supply',
        body: 'For monthly volumes, forecasts, repeat orders and planned commercial terms.',
      },
    ],
  },
  categories: {
    eyebrow: 'B2B categories',
    title: 'Indicative categories, not public price lists',
    copy: 'Browse the indicative catalog or send a short description if your needs are mixed.',
    cta: 'See the catalog',
    moqNote:
      'Minimum ~100 kg per product (SKU); standard lots of 250 / 500 / 750 / 1000 kg. Multiple products can add up to the volume.',
    items: [
      {
        name: 'Raw materials & auxiliaries',
        body: 'Ingredients, fats, flavours, additives, sweeteners, salt, sugar and auxiliary materials.',
      },
      {
        name: 'Spices, herbs & blends',
        body: 'Single spices, blends, aromatic herbs, dried plants, bulk teas.',
      },
      {
        name: 'Grains, seeds & pseudo-cereals',
        body: 'Grains, seeds, beans, gluten-free products and raw materials for packaging.',
      },
      {
        name: 'Nuts, oilseeds & dried fruit',
        body: 'Hazelnuts, walnut kernels, almonds, raw or roasted seeds, dried fruit.',
      },
      {
        name: 'Flours, powders & special products',
        body: 'Flours, powders, special ingredients, made-to-order products and production variants.',
      },
      {
        name: 'FMCG & standard B2B products',
        body: 'Packaged goods, standard non-food, distribution, retail and private label.',
      },
    ],
  },
  stats: {
    srTitle: 'Angrosist in numbers',
    items: [
      { value: '1,320+', label: 'products in the catalog' },
      { value: '13', label: 'B2B categories' },
      { value: 'from 100 kg', label: 'MOQ per product' },
      { value: '24–48h', label: 'response time' },
    ],
  },
  moq: {
    anchor: 'from 100 kg / lot',
    note: 'Minimum ~100 kg per product; standard lots of 250 / 500 / 750 / 1000 kg.',
  },
  segments: {
    eyebrow: 'Who we serve',
    title: 'We supply the whole B2B chain',
    copy: 'Production · Distribution · Retail · HoReCa — the same verification and delivery standards for each.',
    items: [
      { name: 'Production', body: 'Raw materials and ingredients for production lines.' },
      { name: 'Distribution', body: 'Recurring volumes and forecasts for distributors.' },
      { name: 'Retail', body: 'FMCG, private label and standard shelf products.' },
      { name: 'HoReCa', body: 'Steady supply for kitchens and chains.' },
    ],
  },
  process: {
    eyebrow: 'How it works',
    title: 'Three steps to an offer',
    steps: [
      {
        title: 'Send your needs',
        body: 'Product, quantity, destination and any special requirements. No account, no forms.',
      },
      {
        title: 'We check availability',
        body: 'Stock, delivery time, documents and commercial options.',
      },
      {
        title: 'You get a tailored offer',
        body: 'Price, packaging, timing, logistics terms and available documents.',
      },
    ],
    cta: 'See the full flow',
  },
  trust: {
    eyebrow: 'Trust',
    title: 'B2B, verified and compliant',
    items: [
      {
        title: 'B2B only, CUI-verified',
        body: 'We verify companies by tax ID. No individuals and no public price lists.',
      },
      {
        title: 'GDPR-compliant',
        body: 'Consent, GDPR rights and data deletion on request.',
      },
      {
        title: 'A real Romanian company',
        body: 'Operated in the EURO INTERMED SOLUTIONS ecosystem · J8/735/2018 · VAT 39132147 · Brașov.',
      },
    ],
  },
  ecosystem: {
    eyebrow: 'The Euro Intermed ecosystem',
    title: 'Wrong route? We point you the right way',
    copy: 'Angrosist is the sourcing channel. For clearance or other opportunities, use the right channel in the ecosystem.',
    pillars: [
      {
        key: 'hub',
        badge: 'B2B hub',
        name: 'Euro Intermed',
        line: 'The central point that routes every request to the right channel.',
        cta: 'Open Euro Intermed',
        roadmap: false,
      },
      {
        key: 'palletclearance',
        badge: 'Clearance & Overstock',
        name: 'PalletClearance',
        line: 'Blocked stock, near-expiry, liquidation or overstock — sell by the lot.',
        cta: 'Open PalletClearance',
        roadmap: false,
      },
      {
        key: 'skalyou',
        badge: 'In development',
        name: 'SkalYou',
        line: 'AI-assisted B2B scaling — in the works.',
        cta: 'About SkalYou',
        roadmap: true,
      },
    ],
  },
  faq: {
    eyebrow: 'Frequently asked',
    title: 'Clarifications before the first contact',
    items: [
      {
        q: 'Do you work with individuals?',
        a: 'No. Angrosist.ro is dedicated to B2B requests and we work with companies, producers, distributors, retailers, HoReCa, processors and other commercial buyers or suppliers.',
      },
      {
        q: 'Why don’t you show fixed prices for every product?',
        a: 'In B2B, price depends on quantity, packaging, availability, timing, delivery location, frequency and required documents. That is why offers are tailored per request.',
      },
      {
        q: 'Can I send a product list?',
        a: 'Yes. You can send a short list on WhatsApp or with the AI assistant. If the list is larger, the team will point you to the best way to send it.',
      },
      {
        q: 'I have overstock or near-expiry stock. Is it right for Angrosist?',
        a: 'For clearance, overstock, near-expiry, liquidation or blocked stock we use PalletClearance. Angrosist is for standard supply, sourcing and recurring B2B requests.',
      },
      {
        q: 'Do I have to use the AI assistant?',
        a: 'No. You can use WhatsApp or email. The AI assistant is just one way to qualify the request when it is available.',
      },
    ],
  },
  contactCta: {
    eyebrow: 'Start now',
    title: 'Need raw materials or bulk products?',
    copy: 'Send us your needs as clearly as possible and we check availability and come back with the next steps. VAT, documents and prices are discussed later.',
    primary: 'Send your needs on WhatsApp',
    secondary: 'See contact options',
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Continue on WhatsApp',
    lead: 'No forms. Pick what describes your request and we prepare the WhatsApp message for you. You can also use the AI assistant in the corner of the page — the same flow, qualified in real time.',
    chooseLabel: 'Pick what describes your request',
    intentOptions: [
      {
        value: 'sourcing-flow',
        label: 'Looking for a product / supplier',
        wa: 'Hello. I need B2B sourcing. Product/category: ___ · Quantity: ___ · Delivery: ___',
      },
      {
        value: 'recurring-supply',
        label: 'Recurring supply',
        wa: 'Hello. I am looking for recurring supply. Product/category: ___ · Estimated quantity: ___ · Frequency: ___ · Delivery: ___',
      },
      {
        value: 'product-list',
        label: 'Product list',
        wa: 'Hello. I want to send a product list for a B2B quote. Main categories: ___ · Delivery: ___',
      },
      {
        value: 'standard-supplier',
        label: 'I am a standard supplier',
        wa: 'Hello. I am a B2B supplier with standard/recurring goods. Category: ___ · Country/stock: ___ · Availability: ___',
      },
      {
        value: 'clearance-redirect',
        label: 'Clearance / overstock',
        wa: 'Hello. I have clearance/overstock stock and want to discuss via PalletClearance. Category: ___ · Quantity: ___ · Location: ___',
      },
      {
        value: 'other-b2b',
        label: 'Another B2B opportunity',
        wa: 'Hello. I have a B2B opportunity and want to talk to Euro Intermed. Details: ___',
      },
    ],
    whatsapp: {
      helper: 'The WhatsApp message pre-fills based on the route you choose.',
      cta: 'Message us on WhatsApp',
    },
    widget: {
      eyebrow: 'B2B assistant',
      title: 'Or talk to the AI assistant',
      body: 'The assistant in the bottom-right corner qualifies and routes your request in real time, on the same flow as WhatsApp.',
    },
    next: {
      eyebrow: 'What happens next',
      items: [
        'The request is reviewed based on the chosen route.',
        'The team checks availability and may ask for more details.',
        'VAT, documents and prices are discussed later, not at the first step.',
      ],
    },
    direct: {
      eyebrow: 'Direct contact',
      email: 'Email',
      phone: 'Phone',
      calendlyCta: 'Open Calendly',
    },
  },
  catalog: {
    eyebrow: 'B2B catalog',
    title: 'Indicative products, order in seconds',
    lead: 'An indicative catalog of B2B categories and products. Final prices are set per request, based on volume, packaging and destination. Tap “Order” and continue on WhatsApp or with the AI assistant.',
    // Categories overview (/produse) + per-category pages (/produse/[slug]).
    overviewEyebrow: 'B2B catalog',
    overviewTitle: 'Browse the product categories',
    overviewLead: 'Pick a category to see the products available. Prices are set per request, based on volume, packaging and destination — tap “Order” and continue on WhatsApp or with the AI assistant.',
    categoriesWord: 'categories',
    viewProducts: 'View products',
    backToCategories: 'All categories',
    // 3-level browse: L1 page section headings.
    subcategoriesTitle: 'Subcategories',
    directProductsTitle: 'Products in {category}',
    // Search + multi-select toolbar on a category page.
    searchPlaceholder: 'Search in category…',
    searchEmpty: 'No products for “{q}”.',
    headSelect: 'Select',
    selectAll: 'Select all',
    selectedCount: '{n} selected',
    orderSelected: 'Order selected',
    clearSelection: 'Clear',
    selectHint: 'Tick products and send a single request for all of them.',
    categoryIntro:
      'Products in the “{category}” category. Prices are set per request; tap “Order” to continue on WhatsApp or with the AI assistant.',
    categoryMetaTitle: '{category} | B2B catalog — Angrosist.ro',
    categoryMetaDescription:
      'B2B products in the {category} category ({count} indicative products). Order fast on WhatsApp or with the AI assistant — price on request, based on volume and delivery.',
    filterAll: 'All',
    filterLabel: 'Filter by category',
    loading: 'Loading the catalog…',
    empty: 'The catalog is being updated. Check back soon or send your needs on WhatsApp.',
    error: 'We could not load the catalog. Try again or message us on WhatsApp.',
    retry: 'Try again',
    sampleNote: 'Demo catalog. Real products are kept up to date by the team.',
    orderCta: 'Order',
    priceLabel: 'Indicative price',
    unitLabel: 'Unit',
    perUnit: '/',
    imageAlt: 'Product image',
    headImage: 'Image',
    headProduct: 'Product',
    headCategory: 'Category',
    headDesc: 'Description',
    seeMore: 'See more',
    seeLess: 'See less',
    headUnit: 'Unit',
    headPrice: 'Price',
    headOrder: 'Order',
    priceEmpty: '—',
    results: 'products',
    // Product detail modal (opened by tapping a row).
    detailsTitle: 'Product details',
    labelSku: 'SKU',
    labelCategory: 'Category',
    labelUnit: 'Unit',
  },
  order: {
    sheetTitle: 'How would you like to order?',
    sheetBody: 'Pick your preferred channel. The message is pre-filled with the chosen product.',
    whatsapp: 'Continue on WhatsApp',
    widget: 'Continue in chat',
    close: 'Close',
    // {product} / {sku} / {category} / {unit} / {details} placeholders filled at runtime.
    message:
      'Hello! I want to order via Angrosist.\nProduct: {product}\nSKU: {sku}\nCategory: {category}\nPackaging: {unit}\nDetails: {details}\nQuantity: ___\nDelivery: ___\nSource: online catalog',
    messageMultiIntro:
      'Hello! I want to order the following products via Angrosist, from the {category} category:',
    messageMultiItem: '{n}. {product} — SKU: {sku} — Packaging: {unit} — Details: {details}',
    messageMultiOutro: 'Quantity per product: ___\nDelivery: ___\nSource: online catalog',
  },
  how: {
    eyebrow: 'How it works',
    title: 'A simple flow — no account, no unnecessary shopping cart',
    lead: 'Angrosist works as a starting point for clear B2B requests. You describe your needs, we check availability and come back with a tailored offer.',
    steps: [
      {
        title: 'Send your needs',
        body: 'Tell us the product, quantity, destination and any special requirements. On WhatsApp or with the AI assistant.',
      },
      {
        title: 'We check availability',
        body: 'We check stock, delivery time, documents and commercial options.',
      },
      {
        title: 'You get a tailored offer',
        body: 'The offer can include price, packaging, timing, logistics terms and available documents.',
      },
      {
        title: 'We build recurrence',
        body: 'For B2B clients, we can work on forecasts, repeat orders and planned supply.',
      },
    ],
    checklist: {
      eyebrow: 'A more useful reply',
      title: 'What to include for a clearer request',
      items: [
        'Product or category',
        'Estimated quantity',
        'Delivery city / country',
        'Order frequency, if recurring',
        'Important packaging or documents',
        'Preferred contact method',
      ],
    },
    cta: {
      title: 'Ready to send your needs?',
      copy: 'A short message is enough for the first step.',
      primary: 'Send on WhatsApp',
      secondary: 'See products',
    },
  },
  footer: {
    tagline:
      'A B2B sourcing channel for raw materials, bulk products, FMCG and recurring supply. Operated in the EURO INTERMED SOLUTIONS ecosystem.',
    explore: 'Explore',
    ecosystem: 'Ecosystem',
    legal: 'Legal',
    contact: 'Contact',
    linkProduse: 'Products',
    linkHow: 'How it works',
    linkContact: 'Contact',
    privacy: 'Privacy policy',
    terms: 'Terms & conditions',
    gdpr: 'GDPR & data deletion',
    legalNote: 'The legal texts are under final review before public launch.',
    rights: '© 2026 EURO INTERMED SOLUTIONS',
    reg: 'Reg. No.: J8/735/2018 · VAT: 39132147',
  },
  cookie: {
    message:
      'We use analytics cookies to understand traffic. They stay off until you agree.',
    accept: 'Accept',
    reject: 'Decline',
    label: 'Cookie consent',
  },
  theme: { toggle: 'Switch theme', light: 'Light theme', dark: 'Dark theme' },
  notFound: {
    title: 'Page not found',
    body: 'The page you are looking for does not exist or has moved. Return to the home page.',
    cta: 'Back to the home page',
  },
  legal: {
    backToSite: 'Back to site',
    updated: 'Last updated',
  },
}

export const ui: Record<Locale, typeof ro> = { ro, en }
