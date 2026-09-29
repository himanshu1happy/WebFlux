import { useState } from "react";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  MapPin,
  CalendarDays,
  User,
  FileCheck2,
} from "lucide-react";

function VerifyInstrument() {
  const [instrumentId, setInstrumentId] = useState("");
  const [instrument, setInstrument] = useState(null);

  const verifyInstrument = (e) => {
    e.preventDefault();

    if (!instrumentId.trim()) {
      alert("Please enter an Instrument ID.");
      return;
    }

    // Temporary mock result.
    setInstrument({
      id: instrumentId.toUpperCase(),
      type: "Electronic Weighing Machine",
      manufacturer: "Avery",
      model: "X-200",
      serial: "AVX239812",
      owner: "Rahul Traders",
      location: "Lucknow",
      status: "Verified",
      verifiedOn: "15 Sep 2026",
      validUntil: "14 Sep 2027",
      certificate: "CERT-2026-00981",
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F7F8]">

      {/* Header */}
      <header className="bg-white border-b border-[#D9E0E5]">

        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center gap-3">

          <div className="w-9 h-9 bg-[#164A63] rounded-lg flex items-center justify-center">
            <ShieldCheck
              size={20}
              className="text-white"
            />
          </div>

          <div>
            <h1 className="font-semibold text-[#1F2933]">
              WebFlux
            </h1>

            <p className="text-xs text-slate-500">
              Instrument Verification
            </p>
          </div>

        </div>

      </header>

      <main className="max-w-3xl mx-auto px-5 py-10">

        {/* Search */}
        <div className="bg-white border border-[#D9E0E5] rounded-xl p-6">

          <div className="text-center mb-7">

            <div className="w-12 h-12 mx-auto bg-[#E8F0F4] rounded-full flex items-center justify-center">
              <Search
                size={23}
                className="text-[#164A63]"
              />
            </div>

            <h1 className="text-2xl font-semibold text-[#1F2933] mt-4">
              Verify Instrument
            </h1>

            <p className="text-sm text-slate-500 mt-2">
              Verify the current legal metrology status of an instrument.
            </p>

          </div>

          <form
            onSubmit={verifyInstrument}
            className="flex flex-col sm:flex-row gap-3"
          >

            <input
              value={instrumentId}
              onChange={(e) => setInstrumentId(e.target.value)}
              placeholder="Enter Instrument ID e.g. LM-WM-00124"
              className="flex-1 px-4 py-3 border border-[#D9E0E5] rounded-lg text-sm outline-none focus:border-[#164A63]"
            />

            <button
              type="submit"
              className="px-5 py-3 bg-[#164A63] text-white rounded-lg text-sm font-medium"
            >
              Verify
            </button>

          </form>

        </div>

        {/* Result */}
        {instrument && (

          <div className="bg-white border border-[#D9E0E5] rounded-xl mt-5 overflow-hidden">

            <div className="p-6 border-b border-[#D9E0E5]">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <p className="text-xs text-slate-500">
                    Digital Instrument ID
                  </p>

                  <h2 className="text-xl font-semibold mt-1">
                    {instrument.id}
                  </h2>

                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                  <CheckCircle2 size={14} />
                  {instrument.status}
                </span>

              </div>

            </div>

            <div className="p-6">

              <h3 className="font-semibold mb-5">
                Instrument Details
              </h3>

              <div className="grid sm:grid-cols-2 gap-5">

                <div>
                  <p className="text-xs text-slate-500">
                    Instrument Type
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {instrument.type}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Manufacturer
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {instrument.manufacturer}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Model
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {instrument.model}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Serial Number
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {instrument.serial}
                  </p>
                </div>

              </div>

              <div className="border-t border-[#D9E0E5] mt-6 pt-6">

                <h3 className="font-semibold mb-5">
                  Current Status
                </h3>

                <div className="space-y-4">

                  <div className="flex gap-3">
                    <User
                      size={18}
                      className="text-[#164A63]"
                    />

                    <div>
                      <p className="text-xs text-slate-500">
                        Current Owner
                      </p>
                      <p className="text-sm font-medium">
                        {instrument.owner}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <MapPin
                      size={18}
                      className="text-[#164A63]"
                    />

                    <div>
                      <p className="text-xs text-slate-500">
                        Registered Location
                      </p>
                      <p className="text-sm font-medium">
                        {instrument.location}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <CalendarDays
                      size={18}
                      className="text-[#164A63]"
                    />

                    <div>
                      <p className="text-xs text-slate-500">
                        Last Verification
                      </p>
                      <p className="text-sm font-medium">
                        {instrument.verifiedOn}
                      </p>
                    </div>
                  </div>

                </div>

              </div>

              <div className="border-t border-[#D9E0E5] mt-6 pt-6">

                <div className="flex gap-3">

                  <FileCheck2
                    size={19}
                    className="text-green-600"
                  />

                  <div>

                    <p className="text-xs text-slate-500">
                      Certificate
                    </p>

                    <p className="text-sm font-semibold">
                      {instrument.certificate}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Valid until {instrument.validUntil}
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        )}

        <p className="text-xs text-slate-400 text-center mt-6">
          WebFlux Digital Instrument Verification System
        </p>

      </main>

    </div>
  );
}

export default VerifyInstrument;