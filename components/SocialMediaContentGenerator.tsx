

import React, { useState } from 'react';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import { generateSocialMediaContent, generateSocialMediaContentWithGrounding, generateImage } from '../services/geminiService';
import { SocialMediaContent, SocialMediaContentWithGrounding } from '../types';

const SocialMediaContentGenerator: React.FC = () => {
  const [theme, setTheme] = useState<string>('');
  const [includeGrounding, setIncludeGrounding] = useState<boolean>(false);
  const [content, setContent] = useState<SocialMediaContent | null>(null);
  const [groundedContent, setGroundedContent] = useState<SocialMediaContentWithGrounding | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedStatus, setCopiedStatus] = useState<{ [key: string]: boolean }>({});

  const handleCopyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedStatus((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopiedStatus((prev) => ({ ...prev, [key]: false }));
      }, 2000); // Reset status after 2 seconds
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      // Optionally show an error message to the user
    });
  };

  const handleGenerateContent = async () => {
    setError(null);
    setContent(null);
    setGroundedContent(null);
    setGeneratedImage(null); // Clear previous image
    setCopiedStatus({}); // Clear copied status on new generation

    if (!theme.trim()) {
      setError('Por favor, introduce un tema para tu contenido de redes sociales.');
      return;
    }

    setIsLoading(true);
    try {
      // Generate text content
      if (includeGrounding) {
        const textResult = await generateSocialMediaContentWithGrounding(theme);
        setGroundedContent(textResult);
      } else {
        const textResult = await generateSocialMediaContent(theme);
        setContent(textResult);
      }

      // Generate image
      const imageUrl = await generateImage(theme);
      setGeneratedImage(imageUrl);

    } catch (err: any) {
      console.error('Error generando contenido (texto/imagen):', err);
      setError(err.message || 'Fallo al generar contenido. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const CopyButton: React.FC<{ textToCopy: string; copyKey: string; label: string; className?: string }> = ({ textToCopy, copyKey, label, className }) => (
    <button
      onClick={() => handleCopyToClipboard(textToCopy, copyKey)}
      className={`p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className || ''}`}
      aria-label={copiedStatus[copyKey] ? "Copiado!" : `Copiar ${label} al portapapeles`}
      title={copiedStatus[copyKey] ? "Copiado!" : `Copiar ${label} al portapapeles`}
    >
      {copiedStatus[copyKey] ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-xl">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
        Generar Contenido para Redes Sociales (Texto e Imagen)
      </h2>

      <div className="flex flex-col space-y-4">
        <textarea
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-y min-h-[100px] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          placeholder="Introduce un tema para tu publicación en redes sociales, incluyendo descripción de imagen (ej., 'Beneficios del teletrabajo, mostrando a una persona sonriendo trabajando desde casa con una taza de café', 'Recetas saludables de verano, con una ensalada colorida y fresca')."
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          rows={4}
        />

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="include-grounding"
            checked={includeGrounding}
            onChange={(e) => setIncludeGrounding(e.target.checked)}
            className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="include-grounding" className="text-gray-700 dark:text-gray-300 text-base font-medium select-none">
            Incluir información actualizada (vía Google Search)
          </label>
        </div>

        <Button onClick={handleGenerateContent} isLoading={isLoading}>
          Generar Contenido y Imagen
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
          <LoadingSpinner message="Generando contenido de texto e imagen, por favor espera..." />
        </div>
      )}

      {(content || groundedContent || generatedImage) && (
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-inner">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Contenido Generado:</h3>

          {generatedImage && (
            <div className="mb-6 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md flex flex-col items-center border border-gray-200 dark:border-gray-600">
              <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">Imagen para Redes Sociales:</h4>
              <img
                src={generatedImage}
                alt="Imagen para Redes Sociales"
                className="max-w-full h-auto rounded-md shadow-lg border border-gray-100 dark:border-gray-700"
              />
              <a
                href={generatedImage}
                download="generated-social-media-image.png"
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
              >
                Descargar Imagen
              </a>
            </div>
          )}

          {groundedContent ? (
            <div>
              <div className="flex items-start mb-2">
                <p className="font-medium text-gray-700 dark:text-gray-300 mt-1">Texto Completo:</p>
                <CopyButton textToCopy={groundedContent.text} copyKey="grounded_full_text" label="texto completo" className="ml-2" />
              </div>
              <div className="prose max-w-none text-gray-800 dark:text-gray-200 leading-relaxed bg-gray-100 dark:bg-gray-900 p-3 rounded-md border border-gray-200 dark:border-gray-600" dangerouslySetInnerHTML={{ __html: groundedContent.text.replace(/\n/g, '<br />') }} />
              {groundedContent.groundingUrls.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium text-gray-700 dark:text-gray-300">Fuentes:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                    {groundedContent.groundingUrls.map((url, index) => (
                      <li key={index}>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline dark:text-blue-400">
                          {url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div>
              {content?.description && (
                <div className="mb-4">
                  <div className="flex items-center mb-1">
                    <p className="font-medium text-gray-700 dark:text-gray-300">Descripción:</p>
                    <CopyButton textToCopy={content.description} copyKey="description" label="descripción" className="ml-2" />
                  </div>
                  <p className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{content.description}</p>
                </div>
              )}
              {content?.dialogues && content.dialogues.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center mb-1">
                    <p className="font-medium text-gray-700 dark:text-gray-300">Diálogos:</p>
                    {/* Changed to Markdown list format */}
                    <CopyButton textToCopy={content.dialogues.map(d => `- ${d}`).join('\n')} copyKey="dialogues" label="diálogos" className="ml-2" />
                  </div>
                  <ul className="list-disc list-inside bg-gray-100 dark:bg-gray-900 p-3 rounded-md border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200">
                    {content.dialogues.map((dialogue, index) => (
                      <li key={index} className="mb-1">{dialogue}</li>
                    ))}
                  </ul>
                </div>
              )}
              {content?.hashtags && content.hashtags.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center mb-1">
                    <p className="font-medium text-gray-700 dark:text-gray-300">Hashtags:</p>
                    <CopyButton textToCopy={content.hashtags.join(' ')} copyKey="hashtags" label="hashtags" className="ml-2" />
                  </div>
                  <p className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 break-words">{content.hashtags.join(' ')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SocialMediaContentGenerator;