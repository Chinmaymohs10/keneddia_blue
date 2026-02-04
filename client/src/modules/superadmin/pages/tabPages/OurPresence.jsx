import React, { useState } from 'react';
import { colors } from "@/lib/colors/colors";
import { Plus, Trash2 } from 'lucide-react';

function OurPresence() {
  const [sectionData, setSectionData] = useState({
    overlineText: 'OUR PRESENCE',
    mainHeading: 'Luxury Hospitality Across India',
    description: 'Handpicked destinations that blend heritage charm with modern excellence, creating unforgettable stays in India\'s most iconic cities.'
  });

  const [featureTiles, setFeatureTiles] = useState([
    {
      id: 1,
      title: 'Curated Experiences',
      description: 'Premium locations in heritage cities'
    },
    {
      id: 2,
      title: 'Excellence Awarded',
      description: 'Recognized for outstanding hospitality'
    },
    {
      id: 3,
      title: 'Guest-Centric',
      description: '24/7 concierge & wellness amenities'
    },
    {
      id: 4,
      title: 'Sustainable Luxury',
      description: 'Eco-conscious practices meet comfort'
    }
  ]);

  const handleAddTile = () => {
    const newTile = {
      id: Date.now(),
      title: '',
      description: ''
    };
    setFeatureTiles([...featureTiles, newTile]);
  };

  const handleDeleteTile = (id) => {
    setFeatureTiles(featureTiles.filter(t => t.id !== id));
  };

  const handleTileChange = (id, field, value) => {
    setFeatureTiles(featureTiles.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const handleSectionChange = (field, value) => {
    setSectionData({ ...sectionData, [field]: value });
  };

  const handleSaveAll = async () => {
    const payload = {
      sectionData: sectionData,
      featureTiles: featureTiles
    };

    try {
      console.log('Saving all data:', payload);
      
      // TODO: Replace with your actual API endpoint
      // const response = await fetch('/api/our-presence', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(payload)
      // });
      
      // if (response.ok) {
      //   alert('Data saved successfully!');
      // } else {
      //   alert('Failed to save data');
      // }
      
      // For now, just show the payload in console
      alert('Data saved successfully! Check console for payload.');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data');
    }
  };

  return (
    <div>
      {/* Header Section Settings */}
      <div 
        className="rounded-lg p-4 sm:p-5 shadow-sm mb-3"
        style={{ backgroundColor: colors.contentBg }}
      >
        <h3 
          className="text-sm font-semibold mb-4"
          style={{ color: colors.textPrimary }}
        >
          Header Section
        </h3>
        
        <div className="space-y-3">
          <div>
            <label 
              className="block text-xs font-medium mb-1.5"
              style={{ color: colors.textSecondary }}
            >
              Overline Text
            </label>
            <input
              type="text"
              value={sectionData.overlineText}
              onChange={(e) => handleSectionChange('overlineText', e.target.value)}
              className="w-full px-3 py-2 rounded border text-sm"
              style={{ 
                borderColor: colors.border,
                backgroundColor: colors.mainBg,
                color: colors.textPrimary
              }}
              placeholder="OUR PRESENCE"
            />
          </div>

          <div>
            <label 
              className="block text-xs font-medium mb-1.5"
              style={{ color: colors.textSecondary }}
            >
              Main Heading
            </label>
            <input
              type="text"
              value={sectionData.mainHeading}
              onChange={(e) => handleSectionChange('mainHeading', e.target.value)}
              className="w-full px-3 py-2 rounded border text-sm"
              style={{ 
                borderColor: colors.border,
                backgroundColor: colors.mainBg,
                color: colors.textPrimary
              }}
              placeholder="Luxury Hospitality Across India"
            />
          </div>

          <div>
            <label 
              className="block text-xs font-medium mb-1.5"
              style={{ color: colors.textSecondary }}
            >
              Description
            </label>
            <textarea
              value={sectionData.description}
              onChange={(e) => handleSectionChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded border text-sm resize-none"
              style={{ 
                borderColor: colors.border,
                backgroundColor: colors.mainBg,
                color: colors.textPrimary
              }}
              placeholder="Handpicked destinations that blend heritage charm with modern excellence..."
            />
          </div>
        </div>
      </div>

      {/* Feature Tiles Section */}
      <div 
        className="rounded-lg p-4 sm:p-5 shadow-sm"
        style={{ backgroundColor: colors.contentBg }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 
            className="text-sm font-semibold m-0"
            style={{ color: colors.textPrimary }}
          >
            Feature Tiles
          </h3>
          <button
            onClick={handleAddTile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            style={{ 
              backgroundColor: colors.primary,
              color: '#ffffff'
            }}
          >
            <Plus size={16} />
            Add Tile
          </button>
        </div>

        {/* Tiles List */}
        <div className="space-y-3">
          {featureTiles.map((tile) => {
            return (
              <div
                key={tile.id}
                className="rounded-lg p-4 border"
                style={{ 
                  backgroundColor: colors.mainBg,
                  borderColor: colors.border
                }}
              >
                {/* Tile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label 
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: colors.textSecondary }}
                    >
                      Title
                    </label>
                    <input
                      type="text"
                      value={tile.title}
                      onChange={(e) => handleTileChange(tile.id, 'title', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border text-sm"
                      style={{ 
                        borderColor: colors.border,
                        backgroundColor: colors.contentBg,
                        color: colors.textPrimary
                      }}
                      placeholder="Curated Experiences"
                    />
                  </div>

                  <div>
                    <label 
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: colors.textSecondary }}
                    >
                      Description
                    </label>
                    <input
                      type="text"
                      value={tile.description}
                      onChange={(e) => handleTileChange(tile.id, 'description', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border text-sm"
                      style={{ 
                        borderColor: colors.border,
                        backgroundColor: colors.contentBg,
                        color: colors.textPrimary
                      }}
                      placeholder="Premium locations in heritage cities"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleDeleteTile(tile.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                    style={{ 
                      backgroundColor: '#EF4444',
                      color: '#FFFFFF'
                    }}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Save Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSaveAll}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          style={{ 
            backgroundColor: colors.primary,
            color: '#ffffff'
          }}
        >
          Save All Changes
        </button>
      </div>
    </div>
  );
}

export default OurPresence;