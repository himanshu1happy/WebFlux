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
    issueDate: "15 Sep 2026",
    validUntil: "14 Sep 2027",
    status: "Valid",
  },
  {
    id: "CERT-2026-00982",
    instrumentId: "LM-WM-00125",
    type: "Platform Weighing Machine",
    issueDate: "15 Sep 2026",
    validUntil: "02 Oct 2027",
    status: "Valid",
  },
  {
    id: "CERT-2026-00821",
    instrumentId: "LM-GM-00418",
    type: "LPG Gas Weighing Machine",
    issueDate: "22 Dec 2025",
    validUntil: "21 Dec 2027",
    status: "Valid",
  },
];

function Certificates() {
  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#1F2933]">
          My Certificates
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          View and manage certificates associated with your instruments.
        </p>
      </div>

      {/* Certificate list */}
      <div className="bg-white border border-[#D9E0E5] rounded-xl overflow-hidden">

        <div className="p-5 border-b border-[#D9E0E5] flex items-center gap-3">

          <FileCheck2
            size={20}
            className="text-[#164A63]"
          />

          <div>
            <h2 className="font-semibold">
              Digital Certificates
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              Certificates issued after successful verification.
            </p>
          </div>

        </div>

        <div className="divide-y divide-[#D9E0E5]">

          {certificates.map((certificate) => (

            <div
              key={certificate.id}
              className="p-5 hover:bg-slate-50 transition"
            >

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                <div className="flex-1">

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
                    {certificate.instrumentId}
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    {certificate.type}
                  </p>

                  <div className="flex flex-wrap gap-5 mt-3 text-xs text-slate-500">

                    <span>
                      Issued: {certificate.issueDate}
                    </span>

                    <span>
                      Valid until: {certificate.validUntil}
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
                      alert("PDF download will be connected later.")
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