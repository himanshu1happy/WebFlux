import {
  FileCheck2,
  Download,
  Eye,
  CheckCircle2,
} from "lucide-react";

const certificates = [
  {
    id: "CERT-2026-00981",
    instrumentId: "LM-WM-00124",
    type: "Electronic Weighing Machine",
    trader: "Rahul Traders",
    issueDate: "15 Sep 2026",
    validUntil: "14 Sep 2027",
    status: "Valid",
  },
  {
    id: "CERT-2026-00982",
    instrumentId: "LM-WM-00125",
    type: "Platform Weighing Machine",
    trader: "Rahul Traders",
    issueDate: "15 Sep 2026",
    validUntil: "02 Oct 2027",
    status: "Valid",
  },
];

function Certificates() {
  return (
    <div className="max-w-7xl mx-auto">

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#1F2933]">
          Digital Certificates
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          View certificates issued after completed instrument verification.
        </p>
      </div>

      <div className="bg-white border border-[#D9E0E5] rounded-xl overflow-hidden">

        <div className="p-5 border-b border-[#D9E0E5]">
          <div className="flex items-center gap-2">
            <FileCheck2
              size={20}
              className="text-[#164A63]"
            />

            <h2 className="font-semibold">
              Issued Certificates
            </h2>
          </div>
        </div>

        <div className="divide-y divide-[#D9E0E5]">

          {certificates.map((certificate) => (

            <div
              key={certificate.id}
              className="p-5 hover:bg-slate-50 transition"
            >

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                <div>

                  <div className="flex flex-wrap items-center gap-2">

                    <h3 className="font-semibold text-[#1F2933]">
                      {certificate.id}
                    </h3>

                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                      <CheckCircle2 size={13} />
                      {certificate.status}
                    </span>

                  </div>

                  <p className="text-sm text-slate-700 mt-2">
                    {certificate.instrumentId} — {certificate.type}
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    Trader: {certificate.trader}
                  </p>

                  <div className="flex flex-wrap gap-5 text-xs text-slate-500 mt-3">
                    <span>
                      Issued: {certificate.issueDate}
                    </span>

                    <span>
                      Valid Until: {certificate.validUntil}
                    </span>
                  </div>

                </div>

                <div className="flex gap-2">

                  <button
                    onClick={() =>
                      alert("Certificate preview will be connected later.")
                    }
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#D9E0E5] rounded-lg text-sm font-medium hover:bg-white"
                  >
                    <Eye size={16} />
                    View
                  </button>

                  <button
                    onClick={() =>
                      alert("PDF generation will be connected later.")
                    }
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#164A63] text-white rounded-lg text-sm font-medium hover:bg-[#123D52]"
                  >
                    <Download size={16} />
                    Download
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default Certificates;