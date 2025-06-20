import satori, { type SatoriOptions } from "satori";
import { readFile } from "node:fs/promises";
import sharp from "sharp";

import { postOgImage } from "./og-image-template";

import fontRegularUrl from "@assets/fonts/SarasaUiSC-Regular.ttf?filepath";
import fontBoldUrl from "@assets/fonts/SarasaUiSC-Bold.ttf?filepath";

const fetchFonts = async () => {
  // Use Promise.all with async readFile
  const [fontRegular, fontBold] = await Promise.all([
    readFile(fontRegularUrl),
    readFile(fontBoldUrl),
  ]);

  return { fontRegular, fontBold };
};

const { fontRegular, fontBold } = await fetchFonts();

const options: SatoriOptions = {
  width: 1200,
  height: 630,
  fonts: [
    { name: "Regular", data: fontRegular },
    { name: "Bold", data: fontBold },
  ],
};

export type OgImageInfo = {
  title: string;
  date: string;
};

export async function generateOgImageForPost(info: OgImageInfo) {
  const node = postOgImage(info);
  const svg = await satori(node, options);
  return svgBufferToPngBuffer(svg);
}

async function svgBufferToPngBuffer(svg: string) {
  return await sharp(Buffer.from(svg)).png().toBuffer();
}
