import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface OnlineStatusIndicatorProps {
  online: boolean;
  lastSeen?: string | null;
  showText?: boolean;
}

export default function OnlineStatusIndicator({ 
  online, 
  lastSeen, 
  showText = true 
}: OnlineStatusIndicatorProps) {
  const getStatusText = () => {
    if (online) {
      return 'Online';
    }
    if (lastSeen) {
      try {
        const distance = formatDistanceToNow(new Date(lastSeen), { addSuffix: true });
        return `Last seen ${distance}`;
      } catch {
        return 'Offline';
      }
    }
    return 'Offline';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`h-2.5 w-2.5 rounded-full ${
            online ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
        {online && (
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-green-500"
          />
        )}
      </div>
      {showText && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground"
        >
          {getStatusText()}
        </motion.span>
      )}
    </div>
  );
}
