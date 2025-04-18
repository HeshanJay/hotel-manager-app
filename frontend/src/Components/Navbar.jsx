import { FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  return (
    <div className="fixed top-0 left-64 right-0 bg-white shadow-sm z-50">
      <div className="flex justify-end items-center h-16 px-6">
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="font-semibold">Nimsara Perera</p>
            <p className="text-sm text-gray-500">Admin</p>
          </div>
          <FaUserCircle className="text-3xl text-gray-600" />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
