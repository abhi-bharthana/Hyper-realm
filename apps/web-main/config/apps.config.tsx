import dynamic from 'next/dynamic';
import { Folder, Terminal, PenTool, Image as ImageIcon, Settings, Activity, Calculator, Cpu, ShoppingBag, Code2, BookOpen } from 'lucide-react'; // 🚀 Added BookOpen

// 🚀 Lazy Load All App Components (Performance boost)
const DriveDashboard = dynamic(() => import('@/components/Drive/DriveDashboard').then(m => m.DriveDashboard));
const TaskManager = dynamic(() => import('@/components/os/apps/TaskManager').then(m => m.TaskManager));
const NeuralCanvasApp = dynamic(() => import('@/components/os/apps/NeuralCanvasApp').then(m => m.NeuralCanvasApp));
const SettingsApp = dynamic(() => import('@/components/os/apps/settings/SettingsApp'));
const CalculatorApp = dynamic(() => import('@/components/os/apps/CalculatorApp'));
const DigitalWellbeingApp = dynamic(() => import('@/components/os/apps/DigitalWellbeingApp').then(m => m.DigitalWellbeingApp));

// 🚀 NAYE MODULES (App Store, Realm Studio & Docs)
const AppStore = dynamic(() => import('@/components/os/apps/AppStore').then(m => m.AppStore || m.default));
const RealmStudioApp = dynamic(() => import('@/components/os/apps/realm-studio/RealmStudio').then(m => m.RealmStudioApp || m.default));
const DevDocsApp = dynamic(() => import('@/components/os/apps/DevDocs').then(m => m.DevDocsApp || m.default)); // 📚 Docs Injected!

// 📦 App Definition Type
export interface AppDefinition {
  id: string;
  name: string;
  icon: any; 
  color: string;
  isSystem: boolean; 
  config: { width: number; height: number; resizable?: boolean };
  component: React.ComponentType<any>;
}

// 🌐 THE CENTRAL REGISTRY
export const SYSTEM_APPS: Record<string, AppDefinition> = {
  explorer: {
    id: 'explorer',
    name: 'Hyper Drive',
    icon: Folder,
    color: 'text-[#52d9ff]',
    isSystem: true,
    config: { width: 1050, height: 700, resizable: true },
    component: () => <DriveDashboard isOSMode={true} />
  },
  terminal: {
    id: 'terminal',
    name: 'Terminal',
    icon: Terminal,
    color: 'text-green-400',
    isSystem: true,
    config: { width: 750, height: 450, resizable: true },
    component: () => <div className="p-4 text-green-400 font-mono">root@hyper-realm:~# _</div>
  },
  notes: {
    id: 'notes',
    name: 'Note-Mate',
    icon: PenTool,
    color: 'text-yellow-400',
    isSystem: true,
    config: { width: 900, height: 600, resizable: true },
    component: () => <div className="p-4 text-white">Note-Mate Editor Load Hoga...</div>
  },
  canvas: {
    id: 'canvas',
    name: 'Neural Canvas',
    icon: ImageIcon,
    color: 'text-[#8d6bff]',
    isSystem: true,
    config: { width: 1100, height: 750, resizable: true },
    component: NeuralCanvasApp
  },
  taskmanager: {
    id: 'taskmanager',
    name: 'Task Manager',
    icon: Cpu, 
    color: 'text-[#ff5f56]',
    isSystem: true,
    config: { width: 600, height: 400, resizable: false },
    component: TaskManager
  },
  calculator: {
    id: 'calculator',
    name: 'Calculator',
    icon: Calculator,
    color: 'text-lime-400',
    isSystem: true,
    config: { width: 380, height: 600, resizable: false },
    component: CalculatorApp
  },
  settings: {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    color: 'text-gray-300',
    isSystem: true,
    config: { width: 600, height: 500, resizable: true },
    component: SettingsApp
  },
  wellbeing: {
    id: 'wellbeing',
    name: 'Digital Wellbeing',
    icon: Activity,
    color: 'text-[#52d9ff]',
    isSystem: true,
    config: { width: 650, height: 550, resizable: true },
    component: DigitalWellbeingApp
  },
  store: {
    id: 'store',
    name: 'Hyper Store',
    icon: ShoppingBag,
    color: 'text-[#ff5f56]',
    isSystem: true,
    config: { width: 1000, height: 750, resizable: true },
    component: AppStore
  },
  studio: {
    id: 'studio',
    name: 'Realm Studio',
    icon: Code2,
    color: 'text-[#8d6bff]',
    isSystem: true,
    config: { width: 1100, height: 750, resizable: true },
    component: RealmStudioApp
  },
  // 📚 HYPER DOCS REGISTERED
  docs: {
    id: 'docs',
    name: 'Hyper Docs',
    icon: BookOpen,
    color: 'text-[#f1fa8c]', // Bright yellow tint so it stands out in the dock
    isSystem: true,
    config: { width: 950, height: 700, resizable: true },
    component: DevDocsApp
  }
};