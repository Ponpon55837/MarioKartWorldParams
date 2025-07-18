import { CharacterStats, VehicleStats } from '@/types';

interface CombinationSelectorProps {
  characters: CharacterStats[];
  vehicles: VehicleStats[];
  onAddCombination: (character: CharacterStats, vehicle: VehicleStats) => void;
}

export default function CombinationSelector({ characters, vehicles, onAddCombination }: CombinationSelectorProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const characterName = formData.get('character') as string;
    const vehicleName = formData.get('vehicle') as string;

    const selectedCharacter = characters.find(c => c.name === characterName);
    const selectedVehicle = vehicles.find(v => v.name === vehicleName);

    if (selectedCharacter && selectedVehicle) {
      onAddCombination(selectedCharacter, selectedVehicle);
      // 重置表單
      e.currentTarget.reset();
    }
  };

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-lg p-6 border-2 border-yellow-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        🏁 建立角色+載具組合
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 角色選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              選擇角色 🎮
            </label>
            <select
              name="character"
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
            >
              <option value="">請選擇角色...</option>
              {characters.map((character) => (
                <option key={character.name} value={character.name}>
                  {character.name} ({character.englishName})
                </option>
              ))}
            </select>
          </div>

          {/* 載具選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              選擇載具 🏎️
            </label>
            <select
              name="vehicle"
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
            >
              <option value="">請選擇載具...</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.name} value={vehicle.name}>
                  {vehicle.name} ({vehicle.englishName})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3 px-6 rounded-md hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          ✨ 建立組合
        </button>
      </form>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>💡 提示：</strong>選擇角色和載具後，系統會自動計算組合能力值（包含 +3 遊戲加成）。
          這樣您就能看到實際遊戲中的完整能力值！
        </p>
      </div>
    </div>
  );
}
