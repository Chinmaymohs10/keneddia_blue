import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Flame,
  Loader2,
  ShoppingBag,
  Truck,
  Utensils,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  filterFoodDeliveryLinks,
  getPropertyPetPoojaByPropertyId,
  fetchPetPoojaMenus,
  savePetPoojaOrder,
} from "@/Api/externalApi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PAGE_SIZE = 8;

const EMPTY_TAKEAWAY_FORM = {
  guestName: "",
  contactNumber: "",
  emailAddress: "",
  address: "",
  date: "",
  time: "",
  orderType: "P",
  tableNo: "",
};

const firstString = (...values) =>
  values.find((value) => typeof value === "string" && value.trim()) || "";

function validateTakeawayForm(form) {
  const errors = {};
  if (!form.guestName.trim()) errors.guestName = "Name is required.";
  if (!form.contactNumber.trim() || form.contactNumber.length !== 10)
    errors.contactNumber = "Enter a valid 10-digit phone number.";
  if (!form.emailAddress.trim() || !/\S+@\S+\.\S+/.test(form.emailAddress))
    errors.emailAddress = "Enter a valid email address.";
  if (!form.address.trim()) errors.address = "Address is required.";
  if (!form.date) errors.date = "Date is required.";
  if (!form.time) errors.time = "Time is required.";
  if (form.orderType === "D" && !form.tableNo.trim())
    errors.tableNo = "Table number is required for dine-in.";
  return errors;
}

