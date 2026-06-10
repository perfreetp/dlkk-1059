import { create } from 'zustand';
import type {
  GameState,
  PlayerState,
  Order,
  Vehicle,
  WeatherType,
  PanelType,
  Message,
} from '../types';
import { MAP_NODES, getNode, findShortestPath } from '../data/mapData';
import { generateOrder, generateInitialOrders, generateId } from '../data/orders';
import { INITIAL_EQUIPMENT, INITIAL_SKILLS } from '../data/equipment';
import { getChapter, CHAPTERS } from '../data/chapters';

const initialVehicle: Vehicle = {
  type: 'electric_scooter',
  name: '小电驴',
  durability: 100,
  maxDurability: 100,
  battery: 100,
  maxBattery: 100,
  speed: 80,
  batteryDrain: 0.5,
};

const initialPlayerState: PlayerState = {
  id: 'player1',
  name: '骑手小王',
  level: 1,
  exp: 0,
  money: 0,
  maxStamina: 100,
  skills: [...INITIAL_SKILLS],
  equipment: [...INITIAL_EQUIPMENT],
  unlockedChapters: ['chapter1'],
  highScores: {},
  totalDeliveries: 0,
  reputation: 100,
};

const initialGameState: GameState = {
  isPlaying: false,
  isPaused: false,
  currentChapterId: null,
  gameTime: 0,
  remainingTime: 0,

  playerPosition: { x: 100, y: 100 },
  currentNodeId: 'n1',
  targetNodeId: null,
  currentRoute: [],
  routeProgress: 0,

  availableOrders: [],
  activeOrders: [],
  deliveredOrders: [],
  failedOrders: [],

  vehicle: { ...initialVehicle },
  stamina: 100,

  currentEarnings: 0,
  tips: 0,

  messages: [],
  unreadMessageCount: 0,

  weather: 'clear',

  currentPanel: 'map',
  selectedOrderId: null,

  speedMultiplier: 1,
  isSettled: false,
};

interface GameStore extends GameState {
  player: PlayerState;
  
  startGame: (chapterId: string) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  
  update: (deltaTime: number) => void;
  
  acceptOrder: (orderId: string) => void;
  pickUpOrder: (orderId: string) => void;
  deliverOrder: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;
  
  setTargetNode: (nodeId: string) => void;
  setCurrentPanel: (panel: PanelType) => void;
  selectOrder: (orderId: string | null) => void;
  
  addMessage: (message: Omit<Message, 'id' | 'timestamp' | 'read'>) => void;
  markMessageRead: (messageId: string) => void;
  
  buyEquipment: (equipmentId: string) => void;
  upgradeSkill: (skillId: string) => void;
  
  chargeVehicle: (amount: number) => void;
  rest: (amount: number) => void;
  
  setSpeedMultiplier: (multiplier: number) => void;
  
  loadPlayer: () => void;
  savePlayer: () => void;
  
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialGameState,
  player: { ...initialPlayerState },

  startGame: (chapterId: string) => {
    const chapter = getChapter(chapterId);
    if (!chapter) return;

    const startNode = MAP_NODES[0];
    const initialOrders = generateInitialOrders(3, chapter.difficulty);

    const welcomeMessage: Omit<Message, 'id' | 'timestamp' | 'read'> = {
      sender: '系统',
      content: `欢迎来到${chapter.name}！目标收益：¥${chapter.targetEarnings}，加油！`,
      type: 'system',
    };

    set({
      ...initialGameState,
      isPlaying: true,
      isPaused: false,
      currentChapterId: chapterId,
      remainingTime: chapter.timeLimit,
      weather: chapter.weather,
      playerPosition: { x: startNode.x, y: startNode.y },
      currentNodeId: startNode.id,
      availableOrders: initialOrders,
      vehicle: { ...initialVehicle },
      stamina: get().player.maxStamina,
      isSettled: false,
    });

    get().addMessage(welcomeMessage);
  },

  pauseGame: () => set({ isPaused: true }),
  resumeGame: () => set({ isPaused: false }),
  endGame: () => {
    const state = get();
    const chapter = getChapter(state.currentChapterId || '');
    const player = state.player;
    
    const finalScore = state.currentEarnings + state.tips;
    
    if (chapter && finalScore >= chapter.targetEarnings) {
      const chapterIndex = CHAPTERS.findIndex(c => c.id === chapter.id);
      if (chapterIndex < CHAPTERS.length - 1) {
        const nextChapter = CHAPTERS[chapterIndex + 1];
        if (!player.unlockedChapters.includes(nextChapter.id)) {
          player.unlockedChapters.push(nextChapter.id);
        }
      }
    }
    
    if (chapter) {
      const currentHigh = player.highScores[chapter.id] || 0;
      if (finalScore > currentHigh) {
        player.highScores[chapter.id] = finalScore;
      }
    }
    
    player.money += finalScore;
    player.totalDeliveries += state.deliveredOrders.length;
    player.exp += state.deliveredOrders.length * 10;
    
    const expNeeded = player.level * 100;
    if (player.exp >= expNeeded) {
      player.level += 1;
      player.exp -= expNeeded;
    }
    
    set({ isPlaying: false, isSettled: true, player: { ...player } });
    get().savePlayer();
  },

