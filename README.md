# DeskDash

Ajman office and school quick-commerce demo. The catalogue, cart, checkout, and tracking all run in the browser. Nothing is sent to a server.

## Run it

From this folder, in Command Prompt or any terminal:

```
npm install
npm run dev
```

Open http://localhost:3000. The first visit in a browser session shows the splash for about 1.6 seconds.

```
npm run build
npm run lint
npm test
```

`npm test` checks bulk pricing, delivery bands, VAT, stock caps, and search.

## Demo controls

Add `?demo=1` to any page, or press and hold the logo (desktop header, splash, or the delivery line on the phone header) for about half a second. From there you can reset state, fill an office or school cart, speed up tracking, switch Arabic, or jump to a screen.

Cart, mode, language, area, and past orders persist in `localStorage` under `deskdash-session`.

## What you are looking at

Prices are in AED. Delivery is 5 under 50, 3 from 50, and free from 100. Handling is 2. VAT is 5% on merchandise after bulk discount, plus delivery and handling. Card numbers typed at checkout are not stored.

Product pictures are original illustrations, not photographs. See `ASSETS.md` to swap them.
