import { useEffect, useState } from "react";
import {
  FolderCode,
  BarChart3,
  Cpu,
  Folder,
  FileCode2,
  Layers3,
  Server,
  Route,
} from "lucide-react";

function RepositoryOverview() {
  const [overview, setOverview] = useState(null);

  // Get the project name saved when the repository was uploaded
  const projectName =
    localStorage.getItem("projectName") || "Unknown Project";

  useEffect(() => {
    fetchOverview();
  }, []);

  async function fetchOverview() {
    try {
      const projectPath =
        localStorage.getItem("projectPath");

      const response = await fetch(
        "http://localhost:5000/api/overview",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectPath,
          }),
        }
      );

      const data = await response.json();

      setOverview(data);
    } catch (err) {
      console.log(err);
    }
  }

  if (!overview) {
    return (
      <div className="overview-loading">
        <div className="overview-loading-icon">
          <Cpu size={20} />
        </div>

        <span>Loading repository analysis...</span>
      </div>
    );
  }

  const statistics = [
    {
      title: "Files",
      value: overview.stats.files,
      icon: FileCode2,
    },
    {
      title: "APIs",
      value: overview.stats.apis,
      icon: Route,
    },
    {
      title: "Models",
      value: overview.stats.models,
      icon: Layers3,
    },
    {
      title: "Controllers",
      value: overview.stats.controllers,
      icon: Server,
    },
    {
      title: "Routes",
      value: overview.stats.routes,
      icon: Route,
    },
    {
      title: "Middleware",
      value: overview.stats.middleware,
      icon: Cpu,
    },
  ];

  return (
    <div className="overview-page">

      {/* Header */}
      <header className="overview-header">
        <div className="overview-eyebrow">
          <FolderCode size={14} />
          Repository Analysis
        </div>

        <h1 className="overview-title">
          Repository Overview
        </h1>

        <p className="overview-subtitle">
          Get a high-level understanding of your repository,
          its structure, technologies, and key statistics.
        </p>
      </header>

      {/* Project Information */}
      <section className="overview-project-card">

        <div className="overview-project-icon">
          <FolderCode size={23} />
        </div>

        <div className="overview-project-content">

          <div className="overview-label">
            CURRENT PROJECT
          </div>

          <h2>
            {projectName}
          </h2>

          <p>
            {overview.summary}
          </p>

        </div>

        <div className="overview-project-status">
          <span />
          Analyzed
        </div>

      </section>

      {/* Statistics */}
      <section className="overview-section">

        <div className="overview-section-heading">
          <div className="overview-section-icon">
            <BarChart3 size={18} />
          </div>

          <div>
            <h2>Repository Statistics</h2>

            <p>
              A quick snapshot of the codebase.
            </p>
          </div>
        </div>

        <div className="overview-stats-grid">

          {statistics.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="overview-stat-card"
              >
                <div className="overview-stat-top">
                  <div className="overview-stat-icon">
                    <Icon size={18} />
                  </div>
                </div>

                <div className="overview-stat-value">
                  {item.value}
                </div>

                <div className="overview-stat-title">
                  {item.title}
                </div>
              </div>
            );
          })}

        </div>

      </section>

      {/* Tech Stack */}
      <section className="overview-section">

        <div className="overview-section-heading">
          <div className="overview-section-icon">
            <Cpu size={18} />
          </div>

          <div>
            <h2>Technology Stack</h2>

            <p>
              Technologies detected in the repository.
            </p>
          </div>
        </div>

        <div className="overview-tech-grid">

          {overview.techStack.map((tech) => (
            <div
              key={tech}
              className="overview-tech"
            >
              <span className="overview-tech-dot" />
              {tech}
            </div>
          ))}

        </div>

      </section>

      {/* Folder Structure */}
      <section className="overview-section">

        <div className="overview-section-heading">
          <div className="overview-section-icon">
            <Folder size={18} />
          </div>

          <div>
            <h2>Folder Structure</h2>

            <p>
              Top-level folders detected in the repository.
            </p>
          </div>
        </div>

        <div className="overview-folder-card">

          {overview.folderStructure.map((folder, index) => (
            <div
              key={folder}
              className="overview-folder"
            >
              <Folder size={17} />

              <span>{folder}</span>

              <span className="overview-folder-number">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
          ))}

        </div>

      </section>

    </div>
  );
}

export default RepositoryOverview;