  update: (deltaTime: number) => {
    const state = get();
    if (!state.isPlaying || state.isPaused) return;

    const chapter = getChapter(state.currentChapterId || '');
    if (!chapter) return;

    const dt = deltaTime * state.speedMultiplier;
    let newRemainingTime = state.remainingTime - dt;
    let newGameTime = state.gameTime + dt;

    if (newRemainingTime <= 0) {
      set({ remainingTime: 0 });
      get().endGame();
      return;
    }

    let newStamina = state.stamina;
    let newBattery = state.vehicle.battery;
    let newPosition = { ...state.playerPosition };
    let newCurrentNodeId = state.currentNodeId;
    let newTargetNodeId = state.targetNodeId;
    let newRoute = [...state.currentRoute];
    let newRouteProgress = state.routeProgress;

    const weatherSpeedMod = getWeatherSpeedModifier(state.weather);
    const actualSpeed = state.vehicle.speed * weatherSpeedMod * (1 + getTotalSkillBonus('speed') / 100);

    if (newRoute.length > 1 && newTargetNodeId) {
      const currentNode = getNode(newCurrentNodeId);
      const nextNodeId = newRoute[1];
      const nextNode = getNode(nextNodeId);

      if (currentNode && nextNode) {
        const segmentDistance = Math.sqrt(
          Math.pow(nextNode.x - currentNode.x, 2) +
          Math.pow(nextNode.y - currentNode.y, 2)
        );
        
        const progressDelta = (actualSpeed * dt) / segmentDistance;
        newRouteProgress += progressDelta;

        if (newRouteProgress >= 1) {
          newRouteProgress = 0;
          newCurrentNodeId = nextNodeId;
          newPosition = { x: nextNode.x, y: nextNode.y };
          newRoute = newRoute.slice(1);
          
          if (newRoute.length <= 1) {
            newTargetNodeId = null;
          }
        } else {
          newPosition.x = currentNode.x + (nextNode.x - currentNode.x) * newRouteProgress;
          newPosition.y = currentNode.y + (nextNode.y - currentNode.y) * newRouteProgress;
        }

        newStamina -= 0.02 * dt * state.speedMultiplier;
        newBattery -= state.vehicle.batteryDrain * dt * state.speedMultiplier * weatherSpeedMod;
      }
    } else {
      newStamina = Math.min(state.player.maxStamina, newStamina + 0.05 * dt);
    }

    newStamina = Math.max(0, newStamina);
    newBattery = Math.max(0, newBattery);

    const updatedAvailable = state.availableOrders.map(order => {
      const newTimeLimit = order.timeLimit - dt;
      const tempDecay = 0.15 * dt * (1 - getInsulationBonus() / 100);
      const newTemp = Math.max(0, order.foodTemperature - tempDecay);
      return { ...order, timeLimit: newTimeLimit, foodTemperature: newTemp };
    }).filter(order => order.timeLimit > 0);

    const expiredOrders = state.availableOrders.filter(order => order.timeLimit - dt <= 0);
    if (expiredOrders.length > 0) {
      set({ availableOrders: updatedAvailable });
      return;
    }

    const updatedActive = state.activeOrders.map(order => {
      const newTimeLimit = order.timeLimit - dt;
      const tempDecay = 0.1 * dt * (1 - getInsulationBonus() / 100);
      const newTemp = Math.max(0, order.foodTemperature - tempDecay);
      return { ...order, timeLimit: newTimeLimit, foodTemperature: newTemp };
    });

    const newFailedOrders: Order[] = [];
    const stillActive = updatedActive.filter(order => {
      if (order.timeLimit <= 0 && order.status !== 'delivered') {
        newFailedOrders.push({ ...order, status: 'failed' });
        return false;
      }
      return true;
    });

    if (newFailedOrders.length > 0) {
      newFailedOrders.forEach(order => {
        get().addMessage({
          sender: '系统',
          content: `订单超时：${order.restaurant} → ${order.customer}，已被取消。`,
          type: 'system',
        });
      });
    }

    const orderSpawnChance = chapter.orderDensity * 0.002 * dt;
    let newAvailable = [...updatedAvailable];
    
    if (Math.random() < orderSpawnChance && newAvailable.length < 8) {
      const newOrder = generateOrder(chapter.difficulty);
      newAvailable.push(newOrder);
    }

    const newVehicle = {
      ...state.vehicle,
      battery: newBattery,
      durability: Math.max(0, state.vehicle.durability - 0.005 * dt * state.speedMultiplier),
    };

    set({
      remainingTime: newRemainingTime,
      gameTime: newGameTime,
      playerPosition: newPosition,
      currentNodeId: newCurrentNodeId,
      targetNodeId: newTargetNodeId,
      currentRoute: newRoute,
      routeProgress: newRouteProgress,
      stamina: newStamina,
      vehicle: newVehicle,
      availableOrders: newAvailable,
      activeOrders: stillActive,
      failedOrders: [...state.failedOrders, ...newFailedOrders],
    });
  },

