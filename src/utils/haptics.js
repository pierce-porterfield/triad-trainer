// Subtle haptic feedback. iOS Safari ignores navigator.vibrate, but Android
// honors it; the call is a no-op everywhere else.
const supported = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

export const hapticTap = () => { if (supported) navigator.vibrate(15); };
export const hapticCorrect = () => { if (supported) navigator.vibrate(25); };
export const hapticWrong = () => { if (supported) navigator.vibrate([40, 40, 40]); };
