const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

if (!code.includes('framer-motion')) {
  // Add framer-motion import
  code = code.replace(
    "import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';",
    "import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';\nimport { motion, AnimatePresence } from 'framer-motion';"
  );

  // Wrap the content of main in AnimatePresence and motion.div
  const mainStart = /<main style=\{\{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '24px 20px 40px 20px' \}\}>/;
  
  // Find where main ends
  const mainEnd = /<\/main>/;

  code = code.replace(mainStart, `<main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '24px 20px 40px 20px', position: 'relative' }}>\n        <AnimatePresence mode="wait">\n          <motion.div\n            key={activeTab}\n            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}\n            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}\n            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}\n            transition={{ duration: 0.25, ease: 'easeOut' }}\n            style={{ width: '100%' }}\n          >`);

  code = code.replace(mainEnd, `          </motion.div>\n        </AnimatePresence>\n      </main>`);

  fs.writeFileSync('src/App.jsx', code);
  console.log('Framer Motion added successfully');
} else {
  console.log('Framer motion already added');
}
