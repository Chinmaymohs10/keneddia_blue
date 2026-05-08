import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/modules/website/components/Navbar";
import Footer from "@/modules/website/components/Footer";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from "lucide-react";
import { getAllProperties } from "@/Api/Api";
import {
  createInquiry,
  filterInquiries,
  getAllContactHeroHeaders,
  getAllContactTouchHeaders,
  getPropertyContactById,
} from "@/Api/contactusapi";

export default function ContactUs() {
  type FormValues = {
    fullName: string;
    email: string;
    phoneNumber: string;
    propertyId: string;
    message: string;
  };

  type FormErrors = Partial<Record<keyof FormValues, string>>;
  type PropertyContact = {
    mobileNumber: string | null;
    email: string | null;
    openingTime: string | null;
    closingTime: string | null;
    addressUrl: string | null;
  };

  const [propertyOptions, setPropertyOptions] = useState<
    { id: number; name: string }[]
  >([]);
  const [formValues, setFormValues] = useState<FormValues>({
    fullName: "",
    email: "",
    phoneNumber: "",
    propertyId: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [heroContent, setHeroContent] = useState({
    line1: "Contact",
    line2: "Us",
    description:
      "We are here to assist you with any inquiries regarding our hotels, restaurants, and cafes.",
  });
  const [touchContent, setTouchContent] = useState({
    heading: "Get in Touch",
    description:
      "We are here to assist you with any inquiries regarding our hotels, restaurants, and cafes. Reach out to us and our dedicated team will get back to you shortly.",
  });
  const [propertyContact, setPropertyContact] = useState<PropertyContact>({
    mobileNumber: null,
    email: null,
    openingTime: null,
    closingTime: null,
    addressUrl: null,
  });

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const res = await getAllProperties();
        const list = Array.isArray(res?.data) ? res.data : [];
        const mapped = list
          .filter(
            (item) =>
              item?.id != null &&
              (item?.isActive === true || item?.active === true),
          )
          .map((item) => ({
            id: Number(item.id),
            name:
              item?.propertyName ||
              item?.name ||
              item?.title ||
              `Property ${item.id}`,
          }));
        setPropertyOptions(mapped);
      } catch (error) {
        console.error("Failed to load properties", error);
        setPropertyOptions([]);
      }
    };

    loadProperties();
  }, []);

  useEffect(() => {
    const loadDynamicContent = async () => {
      try {
        const [heroRes, touchRes] = await Promise.all([
          getAllContactHeroHeaders(),
          getAllContactTouchHeaders(),
        ]);

        const heroList = Array.isArray(heroRes?.data?.data)
          ? heroRes.data.data
          : Array.isArray(heroRes?.data)
            ? heroRes.data
            : [];
        const touchList = Array.isArray(touchRes?.data?.data)
          ? touchRes.data.data
          : Array.isArray(touchRes?.data)
            ? touchRes.data
            : [];

        const hero = heroList.find((item) => item?.isActive) || heroList[0];
        const touch = touchList.find((item) => item?.isActive) || touchList[0];

        if (hero) {
          const badgeLabel = String(hero?.badgeLabel || "").trim();
          const words = badgeLabel.split(/\s+/).filter(Boolean);
          const heroLine1 = words.length > 1 ? words.slice(0, -1).join(" ") : badgeLabel || "Contact";
          const heroLine2 = words.length > 1 ? words[words.length - 1] : "Us";

          setHeroContent({
            line1: heroLine1 || "Contact",
            line2: heroLine2 || "Us",
            description: hero?.description || heroContent.description,
          });
        }

        if (touch) {
          setTouchContent({
            heading: touch?.headlinePart1 || "Get in Touch",
            description: touch?.description || touchContent.description,
          });
        }
      } catch (error) {
        console.error("Failed to load dynamic contact content", error);
      }
    };

    loadDynamicContent();
  }, []);

  useEffect(() => {
    const selectedPropertyId = formValues.propertyId.trim();

    if (!selectedPropertyId) {
      setPropertyContact({
        mobileNumber: null,
        email: null,
        openingTime: null,
        closingTime: null,
        addressUrl: null,
      });
      return;
    }

    const loadPropertyContact = async () => {
      try {
        const res = await getPropertyContactById(Number(selectedPropertyId));
        const data = res?.data || {};
        setPropertyContact({
          mobileNumber:
            data?.mobileNumber != null ? String(data.mobileNumber) : null,
          email: data?.email ?? null,
          openingTime: data?.openingTime ?? null,
          closingTime: data?.closingTime ?? null,
          addressUrl: data?.addressUrl ?? null,
        });
      } catch (error) {
        console.error("Failed to load property contact details", error);
        setPropertyContact({
          mobileNumber: null,
          email: null,
          openingTime: null,
          closingTime: null,
          addressUrl: null,
        });
      }
    };

    loadPropertyContact();
  }, [formValues.propertyId]);

  const validateForm = (values: FormValues): FormErrors => {
    const nextErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const fullNameRegex = /^[A-Za-z\s]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!values.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    } else if (values.fullName.trim().length < 2) {
      nextErrors.fullName = "Full name must be at least 2 characters.";
    } else if (!fullNameRegex.test(values.fullName.trim())) {
      nextErrors.fullName = "Full name can contain only letters and spaces.";
    }

    if (!values.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!emailRegex.test(values.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!values.phoneNumber.trim()) {
      nextErrors.phoneNumber = "Phone number is required.";
    } else if (!phoneRegex.test(values.phoneNumber.trim())) {
      nextErrors.phoneNumber = "Phone number must be exactly 10 digits.";
    }

    if (!values.message.trim()) {
      nextErrors.message = "Message is required.";
    } else if (values.message.trim().length < 10) {
      nextErrors.message = "Message must be at least 10 characters.";
    }

    return nextErrors;
  };

  const validateField = (name: keyof FormValues, value: string): string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const fullNameRegex = /^[A-Za-z\s]+$/;
    const phoneRegex = /^\d{10}$/;

    if (name === "fullName") {
      if (!value.trim()) return "Full name is required.";
      if (value.trim().length < 2) return "Full name must be at least 2 characters.";
      if (!fullNameRegex.test(value.trim())) return "Full name can contain only letters and spaces.";
      return "";
    }

    if (name === "email") {
      if (!value.trim()) return "Email address is required.";
      if (!emailRegex.test(value.trim())) return "Please enter a valid email address.";
      return "";
    }

    if (name === "phoneNumber") {
      if (!value.trim()) return "Phone number is required.";
      if (!phoneRegex.test(value.trim())) return "Phone number must be exactly 10 digits.";
      return "";
    }

    if (name === "message") {
      if (!value.trim()) return "Message is required.";
      if (value.trim().length < 10) return "Message must be at least 10 characters.";
      return "";
    }

    return "";
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    let { value } = e.target;

    if (name === "fullName") {
      value = value.replace(/[^A-Za-z\s]/g, "");
    }

    if (name === "phoneNumber") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormValues]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFieldBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const fieldName = name as keyof FormValues;
    const fieldError = validateField(fieldName, value);

    setErrors((prev) => ({
      ...prev,
      [fieldName]: fieldError,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validateForm(formValues);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const subject = "Individual Property";
    const message = formValues.message.trim();
    const selectedPropertyId = formValues.propertyId.trim();
    const propertyId = selectedPropertyId ? Number(selectedPropertyId) : null;

    setIsSubmitting(true);
    try {
      if (propertyId) {
        await filterInquiries({ propertyId });
      }

      const payload = {
        fullName: formValues.fullName.trim(),
        email: formValues.email.trim(),
        phoneNumber: formValues.phoneNumber.trim(),
        message: `[${subject}] ${message}`,
        propertyId,
        propertyTypeId: null,
        locationId: null,
        active: true,
      };

      await createInquiry(payload);
      setFormValues({
        fullName: "",
        email: "",
        phoneNumber: "",
        propertyId: "",
        message: "",
      });
      setErrors({});
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return "Not available";
    const parsedDate = new Date(`1970-01-01T${time}`);
    if (Number.isNaN(parsedDate.getTime())) return time;

    return parsedDate.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-100 selection:bg-primary/20 font-sans transition-colors duration-300">
      <Navbar />

      {/* Hero Header Section */}
      <section className="relative min-h-[52vh] md:min-h-[60vh] pt-24 md:pt-32 pb-14 md:pb-20 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-white dark:to-[#0A0A0A] z-10" />
          <img 
            src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=2000" 
            alt="Contact Us" 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-1/4 right-1/4 w-[360px] h-[360px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-[280px] h-[280px] bg-navy/30 rounded-full blur-[100px] animate-pulse" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 relative z-20 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl md:text-8xl font-serif text-white mb-5 md:mb-6 leading-[0.95] md:leading-[0.9]"
            >
              {heroContent.line1} <br />
              <span className="text-primary italic font-light drop-shadow-lg">{heroContent.line2}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-base sm:text-lg md:text-xl text-white font-medium leading-relaxed max-w-2xl mx-auto mb-8 md:mb-10 drop-shadow-md px-2 sm:px-0"
            >
              {heroContent.description}
            </motion.p>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100px" }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="h-1 bg-primary mx-auto"
            />
          </motion.div>
        </div>
      </section>

      {/* Contact Content Section */}
      <section className="py-14 md:py-20 px-4 sm:px-6 bg-[#fcfcfc] dark:bg-[#0D0D0D] transition-colors duration-300">
        <div className="container mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            
            {/* Left Column: Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div>
                <h2 className="text-3xl md:text-4xl font-serif text-navy dark:text-white mb-6">
                  {touchContent.heading}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg font-medium leading-relaxed max-w-2xl">
                  {touchContent.description}
                </p>
                <div className="mt-6 max-w-md space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 ml-1">
                    Property
                  </label>
                  <select
                    name="propertyId"
                    value={formValues.propertyId}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-medium text-gray-700 dark:text-gray-100"
                  >
                    <option value="" className="bg-white text-gray-900">Select property</option>
                    {propertyOptions.map((property) => (
                      <option key={property.id} value={property.id} className="bg-white text-gray-900">
                        {property.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm hover:border-primary/20 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white mb-6">
                    <Phone className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif text-navy dark:text-white mb-2">Call Us</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                    {formValues.propertyId
                      ? propertyContact.mobileNumber || "Not available"
                      : "Select Property to View Number"}
                  </p>
                </div>

                <div className="p-8 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm hover:border-primary/20 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white mb-6">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif text-navy dark:text-white mb-2">Email Us</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium break-all">
                    {formValues.propertyId
                      ? propertyContact.email || "Not available"
                      : "Select Property to View Email"}
                  </p>
                </div>

                <div className="p-8 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm hover:border-primary/20 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white mb-6">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif text-navy dark:text-white mb-2">Visit Us</h3>
                  {propertyContact.addressUrl ? (
                    <a
                      href={propertyContact.addressUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-gray-600 dark:text-gray-300 text-sm font-medium leading-relaxed underline break-all"
                    >
                      {propertyContact.addressUrl}
                    </a>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-300 text-sm font-medium leading-relaxed">
                      Not available
                    </p>
                  )}
                </div>

                <div className="p-8 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm hover:border-primary/20 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white mb-6">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-serif text-navy dark:text-white mb-2">Hours</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                    Opening: {formatTime(propertyContact.openingTime)}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                    Closing: {formatTime(propertyContact.closingTime)}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-white/5 p-8 md:p-12 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 transition-colors duration-300"
            >
              <div className="mb-10 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-[0.14em] mb-4">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send a Message</span>
                </div>
                <h3 className="text-3xl font-serif text-navy dark:text-white">Inquiry Form</h3>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 ml-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="fullName"
                      placeholder="Enter your name"
                      value={formValues.fullName}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      className="w-full px-6 py-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm font-medium text-gray-700 dark:text-gray-100"
                    />
                    {errors.fullName && <p className="text-xs text-red-500 ml-1">{errors.fullName}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 ml-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="email" 
                      name="email"
                      placeholder="Enter your email"
                      value={formValues.email}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      className="w-full px-6 py-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm font-medium text-gray-700 dark:text-gray-100"
                    />
                    {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 ml-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Enter your phone number"
                    inputMode="numeric"
                    maxLength={10}
                    value={formValues.phoneNumber}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm font-medium text-gray-700 dark:text-gray-100"
                  />
                  {errors.phoneNumber && <p className="text-xs text-red-500 ml-1">{errors.phoneNumber}</p>}
                </div>
                
                {/* <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 ml-1">Subject</label>
                  <select name="subject" className="w-full px-6 py-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-medium text-gray-700 dark:text-gray-100">
                    <option>Individual Property</option>
                    <option>Hotel Reservation</option>
                    <option>Restaurant Booking</option>
                    <option>Events & Weddings</option>
                    <option>Career Opportunity</option>
                  </select>
                </div> */}

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 ml-1">Property</label>
                  <select
                    name="propertyId"
                    value={formValues.propertyId}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm font-medium text-gray-700 dark:text-gray-100"
                  >
                    <option value="" className="bg-white text-gray-900">Select property</option>
                    {propertyOptions.map((property) => (
                      <option key={property.id} value={property.id} className="bg-white text-gray-900">
                        {property.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 ml-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    placeholder="Tell us how we can help..."
                    name="message"
                    rows={6}
                    value={formValues.message}
                    onChange={handleInputChange}
                    onBlur={handleFieldBlur}
                    className="w-full px-6 py-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none text-sm font-medium text-gray-700 dark:text-gray-100"
                  ></textarea>
                  {errors.message && <p className="text-xs text-red-500 ml-1">{errors.message}</p>}
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 rounded-xl bg-primary text-white text-sm font-bold uppercase tracking-[0.12em] hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-3"
                >
                  <Send className="w-5 h-5" />
                  {isSubmitting ? "Submitting..." : "Submit Message"}
                 </button>
              </form>
            </motion.div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
