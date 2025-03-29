import nodemailer from 'nodemailer';
import { EMAIL_CONFIG } from '../config/env';
import { logger } from './logger';

class MockEmailTransporter {
  async sendMail(options: {
    from: string;
    to: string;
    subject: string;
    html: string;
    attachments?: Array<{
      filename: string;
      path: string;
      contentType?: string;
    }>;
  }): Promise<void> {
    logger.info('Email mock enviado', options);
  }

  verify(callback: (error: Error | null) => void): void {
    callback(null);
    logger.info('Configuração de email mock verificada com sucesso');
  }
}

class EmailService {
  private static instance: EmailService;
  private transporter: nodemailer.Transporter | MockEmailTransporter;

  private constructor() {
    try {
      this.transporter = nodemailer.createTransport({
        host: EMAIL_CONFIG.SMTP_HOST,
        port: EMAIL_CONFIG.SMTP_PORT,
        secure: false,
        auth: {
          user: EMAIL_CONFIG.SMTP_USER,
          pass: EMAIL_CONFIG.SMTP_PASS,
        },
      });

      // Verificar conexão
      this.transporter.verify(error => {
        if (error) {
          logger.warn('Erro na configuração do email, usando implementação mock', { error });
          this.transporter = new MockEmailTransporter();
        } else {
          logger.info('Configuração de email verificada com sucesso');
        }
      });
    } catch (error) {
      logger.warn('Erro ao criar transporter de email, usando implementação mock', { error });
      this.transporter = new MockEmailTransporter();
    }
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private async sendEmail(
    to: string | string[],
    subject: string,
    html: string,
    attachments?: Array<{
      filename: string;
      path: string;
      contentType?: string;
    }>
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"${EMAIL_CONFIG.FROM_NAME}" <${EMAIL_CONFIG.FROM_EMAIL}>`,
        to: Array.isArray(to) ? to.join(',') : to,
        subject,
        html,
        attachments,
      });
      logger.info('Email enviado com sucesso', { to, subject });
    } catch (error) {
      logger.error('Erro ao enviar email', { error, to, subject });
      throw error;
    }
  }

  public async sendWelcomeEmail(user: { name: string; email: string }): Promise<void> {
    const subject = 'Bem-vindo ao Sistema de Análise Estrutural';
    const html = `
      <h1>Bem-vindo, ${user.name}!</h1>
      <p>Obrigado por se cadastrar em nossa plataforma.</p>
      <p>Agora você pode começar a usar nossos serviços de análise estrutural.</p>
      <p>Se precisar de ajuda, não hesite em nos contatar.</p>
      <p>Atenciosamente,<br>Equipe de Análise Estrutural</p>
    `;

    await this.sendEmail(user.email, subject, html);
  }

  public async sendPasswordResetEmail(
    user: { name: string; email: string },
    resetToken: string
  ): Promise<void> {
    const subject = 'Redefinição de Senha';
    const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
    const html = `
      <h1>Redefinição de Senha</h1>
      <p>Olá ${user.name},</p>
      <p>Recebemos uma solicitação para redefinir sua senha.</p>
      <p>Clique no link abaixo para criar uma nova senha:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>Este link expira em 1 hora.</p>
      <p>Se você não solicitou esta redefinição, ignore este email.</p>
      <p>Atenciosamente,<br>Equipe de Análise Estrutural</p>
    `;

    await this.sendEmail(user.email, subject, html);
  }

  public async sendAnalysisCompleteEmail(
    user: { name: string; email: string },
    project: { name: string; id: string }
  ): Promise<void> {
    const subject = 'Análise Estrutural Concluída';
    const projectLink = `${process.env.APP_URL}/projects/${project.id}`;
    const html = `
      <h1>Análise Estrutural Concluída</h1>
      <p>Olá ${user.name},</p>
      <p>A análise estrutural do projeto "${project.name}" foi concluída com sucesso.</p>
      <p>Você pode acessar os resultados através do link abaixo:</p>
      <p><a href="${projectLink}">${projectLink}</a></p>
      <p>Atenciosamente,<br>Equipe de Análise Estrutural</p>
    `;

    await this.sendEmail(user.email, subject, html);
  }

  public async sendReportGeneratedEmail(
    user: { name: string; email: string },
    project: { name: string; id: string },
    reportId: string
  ): Promise<void> {
    const subject = 'Relatório Gerado';
    const reportLink = `${process.env.APP_URL}/projects/${project.id}/reports/${reportId}`;
    const html = `
      <h1>Relatório Gerado</h1>
      <p>Olá ${user.name},</p>
      <p>O relatório do projeto "${project.name}" foi gerado com sucesso.</p>
      <p>Você pode acessar o relatório através do link abaixo:</p>
      <p><a href="${reportLink}">${reportLink}</a></p>
      <p>Atenciosamente,<br>Equipe de Análise Estrutural</p>
    `;

    await this.sendEmail(user.email, subject, html);
  }

  public async sendShareNotificationEmail(
    user: { name: string; email: string },
    project: { name: string; id: string },
    sharedBy: { name: string }
  ): Promise<void> {
    const subject = 'Projeto Compartilhado';
    const projectLink = `${process.env.APP_URL}/projects/${project.id}`;
    const html = `
      <h1>Projeto Compartilhado</h1>
      <p>Olá ${user.name},</p>
      <p>${sharedBy.name} compartilhou o projeto "${project.name}" com você.</p>
      <p>Você pode acessar o projeto através do link abaixo:</p>
      <p><a href="${projectLink}">${projectLink}</a></p>
      <p>Atenciosamente,<br>Equipe de Análise Estrutural</p>
    `;

    await this.sendEmail(user.email, subject, html);
  }

  public async sendErrorNotificationEmail(
    user: { name: string; email: string },
    project: { name: string; id: string },
    error: string
  ): Promise<void> {
    const subject = 'Erro na Análise Estrutural';
    const projectLink = `${process.env.APP_URL}/projects/${project.id}`;
    const html = `
      <h1>Erro na Análise Estrutural</h1>
      <p>Olá ${user.name},</p>
      <p>Ocorreu um erro durante a análise do projeto "${project.name}".</p>
      <p>Detalhes do erro:</p>
      <p>${error}</p>
      <p>Você pode verificar o status do projeto através do link abaixo:</p>
      <p><a href="${projectLink}">${projectLink}</a></p>
      <p>Se o problema persistir, entre em contato com o suporte.</p>
      <p>Atenciosamente,<br>Equipe de Análise Estrutural</p>
    `;

    await this.sendEmail(user.email, subject, html);
  }
}

export const emailService = EmailService.getInstance();
