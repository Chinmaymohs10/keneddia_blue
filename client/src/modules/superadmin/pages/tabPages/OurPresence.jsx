import React, { useState, useEffect } from 'react';
import { colors } from "@/lib/colors/colors";
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { AddOurPresenceSectionItems, getOurPresenceSection, UpdateOurPresenceSectionHeaders, updateOurPresenceSectionItemsById } from '@/Api/Api';

function OurPresence() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sectionData, setSectionData] = useState({
    overlineText: 'OUR PRESENCE',
    mainHeading: 'Luxury Hospitality Across India',
    description: 'Handpicked destinations that blend heritage charm with modern excellence, creating unforgettable stays in India\'s most iconic cities.',
    isActive: true
  });

  const [featureTiles, setFeatureTiles] = useState([]);
  const [deletedTileIds, setDeletedTileIds] = useState([]);

  // Fetch existing data on component mount
  useEffect(() => {
    fetchPresenceData();
  }, []);

  const fetchPresenceData = async () => {
    try {
      setLoading(true);
      const response = await getOurPresenceSection();
      console.log('Fetched presence data:', response);

      if (response?.data) {
        // Map API response to component state
        setSectionData({
          overlineText: response.data.sectionTitle || 'OUR PRESENCE',
          mainHeading: response.data.sectionSubtitle || 'Luxury Hospitality Across India',
          description: response.data.description || '',
          isActive: response.data.isActive !== undefined ? response.data.isActive : true
        });

        if (response.data.items && response.data.items.length > 0) {
          // Map items from API to tiles format
          const tiles = response.data.items.map(item => ({
            id: item.id,
            title: item.title || '',
            description: item.subtitle || '',
            icon: item.icon || 'sparkles',
            displayOrder: item.displayOrder || 1,
            isActive: item.isActive !== undefined ? item.isActive : true,
            isExisting: true // Mark as existing from API
          }));
          setFeatureTiles(tiles);
        }
      }
    } catch (error) {
      console.error('Error fetching presence data:', error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  const handleAddTile = () => {
    const newTile = {
      id: Date.now(), // Temporary ID for new tiles
      title: '',
      description: '',
      icon: 'sparkles',
      displayOrder: featureTiles.length + 1,
      isActive: true,
      isExisting: false // Mark as new
    };
    setFeatureTiles([...featureTiles, newTile]);
  };

  const handleDeleteTile = (id) => {
    const tile = featureTiles.find(t => t.id === id);
    
    // If it's an existing tile from API, track it for deletion
    if (tile?.isExisting) {
      setDeletedTileIds([...deletedTileIds, id]);
    }
    
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

  const handleSaveHeaders = async () => {
    try {
      setSaving(true);

      const headerPayload = {
        sectionTitle: sectionData.overlineText,
        sectionSubtitle: sectionData.mainHeading,
        isActive: sectionData.isActive
      };

      console.log('Updating headers:', headerPayload);
      await UpdateOurPresenceSectionHeaders(headerPayload);

      alert('Section headers saved successfully!');
      
    } catch (error) {
      console.error('Error saving headers:', error);
      alert('Error saving headers: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNewTile = async (tile) => {
    try {
      setSaving(true);

      const itemPayload = {
        title: tile.title,
        subtitle: tile.description,
        icon: tile.icon || 'sparkles',
        displayOrder: tile.displayOrder,
        isActive: tile.isActive !== undefined ? tile.isActive : true
      };

      console.log('Adding new tile:', itemPayload);
      await AddOurPresenceSectionItems(itemPayload);

      alert('New tile added successfully!');
      
      // Refresh data to get updated IDs
      await fetchPresenceData();
      
    } catch (error) {
      console.error('Error adding tile:', error);
      alert('Error adding tile: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateExistingTile = async (tile) => {
    try {
      setSaving(true);

      const itemPayload = {
        title: tile.title,
        subtitle: tile.description,
        icon: tile.icon || 'sparkles',
        displayOrder: tile.displayOrder,
        isActive: tile.isActive !== undefined ? tile.isActive : true
      };

      console.log(`Updating tile ${tile.id}:`, itemPayload);
      await updateOurPresenceSectionItemsById(tile.id, itemPayload);

      alert('Tile updated successfully!');
      
      // Refresh data
      await fetchPresenceData();
      
    } catch (error) {
      console.error('Error updating tile:', error);
      alert('Error updating tile: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: colors.primary }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header Section Settings */}
      <div 
        className="rounded-lg p-4 sm:p-5 shadow-sm mb-3"
        style={{ backgroundColor: colors.contentBg }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 
            className="text-sm font-semibold"
            style={{ color: colors.textPrimary }}
          >
            Header Section
          </h3>
          <button
            onClick={handleSaveHeaders}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-1.5 rounded text-xs font-semibold transition-colors"
            style={{ 
              backgroundColor: saving ? colors.border : colors.primary,
              color: '#ffffff',
              opacity: saving ? 0.7 : 1,
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Save Headers
          </button>
        </div>
        
        <div className="space-y-3">
          <div>
            <label 
              className="block text-xs font-medium mb-1.5"
              style={{ color: colors.textSecondary }}
            >
              Overline Text (Section Title)
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
              Main Heading (Section Subtitle)
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
              Active Status
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sectionData.isActive}
                onChange={(e) => handleSectionChange('isActive', e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: colors.primary }}
              />
              <span className="text-sm" style={{ color: colors.textPrimary }}>
                Section is active
              </span>
            </label>
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
            disabled={saving}
          >
            <Plus size={16} />
            Add Tile
          </button>
        </div>

        {/* Tiles List */}
        <div className="space-y-3">
          {featureTiles.map((tile, index) => {
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
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
                      Description (Subtitle)
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

                  <div>
                    <label 
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: colors.textSecondary }}
                    >
                      Icon
                    </label>
                    <select
                      value={tile.icon || 'sparkles'}
                      onChange={(e) => handleTileChange(tile.id, 'icon', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border text-sm"
                      style={{ 
                        borderColor: colors.border,
                        backgroundColor: colors.contentBg,
                        color: colors.textPrimary
                      }}
                    >
                      <option value="sparkles">Sparkles</option>
                      <option value="award">Award</option>
                      <option value="users">Users</option>
                      <option value="star">Star</option>
                      <option value="mappin">Map Pin</option>
                      <option value="trendingup">Trending Up</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tile.isActive}
                        onChange={(e) => handleTileChange(tile.id, 'isActive', e.target.checked)}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: colors.primary }}
                      />
                      <span className="text-xs" style={{ color: colors.textSecondary }}>
                        Active
                      </span>
                    </label>
                    <span className="text-xs" style={{ color: colors.textSecondary }}>
                      Display Order: {tile.displayOrder}
                    </span>
                    {!tile.isExisting && (
                      <span 
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ 
                          backgroundColor: colors.primary + '20',
                          color: colors.primary 
                        }}
                      >
                        New
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {/* <button
                      onClick={() => handleDeleteTile(tile.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                      style={{ 
                        backgroundColor: '#EF4444',
                        color: '#FFFFFF'
                      }}
                      disabled={saving}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button> */}
                    
                    {tile.isExisting ? (
                      <button
                        onClick={() => handleUpdateExistingTile(tile)}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                        style={{ 
                          backgroundColor: saving ? colors.border : colors.primary,
                          color: '#ffffff',
                          opacity: saving ? 0.7 : 1,
                          cursor: saving ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {saving && <Loader2 size={14} className="animate-spin" />}
                        Update
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSaveNewTile(tile)}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                        style={{ 
                          backgroundColor: saving ? colors.border : '#10B981',
                          color: '#ffffff',
                          opacity: saving ? 0.7 : 1,
                          cursor: saving ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {saving && <Loader2 size={14} className="animate-spin" />}
                        Save New
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {featureTiles.length === 0 && (
            <div 
              className="text-center py-8"
              style={{ color: colors.textSecondary }}
            >
              <p className="text-sm">No feature tiles added yet. Click "Add Tile" to create one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OurPresence;