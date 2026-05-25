import type { Metadata } from "next";
import AccountsClient from "./_accounts-client";

export const metadata: Metadata = {
  title: "Accounts — GetPostFlow",
};

export default function AccountsPage() {
  return <AccountsClient />;
}
