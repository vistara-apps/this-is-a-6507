import React from 'react';
import { Home, Search, FileText, Shield, AlertTriangle, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Sidebar({ activeView, onViewChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'sample-id', label: 'Sample ID', icon: Search },
    { id: 'rights', label: 'Rights Portal', icon: FileText },
    { id: 'detection', label: 'Detection', icon: Shield },
    { id: 'dmca', label: 'DMCA Toolkit', icon: AlertTriangle },
  ];

  const handleItemClick = (id) => {
    onViewChange(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md glass-effect text-white"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 lg:w-72 glass-effect
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">SP</span>
            </div>
            <h1 className="text-xl font-bold text-white">SampleSource Pro</h1>
          </div>

          <nav className="space-y-2">
            {menuItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleItemClick(id)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                  transition-all duration-200 ease-in-out text-left
                  ${activeView === id
                    ? 'bg-white bg-opacity-20 text-white'
                    : 'text-white text-opacity-70 hover:bg-white hover:bg-opacity-10 hover:text-white'
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 p-4 glass-effect rounded-lg">
            <h3 className="text-white font-semibold mb-2">Free Tier</h3>
            <p className="text-white text-opacity-70 text-sm mb-3">
              5 scans remaining this month
            </p>
            <button className="w-full bg-accent text-white py-2 px-4 rounded-md font-medium hover:bg-opacity-90 transition-colors">
              Upgrade Plan
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}