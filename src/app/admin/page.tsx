import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata: Metadata = {
  title: "پنل مدیریت ابزارهای ویژه",
  description: "مدیریت ابزارهای ویژه آرشام لب",
  /** پنل مدیریت نباید در موتور جست‌وجو index شود */
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
