import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2,
  MapPinned,
  RefreshCw,
  Save,
  Trash2,
  Power,
  Star,
  MessageSquare,
  Download,
  Users,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  createPropertyGoogleMapping,
  deletePropertyGoogleMapping,
  getGooglePlaceDetails,
  getPropertyGoogleMappingByPropertyId,
  syncGoogleReviewsByPropertyId,
  togglePropertyGoogleMappingStatus,
  updatePropertyGoogleMapping,
  getGuestExperienceReviews,
  updateGuestExperienceReview,
} from "@/Api/externalApi";
import { showError, showSuccess } from "@/lib/toasters/toastUtils";
import { deleteGuestExperience } from "@/Api/Api";
const inputClassName =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10";

const unwrapResponse = (response) =>
  response?.data?.data ?? response?.data ?? response ?? null;

const GOOGLE_PLACE_DETAILS_API_KEY = (
  import.meta.env.VITE_GOOGLE_PLACE_DETAILS_API_KEY || ""
).trim();

const normalizeMapping = (item) => {
  if (!item || typeof item !== "object") return null;

  return {
    id: item.id ?? null,
    propertyId: item.propertyId ?? null,
    placeId: item.placeId ?? "",
    enabled:
      typeof item.enabled === "boolean"
        ? item.enabled
        : typeof item.isActive === "boolean"
          ? item.isActive
          : true,
  };
};

// ── Star Rating display ────────────────────────────────────────────────────
function StarRating({ rating }) {
  const value = Number(rating) || 0;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={12}
          className={
            star <= Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "fill-gray-200 text-gray-200"
          }
        />
      ))}
    </div>
  );
}

