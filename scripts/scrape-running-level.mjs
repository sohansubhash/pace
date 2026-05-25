import { mkdir, writeFile } from "node:fs/promises";

const INDEX_URL = "https://runninglevel.com/running-times";
const OUTPUT_PATH = "data/running-level-standards.json";
const ABILITIES = ["beginner", "novice", "intermediate", "advanced", "elite", "wr"];
const GENDERS = ["male", "female"];

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&nbsp;", " ");
}

function toTextLines(html) {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<\/(?:h1|h2|h3|h4|p|li|tr|div|table|thead|tbody)>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function slugToName(slug) {
  return slug
    .replace(/-times$/, "")
    .replaceAll("-", " ")
    .replace(/\b([a-z])/g, (letter) => letter.toUpperCase())
    .replace(/\bK\b/g, "K");
}

function extractDistanceLinks(html) {
  const links = new Map();

  for (const match of html.matchAll(/href="(\/running-times\/([^"]+?-times))"/g)) {
    const [, path, slug] = match;
    links.set(slug, {
      id: slug.replace(/-times$/, ""),
      name: slugToName(slug),
      sourceUrl: new URL(path, INDEX_URL).toString(),
    });
  }

  return [...links.values()].sort((a, b) => a.id.localeCompare(b.id));
}

function parseStandardsRows(lines, startIndex) {
  const rows = [];

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const fields = lines[index].split(" ");

    if (fields[0] === "Age") {
      break;
    }

    if (!/^\d+$/.test(fields[0]) || fields.length < 7) {
      continue;
    }

    const standards = {};

    for (const [abilityIndex, ability] of ABILITIES.entries()) {
      standards[ability] = fields[abilityIndex + 1];
    }

    rows.push({
      age: Number(fields[0]),
      standards,
    });

    if (rows.length === 17) {
      break;
    }
  }

  return rows;
}

function parseGenderSection(lines, startIndex, endIndex) {
  const tableIndexes = [];

  for (let index = startIndex; index < endIndex; index += 1) {
    if (lines[index] === "Age Beginner Novice Intermediate Advanced Elite WR") {
      tableIndexes.push(index);
    }
  }

  return {
    finishTime: parseStandardsRows(lines, tableIndexes[0] ?? endIndex),
    pacePerKilometer: parseStandardsRows(lines, tableIndexes[1] ?? endIndex),
    pacePerMile: parseStandardsRows(lines, tableIndexes[2] ?? endIndex),
  };
}

function parseDistancePage(html) {
  const lines = toTextLines(html);
  const sections = {};

  for (const gender of GENDERS) {
    const label = `${gender[0].toUpperCase()}${gender.slice(1)} `;
    const startIndex = lines.findIndex(
      (line) => line.startsWith(label) && line.endsWith(" Running Times"),
    );
    const nextGenderStart = lines.findIndex(
      (line, index) =>
        index > startIndex &&
        GENDERS.some((nextGender) =>
          line.startsWith(`${nextGender[0].toUpperCase()}${nextGender.slice(1)} `),
        ) &&
        line.endsWith(" Running Times"),
    );
    const endIndex = nextGenderStart === -1 ? lines.length : nextGenderStart;

    if (startIndex !== -1) {
      sections[gender] = parseGenderSection(lines, startIndex, endIndex);
    }
  }

  return sections;
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "pace-converter-data-research/0.1",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

async function main() {
  const indexHtml = await fetchHtml(INDEX_URL);
  const distances = extractDistanceLinks(indexHtml);
  const scrapedAt = new Date().toISOString();
  const output = {
    source: {
      name: "Running Level",
      indexUrl: INDEX_URL,
      scrapedAt,
    },
    abilities: ABILITIES,
    distances: {},
  };

  for (const distance of distances) {
    const html = await fetchHtml(distance.sourceUrl);

    output.distances[distance.id] = {
      name: distance.name,
      sourceUrl: distance.sourceUrl,
      genders: parseDistancePage(html),
    };
  }

  await mkdir("data", { recursive: true });
  await writeFile(`${OUTPUT_PATH}.tmp`, `${JSON.stringify(output, null, 2)}\n`);
  await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);

  console.log(
    `Scraped ${Object.keys(output.distances).length} distances to ${OUTPUT_PATH}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
