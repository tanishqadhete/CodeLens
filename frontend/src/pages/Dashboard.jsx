import { useNavigate } from "react-router-dom";
import {
  FolderCode,
  Network,
  GitBranch,
  MessageSquare,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();

  const projectName =
    localStorage.getItem("projectName") ||
    "No Repository Selected";

  const cards = [
    {
      icon: FolderCode,
      title: "Repository Overview",
      description:
        "Understand the structure, statistics, APIs, and overall health of your repository.",
      route: "/overview",
      label: "Explore repository",
    },
    {
      icon: Network,
      title: "Dependency Graph",
      description:
        "Visualize how files and modules depend on one another across the codebase.",
      route: "/graph",
      label: "View dependencies",
    },
    {
      icon: GitBranch,
      title: "API Flow",
      description:
        "Trace API endpoints from routes through controllers and their underlying logic.",
      route: "/api-flow",
      label: "Explore API flow",
    },
    {
      icon: MessageSquare,
      title: "Repository Chat",
      description:
        "Ask questions about your codebase using semantic retrieval and RAG.",
      route: "/chat",
      label: "Ask about code",
    },
  ];

  return (
    <div className="dashboard-page">

      {/* Header */}
      <header className="dashboard-header">

        <div>
          <div className="dashboard-eyebrow">
            <Sparkles size={14} />
            Repository Intelligence
          </div>

          <h1 className="dashboard-title">
            Welcome to CodeLens
          </h1>

          <p className="dashboard-subtitle">
            Explore your codebase, understand its architecture,
            and trace how everything connects.
          </p>
        </div>

      </header>

      {/* Repository Card */}
      <section className="repository-card">

        <div className="repository-card-left">

          <div className="repository-icon">
            <FolderCode size={22} />
          </div>

          <div>
            <div className="repository-label">
              CURRENT REPOSITORY
            </div>

            <h2 className="repository-name">
              {projectName}
            </h2>

            <div className="repository-status">
              <CheckCircle2 size={14} />
              Indexed and ready for analysis
            </div>
          </div>

        </div>

        <div className="repository-badge">
          <span />
          Active
        </div>

      </section>

      {/* Section heading */}
      <div className="modules-heading">

        <div>
          <h2>Explore your repository</h2>

          <p>
            Choose an analysis tool to understand a different
            aspect of your codebase.
          </p>
        </div>

      </div>

      {/* Analysis modules */}
      <section className="module-grid">

        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <button
              key={card.title}
              className="module-card"
              onClick={() => navigate(card.route)}
            >

              <div className="module-card-top">

                <div className="module-icon">
                  <Icon size={21} strokeWidth={1.8} />
                </div>

                <ArrowUpRight
                  className="module-arrow"
                  size={19}
                />

              </div>

              <div className="module-card-content">

                <h3>{card.title}</h3>

                <p>{card.description}</p>

              </div>

              <div className="module-card-link">
                {card.label}
                <span>→</span>
              </div>

            </button>
          );
        })}

      </section>

    </div>
  );
}

export default Dashboard;
