# DESIGN003 - Enhanced Visuals and Animations

**Status:** Draft  
**Author:** AI Agent — 2025-10-26

## Overview

Increase visual variety and animation quality to make the game more engaging and satisfying to play. Add particle effects, varied enemy appearances, power-up visuals, and enhanced feedback.

## Components

### Enemy Ship Variations
- **Standard Ships**: Current gray battleship design
- **Armored Ships**: Every 5 levels (not boss), darker with shields
- **Boss Ships**: Enhanced visuals with unique colors/effects
- **Speed Ships**: Every 3 levels, smaller and faster looking

### Enhanced Laser Effects
- **Power Levels**: Laser beam intensity scales with click damage
- **Critical Hits**: Larger, brighter beam with lightning effect
- **Combo System**: Rapid clicks create combo counter with visual feedback
- **Trail Effects**: Persistent laser trails that fade out

### Particle Systems
- **Hit Sparks**: Enhanced impact particles with more variety
- **Explosion Effects**: Ships explode with debris when destroyed
- **Stardust Particles**: Floating stardust appears when collecting rewards
- **Power-Up Glow**: Unicorn glows brighter as upgrades increase

### Background Enhancements
- **Nebula Background**: Colorful nebula layers behind starfield
- **Planet/Moon**: Occasional celestial bodies passing by
- **Asteroid Field**: Background asteroids drifting
- **Warp Effect**: Screen warps when reaching milestone levels

### UI Animations
- **Number Pop-ups**: Damage numbers float up from impact point
- **Upgrade Pulse**: Affordable upgrades pulse gently
- **Level-Up Flash**: Screen flash effect on ship defeat
- **Progress Bar Animations**: Smooth HP bar transitions with gradient

## Implementation Details

### CSS Animations
```css
@keyframes explosion {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(3); opacity: 0; }
}

@keyframes stardustCollect {
  0% { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(0, -40px) scale(0.5); opacity: 0; }
}

@keyframes comboShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}
```

### React State for Effects
```typescript
interface VisualEffect {
  id: number;
  type: 'explosion' | 'stardust' | 'damageNumber' | 'combo';
  x: number;
  y: number;
  value?: number;
  timestamp: number;
}
```

## Acceptance Criteria

- At least 3 different ship visual variations
- Enhanced laser beams for critical hits
- Explosion effect when ships are destroyed
- Damage numbers appear on hit
- Combo counter appears for rapid clicks (3+ in 2 seconds)
- Background has at least 2 additional animated layers
- All animations run smoothly (60fps target)

## Performance Considerations

- Limit active particle count (max 50 concurrent)
- Use CSS transforms for animations (GPU accelerated)
- Clean up effect objects after animation complete
- Consider requestAnimationFrame for complex animations

## Visual Design

- Keep existing purple/blue theme
- Add gold/yellow for critical hits
- Use red/orange for explosions
- Green for power-ups and upgrades
- Cyan for combo effects

## Next Steps

1. Create ShipVariant component with multiple designs
2. Add damage number system
3. Implement explosion particle effect
4. Add combo counter logic and visual
5. Enhance background with additional layers
6. Add stardust collection animation
