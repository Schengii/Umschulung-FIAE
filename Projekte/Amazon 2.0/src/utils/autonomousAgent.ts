// ============================================================
// Amazon 2.0 – Autonomous AI Shopping Agent & Budget Delegator
// ============================================================
import type { AppState, Product } from '../types';
import { emit } from '../store';
import { playSound } from './audio';
import { showToast } from '../components/toast';

export interface AgentTask {
  id: string;
  productId: string;
  productTitle: string;
  targetPrice: number;
  maxMonthlyBudget: number;
  spentBudget: number;
  maxQuantity: number;
  boughtQuantity: number;
  status: 'active' | 'paused' | 'completed';
  createdAt: number;
  lastCheckedAt: number;
  logs: { timestamp: number; message: string; type: 'info' | 'buy' | 'skip' }[];
}

const STORAGE_KEY = 'amazon2_agent_tasks';

const DEFAULT_DEMO_TASKS: AgentTask[] = [
  {
    id: 'agent-task-1',
    productId: 'e001',
    productTitle: 'Sony WH-1000XM5 Noise Cancelling Kopfhörer',
    targetPrice: 260.00,
    maxMonthlyBudget: 300.00,
    spentBudget: 0,
    maxQuantity: 1,
    boughtQuantity: 0,
    status: 'active',
    createdAt: Date.now() - 86400000 * 2,
    lastCheckedAt: Date.now() - 3600000,
    logs: [
      { timestamp: Date.now() - 86400000 * 2, message: 'Agent initialisiert mit Zielpreis 260,00 €', type: 'info' },
      { timestamp: Date.now() - 3600000, message: 'Preisprüfung: Aktuell 279,99 € (über Limit)', type: 'skip' },
    ],
  },
];

let inMemoryTasks: AgentTask[] = [...DEFAULT_DEMO_TASKS];

export function getAgentTasks(): AgentTask[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        saveAgentTasks(DEFAULT_DEMO_TASKS);
        return DEFAULT_DEMO_TASKS;
      }
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return inMemoryTasks;
}

export function saveAgentTasks(tasks: AgentTask[]): void {
  inMemoryTasks = tasks;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  } catch (e) {
    console.error('Failed to save agent tasks', e);
  }
}

export function createAgentTask(
  product: Product,
  targetPrice: number,
  maxMonthlyBudget: number,
  maxQuantity: number = 1
): AgentTask {
  const newTask: AgentTask = {
    id: `agent-${Date.now()}`,
    productId: product.id,
    productTitle: product.title,
    targetPrice,
    maxMonthlyBudget,
    spentBudget: 0,
    maxQuantity,
    boughtQuantity: 0,
    status: 'active',
    createdAt: Date.now(),
    lastCheckedAt: Date.now(),
    logs: [
      {
        timestamp: Date.now(),
        message: `Autonomer Agent aktiviert: Kauf bei <= ${targetPrice.toFixed(2)}€ (Budget: ${maxMonthlyBudget.toFixed(2)}€)`,
        type: 'info',
      },
    ],
  };

  const tasks = getAgentTasks();
  tasks.push(newTask);
  saveAgentTasks(tasks);
  return newTask;
}

export function executeAgentSimulation(state: AppState, taskId: string): boolean {
  const tasks = getAgentTasks();
  const task = tasks.find(t => t.id === taskId);
  if (!task || task.status !== 'active') return false;

  const product = state.products.find(p => p.id === task.productId) || state.products[0];
  
  // Simulate purchase
  task.spentBudget += task.targetPrice;
  task.boughtQuantity += 1;
  if (task.boughtQuantity >= task.maxQuantity) {
    task.status = 'completed';
  }

  task.lastCheckedAt = Date.now();
  task.logs.unshift({
    timestamp: Date.now(),
    message: `⚡ ZIELPREIS ERREICHT! Autonomer Kauf für ${task.targetPrice.toFixed(2)}€ ausgeführt.`,
    type: 'buy',
  });

  saveAgentTasks(tasks);

  // Add item to cart or orders
  state.cart.push({ product, qty: 1, addedAt: Date.now() });
  emit('cart:changed');
  playSound('checkout');
  showToast(`🤖 Autonomer Agent: „${product.title}“ wurde für ${task.targetPrice.toFixed(2)}€ automatisch gekauft!`, 'success');
  return true;
}
