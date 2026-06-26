import { SlLocationPin } from "react-icons/sl";
import { GoArrowRight } from "react-icons/go";
import { Link } from "react-router-dom";

export default function CardItem({
  index,
  name,
  image,
  status,
  location,
  date,
}) {
  const getStatusColor = (status) => {
    return status === "Found" ? "bg-blue-600" : "bg-red-600";
  };

  return (
    <div
      key={index}
      className="w-58.25 h-77.5 rounded-lg border border-gray-300 overflow-hidden bg-white hover:shadow-lg transition-shadow"
    >
      {/* Image Container */}
      <div className="relative w-full h-40 bg-gray-200">
        <img src={image} alt={name} className="w-full h-full object-cover" />
        {/* Status Badge */}
        <div
          className={`absolute top-3 left-3 ${getStatusColor(
            status,
          )} text-white px-3 py-1 rounded text-xs font-bold`}
        >
          {status.toUpperCase()}
        </div>
      </div>
      {/* Content Container */}
      <div className="p-4 flex flex-col gap-3 justify-between h-30">
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-3">{name}</h3>
          {/* Location */}
          <div className="flex items-center gap-2 mb-2">
            <SlLocationPin size={16} className="text-gray-500 shrink-0" />
            <p className="text-sm text-gray-600">{location}</p>
          </div>
          {/* Date */}
          <p className="text-sm text-gray-500">{date}</p>
        </div>
        {/* Button at Bottom */}
        <div className="flex justify-center">
          <Link
            to={`/report`}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors inline-flex items-center justify-center"
          >
            <GoArrowRight size={18} className="text-black-500" />
          </Link>
        </div>
      </div>
    </div>
  );
}
