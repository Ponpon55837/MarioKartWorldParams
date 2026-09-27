import { STAT_KEYS } from "@/types";

// 驗證結果介面
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

type EntityKind = "character" | "vehicle";

const ENTITY_LABEL: Record<EntityKind, string> = {
  character: "角色",
  vehicle: "載具",
};

/** 數值超過此值時提出警告 */
const STAT_WARNING_THRESHOLD = 100;
/** 載具重量超過此值時提出警告 */
const VEHICLE_WEIGHT_WARNING_THRESHOLD = 10;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

/**
 * 驗證單一實體（角色或載具），單次走訪所有欄位
 */
const validateEntity = (
  entity: unknown,
  kind: EntityKind,
): ValidationResult => {
  const label = ENTITY_LABEL[kind];
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isRecord(entity)) {
    return { isValid: false, errors: [`${label}資料必須是物件`], warnings };
  }

  if (!isNonEmptyString(entity.name)) {
    errors.push(`${label}名稱必須是非空字串`);
  }
  if (!isNonEmptyString(entity.englishName)) {
    errors.push(`${label}英文名稱必須是非空字串`);
  }

  for (const field of STAT_KEYS) {
    const value = entity[field];
    if (value === undefined || value === null) {
      errors.push(`缺少必要欄位: ${field}`);
    } else if (typeof value !== "number" || !Number.isFinite(value)) {
      errors.push(`${field} 必須是有效的數值`);
    } else if (value < 0) {
      errors.push(`${field} 不能為負數`);
    } else if (value > STAT_WARNING_THRESHOLD) {
      warnings.push(
        `${field} 超過 ${STAT_WARNING_THRESHOLD}，請確認資料正確性`,
      );
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }

  // 合理性檢查（僅在欄位皆為有效數值時執行）
  if (kind === "character") {
    const terrainMax = Math.max(
      entity.roadSpeed as number,
      entity.terrainSpeed as number,
      entity.waterSpeed as number,
    );
    if (Math.abs((entity.displaySpeed as number) - terrainMax) > 1) {
      warnings.push("displaySpeed 應接近 terrain, road, water 中的最大值");
    }
  } else if ((entity.weight as number) > VEHICLE_WEIGHT_WARNING_THRESHOLD) {
    warnings.push(
      `載具重量超過 ${VEHICLE_WEIGHT_WARNING_THRESHOLD}，可能影響遊戲平衡`,
    );
  }

  return { isValid: true, errors, warnings };
};

/**
 * 批次驗證實體陣列
 * 以 Set 偵測重複名稱，整體 O(n)
 */
const validateEntityList = (
  list: unknown,
  kind: EntityKind,
): ValidationResult => {
  const label = ENTITY_LABEL[kind];

  if (!Array.isArray(list)) {
    return { isValid: false, errors: [`${label}資料必須是陣列`], warnings: [] };
  }
  if (list.length === 0) {
    return {
      isValid: false,
      errors: [`${label}資料陣列不能為空`],
      warnings: [],
    };
  }

  const errors: string[] = [];
  const warnings: string[] = [];
  const seenNames = new Set<string>();
  const seenEnglishNames = new Set<string>();

  list.forEach((entity, index) => {
    const prefix = `${label} ${index + 1}: `;
    const result = validateEntity(entity, kind);
    for (const error of result.errors) errors.push(prefix + error);
    for (const warning of result.warnings) warnings.push(prefix + warning);

    if (!isRecord(entity)) return;

    if (isNonEmptyString(entity.name)) {
      if (seenNames.has(entity.name)) {
        errors.push(`重複的${label}名稱: ${entity.name}`);
      }
      seenNames.add(entity.name);
    }
    if (isNonEmptyString(entity.englishName)) {
      if (seenEnglishNames.has(entity.englishName)) {
        errors.push(`重複的英文名稱: ${entity.englishName}`);
      }
      seenEnglishNames.add(entity.englishName);
    }
  });

  return { isValid: errors.length === 0, errors, warnings };
};

// 角色資料驗證函數
export const validateCharacterStats = (character: unknown): ValidationResult =>
  validateEntity(character, "character");

// 載具資料驗證函數
export const validateVehicleStats = (vehicle: unknown): ValidationResult =>
  validateEntity(vehicle, "vehicle");

// 批次驗證角色資料
export const validateCharactersData = (characters: unknown): ValidationResult =>
  validateEntityList(characters, "character");

// 批次驗證載具資料
export const validateVehiclesData = (vehicles: unknown): ValidationResult =>
  validateEntityList(vehicles, "vehicle");

/**
 * 驗證完整的 Mario Kart 資料
 */
export function validateMarioKartData(data: unknown): ValidationResult {
  if (!isRecord(data)) {
    return { isValid: false, errors: ["資料必須是物件"], warnings: [] };
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  const sections: Array<[unknown, EntityKind, string]> = [
    [data.characters, "character", "characters"],
    [data.vehicles, "vehicle", "vehicles"],
  ];

  for (const [list, kind, field] of sections) {
    if (!list) {
      errors.push(`缺少 ${field} 欄位`);
      continue;
    }
    const result = validateEntityList(list, kind);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  return { isValid: errors.length === 0, errors, warnings };
}
