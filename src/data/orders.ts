import type { Order, OrderType } from '../types';
import { getRestaurants, getBuildings, getNode } from './mapData';

const RESTAURANT_NAMES = [
  '星光餐厅', '夜来香烧烤', '老陈面馆', '深夜食堂', '港式茶餐厅',
  '川味小厨', '粤式茶点', '日式拉面', '韩式炸鸡', '汉堡王',
];

const CUSTOMER_NAMES = [
  '王先生', '李女士', '张同学', '刘医生', '陈护士',
  '赵经理', '孙工程师', '周老师', '吴阿姨', '郑先生',
  '加班的小明', '熬夜的小红', '追剧的小华', '打游戏的小刚', '写代码的小李',
];

const CUSTOMER_NOTES = [
  '麻烦快点，饿坏了~',
  '请放在门口，谢谢',
  '汤不要洒了哦',
  '多给双筷子',
  '不要辣，谢谢',
  '麻烦安静点，孩子睡了',
  '送到了打电话',
  '下雨慢点开，注意安全',
  '可以帮我带瓶水吗？',
  '五星好评预定！',
];

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 10);
};

export const generateOrder = (difficulty: number = 1, reputation: number = 50): Order => {
  const restaurants = getRestaurants();
  const buildings = getBuildings();
  
  const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
  let building = buildings[Math.floor(Math.random() * buildings.length)];
  
  while (building.id === restaurant.id) {
    building = buildings[Math.floor(Math.random() * buildings.length)];
  }
  
  const repFactor = Math.max(-0.5, Math.min(0.5, (reputation - 50) / 100));
  
  const typeRoll = Math.random();
  let type: OrderType = 'normal';
  let rewardMultiplier = 1;
  let timeMultiplier = 1;
  
  const urgentChance = Math.max(0, 0.1 + difficulty * 0.05 + repFactor * 0.3);
  const largeChance = Math.max(0, 0.25 + difficulty * 0.05 + repFactor * 0.2);
  const specialChance = Math.max(0, 0.3 + difficulty * 0.02 + repFactor * 0.25);
  
  if (typeRoll < urgentChance) {
    type = 'urgent';
    rewardMultiplier = 1.5;
    timeMultiplier = 0.6;
  } else if (typeRoll < largeChance) {
    type = 'large';
    rewardMultiplier = 1.8;
    timeMultiplier = 0.8;
  } else if (typeRoll < specialChance) {
    type = 'special';
    rewardMultiplier = 2.0;
    timeMultiplier = 0.7;
  }
  
  const baseReward = 15 + Math.floor(Math.random() * 20) + Math.floor(repFactor * 15);
  const reward = Math.max(5, Math.floor(baseReward * rewardMultiplier * (1 + difficulty * 0.1) * (0.8 + repFactor * 0.4)));
  
  const distance = Math.sqrt(
    Math.pow(restaurant.x - building.x, 2) + Math.pow(restaurant.y - building.y, 2)
  );
  const baseTime = Math.floor(distance / 30) + 30;
  const timeLimit = Math.floor(baseTime * timeMultiplier / (1 + difficulty * 0.05));
  
  const customerIndex = Math.floor(Math.random() * CUSTOMER_NAMES.length);
  const hasNote = Math.random() > 0.5;
  const noteIndex = Math.floor(Math.random() * CUSTOMER_NOTES.length);
  
  return {
    id: generateId(),
    type,
    restaurant: restaurant.name || restaurant.id,
    customer: CUSTOMER_NAMES[customerIndex],
    pickupLocation: { x: restaurant.x, y: restaurant.y },
    dropoffLocation: { x: building.x, y: building.y },
    pickupNodeId: restaurant.id,
    dropoffNodeId: building.id,
    reward,
    timeLimit,
    foodTemperature: 100,
    status: 'pending',
    customerNote: hasNote ? CUSTOMER_NOTES[noteIndex] : undefined,
    createdAt: Date.now(),
  };
};

export const generateInitialOrders = (count: number, difficulty: number = 1, reputation: number = 50): Order[] => {
  const orders: Order[] = [];
  for (let i = 0; i < count; i++) {
    const order = generateOrder(difficulty, reputation);
    order.createdAt = Date.now() - Math.floor(Math.random() * 30000);
    order.timeLimit = Math.floor(order.timeLimit * (0.7 + Math.random() * 0.3));
    orders.push(order);
  }
  return orders;
};

export const getOrderTypeLabel = (type: OrderType): string => {
  const labels: Record<OrderType, string> = {
    normal: '普通',
    urgent: '急单',
    large: '大单',
    special: '特殊',
  };
  return labels[type];
};

export const getOrderTypeColor = (type: OrderType): string => {
  const colors: Record<OrderType, string> = {
    normal: 'text-blue-400',
    urgent: 'text-red-400',
    large: 'text-yellow-400',
    special: 'text-purple-400',
  };
  return colors[type];
};

export const getOrderTypeBgColor = (type: OrderType): string => {
  const colors: Record<OrderType, string> = {
    normal: 'bg-blue-500/20 border-blue-500/30',
    urgent: 'bg-red-500/20 border-red-500/30',
    large: 'bg-yellow-500/20 border-yellow-500/30',
    special: 'bg-purple-500/20 border-purple-500/30',
  };
  return colors[type];
};

export { generateId };
