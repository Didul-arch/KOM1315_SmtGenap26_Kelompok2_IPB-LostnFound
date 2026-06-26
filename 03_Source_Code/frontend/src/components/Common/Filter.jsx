import { useState } from "react";

import { SlLocationPin } from "react-icons/sl";
import { FaChevronDown } from "react-icons/fa";
import { IoCalendarOutline } from "react-icons/io5";


const locations = ["All Locations", "FAPERTA", "SKHB", "FPIK", "FAPET", "LSI"];
const dateRanges = [
  "Last 7 Days",
  "Last 30 Days",
  "Last 90 Days",
  "Last Year",
  "All Time",
];

const DateFilter = () => {
  const [selectedDateRange, setSelectedDateRange] = useState("Last 7 Days");
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
        Date Range
      </h3>
      <div className="relative">
        <button
          onClick={() => setShowDateDropdown(!showDateDropdown)}
          className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
        >
          <span className="text-gray-700 flex items-center gap-2">
            <IoCalendarOutline /> {selectedDateRange}
          </span>
          <FaChevronDown size={18} className="text-gray-400" />
        </button>
        {showDateDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
            {dateRanges.map((range) => (
              <button
                key={range}
                onClick={() => {
                  setSelectedDateRange(range);
                  setShowDateDropdown(false);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors ${
                  selectedDateRange === range
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const LocationFilter = () => {
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
        Location
      </h3>
      <div className="relative">
        <button
          onClick={() => setShowLocationDropdown(!showLocationDropdown)}
          className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
        >
          <span className="text-gray-700 flex items-center gap-2">
            <SlLocationPin /> {selectedLocation}
          </span>
          <FaChevronDown size={18} className="text-gray-400" />
        </button>
        {showLocationDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
            {locations.map((location) => (
              <button
                key={location}
                onClick={() => {
                  setSelectedLocation(location);
                  setShowLocationDropdown(false);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors ${
                  selectedLocation === location
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700"
                }`}
              >
                {location}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export { DateFilter, LocationFilter };
