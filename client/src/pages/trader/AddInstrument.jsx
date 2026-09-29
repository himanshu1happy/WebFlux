import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Scale,
  MapPin,
} from "lucide-react";

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

  const [form, setForm] = useState({
    tradeCategory: "",
    instrumentType: "",
    manufacturer: "",
    model: "",
    serialNumber: "",
    capacity: "",
    accuracyClass: "",
    installationLocation: "",
  });

  const [generatedId, setGeneratedId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
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

    const missingField = requiredFields.find(
      (field) => !form[field]
    );

    if (missingField) {
      alert("Please fill all required fields.");
      return;
    }

    // Generate Instrument ID for now.
    // Later we will move this generation completely to the backend.
    const randomNumber = Math.floor(
      10000 + Math.random() * 90000
    );

    const instrumentId =
      form.instrumentType === "Fuel Dispenser"
        ? `LM-FD-${randomNumber}`
        : `LM-WM-${randomNumber}`;

    const instrumentData = {
      instrumentId,
      tradeCategory: form.tradeCategory,
      instrumentType: form.instrumentType,
      manufacturer: form.manufacturer,
      model: form.model,
      serialNumber: form.serialNumber,
      capacity: form.capacity,
      accuracyClass: form.accuracyClass,
      currentOwner: "Rahul Traders",
      installationLocation: form.installationLocation,
      status: "Pending Verification",

      lifecycleHistory: [
        {
          event: "Instrument registered",
          description:
            "Instrument registered through WebFlux",
          performedBy: "Rahul Traders",
        },
      ],
    };

    try {
      setSubmitting(true);

      const response = await fetch(
        "http://localhost:5000/api/instruments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(instrumentData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to register instrument"
        );
      }

      setGeneratedId(result.data.instrumentId);

      alert(
        `Instrument registered successfully!\n\nInstrument ID: ${result.data.instrumentId}`
      );

      navigate("/trader/instruments");
    } catch (error) {
      console.error(
        "Instrument registration failed:",
        error
      );

      alert(
        `Failed to register instrument.\n\n${error.message}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/trader/instruments"
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#164A63]"
        >
          <ArrowLeft size={16} />
          Back to My Instruments
        </Link>

        <h1 className="text-2xl font-semibold text-[#1F2933]">
          Add New Instrument
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Register an instrument under your existing business account.
        </p>
      </div>

      {/* Business Information */}
      <div className="mb-5 rounded-xl border border-[#D9E0E5] bg-white p-6">
        <h2 className="mb-1 text-lg font-semibold text-[#1F2933]">
          Business Information
        </h2>

        <p className="mb-5 text-sm text-slate-500">
          This instrument will be linked to your existing business profile.
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Business / Establishment Name
            </label>

            <input
              value="Rahul Traders"
              disabled
              className="w-full rounded-lg border border-[#D9E0E5] bg-slate-50 px-4 py-3 text-slate-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Trade Category{" "}
              <span className="text-red-500">*</span>
            </label>

            <select
              name="tradeCategory"
              value={form.tradeCategory}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#D9E0E5] bg-white px-4 py-3"
            >
              <option value="">Select Trade</option>

              {tradeCategories.map((trade) => (
                <option key={trade} value={trade}>
                  {trade}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Instrument Identity */}
      <div className="mb-5 rounded-xl border border-[#D9E0E5] bg-white p-6">
        <div className="mb-1 flex items-center gap-3">
          <Scale size={20} className="text-[#164A63]" />

          <h2 className="text-lg font-semibold">
            Instrument Identity
          </h2>
        </div>

        <p className="mb-5 text-sm text-slate-500">
          These details create the permanent digital identity of the instrument.
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Instrument Type{" "}
              <span className="text-red-500">*</span>
            </label>

            <select
              name="instrumentType"
              value={form.instrumentType}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#D9E0E5] px-4 py-3"
            >
              <option value="">
                Select Instrument Type
              </option>

              {instrumentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Manufacturer{" "}
              <span className="text-red-500">*</span>
            </label>

            <input
              name="manufacturer"
              value={form.manufacturer}
              onChange={handleChange}
              placeholder="e.g. Avery, Essae"
              className="w-full rounded-lg border border-[#D9E0E5] px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Model <span className="text-red-500">*</span>
            </label>

            <input
              name="model"
              value={form.model}
              onChange={handleChange}
              placeholder="Enter model number"
              className="w-full rounded-lg border border-[#D9E0E5] px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Serial Number{" "}
              <span className="text-red-500">*</span>
            </label>

            <input
              name="serialNumber"
              value={form.serialNumber}
              onChange={handleChange}
              placeholder="Manufacturer serial number"
              className="w-full rounded-lg border border-[#D9E0E5] px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Capacity <span className="text-red-500">*</span>
            </label>

            <input
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              placeholder="e.g. 100 kg"
              className="w-full rounded-lg border border-[#D9E0E5] px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Accuracy Class
            </label>

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

      {/* Location */}
      <div className="mb-5 rounded-xl border border-[#D9E0E5] bg-white p-6">
        <div className="mb-1 flex items-center gap-3">
          <MapPin size={20} className="text-[#164A63]" />

          <h2 className="text-lg font-semibold">
            Installation Location
          </h2>
        </div>

        <p className="mb-5 text-sm text-slate-500">
          The current location of the instrument.
        </p>

        <input
          name="installationLocation"
          value={form.installationLocation}
          onChange={handleChange}
          placeholder="Enter complete installation address"
          className="w-full rounded-lg border border-[#D9E0E5] px-4 py-3"
        />
      </div>

      {/* Generated ID */}
      {generatedId && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-5">
          <p className="mb-1 text-sm text-green-700">
            Instrument registered successfully
          </p>

          <div className="text-2xl font-bold text-green-800">
            {generatedId}
          </div>

          <p className="mt-2 text-xs text-green-700">
            This instrument has been saved to the WebFlux system.
          </p>
        </div>
      )}

      {/* Actions */}
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

          {submitting
            ? "Registering..."
            : "Register Instrument"}
        </button>
      </div>
    </div>
  );
}

export default AddInstrument;