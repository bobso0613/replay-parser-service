import fs from "node:fs/promises";
import path from "node:path";
import * as yaml from "js-yaml";
import type { IItemDB } from "../types/item-db.js";
import type { IMobDB } from "../types/mob-db.js";
import type { ISkillDB } from "../types/skill-db.js";
import { JobListType } from "../types/job-list-type.js";

interface LoadedDatabases {
  itemDB: IItemDB;
  mobDB: IMobDB;
  skillDB: ISkillDB;
}

let loadedDatabases: LoadedDatabases | undefined;

const yamlDirectory = path.join(process.cwd(), "yaml");

const readYamlFile = async <T>(fileName: string): Promise<T> => {
  const filePath = path.join(yamlDirectory, fileName);
  const contents = await fs.readFile(filePath, "utf8");
  return yaml.load(contents) as T;
};

export const preloadDatabases = async (): Promise<void> => {
  const [itemDB, mobDB, skillDB] = await Promise.all([
    readYamlFile<IItemDB>("item_db.yml"),
    readYamlFile<IMobDB>("mob_db.yml"),
    readYamlFile<ISkillDB>("skill_db.yml"),
  ]);
  loadedDatabases = { itemDB, mobDB, skillDB };
};

const getLoadedDatabases = (): LoadedDatabases => {
  if (!loadedDatabases) {
    throw new Error(
      "Databases have not been preloaded. Call preloadDatabases() first.",
    );
  }
  return loadedDatabases;
};

export const getItemDB = (): IItemDB => getLoadedDatabases().itemDB;
export const getMobDB = (): IMobDB => getLoadedDatabases().mobDB;
export const getSkillDB = (): ISkillDB => getLoadedDatabases().skillDB;

