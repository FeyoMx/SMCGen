

/**
 * Converts a File or Blob object to a Base64 encoded string.
 * @param file The File or Blob to convert.
 * @returns A Promise that resolves with the Base64 encoded string, or rejects if an error occurs.
 */
export function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}