import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { products } from "../data/catalog.mjs";

const outDir = path.join(process.cwd(), "public", "images", "products");
await mkdir(outDir, { recursive: true });

const palettes = {
  paper: ["#F4EFE4", "#F8CB46", "#E7D7A2"],
  toner: ["#2C2C2C", "#F8CB46", "#5C5C5C"],
  ink: ["#1F3A5F", "#4D96FF", "#D9E6F5"],
  labels: ["#FFFFFF", "#256FEF", "#E8EEF8"],
  envelope: ["#C4A574", "#8C6A3D", "#F3E6CF"],
  pen: ["#1F1F1F", "#0C831F", "#F4F0E6"],
  notebook: ["#F7F1E4", "#E23744", "#0C831F"],
  sticky: ["#F8CB46", "#FFE58A", "#E2B423"],
  folder: ["#E7D3A1", "#0C831F", "#F6EFE0"],
  stapler: ["#3E4651", "#C5CDD6", "#F8CB46"],
  punch: ["#3E4651", "#9AA4B0", "#F4F0E6"],
  clips: ["#C0C6CE", "#8E98A3", "#F4F0E6"],
  organiser: ["#4E5964", "#D5DDE4", "#F4F0E6"],
  calculator: ["#1F1F1F", "#F8CB46", "#E8E8E8"],
  mousepad: ["#1F1F1F", "#5C5C5C", "#F4F0E6"],
  lamp: ["#F4F0E6", "#F8CB46", "#1F1F1F"],
  tray: ["#E6E1D6", "#C9C2B4", "#F7F4EE"],
  scissors: ["#C45B63", "#8E99A4", "#F4F0E6"],
  tape: ["#F8CB46", "#E2B423", "#F7F4EE"],
  board: ["#F7F7F5", "#9AA4B0", "#0C831F"],
  coffee: ["#6B3E2E", "#F8CB46", "#EADFD2"],
  tea: ["#0C831F", "#E8F5EA", "#C4A574"],
  water: ["#D7EEF8", "#4D96FF", "#F7FBFD"],
  cup: ["#FFFFFF", "#F8CB46", "#EFE8DA"],
  plate: ["#FFFFFF", "#EFE8DA", "#F7F4EE"],
  cutlery: ["#E7D7B8", "#C4A574", "#F7F4EE"],
  snack: ["#F3D27A", "#C45B4A", "#F7F4EE"],
  sugar: ["#FFFFFF", "#F8CB46", "#F4F0E6"],
  creamer: ["#F7F4EE", "#E7D3A1", "#FFFFFF"],
  tissue: ["#FFFFFF", "#E8F1FF", "#F7F4EE"],
  sanitizer: ["#E8F5EA", "#0C831F", "#FFFFFF"],
  handwash: ["#FFF1D6", "#F8CB46", "#FFFFFF"],
  wipes: ["#E7F2F0", "#0C831F", "#FFFFFF"],
  bags: ["#2F343A", "#5C5C5C", "#F4F0E6"],
  spray: ["#FFFFFF", "#4D96FF", "#E8F1FF"],
  towel: ["#FFFFFF", "#EFE8DA", "#F7F4EE"],
  gloves: ["#FFF6D6", "#F8CB46", "#FFFFFF"],
  cable: ["#1F1F1F", "#F8CB46", "#F4F0E6"],
  battery: ["#0C831F", "#F8CB46", "#1F1F1F"],
  usb: ["#C0C6CE", "#1F1F1F", "#F4F0E6"],
  mouse: ["#F7F4EE", "#1F1F1F", "#E8E8E8"],
  keyboard: ["#F7F4EE", "#1F1F1F", "#E6E1D6"],
  power: ["#FFFFFF", "#1F1F1F", "#F8CB46"],
  adapter: ["#FFFFFF", "#1F1F1F", "#E8E8E8"],
  bubble: ["#F7FBFD", "#D7EEF8", "#FFFFFF"],
  mailer: ["#F3E6CF", "#C4A574", "#8C6A3D"],
  box: ["#E7C99A", "#C4A574", "#F6EFE0"],
  marker: ["#1F1F1F", "#E23744", "#4D96FF"],
  wrap: ["#F7FBFD", "#D7EEF8", "#E8E8E8"],
  eraser: ["#FFFFFF", "#E8F1FF", "#F4F0E6"],
  pins: ["#E23744", "#F8CB46", "#4D96FF"],
  chart: ["#FFFFFF", "#FF6B6B", "#F7F4EE"],
  pencil: ["#F8CB46", "#E7B3A0", "#1F1F1F"],
  sharpener: ["#4D96FF", "#1F1F1F", "#F4F0E6"],
  highlighter: ["#F8CB46", "#B6E3A8", "#FFB4B4"],
  paint: ["#E23744", "#F8CB46", "#4D96FF"],
  brush: ["#C4A574", "#1F1F1F", "#F4F0E6"],
  glue: ["#FFFFFF", "#0C831F", "#E8F5EA"],
  clay: ["#FF6B6B", "#F8CB46", "#4D96FF"],
  glitter: ["#FF6B6B", "#F8CB46", "#4D96FF"],
  geometry: ["#0C831F", "#1F1F1F", "#F4F0E6"],
  ruler: ["#F7F4EE", "#1F1F1F", "#E8E8E8"],
  bag: ["#1F4E3A", "#0C831F", "#F8CB46"],
  lunch: ["#4D96FF", "#FFFFFF", "#E8F1FF"],
  bottle: ["#E8F1FF", "#4D96FF", "#FFFFFF"],
  pouch: ["#FF6B6B", "#1F1F1F", "#FFF6D6"],
  apron: ["#0C831F", "#E8F5EA", "#F8CB46"],
  laminate: ["#F7FBFD", "#D7EEF8", "#FFFFFF"],
  stickers: ["#F8CB46", "#FF6B6B", "#4D96FF"],
  diary: ["#6B3E2E", "#F8CB46", "#F4EFE4"],
  exam: ["#FFFFFF", "#1F1F1F", "#F4F0E6"],
  clipboard: ["#C4A574", "#8C6A3D", "#F7F4EE"],
  timer: ["#1F1F1F", "#F8CB46", "#FFFFFF"],
  kit: ["#E8F5EA", "#0C831F", "#FFFFFF"],
  sleeve: ["#F7FBFD", "#D7EEF8", "#E8E8E8"],
  badge: ["#FFFFFF", "#256FEF", "#E8EEF8"],
  border: ["#FF6B6B", "#F8CB46", "#4D96FF"],
  poster: ["#FFF6D6", "#0C831F", "#1F1F1F"],
  bin: ["#E8F1FF", "#4D96FF", "#FFFFFF"],
  pocket: ["#F7FBFD", "#9AA4B0", "#FFFFFF"],
  clock: ["#FFFFFF", "#1F1F1F", "#F8CB46"],
  hooks: ["#C0C6CE", "#5C5C5C", "#F4F0E6"],
  pencils: ["#E23744", "#F8CB46", "#4D96FF"],
  graph: ["#FFFFFF", "#4D96FF", "#F4F0E6"],
  drawing: ["#FFF6D6", "#E23744", "#F7F4EE"],
  craft: ["#FFFFFF", "#1F1F1F", "#F8CB46"],
};

