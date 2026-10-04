import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, UserRound, History, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { authFetch } from "../../auth";

function Transfers() {
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [selectedInstrument, setSelectedInstrument] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [reason, setReason] = useState("");
  
  const [submitted, setSubmitted] = useState(false);
  const [transferId, setTransferId] = useState("");

  // Load Trader's Instruments
  useEffect(() => {
    const fetchInstruments = async () => {
      try {
        setLoading(true);
        const result = await authFetch("/api/instruments");
        const list = Array.isArray(result) ? result : result.data || result.instruments || [];
        setInstruments(list);
      } catch (err) {
        setError(err.message || "Failed to load your instruments.");
      } finally {
        setLoading(false);
      }
    };
    fetchInstruments();
  }, []);

  const selected = instruments.find((instrument) => instrument.instrumentId === selectedInstrument);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedInstrument || !newOwner || !newMobile || !newLocation || !reason) {
      alert("Please complete all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      
      const payload = {
        instrumentId: selectedInstrument,
        previousOwner: selected.currentOwner,
        newOwner,
        newMobile,
        newLocation,
        reason
      };

      const response = await authFetch("/api/transfers", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response.success || response.transferId) {
        setTransferId(response.transferId || response.data?.transferId || `TRF-${Math.floor(100000 + Math.random() * 900000)}`);
        setSubmitted(true);
      } else {
        throw new Error(response.message || "Failed to process transfer.");
      }
    } catch (err) {
      console.error("Transfer error:", err);
      alert(`Transfer failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-[#D9E0E5] rounded-xl p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 size={30} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold text-[#1F2933] mt-5">Transfer Request Submitted</h1>
          <p className="text-sm text-slate-500 mt-2">The ownership transfer request has been created successfully.</p>
          <div className="mt-6 bg-slate-50 border border-[#D9E0E5] rounded-lg p-5 text-left">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <p className="text-xs text-slate-500">Transfer ID</p>
                <p className="font-semibold mt-1">{transferId}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Instrument ID</p>
                <p className="font-semibold mt-1">{selectedInstrument}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Transferred To</p>
                <p className="font-semibold mt-1">{newOwner}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">New Location</p>
                <p className="font-semibold mt-1">{newLocation}</p>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <Link to="/trader/dashboard" className="px-5 py-2.5 bg-[#164A63] text-white rounded-lg text-sm font-medium hover:bg-[#123D52]">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to="/trader/dashboard" className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#164A63]">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-semibold text-[#1F2933]">Ownership Transfer</h1>
        <p className="mt-1 text-sm text-slate-500">Transfer an instrument to a new owner while preserving its verification history.</p>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-5">
          {error}
        </div>
      ) : loading ? (
        <div className="p-12 text-center bg-white border border-[#D9E0E5] rounded-xl">
           <RefreshCw size={25} className="mx-auto animate-spin text-[#164A63]" />
           <p className="text-sm text-slate-500 mt-3">Loading your instruments...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-[#D9E0E5] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5 border-b border-[#E5E7EB] pb-4">
              <History size={19} className="text-[#164A63]" />
              <h2 className="font-semibold text-[#1F2933]">Select Instrument</h2>
            </div>
            
            <label className="block text-sm font-medium text-[#1F2933] mb-2">Instrument to Transfer <span className="text-red-500">*</span></label>
            <select 
              value={selectedInstrument} 
              onChange={(e) => setSelectedInstrument(e.target.value)}
              className="w-full border border-[#CBD5DB] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#164A63]"
              required
            >
              <option value="">-- Select an instrument --</option>
              {instruments.map(inst => (
                <option key={inst.instrumentId} value={inst.instrumentId}>
                  {inst.instrumentId} - {inst.instrumentType}
                </option>
              ))}
            </select>

            {selected && (
              <div className="mt-5 bg-slate-50 border border-[#D9E0E5] rounded-lg p-4 grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Current Owner</p>
                  <p className="text-sm font-semibold mt-1">{selected.currentOwner || "You"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Current Location</p>
                  <p className="text-sm font-semibold mt-1">{selected.installationLocation}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Serial Number</p>
                  <p className="text-sm font-semibold mt-1">{selected.serialNumber}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-[#D9E0E5] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5 border-b border-[#E5E7EB] pb-4">
              <UserRound size={19} className="text-[#164A63]" />
              <h2 className="font-semibold text-[#1F2933]">New Owner Details</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[#1F2933] mb-2">New Owner / Business Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  placeholder="Enter full name or business"
                  className="w-full border border-[#CBD5DB] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#164A63]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2933] mb-2">Mobile Number <span className="text-red-500">*</span></label>
                <input 
                  type="tel" 
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="w-full border border-[#CBD5DB] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#164A63]"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#1F2933] mb-2">New Installation Location <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Complete address where instrument will be used"
                  className="w-full border border-[#CBD5DB] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#164A63]"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#1F2933] mb-2">Reason for Transfer <span className="text-red-500">*</span></label>
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Sold to another business, Relocated"
                  rows={3}
                  className="w-full border border-[#CBD5DB] rounded-lg px-4 py-3 text-sm outline-none focus:border-[#164A63] resize-none"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link to="/trader/dashboard" className="px-5 py-3 border border-[#D9E0E5] rounded-lg text-sm font-medium hover:bg-slate-50">
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={submitting || !selectedInstrument}
              className="px-5 py-3 bg-[#164A63] text-white rounded-lg text-sm font-medium hover:bg-[#123D52] disabled:opacity-60"
            >
              {submitting ? "Processing..." : "Submit Transfer Request"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Transfers;