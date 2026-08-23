import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import UploadPage from "./pages/UploadPage";
import Dashboard from "./pages/Dashboard";
import ApiExplorer from "./pages/ApiExplorer";
import ChatPage from "./pages/ChatPage";
import DeadCode from "./pages/DeadCode";
import DependencyGraphPage from "./pages/DependencyGraphPage";
import DashboardLayout from "./layouts/DashboardLayout";
import ApiFlowPage from "./pages/ApiFlowPage";
import RepositoryOverview from "./pages/RepositoryOverview";
import AboutPage from "./pages/AboutPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Upload */}
        <Route path="/upload" element={<UploadPage />} />

        {/* Dashboard Layout */}
        <Route element={<DashboardLayout />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
    path="/overview"
    element={<RepositoryOverview />}
/>

          <Route
            path="/graph"
            element={<DependencyGraphPage />}
          />

          <Route
            path="/api-flow"
            element={<ApiFlowPage />}
          />

          <Route
            path="/apis"
            element={<ApiExplorer />}
          />

          <Route
            path="/dead-code"
            element={<DeadCode />}
          />

          <Route
            path="/chat"
            element={<ChatPage />}
          />
          <Route
  path="/about"
  element={<AboutPage />}
/>
          <Route
            path="/documentation"
            element={<h1>Documentation</h1>}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;