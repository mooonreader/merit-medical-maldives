# Merit Medical Maldives: catalogue and quotation site

Static site, no build step and no dependencies. Works on GitHub Pages or any static host.

## Files
- `index.html`: page shell, header, footer, cart drawer
- `styles.css`: light and dark themes (toggle in the header, remembered per device)
- `data.js`: company details, categories, products, brands, islands
- `app.js`: pages, search, configurator, quote list, request flow
- `logo-full.svg`, `logo-mark.svg`, `favicon.svg`: the logo, traced to vector from the official artwork

## Before launch, in `data.js`
- `hours` and `whatsapp`: add when confirmed
- `web3formsKey`: a free key from web3forms.com sends each request to the sales inbox automatically.
  Without it, sending a request opens the customer's email app with everything filled in.
- `MM_PRODUCTS`: sample catalogue. Replace with the real items (Zoho export in Release 2).
  Add `image: "photos/gloves.jpg"` to any product to show a photo instead of the icon.
- `MM_BRANDS`: replace with the manufacturers you distribute, and set `logo` to each logo file.

Pages use simple links: `#catalogue`, `#c-gloves`, `#p-oxygen-concentrator`, `#quote`, `#about`, `#contact`.
