export interface HardwareRecommendation {
  safeContextLimit: number;
  warningLevel: 'safe' | 'caution' | 'danger';
  message: string;
}

export function calculateContextSafety(numCtx: number, gpuVramGB: number, systemRamGB: number): HardwareRecommendation {
  // Rough estimate: each 1k context tokens uses ~0.75GB
  const contextVRAMUsage = (numCtx / 1000) * 0.75;
  const baseModelVRAM = 4.5; // Base model footprint
  const totalVRAMNeeded = baseModelVRAM + contextVRAMUsage;

  if (totalVRAMNeeded <= gpuVramGB * 0.9) {
    return {
      safeContextLimit: numCtx,
      warningLevel: 'safe',
      message: 'Fits comfortably in GPU VRAM.'
    };
  } 
  
  // If it exceeds VRAM, check if System RAM can handle the overflow
  const overflowGB = totalVRAMNeeded - gpuVramGB;
  const safeOverflowLimit = systemRamGB * 0.7; // Leave 30% for OS and other apps

  if (overflowGB <= safeOverflowLimit) {
    return {
      safeContextLimit: numCtx,
      warningLevel: 'caution',
      message: `Exceeds VRAM by ${overflowGB.toFixed(1)}GB. Will use System RAM (slower generation).`
    };
  }

  return {
    safeContextLimit: Math.floor((gpuVramGB + safeOverflowLimit - baseModelVRAM) / 0.75 * 1000),
    warningLevel: 'danger',
    message: 'Exceeds both VRAM and safe RAM limits. High risk of crashing or severe slowdown.'
  };
}