import { create } from 'zustand';
import type {
  GameState,
  PlayerState,
  Order,
  Vehicle,
  WeatherType,
  PanelType,
  Message,
  TrafficLight,
  RoadEvent,
  OrderReport,
  OrderAppeal,
  ChapterRecord,
} from '../types';
import { MAP_NODES, getNode, findShortestPath, getIntersectionsWithLights } from '../data/mapData';
import { generateOrder, generateInitialOrders, generateId } from '../data/orders';
import { INITIAL_EQUIPMENT, INITIAL_SKILLS, getSkillUpgradeCost, getSkillTotalEffect } from '../data/equipment';
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
  chapterRecords: {},
  totalDeliveries: 0,
  totalSuccessfulDeliveries: 0,
  totalFailedDeliveries: 0,
  totalEarnings: 0,
  totalTips: 0,
  totalDistance: 0,
  totalPlayTime: 0,
  reputation: 100,
  reports: [],
  appeals: [],
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

  trafficLights: [],
  roadEvents: [],
  currentEvent: null,
  isAtTrafficLight: false,
  currentTrafficLight: null,
  waitingAtLight: false,

  sessionDeliveries: 0,
  sessionDistance: 0,
};

const createInitialTrafficLights = (): TrafficLight[] => {
  const intersectionNodes = getIntersectionsWithLights();
  return intersectionNodes.map(node => ({
    nodeId: node.id,
    state: Math.random() > 0.5 ? 'green' : 'red',
    timer: Math.random() * 10,
    redDuration: 8 + Math.random() * 4,
    yellowDuration: 2,
    greenDuration: 10 + Math.random() * 5,
  }));
};

const ROAD_EVENT_TEMPLATES = [
  { type: 'flood' as const, description: '路面积水', speedPenalty: 0.3, staminaCost: 0.05, batteryCost: 0.03, duration: 30 },
  { type: 'traffic_jam' as const, description: '交通拥堵', speedPenalty: 0.4, staminaCost: 0.02, batteryCost: 0.02, duration: 45 },
  { type: 'construction' as const, description: '道路施工', speedPenalty: 0.35, staminaCost: 0.03, batteryCost: 0.04, duration: 60 },
  { type: 'accident' as const, description: '交通事故', speedPenalty: 0.5, staminaCost: 0.04, batteryCost: 0.02, duration: 25 },
];

