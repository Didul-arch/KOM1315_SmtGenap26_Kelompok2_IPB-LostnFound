import { NavLink } from "react-router-dom";
import { GoHome, GoSearch, GoInbox, GoPlusCircle } from "react-icons/go";
import { MdOutlineDashboard  } from "react-icons/md";

export default function SidebarUser() {
  return (
    <aside className="w-60 bg-white text-(--text-inactive) min-h-screen p-4 outline-1">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">FoundIt</h1>
      </div>
      <nav className="space-y-2 flex flex-col">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-(--background-active)/30 text-(--text-active)" : "hover:bg-(--background-active)/50 hover:text-(--text-active)"}`
          }
        >
          <GoHome />
          Home
        </NavLink>

        <NavLink
          to="/browse"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-(--background-active)/30 text-(--text-active)" : "hover:bg-(--background-active)/50 hover:text-(--text-active)"}`
          }
        >
          <GoSearch />
          Browse
        </NavLink>

        <NavLink
          to="/report"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-(--background-active)/30 text-(--text-active)" : "hover:bg-(--background-active)/50 hover:text-(--text-active)"}`
          }
        >
          <GoPlusCircle />
          Report
        </NavLink>

        <NavLink
          to="/claims"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-(--background-active)/30 text-(--text-active)" : "hover:bg-(--background-active)/50 hover:text-(--text-active)"}`
          }
        >
          <GoInbox />
          Claims
        </NavLink>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-(--background-active)/30 text-(--text-active)" : "hover:bg-(--background-active)/50 hover:text-(--text-active)"}`
          }
        >
          <MdOutlineDashboard  />
          Dashboard
        </NavLink>
      </nav>
    </aside>
  );
}
