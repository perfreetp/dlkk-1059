import { useGameStore } from '../../store/gameStore';
import { MessageSquare, User, Settings, AlertCircle } from 'lucide-react';
import type { Message } from '../../types';

const MessageBubble = ({ message }: { message: Message }) => {
  const getTypeIcon = () => {
    switch (message.type) {
      case 'system':
        return <Settings className="w-4 h-4" />;
      case 'customer':
        return <User className="w-4 h-4" />;
      case 'story':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getTypeColor = () => {
    switch (message.type) {
      case 'system':
        return 'bg-neon-blue/10 border-neon-blue/30 text-neon-blue';
      case 'customer':
        return 'bg-neon-pink/10 border-neon-pink/30 text-neon-pink';
      case 'story':
        return 'bg-neon-yellow/10 border-neon-yellow/30 text-neon-yellow';
      default:
        return 'bg-night-700 border-night-600 text-gray-300';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`p-3 rounded-lg border ${getTypeColor()} ${!message.read ? 'ring-1 ring-neon-blue/50' : ''}`}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5">{getTypeIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-sm">{message.sender}</span>
            <span className="text-xs opacity-60">{formatTime(message.timestamp)}</span>
          </div>
          <p className="text-sm text-gray-300 break-words">{message.content}</p>
        </div>
      </div>
    </div>
  );
};

const MessagesPanel = () => {
  const { messages, markMessageRead, unreadMessageCount } = useGameStore();

  return (
    <div className="flex flex-col h-full glass-panel">
      <div className="p-3 border-b border-night-600/50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-neon-yellow neon-text-yellow">💬 消息</h2>
        {unreadMessageCount > 0 && (
          <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full animate-pulse">
            {unreadMessageCount}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>暂无消息</p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              onClick={() => !message.read && markMessageRead(message.id)}
            >
              <MessageBubble message={message} />
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-night-600/50">
        <div className="flex gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-neon-blue"></div>
            <span>系统</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-neon-pink"></div>
            <span>顾客</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-neon-yellow"></div>
            <span>剧情</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPanel;
