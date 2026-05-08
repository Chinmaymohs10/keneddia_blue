import React from "react";
import Layout from "@/modules/layout/Layout";
import Policies from "@/modules/superadmin/pages/tabPages/Policies";

export default function PoliciesManagement() {
  return (
    <Layout
      title="Policies"
      subtitle="Manage legal disclaimer policy pages"
      role="superadmin"
      showActions={false}
    >
      <div className="h-full overflow-y-auto scrollbar-thin">
        <div className="p-2 sm:p-2">
          <Policies />
        </div>
      </div>
    </Layout>
  );
}