function shadow() {
  return `<ellipse cx="400" cy="620" rx="180" ry="28" fill="#1F1F1F" opacity="0.08"/>`;
}

function shape(art, colors, variant) {
  const [a, b, c] = colors;
  const shift = variant === 1 ? 18 : variant === 2 ? -10 : 0;
  const scale = variant === 2 ? 1.12 : 1;
  const body = draw(art, a, b, c);
  return `<g transform="translate(${400 + shift} 390) scale(${scale}) translate(-400 -390)">${body}</g>`;
}

function draw(art, a, b, c) {
  switch (art) {
    case "paper":
    case "chart":
    case "graph":
    case "drawing":
      return `
        <g transform="translate(250 230)">
          <rect x="28" y="36" width="280" height="340" rx="6" fill="#E7E0D2"/>
          <rect x="16" y="22" width="280" height="340" rx="6" fill="#F7F4EE"/>
          <rect x="4" y="8" width="280" height="340" rx="6" fill="${a}"/>
          <rect x="4" y="8" width="280" height="28" fill="${b}"/>
          <rect x="28" y="70" width="180" height="8" rx="4" fill="${c}" opacity="0.2"/>
          <rect x="28" y="92" width="140" height="8" rx="4" fill="${c}" opacity="0.12"/>
        </g>`;
    case "toner":
    case "ink":
      return `
        <g transform="translate(250 210)">
          <rect x="70" y="40" width="180" height="300" rx="28" fill="${a}"/>
          <rect x="90" y="18" width="140" height="50" rx="16" fill="${c}"/>
          <rect x="110" y="150" width="100" height="70" rx="10" fill="${b}"/>
          <circle cx="160" cy="300" r="18" fill="${c}"/>
        </g>`;
    case "pen":
    case "pencil":
    case "marker":
    case "highlighter":
      return `
        <g transform="rotate(-28 400 400)">
          <rect x="300" y="250" width="36" height="250" rx="18" fill="${a}"/>
          <rect x="300" y="250" width="36" height="70" rx="8" fill="${b}"/>
          <polygon points="300,500 336,500 318,560" fill="${c}"/>
        </g>`;
    case "pencils":
      return `
        <g transform="translate(250 240)">
          <rect x="40" y="40" width="34" height="280" rx="8" fill="${a}" transform="rotate(-8 57 180)"/>
          <rect x="110" y="30" width="34" height="300" rx="8" fill="${b}"/>
          <rect x="180" y="50" width="34" height="270" rx="8" fill="${c}" transform="rotate(8 197 185)"/>
        </g>`;
    case "notebook":
    case "diary":
    case "exam":
      return `
        <g transform="translate(230 200)">
          <rect x="20" y="30" width="300" height="380" rx="12" fill="${a}"/>
          <rect x="20" y="30" width="28" height="380" fill="${b}"/>
          <rect x="80" y="90" width="190" height="10" rx="5" fill="${c}" opacity="0.25"/>
          <rect x="80" y="120" width="160" height="10" rx="5" fill="${c}" opacity="0.18"/>
          <rect x="80" y="150" width="180" height="10" rx="5" fill="${c}" opacity="0.18"/>
        </g>`;
    case "cup":
      return `
        <g transform="translate(270 230)">
          <path d="M40 40 h180 l-20 280 h-140 z" fill="${a}"/>
          <path d="M40 40 h180 l-6 70 h-168 z" fill="${b}"/>
          <path d="M210 110 q70 20 0 120" fill="none" stroke="${c}" stroke-width="16"/>
        </g>`;
    case "bottle":
    case "sanitizer":
    case "handwash":
    case "water":
    case "spray":
      return `
        <g transform="translate(300 160)">
          <rect x="70" y="20" width="60" height="46" rx="8" fill="${c}"/>
          <rect x="40" y="70" width="120" height="360" rx="36" fill="${a}"/>
          <rect x="40" y="180" width="120" height="90" fill="${b}"/>
        </g>`;
    case "box":
    case "snack":
    case "kit":
    case "bin":
      return `
        <g transform="translate(240 230)">
          <path d="M40 80 L160 20 L300 80 L180 140 Z" fill="${b}"/>
          <path d="M40 80 L180 140 L180 360 L40 300 Z" fill="${a}"/>
          <path d="M180 140 L300 80 L300 300 L180 360 Z" fill="${c}"/>
        </g>`;
    case "bag":
    case "pouch":
    case "mailer":
    case "bags":
      return `
        <g transform="translate(250 180)">
          <path d="M70 120 q80 -90 160 0" fill="none" stroke="${b}" stroke-width="18"/>
          <rect x="40" y="120" width="220" height="280" rx="28" fill="${a}"/>
          <rect x="70" y="200" width="160" height="16" rx="8" fill="${b}"/>
        </g>`;
    case "coffee":
      return `
        <g transform="translate(250 250)">
          ${[0, 1, 2, 3, 4].map((i) => `<rect x="${30 + i * 48}" y="${40 + (i % 2) * 16}" width="42" height="70" rx="12" fill="${i % 2 ? a : b}"/>`).join("")}
          <rect x="20" y="150" width="280" height="160" rx="16" fill="${c}"/>
        </g>`;
    case "calculator":
    case "timer":
    case "keyboard":
      return `
        <g transform="translate(250 180)">
          <rect x="40" y="20" width="240" height="400" rx="24" fill="${a}"/>
          <rect x="64" y="48" width="192" height="70" rx="10" fill="${b}"/>
          ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => `<rect x="${64 + (i % 3) * 64}" y="${150 + Math.floor(i / 3) * 58}" width="48" height="40" rx="8" fill="${c}"/>`).join("")}
        </g>`;
    case "mouse":
      return `
        <g transform="translate(300 200)">
          <path d="M40 120 q0 -100 80 -100 q80 0 80 100 v140 q0 80 -80 80 q-80 0 -80 -80 z" fill="${a}"/>
          <path d="M120 30 v120" stroke="${b}" stroke-width="6"/>
        </g>`;
    case "scissors":
      return `
        <g transform="translate(250 220) rotate(-20 150 180)">
          <circle cx="70" cy="300" r="36" fill="none" stroke="${a}" stroke-width="16"/>
          <circle cx="150" cy="300" r="36" fill="none" stroke="${a}" stroke-width="16"/>
          <path d="M90 270 L230 80 M130 270 L40 90" stroke="${c}" stroke-width="14" stroke-linecap="round"/>
        </g>`;
    case "tape":
    case "wrap":
      return `
        <g transform="translate(250 250)">
          <circle cx="160" cy="170" r="120" fill="${a}"/>
          <circle cx="160" cy="170" r="48" fill="${c}"/>
          <rect x="250" y="150" width="70" height="40" fill="${b}"/>
        </g>`;
    case "ruler":
    case "geometry":
      return `
        <g transform="translate(180 300) rotate(-18)">
          <rect x="0" y="0" width="460" height="70" rx="8" fill="${a}"/>
          ${Array.from({ length: 12 }, (_, i) => `<rect x="${20 + i * 36}" y="0" width="3" height="${i % 2 ? 18 : 32}" fill="${b}"/>`).join("")}
        </g>`;
    case "clock":
      return `
        <g transform="translate(230 180)">
          <circle cx="170" cy="200" r="150" fill="${a}"/>
          <circle cx="170" cy="200" r="130" fill="#fff"/>
          <path d="M170 200 L170 110" stroke="${b}" stroke-width="8" stroke-linecap="round"/>
          <path d="M170 200 L230 230" stroke="${c}" stroke-width="8" stroke-linecap="round"/>
        </g>`;
    case "lunch":
      return `
        <g transform="translate(230 220)">
          <rect x="30" y="80" width="320" height="220" rx="36" fill="${a}"/>
          <rect x="30" y="40" width="320" height="70" rx="24" fill="${b}"/>
          <rect x="70" y="130" width="110" height="120" rx="16" fill="${c}"/>
          <rect x="200" y="130" width="110" height="120" rx="16" fill="#fff"/>
        </g>`;
    case "paint":
    case "clay":
    case "glitter":
    case "stickers":
      return `
        <g transform="translate(220 240)">
          ${[0, 1, 2].map((i) => `<rect x="${20 + i * 110}" y="40" width="90" height="150" rx="16" fill="${[a, b, c][i]}"/>`).join("")}
          <rect x="20" y="210" width="310" height="24" rx="8" fill="#E7E0D2"/>
        </g>`;
    case "brush":
      return `
        <g transform="rotate(-20 400 400)">
          <rect x="470" y="250" width="22" height="220" rx="8" fill="${b}"/>
          <rect x="460" y="180" width="42" height="80" rx="8" fill="${a}"/>
          <path d="M460 180 q21 -50 42 0" fill="${c}"/>
        </g>`;
    default:
      return `
        <g transform="translate(250 220)">
          <rect x="40" y="40" width="260" height="300" rx="28" fill="${a}"/>
          <circle cx="170" cy="160" r="48" fill="${b}"/>
          <rect x="90" y="240" width="160" height="18" rx="9" fill="${c}"/>
        </g>`;
  }
}

