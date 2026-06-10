export type WeatherType = 'clear' | 'light_rain' | 'heavy_rain' | 'storm';

export type OrderType = 'normal' | 'urgent' | 'large' | 'special';

export type OrderStatus = 'pending' | 'accepted' | 'picked' | 'delivered' | 'failed';

export type MessageType = 'story' | 'customer' | 'system';

export type PanelType = 'map' | 'orders' | 'backpack' | 'vehicle' | 'messages' | 'settlement';

export interface Point {
  x: number;
  y: number;
}

export interface MapNode {
  id: string;
  x: number;
  y: number;
  type: 'road' | 'intersection' | 'restaurant' | 'building' | 'charging' | 'rest';
  name?: string;
  connections: string[];
}

export interface Order {
  id: string;
  type: OrderType;
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
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  effect: number;
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
  totalDeliveries: number;
  reputation: number;
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

export interface TrafficLight {
  nodeId: string;
  state: 'red' | 'green' | 'yellow';
  timer: number;
  redDuration: number;
  greenDuration: number;
}
