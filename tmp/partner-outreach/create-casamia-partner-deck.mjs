import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const ROOT = "C:\\Users\\brend\\casamia";
const TMP_DIR = "C:\\Users\\brend\\casamia\\tmp\\partner-outreach";
const OUT_DIR = "C:\\Users\\brend\\casamia\\output\\partner-outreach";
const FINAL_PPTX = path.join(OUT_DIR, "casamia-programa-colaboradores-profesionales-es.pptx");
const CTA_URL = "https://casamia.com.es/provider-partners";

const colors = {
  navy: "#1B5E8A",
  blue: "#3A9FD4",
  green: "#7DB841",
  white: "#FFFFFF",
  lightBlue: "#EAF5FC",
  paleBlue: "#F0F8FD",
  textDark: "#1A2D42",
  textMid: "#4B5563",
  border: "#C8DCE8",
  ink: "#0D1E2E",
};

const assets = {
  logoColor: path.join(ROOT, "public", "brand-assets", "casamia-logo-color-transparent.png"),
  logoWhite: path.join(ROOT, "public", "brand-assets", "casamia-logo-white-transparent.png"),
  worker: path.join(ROOT, "public", "images", "solutions", "casamia-worker-process.webp"),
  guidance: path.join(ROOT, "public", "images", "why-us", "casamia-guidance-session.jpg"),
  riskMap: path.join(ROOT, "public", "images", "solutions", "bathroom-risk-map.png"),
  consultation: path.join(ROOT, "public", "images", "solutions", "casamia-staff-kitchen-consultation.webp"),
};

const sourceNotes = [
  "CasaMia partner outreach deck source notes",
  "",
  "Copy sources:",
  "- src/pages/ProviderPartnersPage.tsx",
  "- src/constants/providerPartnership.ts",
  "- src/constants/colors.ts",
  "- src/components/SEO.tsx",
  "",
  "Visual assets:",
  `- ${assets.logoColor}`,
  `- ${assets.logoWhite}`,
  `- ${assets.worker}`,
  `- ${assets.guidance}`,
  `- ${assets.riskMap}`,
  `- ${assets.consultation}`,
  "",
  `CTA URL checked: ${CTA_URL}`,
].join("\n");

async function readImageBlob(imagePath) {
  const bytes = await fs.readFile(imagePath);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

function imageType(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

function addText(slide, text, position, style = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
    name: style.name,
  });
  shape.text = text;
  shape.text.style = {
    fontSize: style.fontSize ?? 24,
    bold: style.bold ?? false,
    color: style.color ?? colors.textDark,
    typeface: style.typeface ?? "Aptos",
    alignment: style.alignment ?? "left",
    verticalAlignment: style.verticalAlignment ?? "top",
    lineSpacing: style.lineSpacing ?? 1.06,
    insets: style.insets ?? { left: 0, right: 0, top: 0, bottom: 0 },
    wrap: "square",
  };
  return shape;
}

function addBox(slide, position, fill, lineFill = "none", radius = "rounded-lg", name) {
  return slide.shapes.add({
    geometry: "roundRect",
    position,
    fill,
    line: { style: "solid", fill: lineFill, width: lineFill === "none" ? 0 : 1 },
    borderRadius: radius,
    name,
  });
}

function addRule(slide, left, top, width, fill = colors.green) {
  slide.shapes.add({
    geometry: "rect",
    position: { left, top, width, height: 6 },
    fill,
    line: { style: "solid", fill: "none", width: 0 },
  });
}

async function addImage(slide, imagePath, position, alt, fit = "cover", radius = "rounded-lg") {
  const config = {
    blob: await readImageBlob(imagePath),
    contentType: imageType(imagePath),
    alt,
    fit,
    position,
    geometry: radius === "none" ? "rect" : "roundRect",
  };
  if (radius !== "none") {
    config.borderRadius = radius;
  }
  return slide.images.add(config);
}

