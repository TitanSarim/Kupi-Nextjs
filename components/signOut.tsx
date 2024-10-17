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
      <button
        type="submit"
        className="py-3 px-10 bg-kupi-yellow rounded-lg font-semibold"
      >
        Sign Out
      </button>
    </form>
  );
}
