export interface EmailService {
  sendVerificationEmail(to: string, code: string): Promise<void>;
  sendWelcomeEmail(to: string, name: string): Promise<void>;
  sendPasswordResetEmail(to: string, token: string): Promise<void>;
}
