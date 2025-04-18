import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaBed,
  FaCalendarAlt,
  FaUsers,
  FaUtensils,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar = () => {
  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, path: "/" }, // Added Dashboard
    { name: "Room Booking", icon: <FaBed />, path: "/room-booking" },
    { name: "Event Booking", icon: <FaCalendarAlt />, path: "/event-booking" },
    { name: "Kitchen Items", icon: <FaUtensils />, path: "/kitchenForm" },
    { name: "Employees", icon: <FaUsers />, path: "/employee-management" },
  ];

  return (
    <div className="w-64 bg-slate-800 min-h-screen p-4 fixed left-0 top-0">
      <div className="text-white text-2xl font-bold mb-8 px-2">Hotel Admin</div>
      <nav>
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center p-3 mb-2 rounded-lg transition-colors 
              ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-700"
              }`
            }
          >
            <span className="mr-3 text-xl">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="absolute bottom-4 left-4 right-4">
        <button className="w-full flex items-center p-3 text-slate-300 hover:bg-slate-700 rounded-lg">
          <FaSignOutAlt className="mr-3 text-xl" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