export default function PetPoojaMenu({
  categories = [],
  items = [],
  propertyId,
  propertyData,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const [showDeliveryOptions, setShowDeliveryOptions] = useState(false);
  const [selectedTakeawayItems, setSelectedTakeawayItems] = useState([]);
  const [showTakeawayDialog, setShowTakeawayDialog] = useState(false);
  const [takeawayForm, setTakeawayForm] = useState(EMPTY_TAKEAWAY_FORM);
  const [takeawayErrors, setTakeawayErrors] = useState({});
  const [isSubmittingTakeaway, setIsSubmittingTakeaway] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null); // { orderId, message }
  const scrollRef = useRef(null);

  const activeCategory = categories[activeTab];

  const filteredItems = useMemo(
    () =>
      activeCategory
        ? items.filter(
            (it) => String(it.item_categoryid) === String(activeCategory.categoryid),
          )
        : [],
    [items, activeCategory],
  );

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const pagedItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const [deliveryLinks, setDeliveryLinks] = useState({ swiggy: "", zomato: "" });
  const [openDeliveryItemId, setOpenDeliveryItemId] = useState(null);

  useEffect(() => {
    if (!propertyId) return;
    filterFoodDeliveryLinks({ propertyId })
      .then((res) => {
        const list = res?.data?.data ?? res?.data ?? res ?? [];
        const record = Array.isArray(list) ? list[0] : list;
        if (!record || !record.isActive) return;
        setDeliveryLinks({
          swiggy: record.isSwiggyActive ? (record.swiggyLink ?? "") : "",
          zomato: record.isZomatoActive ? (record.zomatoLink ?? "") : "",
        });
      })
      .catch(() => {});
  }, [propertyId]);

  const scrollToTab = (index) => {
    const container = scrollRef.current;
    if (container) {
      const tab = container.children[index];
      if (tab) {
        container.scrollTo({
          left:
            tab.offsetLeft - container.offsetWidth / 2 + tab.offsetWidth / 2,
          behavior: "smooth",
        });
      }
    }
  };

  const handleTabClick = (idx) => {
    setActiveTab(idx);
    setPage(1);
    scrollToTab(idx);
  };

  const isItemSelected = (itemId) =>
    selectedTakeawayItems.some(
      (item) => String(item.itemid) === String(itemId),
    );

  const toggleTakeawaySelection = (item) => {
    setSelectedTakeawayItems((prev) => {
      const exists = prev.some(
        (selected) => String(selected.itemid) === String(item.itemid),
      );
      if (exists) {
        return prev.filter(
          (selected) => String(selected.itemid) !== String(item.itemid),
        );
      }
      return [...prev, item];
    });
  };

  const handlePrev = () => {
    if (activeTab > 0) handleTabClick(activeTab - 1);
  };

  const handleNext = () => {
    if (activeTab < categories.length - 1) handleTabClick(activeTab + 1);
  };

  const handleTakeawayOpen = () => {
    if (selectedTakeawayItems.length === 0) {
      toast.error("Select at least one item for takeaway.");
      return;
    }
    setShowTakeawayDialog(true);
    setTakeawayForm({
      ...EMPTY_TAKEAWAY_FORM,
      date: new Date().toISOString().split("T")[0],
      time: "19:00",
    });
    setTakeawayErrors({});
  };

  const handleTakeawayClose = (nextOpen) => {
    if (!nextOpen) {
      setShowTakeawayDialog(false);
      setTakeawayForm(EMPTY_TAKEAWAY_FORM);
      setTakeawayErrors({});
      setIsSubmittingTakeaway(false);
    }
  };

  const setTakeawayField = (key, value) => {
    setTakeawayForm((prev) => ({ ...prev, [key]: value }));
    if (takeawayErrors[key]) {
      setTakeawayErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const handleTakeawaySubmit = async (e) => {
    e.preventDefault();
    if (!propertyId || selectedTakeawayItems.length === 0) return;

    const errors = validateTakeawayForm(takeawayForm);
    if (Object.keys(errors).length > 0) {
      setTakeawayErrors(errors);
      return;
    }

    setIsSubmittingTakeaway(true);
    try {
      const credRes = await getPropertyPetPoojaByPropertyId(propertyId);
      const creds = credRes?.data?.data ?? credRes?.data ?? credRes;

      if (!creds || !creds["app-key"]) {
        toast.error("PetPooja configuration not found for this property.");
        return;
      }

      const orderID = `ORD-${Date.now()}`;
      const preorderDate = takeawayForm.date;
      const preorderTime = `${takeawayForm.time}:00`;

      const orderItems = selectedTakeawayItems.map((item) => ({
        id: String(item.itemid),
        name: item.itemname,
        price: String(parseFloat(item.price || "0").toFixed(2)),
        final_price: String(parseFloat(item.price || "0").toFixed(2)),
        quantity: "1",
        description: item.itemdescription || "",
        variation_name: "",
        variation_id: "",
        AddonItem: { details: [] },
      }));

      const total = selectedTakeawayItems
        .reduce((sum, item) => sum + parseFloat(item.price || "0"), 0)
        .toFixed(2);

      const payload = {
        appKey: creds["app-key"],
        appSecret: creds["app-secret"],
        accessToken: creds["access-token"],
        orderinfo: {
          OrderInfo: {
            Restaurant: {
              details: {
                res_name:
                  firstString(propertyData?.propertyName, propertyData?.name, "Restaurant"),
                address: firstString(propertyData?.address, ""),
                contact_information: firstString(propertyData?.phone, ""),
                restID: creds.restID,
              },
            },
            Customer: {
              details: {
                email: takeawayForm.emailAddress.trim(),
                name: takeawayForm.guestName.trim(),
                address: takeawayForm.address.trim(),
                phone: takeawayForm.contactNumber.trim(),
                latitude: "",
                longitude: "",
              },
            },
            Order: {
              details: {
                orderID,
                preorder_date: preorderDate,
                preorder_time: preorderTime,
                order_type: takeawayForm.orderType,
                payment_type: "COD",
                table_no: takeawayForm.orderType === "D" ? takeawayForm.tableNo.trim() : "",
                no_of_persons: "1",
                total,
                service_charge: "0",
                sc_tax_amount: "0",
                delivery_charges: "0",
                dc_tax_percentage: "0",
                dc_tax_amount: "0",
                packing_charges: "0",
                pc_tax_amount: "0",
                pc_tax_percentage: "0",
                discount_total: "0",
                tax_total: "0",
                description: "",
                created_on: new Date()
                  .toISOString()
                  .replace("T", " ")
                  .substring(0, 19),
              },
            },
            OrderItem: {
              details: orderItems,
            },
          },
          udid: "",
          device_type: "Web",
        },
      };

      const res = await savePetPoojaOrder(payload);
      const result = res?.data ?? res;

      if (String(result?.success) === "1") {
        setSelectedTakeawayItems([]);
        handleTakeawayClose(false);
        setOrderSuccess({
          orderId: result?.clientOrderID || result?.orderID || orderID,
          message: result?.message || "Your order is saved.",
        });
      } else {
        toast.error(result?.message || "Failed to place order. Please try again.");
      }
    } catch (error) {
      console.error("Failed to place PetPooja order", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmittingTakeaway(false);
    }
  };

  if (!categories.length) return null;

  return (
    <section
      id="menu"
      className="py-16 bg-white dark:bg-[#050505] transition-colors duration-500"
    >
      <div className="container mx-auto px-6 max-w-[1200px]">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Utensils className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-3xl font-serif dark:text-white">
              The <span className="italic text-primary">Selection</span>
            </h2>
          </div>

          <div className="flex items-center gap-3 relative">
            <button
              type="button"
              onClick={handleTakeawayOpen}
              disabled={selectedTakeawayItems.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/20 bg-primary/10 text-[11px] font-black uppercase tracking-[0.2em] text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              Takeaway
              {selectedTakeawayItems.length > 0 ? ` (${selectedTakeawayItems.length})` : ""}
            </button>

            <button
              onClick={handlePrev}
              disabled={activeTab === 0}
              className="p-2 rounded-full border border-zinc-200 dark:border-white/10 disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
            >
              <ChevronLeft className="w-5 h-5 dark:text-white" />
            </button>
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {activeTab + 1} / {categories.length}
            </div>
            <button
              onClick={handleNext}
              disabled={activeTab === categories.length - 1}
              className="p-2 rounded-full border border-zinc-200 dark:border-white/10 disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
            >
              <ChevronRight className="w-5 h-5 dark:text-white" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto no-scrollbar pb-8 snap-x"
        >
          {categories.map((cat, idx) => (
            <motion.button
              key={cat.categoryid}
              onClick={() => handleTabClick(idx)}
              className={`relative shrink-0 px-6 py-3 rounded-full border text-xs font-bold uppercase tracking-widest transition-all snap-center ${
                activeTab === idx
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                  : "bg-transparent border-zinc-100 dark:border-white/5 text-zinc-500 hover:border-primary/50"
              }`}
            >
              {cat.categoryname}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + "-" + page}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-2"
          >
            {pagedItems.length === 0 ? (
              <p className="py-12 text-center text-zinc-400 dark:text-zinc-600">
                No items in this category.
              </p>
            ) : (
              pagedItems.map((item, i) => {
                const isVeg = String(item.item_attributeid) === "1";
                const outOfStock = item.in_stock === "0";

                return (
                  <motion.div
                    key={item.itemid}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`group flex items-start gap-5 p-4 rounded-2xl transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/50 ${
                      outOfStock ? "opacity-50" : ""
                    }`}
                  >
                    <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-300">
                      <Utensils size={20} />
                    </div>

                    <div className="flex-1 border-b border-zinc-100 dark:border-white/5 pb-4 group-last:border-none">
                      <div className="flex items-center justify-between mb-1.5 gap-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white">
                            {item.itemname}
                          </h4>

                          {isVeg ? (
                            <span className="w-3.5 h-3.5 border border-green-600 flex items-center justify-center shrink-0">
                              <span className="w-2 h-2 rounded-full bg-green-600 block" />
                            </span>
                          ) : (
                            <span className="w-3.5 h-3.5 border border-red-600 flex items-center justify-center shrink-0">
                              <span className="w-2 h-2 rounded-full bg-red-600 block" />
                            </span>
                          )}

                          {!isVeg && (
                            <Flame size={14} className="text-red-500 fill-red-500" />
                          )}

                          {outOfStock && (
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">
                              Out of stock
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {item.price && (
                            <span className="text-xs font-bold text-primary">
                              Rs {parseFloat(item.price).toFixed(0)}
                            </span>
                          )}

                          {!outOfStock && (
                            <div className="flex items-center gap-2">
                              {/* Order Online button with Swiggy/Zomato hover popup */}
                              {(deliveryLinks.swiggy || deliveryLinks.zomato) && (
                                <div
                                  className="relative"
                                  onMouseEnter={() => setOpenDeliveryItemId(item.itemid)}
                                  onMouseLeave={() => setOpenDeliveryItemId(null)}
                                >
                                  <button
                                    type="button"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-900 hover:border-primary hover:text-primary transition-all"
                                  >
                                    <Truck size={12} />
                                    Order Online
                                  </button>

                                  <AnimatePresence>
                                    {openDeliveryItemId === item.itemid && (
                                      <motion.div
                                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 6, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute bottom-[calc(100%+0.5rem)] right-0 z-30 flex gap-2 rounded-2xl border border-zinc-100 dark:border-white/10 bg-white dark:bg-zinc-900 p-2 shadow-2xl whitespace-nowrap"
                                      >
                                        {deliveryLinks.swiggy ? (
                                          <a
                                            href={deliveryLinks.swiggy}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 rounded-full bg-[#FC8019] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white transition-transform hover:scale-105"
                                          >
                                            Swiggy <ExternalLink size={10} />
                                          </a>
                                        ) : (
                                          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 cursor-not-allowed">
                                            Swiggy
                                          </span>
                                        )}
                                        {deliveryLinks.zomato ? (
                                          <a
                                            href={deliveryLinks.zomato}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 rounded-full bg-[#E23744] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white transition-transform hover:scale-105"
                                          >
                                            Zomato <ExternalLink size={10} />
                                          </a>
                                        ) : (
                                          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 cursor-not-allowed">
                                            Zomato
                                          </span>
                                        )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )}

                              {/* Takeaway select button */}
                              <button
                                type="button"
                                onClick={() => toggleTakeawaySelection(item)}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 ${
                                  isItemSelected(item.itemid)
                                    ? "bg-primary text-white"
                                    : "bg-primary/10 hover:bg-primary text-primary hover:text-white"
                                }`}
                              >
                                <ShoppingBag size={12} />
                                {isItemSelected(item.itemid) ? "Selected" : "Select"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {item.itemdescription && (
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                          {item.itemdescription}
                        </p>
                      )}

                      {item.itemallowaddon === "1" && (
                        <p className="text-[10px] font-bold text-primary mt-1 uppercase tracking-wider">
                          Customisable
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-xs text-zinc-400 dark:text-zinc-600">
              Showing {(page - 1) * PAGE_SIZE + 1}-
              {Math.min(page * PAGE_SIZE, filteredItems.length)} of{" "}
              {filteredItems.length} items
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-full border border-zinc-200 dark:border-white/10 disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
              >
                <ChevronLeft className="w-4 h-4 dark:text-white" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`el-${i}`} className="px-1 text-xs text-zinc-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`h-8 w-8 rounded-full text-xs font-bold transition-all ${
                        page === p
                          ? "bg-primary text-white shadow-lg shadow-primary/20"
                          : "border border-zinc-100 dark:border-white/5 text-zinc-500 hover:border-primary/50"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-full border border-zinc-200 dark:border-white/10 disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
              >
                <ChevronRight className="w-4 h-4 dark:text-white" />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <Dialog open={showTakeawayDialog} onOpenChange={handleTakeawayClose}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-[560px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl sm:text-2xl">
              Place Order
            </DialogTitle>
            <DialogDescription className="text-sm">
              {selectedTakeawayItems.length > 0
                ? `Confirm your order for ${selectedTakeawayItems.length} selected item${selectedTakeawayItems.length > 1 ? "s" : ""}.`
                : "Confirm your order."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleTakeawaySubmit} className="space-y-5">
            {/* Selected items summary */}
            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                Selected Items
              </p>
              <div className="mt-3 space-y-2">
                {selectedTakeawayItems.map((item) => (
                  <div
                    key={item.itemid}
                    className="flex items-start justify-between gap-3 rounded-xl bg-white/70 px-3 py-2 dark:bg-zinc-900/40"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                        {item.itemname}
                      </p>
                      {item.itemdescription ? (
                        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                          {item.itemdescription}
                        </p>
                      ) : null}
                    </div>
                    {item.price ? (
                      <span className="shrink-0 text-xs font-bold text-primary">
                        Rs {parseFloat(item.price).toFixed(0)}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-right text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Total: Rs{" "}
                {selectedTakeawayItems
                  .reduce((sum, item) => sum + parseFloat(item.price || "0"), 0)
                  .toFixed(0)}
              </p>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Fields marked <span className="text-red-500 font-semibold">*</span> are required.
            </p>

            {/* Order type */}
            <div className="space-y-1.5">
              <Label htmlFor="takeaway-order-type">
                Order Type <span className="text-red-500">*</span>
              </Label>
              <select
                id="takeaway-order-type"
                value={takeawayForm.orderType}
                onChange={(e) => setTakeawayField("orderType", e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="P">Parcel / Takeaway</option>
                <option value="D">Dine In</option>
              </select>
            </div>

            {/* Table no — only for dine in */}
            {takeawayForm.orderType === "D" && (
              <div className="space-y-1.5">
                <Label htmlFor="takeaway-table">
                  Table Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="takeaway-table"
                  value={takeawayForm.tableNo}
                  onChange={(e) => setTakeawayField("tableNo", e.target.value)}
                  placeholder="e.g. T-4"
                  className={takeawayErrors.tableNo ? "border-red-500 focus-visible:ring-red-400" : ""}
                />
                {takeawayErrors.tableNo && (
                  <p className="text-xs text-red-500">{takeawayErrors.tableNo}</p>
                )}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="takeaway-name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="takeaway-name"
                  value={takeawayForm.guestName}
                  onChange={(e) => setTakeawayField("guestName", e.target.value)}
                  placeholder="Full Name"
                  className={takeawayErrors.guestName ? "border-red-500 focus-visible:ring-red-400" : ""}
                />
                {takeawayErrors.guestName && (
                  <p className="text-xs text-red-500">{takeawayErrors.guestName}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="takeaway-number">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="takeaway-number"
                  type="tel"
                  maxLength={10}
                  value={takeawayForm.contactNumber}
                  onChange={(e) =>
                    setTakeawayField("contactNumber", e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="10-digit mobile number"
                  className={takeawayErrors.contactNumber ? "border-red-500 focus-visible:ring-red-400" : ""}
                />
                {takeawayErrors.contactNumber && (
                  <p className="text-xs text-red-500">{takeawayErrors.contactNumber}</p>
                )}
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="takeaway-email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="takeaway-email"
                  type="email"
                  value={takeawayForm.emailAddress}
                  onChange={(e) => setTakeawayField("emailAddress", e.target.value)}
                  placeholder="name@example.com"
                  className={takeawayErrors.emailAddress ? "border-red-500 focus-visible:ring-red-400" : ""}
                />
                {takeawayErrors.emailAddress && (
                  <p className="text-xs text-red-500">{takeawayErrors.emailAddress}</p>
                )}
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="takeaway-address">
                  Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="takeaway-address"
                  value={takeawayForm.address}
                  onChange={(e) => setTakeawayField("address", e.target.value)}
                  placeholder="Your delivery / billing address"
                  className={takeawayErrors.address ? "border-red-500 focus-visible:ring-red-400" : ""}
                />
                {takeawayErrors.address && (
                  <p className="text-xs text-red-500">{takeawayErrors.address}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="takeaway-date">
                  Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="takeaway-date"
                  type="date"
                  value={takeawayForm.date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setTakeawayField("date", e.target.value)}
                  className={takeawayErrors.date ? "border-red-500 focus-visible:ring-red-400" : ""}
                />
                {takeawayErrors.date && (
                  <p className="text-xs text-red-500">{takeawayErrors.date}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="takeaway-time">
                  Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="takeaway-time"
                  type="time"
                  value={takeawayForm.time}
                  onChange={(e) => setTakeawayField("time", e.target.value)}
                  className={takeawayErrors.time ? "border-red-500 focus-visible:ring-red-400" : ""}
                />
                {takeawayErrors.time && (
                  <p className="text-xs text-red-500">{takeawayErrors.time}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleTakeawayClose(false)}
                disabled={isSubmittingTakeaway}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmittingTakeaway} className="w-full sm:w-auto">
                {isSubmittingTakeaway ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <CalendarClock className="mr-2 h-4 w-4" />
                    Place Order
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Order success dialog */}
      <Dialog open={!!orderSuccess} onOpenChange={(open) => { if (!open) setOrderSuccess(null); }}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-[420px] p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="w-9 h-9 text-green-600 dark:text-green-400" />
            </div>

            <div className="space-y-1">
              <DialogTitle className="font-serif text-2xl text-zinc-900 dark:text-white">
                Order Placed!
              </DialogTitle>
              <DialogDescription className="text-sm text-zinc-500 dark:text-zinc-400">
                {orderSuccess?.message}
              </DialogDescription>
            </div>

            {orderSuccess?.orderId && (
              <div className="w-full rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">
                  Order ID
                </p>
                <p className="text-base font-bold text-zinc-900 dark:text-white tracking-wide">
                  {orderSuccess.orderId}
                </p>
              </div>
            )}

            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Please keep your Order ID handy for tracking your order.
            </p>

            <Button
              className="w-full mt-1"
              onClick={() => setOrderSuccess(null)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
