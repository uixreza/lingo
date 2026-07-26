import "next-auth";

declare module "next-auth" {
  interface User {
    phone?: string;
    fullname?: string;
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      phone: string;
      fullname: string;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    phone: string;
    fullname: string;
    role: string;
  }
}
