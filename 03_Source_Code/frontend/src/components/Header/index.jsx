import { GoBell } from "react-icons/go";

export default function Header() {
  return (
    <header className=" border-b border-gray-200 px-8 py-2">
      <div className="flex items-center justify-between gap-6">
        {/* Left Section - Welcome Text */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back (USER)👋</h1>
        </div>

        {/* Right Section - Icons & Profile */}
        <div className="flex items-center gap-6">
          <button className="text-gray-600 hover:text-gray-900 transition-colors">
            <GoBell size={20} />
          </button>
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop"
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
        </div>
      </div>
    </header>
  );
}
