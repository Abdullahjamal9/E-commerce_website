import nodemailer from 'nodemailer';
import { formatPrice } from './currency';
import type { Order, OrderItem } from '@/generated/prisma/client';

const FROM = process.env.EMAIL_FROM ?? process.env.GMAIL_USER ?? '';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const transporter =
  process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      })
    : null;

function itemsTable(items: OrderItem[]) {
  return items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${i.productName} · ${i.colorName} · Size ${i.size} × ${i.qty}</td><td style="padding:6px 0;text-align:right">${formatPrice(i.price * i.qty)}</td></tr>`
    )
    .join('');
}

const paymentLabel = (method: Order['paymentMethod']) =>
  method === 'COD' ? 'Cash on Delivery' : 'Bank Transfer / Easypaisa';

export async function sendOrderEmails(order: Order & { items: OrderItem[] }) {
  if (!transporter) return;

  const proofUrls = (order.paymentProof as string[]) ?? [];
  const proofHtml = proofUrls.length
    ? `
      <p style="margin-top:16px">Payment proof:</p>
      <div>
        ${proofUrls
          .map(
            (url) =>
              `<a href="${SITE_URL}${url}"><img src="${SITE_URL}${url}" alt="Payment proof" style="max-width:160px;margin-right:8px;border-radius:8px" /></a>`
          )
          .join('')}
      </div>
    `
    : '';

  const summary = `
    <table style="width:100%;border-collapse:collapse;font-family:sans-serif;font-size:14px">
      ${itemsTable(order.items)}
      <tr><td style="padding-top:10px;font-weight:700;border-top:1px solid #ddd">Total</td>
      <td style="padding-top:10px;font-weight:700;border-top:1px solid #ddd;text-align:right">${formatPrice(order.total)}</td></tr>
    </table>
  `;

  const customerEmail = transporter.sendMail({
    from: FROM,
    to: order.email,
    subject: `Order ${order.orderNumber} confirmed`,
    html: `
      <div style="font-family:sans-serif">
        <h2>Thanks for your order, ${order.customerName}!</h2>
        <p>Your order <strong>${order.orderNumber}</strong> has been received.</p>
        ${summary}
        <p style="margin-top:16px">Payment method: <strong>${paymentLabel(order.paymentMethod)}</strong></p>
        ${order.paymentMethod === 'BANK_TRANSFER' ? '<p>Our team will verify your payment shortly and send you a confirmation email once it has been approved.</p>' : ''}
        <p>Delivery address: ${order.address}, ${order.city}</p>
      </div>
    `
  });

  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  const adminNotification = adminEmail
    ? transporter.sendMail({
        from: FROM,
        to: adminEmail,
        subject: `New order ${order.orderNumber} — ${paymentLabel(order.paymentMethod)}`,
        html: `
          <div style="font-family:sans-serif">
            <h2>New order received</h2>
            <p><strong>${order.customerName}</strong> · ${order.email} · ${order.phone}</p>
            ${summary}
            <p style="margin-top:16px">Payment method: <strong>${paymentLabel(order.paymentMethod)}</strong></p>
            ${order.transactionRef ? `<p>Transaction reference: ${order.transactionRef}</p>` : ''}
            ${proofHtml}
            <p>Delivery address: ${order.address}, ${order.city}</p>
          </div>
        `
      })
    : Promise.resolve();

  const results = await Promise.allSettled([customerEmail, adminNotification]);
  for (const r of results) {
    if (r.status === 'rejected') console.error('Order email failed:', r.reason);
  }
}

export async function sendPaymentVerifiedEmail(order: Order & { items: OrderItem[] }) {
  if (!transporter) return;

  const summary = `
    <table style="width:100%;border-collapse:collapse;font-family:sans-serif;font-size:14px">
      ${itemsTable(order.items)}
      <tr><td style="padding-top:10px;font-weight:700;border-top:1px solid #ddd">Total</td>
      <td style="padding-top:10px;font-weight:700;border-top:1px solid #ddd;text-align:right">${formatPrice(order.total)}</td></tr>
    </table>
  `;

  try {
    await transporter.sendMail({
      from: FROM,
      to: order.email,
      subject: `Payment verified — order ${order.orderNumber} confirmed`,
      html: `
        <div style="font-family:sans-serif">
          <h2>Your payment has been verified, ${order.customerName}!</h2>
          <p>We have confirmed receipt of your payment for order <strong>${order.orderNumber}</strong>. Your order is now being prepared for delivery.</p>
          ${summary}
          <p style="margin-top:16px">Delivery address: ${order.address}, ${order.city}</p>
          <p>Thank you for shopping with us.</p>
        </div>
      `
    });
  } catch (err) {
    console.error('Payment verified email failed:', err);
  }
}

export async function sendContactMessage(data: { name: string; phone: string; message: string }) {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  if (!transporter || !adminEmail) return;

  try {
    await transporter.sendMail({
      from: FROM,
      to: adminEmail,
      subject: `New contact message from ${data.name}`,
      html: `
        <div style="font-family:sans-serif">
          <h2>New contact form message</h2>
          <p><strong>${data.name}</strong> · ${data.phone}</p>
          <p style="margin-top:12px;white-space:pre-wrap">${data.message}</p>
        </div>
      `
    });
  } catch (err) {
    console.error('Contact message email failed:', err);
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  if (!transporter) return;

  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: 'Reset your admin password',
      html: `
        <div style="font-family:sans-serif">
          <h2>Password reset requested</h2>
          <p>Click the link below to set a new admin password. This link expires in 30 minutes.</p>
          <p style="margin-top:16px">
            <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#3b82ff;color:#fff;text-decoration:none;border-radius:8px">
              Reset Password
            </a>
          </p>
          <p style="margin-top:16px;font-size:13px;color:#666">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `
    });
  } catch (err) {
    console.error('Password reset email failed:', err);
  }
}