  acceptOrder: (orderId: string) => {
    const state = get();
    const orderIndex = state.availableOrders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) return;
    
    const order = { ...state.availableOrders[orderIndex], status: 'accepted' as const };
    const newAvailable = state.availableOrders.filter(o => o.id !== orderId);
    
    set({
      availableOrders: newAvailable,
      activeOrders: [...state.activeOrders, order],
    });
    
    get().addMessage({
      sender: '系统',
      content: `已接单：${order.restaurant} → ${order.customer}，¥${order.reward}`,
      type: 'system',
      orderId: order.id,
    });
  },

  pickUpOrder: (orderId: string) => {
    const state = get();
    const order = state.activeOrders.find(o => o.id === orderId);
    if (!order) return;
    
    const currentNode = getNode(state.currentNodeId);
    if (!currentNode || currentNode.id !== order.pickupNodeId) return;
    
    const updatedOrders = state.activeOrders.map(o => 
      o.id === orderId 
        ? { ...o, status: 'picked' as const, pickedAt: state.gameTime, foodTemperature: 95 }
        : o
    );
    
    set({ activeOrders: updatedOrders });
    
    get().addMessage({
      sender: order.restaurant,
      content: '餐品已备好，请尽快送达！',
      type: 'customer',
      orderId,
    });
  },

  deliverOrder: (orderId: string) => {
    const state = get();
    const order = state.activeOrders.find(o => o.id === orderId);
    if (!order) return;
    
    const currentNode = getNode(state.currentNodeId);
    if (!currentNode || currentNode.id !== order.dropoffNodeId) return;
    
    const timeRatio = order.timeLimit / (order.timeLimit + (state.gameTime - (order.pickedAt || 0)));
    const tempBonus = order.foodTemperature / 100;
    
    let baseReward = order.reward;
    let tip = 0;
    let rating = 3;
    
    if (timeRatio > 0.8) {
      rating = 5;
      tip = Math.floor(baseReward * 0.2 * (1 + getTotalSkillBonus('charm') / 100));
    } else if (timeRatio > 0.5) {
      rating = 4;
      tip = Math.floor(baseReward * 0.1 * (1 + getTotalSkillBonus('charm') / 100));
    } else if (timeRatio > 0.2) {
      rating = 3;
    } else {
      rating = 2;
    }
    
    if (tempBonus > 0.8) {
      rating = Math.min(5, rating + 1);
      tip += Math.floor(baseReward * 0.1);
    }
    
    const totalReward = baseReward + tip;
    const deliveredOrder = { 
      ...order, 
      status: 'delivered' as const, 
      deliveredAt: state.gameTime 
    };
    
    set({
      activeOrders: state.activeOrders.filter(o => o.id !== orderId),
      deliveredOrders: [...state.deliveredOrders, deliveredOrder],
      currentEarnings: state.currentEarnings + baseReward,
      tips: state.tips + tip,
    });
    
    get().addMessage({
      sender: order.customer,
      content: `谢谢！${rating}星好评！${tip > 0 ? `小费¥${tip}` : ''}`,
      type: 'customer',
      orderId,
    });
  },

  cancelOrder: (orderId: string) => {
    const state = get();
    const order = state.activeOrders.find(o => o.id === orderId);
    if (!order) return;
    
    const penalty = Math.floor(order.reward * 0.3);
    
    set({
      activeOrders: state.activeOrders.filter(o => o.id !== orderId),
      currentEarnings: Math.max(0, state.currentEarnings - penalty),
    });
    
    get().addMessage({
      sender: '系统',
      content: `订单已取消，扣除违约金¥${penalty}`,
      type: 'system',
    });
  },

  setTargetNode: (nodeId: string) => {
    const state = get();
    const path = findShortestPath(state.currentNodeId, nodeId);
    
    if (path.length > 1) {
      set({
        targetNodeId: nodeId,
        currentRoute: path,
        routeProgress: 0,
      });
    }
  },

  setCurrentPanel: (panel: PanelType) => set({ currentPanel: panel }),
  selectOrder: (orderId: string | null) => set({ selectedOrderId: orderId }),

  addMessage: (message) => {
    const newMessage: Message = {
      ...message,
      id: generateId(),
      timestamp: Date.now(),
      read: false,
    };
    
    set(state => ({
      messages: [newMessage, ...state.messages].slice(0, 50),
      unreadMessageCount: state.unreadMessageCount + 1,
    }));
  },

  markMessageRead: (messageId: string) => {
    set(state => ({
      messages: state.messages.map(m => 
        m.id === messageId ? { ...m, read: true } : m
      ),
      unreadMessageCount: Math.max(0, state.unreadMessageCount - 1),
    }));
  },

  buyEquipment: (equipmentId: string) => {
    const state = get();
    const equipment = state.player.equipment.find(e => e.id === equipmentId);
    
    if (!equipment || equipment.owned || state.player.money < equipment.price) return;
    
    const newEquipment = state.player.equipment.map(e =>
      e.id === equipmentId ? { ...e, owned: true } : e
    );
    
    set({
      player: {
        ...state.player,
        money: state.player.money - equipment.price,
        equipment: newEquipment,
      },
    });
    
    get().savePlayer();
  },

  upgradeSkill: (skillId: string) => {
    const state = get();
    const skill = state.player.skills.find(s => s.id === skillId);
    
    if (!skill || skill.level >= skill.maxLevel) return;
    
    const cost = Math.floor(100 * Math.pow(1.5, skill.level));
    if (state.player.money < cost) return;
    
    const newSkills = state.player.skills.map(s =>
      s.id === skillId ? { ...s, level: s.level + 1 } : s
    );
    
    let newMaxStamina = 100;
    const staminaSkill = newSkills.find(s => s.id === 'stamina');
    if (staminaSkill) {
      newMaxStamina = 100 + staminaSkill.effect * staminaSkill.level;
    }
    
    set({
      player: {
        ...state.player,
        money: state.player.money - cost,
        skills: newSkills,
        maxStamina: newMaxStamina,
      },
    });
    
    get().savePlayer();
  },

  chargeVehicle: (amount: number) => {
    const state = get();
    const currentNode = getNode(state.currentNodeId);
    
    if (!currentNode || currentNode.type !== 'charging') return;
    
    const chargeAmount = Math.min(amount, state.vehicle.maxBattery - state.vehicle.battery);
    const cost = Math.ceil(chargeAmount * 0.2);
    
    if (state.currentEarnings < cost) return;
    
    set({
      vehicle: {
        ...state.vehicle,
        battery: state.vehicle.battery + chargeAmount,
      },
      currentEarnings: state.currentEarnings - cost,
    });
  },

  rest: (amount: number) => {
    const state = get();
    const currentNode = getNode(state.currentNodeId);
    
    if (!currentNode || currentNode.type !== 'rest') return;
    
    const restAmount = Math.min(amount, state.player.maxStamina - state.stamina);
    
    set({
      stamina: state.stamina + restAmount,
    });
  },

  setSpeedMultiplier: (multiplier: number) => {
    set({ speedMultiplier: multiplier });
  },

  loadPlayer: () => {
    try {
      const saved = localStorage.getItem('delivery_rider_player');
      if (saved) {
        const data = JSON.parse(saved);
        set({ player: { ...initialPlayerState, ...data } });
      }
    } catch (e) {
      console.error('Failed to load player data:', e);
    }
  },

  savePlayer: () => {
    try {
      localStorage.setItem('delivery_rider_player', JSON.stringify(get().player));
    } catch (e) {
      console.error('Failed to save player data:', e);
    }
  },

  resetGame: () => {
    set({ ...initialGameState, isSettled: false });
  },
}));

function getWeatherSpeedModifier(weather: WeatherType): number {
  const modifiers: Record<WeatherType, number> = {
    clear: 1.0,
    light_rain: 0.85,
    heavy_rain: 0.7,
    storm: 0.5,
  };
  return modifiers[weather];
}

function getTotalSkillBonus(skillId: string): number {
  const state = useGameStore.getState();
  const skill = state.player.skills.find(s => s.id === skillId);
  if (!skill) return 0;
  return skill.effect * skill.level;
}

function getInsulationBonus(): number {
  const state = useGameStore.getState();
  const insulation = state.player.equipment.find(e => e.type === 'insulation' && e.owned);
  return insulation ? insulation.effect : 0;
}