// ── Guest Reviews Section ──────────────────────────────────────────────────
function GuestReviewsSection({ propertyId }) {
  const [source, setSource] = useState("USER");
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  // Track which review ids are currently being toggled or deleted
  const [togglingIds, setTogglingIds] = useState(new Set());
  const [deletingIds, setDeletingIds] = useState(new Set());

  const fetchReviews = useCallback(async (selectedSource) => {
    if (!propertyId) {
      showError("Property id is missing");
      return;
    }
    setReviewsLoading(true);
    try {
      const response = await getGuestExperienceReviews({
        propertyId,
        source: selectedSource,
      });
      const payload = unwrapResponse(response);
      setReviews(Array.isArray(payload) ? payload : payload ? [payload] : []);
      setHasFetched(true);
    } catch (error) {
      showError(
        error?.response?.data?.message || "Failed to fetch guest reviews",
      );
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [propertyId]);

  const handleSourceChange = (newSource) => {
    setSource(newSource);
    if (hasFetched) fetchReviews(newSource);
  };

  const handleToggleActive = async (review) => {
    if (!review.id) return;
    const newStatus = !review.isActive;

    // Optimistic update
    setReviews((prev) =>
      prev.map((r) => (r.id === review.id ? { ...r, isActive: newStatus } : r)),
    );
    setTogglingIds((prev) => new Set(prev).add(review.id));

    try {
      await updateGuestExperienceReview(review.id, { isActive: newStatus });
      showSuccess(`Review ${newStatus ? "enabled" : "disabled"} successfully`);
    } catch (error) {
      // Revert optimistic update on failure
      setReviews((prev) =>
        prev.map((r) =>
          r.id === review.id ? { ...r, isActive: !newStatus } : r,
        ),
      );
      showError(
        error?.response?.data?.message || "Failed to update review status",
      );
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(review.id);
        return next;
      });
    }
  };

  const handleDeleteReview = async (review) => {
    if (!review.id) return;
    if (!window.confirm("Delete this review? This cannot be undone.")) return;

    setDeletingIds((prev) => new Set(prev).add(review.id));
    try {
      await deleteGuestExperience(review.id);
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
      showSuccess("Review deleted successfully");
    } catch (error) {
      showError(
        error?.response?.data?.message || "Failed to delete review",
      );
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(review.id);
        return next;
      });
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <Users size={15} className="text-violet-500" />
            Guest Experience Reviews
          </p>
          <p className="mt-1 text-sm text-gray-500">
            View reviews submitted by guests or pulled from Google.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Source filter */}
          <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold">
            {["USER", "GOOGLE"].map((s) => (
              <button
                key={s}
                onClick={() => handleSourceChange(s)}
                className={`px-4 py-2 transition-colors ${
                  source === s
                    ? "bg-violet-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {s === "USER" ? "👤 User" : "🌐 Google"}
              </button>
            ))}
          </div>

          {/* Fetch button */}
          <button
            onClick={() => fetchReviews(source)}
            disabled={reviewsLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {reviewsLoading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Download size={13} />
                Fetch Reviews
              </>
            )}
          </button>

          {/* Count badge */}
          {hasFetched && !reviewsLoading && (
            <span className="rounded-full bg-violet-50 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-violet-700">
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      {!hasFetched && !reviewsLoading ? (
        <div className="py-8 text-center text-sm text-gray-400">
          Select a source and click <span className="font-semibold">Fetch Reviews</span> to load.
        </div>
      ) : reviewsLoading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-400">
          <Loader2 size={16} className="animate-spin" />
          Fetching {source === "USER" ? "user" : "Google"} reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">
          No {source === "USER" ? "user" : "Google"} reviews found for this property.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {reviews.map((review, index) => {
            // Normalize fields — handle both USER and GOOGLE shapes
            const authorName =
              review.author ||
              review.author_name ||
              review.guestName ||
              review.reviewerName ||
              "Anonymous";
            const reviewText =
              review.description ||
              review.text ||
              review.review ||
              review.comment ||
              review.reviewText ||
              "No review text";
            const rating = review.rating ?? review.overallRating ?? null;
            const timeLabel =
              review.createdAt ||
              review.relative_time_description ||
              review.reviewDate ||
              null;
            const sourceTag = review.source || source;
            const isToggling = togglingIds.has(review.id);
            const isDeleting = deletingIds.has(review.id);

            return (
              <div
                key={review.id || review.author_url || `review-${index}`}
                className={`rounded-2xl border p-4 transition-opacity ${
                  review.isActive
                    ? "border-gray-100 bg-gray-50"
                    : "border-red-100 bg-red-50/40"
                }`}
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-gray-900">{authorName}</p>
                      {review.title && (
                        <span className="text-xs text-gray-500 italic">"{review.title.trim()}"</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {timeLabel && (
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                          {typeof timeLabel === "string" && timeLabel.includes("T")
                            ? new Date(timeLabel).toLocaleDateString()
                            : timeLabel}
                        </p>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          sourceTag === "GOOGLE"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-violet-50 text-violet-600"
                        }`}
                      >
                        {sourceTag}
                      </span>
                      {/* Active status badge — reflects live state */}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          review.isActive
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        {review.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {(review.authorEmail || review.authorPhone) && (
                      <p className="text-[11px] text-gray-400">
                        {review.authorEmail}
                        {review.authorEmail && review.authorPhone ? " · " : ""}
                        {review.authorPhone}
                      </p>
                    )}
                  </div>

                  {/* Right side: rating + toggle */}
                  <div className="flex flex-col items-end gap-2">
                    {rating !== null && (
                      <div className="flex flex-col items-end gap-1">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          {rating}
                        </div>
                        <StarRating rating={rating} />
                      </div>
                    )}

                    {/* Enable / Disable toggle — only for reviews that have an id */}
                    {review.id && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(review)}
                          disabled={isToggling || isDeleting}
                          title={review.isActive ? "Disable review" : "Enable review"}
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                            review.isActive
                              ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                              : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {isToggling ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : review.isActive ? (
                            <ToggleRight size={13} />
                          ) : (
                            <ToggleLeft size={13} />
                          )}
                          {review.isActive ? "Enabled" : "Disabled"}
                        </button>

                        <button
                          onClick={() => handleDeleteReview(review)}
                          disabled={isDeleting || isToggling}
                          title="Delete review"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-bold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">
                  {reviewText}
                </p>

                {/* Media thumbnails */}
                {Array.isArray(review.mediaList) && review.mediaList.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {review.mediaList.map((media) =>
                      media.type === "IMAGE" ? (
                        <img
                          key={media.mediaId}
                          src={media.url}
                          alt={media.alt || media.fileName || "media"}
                          className="h-20 w-20 rounded-xl object-cover border border-gray-200"
                        />
                      ) : null,
                    )}
                  </div>
                )}

                {review.videoUrl && (
                  <a
                    href={review.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    🎥 View Video
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main ConfigTab ─────────────────────────────────────────────────────────
function ConfigTab({ propertyData }) {
  const propertyId = propertyData?.id;
  const [mapping, setMapping] = useState(null);
  const [form, setForm] = useState({ placeId: "" });
  const [placeDetails, setPlaceDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const currentStatusLabel = useMemo(() => {
    if (!mapping) return "Not configured";
    return mapping.enabled ? "Enabled" : "Disabled";
  }, [mapping]);

  const loadMapping = useCallback(async () => {
    if (!propertyId) {
      setMapping(null);
      setForm({ placeId: "" });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await getPropertyGoogleMappingByPropertyId(propertyId);
      const payload = unwrapResponse(response);
      const list = Array.isArray(payload) ? payload : payload ? [payload] : [];
      const nextMapping =
        list
          .map(normalizeMapping)
          .filter(Boolean)
          .find((item) => Number(item.propertyId) === Number(propertyId)) ??
        list.map(normalizeMapping).filter(Boolean)[0] ??
        null;

      setMapping(nextMapping);
      setForm({ placeId: nextMapping?.placeId ?? "" });
      setPlaceDetails(null);
    } catch (error) {
      setMapping(null);
      setForm({ placeId: "" });
      setPlaceDetails(null);
      showError(
        error?.response?.data?.message || "Failed to load property config",
      );
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    loadMapping();
  }, [loadMapping]);

  const loadPlaceDetails = useCallback(async () => {
    const placeId = form.placeId.trim();

    if (!placeId) {
      showError("Place id is required to fetch place details");
      return;
    }

    if (!GOOGLE_PLACE_DETAILS_API_KEY) {
      showError("VITE_GOOGLE_PLACE_DETAILS_API_KEY is missing");
      return;
    }

    setDetailsLoading(true);
    try {
      const response = await getGooglePlaceDetails({
        placeId,
        key: GOOGLE_PLACE_DETAILS_API_KEY,
      });
      const payload = unwrapResponse(response);

      if (payload?.status && payload.status !== "OK") {
        throw new Error(payload?.status || "Google API request failed");
      }

      setPlaceDetails(payload?.result ?? null);
      showSuccess("Google place details loaded");
    } catch (error) {
      setPlaceDetails(null);
      showError(
        error?.response?.data?.error_message ||
          error?.message ||
          "Failed to load Google place details",
      );
    } finally {
      setDetailsLoading(false);
    }
  }, [form.placeId]);

  const handleSave = async () => {
    const placeId = form.placeId.trim();

    if (!propertyId) {
      showError("Property id is missing");
      return;
    }

    if (!placeId) {
      showError("Place id is required");
      return;
    }

    setSaving(true);
    try {
      const payload = { propertyId, placeId };

      if (mapping?.id) {
        await updatePropertyGoogleMapping(mapping.id, payload);
        showSuccess("Google place mapping updated");
      } else {
        await createPropertyGoogleMapping(payload);
        showSuccess("Google place mapping created");
      }

      await loadMapping();
    } catch (error) {
      showError(
        error?.response?.data?.message || "Failed to save property config",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!mapping?.id) {
      showError("Create the mapping before changing status");
      return;
    }

    setToggling(true);
    try {
      await togglePropertyGoogleMappingStatus(mapping.id, !mapping.enabled);
      showSuccess(
        `Mapping ${mapping.enabled ? "disabled" : "enabled"} successfully`,
      );
      await loadMapping();
    } catch (error) {
      showError(
        error?.response?.data?.message || "Failed to update mapping status",
      );
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!mapping?.id) {
      showError("No mapping found to delete");
      return;
    }

    if (!window.confirm("Delete this Google place mapping?")) return;

    setDeleting(true);
    try {
      await deletePropertyGoogleMapping(mapping.id);
      showSuccess("Google place mapping deleted");
      await loadMapping();
    } catch (error) {
      showError(
        error?.response?.data?.message || "Failed to delete property config",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleSyncReviews = async () => {
    if (!propertyId) {
      showError("Property id is missing");
      return;
    }

    setSyncing(true);
    try {
      await syncGoogleReviewsByPropertyId(propertyId);
      showSuccess("Google reviews synced successfully");
    } catch (error) {
      showError(
        error?.response?.data?.message || "Failed to sync Google reviews",
      );
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-400">
        <Loader2 size={16} className="animate-spin" />
        Loading config...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-gradient-to-r from-slate-50 to-white p-5 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
            <MapPinned size={16} className="text-blue-600" />
            External Configuration
          </div>
          <p className="text-sm text-gray-500">
            Manage Google Place mapping for this property.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
              mapping
                ? mapping.enabled
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {currentStatusLabel}
          </span>
          {mapping?.id ? (
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-blue-700">
              Mapping #{mapping.id}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">
            Property Id
          </p>
          <p className="mt-2 text-lg font-bold text-gray-900">{propertyId}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">
            Property
          </p>
          <p className="mt-2 text-lg font-bold text-gray-900">
            {propertyData?.propertyName || "Unnamed Property"}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">
            Current Place Id
          </p>
          <p className="mt-2 break-all text-sm font-semibold text-gray-700">
            {mapping?.placeId || "Not set"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-gray-400">
              Place Id
            </label>
            <input
              type="text"
              value={form.placeId}
              onChange={(event) => setForm({ placeId: event.target.value })}
              placeholder="ChIJ123XYZ"
              className={inputClassName}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-gray-400">
              Status
            </label>
            <div className="flex h-[46px] items-center rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-700">
              {currentStatusLabel}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={15} />
                {mapping?.id ? "Update Mapping" : "Create Mapping"}
              </>
            )}
          </button>

          <button
            onClick={loadMapping}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={15} />
            Refresh
          </button>

          {/* <button
            onClick={loadPlaceDetails}
            disabled={detailsLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {detailsLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Fetching...
              </>
            ) : (
              <>
                <Download size={15} />
                Fetch Place Details
              </>
            )}
          </button> */}

          <button
            onClick={handleToggleStatus}
            disabled={!mapping?.id || toggling}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {toggling ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Power size={15} />
                {mapping?.enabled ? "Disable" : "Enable"}
              </>
            )}
          </button>

          <button
            onClick={handleSyncReviews}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-4 py-2.5 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {syncing ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw size={15} />
                Sync Reviews
              </>
            )}
          </button>

          <button
            onClick={handleDelete}
            disabled={!mapping?.id || deleting}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={15} />
                Delete
              </>
            )}
          </button>
        </div>
      </div>

      {/* Google Place Details */}
      {/* <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <p className="text-sm font-bold text-gray-900">Google Place Details</p>
            <p className="mt-1 text-sm text-gray-500">
              Preview the place name, rating, and recent reviews for the mapped place id.
            </p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-gray-600">
            {placeDetails ? "Loaded" : "Not loaded"}
          </span>
        </div>

        {placeDetails ? (
          <div className="space-y-5 pt-5">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                  Place Name
                </p>
                <p className="mt-2 text-base font-bold text-gray-900">
                  {placeDetails?.name || "N/A"}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                  Rating
                </p>
                <p className="mt-2 flex items-center gap-2 text-base font-bold text-gray-900">
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                  {placeDetails?.rating ?? "N/A"}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                  Reviews
                </p>
                <p className="mt-2 flex items-center gap-2 text-base font-bold text-gray-900">
                  <MessageSquare size={16} className="text-blue-600" />
                  {Array.isArray(placeDetails?.reviews)
                    ? placeDetails.reviews.length
                    : 0}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {(placeDetails?.reviews || []).map((review, index) => (
                <div
                  key={`${review.author_url || review.author_name || "review"}-${index}`}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {review.author_name || "Anonymous"}
                      </p>
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                        {review.relative_time_description || "Unknown time"}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      {review.rating ?? "N/A"}
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">
                    {review.text || "No review text"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-8 text-sm text-gray-400">
            No place details loaded yet.
          </div>
        )}
      </div> */}

      {/* ── Guest Experience Reviews ── */}
      <GuestReviewsSection propertyId={propertyId} />
    </div>
  );
}

export default ConfigTab;