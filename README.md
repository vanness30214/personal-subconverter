# Personal Subconverter Page

Pure static subscription converter page. No Vue, no build step, and no Node dependency is required for deployment.

## Features

- Split every common subconverter parameter into its own control.
- Show a short explanation beside each option.
- Save edited values in browser local storage.
- Generate, copy, and open the final `/sub` conversion URL.
- Deploy directly to GitHub Pages through GitHub Actions.

## Default parameters

```text
target=clash
config=https://raw.githubusercontent.com/vanness30214/clash-rule/main/config/metafenliu.ini
include=
exclude=
emoji=false
list=false
sort=true
udp=true
scv=true
append_type=true
fdn=true
expand=false
classic=true
```

## Private subscription

`config.local.js` contains the local private subscription preset and is ignored by Git. Do not commit it to a public repository.

For a public GitHub Pages deployment, paste the subscription link once in the browser. The page will store it in local storage.

## Deploy

1. Commit this directory as the root of a GitHub repository.
2. Keep `config.local.js` uncommitted.
3. In repository settings, set Pages source to GitHub Actions.
4. Push to `main`; `.github/workflows/pages.yml` will publish the page.
