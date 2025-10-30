import { GoogleGenAI, Modality, Type, GenerateContentResponse } from '@google/genai';
import {
  MODEL_IMAGE_GENERATION,
  MODEL_IMAGE_EDITING,
  MODEL_TEXT_FAST,
} from '../constants';
import { SocialMediaContent, SocialMediaContentWithGrounding } from '../types';

// Helper to create a new GoogleGenAI instance on demand, ensuring latest API key is used
const getGeminiClient = () => {
  // Las pautas especifican usar process.env.API_KEY.
  // Vite lo inyecta como una cadena literal en el bundle del cliente en tiempo de construcción.
  // En el entorno de construcción (Docker), el API_KEY se pasa como ENV.
  if (typeof process.env.API_KEY === 'undefined' || process.env.API_KEY === '') {
    throw new Error('API_KEY no está definido. Asegúrate de que está configurado en tu entorno de construcción/ejecución.');
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Se han eliminado las funciones hasSelectedApiKey y openSelectApiKey ya que no se usa la API de video.

/**
 * Generates an image based on a text prompt.
 * @param prompt The text description of the image to generate.
 * @returns A base64 encoded image URL.
 */
export async function generateImage(prompt: string): Promise<string> {
  const ai = getGeminiClient();
  const response = await ai.models.generateImages({
    model: MODEL_IMAGE_GENERATION,
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: '1:1', // Aspect ratio por defecto para imágenes
    },
  });

  if (!response.generatedImages || response.generatedImages.length === 0) {
    throw new Error('No se generaron imágenes.');
  }

  const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
  return `data:image/jpeg;base64,${base64ImageBytes}`;
}

/**
 * Edits an image based on an uploaded image and a text prompt.
 * @param base64Image The base64 encoded original image data.
 * @param prompt The text instruction for editing the image.
 * @returns A base64 encoded edited image URL.
 */
export async function editImage(base64Image: string, prompt: string): Promise<string> {
  const ai = getGeminiClient();

  // Extract mime type from base64 string
  const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z0-9.+_-]+);base64,/);
  if (!mimeMatch || mimeMatch.length < 2) {
    throw new Error('No se pudo determinar el tipo MIME de los datos de la imagen base64.');
  }
  const mimeType = mimeMatch[1];
  const data = base64Image.split(',')[1];

  const response = await ai.models.generateContent({
    model: MODEL_IMAGE_EDITING,
    contents: {
      parts: [
        {
          inlineData: {
            data: data,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const editedImagePart = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  if (!editedImagePart || typeof editedImagePart.data !== 'string' || typeof editedImagePart.mimeType !== 'string') {
    throw new Error('No se recibió ninguna imagen editada del modelo o los datos/tipo MIME de la imagen son nulos/inválidos.');
  }

  return `data:${editedImagePart.mimeType};base64,${editedImagePart.data}`;
}

// Se ha eliminado la función generateVideo.

/**
 * Generates social media content (description, dialogues, hashtags) in JSON format.
 * @param theme The social media theme.
 * @returns Structured social media content.
 */
export async function generateSocialMediaContent(theme: string): Promise<SocialMediaContent> {
  const ai = getGeminiClient();

  const prompt = `Genera contenido para redes sociales para el tema: "${theme}". 
    La salida debe incluir una descripción adecuada para una publicación, algunos diálogos cortos que se puedan usar y una lista de hashtags relevantes.
    Proporciona la respuesta en formato JSON de acuerdo con el siguiente esquema:
    {
      "description": "string",
      "dialogues": ["string", "string", ...],
      "hashtags": ["string", "string", ...]
    }`;

  const response = await ai.models.generateContent({
    model: MODEL_TEXT_FAST,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: {
            type: Type.STRING,
            description: 'Una descripción convincente para una publicación en redes sociales.',
          },
          dialogues: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Diálogos cortos y atractivos relevantes para el tema.',
          },
          hashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Una lista de hashtags relevantes.',
          },
        },
        required: ['description', 'dialogues', 'hashtags'],
      },
    },
  });

  const jsonString = response.text.trim();
  try {
    const parsedContent = JSON.parse(jsonString);
    return parsedContent as SocialMediaContent;
  } catch (parseError) {
    console.error('Fallo al analizar la respuesta JSON:', jsonString, parseError);
    throw new Error('Fallo al analizar el contenido como JSON. Respuesta bruta: ' + jsonString);
  }
}

/**
 * Generates social media content using Google Search grounding for up-to-date information.
 * Output will be free-form text with sources.
 * @param theme The social media theme.
 * @returns Social media content as free-form text along with any grounding URLs.
 */
export async function generateSocialMediaContentWithGrounding(theme: string): Promise<SocialMediaContentWithGrounding> {
  const ai = getGeminiClient();

  const prompt = `Genera contenido integral para redes sociales para el tema: "${theme}". 
    Incluye una descripción convincente, algunos diálogos atractivos y hashtags relevantes. 
    Asegura que la información esté actualizada y sea precisa utilizando la Búsqueda de Google.
    Prioriza las mejores prácticas de marketing para WhatsApp y Facebook.`;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: MODEL_TEXT_FAST,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  const groundingUrls: string[] = [];

  if (groundingChunks) {
    for (const chunk of groundingChunks) {
      if (chunk.web && chunk.web.uri) {
        groundingUrls.push(chunk.web.uri);
      }
    }
  }

  // Comprobar si response.text es indefinido y proporcionar un valor predeterminado si es necesario.
  const textOutput: string = response.text || "No se generó contenido de texto.";

  return {
    text: textOutput,
    groundingUrls: groundingUrls,
  };
}