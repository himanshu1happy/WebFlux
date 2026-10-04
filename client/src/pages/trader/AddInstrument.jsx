import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Scale, MapPin } from "lucide-react";
import API_URL from "../../api";
import DataPlateChecker from "../../components/DataPlateChecker";

const tradeCategories = [
  "Petrol/Diesel Pumps",
  "LPG Distributors",
  "Tank Lorry",
  "Kerosene Wholesale Dealers",
  "Fair Price Shops",
  "Govt./Semi-Govt. Establishments",
  "Sugar Factory / Sugarcane Purchase Centres",
  "Wheat/Paddy Procurement Centres",
  "Building Material/Hardware",
  "Rice/Pulses Mills",
  "Edible Oil Mills/Traders",
  "Flour Mills/Atta Chakki",
  "Bullion Traders",
  "Cloth/Garment",
  "Sweet Shops/Backers/Confectioneries",
  "Grocers (Kiranas)",
  "Fruit/Vegetable Shops",
  "Fertilizer/Seed",
  "Weighbridges",
];

const instrumentTypes = [
  "Electronic Weighing Machine",
  "Platform Weighing Machine",
  "Weighbridge",
  "Fuel Dispenser",
  "LPG Gas Weighing Machine",
  "Spring Balance",
  "Counter Weighing Machine",
  "Other",
];

