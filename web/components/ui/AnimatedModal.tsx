import React, { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

const backdrop = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const modal: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: '-50%',
    x: '-50%',
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: '-50%',
    x: '-50%',
    transition: {
      duration: 0.3,
      type: 'spring',
      damping: 20,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: '-50%',
    x: '-50%',
    transition: { duration: 0.2 },
  },
};

interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
  widthFitContainer?: boolean;
  showCrossIcon?: boolean;
}

export const AnimatedModal = ({
  isOpen,
  onClose,
  children,
  widthFitContainer = false,
  showCrossIcon = true,
}: AnimatedModalProps) => {
  useEffect(() => {
    const handleEsc = (e: any) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdrop}
          onClick={onClose}
        >
          <motion.div
            className={`absolute top-1/2 left-1/2 bg-zinc-50 dark:bg-zinc-900 rounded-2xl shadow-xl p-6 ${
              widthFitContainer ? '' : 'w-full lg:w-[50%]'
            }`}
            variants={modal}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {showCrossIcon && (
              <button
                type="button"
                onClick={onClose}
                className="absolute cursor-pointer top-3 right-3 text-gray-500 dark:hover:text-white hover:text-black"
              >
                ✕
              </button>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
