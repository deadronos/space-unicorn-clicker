import React, { useEffect, useRef } from "react";
import { Trophy, Flame } from "lucide-react";
import { Toast, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "./ui/toast";

interface AchievementToast {
  id: string;
  name: string;
}

interface AchievementToastsProps {
  notifications: AchievementToast[];
}

export function AchievementToasts({ notifications }: AchievementToastsProps) {
  // We'll render each notification as a Toast. 
  // In a real app, we might use a hook to manage these, but for simplicity we keep the prop-based approach.
  
  if (notifications.length === 0) return null;

  return (
    <>
      {notifications.map((notif, i) => {
        const isCombo = notif.id?.startsWith?.('combo_');
        return (
          <Toast 
            key={`${notif.id}-${i}`} 
            variant={isCombo ? "combo" : "achievement"}
            duration={5000}
            open={true}
          >
            <div className="flex items-center gap-4">
                <div className="p-2 bg-background/20 rounded-lg">
                    {isCombo ? <Flame className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
                </div>
                <div className="flex flex-col">
                    <ToastTitle className="text-[10px] font-black uppercase tracking-widest opacity-70">
                        Achievement Unlocked
                    </ToastTitle>
                    <ToastDescription className="text-sm font-black tracking-tighter uppercase truncate max-w-[200px]">
                        {notif.name}
                    </ToastDescription>
                </div>
            </div>
          </Toast>
        );
      })}
    </>
  );
}
