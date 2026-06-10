import type { MapNode } from '../types';

export const MAP_NODES: MapNode[] = [
  { id: 'n1', x: 100, y: 100, type: 'intersection', name: '中央路口', connections: ['n2', 'n5', 'n7', 'n10'], hasTrafficLight: true },
  { id: 'n2', x: 250, y: 100, type: 'restaurant', name: '星光餐厅', connections: ['n1', 'n3', 'n6'] },
  { id: 'n3', x: 400, y: 100, type: 'intersection', name: '东街口', connections: ['n2', 'n4', 'n8'], hasTrafficLight: true },
  { id: 'n4', x: 550, y: 100, type: 'building', name: '翠苑小区', connections: ['n3', 'n9'] },
  { id: 'n5', x: 100, y: 220, type: 'restaurant', name: '夜来香烧烤', connections: ['n1', 'n6', 'n11'] },
  { id: 'n6', x: 250, y: 220, type: 'intersection', name: '美食街', connections: ['n2', 'n5', 'n7', 'n12'], hasTrafficLight: true },
  { id: 'n7', x: 100, y: 340, type: 'building', name: '幸福里小区', connections: ['n1', 'n6', 'n11', 'n14'], isSlope: true, slopeDifficulty: 1 },
  { id: 'n8', x: 400, y: 220, type: 'charging', name: '充电站A', connections: ['n3', 'n9', 'n13'] },
  { id: 'n9', x: 550, y: 220, type: 'building', name: '阳光花园', connections: ['n4', 'n8', 'n18'], isSlope: true, slopeDifficulty: 2 },
  { id: 'n10', x: 250, y: 340, type: 'intersection', name: '广场南', connections: ['n1', 'n12', 'n14'], hasTrafficLight: true },
  { id: 'n11', x: 100, y: 460, type: 'rest', name: '骑手驿站', connections: ['n5', 'n7', 'n15'] },
  { id: 'n12', x: 250, y: 460, type: 'restaurant', name: '老陈面馆', connections: ['n6', 'n10', 'n13', 'n16'] },
  { id: 'n13', x: 400, y: 340, type: 'building', name: '金茂大厦', connections: ['n8', 'n12', 'n17'], isSlope: true, slopeDifficulty: 1 },
  { id: 'n14', x: 400, y: 460, type: 'intersection', name: '南门', connections: ['n7', 'n10', 'n15', 'n17'], hasTrafficLight: true },
  { id: 'n15', x: 100, y: 580, type: 'building', name: '老旧社区', connections: ['n11', 'n14', 'n19'], isSlope: true, slopeDifficulty: 2 },
  { id: 'n16', x: 250, y: 580, type: 'restaurant', name: '深夜食堂', connections: ['n12', 'n17', 'n20'] },
  { id: 'n17', x: 400, y: 580, type: 'building', name: '医院宿舍', connections: ['n13', 'n14', 'n16', 'n21'] },
  { id: 'n18', x: 550, y: 340, type: 'building', name: '科技园B座', connections: ['n9', 'n22'] },
  { id: 'n19', x: 100, y: 700, type: 'charging', name: '充电站B', connections: ['n15', 'n20'] },
  { id: 'n20', x: 250, y: 700, type: 'repair', name: '修车铺', connections: ['n16', 'n19', 'n21'] },
  { id: 'n21', x: 400, y: 700, type: 'building', name: '中心医院', connections: ['n17', 'n20', 'n22'], hasTrafficLight: true },
  { id: 'n22', x: 550, y: 580, type: 'restaurant', name: '港式茶餐厅', connections: ['n18', 'n21'] },
];

export const MAP_WIDTH = 650;
export const MAP_HEIGHT = 800;

export const getNode = (id: string): MapNode | undefined => {
  return MAP_NODES.find(n => n.id === id);
};

export const getRestaurants = (): MapNode[] => {
  return MAP_NODES.filter(n => n.type === 'restaurant');
};

export const getBuildings = (): MapNode[] => {
  return MAP_NODES.filter(n => n.type === 'building');
};

export const getChargingStations = (): MapNode[] => {
  return MAP_NODES.filter(n => n.type === 'charging');
};

export const getRepairShops = (): MapNode[] => {
  return MAP_NODES.filter(n => n.type === 'repair');
};

export const getIntersectionsWithLights = (): MapNode[] => {
  return MAP_NODES.filter(n => n.hasTrafficLight);
};

export const calculateDistance = (node1: MapNode, node2: MapNode): number => {
  const dx = node1.x - node2.x;
  const dy = node1.y - node2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const findShortestPath = (startId: string, endId: string): string[] => {
  const nodeMap = new Map<string, MapNode>();
  MAP_NODES.forEach(n => nodeMap.set(n.id, n));
  
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const unvisited = new Set<string>();
  
  MAP_NODES.forEach(n => {
    distances.set(n.id, Infinity);
    previous.set(n.id, null);
    unvisited.add(n.id);
  });
  
  distances.set(startId, 0);
  
  while (unvisited.size > 0) {
    let minNode: string | null = null;
    let minDist = Infinity;
    
    unvisited.forEach(id => {
      const dist = distances.get(id) || Infinity;
      if (dist < minDist) {
        minDist = dist;
        minNode = id;
      }
    });
    
    if (minNode === null || minNode === endId) break;
    
    unvisited.delete(minNode);
    
    const currentNode = nodeMap.get(minNode);
    if (!currentNode) continue;
    
    for (const neighborId of currentNode.connections) {
      if (!unvisited.has(neighborId)) continue;
      
      const neighbor = nodeMap.get(neighborId);
      if (!neighbor) continue;
      
      let edgeWeight = calculateDistance(currentNode, neighbor);
      
      if (neighbor.isSlope) {
        edgeWeight *= (1 + (neighbor.slopeDifficulty || 1) * 0.3);
      }
      
      const alt = (distances.get(minNode) || 0) + edgeWeight;
      
      if (alt < (distances.get(neighborId) || Infinity)) {
        distances.set(neighborId, alt);
        previous.set(neighborId, minNode);
      }
    }
  }
  
  const path: string[] = [];
  let current: string | null = endId;
  
  while (current !== null) {
    path.unshift(current);
    current = previous.get(current) || null;
  }
  
  return path.length > 1 ? path : [];
};
