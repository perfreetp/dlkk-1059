import { useGameStore } from '../../store/gameStore';
import { Backpack, Shield, Zap, Thermometer, Lightbulb, Battery } from 'lucide-react';
import type { Equipment } from '../../types';

const getEquipmentIcon = (type: string) => {
  switch (type) {
    case 'helmet':
      return <Shield className="w-5 h-5" />;
    case 'gloves':
      return <HandIcon />;
    case 'insulation':
      return <Thermometer className="w-5 h-5" />;
    case 'light':
      return <Lightbulb className="w-5 h-5" />;
    case 'battery':
      return <Battery className="w-5 h-5" />;
    default:
      return <Backpack className="w-5 h-5" />;
  }
};

const HandIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/>
    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/>
    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/>
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
  </svg>
);

const BackpackPanel = () => {
  const { player, buyEquipment } = useGameStore();

  const equipmentByType = player.equipment.reduce((acc, eq) => {
    if (!acc[eq.type]) acc[eq.type] = [];
    acc[eq.type].push(eq);
    return acc;
  }, {} as Record<string, Equipment[]>);

  const typeLabels: Record<string, string> = {
    helmet: '头盔',
    gloves: '手套',
    insulation: '保温装备',
    light: '车灯',
    battery: '电池',
  };

  const typeColors: Record<string, string> = {
    helmet: 'text-blue-400',
    gloves: 'text-green-400',
    insulation: 'text-orange-400',
    light: 'text-yellow-400',
    battery: 'text-purple-400',
  };

  return (
    <div className="flex flex-col h-full glass-panel">
      <div className="p-3 border-b border-night-600/50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-neon-pink neon-text-pink">🎒 背包</h2>
        <div className="text-sm text-neon-yellow">
          💰 ¥{player.money}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-4">
        {Object.entries(equipmentByType).map(([type, items]) => (
          <div key={type}>
            <div className={`flex items-center gap-2 mb-2 ${typeColors[type]}`}>
              {getEquipmentIcon(type)}
              <span className="font-medium">{typeLabels[type]}</span>
            </div>
            <div className="space-y-2">
              {items.map(item => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border transition-all ${
                    item.owned
                      ? 'bg-night-700/50 border-neon-green/30'
                      : 'bg-night-800/50 border-night-600/50 hover:border-night-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`font-medium ${item.owned ? 'text-neon-green' : 'text-gray-300'}`}>
                      {item.name}
                      {item.owned && <span className="ml-2 text-xs">✓ 已装备</span>}
                    </span>
                    {item.effect > 0 && (
                      <span className="text-xs text-neon-yellow">
                        +{item.effect}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{item.description}</p>
                  {!item.owned && (
                    <button
                      onClick={() => buyEquipment(item.id)}
                      disabled={player.money < item.price}
                      className={`w-full py-1.5 rounded text-sm transition-all ${
                        player.money >= item.price
                          ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/50 hover:bg-neon-blue/30'
                          : 'bg-night-700 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      购买 ¥{item.price}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-night-600/50">
        <div className="text-xs text-gray-500 text-center">
          装备效果会在游戏中自动生效
        </div>
      </div>
    </div>
  );
};

export default BackpackPanel;
