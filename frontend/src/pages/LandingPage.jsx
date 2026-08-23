import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();

  const [zipFile, setZipFile] = useState(null);
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("zip");

  const uploadZip = async () => {
    if (!zipFile) {
      alert("Please select a ZIP file.");
      return;
    }

    const formData = new FormData();
    formData.append("zipFile", zipFile);

    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/upload`,
        formData
      );

      console.log(res.data);

      localStorage.setItem(
        "projectPath",
        res.data.projectPath
      );

      localStorage.setItem(
        "projectName",
        res.data.projectName
      );

      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      alert("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const uploadGithub = async () => {
    if (!repoUrl.trim()) {
      alert("Please enter a GitHub repository URL.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/upload/github`,
        {
          repoUrl,
        }
      );

      console.log(res.data);

      localStorage.setItem(
        "projectPath",
        res.data.projectPath
      );

      localStorage.setItem(
        "projectName",
        res.data.projectName
      );

      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      alert("Repository cloning failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page">

      <div className="landing-container">

        {/* Hero */}
        <section className="landing-hero">

          <div className="landing-badge">
            <span className="landing-badge-dot" />
            Repository Intelligence
          </div>

          <h1 className="landing-title">
            CodeLens
          </h1>

          <h2 className="landing-heading">
            Understand your codebase
            <span> from a different lens.</span>
          </h2>

          <p className="landing-description">
            Upload a ZIP file or connect a GitHub repository to
            understand an unfamiliar codebase. Explore dependency
            graphs, visualize API flows, inspect repository statistics,
            and chat with your code using Retrieval-Augmented
            Generation (RAG).
          </p>

        </section>


        {/* Repository Import */}
        <section className="repository-import-card">

          {/* Header */}
          <div className="repository-import-header">

            <div>
              <div className="repository-import-eyebrow">
                GET STARTED
              </div>

              <h2>
                Bring your repository into CodeLens
              </h2>

              <p>
                Choose how you want to provide your repository.
              </p>
            </div>

          </div>


          {/* Tabs */}
          <div className="import-tabs">

            <button
              className={`import-tab ${
                activeTab === "zip"
                  ? "import-tab-active"
                  : ""
              }`}
              onClick={() => setActiveTab("zip")}
              disabled={loading}
            >
              <span className="tab-icon">📦</span>
              Upload ZIP
            </button>

            <button
              className={`import-tab ${
                activeTab === "github"
                  ? "import-tab-active"
                  : ""
              }`}
              onClick={() => setActiveTab("github")}
              disabled={loading}
            >
              <span className="tab-icon">🔗</span>
              GitHub Repository
            </button>

            <div
              className={`import-tab-slider ${
                activeTab === "github"
                  ? "slider-github"
                  : ""
              }`}
            />

          </div>


          {/* Content */}
          <div className="import-tab-content">

            {activeTab === "zip" ? (

              <div className="import-panel">

                <div className="import-panel-icon">
                  📦
                </div>

                <div className="import-panel-text">

                  <h3>
                    Upload your project
                  </h3>

                  <p>
                    Select a ZIP archive containing your
                    project files. CodeLens will analyze its
                    structure and dependencies.
                  </p>

                </div>

                <label className="zip-picker">

                  <input
                    type="file"
                    accept=".zip"
                    onChange={(e) =>
                      setZipFile(e.target.files[0])
                    }
                    disabled={loading}
                  />

                  <span>
                    {zipFile
                      ? zipFile.name
                      : "Choose ZIP file"}
                  </span>

                  <span className="picker-arrow">
                    →
                  </span>

                </label>

                <button
                  className="landing-button"
                  onClick={uploadZip}
                  disabled={loading}
                >
                  {loading
                    ? "Analyzing..."
                    : "Upload ZIP"}

                  <span>→</span>
                </button>

              </div>

            ) : (

              <div className="import-panel">

                <div className="import-panel-icon">
                  🔗
                </div>

                <div className="import-panel-text">

                  <h3>
                    Connect a GitHub repository
                  </h3>

                  <p>
                    Paste the URL of a public GitHub
                    repository and CodeLens will clone and
                    analyze it.
                  </p>

                </div>

                <input
                  className="landing-github-input"
                  type="text"
                  placeholder="https://github.com/user/repository"
                  value={repoUrl}
                  onChange={(e) =>
                    setRepoUrl(e.target.value)
                  }
                  disabled={loading}
                />

                <button
                  className="landing-button"
                  onClick={uploadGithub}
                  disabled={loading}
                >
                  {loading
                    ? "Analyzing..."
                    : "Analyze Repository"}

                  <span>→</span>
                </button>

              </div>

            )}

          </div>


          {/* Loading */}
          {loading && (
            <div className="landing-loading">

              <span className="landing-spinner" />

              Analyzing repository...

            </div>
          )}

        </section>


        {/* Capabilities */}
        <section className="landing-capabilities">

          <div className="capabilities-heading">
            <span>
              WHAT YOU CAN EXPLORE
            </span>

            <p>
              One repository. Multiple ways to understand it.
            </p>
          </div>


          <div className="capability-grid">

            <div className="capability-card">

              <div className="capability-icon">
                📊
              </div>

              <h3>
                Repository Overview
              </h3>

              <p>
                See project statistics, technologies,
                files, routes, models and structure.
              </p>

            </div>


            <div className="capability-card">

              <div className="capability-icon">
                🔗
              </div>

              <h3>
                Dependency Graph
              </h3>

              <p>
                Visualize how files connect and understand
                incoming and outgoing dependencies.
              </p>

            </div>


            <div className="capability-card">

              <div className="capability-icon">
                🌿
              </div>

              <h3>
                API Flow
              </h3>

              <p>
                Explore the API endpoints detected inside
                your repository.
              </p>

            </div>


            <div className="capability-card">

              <div className="capability-icon">
                💬
              </div>

              <h3>
                Repository Chat
              </h3>

              <p>
                Ask questions about your codebase using
                retrieval-augmented generation.
              </p>

            </div>

          </div>

        </section>


        {/* Footer statement */}
        <section className="landing-footer">

          <div className="landing-footer-line" />

          <p>
            Stop reading a codebase file by file.
            <strong>
              {" "}Understand how it fits together.
            </strong>
          </p>

        </section>

      </div>

    </div>
  );
}

export default LandingPage;
