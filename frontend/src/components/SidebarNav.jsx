
import { NavLink } from "react-router-dom";

function SidebarNav() {
  
  const baseClass =
    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all";
  const activeClass = "bg-indigo-600 text-white shadow-md";
  const normalClass =
    "text-gray-300 hover:bg-gray-800 hover:text-white";

  return (
    <nav className="flex-1 px-4 py-6 space-y-2">
      <NavLink
        to="/dashboard"
        end
        className={({ isActive }) =>
          `${baseClass} ${isActive ? activeClass : normalClass}`
        }
      >
        <LayoutDashboard className="h-5 w-5" strokeWidth={2} />
        <span>Dashboard</span>
      </NavLink>

      <NavLink
        to="/home"
        className={({ isActive }) =>
          `${baseClass} ${isActive ? "bg-gray-800 text-white" : normalClass}`
        }
      >
        <Home className="h-5 w-5" strokeWidth={2} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/weekly-report"
        className={({ isActive }) =>
          `${baseClass} ${isActive ? "bg-gray-800 text-white" : normalClass}`
        }
      >
        <FileText className="h-5 w-5" strokeWidth={2} />
        <span>Weekly Report</span>
      </NavLink>

      <NavLink
        to="/engagement"
        className={({ isActive }) =>
          `${baseClass} ${isActive ? "bg-gray-800 text-white" : normalClass}`
        }
      >
        <Activity className="h-5 w-5" strokeWidth={2} />
        <span>Engagement Timeline</span>
      </NavLink>

      <NavLink
        to="/ai-coach"
        className={({ isActive }) =>
          `${baseClass} ${isActive ? "bg-gray-800 text-white" : normalClass}`
        }
      >
        <Bot className="h-5 w-5" strokeWidth={2} />
        <span>AI Coach Panel</span>
      </NavLink>
    </nav>
  );
}
