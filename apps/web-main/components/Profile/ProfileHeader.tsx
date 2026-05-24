// components/Profile/ProfileHeader.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check } from "lucide-react";

interface HeaderProps {
  user: any;
  friendsCount: number;
  postsCount: number;
  actionButton?: React.ReactNode;
  isEditing?: boolean;
  formData?: { nickname: string; bio: string };
  setFormData?: (data: any) => void;
}

export function ProfileHeader({ 
  user, 
  friendsCount, 
  postsCount, 
  actionButton,
  isEditing = false,
  formData,
  setFormData
}: HeaderProps) {
  const name = user?.nickname || "Hyper Citizen";
  const handle = `@${name.toLowerCase().replace(/\s+/g, '')}`;
  const bio = user?.bio || "A designer that keens simplicity and usability";
  
  const defaultAvatar = `https://ui-avatars.com/api/?name=${name.charAt(0)}&background=f4f4f5&color=18181b&size=128`;
  const avatarUrl = user?.avatar_url || defaultAvatar;

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 w-full">
      
      {/* Left Section: Avatar & Info */}
      <div className="flex items-center gap-6 w-full md:w-auto">
        <div className="relative shrink-0">
          <Avatar className="w-28 h-28 border-0 shadow-sm">
            <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
            <AvatarFallback className="bg-muted text-muted-foreground text-3xl font-medium">
              {name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {user?.trust_score >= 100 && (
            <div className="absolute top-0 right-0 bg-blue-600 text-white rounded-full p-1.5 border-[3px] border-background shadow-sm">
              <Check className="w-4 h-4" strokeWidth={3} />
            </div>
          )}
        </div>

        {/* Dynamic Display / Form Controller Block */}
        <div className="flex flex-col w-full">
          {!isEditing ? (
            <>
              <h1 className="text-4xl font-bold text-foreground tracking-tight">{name}</h1>
              <p className="text-muted-foreground mt-1">
                Creative director at <span className="text-foreground font-medium">{handle}</span>
              </p>
              <p className="text-muted-foreground mt-2 text-sm max-w-sm whitespace-pre-line">{bio}</p>
            </>
          ) : (
            <div className="space-y-2 w-full max-w-sm pr-4">
              <div>
                <label className="text-[9px] font-black uppercase text-primary tracking-widest block mb-1">Handle Name</label>
                <input 
                  type="text"
                  required
                  value={formData?.nickname || ""}
                  onChange={(e) => setFormData?.({ ...formData, nickname: e.target.value })}
                  className="w-full bg-background/50 border border-border rounded-xl py-1.5 px-3 text-sm focus:outline-none focus:border-primary font-medium text-foreground"
                />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-primary tracking-widest block mb-1">Sub-Directive (Bio)</label>
                <textarea 
                  value={formData?.bio || ""}
                  onChange={(e) => setFormData?.({ ...formData, bio: e.target.value })}
                  className="w-full bg-background/50 border border-border rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:border-primary min-h-[50px] resize-none text-foreground"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Section: Stats & Button */}
      <div className="flex items-center gap-8 md:border-l border-border md:pl-8 shrink-0 w-full md:w-auto justify-between md:justify-start mt-4 md:mt-0">
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs font-medium mb-1">Content</span>
            <span className="text-2xl font-bold text-foreground">{postsCount.toLocaleString()}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs font-medium mb-1">Followers</span>
            <span className="text-2xl font-bold text-foreground">{friendsCount.toLocaleString()}</span>
          </div>
        </div>
        
        {actionButton && (
          <div className="ml-2">
            {actionButton}
          </div>
        )}
      </div>

    </div>
  );
}