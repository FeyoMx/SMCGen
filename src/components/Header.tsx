
import React from 'react';
import { NavLink } from 'react-router-dom';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, toggleDarkMode }) => {
  const tabs = [
    { name: 'Contenido y Imagen', path: '/text-image-generator', key: 'text-image-generator' },
    { name: 'Editor de Imágenes', path: '/image-editor', key: 'image-editor' },
  ];

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between">
        <h1 className="text-3xl font-bold mb-4 md:mb-0 text-center md:text-left">
          Creador de Contenido para Redes Sociales con IA
        </h1>
        <nav className="flex flex-wrap justify-center md:justify-end gap-2 sm:gap-4 items-center">
          {tabs.map((tab) => (
            <NavLink
              key={tab.key}
              to={tab.path}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                ${isActive ? 'bg-white text-blue-700 shadow-md dark:bg-blue-200 dark:text-blue-800' : 'text-white hover:bg-blue-500/70'}`
              }
            >
              {tab.name}
            </NavLink>
          ))}
          {/* Botón de Modo Oscuro */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full text-white hover:bg-blue-500/70 transition-colors duration-200 ml-4"
            aria-label={darkMode ? "Activar modo claro" : "Activar modo oscuro"}
            title={darkMode ? "Activar modo claro" : "Activar modo oscuro"}
          >
            {darkMode ? (
              // Icono de sol para modo claro
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18v2.25m-6.364-.386l1.591-1.591M3 12h2.25m-.386-6.364l1.591 1.591M12 12a3 3 0 11-6 0 3 3 0 016 0zm0 0a9 9 0 100 0z" />
              </svg>
            ) : (
              // Icono de luna para modo oscuro
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0112 21.75c-3.617 0-6.945-1.847-8.86-4.998V12c0-2.822 1.844-5.275 4.551-6.495C7.353 4.417 9.17 3.75 11 3.75h-.265c.199 1.258.106 2.505-.139 3.738-1.565 7.828-8.239 12.028-12.029 10.375C4.249 20.334 3.75 17.653 3.75 12z" />
              </svg>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;