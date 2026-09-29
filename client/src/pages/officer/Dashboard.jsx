import {
  ClipboardCheck,
  Clock3,
  CheckCircle2,
  XCircle,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const inspections = [
  {
    id: "INS-2026-00421",
    instrumentId: "LM-FD-00321",
    type: "Fuel Dispenser",
    trader: "Sharma Petroleum",
    location: "Kanpur Road, Lucknow",
    date: "28 Sep 2026",
    status: "Pending",
  },
  {
    id: "INS-2026-00422",
    instrumentId: "LM-WM-00781",
    type: "Electronic Weighing Machine",
    trader: "Gupta Traders",
    location: "Aliganj, Lucknow",
    date: "29 Sep 2026",
    status: "Scheduled",
  },
  {
    id: "INS-2026-00423",
    instrumentId: "LM-WM-00795",
    type: "Platform Weighing Machine",
    trader: "Kisan Procurement Centre",
    location: "Malihabad, Lucknow",
    date: "30 Sep 2026",
    status: "Scheduled",
  },
];

function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-7">

        <h1 className="text-2xl font-semibold text-[#1F2933]">
          Officer Dashboard
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Manage assigned inspections and verification activities.
        </p>

      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">

        <div className="bg-white border border-[#D9E0E5] rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Assigned Inspections
              </p>

              <p className="text-2xl font-semibold mt-1">
                18
              </p>
            </div>

            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <ClipboardCheck
                size={20}
                className="text-[#164A63]"
              />
            </div>

          </div>

        </div>

        <div className="bg-white border border-[#D9E0E5] rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Pending
              </p>

              <p className="text-2xl font-semibold mt-1">
                7
              </p>
            </div>

            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock3
                size={20}
                className="text-amber-600"
              />
            </div>

          </div>

        </div>

        <div className="bg-white border border-[#D9E0E5] rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Passed
              </p>

              <p className="text-2xl font-semibold mt-1">
                9
              </p>
            </div>

            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle2
                size={20}
                className="text-green-600"
              />
            </div>

          </div>

        </div>

        <div className="bg-white border border-[#D9E0E5] rounded-xl p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Failed
              </p>

              <p className="text-2xl font-semibold mt-1">
                2
              </p>
            </div>

            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <XCircle
                size={20}
                className="text-red-600"
              />
            </div>

          </div>

        </div>

      </div>

      {/* Today's inspections */}
      <div className="bg-white border border-[#D9E0E5] rounded-xl">

        <div className="p-5 border-b border-[#D9E0E5] flex items-center justify-between">

          <div>
            <h2 className="font-semibold text-[#1F2933]">
              Assigned Inspections
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Inspections requiring your attention
            </p>
          </div>

          <Link
            to="/officer/inspections"
            className="text-sm font-medium text-[#164A63] flex items-center gap-1 hover:underline"
          >
            View All
            <ArrowRight size={15} />
          </Link>

        </div>

        <div className="divide-y divide-[#D9E0E5]">

          {inspections.map((inspection) => (

            <div
              key={inspection.id}
              className="p-5 hover:bg-slate-50 transition"
            >

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                <div className="flex-1">

                  <div className="flex flex-wrap items-center gap-2 mb-2">

                    <span className="font-semibold text-[#1F2933]">
                      {inspection.id}
                    </span>

                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        inspection.status === "Pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {inspection.status}
                    </span>

                  </div>

                  <p className="text-sm text-slate-700">
                    {inspection.instrumentId} — {inspection.type}
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    Trader: {inspection.trader}
                  </p>

                  <div className="flex items-center gap-1 text-sm text-slate-500 mt-2">
                    <MapPin size={15} />
                    {inspection.location}
                  </div>

                </div>

                <div className="flex items-center gap-4">

                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-slate-500">
                      Inspection Date
                    </p>

                    <p className="text-sm font-medium mt-1">
                      {inspection.date}
                    </p>
                  </div>

                  <Link
                    to={`/officer/inspections/${inspection.id}`}
                    className="px-4 py-2.5 bg-[#164A63] text-white rounded-lg text-sm font-medium hover:bg-[#123D52]"
                  >
                    Open
                  </Link>

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default Dashboard;