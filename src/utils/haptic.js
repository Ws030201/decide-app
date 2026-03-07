export function haptic(type = 'light') {
  if (!navigator.vibrate) return

  const patterns = {
    light: [10],
    medium: [20],
    heavy: [30],
    success: [10, 50, 20],
    dice: [15, 30, 15, 30, 15],
    spin: [10, 20, 10, 20, 10, 20, 10, 20, 30],
    flip: [5, 40, 15],
  }

  try {
    navigator.vibrate(patterns[type] || patterns.light)
  } catch {
    // silently fail on unsupported browsers
  }
}
