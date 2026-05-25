// components/Profile/ProfileHeader.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check } from "lucide-react";

interface HeaderProps {
  user: any; // Ideally ProfileData type from hook, but matching existing props
  friendsCount: number;
  postsCount: number;
  actionButton?: React.ReactNode;
  isEditing?: boolean;
  formData?: { nickname: string; bio: string; gender?: string };
  setFormData?: (data: any) => void;
}

// 🚀 1. Placeholder images set karle (actual link public/images me daal ya external use kar)
const IMAGE_1_MALE_DEFAULT = "/images/default-male.png";   // Default for Male, Other, undefined
const IMAGE_2_FEMALE_DEFAULT = "/images/default-female.png"; // Only for Female

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
  
  // 🚀 2. NAYA AVATAR LOGIC Implementation
  // Pehle check karo user ne avatar upload kiya hai kya?
  let avatarUrl = user?.avatar_url;

  // Agar nahi kiya hai, toh hum conditional placeholder choose karenge
  if (!avatarUrl) {
    // Exact match for 'female', covers old, new, 'other', 'prefer_not_to_say', and undefined users as Male/Default
    if (user?.gender === 'female') {
        avatarUrl = IMAGE_2_FEMALE_DEFAULT;
    } else {
        avatarUrl = IMAGE_1_MALE_DEFAULT; // Fallback to Image 1
    }
  }

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 w-full relative">
      
      {/* Left Section: Avatar & Info */}
      <div className="flex items-center gap-6 w-full md:w-auto">
        <div className="relative shrink-0">
          <Avatar className="w-28 h-28 border-[6px] border-card shadow-lg z-20">
            {/* 🚀 3. avatarUrl variable yahan automatic select hoke feed ho raha hai */}
            <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
            <AvatarFallback className="bg-muted text-muted-foreground text-3xl font-medium">
              {name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {user?.trust_score >= 100 && (
            <div className="absolute top-0 right-0 bg-blue-600 text-white rounded-full p-1.5 border-[3px] border-card shadow-sm z-30">
              <Check className="w-4 h-4" strokeWidth={3} />
            </div>
          )}
        </div>

        {/* Dynamic Display / Form Controller Block */}
        <div className="flex flex-col w-full relative z-10">
          {!isEditing ? (
            <>
              <h1 className="text-4xl font-bold text-foreground tracking-tight">{name}</h1>
              <p className="text-muted-foreground mt-1">
                Creative director at <span className="text-foreground font-medium">{handle}</span>
              </p>
              <p className="text-muted-foreground mt-2 text-sm max-w-sm whitespace-pre-line">{bio}</p>
            </>
          ) : (
            <div className="space-y-2 w-full max-w-sm pr-4 bg-muted/20 p-4 rounded-xl border border-border">
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
              
              {/* GENDER DROPDOWN */}
              <div>
                <label className="text-[9px] font-black uppercase text-primary tracking-widest block mb-1">Gender</label>
                <div className="relative">
                  <select
                    value={formData?.gender || ""}
                    onChange={(e) => setFormData?.({ ...formData, gender: e.target.value })}
                    className="w-full bg-background/50 border border-border rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:border-primary font-medium text-foreground appearance-none"
                  >
                    <option value="" disabled className="bg-black text-muted-foreground">Select Gender</option>
                    <option value="male" className="bg-black">Male</option>
                    <option value="female" className="bg-black">Female</option>
                    <option value="other" className="bg-black">Other</option>
                    <option value="prefer_not_to_say" className="bg-black">Prefer not to say</option>
                  </select>
                  {/* Custom Arrow for sleek design */}
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 border-l-transparent border-r-transparent border-t-muted-foreground border-[4px] border-b-0" />
                </div>
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
      <div className="flex items-center gap-8 md:border-l border-border md:pl-8 shrink-0 w-full md:w-auto justify-between md:justify-start mt-4 md:mt-0 relative z-10">
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