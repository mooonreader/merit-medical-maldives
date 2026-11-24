/* =====================================================================
   Merit Medical Maldives — catalogue data
   ---------------------------------------------------------------------
   This file is the website's product model. In Release 2 it is replaced
   by a scheduled export from Zoho (item groups → families, items → variants).
   Rules:
   - Every variant has a unique SKU (the Zoho SKU).
   - A family with `steps` gets a configurator. Steps are asked in order;
     each step's key must exist on every variant's `attrs`.
   - A family without `steps` is a simple add-to-list item (one variant).
   ===================================================================== */
window.MM_CONFIG = {
  company: "Merit Medical Maldives",
  parent: "VIYANA Pvt Ltd",
  phone: "+960 996 3080",
  email: "merit.medical@viyana.biz",
  address: "Carpenter Villa, 8th floor, Malé",
  hours: "",            // add opening hours when confirmed, e.g. "Sun to Thu, 8:00 to 17:00"
  mapQuery: "Carpenter Villa, Male, Maldives",
  facebook: "https://www.facebook.com/p/Merit-Medical-Maldives-61579658083510/",
  linkedin: "https://mv.linkedin.com/in/merit-medical-maldives-221072294",
  website: "https://viyana.biz",
  whatsapp: "",         // digits only, e.g. "9609963080", once confirmed
  // Quotation delivery. Paste a Web3Forms access key (free, emails the
  // sales inbox) or any endpoint that accepts JSON POST. Leave empty and
  // the site falls back to opening a pre-filled email to `email` above,
  // so a request is never lost.
  formEndpoint: "",
  web3formsKey: ""
};

window.MM_CATEGORIES = [
  { id: "gloves", name: "Gloves", blurb: "Examination and surgical gloves in every material and size.", icon: "glove" },
  { id: "masks", name: "Masks & Face Protection", blurb: "Surgical masks, respirators and face shields.", icon: "mask" },
  { id: "respiratory", name: "Respiratory Equipment", blurb: "Oxygen concentrators, nebulisers and consumables.", icon: "lungs" },
  { id: "diagnostics", name: "Diagnostics & Monitoring", blurb: "BP monitors, oximeters, thermometers and test kits.", icon: "pulse" },
  { id: "injection", name: "Syringes & Infusion", blurb: "Syringes, needles, IV cannulas and giving sets.", icon: "syringe" },
  { id: "wound", name: "Wound Care", blurb: "Dressings, gauze, bandages and tapes.", icon: "plus" }
];

