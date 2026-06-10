import type { Skill, Equipment } from '../types';

export const INITIAL_EQUIPMENT: Equipment[] = [
  {
    id: 'helmet_basic',
    name: '基础头盔',
    type: 'helmet',
    effect: 0,
    description: '普通头盔，安全第一。',
    price: 0,
    owned: true,
  },
  {
    id: 'helmet_pro',
    name: '专业头盔',
    type: 'helmet',
    effect: 10,
    description: '专业骑手头盔，减少体力消耗10%。',
    price: 200,
    owned: false,
  },
  {
    id: 'gloves_basic',
    name: '普通手套',
    type: 'gloves',
    effect: 0,
    description: '普通手套，保暖够用。',
    price: 0,
    owned: true,
  },
  {
    id: 'gloves_warm',
    name: '保暖手套',
    type: 'gloves',
    effect: 15,
    description: '加厚保暖手套，雨天操作更稳，耐久消耗减少。',
    price: 150,
    owned: false,
  },
  {
    id: 'insulation_basic',
    name: '普通保温袋',
    type: 'insulation',
    effect: 0,
    description: '基础保温袋，勉强能用。',
    price: 0,
    owned: true,
  },
  {
    id: 'insulation_pro',
    name: '专业保温箱',
    type: 'insulation',
    effect: 30,
    description: '专业保温箱，餐品温度下降减慢30%。',
    price: 300,
    owned: false,
  },
  {
    id: 'light_basic',
    name: '标准车灯',
    type: 'light',
    effect: 0,
    description: '标准车灯，照路够用。',
    price: 0,
    owned: true,
  },
  {
    id: 'light_led',
    name: 'LED大灯',
    type: 'light',
    effect: 20,
    description: '高亮LED大灯，夜间和雨天速度加成。',
    price: 180,
    owned: false,
  },
  {
    id: 'battery_std',
    name: '标准电池',
    type: 'battery',
    effect: 0,
    description: '标准容量电池。',
    price: 0,
    owned: true,
  },
  {
    id: 'battery_large',
    name: '大容量电池',
    type: 'battery',
    effect: 50,
    description: '大容量电池，最大电量增加50%。',
    price: 500,
    owned: false,
  },
];

export const INITIAL_SKILLS: Skill[] = [
  {
    id: 'speed',
    name: '风驰电掣',
    description: '提升骑行速度',
    level: 0,
    maxLevel: 5,
    effectPerLevel: 5,
    unit: '%',
    category: 'speed',
  },
  {
    id: 'stamina',
    name: '体力充沛',
    description: '增加最大体力上限',
    level: 0,
    maxLevel: 5,
    effectPerLevel: 20,
    unit: '',
    category: 'stamina',
  },
  {
    id: 'tip_chance',
    name: '微笑服务',
    description: '提升获得小费的概率和金额',
    level: 0,
    maxLevel: 5,
    effectPerLevel: 10,
    unit: '%',
    category: 'tip',
  },
  {
    id: 'defense',
    name: '申诉专家',
    description: '提高差评申诉成功率',
    level: 0,
    maxLevel: 5,
    effectPerLevel: 15,
    unit: '%',
    category: 'appeal',
  },
  {
    id: 'endurance',
    name: '耐力达人',
    description: '减少体力消耗速度',
    level: 0,
    maxLevel: 5,
    effectPerLevel: 10,
    unit: '%',
    category: 'endurance',
  },
  {
    id: 'navigation',
    name: '路路通',
    description: '熟悉路况，减少路口等待时间',
    level: 0,
    maxLevel: 3,
    effectPerLevel: 15,
    unit: '%',
    category: 'navigation',
  },
];

export const getSkillUpgradeCost = (skill: Skill): number => {
  return Math.floor(100 * Math.pow(1.6, skill.level));
};

export const getSkillTotalEffect = (skill: Skill): number => {
  return skill.effectPerLevel * skill.level;
};

export const getSkillCategoryLabel = (category: Skill['category']): string => {
  const labels: Record<Skill['category'], string> = {
    speed: '速度',
    stamina: '体力',
    tip: '小费',
    appeal: '申诉',
    endurance: '耐力',
    navigation: '导航',
  };
  return labels[category];
};

export const getSkillCategoryColor = (category: Skill['category']): string => {
  const colors: Record<Skill['category'], string> = {
    speed: 'text-neon-blue',
    stamina: 'text-green-400',
    tip: 'text-neon-yellow',
    appeal: 'text-neon-pink',
    endurance: 'text-orange-400',
    navigation: 'text-purple-400',
  };
  return colors[category];
};
