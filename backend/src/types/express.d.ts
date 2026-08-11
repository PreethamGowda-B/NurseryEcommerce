export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
