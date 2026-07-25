import { NextResponse } from 'next/server';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Cache CPU usage between calls
let previousCpus = os.cpus();
let previousTime = Date.now();

function getCpuUsage(): number {
  const currentCpus = os.cpus();
  const currentTime = Date.now();
  const timeDiff = currentTime - previousTime;

  let totalIdle = 0;
  let totalTick = 0;

  for (let i = 0; i < currentCpus.length; i++) {
    const prev = previousCpus[i].times;
    const curr = currentCpus[i].times;
    
    totalTick += (curr.user - prev.user) + (curr.sys - prev.sys) + 
                 (curr.idle - prev.idle) + (curr.irq - prev.irq) + 
                 (curr.nice - prev.nice);
    totalIdle += (curr.idle - prev.idle);
  }

  // Prevent division by zero on the very first call
  const usage = timeDiff > 0 ? ((totalTick - totalIdle) / totalTick) * 100 : 0;
  
  previousCpus = currentCpus;
  previousTime = currentTime;
  
  // Clamp between 0 and 100 for UI safety
  return Math.round(Math.max(0, Math.min(100, usage)));
}

async function getGpuInfo(): Promise<{ name: string; vramTotal: number; vramUsed: number } | null> {
  const platform = os.platform();

  try {
    if (platform === 'darwin') {
      // macOS: Check for Apple Silicon or generic GPU info
      // Note: Apple Silicon uses Unified Memory, so dedicated VRAM isn't a separate pool.
      const { stdout } = await execAsync('system_profiler SPDisplaysDataType');
      const lines = stdout.split('\n');
      let gpuName = 'Apple Silicon / Unknown GPU';
      
      for (const line of lines) {
        const match = line.match(/Chipset Model:\s*(.+)/);
        if (match) {
          gpuName = match[1].trim();
          break;
        }
      }
      
      // For Apple Silicon, VRAM is shared with system RAM. 
      // Returning 0 indicates unified memory, so the UI can show "Shared with System" gracefully.
      return {
        name: gpuName,
        vramTotal: 0, 
        vramUsed: 0,
      };
    } 
    
    // Windows & Linux: Try nvidia-smi first (most common for local LLMs)
    const { stdout } = await execAsync('nvidia-smi --query-gpu=name,memory.total,memory.used --format=csv,noheader,nounits');
    const parts = stdout.trim().split(',').map(s => s.trim());
    
    if (parts.length >= 3) {
      return {
        name: parts[0],
        vramTotal: parseFloat(parts[1]) || 0,
        vramUsed: parseFloat(parts[2]) || 0,
      };
    }
  } catch (error) {
    // nvidia-smi failed or not found. Returning null is a safe, clean fallback.
    return null;
  }

  return null;
}

export async function GET() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  
  const cpuUsage = getCpuUsage();
  const gpuInfo = await getGpuInfo();

  return NextResponse.json({
    ram: {
      total: Math.round((totalMem / 1024 / 1024 / 1024) * 10) / 10,
      used: Math.round((usedMem / 1024 / 1024 / 1024) * 10) / 10,
      percent: Math.round((usedMem / totalMem) * 100),
    },
    cpu: {
      cores: os.cpus().length,
      model: os.cpus()[0]?.model || 'Unknown',
      percent: cpuUsage,
    },
    gpu: gpuInfo ? {
      name: gpuInfo.name,
      vramTotal: gpuInfo.vramTotal,
      vramUsed: gpuInfo.vramUsed,
      // Prevent division by zero if vramTotal is 0 (e.g., Apple Silicon)
      percent: gpuInfo.vramTotal > 0 ? Math.round((gpuInfo.vramUsed / gpuInfo.vramTotal) * 100) : 0,
    } : null,
  });
}