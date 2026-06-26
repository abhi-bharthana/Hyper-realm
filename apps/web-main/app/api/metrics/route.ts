import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memPercentage = ((usedMem / totalMem) * 100).toFixed(1);

  const cpus = os.cpus();
  const cpuCount = cpus.length;
  // A simple approximation of load using loadavg (1 minute)
  const load = os.loadavg()[0];
  const cpuPercentage = ((load / cpuCount) * 100).toFixed(1);
  
  // Cap at 100%
  const safeCpu = Math.min(100, Math.max(0, parseFloat(cpuPercentage)));

  return NextResponse.json({
    ramUsage: parseFloat(memPercentage),
    cpuUsage: safeCpu,
    uptime: os.uptime(),
    platform: os.platform(),
  });
}
