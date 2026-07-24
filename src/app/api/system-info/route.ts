import { NextResponse } from 'next/server';
import os from 'os';
import { exec } from 'child_process';

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

  const usage = ((totalTick - totalIdle) / totalTick) * 100;
  
  previousCpus = currentCpus;
  previousTime = currentTime;
  
  return Math.round(usage);
}

async function getGpuInfo(): Promise<{ name: string; vramTotal: number; vramUsed: number } | null> {
  return new Promise((resolve) => {
    exec('nvidia-smi --query-gpu=name,memory.total,memory.used --format=csv,noheader,nounits', (error, stdout) => {
      if (error) {
        resolve(null);
        return;
      }
      
      const parts = stdout.trim().split(',').map(s => s.trim());
      if (parts.length >= 3) {
        resolve({
          name: parts[0],
          vramTotal: parseFloat(parts[1]) || 0,
          vramUsed: parseFloat(parts[2]) || 0,
        });
      } else {
        resolve(null);
      }
    });
  });
}

export async function GET() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  
  const cpuUsage = getCpuUsage();
  const gpuInfo = await getGpuInfo();

  return NextResponse.json({
    ram: {
      total: Math.round(totalMem / 1024 / 1024 / 1024 * 10) / 10,
      used: Math.round(usedMem / 1024 / 1024 / 1024 * 10) / 10,
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
      percent: Math.round((gpuInfo.vramUsed / gpuInfo.vramTotal) * 100),
    } : null,
  });
}