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
} from "lucide-react";
import {
  uploadEventGallery,
  getEventFilesByUploadedId,
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
      {message || (status === "success" ? "Saved successfully." : "Something went wrong.")}
    </div>
  );
}

// ─── Gallery Tab ─────────────────────────────────────────────────────────────

function GalleryTab({ eventId }) {
  const [existing, setExisting] = useState([]);
  const [stagedFiles, setStagedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [fetchStatus, setFetchStatus] = useState("loading");
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [uploadMsg, setUploadMsg] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setFetchStatus("loading");
        const res = await getEventFilesByUploadedId(eventId);
        const data = res?.data?.data ?? res?.data ?? {};
        setExisting(data.medias || []);
        setFetchStatus("idle");
      } catch {
        setFetchStatus("idle");
      }
    };
    fetchGallery();
  }, [eventId]);

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
      stagedFiles.forEach((f) => fd.append("files", f));
      const res = await uploadEventGallery(fd);
      const data = res?.data?.data ?? res?.data ?? {};
      setExisting((prev) => [...prev, ...(data.medias || [])]);
      setStagedFiles([]);
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
      setPreviewUrls([]);
      setUploadStatus("success");
      setUploadMsg(`${data.medias?.length || stagedFiles.length} image(s) uploaded.`);
    } catch {
      setUploadStatus("error");
      setUploadMsg("Upload failed. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <StatusBanner status={uploadStatus} message={uploadMsg} />

      {fetchStatus === "loading" ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : existing.length > 0 ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Uploaded ({existing.length})
          </p>
          <div className="grid grid-cols-3 gap-2">
            {existing.map((m) => (
              <div key={m.mediaId} className="relative rounded-xl overflow-hidden aspect-square bg-muted">
                <img src={m.url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          No gallery images uploaded yet.
        </p>
      )}

      {stagedFiles.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Ready to Upload ({stagedFiles.length})
          </p>
          <div className="grid grid-cols-3 gap-2">
            {previewUrls.map((url, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden aspect-square bg-muted group">
                <img src={url} alt="" className="w-full h-full object-cover" />
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

      <button
        onClick={() => inputRef.current?.click()}
        className="w-full border-2 border-dashed border-border hover:border-primary rounded-2xl py-8 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
      >
        <ImagePlus className="w-7 h-7" />
        <span className="text-sm font-semibold">Click to add images</span>
        <span className="text-xs">JPG, PNG, WebP accepted</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFilePick}
      />

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
          Upload {stagedFiles.length} Image{stagedFiles.length > 1 ? "s" : ""}
        </button>
      )}
    </div>
  );
}

// ─── Cards Tab ────────────────────────────────────────────────────────────────

function CardsTab({ eventId, propertyId, propertyTypeId }) {
  const [cardId, setCardId] = useState(undefined);
  const [fetchStatus, setFetchStatus] = useState("loading");
  const [saveStatus, setSaveStatus] = useState("idle");
  const [saveMsg, setSaveMsg] = useState("");
  const [cardImage, setCardImage] = useState(null);
  const [cardImagePreview, setCardImagePreview] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const imgInputRef = useRef(null);

  const [form, setForm] = useState({
    card1Title: "",
    card2Title: "",
    card1textField1: "",
    card1textField2: "",
    card2textField1: "",
    card2textField2: "",
  });

  useEffect(() => {
    const fetchCard = async () => {
      try {
        setFetchStatus("loading");
        const res = await getEventDetailInfoById(eventId);
        const data = res?.data?.data ?? res?.data ?? {};
        if (data?.id) {
          setCardId(data.id);
          setForm({
            card1Title: data.card1Title || "You Should Know",
            card2Title: data.card2Title || "Contactless M-Ticket",
            card1textField1: data.card1textField1 || "",
            card1textField2: data.card1textField2 || "",
            card2textField1: data.card2textField1 || "",
            card2textField2: data.card2textField2 || "",
          });
          if (data.mediaResponseDTO?.url) {
            setExistingImageUrl(data.mediaResponseDTO.url);
          }
        }
      } catch {
        // no existing card — fresh form
      } finally {
        setFetchStatus("idle");
      }
    };
    fetchCard();
  }, [eventId]);

  const setField = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCardImage(file);
    setCardImagePreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleSave = async () => {
    try {
      setSaveStatus("loading");
      const fd = new FormData();
      fd.append("propertyId", String(propertyId));
      fd.append("propertyTypeId", String(propertyTypeId ?? 1));
      fd.append("eventId", String(eventId));
      fd.append("card1Title", form.card1Title);
      fd.append("card2Title", form.card2Title);
      fd.append("card1textField1", form.card1textField1);
      fd.append("card1textField2", form.card1textField2);
      fd.append("card2textField1", form.card2textField1);
      fd.append("card2textField2", form.card2textField2);
      if (cardImage) fd.append("image", cardImage);

      if (cardId) {
        await updateEventDetailInfo(cardId, fd);
      } else {
        const res = await addEventDetailInfo(fd);
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

  return (
    <div className="space-y-6">
      <StatusBanner status={saveStatus} message={saveMsg} />

      {/* Card 1 */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-800/30 p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <Info className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-sm font-bold text-amber-800 dark:text-amber-400">Card 1 — Info</span>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Card Title
          </label>
          <input
            value={form.card1Title}
            onChange={setField("card1Title")}
            className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Bullet Point 1
            </label>
            <input
              value={form.card1textField1}
              onChange={setField("card1textField1")}
              placeholder="e.g. Arrive 30 minutes before start"
              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Bullet Point 2
            </label>
            <input
              value={form.card1textField2}
              onChange={setField("card1textField2")}
              placeholder="e.g. Valid ID proof required"
              className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </div>

      {/* Card 2 */}
      <div className="rounded-2xl border border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-800/30 p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
            <Ticket className="w-4 h-4 text-green-600" />
          </div>
          <span className="text-sm font-bold text-green-800 dark:text-green-400">Card 2 — Ticket Info</span>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Card Title
          </label>
          <input
            value={form.card2Title}
            onChange={setField("card2Title")}
            className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Description Line 1
          </label>
          <textarea
            value={form.card2textField1}
            onChange={setField("card2textField1")}
            rows={2}
            placeholder="e.g. Instant delivery via SMS and email..."
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Description Line 2{" "}
            <span className="normal-case text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            value={form.card2textField2}
            onChange={setField("card2textField2")}
            placeholder="Additional info..."
            className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Optional image */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Supplementary Image{" "}
          {/* <span className="normal-case font-normal">(optional)</span> */}
        </p>

        {(cardImagePreview || existingImageUrl) && (
          <div
            className="relative w-full rounded-xl overflow-hidden border border-border"
            style={{ height: 160 }}
          >
            <img
              src={cardImagePreview || existingImageUrl}
              alt="Card image"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => {
                if (cardImagePreview) URL.revokeObjectURL(cardImagePreview);
                setCardImage(null);
                setCardImagePreview("");
              }}
              className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <button
          onClick={() => imgInputRef.current?.click()}
          className="w-full border-2 border-dashed border-border hover:border-primary rounded-xl py-5 flex flex-col items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
        >
          <ImagePlus className="w-5 h-5" />
          <span className="text-xs font-semibold">
            {cardImagePreview || existingImageUrl ? "Replace image" : "Upload image"}
          </span>
        </button>
        <input
          ref={imgInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImagePick}
        />
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

// ─── Main Modal ───────────────────────────────────────────────────────────────

function EventExtraInfoModal({ isOpen, onClose, eventId, propertyId, propertyTypeId }) {
  const [activeTab, setActiveTab] = useState("gallery");

  useEffect(() => {
    if (isOpen) setActiveTab("gallery");
  }, [isOpen]);

  if (!isOpen) return null;

  const tabs = [
    { key: "gallery", label: "Event Gallery", icon: <Images className="w-4 h-4" /> },
    { key: "cards", label: "Info Cards", icon: <FileEdit className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div className="fixed inset-y-0 right-0 z-[160] w-full max-w-lg flex flex-col bg-background shadow-2xl border-l border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
          <div>
            <h2 className="text-base font-bold text-foreground">Event Extra Info</h2>
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
    </>
  );
}

export default EventExtraInfoModal;