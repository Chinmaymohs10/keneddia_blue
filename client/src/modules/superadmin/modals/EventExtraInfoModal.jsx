import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ImagePlus,
  Trash2,
  Info,
  Ticket,
  FileEdit,
  Images,
  Pencil,
} from "lucide-react";
import {
  uploadEventGallery,
  getEventFilesByUploadedId,
  replaceEventGalleryMedia,
  deleteEventGalleryMedia,
  addEventDetailInfo,
  getEventDetailInfoById,
  updateEventDetailInfo,
} from "@/Api/Api";

// ─── Status Banner ────────────────────────────────────────────────────────────

function StatusBanner({ status, message }) {
  if (status === "idle" || status === "loading") return null;
  return (
    <div
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium mb-4 ${
        status === "success"
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-red-50 text-red-700 border border-red-200"
      }`}
    >
      {status === "success" ? (
        <CheckCircle2 className="w-4 h-4 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 shrink-0" />
      )}
      {message ||
        (status === "success"
          ? "Saved successfully."
          : "Something went wrong.")}
    </div>
  );
}

// ─── Gallery Tab ─────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { value: "hero_slider", label: "Hero Slider" },
  { value: "past_event", label: "Past Event" },
];
const MEDIA_TYPES = [
  { value: "image", label: "Images", accept: "image/*" },
  { value: "video", label: "Videos", accept: "video/*" },
];
const PAGE_SIZE = 5;

function GalleryTab({ eventId }) {
  const [existing, setExisting] = useState([]);
  const [stagedFiles, setStagedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("hero_slider");
  const [selectedMediaType, setSelectedMediaType] = useState("image");
  const [fetchStatus, setFetchStatus] = useState("loading");
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [uploadMsg, setUploadMsg] = useState("");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [page, setPage] = useState(1);
  const inputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const replacingRef = useRef(null);
  const [replacingId, setReplacingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const openReplaceFilePicker = (groupId, mediaId) => {
    replacingRef.current = { groupId, mediaId };
    setReplacingId(mediaId);
    replaceInputRef.current?.click();
  };

  const handleReplaceFilePick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !replacingRef.current) return;
    const { groupId, mediaId } = replacingRef.current;
    try {
      setUploadStatus("loading");
      const fd = new FormData();
      fd.append("file", file);
      const res = await replaceEventGalleryMedia(groupId, mediaId, fd);
      const updated = res?.data?.data ?? res?.data ?? null;
      if (updated) {
        setExisting((prev) =>
          prev.map((m) =>
            m.mediaId === mediaId ? { ...m, url: updated.url ?? m.url } : m,
          ),
        );
      }
      setUploadStatus("success");
      setUploadMsg("Media replaced successfully.");
    } catch {
      setUploadStatus("error");
      setUploadMsg("Replace failed. Please try again.");
    } finally {
      setReplacingId(null);
      replacingRef.current = null;
    }
  };

  const handleDeleteMedia = async (groupId, mediaId) => {
    if (!groupId || !mediaId) {
      setUploadStatus("error");
      setUploadMsg("Unable to delete this media. Missing gallery media id.");
      return;
    }

    if (!window.confirm("Delete this event media?")) return;

    try {
      setDeletingId(mediaId);
      setUploadStatus("loading");
      await deleteEventGalleryMedia(groupId, mediaId);
      setExisting((prev) => prev.filter((m) => m.mediaId !== mediaId));
      setUploadStatus("success");
      setUploadMsg("Media deleted successfully.");
    } catch {
      setUploadStatus("error");
      setUploadMsg("Delete failed. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setFetchStatus("loading");
        const res = await getEventFilesByUploadedId(eventId);
        const data = res?.data?.data ?? res?.data ?? {};
        const mediaList = Array.isArray(data)
          ? data.flatMap((d) =>
              (d.medias || []).map((m) => ({
                ...m,
                category: d.category,
                groupId: d.id,
              })),
            )
          : data.medias || [];
        setExisting(mediaList);
      } catch {
      } finally {
        setFetchStatus("idle");
      }
    };
    fetchGallery();
  }, [eventId]);

  const currentAccept =
    MEDIA_TYPES.find((t) => t.value === selectedMediaType)?.accept ?? "image/*";

  const handleFilePick = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setStagedFiles((prev) => [...prev, ...files]);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls((prev) => [...prev, ...urls]);
    e.target.value = "";
  };

  const removeStaged = (i) => {
    URL.revokeObjectURL(previewUrls[i]);
    setStagedFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviewUrls((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleUpload = async () => {
    if (!stagedFiles.length) return;
    try {
      setUploadStatus("loading");
      const fd = new FormData();
      fd.append("eventId", String(eventId));
      fd.append("category", selectedCategory);
      stagedFiles.forEach((f) => fd.append("files", f));
      const res = await uploadEventGallery(fd);
      const data = res?.data?.data ?? res?.data ?? {};
      const uploaded = (data.medias || []).map((m) => ({
        ...m,
        category: selectedCategory,
        groupId: data.id,
      }));
      setExisting((prev) => [...prev, ...uploaded]);
      setStagedFiles([]);
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
      setPreviewUrls([]);
      setUploadStatus("success");
      setUploadMsg(
        `${uploaded.length || stagedFiles.length} file(s) uploaded.`,
      );
    } catch {
      setUploadStatus("error");
      setUploadMsg("Upload failed. Please try again.");
    }
  };

  // Grouped + paginated existing
  const grouped = existing.reduce((acc, m) => {
    const cat = m.category || "uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(m);
    return acc;
  }, {});

  const allExisting = existing; // for total count
  const totalPages = Math.ceil(allExisting.length / PAGE_SIZE);
  const pagedItems = allExisting.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  // Re-group paged items
  const pagedGrouped = pagedItems.reduce((acc, m) => {
    const cat = m.category || "uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(m);
    return acc;
  }, {});

  const isVideo = (url = "") => /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);

  return (
    <div className="space-y-5">
      <StatusBanner status={uploadStatus} message={uploadMsg} />

      {/* ── Upload Section (always on top) ── */}
      <div className="rounded-2xl border border-border bg-secondary/20 p-5 space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Upload Media
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Media Type
            </label>
            <select
              value={selectedMediaType}
              onChange={(e) => setSelectedMediaType(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
            >
              {MEDIA_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-border hover:border-primary rounded-2xl py-6 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ImagePlus className="w-7 h-7" />
          <span className="text-sm font-semibold">
            Click to add {selectedMediaType === "video" ? "videos" : "images"}
          </span>
          <span className="text-xs">
            {selectedMediaType === "video"
              ? "MP4, WebM, MOV accepted"
              : "JPG, PNG, WebP accepted"}
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={currentAccept}
          multiple
          className="hidden"
          onChange={handleFilePick}
        />
        <input
          ref={replaceInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleReplaceFilePick}
        />

        {/* Staged previews */}
        {stagedFiles.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Ready to Upload ({stagedFiles.length})
            </p>
            <div className="grid grid-cols-4 gap-2">
              {previewUrls.map((url, i) => (
                <div
                  key={i}
                  className="relative rounded-xl overflow-hidden aspect-square bg-muted group"
                >
                  {stagedFiles[i]?.type?.startsWith("video") ? (
                    <video
                      src={url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                  <button
                    onClick={() => removeStaged(i)}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {stagedFiles.length > 0 && (
          <button
            onClick={handleUpload}
            disabled={uploadStatus === "loading"}
            className="w-full py-3 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60 text-sm uppercase tracking-wider"
          >
            {uploadStatus === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload {stagedFiles.length}{" "}
            {selectedMediaType === "video" ? "Video" : "Image"}
            {stagedFiles.length > 1 ? "s" : ""} as{" "}
            {CATEGORY_OPTIONS.find((c) => c.value === selectedCategory)?.label}
          </button>
        )}
      </div>

      {/* ── Existing Gallery (collapsible) ── */}
      <div className="rounded-2xl border border-border overflow-hidden">
        <button
          onClick={() => setGalleryOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3.5 bg-secondary/30 hover:bg-secondary/50 transition-colors"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Uploaded Media ({existing.length})
          </span>
          <span className="text-muted-foreground text-xs">
            {galleryOpen ? "▲ Hide" : "▼ Show"}
          </span>
        </button>

        {galleryOpen && (
          <div className="p-5 space-y-5">
            {fetchStatus === "loading" ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : existing.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No media uploaded yet.
              </p>
            ) : (
              <>
                {Object.entries(pagedGrouped).map(([cat, medias]) => (
                  <div key={cat}>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-secondary text-foreground normal-case font-semibold text-[11px]">
                        {CATEGORY_OPTIONS.find((c) => c.value === cat)?.label ||
                          cat}
                      </span>
                      <span className="text-muted-foreground font-normal">
                        ({medias.length})
                      </span>
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {medias.map((m) => (
                        <div
                          key={m.mediaId}
                          className="relative rounded-xl overflow-hidden aspect-square bg-muted group"
                        >
                          {isVideo(m.url) ? (
                            <video
                              src={m.url}
                              className="w-full h-full object-cover"
                              muted
                            />
                          ) : (
                            <img
                              src={m.url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                          <button
                            onClick={() =>
                              openReplaceFilePicker(m.groupId, m.mediaId)
                            }
                            disabled={
                              replacingId === m.mediaId ||
                              deletingId === m.mediaId
                            }
                            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Replace media"
                          >
                            {replacingId === m.mediaId ? (
                              <Loader2 className="w-5 h-5 text-white animate-spin" />
                            ) : (
                              <Pencil className="w-5 h-5 text-white" />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMedia(m.groupId, m.mediaId);
                            }}
                            disabled={
                              deletingId === m.mediaId ||
                              replacingId === m.mediaId
                            }
                            className="absolute top-1.5 right-1.5 z-10 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-70"
                            title="Delete media"
                          >
                            {deletingId === m.mediaId ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold disabled:opacity-40 hover:bg-secondary transition-colors"
                    >
                      ← Prev
                    </button>
                    <span className="text-xs text-muted-foreground">
                      Page {page} / {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold disabled:opacity-40 hover:bg-secondary transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Cards Tab ────────────────────────────────────────────────────────────────

function CardsTab({ eventId, propertyId, propertyTypeId }) {
  const [cardId, setCardId] = useState(undefined);
  const [fetchStatus, setFetchStatus] = useState("loading");
  const [saveStatus, setSaveStatus] = useState("idle");
  const [saveMsg, setSaveMsg] = useState("");

  const [form, setForm] = useState({
    card1Title: "",
    card2Title: "",
    card1textField1: "",
    card1textField2: "",
    card2textField1: "",
    card2textField2: "",
    startTime: "",
    endTime: "",
    locationName: "",
    locationUrl: "",
    price: "",
    textField: "",
  });

  useEffect(() => {
    const fetchCard = async () => {
      try {
        setFetchStatus("loading");
        const res = await getEventDetailInfoById(eventId);

        // ── API returns an array — pick the latest entry (highest id) ──
        const rawList = res?.data?.data ?? res?.data ?? res ?? [];
        const list = Array.isArray(rawList)
          ? rawList
          : rawList
            ? [rawList]
            : [];

        // Sort descending by id → first item is the latest
        const sorted = [...list].sort((a, b) => b.id - a.id);
        const latest = sorted[0] ?? null;

        if (latest?.id) {
          setCardId(latest.id);
          setForm({
            card1Title: latest.card1Title || "",
            card2Title: latest.card2Title || "",
            card1textField1: latest.card1textField1 || "",
            card1textField2: latest.card1textField2 || "",
            card2textField1: latest.card2textField1 || "",
            card2textField2: latest.card2textField2 || "",
            // strip seconds from "HH:MM:SS" → "HH:MM" for <input type="time">
            startTime: latest.startTime?.slice(0, 5) || "",
            endTime: latest.endTime?.slice(0, 5) || "",
            locationName: latest.locationName || "",
            locationUrl: latest.locationUrl || "",
            price: latest.price != null ? String(latest.price) : "",
            textField: latest.textField || "",
          });
        }
      } catch {
        // fresh form — leave defaults
      } finally {
        setFetchStatus("idle");
      }
    };
    fetchCard();
  }, [eventId]);

  const setField = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    try {
      setSaveStatus("loading");
      const payload = {
        propertyId: String(propertyId),
        propertyTypeId: String(propertyTypeId ?? 1),
        eventId: String(eventId),
        card1Title: form.card1Title,
        card2Title: form.card2Title,
        card1textField1: form.card1textField1,
        card1textField2: form.card1textField2,
        card2textField1: form.card2textField1,
        card2textField2: form.card2textField2,
        startTime: form.startTime,
        endTime: form.endTime,
        locationName: form.locationName,
        locationUrl: form.locationUrl,
        price: form.price,
        textField: form.textField,
      };

      if (cardId) {
        await updateEventDetailInfo(cardId, payload);
      } else {
        const res = await addEventDetailInfo(payload);
        const data = res?.data?.data ?? res?.data ?? {};
        if (data?.id) setCardId(data.id);
      }

      setSaveStatus("success");
      setSaveMsg("Card info saved successfully.");
    } catch {
      setSaveStatus("error");
      setSaveMsg("Save failed. Please try again.");
    }
  };

  if (fetchStatus === "loading") {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const inputCls =
    "w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30";
  const labelCls =
    "text-[10px] font-bold uppercase tracking-widest text-muted-foreground";

  return (
    <div className="space-y-5">
      <StatusBanner status={saveStatus} message={saveMsg} />

      {/* Event Meta */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 space-y-4">
        <p className="text-sm font-bold text-blue-800">
          Event Details
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className={labelCls}>Start Time</label>
            <input
              type="time"
              value={form.startTime}
              onChange={setField("startTime")}
              className={inputCls}
            />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>End Time</label>
            <input
              type="time"
              value={form.endTime}
              onChange={setField("endTime")}
              className={inputCls}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelCls}>Location Name</label>
          <input
            value={form.locationName}
            onChange={setField("locationName")}
            placeholder="e.g. Ironberg"
            className={inputCls}
          />
        </div>

        <div className="space-y-1">
          <label className={labelCls}>Location URL</label>
          <input
            value={form.locationUrl}
            onChange={setField("locationUrl")}
            placeholder="e.g. www.whosme.com"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className={labelCls}>Price</label>
            <input
              type="number"
              value={form.price}
              onChange={setField("price")}
              placeholder="e.g. 9999"
              className={inputCls}
            />
          </div>
          <div className="space-y-1">
            <label className={labelCls}>Price Label</label>
            <input
              value={form.textField}
              onChange={setField("textField")}
              placeholder="e.g. onwards"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Card 1 */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-100">
            <Info className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-sm font-bold text-amber-800">
            Card 1 — Info
          </span>
        </div>

        <div className="space-y-1">
          <label className={labelCls}>Card Title</label>
          <input
            value={form.card1Title}
            onChange={setField("card1Title")}
            className={inputCls}
          />
        </div>

        <div className="space-y-1">
          <label className={labelCls}>Bullet Point 1</label>
          <input
            value={form.card1textField1}
            onChange={setField("card1textField1")}
            placeholder="e.g. Arrive 30 minutes before start"
            className={inputCls}
          />
        </div>
        <div className="space-y-1">
          <label className={labelCls}>Bullet Point 2</label>
          <input
            value={form.card1textField2}
            onChange={setField("card1textField2")}
            placeholder="e.g. Valid ID proof required"
            className={inputCls}
          />
        </div>
      </div>

      {/* Card 2 */}
      <div className="rounded-2xl border border-green-200 bg-green-50/50 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-green-100">
            <Ticket className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-sm font-bold text-green-800">
            Card 2 — Ticket Info
          </span>
        </div>

        <div className="space-y-1">
          <label className={labelCls}>Card Title</label>
          <input
            value={form.card2Title}
            onChange={setField("card2Title")}
            className={inputCls}
          />
        </div>

        <div className="space-y-1">
          <label className={labelCls}>Description Line 1</label>
          <textarea
            value={form.card2textField1}
            onChange={setField("card2textField1")}
            rows={2}
            placeholder="e.g. Instant delivery via SMS and email..."
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        <div className="space-y-1">
          <label className={labelCls}>
            Description Line 2{" "}
            <span className="normal-case font-normal">(optional)</span>
          </label>
          <input
            value={form.card2textField2}
            onChange={setField("card2textField2")}
            placeholder="Additional info..."
            className={inputCls}
          />
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saveStatus === "loading"}
        className="w-full py-3.5 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60 text-sm uppercase tracking-wider"
      >
        {saveStatus === "loading" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileEdit className="w-4 h-4" />
        )}
        {cardId ? "Update Card Info" : "Save Card Info"}
      </button>
    </div>
  );
}

// ─── Main Modal (Popup) ───────────────────────────────────────────────────────

function EventExtraInfoModal({
  isOpen,
  onClose,
  eventId,
  propertyId,
  propertyTypeId,
}) {
  const [activeTab, setActiveTab] = useState("gallery");

  useEffect(() => {
    if (isOpen) setActiveTab("gallery");
  }, [isOpen]);

  if (!isOpen) return null;

  const tabs = [
    {
      key: "gallery",
      label: "Event Gallery",
      icon: <Images className="w-4 h-4" />,
    },
    {
      key: "cards",
      label: "Info Cards",
      icon: <FileEdit className="w-4 h-4" />,
    },
  ];

  return (
    <div className="admin-modal-overlay fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="admin-modal-surface relative w-full max-w-4xl max-h-[95vh] flex flex-col rounded-2xl shadow-2xl" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Event Extra Info
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage gallery &amp; info cards for this event
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 py-3 border-b border-border shrink-0 bg-secondary/30">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {activeTab === "gallery" ? (
            <GalleryTab eventId={eventId} />
          ) : (
            <CardsTab
              eventId={eventId}
              propertyId={propertyId}
              propertyTypeId={propertyTypeId}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default EventExtraInfoModal;
