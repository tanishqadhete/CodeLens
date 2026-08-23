import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Network,
  GitBranch,
  MessageSquare,
  Info,
  FolderCode,
} from "lucide-react";

function Sidebar() {
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
