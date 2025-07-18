import { CharacterStats, VehicleStats } from '@/types';

interface CombinationSelectorProps {
  characters: CharacterStats[];
  vehicles: VehicleStats[];
  onAddCombination: (character: CharacterStats, vehicle: VehicleStats) => void;
  onSwitchToPage?: (page: 'characters' | 'vehicles' | 'combinations') => void;
}

export default function CombinationSelector({ characters, vehicles, onAddCombination, onSwitchToPage }: CombinationSelectorProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const characterName = formData.get('character') as string;
    const vehicleName = formData.get('vehicle') as string;

    const selectedCharacter = characters.find(c => c.name === characterName);
    const selectedVehicle = vehicles.find(v => v.name === vehicleName);

    if (selectedCharacter && selectedVehicle) {
      onAddCombination(selectedCharacter, selectedVehicle);
      e.currentTarget.reset();
      // 建立組合後自動切換到組合頁面
      if (onSwitchToPage) {
        onSwitchToPage('combinations');
      }
    }
  };

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-md p-4 border border-yellow-200">
      <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">
        🏁 建立角色+載具組合
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              選擇角色 🎮
            </label>
            <select
              name="character"
              required
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
            >
              <option value="">請選擇角色...</option>
              {characters.map((character) => (
                <option key={character.name} value={character.name}>
                  {character.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              選擇載具 🏎️
            </label>
            <select
              name="vehicle"
              required
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
            >
              <option value="">請選擇載具...</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.name} value={vehicle.name}>
                  {vehicle.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <button
            type="submit"
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium py-2 px-6 rounded-md shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          >
            ✨ 建立組合
          </button>
        </div>
      </form>
    </div>
  );
}
