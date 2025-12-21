import * as Haptics from 'expo-haptics';

/**
 * HapticManager provides unified tactile feedback across the app.
 * All sound logic has been removed at user request for a cleaner sensory experience.
 */
class HapticManager {
    /**
     * Trigger a haptic feedback event.
     * Default is 'Heavy' as requested by the user.
     */
    async trigger(style: Haptics.ImpactFeedbackStyle | 'selection' | 'success' | 'warning' | 'error' = Haptics.ImpactFeedbackStyle.Heavy) {
        try {
            switch (style) {
                case 'selection':
                    await Haptics.selectionAsync();
                    break;
                case 'success':
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    break;
                case 'warning':
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    break;
                case 'error':
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    break;
                default:
                    await Haptics.impactAsync(style as Haptics.ImpactFeedbackStyle);
                    break;
            }
        } catch (error) {
            // Silently fail if haptics are not supported (e.g. on web or some emulators)
        }
    }

    /**
     * Alias for trigger to maintain compatibility with legacy soundManager.play calls.
     */
    async play(_type?: string, style: Haptics.ImpactFeedbackStyle | 'selection' = Haptics.ImpactFeedbackStyle.Heavy) {
        await this.trigger(style);
    }
}

export const hapticManager = new HapticManager();
// Export soundManager for backward compatibility
export const soundManager = hapticManager;
