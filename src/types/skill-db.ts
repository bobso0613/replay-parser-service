/** A numeric value that can vary per skill level. */
export interface ILevelledValue {
  Level: number;
  Amount?: number;
  Time?: number;
  Size?: number;
  Area?: number;
  Count?: number;
}

/** Flags that modify how a skill's damage is applied. */
export interface IDamageFlags {
  NoDamage?: boolean;
  Splash?: boolean;
  SplashSplit?: boolean;
}

/** Miscellaneous behaviour flags for a skill. */
export interface ISkillFlags {
  TargetTrap?: boolean;
  IsAutoShadowSpell?: boolean;
}

/** Flags controlling which skills can copy this skill. */
export interface ICopyFlags {
  Skill?: {
    Plagiarism?: boolean;
    Reproduce?: boolean;
  };
  RemoveRequirement?: string[];
}

/** Weapon types that satisfy the equipped-weapon requirement for a skill. */
export interface IWeaponRequirements {
  Fist?: boolean;
  Dagger?: boolean;
  '1hSword'?: boolean;
  '2hSword'?: boolean;
  '1hSpear'?: boolean;
  '2hSpear'?: boolean;
  '1hAxe'?: boolean;
  '2hAxe'?: boolean;
  Mace?: boolean;
  '2hMace'?: boolean;
  Staff?: boolean;
  Knuckle?: boolean;
  Musical?: boolean;
  Whip?: boolean;
  Book?: boolean;
  Katar?: boolean;
  Revolver?: boolean;
  Rifle?: boolean;
  Gatling?: boolean;
  Shotgun?: boolean;
  Grenade?: boolean;
  Huuma?: boolean;
}

/** Item cost entry for a skill requirement. */
export interface IItemCost {
  Item: string;
  Amount: number;
  Level?: number;
}

/** All resource and equipment requirements needed to cast a skill. */
export interface ISkillRequirements {
  HpCost?: number | ILevelledValue[];
  SpCost?: number | ILevelledValue[];
  ApCost?: number | ILevelledValue[];
  HpRateCost?: number | ILevelledValue[];
  SpRateCost?: number | ILevelledValue[];
  ApRateCost?: number | ILevelledValue[];
  MaxHpTrigger?: number | ILevelledValue[];
  ZenyCost?: number | ILevelledValue[];
  Weapon?: string | IWeaponRequirements;
  Ammo?: string;
  AmmoAmount?: number | ILevelledValue[];
  State?: string;
  Status?: string;
  SpiritSphereCost?: number | ILevelledValue[];
  ItemCost?: IItemCost[];
  Equipment?: string;
}

/** Ground-unit placement configuration for a skill. */
export interface ISkillUnit {
  Id: number;
  AlternateId?: number;
  Layout?: number | ILevelledValue[];
  Range?: number | ILevelledValue[];
  Interval?: number;
  Target?: string;
  Flag?: string;
}

/** Full skill definition as read from the skill database YAML. */
export interface ISkill {
  Id: number;
  Name: string;
  Description: string;
  MaxLevel: number;
  Type?: string;
  TargetType?: string;
  DamageFlags?: IDamageFlags;
  Flags?: ISkillFlags;
  Range?: number | ILevelledValue[];
  Hit?: string;
  HitCount?: number | ILevelledValue[];
  Element?: string | ILevelledValue[];
  SplashArea?: number | ILevelledValue[];
  ActiveInstance?: number | ILevelledValue[];
  Knockback?: number | ILevelledValue[];
  GiveAp?: number | ILevelledValue[];
  CopyFlags?: ICopyFlags;
  NoNearNPC?: {
    AdditionalRange?: number;
    Type?: string;
  };
  CastCancel?: boolean;
  CastDefenseReduction?: number;
  CastTime?: number | ILevelledValue[];
  AfterCastActDelay?: number | ILevelledValue[];
  AfterCastWalkDelay?: number | ILevelledValue[];
  Duration1?: number | ILevelledValue[];
  Duration2?: number | ILevelledValue[];
  Cooldown?: number | ILevelledValue[];
  FixedCastTime?: number | ILevelledValue[];
  CastTimeFlags?: string;
  CastDelayFlags?: string;
  Requires?: ISkillRequirements;
  Unit?: ISkillUnit;
  Status?: string;
}

/** Header metadata for the skill database file. */
export interface ISkillDBHeader {
  Type: string;
  Version: number;
}

/** Root structure of the parsed skill database YAML. */
export interface ISkillDB {
  Header: ISkillDBHeader;
  Body: ISkill[];
}
