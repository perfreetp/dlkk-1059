import type { Equipment, Skill } from '../types';

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
    description: '加厚保暖手套，雨天操作更稳。',
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
    description: '高亮LED大灯，夜间视野更好。',
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
    description: '大容量电池，续航增加50%。',
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
    effect: 5,
  },
  {
    id: 'stamina',
    name: '体力充沛',
    description: '增加最大体力',
    level: 0,
    maxLevel: 5,
    effect: 20,
  },
  {
    id: 'navigation',
    name: '路路通',
    description: '解锁更多路线信息',
    level: 0,
    maxLevel: 3,
    effect: 10,
  },
  {
    id: 'charm',
    name: '微笑服务',
    description: '增加好评率和小费',
    level: 0,
    maxLevel: 5,
    effect: 10,
  },
  {
    id: 'luck',
    name: '好运加持',
    description: '增加遇到好单的概率',
    level: 0,
    maxLevel: 3,
    effect: 15,
  },
  {
    id: 'defense',
    name: '申诉专家',
    description: '提高差评申诉成功率',
    level: 0,
    maxLevel: 3,
    effect: 20,
  },
];

export const getSkillUpgradeCost = (skill: Skill): number => {
  return Math.floor(100 * Math.pow(1.5, skill.level));
};

export const getTotalSkillEffect = (skill: Skill): number => {
  return skill.effect * skill.level;
};
