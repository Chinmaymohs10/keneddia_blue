import React from 'react';
import { colors } from "@/lib/colors/colors";
import Layout from '@/modules/layout/Layout';
import { Sparkles } from 'lucide-react';

function RestaurantMenu() {
  return (
    <Layout 
      title="Restaurant Menu"
      subtitle="Manage restaurant menu items"
      role="superadmin"
    >
      <div 
        className="flex items-center justify-center min-h-[60vh]"
      >
        <div className="text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: colors.primary + '20' }}
          >
            <Sparkles size={40} style={{ color: colors.primary }} />
          </div>
          <h2 
            className="text-2xl font-bold mb-2"
            style={{ color: colors.textPrimary }}
          >
            Coming Soon
          </h2>
          <p 
            className="text-sm"
            style={{ color: colors.textSecondary }}
          >
            We're working on something amazing. Stay tuned!
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default RestaurantMenu;
