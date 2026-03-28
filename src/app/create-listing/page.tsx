import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import CreateListingForm from "./CreateListingForm";

export default async function CreateListingPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/create-listing");
  }
  return <CreateListingForm />;
}
