import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Backpack, Shield, Zap, Thermometer, Lightbulb, Battery, Star, TrendingUp, Award } from 'lucide-react';
import type { Equipment, Skill } from '../../types';
import { getSkillUpgradeCost, getSkillTotalEffect, getSkillCategoryLabel, getSkillCategoryColor } from '../../data/equipment';

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

type TabType = 'equipment' | 'skills';

const BackpackPanel = () => {
  const { player, buyEquipment, upgradeSkill } = useGameStore();
  const [activeTab, setActiveTab] = useState<TabType>('equipment');

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

  const renderSkills = () => (
    <div className="space-y-3">
      <div className="glass-panel p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">可用金币</span>
          <span className="text-lg font-bold text-neon-yellow">¥{player.money}</span>
        </div>
      </div>

      {player.skills.map((skill: Skill) => {
        const totalEffect = getSkillTotalEffect(skill);
        const upgradeCost = getSkillUpgradeCost(skill);
        const canUpgrade = skill.level < skill.maxLevel && player.money >= upgradeCost;
        const categoryColor = getSkillCategoryColor(skill.category);

        return (
          <div key={skill.id} className="glass-panel p-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${categoryColor}`}>{skill.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-night-700 text-gray-400">
                    {getSkillCategoryLabel(skill.category)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{skill.description}</p>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${categoryColor}`}>
                  +{totalEffect}{skill.unit}
                </div>
                <div className="text-xs text-gray-500">
                  Lv.{skill.level}/{skill.maxLevel}
                </div>
              </div>
            </div>

            <div className="flex gap-0.5 mb-3">
              {Array(skill.maxLevel).fill(0).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1.5 rounded-full ${
                    i < skill.level
                      ? skill.category === 'speed' ? 'bg-neon-blue'
                      : skill.category === 'stamina' ? 'bg-green-500'
                      : skill.category === 'tip' ? 'bg-neon-yellow'
                      : skill.category === 'appeal' ? 'bg-neon-pink'
                      : skill.category === 'endurance' ? 'bg-orange-500'
                      : 'bg-purple-500'
                      : 'bg-night-700'
                  }`}
                />
              ))}
            </div>

            {skill.level < skill.maxLevel ? (
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  下一级: +{skill.effectPerLevel}{skill.unit}
                </div>
                <button
                  onClick={() => upgradeSkill(skill.id)}
                  disabled={!canUpgrade}
                  className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition-all ${
                    canUpgrade
                      ? 'bg-neon-green/20 text-neon-green border border-neon-green/50 hover:bg-neon-green/30'
                      : 'bg-night-700 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  升级 ¥{upgradeCost}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1 text-neon-green text-sm">
                <Award className="w-4 h-4" />
                已满级
              </div>
            )}
          </div>
        );
      })}

      <div className="glass-panel p-3 mt-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400" />
          技能效果总览
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {player.skills.filter(s => s.level > 0).map(s => (
            <div key={s.id} className="flex justify-between">
              <span className="text-gray-500">{s.name}</span>
              <span className={getSkillCategoryColor(s.category)}>
                +{getSkillTotalEffect(s)}{s.unit}
              </span>
            </div>
          ))}
          {player.skills.every(s => s.level === 0) && (
            <div className="col-span-2 text-center text-gray-600">
              暂未升级任何技能
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderEquipment = () => (
    <div className="space-y-4">
      <div className="glass-panel p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">可用金币</span>
          <span className="text-lg font-bold text-neon-yellow">¥{player.money}</span>
        </div>
      </div>

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
  );

  return (
    <div className="flex flex-col h-full glass-panel">
      <div className="p-3 border-b border-night-600/50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-neon-pink neon-text-pink">🎒 背包</h2>
        <div className="text-sm text-neon-yellow">
          💰 ¥{player.money}
        </div>
      </div>

      <div className="flex border-b border-night-600/50">
        <button
          onClick={() => setActiveTab('equipment')}
          className={`flex-1 px-3 py-2 text-sm font-medium transition-all ${
            activeTab === 'equipment'
              ? 'text-neon-blue border-b-2 border-neon-blue'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          装备
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`flex-1 px-3 py-2 text-sm font-medium transition-all ${
            activeTab === 'skills'
              ? 'text-neon-green border-b-2 border-neon-green'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          技能
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
        {activeTab === 'equipment' ? renderEquipment() : renderSkills()}
      </div>

      <div className="p-3 border-t border-night-600/50">
        <div className="text-xs text-gray-500 text-center">
          技能和装备效果在配送中自动生效
        </div>
      </div>
    </div>
  );
};

export default BackpackPanel;
