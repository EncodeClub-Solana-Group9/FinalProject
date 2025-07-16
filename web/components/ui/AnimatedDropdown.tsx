import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DropdownProps {
  label: string;
  options: string[];
  onSelect: (option: string) => void;
  customClassName?: string;
  loading?: boolean;
}

export const AnimatedDropdown: React.FC<DropdownProps> = ({
  label,
  options,
  onSelect,
  customClassName,
  loading,
}) => {
  const [isOpen, settingIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        settingIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => settingIsOpen((prev) => !prev);

  return (
    <div
      className={`${customClassName} relative inline-block text-left`}
      ref={ref}
    >
      <button
        type="button"
        onClick={() => {
          if (loading) return;
          toggleDropdown();
        }}
        className="bg-indigo-600 text-white text-sm px-3 py-1 rounded-lg font-semibold mr-3 hover:bg-indigo-700 transition"
      >
        {label}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            className="absolute border shadow-sm w-full mt-2 w-48 cursor-pointer bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-700 border-zinc-200 bg-white rounded-lg shadow-lg overflow-hidden z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {options.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(option);
                    settingIsOpen(false);
                  }}
                  className="w-full border-b cursor-pointer text-gray-900 dark:text-white  text-left px-4 py-2 dark:hover:text-black hover:bg-blue-100 transition"
                >
                  {option}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};