async function addHeader(slide, slideNo, dark = false) {
  const logo = dark ? assets.logoWhite : assets.logoColor;
  await addImage(
    slide,
    logo,
    { left: 72, top: 38, width: 156, height: 42 },
    "Logotipo de CasaMia",
    "contain",
    "none",
  );
  addText(slide, String(slideNo).padStart(2, "0"), { left: 1156, top: 43, width: 52, height: 24 }, {
    fontSize: 18,
    bold: true,
    color: dark ? colors.white : colors.textMid,
    alignment: "right",
  });
}

function addNotes(slide, lines) {
  slide.speakerNotes.textFrame.setText([
    "[Sources]",
    ...lines,
  ]);
  slide.speakerNotes.setVisible(true);
}

function styleUrl(shape) {
  const range = shape.text.get(CTA_URL);
  range.link = { uri: CTA_URL, isExternal: true };
  range.underline = "sng";
  range.color = colors.blue;
}

async function slide1(presentation) {
  const slide = presentation.slides.add();
  slide.background.fill = colors.navy;

  await addImage(slide, assets.worker, { left: 660, top: 0, width: 620, height: 720 }, "Profesional de instalación en una vivienda", "cover", "none");
  slide.shapes.add({
    geometry: "rect",
    position: { left: 620, top: 0, width: 120, height: 720 },
    fill: colors.navy,
    line: { style: "solid", fill: "none", width: 0 },
  });
  await addImage(slide, assets.logoWhite, { left: 72, top: 56, width: 190, height: 54 }, "Logotipo de CasaMia", "contain", "none");
  addRule(slide, 72, 154, 92, colors.green);
  addText(slide, "Programa de colaboradores profesionales", { left: 72, top: 186, width: 520, height: 34 }, {
    fontSize: 24,
    bold: true,
    color: colors.lightBlue,
  });
  addText(slide, "Trabajos senior claros, coordinados por CasaMia.", { left: 72, top: 242, width: 570, height: 190 }, {
    fontSize: 66,
    bold: true,
    color: colors.white,
    typeface: "Aptos Display",
    lineSpacing: 0.94,
  });
  addText(slide, "Conectamos familias que necesitan adaptar una vivienda con empresas locales fiables y bien briefadas.", { left: 72, top: 464, width: 548, height: 92 }, {
    fontSize: 28,
    color: colors.lightBlue,
    lineSpacing: 1.12,
  });
  addText(slide, "Aplicaciones abiertas en España", { left: 72, top: 632, width: 360, height: 30 }, {
    fontSize: 22,
    bold: true,
    color: colors.white,
  });
  const url = addText(slide, CTA_URL, { left: 72, top: 664, width: 520, height: 24 }, {
    fontSize: 19,
    color: colors.lightBlue,
  });
  styleUrl(url);
  addNotes(slide, [
    "Brand/logo and worker image: public/brand-assets and public/images/solutions.",
    "Partner positioning: src/pages/ProviderPartnersPage.tsx.",
  ]);
}