/** Maps every Ragnarok Online job ID to its display name. */
export const JOB_LIST: JobListType = {
  0: "Novice",
  1: "Swordman",
  2: "Mage",
  3: "Archer",
  4: "Acolyte",
  5: "Merchant",
  6: "Thief",
  7: "Knight",
  8: "Priest",
  9: "Wizard",
  10: "Blacksmith",
  11: "Hunter",
  12: "Assassin",
  13: "Knight",
  14: "Crusader",
  15: "Monk",
  16: "Sage",
  17: "Rogue",
  18: "Alchemist",
  19: "Bard",
  20: "Dancer",
  21: "Crusader",
  22: "Wedding",
  23: "Super Novice",
  24: "Gunslinger",
  25: "Ninja",
  26: "Xmas",
  27: "Summer",
  28: "Hanbok",
  29: "Oktoberfest",
  30: "Summer2",

  4001: "High Novice",
  4002: "High Swordman",
  4003: "High Mage",
  4004: "High Archer",
  4005: "High Acolyte",
  4006: "High Merchant",
  4007: "High Thief",
  4008: "Lord Knight",
  4009: "High Priest",
  4010: "High Wizard",
  4011: "Whitesmith",
  4012: "Sniper",
  4013: "Assassin Cross",
  4014: "Lord Knight",
  4015: "Paladin",
  4016: "Champion",
  4017: "Professor",
  4018: "Stalker",
  4019: "Creator",
  4020: "Clown",
  4021: "Gypsy",
  4022: "Paladin",

  4023: "Baby",
  4024: "Baby Swordman",
  4025: "Baby Mage",
  4026: "Baby Archer",
  4027: "Baby Acolyte",
  4028: "Baby Merchant",
  4029: "Baby Thief",
  4030: "Baby Knight",
  4031: "Baby Priest",
  4032: "Baby Wizard",
  4033: "Baby Blacksmith",
  4034: "Baby Hunter",
  4035: "Baby Assassin",
  4036: "Baby Knight",
  4037: "Baby Crusader",
  4038: "Baby Monk",
  4039: "Baby Sage",
  4040: "Baby Rogue",
  4041: "Baby Alchemist",
  4042: "Baby Bard",
  4043: "Baby Dancer",
  4044: "Baby Crusader",
  4045: "Super Baby",

  4046: "Taekwon",
  4047: "Star Gladiator",
  4048: "Star Gladiator (Union)",
  4049: "Soul Linker",

  4050: "Gangsi",
  4051: "Death Knight",
  4052: "Dark Collector",

  4054: "Rune Knight",
  4055: "Warlock",
  4056: "Ranger",
  4057: "Arch Bishop",
  4058: "Mechanic",
  4059: "Guillotine Cross",

  4060: "Rune Knight T",
  4061: "Warlock T",
  4062: "Ranger T",
  4063: "Arch Bishop T",
  4064: "Mechanic T",
  4065: "Guillotine Cross T",

  4066: "Royal Guard",
  4067: "Sorcerer",
  4068: "Minstrel",
  4069: "Wanderer",
  4070: "Sura",
  4071: "Genetic",
  4072: "Shadow Chaser",

  4073: "Royal Guard T",
  4074: "Sorcerer T",
  4075: "Minstrel T",
  4076: "Wanderer T",
  4077: "Sura T",
  4078: "Genetic T",
  4079: "Shadow Chaser T",

  4080: "Rune Knight (Dragon)",
  4081: "Rune Knight T2",
  4082: "Royal Guard (Gryphon)",
  4083: "Royal Guard T2",
  4084: "Ranger (Warg)",
  4085: "Ranger T2",
  4086: "Mechanic (Mado)",
  4087: "Mechanic T2",

  4096: "Baby Rune Knight",
  4097: "Baby Warlock",
  4098: "Baby Ranger",
  4099: "Baby Arch Bishop",
  4100: "Baby Mechanic",
  4101: "Baby Guillotine Cross",
  4102: "Baby Royal Guard",
  4103: "Baby Sorcerer",
  4104: "Baby Minstrel",
  4105: "Baby Wanderer",
  4106: "Baby Sura",
  4107: "Baby Genetic",
  4108: "Baby Shadow Chaser",

  4109: "Baby Rune Knight (Dragon)",
  4110: "Baby Royal Guard (Gryphon)",
  4111: "Baby Ranger (Warg)",
  4112: "Baby Mechanic (Mado)",

  4190: "Super Novice EX",
  4191: "Super Baby EX",

  4211: "Kagerou",
  4212: "Oboro",
  4215: "Rebellion",
  4218: "Summoner",
  4220: "Baby Summoner",

  4222: "Baby Ninja",
  4223: "Baby Kagerou",
  4224: "Baby Oboro",
  4225: "Baby Taekwon",
  4226: "Baby Star Gladiator",
  4227: "Baby Soul Linker",
  4228: "Baby Gunslinger",
  4229: "Baby Rebellion",

  4238: "Baby Star Gladiator (Union)",

  4239: "Star Emperor",
  4240: "Soul Reaper",
  4241: "Baby Star Emperor",
  4242: "Baby Soul Reaper",
  4243: "Star Emperor (Union)",
  4244: "Baby Star Emperor (Union)",

  4252: "Dragon Knight",
  4253: "Meister",
  4254: "Shadow Cross",
  4255: "Arch Mage",
  4256: "Cardinal",
  4257: "Windhawk",
  4258: "Imperial Guard",
  4259: "Biolo",
  4260: "Abyss Chaser",
  4261: "Elemental Master",
  4262: "Inquisitor",
  4263: "Troubadour",
  4264: "Trouvere",

  4278: "Windhawk (Warg)",
  4279: "Meister (Mado)",
  4280: "Dragon Knight (Dragon)",
  4281: "Imperial Guard (Gryphon)",

  4302: "Sky Emperor",
  4303: "Soul Ascetic",
  4304: "Shinkiro",
  4305: "Shiranui",
  4306: "Night Watch",
  4307: "Hyper Novice",
  4308: "Spirit Handler",

  4316: "Sky Emperor (Union)",

  4332: "Rune Knight 2nd Costume",
  4333: "Mechanic 2nd Costume",
  4334: "Guillotine Cross 2nd Costume",
  4335: "Warlock 2nd Costume",
  4336: "Archbishop 2nd Costume",
  4337: "Ranger 2nd Costume",
  4338: "Royal Guard 2nd Costume",
  4339: "Genetic 2nd Costume",
  4340: "Shadow Chaser 2nd Costume",
  4341: "Sorcerer 2nd Costume",
  4342: "Sura 2nd Costume",
  4343: "Minstrel 2nd Costume",
  4344: "Wanderer 2nd Costume",
};

const getDatabaseName = (
  database: { Body: Array<{ Id: number; Name: string }> },
  id: unknown,
): string => {
  return database.Body.find((entry) => entry.Id === Number(id))?.Name ?? "";
};

const getSkillDescription = (id: unknown): string => {
  return (
    getSkillDB().Body.find((entry) => entry.Id === Number(id))?.Description ??
    ""
  );
};

export const enrichOutput = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(enrichOutput);
  }

  if (value === null || typeof value !== "object") {
    return value;
  }

  const output = Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, enrichOutput(entry)]),
  ) as Record<string, unknown>;

  if ("skillId" in output) {
    output.skillName = getSkillDescription(output.skillId);
  }

  if ("itemId" in output) {
    output.itemName = getDatabaseName(getItemDB(), output.itemId);
  }

  if ("jobId" in output) {
    output.jobName = JOB_LIST[Number(output.jobId)] ?? "";
  }

  if ("monsterId" in output) {
    const monster = getMobDB().Body.find(
      (entry) => entry.Id === Number(output.monsterId),
    );
    output.monsterName = monster?.JapaneseName ?? monster?.Name ?? "";
    output.isMvp = monster?.Modes?.Mvp ?? false;
  }

  if ("maxDamageMonsterId" in output) {
    const maxDamageMonster = getMobDB().Body.find(
      (entry) => entry.Id === Number(output.maxDamageMonsterId),
    );
    output.maxDamageMonsterName =
      maxDamageMonster?.JapaneseName ?? maxDamageMonster?.Name ?? "";
    output.maxDamageMonsterIsMvp = maxDamageMonster?.Modes?.Mvp ?? false;
  }

  return output;
};
