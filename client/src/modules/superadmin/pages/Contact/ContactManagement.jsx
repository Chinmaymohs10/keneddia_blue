import React, { useEffect, useState } from "react";
import Layout from "@/modules/layout/Layout";
import { getAllProperties } from "@/Api/Api";
import {
  createContactHeroHeader,
  createContactTouchHeader,
  getAllContactHeroHeaders,
  getAllInquiries,
  getAllContactTouchHeaders,
  updateContactHeroHeader,
  updateContactTouchHeader,
} from "@/Api/contactusapi";

const inputCls =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 outline-none";

const toList = (value) =>
  Array.isArray(value)
    ? value
    : Array.isArray(value?.data)
      ? value.data
      : Array.isArray(value?.data?.data)
        ? value.data.data
        : [];

function splitBadgeLabel(label = "") {
  const text = String(label || "").trim();
  if (!text) return { part1: "", part2: "" };
  const words = text.split(/\s+/);
  if (words.length === 1) return { part1: words[0], part2: "" };
  return {
    part1: words.slice(0, -1).join(" "),
    part2: words[words.length - 1],
  };
}

export default function ContactManagement() {
  const [activeTab, setActiveTab] = useState("content");
  const [loading, setLoading] = useState(true);
  const [savingTouch, setSavingTouch] = useState(false);
  const [savingHero, setSavingHero] = useState(false);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);
  const [enquiries, setEnquiries] = useState([]);
  const [propertyNameMap, setPropertyNameMap] = useState({});
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchEnquiries = async () => {
    setLoadingEnquiries(true);
    try {
      const res = await getAllInquiries();
      const list = toList(res?.data);
      setEnquiries(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Failed to load contact enquiries", error);
      setEnquiries([]);
    } finally {
      setLoadingEnquiries(false);
    }
  };

  const filteredEnquiries = (
    propertyFilter === "all"
      ? enquiries
      : enquiries.filter(
          (item) => String(item?.propertyId ?? "") === String(propertyFilter),
        )
  ).sort((a, b) => {
    const timeA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (timeA !== timeB) return timeB - timeA;
    return Number(b?.id || 0) - Number(a?.id || 0);
  });

  const totalPages = Math.max(1, Math.ceil(filteredEnquiries.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedEnquiries = filteredEnquiries.slice(
    startIndex,
    startIndex + pageSize,
  );

  const propertyFilterOptions = Object.entries(propertyNameMap).map(
    ([id, name]) => ({
      id,
      name,
    }),
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const [touchForm, setTouchForm] = useState({
    id: null,
    headlinePart1: "Get in",
    description:
      "We are here to assist you with any inquiries regarding our hotels, restaurants, and cafes.",
    isActive: true,
  });

  const [heroForm, setHeroForm] = useState({
    id: null,
    badgeLabelPart1: "ABOUT OUR",
    badgeLabelPart2: "RESTAURANT",
    description:
      "Our restaurant offers world-class dining with an elegant ambiance and exceptional service.",
    isActive: true,
  });

  useEffect(() => {
    const loadForms = async () => {
      setLoading(true);
      try {
        const [touchRes, heroRes] = await Promise.all([
          getAllContactTouchHeaders(),
          getAllContactHeroHeaders(),
        ]);

        const touchList = toList(touchRes?.data);
        const heroList = toList(heroRes?.data);

        const touchExisting = touchList[0] || null;
        const heroExisting = heroList[0] || null;

        setTouchForm({
          id: touchExisting?.id ?? null,
          headlinePart1: touchExisting?.headlinePart1 ?? "Get in",
          description:
            touchExisting?.description ??
            "We are here to assist you with any inquiries regarding our hotels, restaurants, and cafes.",
          isActive: touchExisting?.isActive ?? true,
        });

        const badge = splitBadgeLabel(heroExisting?.badgeLabel);
        setHeroForm({
          id: heroExisting?.id ?? null,
          badgeLabelPart1: badge.part1 || "ABOUT OUR",
          badgeLabelPart2: badge.part2 || "RESTAURANT",
          description:
            heroExisting?.description ??
            "Our restaurant offers world-class dining with an elegant ambiance and exceptional service.",
          isActive: heroExisting?.isActive ?? true,
        });
      } catch (error) {
        console.error("Failed to load contact settings", error);
      } finally {
        setLoading(false);
      }
    };

    loadForms();
  }, []);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const res = await getAllProperties();
        const list = toList(res?.data);
        const nextMap = (Array.isArray(list) ? list : [])
          .filter(
            (item) =>
              item?.id != null &&
              (item?.isActive === true || item?.active === true),
          )
          .reduce((acc, item) => {
            const id = Number(item?.id);
            if (!Number.isNaN(id)) {
              acc[id] =
                item?.propertyName || item?.name || item?.title || `Property ${id}`;
            }
            return acc;
          }, {});
        setPropertyNameMap(nextMap);
      } catch (error) {
        console.error("Failed to load properties for enquiries table", error);
        setPropertyNameMap({});
      }
    };

    loadProperties();
  }, []);

  useEffect(() => {
    if (activeTab !== "enquiries") return;
    fetchEnquiries();
  }, [activeTab]);

  const saveTouch = async () => {
    setSavingTouch(true);
    try {
      const payload = {
        headlinePart1: touchForm.headlinePart1.trim(),
        headlinePart2: "",
        description: touchForm.description.trim(),
        isActive: true,
      };
      if (touchForm.id) {
        await updateContactTouchHeader(touchForm.id, payload);
      } else {
        const res = await createContactTouchHeader(payload);
        const created = res?.data?.data || res?.data || {};
        setTouchForm((prev) => ({ ...prev, id: created?.id ?? prev.id }));
      }
      alert("Get in Touch section saved.");
    } catch (error) {
      console.error("Failed to save Get in Touch section", error);
      alert("Failed to save Get in Touch section.");
    } finally {
      setSavingTouch(false);
    }
  };

  const saveHero = async () => {
    setSavingHero(true);
    try {
      const payload = {
        badgeLabel: `${heroForm.badgeLabelPart1} ${heroForm.badgeLabelPart2}`.trim(),
        description: heroForm.description.trim(),
        isActive: true,
      };
      if (heroForm.id) {
        await updateContactHeroHeader(heroForm.id, payload);
      } else {
        const res = await createContactHeroHeader(payload);
        const created = res?.data?.data || res?.data || {};
        setHeroForm((prev) => ({ ...prev, id: created?.id ?? prev.id }));
      }
      alert("Contact hero section saved.");
    } catch (error) {
      console.error("Failed to save contact hero section", error);
      alert("Failed to save contact hero section.");
    } finally {
      setSavingHero(false);
    }
  };

  return (
    <Layout
      title="Contact Page Management"
      subtitle="Manage Contact hero and Get in Touch content by property"
      role="superadmin"
      showActions={false}
    >
      <div className="h-full overflow-y-auto p-6 space-y-6">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("content")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "content"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Content Management
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("enquiries")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "enquiries"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Contact Enquiries
          </button>
        </div>

        {activeTab === "content" && (loading ? (
          <div className="bg-white border border-gray-100 rounded-xl p-6 text-sm text-gray-500">
            Loading contact settings...
          </div>
        ) : (
          <>
            <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">
                Contact Hero
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Badge Label Part 1
                  </label>
                  <input
                    className={inputCls}
                    value={heroForm.badgeLabelPart1}
                    onChange={(e) =>
                      setHeroForm((prev) => ({
                        ...prev,
                        badgeLabelPart1: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Badge Label Part 2
                  </label>
                  <input
                    className={inputCls}
                    value={heroForm.badgeLabelPart2}
                    onChange={(e) =>
                      setHeroForm((prev) => ({
                        ...prev,
                        badgeLabelPart2: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  className={inputCls}
                  value={heroForm.description}
                  onChange={(e) =>
                    setHeroForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <button
                type="button"
                onClick={saveHero}
                disabled={savingHero}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-60"
              >
                {savingHero ? "Saving..." : "Save Hero Section"}
              </button>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">
                Get in Touch Section
              </h3>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Heading
                </label>
                <input
                  className={inputCls}
                  value={touchForm.headlinePart1}
                  onChange={(e) =>
                    setTouchForm((prev) => ({
                      ...prev,
                      headlinePart1: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  className={inputCls}
                  value={touchForm.description}
                  onChange={(e) =>
                    setTouchForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <button
                type="button"
                onClick={saveTouch}
                disabled={savingTouch}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-60"
              >
                {savingTouch ? "Saving..." : "Save Get in Touch"}
              </button>
            </div>
          </>
        ))}

        {activeTab === "enquiries" && (
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">
                Contact Enquiries
              </h3>
              <div className="flex items-center gap-2">
                <select
                  className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700"
                  value={propertyFilter}
                  onChange={(e) => {
                    setPropertyFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Property IDs</option>
                  {propertyFilterOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.id} - {opt.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={fetchEnquiries}
                  className="px-3 py-1.5 rounded-md border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Refresh
                </button>
              </div>
            </div>

            {loadingEnquiries ? (
              <div className="text-sm text-gray-500 py-10">Loading enquiries...</div>
            ) : filteredEnquiries.length === 0 ? (
              <div className="text-sm text-gray-500 py-10">No contact enquiries found.</div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200 text-gray-700">
                      <th className="py-3 px-4 font-semibold">Serial No.</th>
                      <th className="py-3 px-4 font-semibold">Name</th>
                      <th className="py-3 px-4 font-semibold">Email</th>
                      <th className="py-3 px-4 font-semibold">Property</th>
                      <th className="py-3 px-4 font-semibold">Phone</th>
                      <th className="py-3 px-4 font-semibold">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEnquiries.map((item, index) => (
                      <tr key={item?.id ?? index} className="border-b border-gray-100 align-top hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4 text-gray-700 font-medium">{startIndex + index + 1}</td>
                        <td className="py-3 px-4 font-medium text-gray-800">{item?.fullName || "-"}</td>
                        <td className="py-3 px-4 text-gray-700 font-medium">{item?.email || "-"}</td>
                        <td className="py-3 px-4 text-gray-700">
                          {propertyNameMap[Number(item?.propertyId)] || "-"}
                        </td>
                        <td className="py-3 px-4 text-gray-700 font-medium">{item?.phoneNumber || "-"}</td>
                        <td className="py-3 px-4 text-gray-700 max-w-[460px] whitespace-pre-wrap break-words">
                          {item?.message || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(startIndex + pageSize, filteredEnquiries.length)} of{" "}
                    {filteredEnquiries.length} enquiries
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-md border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-xs font-semibold text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-md border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
