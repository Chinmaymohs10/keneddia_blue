import React, { useState, useEffect, useMemo } from "react";
import { colors } from "@/lib/colors/colors";
import {
  Plus,
  Edit,
  MapPin,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  Clock,
  Building2,
  Ticket,
  Search,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  getDailyOffers,
  updateDailyOfferActiveStatus,
  disableAboutUs,
  enableAboutUs,
} from "@/Api/Api";
import { toast } from "react-hot-toast";
import CreateOfferModal from "../../modals/CreateOfferModal";

function DailyOffers() {
  const [allOffers, setAllOffers] = useState([]);
  const [pageTitle, setPageTitle] = useState("Exclusive Daily Offers");
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Frontend Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  // Filter state
  const [filterStatus, setFilterStatus] = useState("ALL");

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await getDailyOffers({
        targetType: "GLOBAL",
        page: 0,
        size: 1000,
      });

      let offersData = [];
      const res = response.data?.data || response.data || response;

      if (res?.content) {
        offersData = res.content;
      } else if (Array.isArray(res)) {
        offersData = res;
      }

      const sortedOffers = [...offersData].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime();
        const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime();
        return dateB - dateA; // latest first
      });

      setAllOffers(sortedOffers);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast.error("Failed to load daily offers");
      setAllOffers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const filteredOffers = useMemo(() => {
    let result = [...allOffers];

    if (filterStatus !== "ALL") {
      const isActive = filterStatus === "ACTIVE";
      result = result.filter((offer) => offer.isActive === isActive);
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (offer) =>
          offer.title?.toLowerCase().includes(search) ||
          offer.propertyTypeName?.toLowerCase().includes(search) ||
          offer.couponCode?.toLowerCase().includes(search),
      );
    }

    return result;
  }, [allOffers, filterStatus, searchTerm]);

  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage);
  const paginatedOffers = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return filteredOffers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOffers, currentPage]);

  useEffect(() => {
    setCurrentPage(0);
  }, [filterStatus, searchTerm]);

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingOffer(null);
    setShowModal(true);
  };

  const handleStatusToggle = async (offerId, currentStatus) => {
    try {
      setStatusUpdating(offerId);
      const newStatus = !currentStatus;

      // 1. Call status update API
      await updateDailyOfferActiveStatus(offerId, newStatus);

      toast.success(`Offer ${newStatus ? "activated" : "deactivated"}`);

      // 2. Refresh data from server to ensure synchronization
      await fetchOffers();
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update status");
    } finally {
      setStatusUpdating(null);
    }
  };

  const formatExpiryDate = (dateString) => {
    if (!dateString) return "No Expiry";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(0, prev - 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));

  return (
    <div className="p-1">
      <div
        className="rounded-xl p-5 shadow-sm mb-4 border border-border/50"
        style={{ backgroundColor: colors.contentBg }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2
              className="text-xl font-bold m-0"
              style={{ color: colors.textPrimary }}
            >
              {pageTitle}
            </h2>
            <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>
              Manage property discounts • {filteredOffers.length} offers found
            </p>
          </div>

          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-transform hover:scale-[1.02] shadow-lg cursor-pointer"
            style={{ backgroundColor: colors.primary }}
          >
            <Plus size={18} /> Add New Offer
          </button>
        </div>
      </div>

      <div
        className="rounded-xl p-4 shadow-sm mb-4 border border-border/50"
        style={{ backgroundColor: colors.contentBg }}
      >
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, property type, coupon..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-primary/20"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.mainBg,
              }}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-lg border text-sm font-medium outline-none cursor-pointer"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.mainBg,
              color: colors.textPrimary,
            }}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      <div
        className="rounded-xl shadow-sm border overflow-hidden"
        style={{
          backgroundColor: colors.contentBg,
          borderColor: colors.border,
        }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2
              size={40}
              className="animate-spin"
              style={{ color: colors.primary }}
            />
            <span className="text-sm font-medium text-gray-500">
              Loading offers...
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className="border-b"
                  style={{
                    backgroundColor: colors.mainBg,
                    borderColor: colors.border,
                  }}
                >
                  <th className="text-left py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Image
                  </th>
                  <th className="text-left py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Offer Details
                  </th>
                  <th className="text-left py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Property Type
                  </th>
                  <th className="text-left py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Coupon
                  </th>
                  <th className="text-left py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Hours
                  </th>
                  <th className="text-left py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Expires
                  </th>
                  <th className="text-center py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="text-center py-4 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedOffers.map((offer) => (
                  <tr
                    key={offer.id}
                    className="border-b hover:bg-gray-50/50 transition-colors"
                    style={{ borderColor: colors.border }}
                  >
                    <td className="py-3 px-4">
                      <td className="py-3 px-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-black flex items-center justify-center">
                          {offer.image?.type === "VIDEO" ? (
                            <video
                              src={offer.image?.url}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                            />
                          ) : (
                            <img
                              src={offer.image?.url || "/api/placeholder/80/80"}
                              alt={offer.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </td>
                    </td>
                    <td className="py-3 px-4">
                      <div className="max-w-[200px]">
                        <h4
                          className="font-semibold text-sm truncate"
                          style={{ color: colors.textPrimary }}
                        >
                          {offer.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 line-clamp-1">
                          {offer.description}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase">
                        {offer.propertyTypeName || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-xs text-primary bg-primary/5 px-2 py-1 rounded border border-primary/10 w-fit">
                        <Ticket size={12} /> {offer.couponCode}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} /> {offer.availableHours}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-orange-600">
                      {formatExpiryDate(offer.expiresAt)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() =>
                          handleStatusToggle(offer.id, offer.isActive)
                        }
                        disabled={statusUpdating === offer.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer disabled:cursor-wait ${
                          offer.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-600 hover:bg-red-200"
                        }`}
                      >
                        {statusUpdating === offer.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : offer.isActive ? (
                          <ToggleRight size={16} />
                        ) : (
                          <ToggleLeft size={16} />
                        )}
                        {offer.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleEdit(offer)}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-primary hover:text-white transition-all cursor-pointer"
                      >
                        <Edit size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div
            className="flex items-center justify-between px-6 py-4 border-t bg-gray-50"
            style={{ borderColor: colors.border }}
          >
            <span className="text-xs text-gray-500">
              Page {currentPage + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 0}
                onClick={handlePrevPage}
                className="p-1.5 rounded border disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={currentPage === totalPages - 1}
                onClick={handleNextPage}
                className="p-1.5 rounded border disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <CreateOfferModal
          isOpen={showModal}
          onClose={(refresh) => {
            setShowModal(false);
            setEditingOffer(null);
            if (refresh) fetchOffers();
          }}
          editingOffer={editingOffer}
        />
      )}
    </div>
  );
}

export default DailyOffers;