async function slide2(presentation) {
  const slide = presentation.slides.add();
  slide.background.fill = colors.paleBlue;
  await addHeader(slide, 2);
  addRule(slide, 72, 118, 84);
  addText(slide, "Convertimos preocupación familiar en un trabajo listo para entregar.", { left: 72, top: 146, width: 720, height: 118 }, {
    fontSize: 48,
    bold: true,
    color: colors.textDark,
    typeface: "Aptos Display",
    lineSpacing: 0.98,
  });
  addText(slide, "CasaMia entiende la vivienda, define prioridades y coordina cliente, cambios y entrega.", { left: 72, top: 286, width: 600, height: 70 }, {
    fontSize: 26,
    color: colors.textMid,
    lineSpacing: 1.14,
  });

  await addImage(slide, assets.riskMap, { left: 770, top: 118, width: 420, height: 284 }, "Mapa visual de riesgos en baño", "cover");

  const flow = [
    ["Evaluación", "Vivienda, rutina, fotos y urgencia."],
    ["Alcance claro", "Estancia, medidas, limitaciones y expectativas."],
    ["Entrega coordinada", "Cliente, cambios, aprobación y cierre organizados."],
  ];
  flow.forEach(([title, body], index) => {
    const left = 72 + index * 374;
    addBox(slide, { left, top: 454, width: 312, height: 150 }, colors.white, colors.border);
    addText(slide, `0${index + 1}`, { left: left + 24, top: 478, width: 50, height: 34 }, {
      fontSize: 24,
      bold: true,
      color: colors.green,
    });
    addText(slide, title, { left: left + 24, top: 516, width: 246, height: 36 }, {
      fontSize: 28,
      bold: true,
      color: colors.textDark,
    });
    addText(slide, body, { left: left + 24, top: 560, width: 246, height: 50 }, {
      fontSize: 20,
      color: colors.textMid,
      lineSpacing: 1.1,
    });
    if (index < 2) {
      slide.shapes.add({
        geometry: "rightArrow",
        position: { left: left + 322, top: 510, width: 40, height: 44 },
        fill: colors.green,
        line: { style: "solid", fill: "none", width: 0 },
      });
    }
  });

  addNotes(slide, [
    "Workflow copy: src/pages/ProviderPartnersPage.tsx provider workflow.",
    "Risk-map image: public/images/solutions/bathroom-risk-map.png.",
  ]);
}

async function slide3(presentation) {
  const slide = presentation.slides.add();
  slide.background.fill = colors.white;
  await addHeader(slide, 3);
  addRule(slide, 72, 118, 84);
  addText(slide, "Qué gana el colaborador", { left: 72, top: 146, width: 610, height: 62 }, {
    fontSize: 50,
    bold: true,
    color: colors.textDark,
    typeface: "Aptos Display",
  });
  addText(slide, "Proyectos mejor preparados, menos fricción y una relación clara con la familia desde el primer contacto.", { left: 72, top: 222, width: 780, height: 68 }, {
    fontSize: 26,
    color: colors.textMid,
    lineSpacing: 1.12,
  });

  const benefits = [
    ["Demanda local cualificada", "Proyectos evaluados, no leads fríos."],
    ["Brief antes de visitar", "Fotos, notas y expectativas cuando estén disponibles."],
    ["Menos ida y vuelta", "CasaMia mantiene el contacto con la familia."],
    ["Cobertura por ciudad", "Crecemos con proveedores fiables en cada zona."],
  ];
  benefits.forEach(([title, body], index) => {
    const left = 72 + (index % 2) * 548;
    const top = 340 + Math.floor(index / 2) * 156;
    addBox(slide, { left, top, width: 486, height: 112 }, index === 0 ? colors.paleBlue : colors.white, colors.border);
    slide.shapes.add({
      geometry: "ellipse",
      position: { left: left + 26, top: top + 28, width: 54, height: 54 },
      fill: index === 0 ? colors.green : colors.lightBlue,
      line: { style: "solid", fill: "none", width: 0 },
    });
    addText(slide, String(index + 1), { left: left + 26, top: top + 39, width: 54, height: 28 }, {
      fontSize: 22,
      bold: true,
      color: index === 0 ? colors.white : colors.navy,
      alignment: "center",
    });
    addText(slide, title, { left: left + 102, top: top + 24, width: 340, height: 34 }, {
      fontSize: 27,
      bold: true,
      color: colors.textDark,
    });
    addText(slide, body, { left: left + 102, top: top + 64, width: 338, height: 34 }, {
      fontSize: 20,
      color: colors.textMid,
    });
  });
  addNotes(slide, [
    "Benefits source: src/constants/providerPartnership.ts providerProgrammeBenefits.",
    "Spanish benefit language aligned to src/pages/ProviderPartnersPage.tsx.",
  ]);
}

