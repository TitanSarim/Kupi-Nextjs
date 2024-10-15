import React from "react";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  disabled = false,
}) => {
  return (
    <label className="relative inline-block w-12 h-6 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      <div
        className={`block w-full h-full rounded-full transition-colors duration-300 ${
          checked ? "bg-yellow-500" : "bg-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      ></div>
      <div
        className={`absolute left-0 top-0 mt-0.5 ml-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 transform ${
          checked ? "translate-x-6" : "translate-x-0"
        } shadow-md`}
      ></div>
    </label>
  );
};

export default Switch;
