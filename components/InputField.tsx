import React from "react";
import ErrorMessage from "@/components/ErrorMessage";


interface InputFieldProps {
  type?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  showPasswordToggle?: boolean;
  togglePasswordVisibility?: () => void;
  iconSrc?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled,
  showPasswordToggle = false,
  togglePasswordVisibility,
  iconSrc,
}) => {
  return (
    <div className="mt-5 w-full">
      {label && (
        <label className="text-dark-grey text-md font-semibold">{label}</label>
      )}
      <div className="relative w-full mt-2">
        {iconSrc && (
          <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-2.5">
            <img className="w-5" src={iconSrc} alt="Icon" />
          </div>
        )}
        {showPasswordToggle && togglePasswordVisibility && (
          <div
            className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
            onClick={togglePasswordVisibility}
          >
            <img
              className="w-5"
              src={`/img/auth-screens/${
                type === "password" ? "view-off.svg" : "view-on.svg"
              }`}
              alt={type === "password" ? "Show Password" : "Hide Password"}
            />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className={`px-10 py-2 bg-transparent border-b ${
            error ? "border-red-500" : "border-gray-900"
          } text-dark-grey text-sm focus:ring-blue-500 focus:border-yellow-500 block w-full ps-10 p-2.5 outline-none`}
          placeholder={placeholder}
          required
          disabled={disabled}
        />
      </div>
      {error && <ErrorMessage message={error} />}
    </div>
  );
};

export default InputField;
