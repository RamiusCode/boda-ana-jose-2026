// Tiñe los adornos de la invitación a la paleta de la invitación impresa:
// azul rey para los iconos y rosa salmón para los acentos.
//
//   npm run paleta
//
// Los iconos (iglesia, cena, torta…) son siluetas negras con transparencia:
// se repintan del color plano conservando el canal alfa, que es lo que les da
// el borde suave.
//
// Los adornos en acuarela (la rama del costado, el separador) no son de un
// solo color, así que en vez de repintarlos se les gira el matiz: el verde
// pasa a azul y se conservan las aguadas y el degradado.
//
// El sobre de la portada pasa del crema al rosa perla del sobre impreso.
//
// Nada de esto toca los originales: las versiones nuevas se guardan en
// public/imagenes/paleta/.

import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ORIGEN = "public/imagenes";
const DESTINO = "public/imagenes/paleta";

const AZUL = { r: 0x3f, g: 0x5a, b: 0xa6 }; // #3F5AA6 — iconos
const ROSA = { r: 0xde, g: 0x8f, b: 0x8a }; // #DE8F8A — acentos

// Silueta → color plano, conservando el alfa.
async function tenir(archivo, color, salida) {
    const { data, info } = await sharp(path.join(ORIGEN, archivo))
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    for (let i = 0; i < data.length; i += 4) {
        data[i] = color.r;
        data[i + 1] = color.g;
        data[i + 2] = color.b;
    }

    await sharp(data, {
        raw: { width: info.width, height: info.height, channels: 4 },
    })
        .png()
        .toFile(path.join(DESTINO, salida));
    console.log(`  ${salida.padEnd(22)} plano`);
}

// Acuarela → mismo dibujo, matiz girado de verde a azul.
async function girarMatiz(archivo, grados, salida) {
    await sharp(path.join(ORIGEN, archivo))
        .modulate({ hue: grados, saturation: 1.15, brightness: 0.95 })
        .png()
        .toFile(path.join(DESTINO, salida));
    console.log(`  ${salida.padEnd(22)} matiz +${grados}°`);
}

if (!existsSync(DESTINO)) await mkdir(DESTINO, { recursive: true });

const iconos = [
    "iglesia",
    "recepcion",
    "brindis",
    "cena",
    "musica",
    "torta",
    "despedida",
    "pase",
    "restriccion",
];

console.log("Iconos en azul:");
for (const icono of iconos) await tenir(`${icono}.png`, AZUL, `${icono}.png`);
// El anillo junto a los nombres va en rosa, como los nombres impresos.
await tenir("anillo.png", ROSA, "anillo.png");

// En el itinerario los iconos van en rosa para cortar tanto azul.
console.log("\nIconos del itinerario en rosa:");
for (const icono of ["recepcion", "brindis", "cena", "musica", "torta", "despedida"])
    await tenir(`${icono}.png`, ROSA, `${icono}-rosa.png`);

console.log("\nAdornos en acuarela:");
// florcostado.png ya viene en los colores de la invitación (el ramo del
// forro del sobre): no se tiñe, solo se comprime a paleta/florcostado.webp.
await girarMatiz("separador.png", 125, "separador.png");
await girarMatiz("textura2.png", 125, "textura2.png");

console.log("\nSobre:");
// Se conserva la luz del original (el relieve de la solapa) y se le da el
// tono del sobre perlado.
// Cada píxel toma el color del sobre multiplicado por su luminosidad: el
// papel más claro (≈240) queda exactamente en PERLA.
const PERLA = { r: 0xf0, g: 0xd2, b: 0xcd };
const sobre = await sharp(path.join(ORIGEN, "sobre.webp"))
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
const rosado = Buffer.alloc(sobre.info.width * sobre.info.height * 3);
for (let i = 0; i < sobre.data.length; i++) {
    const luz = sobre.data[i] / 240;
    rosado[i * 3] = Math.min(255, PERLA.r * luz);
    rosado[i * 3 + 1] = Math.min(255, PERLA.g * luz);
    rosado[i * 3 + 2] = Math.min(255, PERLA.b * luz);
}
await sharp(rosado, {
    raw: { width: sobre.info.width, height: sobre.info.height, channels: 3 },
})
    .webp({ quality: 82 })
    .toFile(path.join(DESTINO, "sobre.webp"));
console.log("  sobre.webp             rosa perla");