async function slide4(presentation) {
  const slide = presentation.slides.add();
  slide.background.fill = colors.lightBlue;
  await addHeader(slide, 4);
  addRule(slide, 72, 118, 84);
  addText(slide, "Buscamos varios perfiles de instalación", { left: 72, top: 146, width: 690, height: 110 }, {
    fontSize: 48,
    bold: true,
    color: colors.textDark,
    typeface: "Aptos Display",
    lineSpacing: 0.98,
  });
  addText(slide, "La red combina oficios prácticos que ayudan a hacer la vivienda más segura y fácil de usar cada día.", { left: 72, top: 272, width: 560, height: 72 }, {
    fontSize: 25,
    color: colors.textMid,
    lineSpacing: 1.12,
  });
  await addImage(slide, assets.consultation, { left: 760, top: 126, width: 390, height: 244 }, "Consulta en cocina con personal de CasaMia", "cover");

  const profiles = [
    "Accesibilidad: barras, rampas, umbrales",
    "Baño: ducha, inodoro, transferencia",
    "Escaleras: pasamanos y puntos de apoyo",
    "Electricidad: iluminación y rutas nocturnas",
    "Smart safety: sensores, alertas, conectividad",
    "Seguimiento: ajustes, mantenimiento y entrega",
  ];
  profiles.forEach((item, index) => {
    const left = 72 + (index % 2) * 552;
    const top = 414 + Math.floor(index / 2) * 72;
    addBox(slide, { left, top, width: 490, height: 52 }, colors.white, "none");
    addText(slide, item, { left: left + 22, top: top + 11, width: 442, height: 28 }, {
      fontSize: 21,
      bold: true,
      color: colors.textDark,
    });
  });
  addNotes(slide, [
    "Partner profiles source: src/constants/providerPartnership.ts providerPartnerPaths and providerTrades.",
    "Consultation image: public/images/solutions/casamia-staff-kitchen-consultation.webp.",
  ]);
}

async function slide5(presentation) {
  const slide = presentation.slides.add();
  slide.background.fill = colors.white;
  await addHeader(slide, 5);
  addRule(slide, 72, 118, 84);
  addText(slide, "Estándares sencillos para cuidar hogares reales", { left: 72, top: 146, width: 720, height: 112 }, {
    fontSize: 48,
    bold: true,
    color: colors.textDark,
    typeface: "Aptos Display",
    lineSpacing: 0.98,
  });
  addText(slide, "Trabajamos en viviendas habitadas por personas mayores. El estándar importa tanto como el producto.", { left: 72, top: 282, width: 580, height: 82 }, {
    fontSize: 26,
    color: colors.textMid,
    lineSpacing: 1.12,
  });
  await addImage(slide, assets.guidance, { left: 760, top: 132, width: 390, height: 246 }, "Asesora mostrando una propuesta de seguridad a personas mayores", "cover");

  const standards = [
    "Seguro y datos profesionales verificables.",
    "Trabajo respetuoso, limpio y puntual.",
    "Disponibilidad, precios de entrada y notas de finalización claras.",
    "Sin pagos directos ni cambios de alcance sin CasaMia.",
    "Defectos o trabajos incompletos documentados con honestidad.",
  ];
  standards.forEach((item, index) => {
    const top = 416 + index * 46;
    slide.shapes.add({
      geometry: "ellipse",
      position: { left: 82, top: top + 2, width: 28, height: 28 },
      fill: colors.green,
      line: { style: "solid", fill: "none", width: 0 },
    });
    addText(slide, "✓", { left: 82, top: top + 1, width: 28, height: 28 }, {
      fontSize: 18,
      bold: true,
      color: colors.white,
      alignment: "center",
      verticalAlignment: "middle",
    });
    addText(slide, item, { left: 126, top, width: 770, height: 34 }, {
      fontSize: 22,
      color: colors.textDark,
    });
  });
  addNotes(slide, [
    "Standards source: src/constants/providerPartnership.ts providerQualityStandards and providerMarketingRules.",
    "Guidance image: public/images/why-us/casamia-guidance-session.jpg.",
  ]);
}

