import { signIn, signOut } from "@/auth";
import { revalidatePath } from "next/cache";

export const login = async (provider: string) => {
  try {
    await signIn(provider, { redirectTo: "/" });
    revalidatePath("/");
  } catch (error) {
    console.error("Error during login:", error);
    throw new Error("Login failed. Please try again.");
  }
};

export const logout = async () => {
  try {
    await signOut({ redirectTo: "/" });
    revalidatePath("/");
  } catch (error) {
    console.error("Error during logout:", error);
    throw new Error("Logout failed. Please try again.");
  }
};
