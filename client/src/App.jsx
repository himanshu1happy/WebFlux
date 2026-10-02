import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

// Public pages
import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import VerifyEmail from "./pages/public/VerifyEmail";
import VerifyInstrument from "./pages/public/VerifyInstrument";
import Certificate from "./pages/public/Certificate";

// Authentication
import ProtectedRoute from "./components/ProtectedRoute";

// Trader layout/pages
import TraderLayout from "./layouts/TraderLayout";
import TraderDashboard from "./pages/trader/Dashboard";
import Instruments from "./pages/trader/Instruments";
import InstrumentDetails from "./pages/trader/InstrumentDetails";
import AddInstrument from "./pages/trader/AddInstrument";
import Applications from "./pages/trader/Applications";
import Transfers from "./pages/trader/Transfers";
import TraderCertificates from "./pages/trader/Certificates";

// Officer layout/pages
import OfficerLayout from "./layouts/OfficerLayout";
import OfficerDashboard from "./pages/officer/Dashboard";
import OfficerInspections from "./pages/officer/Inspections";
import OfficerInspectionDetails from "./pages/officer/InspectionDetails";
import OfficerCertificates from "./pages/officer/Certificates";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==========================================
            PUBLIC ROUTES
        ========================================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/verify-email"
          element={<VerifyEmail />}
        />

        <Route
          path="/verify-instrument"
          element={<VerifyInstrument />}
        />

        <Route
          path="/certificate/:instrumentId"
          element={<Certificate />}
        />


        {/* ==========================================
            TRADER ROUTES
        ========================================== */}

        <Route
          element={
            <ProtectedRoute role="TRADER" />
          }
        >
          <Route
            path="/trader"
            element={<TraderLayout />}
          >

            <Route
              path="dashboard"
              element={<TraderDashboard />}
            />

            <Route
              path="instruments"
              element={<Instruments />}
            />

            <Route
              path="instruments/add"
              element={<AddInstrument />}
            />

            <Route
              path="instruments/:id"
              element={<InstrumentDetails />}
            />

            <Route
              path="applications"
              element={<Applications />}
            />

            <Route
              path="transfers"
              element={<Transfers />}
            />

            <Route
              path="certificates"
              element={<TraderCertificates />}
            />

          </Route>
        </Route>


        {/* ==========================================
            OFFICER ROUTES
        ========================================== */}

        <Route
          element={
            <ProtectedRoute role="OFFICER" />
          }
        >
          <Route
            path="/officer"
            element={<OfficerLayout />}
          >

            <Route
              path="dashboard"
              element={<OfficerDashboard />}
            />

            <Route
              path="inspections"
              element={<OfficerInspections />}
            />

            <Route
              path="inspections/:id"
              element={<OfficerInspectionDetails />}
            />

            <Route
              path="certificates"
              element={<OfficerCertificates />}
            />

          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;