import React, { useState } from 'react';
import { CharacterStats, VehicleStats } from '@/types';
import CustomSelect from './CustomSelect';

interface CombinationSelectorProps {
  characters: CharacterStats[];
  vehicles: VehicleStats[];
  onAddCombination: (character: CharacterStats, vehicle: VehicleStats) => void;
}

export default function CombinationSelector({ characters, vehicles, onAddCombination }: CombinationSelectorProps) {
  const characterOptions = [
    { value: '', label: '請選擇角色...' },
    ...characters.map(character => ({
      value: character.name,
      label: character.name
    }))
  ];

  const vehicleOptions = [
    { value: '', label: '請選擇載具...' },
    ...vehicles.map(vehicle => ({
      value: vehicle.name,
      label: vehicle.name
    }))
  ];

  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');

  const handleAddCombination = () => {
    const character = characters.find(c => c.name === selectedCharacter);
    const vehicle = vehicles.find(v => v.name === selectedVehicle);

    if (character && vehicle) {
      onAddCombination(character, vehicle);
      setSelectedCharacter('');
      setSelectedVehicle('');
    }
  };

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-md p-4 border border-yellow-200 mb-4">
      <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">
        ✨ 建立新的角色+載具組合
      </h3>
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              選擇角色 🎮
            </label>
            <CustomSelect
              value={selectedCharacter}
              onChange={setSelectedCharacter}
              options={characterOptions}
              placeholder="請選擇角色..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              選擇載具 🏎️
            </label>
            <CustomSelect
              value={selectedVehicle}
              onChange={setSelectedVehicle}
              options={vehicleOptions}
              placeholder="請選擇載具..."
            />
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleAddCombination}
            disabled={!selectedCharacter || !selectedVehicle}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-md shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-300"
          >
            ✨ 建立組合
          </button>
        </div>
      </div>
    </div>
  );
}