function AddInstrument() {
  const navigate = useNavigate();

  // Hooks correctly placed inside the component body
  const [verifiedBusinessName, setVerifiedBusinessName] = useState("");
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [ocrData, setOcrData] = useState(null);
  const [form, setForm] = useState({
    tradeCategory: "",
    instrumentType: "",
    manufacturer: "",
    model: "",
    serialNumber: "",
    capacity: "",
    purchaseYear: "",
    accuracyClass: "",
    installationLocation: "",
    gstin: "",
    invoiceNumber: ""
  });
  const [generatedId, setGeneratedId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // useEffect placed safely at the top level of the component
  useEffect(() => {
    const fetchVerifiedUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setVerifiedBusinessName(data.user.name);
        }
      } catch {
        console.error("Failed to verify user identity");
      }
    };
    fetchVerifiedUser();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setOcrData(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const requiredFields = [
      "tradeCategory",
      "instrumentType",
      "manufacturer",
      "model",
      "serialNumber",
      "capacity",
      "installationLocation",
    ];
    
    const missingField = requiredFields.find((field) => !form[field]);
    if (missingField) {
      alert("Please fill all required fields.");
      return;
    }

    if (!user) {
      alert("Please login again.");
      navigate("/login");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication token missing. Please login again.");
      navigate("/login");
      return;
    }

    // 1. Pack all text fields and files into FormData
    const submitData = new FormData();
    Object.keys(form).forEach(key => submitData.append(key, form[key]));
    
    if (invoiceFile) submitData.append("invoiceDocument", invoiceFile);
    
    // 2. Make a single fetch request
    try {
      setSubmitting(true);
      const response = await fetch(`${API_URL}/api/instruments`, {
        method: "POST",
        headers: {
           Authorization: `Bearer ${token}`
           // DO NOT set Content-Type, the browser sets the multipart boundary automatically
        },
        body: submitData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to register instrument");
      }
      
      setGeneratedId(result.data.instrumentId);
      setOcrData(result.data.ocrValidationData);
      
    } catch (error) {
      console.error("Instrument registration failed:", error);
      alert(`Failed to register instrument.\n\n${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <Link
          to="/trader/instruments"
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#164A63]"
        >
          <ArrowLeft size={16} />
          Back to My Instruments
        </Link>
        <h1 className="text-2xl font-semibold text-[#1F2933]">Add New Instrument</h1>
        <p className="mt-1 text-sm text-slate-500">Register an instrument under your existing business account.</p>
      </div>
      <div className="mb-5 rounded-xl border border-[#D9E0E5] bg-white p-6">
        <h2 className="mb-1 text-lg font-semibold text-[#1F2933]">Business Information</h2>
        <p className="mb-5 text-sm text-slate-500">This instrument will be linked to your existing business profile.</p>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Business / Establishment Name</label>
            <input
              value={verifiedBusinessName || user?.name || ""}
              disabled
              className="w-full rounded-lg border border-[#D9E0E5] bg-slate-50 px-4 py-3 text-slate-600"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Trade Category <span className="text-red-500">*</span></label>
            <select
              name="tradeCategory"
              value={form.tradeCategory}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#D9E0E5] bg-white px-4 py-3"
            >
              <option value="">Select Trade</option>
              {tradeCategories.map((trade) => (
                <option key={trade} value={trade}>{trade}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">GSTIN</label>
            <input
              name="gstin"
              value={form.gstin}
              onChange={handleChange}
              placeholder="e.g. 22AAAAA0000A1Z5"
              className="w-full rounded-lg border border-[#D9E0E5] px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Invoice Number</label>
            <input
              name="invoiceNumber"
              value={form.invoiceNumber}
              onChange={handleChange}
              placeholder="e.g. INV-2026-001"
              className="w-full rounded-lg border border-[#D9E0E5] px-4 py-3"
            />
          </div>
        </div>
      </div>
      <div className="mb-5 rounded-xl border border-[#D9E0E5] bg-white p-6">
        <div className="mb-1 flex items-center gap-3">
          <Scale size={20} className="text-[#164A63]" />
          <h2 className="text-lg font-semibold">Instrument Identity</h2>
        </div>
        <p className="mb-5 text-sm text-slate-500">These details create the permanent digital identity of the instrument.</p>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Instrument Type <span className="text-red-500">*</span></label>
            <select
              name="instrumentType"
              value={form.instrumentType}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#D9E0E5] px-4 py-3"
            >
              <option value="">Select Instrument Type</option>
              {instrumentTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Manufacturer <span className="text-red-500">*</span></label>
            <input
              name="manufacturer"
              value={form.manufacturer}
              onChange={handleChange}
              placeholder="e.g. Avery, Essae"
              className="w-full rounded-lg border border-[#D9E0E5] px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Model <span className="text-red-500">*</span></label>
            <input
              name="model"
              value={form.model}
              onChange={handleChange}
              placeholder="Enter model number"
              className="w-full rounded-lg border border-[#D9E0E5] px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Serial Number <span className="text-red-500">*</span></label>
            <input
              name="serialNumber"
              value={form.serialNumber}
              onChange={handleChange}
              placeholder="Manufacturer serial number"
              className="w-full rounded-lg border border-[#D9E0E5] px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Purchase Year</label>
            <input
              type="number"
              name="purchaseYear"
              value={form.purchaseYear}
              onChange={handleChange}
              placeholder="e.g. 2024"
              className="w-full rounded-lg border border-[#D9E0E5] px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Capacity <span className="text-red-500">*</span></label>
            <input
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              placeholder="e.g. 100 kg"
              className="w-full rounded-lg border border-[#D9E0E5] px-4 py-3"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Accuracy Class</label>
            <input
              name="accuracyClass"
              value={form.accuracyClass}
              onChange={handleChange}
              placeholder="e.g. Class III"
              className="w-full rounded-lg border border-[#D9E0E5] px-4 py-3"
            />
          </div>
        </div>
      </div>
      <div className="mb-5 rounded-xl border border-[#D9E0E5] bg-white p-6">
        <div className="mb-1 flex items-center gap-3">
          <MapPin size={20} className="text-[#164A63]" />
          <h2 className="text-lg font-semibold">Installation Location</h2>
        </div>
        <p className="mb-5 text-sm text-slate-500">The current location of the instrument.</p>
        <input
          name="installationLocation"
          value={form.installationLocation}
          onChange={handleChange}
          placeholder="Enter complete installation address"
          className="w-full rounded-lg border border-[#D9E0E5] px-4 py-3"
        />
      </div>
      {/* OCR Data Plate Checker (Only appears once) */}        
      {/* OCR Data Plate Checker (Only appears once) */}        
      <DataPlateChecker 
        onOcrComplete={(file) => {
          setInvoiceFile(file);
        }} 
      />

      {generatedId && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-5">
          <p className="mb-1 text-sm text-green-700">Instrument registered successfully</p>
          <div className="text-2xl font-bold text-green-800">{generatedId}</div>
          <p className="mt-2 text-xs text-green-700 mb-5">This instrument has been saved to the WebFlux system.</p>

          {ocrData && ocrData.length > 0 && (
            <div className="border-t border-green-200 pt-5">
              <h3 className="font-semibold text-green-800 mb-3">System Validation Report</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {ocrData.map((res, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border text-sm flex justify-between items-center ${
                    res.status === "MATCH" ? "bg-white border-green-200" :
                    res.status === "FLAGGED" ? "bg-amber-50 border-amber-200" :
                    res.status === "NOT PROVIDED" ? "bg-slate-50 border-slate-200" :
                    "bg-red-50 border-red-200"
                  }`}>
                    <span className="font-medium text-slate-800">{res.label}: <span className="font-normal">{res.value}</span></span>
                    <span className={`font-bold flex items-center gap-1 ${
                      res.status === "MATCH" ? "text-green-700" :
                      res.status === "FLAGGED" ? "text-amber-700" : 
                      res.status === "NOT PROVIDED" ? "text-slate-500" :
                      "text-red-700"
                    }`}>
                      {res.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Link
                  to="/trader/instruments"
                  className="rounded-lg bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800"
                >
                  Continue to Instruments
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hide the default buttons if successfully generated */}
      {!generatedId && (
        <div className="flex flex-col justify-end gap-3 sm:flex-row">
          <Link
            to="/trader/instruments"
            className="rounded-lg border border-[#D9E0E5] px-5 py-3 text-center text-sm font-medium hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#164A63] px-5 py-3 text-sm font-medium text-white hover:bg-[#123D52] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={17} />
            {submitting ? "Registering..." : "Register Instrument"}
          </button>
        </div>
      )}
    </div>
  );
}

export default AddInstrument;