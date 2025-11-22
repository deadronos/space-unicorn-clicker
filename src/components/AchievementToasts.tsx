import React from "react";

interface AchievementToast {
  id: string;
  name: string;
}

interface AchievementToastsProps {
  notifications: AchievementToast[];
}

export function AchievementToasts({ notifications }: AchievementToastsProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 pointer-events-none z-50">
      {notifications.map((notif, i) => (
        <div key={`${notif.id}-${i}`} className="bg-yellow-500 text-black px-4 py-2 rounded shadow-lg animate-bounce">
          🏆 Achievement Unlocked: <strong>{notif.name}</strong>
        </div>
      ))}
    </div>
  );
}
