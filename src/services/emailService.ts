import nodemailer from 'nodemailer';
import { logger } from '../lib/logger';

interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

interface EmailResult {
  success: boolean;
  message?: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<EmailResult> {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

  const mailOptions: EmailOptions = {
    from: process.env.SMTP_FROM || 'noreply@concretoanalyzer.com',
    to: email,
    subject: 'Recuperação de Senha',
    html: `
      <h1>Recuperação de Senha</h1>
      <p>Você solicitou a recuperação de senha da sua conta.</p>
      <p>Clique no link abaixo para redefinir sua senha:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Este link é válido por 1 hora.</p>
      <p>Se você não solicitou a recuperação de senha, ignore este email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    return {
      success: false,
      message: 'Erro ao enviar email de recuperação de senha',
    };
  }
}

export async function sendInvitationEmail(
  email: string,
  invitationToken: string
): Promise<EmailResult> {
  const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation?token=${invitationToken}`;

  const mailOptions: EmailOptions = {
    from: process.env.SMTP_FROM || 'noreply@concretoanalyzer.com',
    to: email,
    subject: 'Convite para Acesso',
    html: `
      <h1>Convite para Acesso</h1>
      <p>Você foi convidado para acessar o ConcretoAnalyzer.</p>
      <p>Clique no link abaixo para aceitar o convite:</p>
      <a href="${invitationLink}">${invitationLink}</a>
      <p>Este link é válido por 24 horas.</p>
      <p>Se você não esperava este convite, ignore este email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    logger.error('Error sending invitation email:', error);
    return {
      success: false,
      message: 'Erro ao enviar email de convite',
    };
  }
}

export async function sendWelcomeEmail(email: string, name: string): Promise<EmailResult> {
  const mailOptions: EmailOptions = {
    from: process.env.SMTP_FROM || 'noreply@concretoanalyzer.com',
    to: email,
    subject: 'Bem-vindo ao ConcretoAnalyzer',
    html: `
      <h1>Bem-vindo ao ConcretoAnalyzer!</h1>
      <p>Olá ${name},</p>
      <p>Obrigado por se cadastrar no ConcretoAnalyzer.</p>
      <p>Estamos felizes em ter você conosco!</p>
      <p>Se precisar de ajuda, não hesite em nos contatar.</p>
      <p>Atenciosamente,<br>Equipe ConcretoAnalyzer</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    logger.error('Error sending welcome email:', error);
    return {
      success: false,
      message: 'Erro ao enviar email de boas-vindas',
    };
  }
}
