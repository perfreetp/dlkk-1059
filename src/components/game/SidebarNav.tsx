import { useGameStore } from '../../store/gameStore';
import type { PanelType } from '../../types';
import { Map, ClipboardList, Backpack, Bike, MessageSquare, BarChart3 } from 'lucide-react';

interface NavItem {
  id: PanelType;
  icon: typeof Map;
  label: string;
  color: string;
}

const navItems: NavItem[] = [
  { id: 'map', icon: Map, label: '地图', color: 'neon-blue' },
  { id: 'orders', icon: ClipboardList, label: '订单', color: 'neon-yellow' },
  { id: 'backpack', icon: Backpack, label: '背包', color: 'neon-pink' },
  { id: 'vehicle', icon: Bike, label: '车辆', color: 'neon-green' },
  { id: 'messages', icon: MessageSquare, label: '消息', color: 'neon-purple' },
  { id: 'settlement', icon: BarChart3, label: '结算', color: 'neon-blue' },
];

const SidebarNav = () => {
  const { currentPanel, setCurrentPanel, unreadMessageCount } = useGameStore();

  const getColorClasses = (color: string, isActive: boolean) => {
    const colorMap: Record<string, { active: string; inactive: string }> = {
      'neon-blue': {
        active: 'bg-neon-blue/20 text-neon-blue border-neon-blue/50 shadow-neon-blue',
        inactive: 'text-gray-500 hover:text-neon-blue hover:bg-neon-blue/10 border-night-600/50',
      },
      'neon-yellow': {
        active: 'bg-neon-yellow/20 text-neon-yellow border-neon-yellow/50',
        inactive: 'text-gray-500 hover:text-neon-yellow hover:bg-neon-yellow/10 border-night-600/50',
      },
      'neon-pink': {
        active: 'bg-neon-pink/20 text-neon-pink border-neon-pink/50',
        inactive: 'text-gray-500 hover:text-neon-pink hover:bg-neon-pink/10 border-night-600/50',
      },
      'neon-green': {
        active: 'bg-neon-green/20 text-neon-green border-neon-green/50',
        inactive: 'text-gray-500 hover:text-neon-green hover:bg-neon-green/10 border-night-600/50',
      },
      'neon-purple': {
        active: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
        inactive: 'text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 border-night-600/50',
      },
    };
    return colorMap[color]?.[isActive ? 'active' : 'inactive'] || '';
  };

  return (
    <div className="glass-panel p-2 flex flex-col gap-2">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = currentPanel === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => setCurrentPanel(item.id)}
            className={`relative flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
              getColorClasses(item.color, isActive)
            }`}
            title={item.label}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs">{item.label}</span>
            
            {item.id === 'messages' && unreadMessageCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SidebarNav;
