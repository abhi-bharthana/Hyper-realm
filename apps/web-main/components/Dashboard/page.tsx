// apps/web-main/app/dashboard/page.tsx
import { ProfileSection } from "@/components/Profile/ProfileSection";

export default function DashboardPage() {
  return (
    <main className="p-8">
      {/* Ab dashboard page main container ki tarah behave karega */}
      <ProfileSection userId="abhi_yadav_001" isOwner={true} />
    </main>
  );
}