import { signOut } from "@/auth";

// Sign out the user
export function SignOut() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded">
        Sign Out
      </button>
    </form>
  );
}
