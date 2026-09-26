import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Network,
  GitBranch,
  MessageSquare,
  Info,
  FolderCode,
  Trash2,
} from "lucide-react";
import axios from "axios";

function Sidebar() {
  const navigate = useNavigate();

  const links = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Repository Overview",
      path: "/overview",
      icon: FolderCode,
    },
    {
      name: "Dependency Graph",
      path: "/graph",
      icon: Network,
    },
    {
      name: "API Flow",
      path: "/api-flow",
      icon: GitBranch,
    },
    {
      name: "Repository Chat",
      path: "/chat",
      icon: MessageSquare,
    },
  ];

  const handleDeleteProject = async () => {
    const projectId = localStorage.getItem("projectId");

    if (!projectId) {
      navigate("/");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this project? This will remove the indexed repository data and cannot be undone."
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/projects/${projectId}`
      );

      localStorage.removeItem("projectId");
      localStorage.removeItem("projectName");

      navigate("/");
    } catch (error) {
      console.error("Failed to delete project:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete project. Please try again."
      );
    }
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <span>CL</span>
        </div>

        <div>
          <div className="sidebar-logo-name">
            CodeLens
          </div>

          <div className="sidebar-logo-subtitle">
            Repository Intelligence
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">
          ANALYZE
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive ? "sidebar-link-active" : ""
                  }`
                }
              >
                <Icon size={18} strokeWidth={1.8} />

                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="sidebar-bottom">
        <NavLink
          to="/about"
          className={({ isActive }) =>
            `sidebar-link ${
              isActive ? "sidebar-link-active" : ""
            }`
          }
        >
          <Info size={18} strokeWidth={1.8} />
          <span>About CodeLens</span>
        </NavLink>

        <button
          type="button"
          className="sidebar-link sidebar-delete-link"
          onClick={handleDeleteProject}
        >
          <Trash2 size={18} strokeWidth={1.8} />
          <span>Delete Project</span>
        </button>

        <div className="sidebar-footer">
          <div className="sidebar-footer-dot" />

          <div>
            <div className="sidebar-footer-title">
              Repository indexed
            </div>

            <div className="sidebar-footer-text">
              Ready for analysis
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;