async function slide6(presentation) {
  const slide = presentation.slides.add();
  slide.background.fill = colors.navy;
  await addHeader(slide, 6, true);
  addRule(slide, 72, 126, 96, colors.green);
  addText(slide, "¿Quieres formar parte de la red?", { left: 72, top: 162, width: 730, height: 116 }, {
    fontSize: 56,
    bold: true,
    color: colors.white,
    typeface: "Aptos Display",
    lineSpacing: 0.98,
  });
  addText(slide, "Comparte empresa, zonas de cobertura y servicios. CasaMia revisará el encaje antes de asignar trabajos.", { left: 72, top: 304, width: 636, height: 82 }, {
    fontSize: 28,
    color: colors.lightBlue,
    lineSpacing: 1.12,
  });

  const ctaBox = addBox(slide, { left: 72, top: 434, width: 610, height: 142 }, colors.white, "none");
  ctaBox.text.set([
    [{ run: "Solicita colaborar online", textStyle: { bold: true, color: colors.textDark } }],
    [{ run: CTA_URL, textStyle: { color: colors.blue, underline: "sng" }, link: { uri: CTA_URL, isExternal: true } }],
  ]);
  ctaBox.text.style = {
    fontSize: 30,
    color: colors.textDark,
    typeface: "Aptos",
    insets: { left: 32, right: 32, top: 28, bottom: 20 },
    lineSpacing: 1.18,
  };

  addText(slide, "Cobertura prioritaria", { left: 760, top: 196, width: 360, height: 34 }, {
    fontSize: 26,
    bold: true,
    color: colors.white,
  });
  addText(slide, "Madrid · Barcelona · Valencia · Málaga · Alicante · Sevilla · y otras ciudades principales", { left: 760, top: 244, width: 360, height: 108 }, {
    fontSize: 26,
    color: colors.lightBlue,
    lineSpacing: 1.2,
  });
  addText(slide, "Proyectos evaluados. Brief claro. Cliente coordinado.", { left: 760, top: 460, width: 360, height: 92 }, {
    fontSize: 32,
    bold: true,
    color: colors.white,
    lineSpacing: 1.04,
  });
  addNotes(slide, [
    "CTA URL source: src/pages/ProviderPartnersPage.tsx route and public sitemap.",
    "Priority city language source: src/constants/providerPartnership.ts providerPriorityCities/providerCityOpportunities.",
  ]);
}

async function main() {
  await fs.mkdir(TMP_DIR, { recursive: true });
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(path.join(TMP_DIR, "source-notes.txt"), sourceNotes, "utf8");

  const presentation = Presentation.create({
    slideSize: { width: 1280, height: 720 },
  });

  await slide1(presentation);
  await slide2(presentation);
  await slide3(presentation);
  await slide4(presentation);
  await slide5(presentation);
  await slide6(presentation);

  for (const [index, slide] of presentation.slides.items.entries()) {
    const stem = `slide-${String(index + 1).padStart(2, "0")}`;
    const png = await presentation.export({ slide, format: "png", scale: 1 });
    await fs.writeFile(path.join(TMP_DIR, `${stem}.png`), Buffer.from(await png.arrayBuffer()));
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(path.join(TMP_DIR, `${stem}.layout.json`), await layout.text(), "utf8");
  }

  const montage = await presentation.export({ format: "webp", montage: true, scale: 1 });
  await fs.writeFile(path.join(TMP_DIR, "deck-montage.webp"), Buffer.from(await montage.arrayBuffer()));

  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(FINAL_PPTX);
  console.log(FINAL_PPTX);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
