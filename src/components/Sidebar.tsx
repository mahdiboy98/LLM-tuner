'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import ConnectionStatus from './ConnectionStatus';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Models', href: '/models', icon: '🧠' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-colors duration-300">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-sky-600 dark:text-sky-400">⚡ LLM Tuner</h1>
      </div>

      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-sky-500 text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
        <ThemeToggle />
        <ConnectionStatus />
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-2">v0.1.0 Alpha</p>
      </div>
    </aside>
  );
}