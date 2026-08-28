export interface ISkillUsage {
  skillId: string;
  skillName: string;
  skillDamageDealt?: number;
  skillUsageCount: number;
  maxDamageDealt?: number;
  maxDamageMonsterId?: string;
  maxDamageMonsterName?: string;
  maxDamageMonsterIsMvp?: boolean;
}

export interface ISkillInfo {
  offensive: ISkillUsage[];
  support: ISkillUsage[];
}

export interface IItemUsage {
  itemId: string;
  itemName: string;
  itemUsageCount: number;
}

export interface IPlayer {
  AID: string;
  name: string;
  jobId: number;
  jobName: string;
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalSkillUsageCount: number;
  totalItemUsageCount: number;
  MVPCount: number;
  deathCount: number;
  skillInfo: ISkillInfo;
  itemInfo: IItemUsage[];
}

export interface IPlayerRef {
  playerId: string;
  playerName: string;
}

export interface IDamageInfo extends IPlayerRef {
  skillId: string;
  skillName: string;
  damage?: number;
  damageDealt?: number;
}

export interface IBattleInfo extends IPlayerRef {
  damageDealt: number;
  skills: IPlayerSkillMonsterInfo[];
  highestDamageInfo: IDamageInfo;
}

export interface IPlayerSkillMonsterInfo {
  skillId: string;
  skillName: string;
  skillCount: number;
  damageDealt: number;
}

export interface IMonster {
  monsterId: string;
  monsterName: string;
  isMvp: boolean;
  battleDuration: number;
  battleStartTime: number;
  battleEndTime: number;
  taker: IPlayerRef;
  highestDamageInfo: IDamageInfo;
  battleInfo: IBattleInfo[];
}

export interface IReplayData {
  replayVersion: string;
  players: IPlayer[];
  monsters: IMonster[];
}
