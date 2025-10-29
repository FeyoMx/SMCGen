

import React, { useState, useRef } from 'react';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import { editImage } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';

const ImageEditor: React.FC = () => {
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setOutputImage(null);
    setInputImage(null);

    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor, sube un archivo de imagen (ej., JPEG, PNG, GIF).');
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        setInputImage(base64);
      } catch (err: any) {
        setError('Fallo al leer el archivo de imagen. Por favor, inténtalo de nuevo.');
        console.error('Error de conversión de archivo a base64:', err);
      }
    }
  };

  const handleEditImage = async () => {
    setError(null);
    setOutputImage(null);
    if (!inputImage) {
      setError('Por favor, sube una imagen primero.');
      return;
    }
    if (!prompt.trim()) {
      setError('Por favor, introduce una descripción para la edición.');
      return;
    }

    setIsLoading(true);
    try {
      const editedImageUrl = await editImage(inputImage, prompt);
      setOutputImage(editedImageUrl);
    } catch (err: any) {
      console.error('Error editando imagen:', err);
      setError(err.message || 'Fallo al editar la imagen. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-xl">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
        Editor de Imágenes con IA
      </h2>

      <div className="flex flex-col space-y-6">
        <div>
          <label htmlFor="image-upload" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subir Imagen para Editar:
          </label>
          <input
            type="file"
            id="image-upload"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 dark:text-gray-400
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-md file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-700 dark:file:text-blue-50
                       hover:file:bg-blue-100 dark:hover:file:bg-blue-600 cursor-pointer"
          />
          {inputImage && (
            <div className="mt-4 border border-gray-200 dark:border-gray-600 rounded-md overflow-hidden">
              <img src={inputImage} alt="Subida para edición" className="max-w-full h-auto" />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="edit-prompt" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descripción de la Edición:
          </label>
          <textarea
            id="edit-prompt"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-y min-h-[100px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Describe la edición (ej., 'Añadir un filtro retro', 'Quitar a la persona del fondo', 'Cambiar el fondo a una montaña nevada')."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
          />
        </div>

        <Button onClick={handleEditImage} isLoading={isLoading} disabled={!inputImage}>
          Editar Imagen
        </Button>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-100 text-red-700 border border-red-300 rounded-md dark:bg-red-900 dark:text-red-100 dark:border-red-700">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="mt-8">
          <LoadingSpinner message="Aplicando ediciones, esto podría tardar un momento..." />
        </div>
      )}

      {outputImage && (
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-inner flex flex-col items-center">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Imagen Editada:</h3>
          <img
            src={outputImage}
            alt="Contenido de Redes Sociales Editado"
            className="max-w-full h-auto rounded-md shadow-lg border border-gray-200 dark:border-gray-600"
          />
          <a
            href={outputImage}
            download="edited-image.png"
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
          >
            Descargar Imagen Editada
          </a>
        </div>
      )}
    </div>
  );
};

export default ImageEditor;