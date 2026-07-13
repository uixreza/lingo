import "next-auth";

declare module "next-auth" {
  interface User {
    userUuid?: string;
    phone?: string;
    fullname?: string;
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      userUuid: string;
      phone: string;
      fullname: string;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    userUuid: string;
    phone: string;
    fullname: string;
    role: string;
  }
}
