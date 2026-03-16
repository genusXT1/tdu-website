import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface PageTransitionProps {
  children: React.ReactNode;
  trigger?: any;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children, trigger }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    setIsTransitioning(true);
    
    // Тайминг: замена контента происходит ровно посередине анимации
    const switchTimer = setTimeout(() => {
      setDisplayChildren(children);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 450);

    const endTimer = setTimeout(() => {
      setIsTransitioning(false);
    }, 900);

    return () => {
      clearTimeout(switchTimer);
      clearTimeout(endTimer);
    };
  }, [location.pathname, trigger]);

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait">
        {isTransitioning && (
          <motion.div
            key="overlay"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0, originY: 'bottom' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ originY: 'top' }}
            className="fixed inset-0 z-[9999] bg-[#003366] flex flex-col items-center justify-center"
          >
            {/* Логотип и текст внутри шторки */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex flex-col items-center gap-4"
            >
              <img 
                src="https://www.uni-ruse.bg/_layouts/15/images/UniRuse/ru-default-logo.png" 
                alt="Logo" 
                className="h-20 brightness-200"
              />
              <div className="text-center">
                <p className="text-[#FFCC00] text-[10px] font-black uppercase tracking-[0.5em]">Angel Kanchev</p>
                <div className="mt-4 w-32 h-[2px] bg-white/10 relative overflow-hidden">
                  <motion.div 
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-0 bg-[#FFCC00]"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Анимация самого контента страницы */}
      <motion.div
        key={location.pathname + "-content"}
        animate={isTransitioning ? { 
          opacity: 0.3,
          scale: 0.95,
          filter: 'blur(10px)'
        } : { 
          opacity: 1,
          scale: 1,
          filter: 'none'
        }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {displayChildren}
      </motion.div>
    </div>
  );
};

export default PageTransition;