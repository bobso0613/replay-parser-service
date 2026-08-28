/** Map of a boolean-flagged job/class/location set from the item database YAML. */
export interface IItemBooleanMap {
  [key: string]: boolean;
}

/** Extra item metadata that affects item behavior and restrictions. */
export interface IItemFlags {
  BuyingStore?: boolean;
  DeadBranch?: boolean;
  Container?: boolean;
  UniqueId?: boolean;
  BindOnEquip?: boolean;
  DropAnnounce?: boolean;
  NoConsume?: boolean;
  DropEffect?: string;
}

/** Delay settings for item use. */
export interface IItemDelay {
  Duration?: number;
  Status?: string;
}

/** Stack settings controlling stacking and storage behavior. */
export interface IItemStack {
  Amount?: number;
  Inventory?: boolean;
  Cart?: boolean;
  Storage?: boolean;
  GuildStorage?: boolean;
}

/** Conditions under which an item cannot be used. */
export interface IItemNoUse {
  Override?: number;
  Sitting?: boolean;
}

/** Trade restrictions for the item. */
export interface IItemTrade {
  Override?: number;
  NoDrop?: boolean;
  NoTrade?: boolean;
  TradePartner?: boolean;
  NoSell?: boolean;
  NoCart?: boolean;
  NoStorage?: boolean;
  NoGuildStorage?: boolean;
  NoMail?: boolean;
  NoAuction?: boolean;
}

/** Full item definition as found in the item database YAML. */
export interface IItem {
  Id: number;
  AegisName: string;
  Name: string;
  Type?: string;
  SubType?: string | number;
  Buy?: number;
  Sell?: number;
  Weight?: number;
  Attack?: number;
  MagicAttack?: number;
  Defense?: number;
  Range?: number;
  Slots?: number;
  Jobs?: IItemBooleanMap;
  Classes?: IItemBooleanMap;
  Gender?: string;
  Locations?: IItemBooleanMap;
  WeaponLevel?: number;
  ArmorLevel?: number;
  EquipLevelMin?: number;
  EquipLevelMax?: number;
  Refineable?: boolean;
  Gradable?: boolean;
  View?: number;
  AliasName?: string | null;
  Flags?: IItemFlags;
  Delay?: IItemDelay;
  Stack?: IItemStack;
  NoUse?: IItemNoUse;
  Trade?: IItemTrade;
  Script?: string;
  EquipScript?: string;
  UnEquipScript?: string;
}

/** Header metadata for the item database YAML. */
export interface IItemDBHeader {
  Type: string;
  Version: number;
}

/** Root structure of the parsed item database YAML. */
export interface IItemDB {
  Header: IItemDBHeader;
  Body: IItem[];
}
