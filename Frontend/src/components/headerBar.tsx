import React from "react";
import { Settings, ChevronDown } from "lucide-react";
import logo from "../assets/logo.jpg"; // adjust path if needed

interface HeaderBarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ currentView, setCurrentView }) => {
  return (
    <header className="flex items-center justify-between bg-neutral-100 px-6 py-3 border-b border-neutral-800">
      <div className="flex items-center gap-3">
        <img
          src={logo}
          alt="UnitedCloud Logo"
          className="h-8 w-auto object-contain"
        />
        <h1 className="text-3xl font-semibold text-black pt-1.5">AI Agent</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button className="bg-neutral-800 text-gray-300 px-3 py-1 rounded flex items-center gap-1 hover:bg-neutral-700">
            {currentView} <ChevronDown size={16} />
          </button>
        </div>

        <button className="bg-neutral-800 p-2 rounded hover:bg-neutral-700">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};

export default HeaderBar;
