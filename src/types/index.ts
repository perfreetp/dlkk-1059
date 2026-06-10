export type WeatherType = 'clear' | 'light_rain' | 'heavy_rain' | 'storm';

export type OrderType = 'normal' | 'urgent' | 'large' | 'special';

export type OrderStatus = 'pending' | 'accepted' | 'picked' | 'delivered' | 'failed';

export type MessageType = 'story' | 'customer' | 'system' | 'report' | 'appeal';

export type PanelType = 'map' | 'orders' | 'backpack' | 'vehicle' | 'messages' | 'settlement' | 'leaderboard';

export type TrafficLightState = 'red' | 'yellow' | 'green';

export type RoadEventType = 'flood' | 'slope' | 'traffic_jam' | 'accident' | 'construction';

export type ReportStatus = 'pending' | 'approved' | 'rejected';

export type AppealStatus = 'pending' | 'approved' | 'rejected';

export interface Point {
  x: number;
  y: number;
}

export interface MapNode {
  id: string;
  x: number;
  y: number;
  type: 'road' | 'intersection' | 'restaurant' | 'building' | 'charging' | 'rest' | 'repair';
  name?: string;
  connections: string[];
  hasTrafficLight?: boolean;
  isSlope?: boolean;
  slopeDifficulty?: number;
}

export interface TrafficLight {
  nodeId: string;
  state: TrafficLightState;
  timer: number;
  maxTimer: number;
  redDuration: number;
  yellowDuration: number;
  greenDuration: number;
}

export interface RoadEvent {
  id: string;
  type: RoadEventType;
  nodeId: string;
  description: string;
  speedPenalty: number;
  staminaCost: number;
  batteryCost: number;
  duration: number;
  createdAt: number;
}

export type OrderQuality = 'premium' | 'normal' | 'poor';

export interface Order {
  id: string;
  type: OrderType;
  quality: OrderQuality;
  restaurant: string;
  customer: string;
  pickupLocation: Point;
  dropoffLocation: Point;
  pickupNodeId: string;
  dropoffNodeId: string;
  reward: number;
  timeLimit: number;
  foodTemperature: number;
  status: OrderStatus;
  customerNote?: string;
  createdAt: number;
  pickedAt?: number;
  deliveredAt?: number;
  rating?: number;
  hasIssue?: boolean;
  issueType?: 'late' | 'cold' | 'note_ignored' | 'damaged';
  report?: OrderReport;
  appeal?: OrderAppeal;
}

export interface OrderReport {
  id: string;
  orderId: string;
  reason: string;
  description: string;
  status: ReportStatus;
  createdAt: number;
  resolvedAt?: number;
  result?: string;
  compensation?: number;
}

export interface OrderAppeal {
  id: string;
  orderId: string;
  reason: string;
  description: string;
  status: AppealStatus;
  createdAt: number;
  resolvedAt?: number;
  result?: string;
  penaltyRefunded?: number;
  reputationRestored?: number;
}

export interface Insurance {
  id: string;
  name: string;
  description: string;
  price: number;
  coverage: number;
  duration: number;
  purchasedAt: number;
  expiresAt: number;
  active: boolean;
}

export interface MaintenanceService {
  id: string;
  name: string;
  description: string;
  price: number;
  effect: number;
  purchasedAt: number;
}

export interface RepairRecord {
  id: string;
  nodeId: string;
  shopName: string;
  type: 'repair' | 'insurance' | 'maintenance';
  cost: number;
  amount: number;
  description: string;
  createdAt: number;
}

export interface RescueRecord {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  cost: number;
  timeCost: number;
  createdAt: number;
}

export interface Vehicle {
  type: string;
  name: string;
  durability: number;
  maxDurability: number;
  battery: number;
  maxBattery: number;
  speed: number;
  batteryDrain: number;
  insurance: Insurance | null;
  lastMaintenanceAt: number;
  maintenanceBonus: number;
  totalRepairCost: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  effectPerLevel: number;
  unit: string;
  category: 'speed' | 'stamina' | 'tip' | 'appeal' | 'endurance' | 'navigation';
}

export interface Equipment {
  id: string;
  name: string;
  type: 'helmet' | 'gloves' | 'insulation' | 'light' | 'battery';
  effect: number;
  description: string;
  price: number;
  owned: boolean;
}

export interface Chapter {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  weather: WeatherType;
  timeLimit: number;
  orderDensity: number;
  targetEarnings: number;
  unlocked: boolean;
  icon: string;
}

export interface Message {
  id: string;
  sender: string;
  avatar?: string;
  content: string;
  timestamp: number;
  type: MessageType;
  read: boolean;
  orderId?: string;
  reportId?: string;
  appealId?: string;
  actionRequired?: boolean;
}

export interface ChapterRecord {
  chapterId: string;
  bestScore: number;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  totalEarnings: number;
  totalTips: number;
  bestTime: number;
  averageTimePerOrder: number;
  playCount: number;
  lastPlayedAt: number;
}

export interface PlayerState {
  id: string;
  name: string;
  level: number;
  exp: number;
  money: number;
  maxStamina: number;
  skills: Skill[];
  equipment: Equipment[];
  unlockedChapters: string[];
  highScores: Record<string, number>;
  chapterRecords: Record<string, ChapterRecord>;
  totalDeliveries: number;
  totalSuccessfulDeliveries: number;
  totalFailedDeliveries: number;
  totalEarnings: number;
  totalTips: number;
  totalDistance: number;
  totalPlayTime: number;
  reputation: number;
  reports: OrderReport[];
  appeals: OrderAppeal[];
  repairRecords: RepairRecord[];
  rescueRecords: RescueRecord[];
  totalRescueCost: number;
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  currentChapterId: string | null;
  gameTime: number;
  remainingTime: number;
  
  playerPosition: Point;
  currentNodeId: string;
  targetNodeId: string | null;
  currentRoute: string[];
  routeProgress: number;
  
  availableOrders: Order[];
  activeOrders: Order[];
  deliveredOrders: Order[];
  failedOrders: Order[];
  
  vehicle: Vehicle;
  stamina: number;
  
  currentEarnings: number;
  tips: number;
  
  messages: Message[];
  unreadMessageCount: number;
  
  weather: WeatherType;
  
  currentPanel: PanelType;
  selectedOrderId: string | null;
  
  speedMultiplier: number;
  isSettled: boolean;

  trafficLights: TrafficLight[];
  roadEvents: RoadEvent[];
  currentEvent: RoadEvent | null;
  isAtTrafficLight: boolean;
  currentTrafficLight: TrafficLight | null;
  waitingAtLight: boolean;
  
  sessionDeliveries: number;
  sessionDistance: number;
  sessionRescueCost: number;
  sessionRepairCost: number;
  isBeingRescued: boolean;
  rescueProgress: number;
  rescueTargetNodeId: string | null;
  rescueCost: number;
  rescueTimeCost: number;
}

export interface GameStats {
  totalOrders: number;
  deliveredOrders: number;
  failedOrders: number;
  onTimeRate: number;
  averageRating: number;
  totalEarnings: number;
  totalDistance: number;
  playTime: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  deliveries: number;
  successRate: number;
  isPlayer?: boolean;
}