window.MM_PRODUCTS = [
  {
    id: "nitrile-exam-gloves",
    image: "img/nitrile-exam-gloves.webp",
    category: "gloves",
    name: "Examination Gloves",
    brand: "CareLine",
    summary: "Ambidextrous, textured-fingertip exam gloves for clinical and general healthcare use.",
    specs: { Standard: "EN 455 · ASTM D6319", Length: "240 mm", Texture: "Fingertip textured", Cuff: "Beaded", Use: "Single use, non-sterile" },
    datasheet: "",
    tags: ["nitrile", "latex", "vinyl", "exam", "ppe"],
    steps: [
      { key: "material", label: "Material" },
      { key: "powder", label: "Powder" },
      { key: "size", label: "Size" },
      { key: "pack", label: "Pack size" }
    ],
    variants: (function () {
      var out = [];
      var mats = { Nitrile: "NIT", Latex: "LTX", Vinyl: "VNL" };
      var sizes = ["XS", "S", "M", "L", "XL"];
      Object.keys(mats).forEach(function (m) {
        ["Powder-free", "Powdered"].forEach(function (p) {
          if (m === "Nitrile" && p === "Powdered") return; // not stocked
          sizes.forEach(function (s) {
            if (m === "Vinyl" && s === "XS") return; // not stocked
            ["Box of 100", "Carton of 1,000"].forEach(function (k) {
              out.push({
                sku: "GLV-" + mats[m] + "-" + (p === "Powdered" ? "PW" : "PF") + "-" + s + "-" + (k.indexOf("1,000") > -1 ? "1000" : "100"),
                attrs: { material: m, powder: p, size: s, pack: k }
              });
            });
          });
        });
      });
      return out;
    })()
  },
  {
    id: "surgical-gloves-sterile",
    image: "img/surgical-gloves-sterile.webp",
    category: "gloves",
    name: "Sterile Surgical Gloves",
    brand: "CareLine",
    summary: "Anatomically shaped, sterile surgical gloves supplied in pairs.",
    specs: { Standard: "EN 455 · ASTM D3577", Sterilisation: "Gamma irradiated", Shape: "Anatomical", Pack: "50 pairs per box" },
    tags: ["sterile", "surgical", "theatre"],
    steps: [
      { key: "material", label: "Material" },
      { key: "size", label: "Size" }
    ],
    variants: (function () {
      var out = [];
      ["Latex", "Polyisoprene (latex-free)"].forEach(function (m) {
        ["6.0", "6.5", "7.0", "7.5", "8.0", "8.5"].forEach(function (s) {
          out.push({ sku: "GLS-" + (m === "Latex" ? "LTX" : "PIP") + "-" + s.replace(".", ""), attrs: { material: m, size: s } });
        });
      });
      return out;
    })()
  },
  {
    id: "surgical-masks",
    image: "img/surgical-masks.webp",
    category: "masks",
    name: "Surgical & Respirator Masks",
    brand: "ShieldPro",
    summary: "Fluid-resistant surgical masks and FFP2/N95 respirators for clinical environments.",
    specs: { Standard: "EN 14683 · EN 149", Layers: "3 – 5 ply", Fit: "Adjustable nose wire" },
    tags: ["mask", "n95", "ffp2", "ppe", "respirator"],
    steps: [
      { key: "type", label: "Type" },
      { key: "fastening", label: "Fastening" },
      { key: "pack", label: "Pack size" }
    ],
    variants: [
      { sku: "MSK-T1-EL-50", attrs: { type: "Type I surgical", fastening: "Ear loops", pack: "Box of 50" } },
      { sku: "MSK-T2R-EL-50", attrs: { type: "Type IIR surgical", fastening: "Ear loops", pack: "Box of 50" } },
      { sku: "MSK-T2R-TI-50", attrs: { type: "Type IIR surgical", fastening: "Tie-on", pack: "Box of 50" } },
      { sku: "MSK-T2R-EL-2000", attrs: { type: "Type IIR surgical", fastening: "Ear loops", pack: "Carton of 2,000" } },
      { sku: "MSK-FFP2-EL-20", attrs: { type: "FFP2 / N95 respirator", fastening: "Ear loops", pack: "Box of 20" } },
      { sku: "MSK-FFP2-HB-20", attrs: { type: "FFP2 / N95 respirator", fastening: "Head bands", pack: "Box of 20" } }
    ]
  },
  {
    id: "face-shield",
    image: "img/face-shield.webp",
    category: "masks",
    name: "Full Face Shield",
    brand: "ShieldPro",
    summary: "Anti-fog, optically clear PET face shield with foam brow and elastic band.",
    specs: { Material: "PET, anti-fog", Thickness: "0.25 mm", Pack: "Box of 10" },
    tags: ["visor", "shield", "ppe"],
    variants: [{ sku: "FSH-PET-10", attrs: {} }]
  },
  {
    id: "oxygen-concentrator",
    image: "img/oxygen-concentrator.webp",
    category: "respiratory",
    name: "Oxygen Concentrator",
    brand: "AeroLife",
    summary: "Quiet, continuous-flow oxygen concentrators for home care, clinics and island health centres.",
    specs: { Purity: "93% ± 3%", Noise: "≤ 42 dB", Power: "230 V / 50 Hz", Alarms: "Low purity, power failure, high pressure" },
    tags: ["oxygen", "o2", "concentrator", "home care"],
    steps: [
      { key: "flow", label: "Flow capacity" },
      { key: "model", label: "Model" },
      { key: "accessories", label: "Accessories" }
    ],
    variants: [
      { sku: "OXC-5L-HC-STD", attrs: { flow: "5 L/min", model: "HomeCare 5", accessories: "Standard kit" } },
      { sku: "OXC-5L-HC-NEB", attrs: { flow: "5 L/min", model: "HomeCare 5", accessories: "Standard kit + nebuliser" } },
      { sku: "OXC-5L-PT-STD", attrs: { flow: "5 L/min", model: "Portable 5 (battery)", accessories: "Standard kit" } },
      { sku: "OXC-5L-PT-BAT", attrs: { flow: "5 L/min", model: "Portable 5 (battery)", accessories: "Standard kit + spare battery" } },
      { sku: "OXC-10L-CL-STD", attrs: { flow: "10 L/min", model: "Clinical 10", accessories: "Standard kit" } },
      { sku: "OXC-10L-CL-DUAL", attrs: { flow: "10 L/min", model: "Clinical 10", accessories: "Dual-flow outlet kit" } }
    ]
  },
  {
    id: "nebuliser",
    image: "img/nebuliser.webp",
    category: "respiratory",
    name: "Compressor Nebuliser",
    brand: "AeroLife",
    summary: "Compact piston nebuliser with adult and paediatric masks.",
    specs: { Particle: "MMAD < 5 µm", Rate: "≥ 0.2 ml/min", Includes: "Adult & child masks, mouthpiece" },
    tags: ["nebuliser", "nebulizer", "asthma"],
    variants: [{ sku: "NEB-CMP-01", attrs: {} }]
  },
  {
    id: "nasal-cannula",
    image: "img/nasal-cannula.webp",
    category: "respiratory",
    name: "Nasal Oxygen Cannula",
    brand: "AeroLife",
    summary: "Soft, kink-resistant nasal cannula with 2 m star-lumen tubing.",
    specs: { Tubing: "2.1 m star lumen", Material: "Medical-grade PVC, DEHP-free" },
    tags: ["cannula", "oxygen", "tubing"],
    steps: [{ key: "size", label: "Size" }],
    variants: [
      { sku: "CAN-ADT", attrs: { size: "Adult" } },
      { sku: "CAN-PED", attrs: { size: "Paediatric" } },
      { sku: "CAN-NEO", attrs: { size: "Neonatal" } }
    ]
  },
  {
    id: "bp-monitor",
    image: "img/bp-monitor.webp",
    category: "diagnostics",
    name: "Digital Blood Pressure Monitor",
    brand: "VitaSense",
    summary: "Clinically validated upper-arm monitor with irregular heartbeat detection.",
    specs: { Validation: "ESH-IP 2010", Memory: "2 × 120 readings", Cuff: "22 – 42 cm" },
    tags: ["bp", "blood pressure", "monitor"],
    steps: [{ key: "model", label: "Model" }],
    variants: [
      { sku: "BPM-UA-HOME", attrs: { model: "Upper-arm · Home" } },
      { sku: "BPM-UA-PRO", attrs: { model: "Upper-arm · Professional" } },
      { sku: "BPM-WR-01", attrs: { model: "Wrist" } }
    ]
  },
  {
    id: "pulse-oximeter",
    image: "img/pulse-oximeter.webp",
    category: "diagnostics",
    name: "Fingertip Pulse Oximeter",
    brand: "VitaSense",
    summary: "SpO₂ and pulse rate with a bright OLED display and auto power-off.",
    specs: { SpO2: "70 – 100% (±2%)", PR: "30 – 250 bpm", Battery: "2 × AAA" },
    tags: ["spo2", "oximeter", "pulse"],
    variants: [{ sku: "OXM-FT-01", attrs: {} }]
  },
  {
    id: "rapid-tests",
    image: "img/rapid-tests.webp",
    category: "diagnostics",
    name: "Rapid Diagnostic Test Kits",
    brand: "VitaSense",
    summary: "Point-of-care lateral flow tests with results in 15 minutes.",
    specs: { Format: "Cassette", Storage: "2 – 30 °C", Pack: "25 tests per kit" },
    tags: ["rdt", "test", "dengue", "malaria", "pregnancy"],
    steps: [{ key: "test", label: "Test" }],
    variants: [
      { sku: "RDT-DEN-NS1", attrs: { test: "Dengue NS1 Ag" } },
      { sku: "RDT-DEN-IGG", attrs: { test: "Dengue IgG/IgM" } },
      { sku: "RDT-HCG", attrs: { test: "Pregnancy (hCG)" } },
      { sku: "RDT-MAL", attrs: { test: "Malaria Pf/Pv" } }
    ]
  },
  {
    id: "syringes",
    image: "img/syringes.webp",
    category: "injection",
    name: "Disposable Syringes",
    brand: "FlowMed",
    summary: "Sterile, latex-free Luer syringes with clear, bold graduations.",
    specs: { Sterilisation: "EO", Graduation: "Printed, high contrast", Pack: "Box of 100" },
    tags: ["syringe", "luer", "injection"],
    steps: [
      { key: "volume", label: "Volume" },
      { key: "tip", label: "Tip" },
      { key: "needle", label: "Needle" }
    ],
    variants: (function () {
      var out = [];
      var needles = { "1 ml": ["26G × ½\"", "None"], "3 ml": ["23G × 1\"", "None"], "5 ml": ["22G × 1¼\"", "None"], "10 ml": ["21G × 1½\"", "None"], "50 ml": ["None"] };
      Object.keys(needles).forEach(function (v) {
        var tips = v === "50 ml" ? ["Luer lock"] : ["Luer slip", "Luer lock"];
        tips.forEach(function (t) {
          needles[v].forEach(function (n) {
            out.push({
              sku: "SYR-" + v.replace(" ml", "") + "-" + (t === "Luer lock" ? "LL" : "LS") + "-" + (n === "None" ? "NN" : n.slice(0, 3)),
              attrs: { volume: v, tip: t, needle: n }
            });
          });
        });
      });
      return out;
    })()
  },
  {
    id: "iv-cannula",
    image: "img/iv-cannula.webp",
    category: "injection",
    name: "IV Cannula with Injection Port",
    brand: "FlowMed",
    summary: "PTFE catheter with wings and injection port, colour-coded by gauge.",
    specs: { Catheter: "PTFE, radio-opaque", Pack: "Box of 50" },
    tags: ["iv", "cannula", "catheter"],
    steps: [{ key: "gauge", label: "Gauge" }],
    variants: ["14G", "16G", "18G", "20G", "22G", "24G"].map(function (g) {
      return { sku: "IVC-" + g, attrs: { gauge: g } };
    })
  },
  {
    id: "gauze-swabs",
    image: "img/gauze-swabs.webp",
    category: "wound",
    name: "Gauze Swabs",
    brand: "CareLine",
    summary: "100% cotton, highly absorbent woven gauze swabs.",
    specs: { Material: "100% cotton", Ply: "8 / 12 ply" },
    tags: ["gauze", "swab", "dressing"],
    steps: [
      { key: "size", label: "Size" },
      { key: "sterility", label: "Sterility" }
    ],
    variants: [
      { sku: "GZE-5-NS", attrs: { size: "5 × 5 cm", sterility: "Non-sterile (100)" } },
      { sku: "GZE-5-ST", attrs: { size: "5 × 5 cm", sterility: "Sterile (5 per pouch)" } },
      { sku: "GZE-10-NS", attrs: { size: "10 × 10 cm", sterility: "Non-sterile (100)" } },
      { sku: "GZE-10-ST", attrs: { size: "10 × 10 cm", sterility: "Sterile (5 per pouch)" } }
    ]
  },
  {
    id: "adhesive-dressing",
    image: "img/adhesive-dressing.webp",
    category: "wound",
    name: "Adhesive Island Dressing",
    brand: "CareLine",
    summary: "Non-woven island dressing with low-adherent absorbent pad.",
    specs: { Backing: "Breathable non-woven", Sterile: "Yes", Pack: "Box of 50" },
    tags: ["dressing", "plaster", "wound"],
    steps: [{ key: "size", label: "Size" }],
    variants: [
      { sku: "DRS-6X7", attrs: { size: "6 × 7 cm" } },
      { sku: "DRS-9X10", attrs: { size: "9 × 10 cm" } },
      { sku: "DRS-9X15", attrs: { size: "9 × 15 cm" } },
      { sku: "DRS-9X25", attrs: { size: "9 × 25 cm" } }
    ]
  }
];

