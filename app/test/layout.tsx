import { AuthProvider } from "@/contexts/AuthContext";
import Auth from "@/components/Auth";

export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {children}
      <Auth />
    </AuthProvider>
  );
}
