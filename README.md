# Merit Medical Maldives — Product catalogue & quotation site

Release 1 of the site described in *Website Scope & Deliverables* (Nov 2026).
Static, dependency-free, mobile-first. Runs on GitHub Pages or any static host.

## What's in it
- Home, About, Contact (map, phone, email, WhatsApp), brands section
- Catalogue with categories, search by name/brand/SKU, filters
- Product pages with specifications and datasheet links
- Step-by-step configurator: unavailable combinations are disabled, every
  finished configuration resolves to exactly one SKU
- Quote list saved on the device (localStorage, with safe fallback), quantity + note per line
- Quotation request form with validation, honeypot + timing spam protection,
  unique reference numbers (`MMQ-YYMMDD-XXXX`), confirmation page, copy/print

## Configure before launch — `data.js`
| Setting | What to put |
|---|---|
| `phone`, `whatsapp`, `email`, `address`, `hours` | Real contact details (currently placeholders) |
| `web3formsKey` | Free key from web3forms.com tied to the sales inbox → requests are emailed automatically, customer gets a copy |
| `formEndpoint` | Alternative: any URL accepting a JSON POST (e.g. a Zoho Flow webhook for Release 2) |

If neither is set, submitting opens the visitor's email app with the full request
pre-filled, so no request is ever silently lost.

## Products
`MM_PRODUCTS` in `data.js` holds the sample catalogue. Each family has `steps`
(configurator order) and `variants` (one per Zoho SKU). Replace with the Zoho
export in Release 2. Product brands shown are placeholders.

## Structure
```
index.html  shell, header, footer
styles.css  all styling
data.js     config + catalogue
app.js      router, configurator, quote list, request flow
```
