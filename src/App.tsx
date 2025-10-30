import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import SocialMediaContentGenerator from './components/SocialMediaContentGenerator';
import ImageEditor from './components/ImageEditor';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('text-image-generator');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Inicializar el modo oscuro desde localStorage o por defecto a falso
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    // Aplicar o quitar la clase 'dark' al elemento html
    const htmlElement = document.getElementById('html-root');
    if (htmlElement) {
      if (darkMode) {
        htmlElement.classList.add('dark');
      } else {
        htmlElement.classList.remove('dark');
      }
    }
    // Guardar el estado del modo oscuro en localStorage
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main className="flex-grow p-4 lg:p-8">
          <Routes>
            <Route path="/" element={<SocialMediaContentGenerator />} />
            <Route path="/text-image-generator" element={<SocialMediaContentGenerator />} />
            <Route path="/image-editor" element={<ImageEditor />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
  };

export default App;