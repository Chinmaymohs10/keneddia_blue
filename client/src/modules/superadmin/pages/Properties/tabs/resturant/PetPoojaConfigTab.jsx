import { useCallback, useEffect, useState } from "react";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  PencilSquareIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { showError, showSuccess } from "@/lib/toasters/toastUtils";
import {
  createPropertyPetPooja,
  getPropertyPetPoojaByPropertyId,
  updatePropertyPetPooja,
  togglePropertyPetPoojaStatus,
  fetchPetPoojaMenus,
} from "@/Api/externalApi";

const unwrapResponse = (res) => res?.data?.data ?? res?.data ?? res ?? null;

// ─── Field definitions ────────────────────────────────────────────────────────
const CREDENTIAL_FIELDS = [
  { key: "restID",        label: "Rest ID",       placeholder: "e.g. hai3dyc2" },
  { key: "appKey",        label: "App Key",        placeholder: "e.g. 4nzqmj6r5hk..." },
  { key: "appSecret",     label: "App Secret",     placeholder: "e.g. 6b7078d729..." },
  { key: "accessToken",   label: "Access Token",   placeholder: "e.g. dcd6f224d9..." },
];

const emptyForm = { restID: "", appKey: "", appSecret: "", accessToken: "" };

// ─── Credential Section ───────────────────────────────────────────────────────
function CredentialSection({ propertyId }) {
  const [config, setConfig]       = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [editing, setEditing]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [toggling, setToggling]   = useState(false);

  const fetchConfig = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    try {
      const res = await getPropertyPetPoojaByPropertyId(propertyId);
      const data = unwrapResponse(res);
      setConfig(data);
      if (data) {
        setForm({
          restID:      data.restID      ?? "",
          appKey:      data["app-key"]  ?? "",
          appSecret:   data["app-secret"] ?? "",
          accessToken: data["access-token"] ?? "",
        });
      }
    } catch {
      setConfig(null);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const handleSave = async () => {
    if (!form.restID || !form.appKey || !form.appSecret || !form.accessToken) {
      showError("All credential fields are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        propertyId,
        restID:           form.restID,
        "app-key":        form.appKey,
        "app-secret":     form.appSecret,
        "access-token":   form.accessToken,
        active:           config?.active ?? true,
      };
      if (config) {
        await updatePropertyPetPooja(propertyId, payload);
        showSuccess("Pet Pooja credentials updated.");
      } else {
        await createPropertyPetPooja(payload);
        showSuccess("Pet Pooja credentials saved.");
      }
      setEditing(false);
      fetchConfig();
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to save credentials.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    if (!config) return;
    setToggling(true);
    try {
      await togglePropertyPetPoojaStatus(propertyId, !config.active);
      showSuccess(`Pet Pooja integration ${!config.active ? "enabled" : "disabled"}.`);
      fetchConfig();
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to update status.");
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-gray-400">
        <ArrowPathIcon className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading credentials…</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">API Credentials</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Connect this property to Pet Pooja using your API credentials.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {config && (
            <button
              onClick={handleToggle}
              disabled={toggling}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider transition-all ${
                config.active
                  ? "bg-green-50 text-green-700 hover:bg-green-100"
                  : "bg-red-50 text-red-700 hover:bg-red-100"
              }`}
            >
              {toggling ? (
                <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
              ) : config.active ? (
                <CheckCircleIcon className="h-3.5 w-3.5" />
              ) : (
                <XCircleIcon className="h-3.5 w-3.5" />
              )}
              {config.active ? "Active" : "Inactive"}
            </button>
          )}
          <button
            onClick={() => setEditing((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 transition hover:border-gray-300 hover:shadow-sm"
          >
            {config ? (
              <><PencilSquareIcon className="h-4 w-4" /> {editing ? "Cancel" : "Edit"}</>
            ) : (
              <><PlusIcon className="h-4 w-4" /> Add Credentials</>
            )}
          </button>
        </div>
      </div>

      {/* Display mode */}
      {config && !editing && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CREDENTIAL_FIELDS.map(({ key, label }) => {
            const value = key === "appKey"
              ? config["app-key"]
              : key === "appSecret"
              ? config["app-secret"]
              : key === "accessToken"
              ? config["access-token"]
              : config[key];
            return (
              <div key={key} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
                <p className="truncate text-sm font-mono text-gray-800">{value || "—"}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Create form */}
      {(editing || !config) && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {CREDENTIAL_FIELDS.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-gray-500">
                  {label}
                </label>
                <input
                  type="text"
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            {editing && (
              <button
                onClick={() => setEditing(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {saving && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
              {config ? "Update Credentials" : "Save Credentials"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Menu Section ─────────────────────────────────────────────────────────────
function MenuSection({ propertyId }) {
  const [credentials, setCredentials] = useState(null);
  const [menus, setMenus]             = useState([]);
  const [loading, setLoading]         = useState(false);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [fetched, setFetched]         = useState(false);

  // Load stored credentials to use for fetch
  useEffect(() => {
    if (!propertyId) return;
    getPropertyPetPoojaByPropertyId(propertyId)
      .then((res) => {
        const data = unwrapResponse(res);
        setCredentials(data);
      })
      .catch(() => {});
  }, [propertyId]);

  const handleFetchMenus = async () => {
    if (!credentials?.active) {
      showError("Pet Pooja integration is inactive or credentials are not set.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetchPetPoojaMenus({
        appKey:      credentials["app-key"],
        appSecret:   credentials["app-secret"],
        accessToken: credentials["access-token"],
        restID:      credentials.restID,
      });
      const raw = res?.data;
      const list = Array.isArray(raw)
        ? raw
        : raw?.menu ?? raw?.menus ?? raw?.data ?? [];
      setMenus(list);
      setFetched(true);
      if (list.length === 0) showSuccess("Menus fetched — no items returned.");
      else showSuccess(`Fetched ${list.length} menu item(s).`);
    } catch (err) {
      showError(err?.response?.data?.message || "Failed to fetch menus from Pet Pooja.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">Pet Pooja Menus</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Fetch live menu data from Pet Pooja using saved credentials.
          </p>
        </div>
        <button
          onClick={handleFetchMenus}
          disabled={loading || !credentials}
          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? (
            <ArrowPathIcon className="h-4 w-4 animate-spin" />
          ) : (
            <EyeIcon className="h-4 w-4" />
          )}
          {loading ? "Fetching…" : "Fetch Menus"}
        </button>
      </div>

      {!credentials && (
        <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
          Save Pet Pooja credentials above before fetching menus.
        </p>
      )}

      {fetched && menus.length === 0 && (
        <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
          No menu items returned from Pet Pooja.
        </p>
      )}

      {menus.length > 0 && (
        <div className="space-y-3">
          {menus.map((menu, i) => {
            const id = menu.id ?? menu.menu_id ?? i;
            const isOpen = expandedIds.has(id);
            const items = menu.items ?? menu.menu_items ?? [];

            return (
              <div key={id} className="overflow-hidden rounded-xl border border-gray-200">
                <button
                  onClick={() => toggleExpand(id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {menu.menu_name ?? menu.name ?? `Menu ${i + 1}`}
                    </p>
                    {menu.menu_category_name && (
                      <p className="text-[11px] text-gray-400">{menu.menu_category_name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-bold text-gray-500">
                      {items.length} items
                    </span>
                    {isOpen ? (
                      <ChevronUpIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {isOpen && items.length > 0 && (
                  <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                      {items.map((item, j) => (
                        <div
                          key={item.id ?? j}
                          className="rounded-lg border border-gray-200 bg-white p-3"
                        >
                          <p className="text-[13px] font-semibold text-gray-800">
                            {item.item_name ?? item.name ?? `Item ${j + 1}`}
                          </p>
                          {item.price != null && (
                            <p className="mt-0.5 text-xs text-gray-500">₹{item.price}</p>
                          )}
                          {item.item_description && (
                            <p className="mt-1 line-clamp-2 text-[11px] text-gray-400">
                              {item.item_description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isOpen && items.length === 0 && (
                  <div className="border-t border-gray-100 bg-gray-50 px-5 py-3 text-xs text-gray-400">
                    No items in this menu.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function PetPoojaConfigTab({ propertyData }) {
  const propertyId = propertyData?.id;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
          <img
            src="https://www.petpooja.com/favicon.ico"
            alt="Pet Pooja"
            className="h-5 w-5 object-contain"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Pet Pooja Integration</h2>
          <p className="text-xs text-gray-500">Manage API credentials and fetch live menus from Pet Pooja.</p>
        </div>
      </div>

      <CredentialSection propertyId={propertyId} />
      <MenuSection propertyId={propertyId} />
    </div>
  );
}
