import { redirect } from "next/navigation";

export default function RootPage() {
  const defaultSlug = process.env.NEXT_PUBLIC_DEFAULT_STORE_SLUG || "demo";
  redirect(`/store/${defaultSlug}`);
}
