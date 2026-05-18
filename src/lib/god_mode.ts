export const MASTER_SECRET = "MASTER_SECRET";
export const OWNER_EMAIL = "ТВОЙ_EMAIL";

export interface UserProfile {
  email: string;
  isPremium: boolean;
  role: "user" | "grandmaster_owner";
}

export function verifyGodMode(email: string, secretKey: string): UserProfile {
  if (email === OWNER_EMAIL || secretKey === MASTER_SECRET) {
    console.log("⚡ GRANDMASTER OWNER STATUS UNLOCKED ⚡");
    return {
      email,
      isPremium: true, // Бесплатный премиум навсегда
      role: "grandmaster_owner", // Доступ к /owner-portal
    };
  }

  return {
    email,
    isPremium: false,
    role: "user",
  };
}

export function isAdminOrOwner(profile: UserProfile): boolean {
  return profile.role === "grandmaster_owner";
}
