/**
 * Represents a single item drop from a standard monster.
 *
 * @property Item - AegisName of the dropped item.
 * @property Rate - Drop rate expressed as an integer out of 10 000 (e.g. 100 = 1%).
 * @property StealProtected - When `true` the item cannot be stolen by a Thief.
 * @property RandomOptionGroup - Optional random-option group applied on drop.
 * @property Index - Position index used for ordering multiple drop entries.
 */
export interface IMobDrop {
  Item: string;
  Rate: number;
  StealProtected?: boolean;
  RandomOptionGroup?: string;
  Index?: number;
}

/**
 * Represents a single item drop from an MVP monster.
 *
 * MVP drops are awarded only to the player who lands the killing blow.
 * The `Rate` field uses the same 1/10 000 scale as {@link IMobDrop}.
 *
 * @property Item - AegisName of the dropped item.
 * @property Rate - Drop rate out of 10 000.
 * @property RandomOptionGroup - Optional random-option group applied on drop.
 * @property Index - Position index used for ordering multiple drop entries.
 */
export interface IMobMvpDrop {
  Item: string;
  Rate: number;
  RandomOptionGroup?: string;
  Index?: number;
}

/**
 * Behaviour flags that control monster AI and combat rules.
 *
 * All fields are optional; an absent flag is treated as `false`.
 *
 * @property Detector - Can detect hidden/cloaked players.
 * @property Escort - Assists nearby monsters when they are attacked.
 * @property Aggressive - Attacks players on sight without provocation.
 * @property Assist - Calls nearby monsters of the same type for help.
 * @property Boss - Treated as a Boss-type monster (affects some skills).
 * @property Mvp - Grants MVP rewards to the highest-damage player on death.
 * @property Plant - Acts as a plant monster (1 HP, fixed-damage behaviour).
 * @property CanAttack - Whether the monster is capable of attacking.
 * @property Immobile - Monster cannot move.
 */
export interface IMobModes {
  Detector?: boolean;
  Escort?: boolean;
  Changeable?: boolean;
  Aggressive?: boolean;
  Assist?: boolean;
  CastSensor?: boolean;
  Boss?: boolean;
  Plant?: boolean;
  CanAttack?: boolean;
  Immobile?: boolean;
  rideable?: boolean;
  Warp?: boolean;
  Mvp?: boolean;
}

/** Map of race group identifiers to their enabled state. */
export interface IRaceGroups {
  [key: string]: boolean;
}

/**
 * Full monster definition as read from the mob database YAML.
 *
 * Mirrors the structure produced by the rAthena mob_db.yml exporter.
 * Numeric stat fields are optional because many monsters omit unchanged defaults.
 *
 * @property Id - Unique numeric monster ID.
 * @property AegisName - Internal script name used in map files and scripts.
 * @property Name - Localised display name shown in-game.
 * @property JapaneseName - Alternative JP name used on some clients.
 * @property Hp - Maximum hit points.
 * @property BaseExp - Base experience awarded on kill.
 * @property JobExp - Job experience awarded on kill.
 * @property MvpExp - Bonus experience awarded to the MVP player.
 * @property Size - Body size: `Small`, `Medium`, or `Large`.
 * @property Race - Race category (e.g. `Demi-Human`, `Demon`).
 * @property Element - Element type (e.g. `Fire`).
 * @property ElementLevel - Elemental strength level (1–4).
 * @property Modes - Optional AI and combat behaviour flags.
 * @property MvpDrops - Items dropped exclusively for the MVP player.
 * @property Drops - Standard item drop table.
 */
export interface IMob {
  Id: number;
  AegisName: string;
  Name: string;
  JapaneseName?: string;
  Level?: number;
  Hp?: number;
  Sp?: number;
  BaseExp?: number;
  JobExp?: number;
  MvpExp?: number;
  Attack?: number;
  Attack2?: number;
  Defense?: number;
  MagicDefense?: number;
  Resistance?: number;
  MagicResistance?: number;
  Str?: number;
  Agi?: number;
  Vit?: number;
  Int?: number;
  Dex?: number;
  Luk?: number;
  AttackRange?: number;
  SkillRange?: number;
  ChaseRange?: number;
  Size?: string;
  Race?: string;
  RaceGroups?: IRaceGroups;
  Element?: string;
  ElementLevel?: number;
  WalkSpeed?: number;
  AttackDelay?: number;
  AttackMotion?: number;
  ClientAttackMotion?: number;
  DamageMotion?: number;
  DamageTaken?: number;
  GroupId?: number;
  Title?: string;
  Ai?: string;
  Class?: string;
  Modes?: IMobModes;
  MvpDrops?: IMobMvpDrop[];
  Drops?: IMobDrop[];
}

/** Header metadata for the mob database file. */
export interface IMobDBHeader {
  Type: string;
  Version: number;
}

/** Root structure of the parsed mob database YAML. */
export interface IMobDB {
  Header: IMobDBHeader;
  Body: IMob[];
}
