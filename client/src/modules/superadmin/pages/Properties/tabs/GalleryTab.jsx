import React from 'react';
import { TrashIcon, PlusIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { colors } from '@/lib/colors/colors';

const GalleryTab = ({ data, onEdit, onAdd, onDelete }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Gallery</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-90"
          style={{ backgroundColor: colors.primary }}
        >
          <PlusIcon className="w-5 h-5" /> Upload Media
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.map((item) => (
          <div key={item.id} className="group relative aspect-video bg-gray-100 rounded-lg overflow-hidden border">
             {item.url ? (
                <img src={item.url} alt="Gallery item" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
             ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <PhotoIcon className="w-12 h-12" />
                </div>
             )}
             
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
              <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {item.category}
              </span>
              <button 
                onClick={() => onDelete(item.id)} 
                className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors shadow-lg"
                title="Delete image"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
            {item.mediaType === 'video' && (
                <div className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                </div>
             )}
          </div>
        ))}
         {data.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed flex flex-col items-center justify-center">
             <PhotoIcon className="w-12 h-12 mb-2 text-gray-300" />
             <p>No images or videos uploaded.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryTab;
