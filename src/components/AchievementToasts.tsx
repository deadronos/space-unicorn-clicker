import React, { useEffect, useRef } from "react";

interface AchievementToast {
  id: string;
  name: string;
}

interface AchievementToastsProps {
  notifications: AchievementToast[];
}

export function AchievementToasts({ notifications }: AchievementToastsProps) {
  const prevCount = useRef(0);

  useEffect(() => {
    prevCount.current = notifications.length;
  }, [notifications]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 pointer-events-none z-50" aria-live="polite">
      {notifications.map((notif, i) => {
        const isCombo = notif.id?.startsWith?.('combo_');
        return (
          <div key={`${notif.id}-${i}`} className={`${isCombo ? 'bg-cyan-400 text-black' : 'bg-yellow-500 text-black'} px-4 py-2 rounded shadow-lg animate-bounce`}>
            {isCombo ? '🔥' : '🏆'} Achievement Unlocked: <strong>{notif.name}</strong>
          </div>
        );
      })}
    </div>
  );
}