function svg(art, variant) {
  const colors = palettes[art] ?? ["#F4F0E6", "#F8CB46", "#1F1F1F"];
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <rect width="800" height="800" fill="#F6F3EC"/>
  ${shadow()}
  ${shape(art, colors, variant)}
</svg>`;
}

const jobs = [];
for (const product of products) {
  for (const [suffix, variant] of [["", 0], ["-b", 1], ["-c", 2]]) {
    const file = path.join(outDir, `${product.id}${suffix}.webp`);
    jobs.push(
      sharp(Buffer.from(svg(product.art, variant)))
        .webp({ quality: 78 })
        .toFile(file),
    );
  }
}

const icon = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#F8CB46"/>
  <path d="M96 300 h150 l-28 28 70-70-70-70 28 28 H96z" fill="none"/>
  <path d="M148 168 h176 l-36 56 h86 L196 392 l40-96 H148z" fill="#0C831F"/>
</svg>`;
await mkdir(path.join(process.cwd(), "public", "icons"), { recursive: true });
jobs.push(sharp(Buffer.from(icon)).png().toFile(path.join(process.cwd(), "public", "icons", "icon-512.png")));
jobs.push(sharp(Buffer.from(icon)).resize(192, 192).png().toFile(path.join(process.cwd(), "public", "icons", "icon-192.png")));

await Promise.all(jobs);
await writeFile(path.join(outDir, ".gitkeep"), "");
console.log(`rendered ${products.length} products`);
