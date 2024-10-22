import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { UserRolesType, UserDataType, UpdateUserFormData } from "@/types/user";
import { useRouter } from "next/navigation";
import { updateUser, checkEmailExists } from "@/actions/user.actions";
import { useSession } from "next-auth/react";
import { RolesEnum } from "@/types/auth";
import { validateFields } from "@/libs/ClientSideHelpers";
import ErrorMessage from "@/components/ErrorMessage";
import Image from "next/image";
import toast from "react-hot-toast";

interface EditUserProps {
  user: UserDataType;
  onClose: () => void;
  onUpdateUser: (
    updatedUser: UpdateUserFormData
  ) => Promise<{ success: boolean; error?: string }>;
  roles: UserRolesType[];
}

const EditUserModal: React.FC<EditUserProps> = ({ onClose, user, roles }) => {
  const [name, setName] = useState(user.user.name);
  const [surname, setSurname] = useState(user.user.surname);
  const [email, setEmail] = useState(user.user.email || "");
  const [number, setNumber] = useState(user.user.number);
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(user.user.roleId || "");
  const [roleName, setRoleName] = useState(user.role?.roleName || "");
  const [openRole, setOpenRole] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    // Reset form when modal opens
    setName(user.user.name);
    setSurname(user.user.surname);
    setEmail(user.user.email || "");
    setNumber(user.user.number);
    setPassword("");
    setRoleId(user.user.roleId || "");
    setRoleName(user.role?.roleName || "");
    setErrors({});
    setLoading(false);
  }, [user]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);

    if (submitted) {
      const error = validateFields("name", e.target.value);
      setErrors((prevErrors) => ({ ...prevErrors, name: error }));
    }
  };

  const handleSurnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSurname(e.target.value);

    if (submitted) {
      const error = validateFields("surname", e.target.value);
      setErrors((prevErrors) => ({ ...prevErrors, surname: error }));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);

    if (submitted) {
      const error = validateFields("email", e.target.value);
      setErrors((prevErrors) => ({ ...prevErrors, email: error }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumber(e.target.value);

    if (submitted) {
      const error = validateFields("number", e.target.value);
      setErrors((prevErrors) => ({ ...prevErrors, number: error }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);

    if (submitted) {
      const error = validateFields("password", e.target.value);
      setErrors((prevErrors) => ({ ...prevErrors, password: error }));
    }
  };

  const handleRoleSelect = (role: UserRolesType) => {
    setRoleId(role.id);
    setRoleName(role.roleName);
    setOpenRole(false);
    setErrors((prevErrors) => ({ ...prevErrors, roleId: "" }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const formData = {
      name,
      surname,
      email,
      number,
      password,
      roleId,
    };

    const newErrors: { [key: string]: string } = {};

    (Object.keys(formData) as (keyof typeof formData)[]).forEach((field) => {
      // Skip password validation if password is empty
      if (field === "password" && !formData.password) {
        return;
      }
      const error = validateFields(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    // Check if email is already registered
    if (!newErrors.email && email !== user.user.email) {
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        newErrors.email = "This email is already registered.";
      }
    }

    if (!roleId) {
      newErrors.roleId = "Role is required.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setLoading(true);

    // Create updated user data object
    const updatedUser: UpdateUserFormData = {
      id: user.user.id,
      name,
      surname,
      email,
      number,
      roleId,
    };

    if (password) {
      updatedUser.password = password;
    }

    try {
      // Use the updateUser function
      const response = await updateUser(updatedUser);
      if (response.success) {
        router.refresh();
        toast.success("User updated successfully.");
        onClose();
      } else {
        setErrors((prev) => ({
          ...prev,
          form: response.error || "Failed to update user.",
        }));
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, form: "An unexpected error occurred." }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 dialguebox-container ">
      <div className="bg-dim-grey py-6 px-8 rounded-lg shadow-lg w-full max-w-lg h-[80vh] overflow-y-auto dialguebox">
        {/* Modal Header */}
        <div className="w-full flex justify-between items-center">
          <h2 className="text-dark-grey text-xl font-semibold">Edit User</h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-0">
          {/* User Name */}
          <div className="w-full mb-3">
            <label
              htmlFor="name"
              className="block text-md font-medium leading-6 text-dark-grey"
            >
              User Name
            </label>
            <div className="mt-2">
              <Input
                type="text"
                name="name"
                id="name"
                placeholder="Enter name"
                value={name}
                onChange={handleNameChange}
                className="block px-5 py-3 text-dark-grey border border-gray-500 w-full rounded-lg"
              />
            </div>
            <ErrorMessage message={errors.name} />
          </div>

          {/* Surname */}
          <div className="w-full mb-3">
            <label
              htmlFor="surname"
              className="block text-md font-medium leading-6 text-dark-grey"
            >
              Surname
            </label>
            <div className="mt-2">
              <Input
                type="text"
                name="surname"
                id="surname"
                placeholder="Enter surname"
                value={surname}
                onChange={handleSurnameChange}
                className="block px-5 py-3 text-dark-grey border border-gray-500 w-full rounded-lg"
              />
            </div>
            <ErrorMessage message={errors.surname} />
          </div>

          {/* Email Address */}
          <div className="w-full mb-3">
            <label
              htmlFor="email"
              className="block text-md font-medium leading-6 text-dark-grey"
            >
              Email Address
            </label>
            <div className="mt-2">
              <Input
                type="email"
                name="email"
                id="email"
                placeholder="Enter email"
                value={email}
                onChange={handleEmailChange}
                className="block px-5 py-3 text-dark-grey border border-gray-500 w-full rounded-lg"
              />
            </div>
            <ErrorMessage message={errors.email} />
          </div>

          {/* Whatsapp Number */}
          <div className="w-full mb-3">
            <label
              htmlFor="number"
              className="block text-md font-medium leading-6 text-dark-grey"
            >
              Whatsapp Number
            </label>
            <div className="mt-2">
              <Input
                type="text"
                name="number"
                id="number"
                placeholder="Enter number"
                value={number}
                onChange={handleNumberChange}
                className="block px-5 py-3 text-dark-grey border border-gray-500 w-full rounded-lg"
              />
            </div>
            <ErrorMessage message={errors.number} />
          </div>

          {/* Role Selection */}
          <div className="w-full mb-3">
            <label
              htmlFor="role"
              className="block text-md font-medium leading-6 text-dark-grey"
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
              <PopoverContent className="w-full p-0 select-dropdown">
                <Command>
                  <CommandInput placeholder="Search role..." />
                  <CommandList className="w-full">
                    <CommandEmpty>No role found.</CommandEmpty>
                    <CommandGroup>
                      {roleOptions.map((role) => (
                        <CommandItem
                          key={role.id}
                          onSelect={() => handleRoleSelect(role)}
                          className="cursor-pointer w-full"
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              role.id === roleId ? "opacity-100" : "opacity-0"
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
              className="block text-md font-medium leading-6 text-dark-grey"
            >
              Password
            </label>
            <div className="relative mt-2">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                placeholder="Enter new password (leave blank to keep current)"
                value={password}
                onChange={handlePasswordChange}
                className="block px-5 py-3 text-dark-grey border border-gray-500 w-full rounded-lg pr-10"
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

          {/* Form Error */}
          {errors.form && (
            <div className="text-red-500 mb-3">{errors.form}</div>
          )}

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
              {loading ? "Updating..." : "Update User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