// Brands shown on the home page. Only brands confirmed as supplied by
// Merit Medical Maldives (from Maldives Government Gazette award sheets).
window.MM_BRANDS = [
  { name: "Ansell", line: "ENCORE surgical gloves", logo: "img/brand-ansell.png", url: "https://www.ansell.com" },
  { name: "Aerogen", line: "Aerogen Solo nebuliser", logo: "img/brand-aerogen.png", url: "https://www.aerogen.com" }
];

// Customers, confirmed from Maldives Government Gazette award data sheets.
window.MM_CUSTOMERS = [
  { name: "Hulhumalé Hospital", logo: "img/cust-hulhumale.webp", place: "Hulhumalé", since: "2023", what: "Medical consumables, equipment and maintenance items" },
  { name: "Ungoofaaru Regional Hospital", logo: "img/cust-urh.webp", place: "Raa Atoll", since: "2025", what: "Examination and surgical gloves, medical consumables" },
  { name: "Raa Atoll Health Centres", logo: "img/cust-moh.webp", place: "Raa Atoll", since: "2025", what: "Medical consumables, with Ungoofaaru Regional Hospital" }
];
window.MM_ISLANDS = ["Malé", "Hulhumalé", "Villimalé", "Addu City", "Fuvahmulah", "Kulhudhuffushi", "Thinadhoo", "Naifaru", "Eydhafushi", "Other island / resort"];
