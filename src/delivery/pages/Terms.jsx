import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Mail,
  Phone,
  MessageCircle,
  MapPin
} from "lucide-react";

const DriverTerms = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isFromRegister = searchParams.get("from") === "register";

  const handleAccept = () => {
    localStorage.setItem("ko_terms_accepted", "true");
    navigate("/delivery/register");
  };

  const handleDecline = () => {
    navigate("/delivery");
  };

  const sections = [
    {
      title: "1. Eligibility Requirements",
      content: "To become a KO Rider, you must meet the following requirements:\n- Be at least 18 years of age\n- Hold a valid Ghana driver's license\n- Own or have access to a roadworthy vehicle (motorcycle, car, or bicycle)\n- Have an active Ghana mobile money account\n- Own a smartphone capable of running the KO Rider app\n- Have no outstanding criminal record related to traffic violations or theft\n- Be a resident of Greater Accra Region"
    },
    {
      title: "2. Driver Obligations",
      content: "As a KO Rider driver, you agree to:\n- Deliver orders promptly and professionally\n- Handle food items with care and hygiene\n- Maintain a clean and presentable appearance\n- Communicate professionally with customers\n- Keep your vehicle in roadworthy condition\n- Update your availability status accurately\n- Not share your account with other persons\n- Report any accidents or incidents immediately to Kokrobite Oasis management\n- Comply with all Ghana road traffic laws\n- Not consume alcohol or substances while on duty"
    },
    {
      title: "3. Earnings & Payments",
      content: "Payment terms for KO Rider drivers:\n- Fixed delivery fee: GHC 20.00 per completed delivery\n- Payments processed every Monday for the previous week's deliveries\n- Payment sent via Ghana Mobile Money\n- Incomplete or cancelled deliveries do not qualify for payment\n- Kokrobite Oasis reserves the right to adjust delivery fees with 7 days notice\n- Drivers are responsible for their own tax obligations\n- No payment is made for rejected, cancelled, or undelivered orders"
    },
    {
      title: "4. Order Management",
      content: "Regarding order handling:\n- Accept only orders you can complete\n- Do not cancel accepted orders except in genuine emergencies\n- Multiple cancellations may result in account suspension\n- Always confirm pickup with the restaurant\n- Always confirm delivery with the customer\n- Do not open, tamper with, or consume any part of a customer's order\n- Report damaged or incorrect orders immediately before delivery"
    },
    {
      title: "5. Account & App Usage",
      content: "Regarding your KO Rider account:\n- Your account is personal and non-transferable\n- Do not share your login credentials\n- You must keep your contact information updated\n- Kokrobite Oasis may suspend or terminate accounts for policy violations\n- The app must be used only for legitimate delivery activities\n- GPS tracking is active during deliveries for customer safety\n- False delivery confirmations will result in immediate termination"
    },
    {
      title: "6. Conduct & Professionalism",
      content: "Professional conduct requirements:\n- Treat all customers with respect and courtesy\n- No harassment, discrimination, or inappropriate behaviour\n- No political, religious, or offensive conversations with customers\n- Represent Kokrobite Oasis brand professionally at all times\n- Complaints from customers will be investigated and may affect your account\n- A rating below 3.0 stars may result in account review"
    },
    {
      title: "7. Termination",
      content: "Kokrobite Oasis reserves the right to terminate or suspend a driver account for:\n- Violation of any of these terms\n- Consistent poor customer ratings\n- Fraudulent activity\n- Criminal conduct\n- Repeated order cancellations\n- Misuse of the KO Rider application\n- Any conduct that damages the Kokrobite Oasis brand\n\nDrivers may also terminate their participation at any time by contacting Kokrobite Oasis management."
    },
    {
      title: "8. Liability",
      content: "Important liability terms:\n- KO Rider drivers are independent contractors, not employees of Kokrobite Oasis\n- Kokrobite Oasis is not liable for accidents, injuries, or damages that occur during deliveries\n- Drivers are responsible for their own insurance coverage\n- Kokrobite Oasis is not responsible for vehicle damage or theft\n- Drivers must have valid third-party insurance for their vehicles"
    },
    {
      title: "9. Contact & Support",
      content: "For questions about these terms:\n📧 Email: hello@kokrobiteoasis.com\n📞 Phone: [KO Phone Number]\n💬 WhatsApp: [KO WhatsApp Number]\n📍 Location: East Legon, Accra, Ghana\n\nManagement hours:\nTuesday – Sunday: 11:00 AM – 8:00 PM\nMonday: Closed"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0C0A09] text-white selection:bg-[#F97316]/30 pb-32">
      {/* TOP NAV */}
      <nav className="flex justify-between items-center p-6 sticky top-0 bg-[#0C0A09]/80 backdrop-blur-lg z-50">
        <button 
          onClick={() => navigate(-1)}
          className="text-sm text-white/40 hover:text-[#F97316] transition-colors flex items-center gap-2"
        >
          <HiOutlineArrowLeft /> Back
        </button>
        <div className="text-2xl font-display italic font-bold text-white absolute left-1/2 -translate-x-1/2">
          <span>🛵</span> KO Rider
        </div>
        <div className="w-10" /> {/* Spacer for symmetry */}
      </nav>

      {/* HEADER CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-6 mt-6 p-8 rounded-2xl bg-gradient-to-br from-[#1C0A00] to-[#F97316] text-center shadow-xl shadow-[#F97316]/10"
      >
        <div className="text-5xl mb-4">📋</div>
        <h1 className="font-display text-[32px] text-white leading-tight">Driver Terms & Conditions</h1>
        <p className="text-white/60 text-sm mt-2">Kokrobite Oasis KO Rider Program</p>
        <p className="text-white/40 text-xs mt-1">Effective: January 2026</p>
      </motion.div>

      {/* IMPORTANT NOTICE BANNER */}
      <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-xl p-4 mx-6 my-6 flex gap-3">
        <AlertCircle className="text-[#F59E0B] shrink-0" size={20} />
        <p className="text-[#F59E0B] text-sm leading-relaxed">
          Please read these terms carefully before registering as a KO Rider driver. By registering, you agree to be bound by these terms and conditions.
        </p>
      </div>

      {/* TERMS CONTENT SECTIONS */}
      <div className="space-y-4 px-4">
        {sections.map((section, idx) => (
          <motion.section 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-6"
          >
            <h2 className="font-display text-[22px] text-white mb-4 border-b border-[#F97316]/15 pb-3">
              {section.title}
            </h2>
            <div className="text-white/60 text-sm leading-relaxed whitespace-pre-line">
              {section.content}
            </div>
          </motion.section>
        ))}
      </div>

      {/* BOTTOM ACCEPT SECTION */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0C0A09]/97 backdrop-blur-[20px] border-t border-[#F97316]/15 p-4 px-6 z-50">
        <div className="max-w-[500px] mx-auto">
          {isFromRegister ? (
            <>
              <button 
                onClick={handleAccept}
                className="w-full bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white font-bold uppercase tracking-wider text-sm py-4 rounded-xl shadow-lg shadow-[#F97316]/20 flex items-center justify-center gap-2"
              >
                I Accept These Terms <CheckCircle2 size={18} />
              </button>
              <button 
                onClick={handleDecline}
                className="w-full text-white/30 text-sm mt-4 hover:text-white transition-colors"
              >
                Decline
              </button>
            </>
          ) : (
            <button 
              onClick={() => navigate(-1)}
              className="w-full bg-[#F97316] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#F97316]/20 flex items-center justify-center gap-2"
            >
              Back to KO Rider <HiOutlineArrowLeft className="rotate-180" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverTerms;
