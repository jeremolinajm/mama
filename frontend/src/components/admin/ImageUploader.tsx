import { useState, useRef } from 'react';
import { uploadApi } from '../../api/upload';
import { resolveImageUrl } from '../../utils/imageUtils';

interface ImageUploaderProps {
  currentImageUrl?: string | null;
  onImageUploaded: (url: string) => void;
}

export default function ImageUploader({ currentImageUrl, onImageUploaded }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validaciones básicas de frontend
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert('La imagen no debe superar los 5MB');
      return;
    }

    try {
      setUploading(true);
      // Previsualización inmediata
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Subida real
      const url = await uploadApi.uploadImage(file);
      onImageUploaded(url); // Notificar al padre la URL final del servidor
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen. Intenta nuevamente.');
      setPreview(currentImageUrl || null); // Revertir
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Imagen del Producto/Servicio</label>
      
      <div 
        className={`
          relative border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer hover:bg-gray-50 hover:border-primary
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
        />

        {preview ? (
          <div className="relative w-full h-48 group">
            <img
              src={resolveImageUrl(preview)}
              alt="Preview"
              className="w-full h-full object-contain rounded-lg"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg text-white font-medium">
              Click para cambiar
            </div>
          </div>
        ) : (
          <div className="py-8">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-primary">Haz click para subir</span> o arrastra y suelta
            </p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP hasta 5MB</p>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </div>
  );
}