function getWeatherSpeedModifier(weather: WeatherType): number {
  const modifiers: Record<WeatherType, number> = {
    clear: 1.0,
    light_rain: 0.85,
    heavy_rain: 0.7,
    storm: 0.5,
  };
  return modifiers[weather];
}

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

  submitReport: (orderId: string, reason: string, description: string) => void;
  submitAppeal: (orderId: string, reason: string, description: string) => void;
  resolveReport: (reportId: string) => void;
  resolveAppeal: (appealId: string) => void;

  setTargetNode: (nodeId: string) => void;
  setCurrentPanel: (panel: PanelType) => void;
  selectOrder: (orderId: string | null) => void;

  runRedLight: () => void;
  waitAtLight: () => void;

  addMessage: (message: Omit<Message, 'id' | 'timestamp' | 'read'>) => void;
  markMessageRead: (messageId: string) => void;

  buyEquipment: (equipmentId: string) => void;
  upgradeSkill: (skillId: string) => void;

  chargeVehicle: (amount: number) => void;
  repairVehicle: (amount: number) => void;
  rest: (amount: number) => void;

  setSpeedMultiplier: (multiplier: number) => void;

  updateChapterRecord: (chapterId: string, data: Partial<ChapterRecord>) => void;

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
    get().loadPlayer();
    const { player } = get();

    const startNode = MAP_NODES[0];
    const trafficLights = createInitialTrafficLights();

    const batteryEquip = player.equipment.find(e => e.type === 'battery' && e.owned);
    const staminaSkill = player.skills.find(s => s.id === 'stamina');
    const actualMaxStamina = 100 + (staminaSkill ? getSkillTotalEffect(staminaSkill) : 0);
    const actualMaxBattery = 100 + (batteryEquip ? batteryEquip.effect : 0);

    const initialOrders = generateInitialOrders(3, chapter.difficulty, player.reputation);

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
      vehicle: { 
        ...initialVehicle, 
        maxBattery: actualMaxBattery,
        battery: actualMaxBattery,
        maxDurability: 100,
        durability: 100,
      },
      stamina: actualMaxStamina,
      isSettled: false,
      trafficLights,
      roadEvents: [],
      player: {
        ...player,
        maxStamina: actualMaxStamina,
      },
    });

    get().addMessage({
      sender: '系统',
      content: `欢迎来到${chapter.name}！目标收益：¥${chapter.targetEarnings}，注意安全！当前声誉：${player.reputation}`,
      type: 'system',
    });
  },

  pauseGame: () => set({ isPaused: true }),
  resumeGame: () => set({ isPaused: false }),
  
  endGame: () => {
    const state = get();
    const chapter = getChapter(state.currentChapterId || '');
    if (!chapter) return;

    const finalScore = state.currentEarnings + state.tips;
    const isWin = finalScore >= chapter.targetEarnings;

    let player = { ...state.player };
    
    if (isWin) {
      const chapterIndex = CHAPTERS.findIndex(c => c.id === chapter.id);
      if (chapterIndex < CHAPTERS.length - 1) {
        const nextChapter = CHAPTERS[chapterIndex + 1];
        if (!player.unlockedChapters.includes(nextChapter.id)) {
          player.unlockedChapters.push(nextChapter.id);
          get().addMessage({
            sender: '系统',
            content: `🎉 新章节解锁：${nextChapter.name}！`,
            type: 'system',
          });
        }
      }
    }

    const currentHigh = player.highScores[chapter.id] || 0;
    if (finalScore > currentHigh) {
      player.highScores[chapter.id] = finalScore;
    }

    const record: ChapterRecord = player.chapterRecords[chapter.id] || {
      chapterId: chapter.id,
      bestScore: 0,
      totalDeliveries: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
      totalEarnings: 0,
      totalTips: 0,
      bestTime: Infinity,
      averageTimePerOrder: 0,
      playCount: 0,
      lastPlayedAt: 0,
    };

    const playTime = chapter.timeLimit - state.remainingTime;
    const successfulCount = state.deliveredOrders.length;
    const totalSessionDeliveries = successfulCount + state.failedOrders.length;

    record.bestScore = Math.max(record.bestScore, finalScore);
    record.totalDeliveries += totalSessionDeliveries;
    record.successfulDeliveries += successfulCount;
    record.failedDeliveries += state.failedOrders.length;
    record.totalEarnings += state.currentEarnings;
    record.totalTips += state.tips;
    if (isWin && playTime < record.bestTime) {
      record.bestTime = playTime;
    }
    const prevTotal = record.totalDeliveries - totalSessionDeliveries;
    if (record.totalDeliveries > 0 && totalSessionDeliveries > 0) {
      const avgTimePerOrderThisSession = totalSessionDeliveries > 0 ? playTime / totalSessionDeliveries : 0;
      if (prevTotal <= 0) {
        record.averageTimePerOrder = avgTimePerOrderThisSession;
      } else {
        record.averageTimePerOrder = (record.averageTimePerOrder * prevTotal + avgTimePerOrderThisSession * totalSessionDeliveries) / record.totalDeliveries;
      }
    }
    record.playCount += 1;
    record.lastPlayedAt = Date.now();

    player.chapterRecords[chapter.id] = record;
    player.money += finalScore;
    player.totalDeliveries += totalSessionDeliveries;
    player.totalSuccessfulDeliveries += successfulCount;
    player.totalFailedDeliveries += state.failedOrders.length;
    player.totalEarnings += state.currentEarnings;
    player.totalTips += state.tips;
    player.totalPlayTime += playTime;
    player.totalDistance += state.sessionDistance;
    player.exp += successfulCount * 10 + (isWin ? 50 : 0);

    const expNeeded = player.level * 100;
    while (player.exp >= expNeeded) {
      player.level += 1;
      player.exp -= expNeeded;
      get().addMessage({
        sender: '系统',
        content: `🎊 升级了！当前等级：Lv.${player.level}`,
        type: 'system',
      });
    }

    set({ isPlaying: false, isSettled: true, player });
    get().savePlayer();
  },

  update: (deltaTime: number) => {
    const state = get();
    if (!state.isPlaying || state.isPaused) return;

    const chapter = getChapter(state.currentChapterId || '');
    if (!chapter) return;

    const dt = deltaTime * state.speedMultiplier;

    const updatedLights = state.trafficLights.map(light => {
      let newTimer = light.timer - dt;
      let newState = light.state;
      
      if (newTimer <= 0) {
        if (light.state === 'green') {
          newState = 'yellow';
          newTimer = light.yellowDuration;
        } else if (light.state === 'yellow') {
          newState = 'red';
          newTimer = light.redDuration;
        } else {
          newState = 'green';
          newTimer = light.greenDuration;
        }
      }
      return { ...light, state: newState, timer: newTimer };
    });

    if (state.waitingAtLight && state.currentTrafficLight) {
      const updatedCurrentLight = updatedLights.find(l => l.nodeId === state.currentTrafficLight?.nodeId);
      if (updatedCurrentLight && updatedCurrentLight.state === 'green') {
        set({ 
          waitingAtLight: false, 
          currentTrafficLight: null, 
          isAtTrafficLight: false,
          trafficLights: updatedLights,
        });
        get().addMessage({
          sender: '系统',
          content: '绿灯了，继续前进！',
          type: 'system',
        });
        return;
      }
      set({ trafficLights: updatedLights, currentTrafficLight: updatedCurrentLight || null });
      return;
    }

    let newRemainingTime = state.remainingTime - dt;
    let newGameTime = state.gameTime + dt;

    if (newRemainingTime <= 0) {
      set({ remainingTime: 0 });
      get().endGame();
      return;
    }

    const newRoadEvents = state.roadEvents.filter(event => {
      return (Date.now() - event.createdAt) / 1000 < event.duration;
    });

    if (Math.random() < 0.0005 * dt && newRoadEvents.length < 3) {
      const template = ROAD_EVENT_TEMPLATES[Math.floor(Math.random() * ROAD_EVENT_TEMPLATES.length)];
      const randomNode = MAP_NODES[Math.floor(Math.random() * MAP_NODES.length)];
      const hasEvent = newRoadEvents.some(e => e.nodeId === randomNode.id);
      if (!hasEvent) {
        newRoadEvents.push({
          id: generateId(),
          type: template.type,
          nodeId: randomNode.id,
          description: template.description,
          speedPenalty: template.speedPenalty,
          staminaCost: template.staminaCost,
          batteryCost: template.batteryCost,
          duration: template.duration,
          createdAt: Date.now(),
        });
      }
    }

    let newStamina = state.stamina;
    let newBattery = state.vehicle.battery;
    let newDurability = state.vehicle.durability;
    let newPosition = { ...state.playerPosition };
    let newCurrentNodeId = state.currentNodeId;
    let newTargetNodeId = state.targetNodeId;
    let newRoute = [...state.currentRoute];
    let newRouteProgress = state.routeProgress;
    let newSessionDistance = state.sessionDistance;
    let newIsAtTrafficLight = false;
    let newCurrentTrafficLight: TrafficLight | null = null;
    let vehicleBrokeDown = false;

    const weatherSpeedMod = getWeatherSpeedModifier(state.weather);
    const speedSkillBonus = 1 + getSkillTotalEffect(state.player.skills.find(s => s.id === 'speed')!) / 100;
    const enduranceMod = 1 - getSkillTotalEffect(state.player.skills.find(s => s.id === 'endurance')!) / 100;
    const ledLightBonus = state.player.equipment.find(e => e.type === 'light' && e.owned) ? 1.1 : 1;
    const durabilityMod = newDurability > 50 ? 1 : newDurability > 20 ? 0.85 : 0.6;
    const batteryEmptyMod = newBattery > 10 ? 1 : newBattery > 0 ? 0.5 : 0;
    const staminaMod = newStamina > 30 ? 1 : newStamina > 0 ? 0.6 : 0.3;

    let actualSpeed = state.vehicle.speed * weatherSpeedMod * speedSkillBonus * ledLightBonus * durabilityMod * batteryEmptyMod * staminaMod;

    if (newDurability < 10 && newRoute.length > 1 && Math.random() < 0.002 * dt) {
      vehicleBrokeDown = true;
      newRoute = [];
      newTargetNodeId = null;
      newRouteProgress = 0;
      
      get().addMessage({
        sender: '系统',
        content: '💥 车辆故障！耐久度过低导致抛锚，请尽快到修车铺维修。所有活动订单可能受影响。',
        type: 'system',
      });

      const penaltyOrders: Order[] = [];
      const remainingActive: Order[] = [];
      for (const order of state.activeOrders) {
        if (order.status === 'picked' && Math.random() < 0.5) {
          penaltyOrders.push({ ...order, status: 'failed' as const, hasIssue: true, issueType: 'damaged' as const });
        } else {
          remainingActive.push(order);
        }
      }
      
      if (penaltyOrders.length > 0) {
        set(s => ({
          activeOrders: remainingActive,
          failedOrders: [...s.failedOrders, ...penaltyOrders],
        }));
      }
    }

    if (!vehicleBrokeDown && newBattery > 0 && newRoute.length > 1 && newTargetNodeId) {
      const currentNode = getNode(newCurrentNodeId);
      const nextNodeId = newRoute[1];
      const nextNode = getNode(nextNodeId);

      if (currentNode && nextNode) {
        const segmentDistance = Math.sqrt(
          Math.pow(nextNode.x - currentNode.x, 2) +
          Math.pow(nextNode.y - currentNode.y, 2)
        );

        const currentEvent = newRoadEvents.find(e => e.nodeId === nextNodeId || e.nodeId === newCurrentNodeId);
        if (currentEvent) {
          actualSpeed *= (1 - currentEvent.speedPenalty);
          newStamina -= currentEvent.staminaCost * dt * 10;
          newBattery -= currentEvent.batteryCost * dt * 10;
        }

        if (nextNode.isSlope) {
          actualSpeed *= (1 - (nextNode.slopeDifficulty || 1) * 0.2);
          newStamina -= 0.05 * dt * (nextNode.slopeDifficulty || 1) * 10;
          newBattery -= 0.08 * dt * (nextNode.slopeDifficulty || 1) * 10;
        }

        const progressDelta = (actualSpeed * dt) / segmentDistance;
        newRouteProgress += progressDelta;

        if (newRouteProgress >= 1) {
          newRouteProgress = 0;
          newCurrentNodeId = nextNodeId;
          newPosition = { x: nextNode.x, y: nextNode.y };
          newRoute = newRoute.slice(1);
          newSessionDistance += segmentDistance / 100;

          if (nextNode.hasTrafficLight) {
            const light = updatedLights.find(l => l.nodeId === nextNodeId);
            if (light && (light.state === 'red' || light.state === 'yellow')) {
              const navSkill = state.player.skills.find(s => s.id === 'navigation');
              const waitReduce = navSkill ? getSkillTotalEffect(navSkill) / 100 : 0;
              
              if (Math.random() > waitReduce) {
                newIsAtTrafficLight = true;
                newCurrentTrafficLight = light;
              }
            }
          }

          if (newRoute.length <= 1) {
            newTargetNodeId = null;
          }
        } else {
          newPosition.x = currentNode.x + (nextNode.x - currentNode.x) * newRouteProgress;
          newPosition.y = currentNode.y + (nextNode.y - currentNode.y) * newRouteProgress;
        }

        newStamina -= 0.02 * dt * state.speedMultiplier * enduranceMod;
        newBattery -= state.vehicle.batteryDrain * dt * state.speedMultiplier * (1 / weatherSpeedMod);
      }
    } else {
      newStamina = Math.min(state.player.maxStamina, newStamina + 0.05 * dt * 10);
    }

    newStamina = Math.max(0, Math.min(state.player.maxStamina, newStamina));
    newBattery = Math.max(0, Math.min(state.vehicle.maxBattery, newBattery));

    const insulationBonus = state.player.equipment.find(e => e.type === 'insulation' && e.owned);
    const insulationMod = insulationBonus ? 1 - insulationBonus.effect / 100 : 1;

    const updatedAvailable = state.availableOrders.map(order => {
      const newTimeLimit = order.timeLimit - dt;
      const tempDecay = 0.15 * dt * insulationMod;
      const newTemp = Math.max(0, order.foodTemperature - tempDecay);
      return { ...order, timeLimit: newTimeLimit, foodTemperature: newTemp };
    }).filter(order => order.timeLimit > 0);

    const updatedActive = state.activeOrders.map(order => {
      const newTimeLimit = order.timeLimit - dt;
      const tempDecay = 0.1 * dt * insulationMod;
      const newTemp = Math.max(0, order.foodTemperature - tempDecay);
      return { ...order, timeLimit: newTimeLimit, foodTemperature: newTemp };
    });

    const newFailedOrders: Order[] = [];
    const stillActive: Order[] = [];

    for (const order of updatedActive) {
      if (order.timeLimit <= 0 && order.status !== 'delivered') {
        const failedOrder = { 
          ...order, 
          status: 'failed' as const, 
          hasIssue: true, 
          issueType: 'late' as const 
        };
        newFailedOrders.push(failedOrder);
        get().addMessage({
          sender: '系统',
          content: `⚠️ 订单超时：${order.restaurant} → ${order.customer}。可在消息中提交申诉。`,
          type: 'system',
          orderId: order.id,
          actionRequired: true,
        });
      } else {
        stillActive.push(order);
      }
    }

    const reputation = state.player.reputation;
    const repBonus = (reputation - 50) / 100;
    const baseSpawnChance = chapter.orderDensity * 0.002 * dt;
    const orderSpawnChance = Math.max(0.0001, baseSpawnChance * (0.5 + repBonus));
    
    let newAvailable = [...updatedAvailable];
    
    if (Math.random() < orderSpawnChance && newAvailable.length < 8) {
      const newOrder = generateOrder(chapter.difficulty, reputation);
      newAvailable.push(newOrder);
    }

    if (!vehicleBrokeDown) {
      newDurability = Math.max(0, newDurability - 0.003 * dt * state.speedMultiplier / enduranceMod);
    }

    if (newDurability < 10 && state.vehicle.durability >= 10) {
      get().addMessage({
        sender: '系统',
        content: '⚠️ 车辆耐久度过低！继续行驶可能抛锚，请尽快到修车铺维修。',
        type: 'system',
      });
    }

    if (newBattery < 10 && state.vehicle.battery >= 10) {
      get().addMessage({
        sender: '系统',
        content: '⚡ 电量不足！请尽快充电。',
        type: 'system',
      });
    }

    if (newBattery <= 0 && state.vehicle.battery > 0 && newRoute.length > 1) {
      newRoute = [];
      newTargetNodeId = null;
      newRouteProgress = 0;
      get().addMessage({
        sender: '系统',
        content: '⚡ 电量耗尽！车辆已停止，请先充电或呼叫救援。',
        type: 'system',
      });
    }

    if (newStamina < 20 && state.stamina >= 20) {
      get().addMessage({
        sender: '系统',
        content: '😫 体力消耗过多！建议到骑手驿站休息。',
        type: 'system',
      });
    }

    set({
      remainingTime: newRemainingTime,
      gameTime: newGameTime,
      playerPosition: newPosition,
      currentNodeId: newCurrentNodeId,
      targetNodeId: newTargetNodeId,
      currentRoute: newRoute,
      routeProgress: newRouteProgress,
      stamina: newStamina,
      vehicle: {
        ...state.vehicle,
        battery: newBattery,
        durability: newDurability,
      },
      availableOrders: newAvailable,
      activeOrders: stillActive,
      failedOrders: [...state.failedOrders, ...newFailedOrders],
      trafficLights: updatedLights,
      roadEvents: newRoadEvents,
      isAtTrafficLight: newIsAtTrafficLight,
      currentTrafficLight: newCurrentTrafficLight,
      sessionDistance: newSessionDistance,
      sessionDeliveries: state.sessionDeliveries + newFailedOrders.filter(o => o.status === 'failed').length,
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
      content: '餐品已备好，请尽快送达！注意保温~',
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
    
    const timeRatio = Math.max(0, order.timeLimit / (order.timeLimit + (state.gameTime - (order.pickedAt || 0))));
    const tempBonus = order.foodTemperature / 100;
    
    let baseReward = order.reward;
    let tip = 0;
    let rating = 3;
    let hasIssue = false;
    let issueType: Order['issueType'];
    
    if (order.customerNote && Math.random() > 0.7) {
      hasIssue = true;
      issueType = 'note_ignored';
      rating = Math.max(1, rating - 1);
    }
    
    if (timeRatio > 0.8) {
      rating = 5;
    } else if (timeRatio > 0.5) {
      rating = 4;
    } else if (timeRatio > 0.2) {
      rating = 3;
    } else {
      rating = 2;
      hasIssue = true;
      issueType = 'late';
    }
    
    if (tempBonus > 0.8) {
      rating = Math.min(5, rating + 1);
    } else if (tempBonus < 0.4) {
      hasIssue = true;
      issueType = 'cold';
      rating = Math.max(1, rating - 1);
    }

    const tipSkillBonus = 1 + getSkillTotalEffect(state.player.skills.find(s => s.id === 'tip_chance')!) / 100;

    if (rating >= 4) {
      tip = Math.floor(baseReward * 0.15 * tipSkillBonus * (rating === 5 ? 1.5 : 1));
    } else if (rating >= 3) {
      tip = Math.floor(baseReward * 0.05 * tipSkillBonus);
    }
    
    const totalReward = baseReward + tip;
    const deliveredOrder = { 
      ...order, 
      status: 'delivered' as const, 
      deliveredAt: state.gameTime,
      rating,
      hasIssue,
      issueType,
    };

    let newReputation = state.player.reputation;
    if (rating >= 4) {
      newReputation = Math.min(100, newReputation + 0.5);
    } else if (rating <= 2) {
      newReputation = Math.max(0, newReputation - 2);
    }
    
    set(state => ({
      activeOrders: state.activeOrders.filter(o => o.id !== orderId),
      deliveredOrders: [...state.deliveredOrders, deliveredOrder],
      currentEarnings: state.currentEarnings + baseReward,
      tips: state.tips + tip,
      player: { ...state.player, reputation: newReputation },
      sessionDeliveries: state.sessionDeliveries + 1,
    }));
    
    let message = `谢谢！${rating}星好评！${tip > 0 ? ` 小费¥${tip}` : ''}`;
    if (hasIssue) {
      message += ' 顾客有些不满，可在消息中提交异常报备。';
    }
    
    get().addMessage({
      sender: order.customer,
      content: message,
      type: 'customer',
      orderId,
      actionRequired: hasIssue,
    });
  },

  cancelOrder: (orderId: string) => {
    const state = get();
    const order = state.activeOrders.find(o => o.id === orderId);
    if (!order) return;
    
    const penalty = Math.floor(order.reward * 0.3);
    const newReputation = Math.max(0, state.player.reputation - 1);
    
    set(state => ({
      activeOrders: state.activeOrders.filter(o => o.id !== orderId),
      currentEarnings: Math.max(0, state.currentEarnings - penalty),
      player: { ...state.player, reputation: newReputation },
    }));
    
    get().addMessage({
      sender: '系统',
      content: `订单已取消，扣除违约金¥${penalty}，声誉-1`,
      type: 'system',
    });
  },

  submitReport: (orderId: string, reason: string, description: string) => {
    const state = get();
    const reportId = generateId();
    const report: OrderReport = {
      id: reportId,
      orderId,
      reason,
      description,
      status: 'pending',
      createdAt: Date.now(),
    };

    const reports = [...state.player.reports, report];
    set(state => ({ player: { ...state.player, reports } }));
    get().savePlayer();

    get().addMessage({
      sender: '客服',
      content: '异常报备已提交，我们会尽快处理，请留意结果通知。',
      type: 'report',
      orderId,
      reportId,
    });

    setTimeout(() => {
      get().resolveReport(reportId);
    }, 3000);
  },

  submitAppeal: (orderId: string, reason: string, description: string) => {
    const state = get();
    const appealId = generateId();
    const appeal: OrderAppeal = {
      id: appealId,
      orderId,
      reason,
      description,
      status: 'pending',
      createdAt: Date.now(),
    };

    const appeals = [...state.player.appeals, appeal];
    set(state => ({ player: { ...state.player, appeals } }));
    get().savePlayer();

    get().addMessage({
      sender: '客服',
      content: '申诉已提交，我们会在24小时内审核。',
      type: 'appeal',
      orderId,
      appealId,
    });

    setTimeout(() => {
      get().resolveAppeal(appealId);
    }, 5000);
  },

  resolveReport: (reportId: string) => {
    const state = get();
    const report = state.player.reports.find(r => r.id === reportId);
    if (!report || report.status !== 'pending') return;

    const appealSkill = state.player.skills.find(s => s.id === 'defense');
    const successRate = 0.5 + (appealSkill ? getSkillTotalEffect(appealSkill) / 100 : 0);
    const success = Math.random() < successRate;

    let compensation = 0;
    let resultMessage = '';

    if (success) {
      compensation = 15;
      resultMessage = `报备成功！已补偿¥${compensation}。`;
    } else {
      resultMessage = '报备未通过，感谢您的反馈。';
    }

    const updatedReports = state.player.reports.map(r =>
      r.id === reportId
        ? { ...r, status: (success ? 'approved' : 'rejected') as 'approved' | 'rejected', resolvedAt: Date.now(), result: resultMessage, compensation }
        : r
    );

    set(state => ({
      player: { 
        ...state.player, 
        reports: updatedReports,
        money: state.player.money + compensation,
      },
      currentEarnings: state.currentEarnings + compensation,
    }));
    get().savePlayer();

    get().addMessage({
      sender: '客服',
      content: `报备处理结果：${resultMessage}`,
      type: 'report',
      orderId: report.orderId,
      reportId,
    });
  },

  resolveAppeal: (appealId: string) => {
    const state = get();
    const appeal = state.player.appeals.find(a => a.id === appealId);
    if (!appeal || appeal.status !== 'pending') return;

    const appealSkill = state.player.skills.find(s => s.id === 'defense');
    const successRate = 0.4 + (appealSkill ? getSkillTotalEffect(appealSkill) / 100 : 0);
    const success = Math.random() < successRate;

    let penaltyRefunded = 0;
    let reputationRestored = 0;
    let resultMessage = '';

    if (success) {
      penaltyRefunded = 20;
      reputationRestored = 3;
      resultMessage = `申诉成功！已退还罚款¥${penaltyRefunded}，恢复声誉${reputationRestored}点。`;
    } else {
      resultMessage = '申诉未通过，请继续努力提高服务质量。';
    }

    const updatedAppeals = state.player.appeals.map(a =>
      a.id === appealId
        ? { ...a, status: (success ? 'approved' : 'rejected') as 'approved' | 'rejected', resolvedAt: Date.now(), result: resultMessage, penaltyRefunded, reputationRestored }
        : a
    );

    set(state => ({
      player: {
        ...state.player,
        appeals: updatedAppeals,
        money: state.player.money + penaltyRefunded,
        reputation: Math.min(100, state.player.reputation + reputationRestored),
      },
      currentEarnings: state.currentEarnings + penaltyRefunded,
    }));
    get().savePlayer();

    get().addMessage({
      sender: '客服',
      content: `申诉处理结果：${resultMessage}`,
      type: 'appeal',
      orderId: appeal.orderId,
      appealId,
    });
  },

  runRedLight: () => {
    const state = get();
    if (!state.currentTrafficLight) return;

    const risk = Math.random();
    let penalty = 0;
    let reputationLoss = 0;
    let damage = 0;
    let message = '';

    if (risk < 0.3) {
      penalty = 50;
      reputationLoss = 5;
      damage = 10;
      message = '🚨 被交警拦下！罚款¥50，声誉-5，车辆-10耐久。';
    } else if (risk < 0.6) {
      damage = 5;
      message = '惊险通过！但车辆受到轻微损伤，耐久-5。';
    } else {
      message = '幸运通过！节省了时间。';
    }

    const newReputation = Math.max(0, state.player.reputation - reputationLoss);
    const newDurability = Math.max(0, state.vehicle.durability - damage);

    set({
      waitingAtLight: false,
      currentTrafficLight: null,
      isAtTrafficLight: false,
      currentEarnings: Math.max(0, state.currentEarnings - penalty),
      vehicle: { ...state.vehicle, durability: newDurability },
      player: { ...state.player, reputation: newReputation },
    });

    if (message) {
      get().addMessage({
        sender: '系统',
        content: message,
        type: 'system',
      });
    }
  },

  waitAtLight: () => {
    const state = get();
    if (!state.currentTrafficLight) return;

    set({ waitingAtLight: true });
    
    get().addMessage({
      sender: '系统',
      content: '正在等待绿灯...',
      type: 'system',
    });
  },

  setTargetNode: (nodeId: string) => {
    const state = get();
    if (state.vehicle.battery <= 0) {
      get().addMessage({
        sender: '系统',
        content: '⚡ 电量耗尽！请先充电或呼叫救援。',
        type: 'system',
      });
      return;
    }
    if (state.isAtTrafficLight) {
      return;
    }
    const path = findShortestPath(state.currentNodeId, nodeId);
    
    if (path.length > 1) {
      set({
        targetNodeId: nodeId,
        currentRoute: path,
        routeProgress: 0,
        waitingAtLight: false,
        currentTrafficLight: null,
        isAtTrafficLight: false,
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
      messages: [newMessage, ...state.messages].slice(0, 100),
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

    let newMaxBattery = state.vehicle.maxBattery;
    if (equipment.type === 'battery') {
      newMaxBattery = 100 + equipment.effect;
    }

    let newMaxStamina = state.player.maxStamina;
    if (equipment.type === 'helmet') {
      newMaxStamina = state.player.maxStamina;
    }
    
    set({
      player: {
        ...state.player,
        money: state.player.money - equipment.price,
        equipment: newEquipment,
        maxStamina: newMaxStamina,
      },
      vehicle: { ...state.vehicle, maxBattery: newMaxBattery },
    });
    
    get().savePlayer();
  },

  upgradeSkill: (skillId: string) => {
    const state = get();
    const skill = state.player.skills.find(s => s.id === skillId);
    
    if (!skill || skill.level >= skill.maxLevel) return;
    
    const cost = getSkillUpgradeCost(skill);
    if (state.player.money < cost) return;
    
    const newSkills = state.player.skills.map(s =>
      s.id === skillId ? { ...s, level: s.level + 1 } : s
    );
    
    let newMaxStamina = state.player.maxStamina;
    if (skill.category === 'stamina') {
      newMaxStamina = 100 + getSkillTotalEffect({ ...skill, level: skill.level + 1 });
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
    
    if (state.currentEarnings + state.player.money < cost) return;

    let fromEarnings = Math.min(state.currentEarnings, cost);
    let fromMoney = cost - fromEarnings;
    
    set({
      vehicle: {
        ...state.vehicle,
        battery: state.vehicle.battery + chargeAmount,
      },
      currentEarnings: state.currentEarnings - fromEarnings,
      player: { ...state.player, money: state.player.money - fromMoney },
    });

    get().addMessage({
      sender: '系统',
      content: `⚡ 充电完成：+${Math.round(chargeAmount)}%，花费¥${cost}`,
      type: 'system',
    });
  },

  repairVehicle: (amount: number) => {
    const state = get();
    const currentNode = getNode(state.currentNodeId);
    
    if (!currentNode || currentNode.type !== 'repair') return;
    
    const repairAmount = Math.min(amount, state.vehicle.maxDurability - state.vehicle.durability);
    const cost = Math.ceil(repairAmount * 0.5);
    
    if (state.currentEarnings + state.player.money < cost) return;

    let fromEarnings = Math.min(state.currentEarnings, cost);
    let fromMoney = cost - fromEarnings;
    
    set({
      vehicle: {
        ...state.vehicle,
        durability: state.vehicle.durability + repairAmount,
      },
      currentEarnings: state.currentEarnings - fromEarnings,
      player: { ...state.player, money: state.player.money - fromMoney },
    });

    get().addMessage({
      sender: '修车铺',
      content: `🔧 维修完成：+${Math.round(repairAmount)}%耐久，花费¥${cost}，故障风险已解除。`,
      type: 'customer',
    });
  },

  rest: (amount: number) => {
    const state = get();
    const currentNode = getNode(state.currentNodeId);
    
    if (!currentNode || currentNode.type !== 'rest') return;
    
    const restAmount = Math.min(amount, state.player.maxStamina - state.stamina);
    const cost = Math.ceil(restAmount * 0.1);
    
    if (state.currentEarnings + state.player.money < cost) return;

    let fromEarnings = Math.min(state.currentEarnings, cost);
    let fromMoney = cost - fromEarnings;
    
    set({
      stamina: state.stamina + restAmount,
      currentEarnings: state.currentEarnings - fromEarnings,
      player: { ...state.player, money: state.player.money - fromMoney },
    });

    get().addMessage({
      sender: '骑手驿站',
      content: `☕ 休息完成：+${Math.round(restAmount)}体力，花费¥${cost}`,
      type: 'customer',
    });
  },

  setSpeedMultiplier: (multiplier: number) => {
    set({ speedMultiplier: multiplier });
  },

  updateChapterRecord: (chapterId: string, data: Partial<ChapterRecord>) => {
    set(state => {
      const existing = state.player.chapterRecords[chapterId];
      return {
        player: {
          ...state.player,
          chapterRecords: {
            ...state.player.chapterRecords,
            [chapterId]: { ...existing, ...data },
          },
        },
      };
    });
    get().savePlayer();
  },

  loadPlayer: () => {
    try {
      const saved = localStorage.getItem('delivery_rider_player_v2');
      if (saved) {
        const data = JSON.parse(saved);
        const mergedSkills = INITIAL_SKILLS.map(s => {
          const saved = data.skills?.find((ds: any) => ds.id === s.id);
          return saved ? { ...s, ...saved } : s;
        });
        const mergedEquipment = INITIAL_EQUIPMENT.map(e => {
          const saved = data.equipment?.find((de: any) => de.id === e.id);
          return saved ? { ...e, owned: saved.owned } : e;
        });
        set({ 
          player: { 
            ...initialPlayerState, 
            ...data, 
            skills: mergedSkills,
            equipment: mergedEquipment,
          } 
        });
      }
    } catch (e) {
      console.error('Failed to load player data:', e);
    }
  },

  savePlayer: () => {
    try {
      localStorage.setItem('delivery_rider_player_v2', JSON.stringify(get().player));
    } catch (e) {
      console.error('Failed to save player data:', e);
    }
  },

  resetGame: () => {
    set({ ...initialGameState, isSettled: false });
  },
}));
