import { CharacterStats, VehicleStats } from "@/types";

// 驗證結果介面
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// 角色資料驗證函數
export function validateCharacterStats(character: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 型別檢查
  if (!character || typeof character !== "object") {
    errors.push("角色資料必須是物件");
    return { isValid: false, errors, warnings };
  }

  const char = character as Record<string, unknown>;

  // 必要欄位檢查
  const requiredFields = [
    "name",
    "englishName",
    "displaySpeed",
    "roadSpeed",
    "terrainSpeed",
    "waterSpeed",
    "acceleration",
    "weight",
    "displayHandling",
    "roadHandling",
    "terrainHandling",
    "waterHandling",
  ];

  for (const field of requiredFields) {
    if (char[field] === undefined || char[field] === null) {
      errors.push(`缺少必要欄位: ${field}`);
    }
  }

  // 名稱型別檢查
  if (typeof char.name !== "string" || char.name.trim().length === 0) {
    errors.push("角色名稱必須是非空字串");
  }

  if (
    typeof char.englishName !== "string" ||
    char.englishName.trim().length === 0
  ) {
    errors.push("角色英文名稱必須是非空字串");
  }

  // 數值欄位檢查
  const numericFields = [
    "displaySpeed",
    "roadSpeed",
    "terrainSpeed",
    "waterSpeed",
    "acceleration",
    "weight",
    "displayHandling",
    "roadHandling",
    "terrainHandling",
    "waterHandling",
  ];

  for (const field of numericFields) {
    const value = char[field];
    if (typeof value !== "number" || isNaN(value) || !isFinite(value)) {
      errors.push(`${field} 必須是有效的數值`);
    } else if (value < 0) {
      errors.push(`${field} 不能為負數`);
    } else if (value > 100) {
      warnings.push(`${field} 超過 100，請確認資料正確性`);
    }
  }

  // 合理性檢查
  const displaySpeed = char.displaySpeed as number;
  const roadSpeed = char.roadSpeed as number;
  const terrainSpeed = char.terrainSpeed as number;
  const waterSpeed = char.waterSpeed as number;

  if (
    Math.abs(displaySpeed - Math.max(roadSpeed, terrainSpeed, waterSpeed)) > 1
  ) {
    warnings.push("displaySpeed 應接近 terrain, road, water 中的最大值");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// 載具資料驗證函數
export function validateVehicleStats(vehicle: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 型別檢查
  if (!vehicle || typeof vehicle !== "object") {
    errors.push("載具資料必須是物件");
    return { isValid: false, errors, warnings };
  }

  const veh = vehicle as Record<string, unknown>;

  // 必要欄位檢查
  const requiredFields = [
    "name",
    "englishName",
    "displaySpeed",
    "roadSpeed",
    "terrainSpeed",
    "waterSpeed",
    "acceleration",
    "weight",
    "displayHandling",
    "roadHandling",
    "terrainHandling",
    "waterHandling",
  ];

  for (const field of requiredFields) {
    if (veh[field] === undefined || veh[field] === null) {
      errors.push(`缺少必要欄位: ${field}`);
    }
  }

  // 名稱型別檢查
  if (typeof veh.name !== "string" || veh.name.trim().length === 0) {
    errors.push("載具名稱必須是非空字串");
  }

  if (
    typeof veh.englishName !== "string" ||
    veh.englishName.trim().length === 0
  ) {
    errors.push("載具英文名稱必須是非空字串");
  }

  // 數值欄位檢查
  const numericFields = [
    "displaySpeed",
    "roadSpeed",
    "terrainSpeed",
    "waterSpeed",
    "acceleration",
    "weight",
    "displayHandling",
    "roadHandling",
    "terrainHandling",
    "waterHandling",
  ];

  for (const field of numericFields) {
    const value = veh[field];
    if (typeof value !== "number" || isNaN(value) || !isFinite(value)) {
      errors.push(`${field} 必須是有效的數值`);
    } else if (value < 0) {
      errors.push(`${field} 不能為負數`);
    } else if (value > 100) {
      warnings.push(`${field} 超過 100，請確認資料正確性`);
    }
  }

  // 載具特有檢查
  const weight = veh.weight as number;
  if (weight > 10) {
    warnings.push("載具重量超過 10，可能影響遊戲平衡");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// 批次驗證角色資料
export function validateCharactersData(
  characters: unknown[],
): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  if (!Array.isArray(characters)) {
    return {
      isValid: false,
      errors: ["角色資料必須是陣列"],
      warnings: [],
    };
  }

  if (characters.length === 0) {
    return {
      isValid: false,
      errors: ["角色資料陣列不能為空"],
      warnings: [],
    };
  }

  // 檢查重複名稱
  const nameSet = new Set<string>();
  const englishNameSet = new Set<string>();

  characters.forEach((character, index) => {
    const result = validateCharacterStats(character);

    result.errors.forEach((error) => {
      allErrors.push(`角色 ${index + 1}: ${error}`);
    });

    result.warnings.forEach((warning) => {
      allWarnings.push(`角色 ${index + 1}: ${warning}`);
    });

    // 檢查名稱重複
    if (character && typeof character === "object") {
      const char = character as CharacterStats;
      if (char.name) {
        if (nameSet.has(char.name)) {
          allErrors.push(`重複的角色名稱: ${char.name}`);
        } else {
          nameSet.add(char.name);
        }
      }

      if (char.englishName) {
        if (englishNameSet.has(char.englishName)) {
          allErrors.push(`重複的英文名稱: ${char.englishName}`);
        } else {
          englishNameSet.add(char.englishName);
        }
      }
    }
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

// 批次驗證載具資料
export function validateVehiclesData(vehicles: unknown[]): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  if (!Array.isArray(vehicles)) {
    return {
      isValid: false,
      errors: ["載具資料必須是陣列"],
      warnings: [],
    };
  }

  if (vehicles.length === 0) {
    return {
      isValid: false,
      errors: ["載具資料陣列不能為空"],
      warnings: [],
    };
  }

  // 檢查重複名稱
  const nameSet = new Set<string>();
  const englishNameSet = new Set<string>();

  vehicles.forEach((vehicle, index) => {
    const result = validateVehicleStats(vehicle);

    result.errors.forEach((error) => {
      allErrors.push(`載具 ${index + 1}: ${error}`);
    });

    result.warnings.forEach((warning) => {
      allWarnings.push(`載具 ${index + 1}: ${warning}`);
    });

    // 檢查名稱重複
    if (vehicle && typeof vehicle === "object") {
      const veh = vehicle as VehicleStats;
      if (veh.name) {
        if (nameSet.has(veh.name)) {
          allErrors.push(`重複的載具名稱: ${veh.name}`);
        } else {
          nameSet.add(veh.name);
        }
      }

      if (veh.englishName) {
        if (englishNameSet.has(veh.englishName)) {
          allErrors.push(`重複的英文名稱: ${veh.englishName}`);
        } else {
          englishNameSet.add(veh.englishName);
        }
      }
    }
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

// 驗證完整的 Mario Kart 資料
export function validateMarioKartData(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || typeof data !== "object") {
    errors.push("資料必須是物件");
    return { isValid: false, errors, warnings };
  }

  const marioData = data as Record<string, unknown>;

  // 驗證角色資料
  if (!marioData.characters) {
    errors.push("缺少 characters 欄位");
  } else {
    const characterResult = validateCharactersData(
      marioData.characters as unknown[],
    );
    errors.push(...characterResult.errors);
    warnings.push(...characterResult.warnings);
  }

  // 驗證載具資料
  if (!marioData.vehicles) {
    errors.push("缺少 vehicles 欄位");
  } else {
    const vehicleResult = validateVehiclesData(marioData.vehicles as unknown[]);
    errors.push(...vehicleResult.errors);
    warnings.push(...vehicleResult.warnings);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
