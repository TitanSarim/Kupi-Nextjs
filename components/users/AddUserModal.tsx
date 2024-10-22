import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { createUser } from "@/actions/user.actions";
import toast from "react-hot-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "@/components/ui/command";
import { CreateUserFormData, UserRolesType } from "@/types/user";
import { useRouter } from "next/navigation";
import { RolesEnum } from "@/types/auth";
import { useSession } from "next-auth/react";
import {
  validateFields,
  validateWhatsAppNumber,
  validatePassword,
} from "@/libs/ClientSideHelpers";
import ErrorMessage from "@/components/ErrorMessage";
import { checkEmailExists } from "@/actions/user.actions";
import { ToastBar } from "react-hot-toast";

interface AddUserProps {
  onClose: () => void;
  onAddUser: (newUser: CreateUserFormData) => void;
  roles: UserRolesType[];
}

const AddUserModal: React.FC<AddUserProps> = ({ onClose, roles }) => {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    number: "",
    password: "",
    roleId: "",
  });
  const [roleName, setRoleName] = useState("");
  const [openRole, setOpenRole] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    setFormData({
      name: "",
      surname: "",
      email: "",
      number: "",
      password: "",
      roleId: "",
    });
    setRoleName("");
    setErrors({});
    setLoading(false);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({ ...prevData, [name]: value }));

    if (submitted) {
      const error = validateFields(name, value);
      setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
    }
  };

  const handleRoleSelect = (role: UserRolesType) => {
    setFormData((prevData) => ({ ...prevData, roleId: role.id }));
    setRoleName(role.roleName);
    setOpenRole(false);
    setErrors((prevErrors) => ({ ...prevErrors, roleId: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const newErrors: { [key: string]: string } = {};

    (Object.keys(formData) as (keyof typeof formData)[]).forEach((field) => {
      const error = validateFields(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    // Check if email is already registered
    if (!newErrors.email) {
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        newErrors.email = "This email is already registered.";
      }
    }
    if (!formData.roleId) {
      newErrors.roleId = "Role is required.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);

    const newUser: CreateUserFormData = {
      name: formData.name,
      surname: formData.surname,
      email: formData.email,
      number: formData.number,
      password: formData.password,
      roleId: formData.roleId,
      operatorsId:
        session.data?.role === RolesEnum.BusCompanyAdmin
          ? session.data?.operatorId
          : undefined,
    };

    try {
      const response = await createUser(newUser);
      if (response.success) {
        router.refresh();
        toast.success("User added successfully.");
        onClose();
      } else {
        setErrors((prev) => ({
          ...prev,
          form: response.error || "Failed to create user.",
        }));
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, form: "An unexpected error occurred." }));
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const roleOptions =
    session.data?.role === RolesEnum.SuperAdmin
      ? roles.filter(
          (role) =>
            role.roleName === RolesEnum.SuperAdmin ||
            role.roleName === RolesEnum.KupiUser
        )
      : roles.filter(
          (role) =>
            role.roleName === RolesEnum.BusCompanyAdmin ||
            role.roleName === RolesEnum.BusCompanyUser
        );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 dialguebox-container ">
      <div className="bg-dim-grey py-6 px-8 rounded-lg shadow-lg w-full max-w-lg h-[80vh] overflow-y-auto dialguebox">
        <div className="w-full flex justify-between items-center">
          <h2 className="text-dark-grey text-xl font-semibold">Add User</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <Image
              src="/img/icons/Close-Icon.svg"
              alt="Close"
              width={20}
              height={20}
            />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-0">
          {/* User Name */}
          <div className="w-full mb-3">
            <label
              htmlFor="name"
              className="block text-md font-medium text-dark-grey"
            >
              User Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Enter name"
              value={formData.name}
              onChange={handleChange}
              className="block px-5 py-3 text-dark-grey border border-gray-500 w-full rounded-lg"
            />
            <ErrorMessage message={errors.name} />
          </div>

          {/* Surname */}
          <div className="w-full mb-3">
            <label
              htmlFor="surname"
              className="block text-md font-medium text-dark-grey"
            >
              Surname
            </label>
            <input
              type="text"
              name="surname"
              id="surname"
              placeholder="Enter surname"
              value={formData.surname}
              onChange={handleChange}
              className="block px-5 py-3 text-dark-grey border border-gray-500 w-full rounded-lg"
            />
            <ErrorMessage message={errors.surname} />
          </div>

          {/* Email */}
          <div className="w-full mb-3">
            <label
              htmlFor="email"
              className="block text-md font-medium text-dark-grey"
            >
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              className="block px-5 py-3 text-dark-grey border border-gray-500 w-full rounded-lg"
            />
            <ErrorMessage message={errors.email} />
          </div>

          {/* Whatsapp Number */}
          <div className="w-full mb-3">
            <label
              htmlFor="number"
              className="block text-md font-medium text-dark-grey"
            >
              Whatsapp Number
            </label>
            <input
              type="text"
              name="number"
              id="number"
              placeholder="Enter number"
              value={formData.number}
              onChange={handleChange}
              className="block px-5 py-3 text-dark-grey border border-gray-500 w-full rounded-lg"
            />
            <ErrorMessage message={errors.number} />
          </div>

          {/* Role Selection */}
          <div className="w-full mb-3">
            <label
              htmlFor="role"
              className="block text-md font-medium text-dark-grey"
            >
              Role
            </label>
            <Popover open={openRole} onOpenChange={setOpenRole}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openRole}
                  className="w-full justify-between px-5 py-3 text-dark-grey border border-gray-500 rounded-lg"
                >
                  {roleName || "Please select"}
                  <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search role..." />
                  <CommandList className="w-full">
                    <CommandEmpty>No role found.</CommandEmpty>
                    <CommandGroup>
                      {roleOptions.map((role) => (
                        <CommandItem
                          key={role.id}
                          value={role.roleName}
                          onSelect={() => handleRoleSelect(role)}
                          className="cursor-pointer w-full"
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              role.id === formData.roleId
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          />
                          {role.roleName}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <ErrorMessage message={errors.roleId} />
          </div>

          {/* Password */}
          <div className="w-full mb-3">
            <label
              htmlFor="password"
              className="block text-md font-medium text-dark-grey"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                className="block px-5 py-3 text-dark-grey border border-gray-500 w-full rounded-lg"
              />
              <div
                className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                onClick={togglePasswordVisibility}
              >
                <Image
                  src={`/img/auth-screens/${
                    showPassword ? "view-on.svg" : "view-off.svg"
                  }`}
                  alt={showPassword ? "Hide Password" : "Show Password"}
                  width={20}
                  height={20}
                />
              </div>
            </div>
            <ErrorMessage message={errors.password} />
          </div>

          {/* Buttons */}
          <div className="flex justify-end mt-5">
            <Button
              variant="secondary"
              onClick={onClose}
              className="bg-dim-grey text-dark-grey mr-2"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              type="submit"
              className="bg-kupi-yellow text-dark-grey"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
