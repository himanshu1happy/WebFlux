import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  UserRound,
  History,
} from "lucide-react";
import { Link } from "react-router-dom";

const instruments = [
  {
    id: "LM-WM-00124",
    type: "Electronic Weighing Machine",
    serial: "AVX239812",
    currentOwner: "Rahul Traders",
    location: "Lucknow",
  },
  {
    id: "LM-WM-00125",
    type: "Platform Weighing Machine",
    serial: "AVX239813",
    currentOwner: "Rahul Traders",
    location: "Lucknow",
  },
  {
    id: "LM-FD-00321",
    type: "Fuel Dispenser",
    serial: "FD778821",
    currentOwner: "Rahul Traders",
    location: "Kanpur Road",
  },
];

function Transfers() {
  const [selectedInstrument, setSelectedInstrument] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const selected = instruments.find(
    (instrument) => instrument.id === selectedInstrument
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !selectedInstrument ||
      !newOwner ||
      !newMobile ||
      !newLocation ||
      !reason
    ) {
      alert("Please complete all required fields.");
      return;
    }

    const transfer = {
      transferId: `TRF-${Math.floor(100000 + Math.random() * 900000)}`,
      instrumentId: selectedInstrument,
      previousOwner: selected.currentOwner,
      newOwner,
      newMobile,
      newLocation,
      reason,
      submittedAt: new Date().toISOString(),
    };

    console.log("Ownership transfer request:", transfer);

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto">

        <div className="bg-white border border-[#D9E0E5] rounded-xl p-8 text-center">

          <div className="w-14 h-14 mx-auto rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2
              size={30}
              className="text-green-600"
            />
          </div>

          <h1 className="text-2xl font-semibold text-[#1F2933] mt-5">
            Transfer Request Submitted
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            The ownership transfer request has been created successfully.
          </p>

          <div className="mt-6 bg-slate-50 border border-[#D9E0E5] rounded-lg p-5 text-left">

            <div className="grid sm:grid-cols-2 gap-5">

              <div>
                <p className="text-xs text-slate-500">
                  Transfer ID
                </p>

                <p className="font-semibold mt-1">
                  TRF-202609
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Instrument ID
                </p>

                <p className="font-semibold mt-1">
                  {selectedInstrument}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Previous Owner
                </p>

                <p className="font-medium mt-1">
                  {selected?.currentOwner}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Proposed New Owner
                </p>

                <p className="font-medium mt-1">
                  {newOwner}
                </p>
              </div>

            </div>

          </div>

          <div className="mt-5 p-4 bg-blue-50 border border-blue-100 rounded-lg text-left">

            <p className="text-sm text-blue-800">
              The instrument's Digital Instrument ID and historical records
              remain associated with the instrument. Any verification or
              re-verification requirement will be determined according to the
              applicable rules and circumstances.
            </p>

          </div>

          <Link
            to="/trader/dashboard"
            className="inline-flex items-center gap-2 mt-6 px-5 py-3 bg-[#164A63] text-white rounded-lg text-sm font-medium"
          >
            Back to Dashboard
            <ArrowRight size={16} />
          </Link>

        </div>

      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-6">

        <Link
          to="/trader/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#164A63] mb-4"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-semibold text-[#1F2933]">
          Ownership Transfer
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Request transfer of an instrument to another owner while preserving
          its digital history.
        </p>

      </div>

      {/* Instrument selection */}
      <div className="bg-white border border-[#D9E0E5] rounded-xl p-6 mb-5">

        <div className="flex items-center gap-3 mb-1">

          <History
            size={21}
            className="text-[#164A63]"
          />

          <h2 className="font-semibold">
            Select Instrument
          </h2>

        </div>

        <p className="text-sm text-slate-500 mb-5">
          Select the instrument whose ownership is being transferred.
        </p>

        <select
          value={selectedInstrument}
          onChange={(e) => setSelectedInstrument(e.target.value)}
          className="w-full px-4 py-3 border border-[#D9E0E5] rounded-lg bg-white text-sm"
        >
          <option value="">
            Select Digital Instrument ID
          </option>

          {instruments.map((instrument) => (
            <option
              key={instrument.id}
              value={instrument.id}
            >
              {instrument.id} — {instrument.type}
            </option>
          ))}
        </select>

        {selected && (
          <div className="mt-5 p-4 bg-slate-50 border border-[#D9E0E5] rounded-lg">

            <div className="grid sm:grid-cols-2 gap-4">

              <div>
                <p className="text-xs text-slate-500">
                  Instrument ID
                </p>

                <p className="text-sm font-semibold mt-1">
                  {selected.id}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Serial Number
                </p>

                <p className="text-sm font-medium mt-1">
                  {selected.serial}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Current Owner
                </p>

                <p className="text-sm font-medium mt-1">
                  {selected.currentOwner}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Current Location
                </p>

                <p className="text-sm font-medium mt-1">
                  {selected.location}
                </p>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* New owner */}
      <form onSubmit={handleSubmit}>

        <div className="bg-white border border-[#D9E0E5] rounded-xl p-6 mb-5">

          <div className="flex items-center gap-3 mb-1">

            <UserRound
              size={21}
              className="text-[#164A63]"
            />

            <h2 className="font-semibold">
              New Owner Details
            </h2>

          </div>

          <p className="text-sm text-slate-500 mb-5">
            Enter the proposed owner's details.
          </p>

          <div className="grid md:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm font-medium mb-2">
                New Owner / Business Name{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                placeholder="Enter owner or business name"
                className="w-full px-4 py-3 border border-[#D9E0E5] rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Mobile Number{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                value={newMobile}
                onChange={(e) => setNewMobile(e.target.value)}
                placeholder="10-digit mobile number"
                maxLength={10}
                className="w-full px-4 py-3 border border-[#D9E0E5] rounded-lg text-sm"
              />
            </div>

            <div className="md:col-span-2">

              <label className="block text-sm font-medium mb-2">
                New Installation Location{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Enter the new instrument location"
                className="w-full px-4 py-3 border border-[#D9E0E5] rounded-lg text-sm"
              />

            </div>

          </div>

        </div>

        {/* Reason */}
        <div className="bg-white border border-[#D9E0E5] rounded-xl p-6 mb-5">

          <label className="block text-sm font-semibold mb-2">
            Reason for Transfer{" "}
            <span className="text-red-500">*</span>
          </label>

          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-4 py-3 border border-[#D9E0E5] rounded-lg bg-white text-sm"
          >
            <option value="">
              Select reason
            </option>

            <option value="Sale">
              Sale / Purchase
            </option>

            <option value="Business Transfer">
              Business Transfer
            </option>

            <option value="Business Closure">
              Business Closure
            </option>

            <option value="Relocation">
              Relocation
            </option>

            <option value="Other">
              Other
            </option>

          </select>

        </div>

        {/* Information */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-5">

          <h3 className="font-semibold text-blue-900">
            Digital Instrument Passport
          </h3>

          <p className="text-sm text-blue-800 mt-2">
            The instrument's permanent Digital Instrument ID will remain
            unchanged. Previous ownership, verification and other historical
            records remain part of the instrument's lifecycle history.
          </p>

        </div>

        {/* Submit */}
        <div className="flex justify-end">

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#164A63] text-white rounded-lg text-sm font-medium hover:bg-[#123D52]"
          >
            Submit Transfer Request
            <ArrowRight size={17} />
          </button>

        </div>

      </form>

    </div>
  );
}

export default Transfers;