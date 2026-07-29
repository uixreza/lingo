import "next-auth";

declare module "next-auth" {
  interface User {
    phone?: string;
    fullname?: string;
    role?: string;
    gender?: "Male" | "Female";
    avatarSeed?: string | null;
  }
  interface Session {
    user: {
      id: string;
      phone: string;
      fullname: string;
      role: string;
      gender: "Male" | "Female";
      avatarSeed?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    phone: string;
    fullname: string;
    role: string;
    gender: "Male" | "Female";
    avatarSeed?: string | null;
  }
}
