import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { processRewards } from '../../../lib/loyalty';
import { OrderRewardsReceipt, rewardList } from '../../../lib/rewards';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function rewardsCopy(receipt: OrderRewardsReceipt): { text: string; html: string } {
  const lines = [
    `Snaky Rewards: ${receipt.filled}/10 stamps.`,
    receipt.message,
    receipt.bonus ? 'BONUS! You earned an extra stamp.' : '',
    receipt.birthday ? 'Happy birthday. You earned a bonus stamp.' : '',
    receipt.included ? `INCLUDE: ${receipt.included}` : '',
    receipt.unlocked.length > 0 ? `Unlocked for the next order: ${rewardList(receipt.unlocked)}.` : '',
  ].filter(Boolean);
  const text = lines.join('\n');
  const html = `
    <div style="background-color: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f97316;">
      <h2 style="color: #9a3412; font-size: 22px; margin: 0 0 10px;">Snaky Rewards</h2>
      ${lines.map((line) => `<p style="font-size: 16px; margin: 6px 0; color: #7c2d12;">${escapeHtml(line)}</p>`).join('')}
    </div>
  `;
  return { text, html };
}

export async function POST(request: NextRequest) {
  try {
    const { orderData, cart, totalAmount, paymentIntentId } = await request.json();
    let rewardsText = '';
    let rewardsHtml = '';
    if (typeof paymentIntentId === 'string' && paymentIntentId) {
      try {
        const receipt = await processRewards(paymentIntentId);
        const copy = rewardsCopy(receipt);
        rewardsText = `\n${copy.text}\n`;
        rewardsHtml = copy.html;
      } catch {
        rewardsText = '';
        rewardsHtml = '';
      }
    }

    // Create transporter using Gmail (you can use other providers)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'your-email@gmail.com', // Use environment variable or replace with your email
        pass: process.env.APP_PASSWORD, // Use the app password from environment
      },
    });

    // Format cart items for email
    const cartItems = cart.map((item: any) => 
      `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    // Email content - send to customer
    const customerMailOptions = {
      from: process.env.GMAIL_USER || 'your-email@gmail.com', // Use environment variable or replace with your email
      to: orderData.email,
      subject: `Order Made!`,
      text: `
Order Made!

Apt ${orderData.apartment}
User: 
Name: ${orderData.name}
Email: ${orderData.email}

Items Ordered:
${cart.map((item: any) => `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join('\n')}

Total:
$${totalAmount.toFixed(2)}
${rewardsText}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1f2937; font-size: 28px; margin-bottom: 20px;">Order Made!</h1>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <p style="margin: 5px 0; font-size: 18px;"><strong>Apt:</strong> ${orderData.apartment}</p>
            <p style="margin: 5px 0; font-size: 18px;"><strong>Name:</strong> ${orderData.name}</p>
            <p style="margin: 5px 0; font-size: 18px;"><strong>Email:</strong> ${orderData.email}</p>
          </div>
          
          <h2 style="color: #1f2937; font-size: 24px; margin: 30px 0 15px 0;">Items Ordered:</h2>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 15px 0;">
            ${cart.map((item: any) => 
              `<p style="font-size: 20px; font-weight: bold; margin: 10px 0; color: #1f2937;">${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</p>`
            ).join('')}
          </div>
          
          <h2 style="color: #1f2937; font-size: 24px; margin: 30px 0 15px 0;">Total:</h2>
          <div style="background-color: #10b981; color: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <p style="font-size: 32px; font-weight: bold; margin: 0;">$${totalAmount.toFixed(2)}</p>
          </div>
          ${rewardsHtml}
        </div>
      `,
    };

    // Email content - send to admin (same format)
    const adminMailOptions = {
      from: process.env.GMAIL_USER || 'your-email@gmail.com', // Use environment variable or replace with your email
      to: process.env.GMAIL_USER || 'your-email@gmail.com', // Use environment variable or replace with your email
      subject: `Order Made!`,
      text: `
Order Made!

Apt ${orderData.apartment}
User: 
Name: ${orderData.name}
Email: ${orderData.email}

Items Ordered:
${cart.map((item: any) => `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join('\n')}

Total:
$${totalAmount.toFixed(2)}
${rewardsText}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1f2937; font-size: 28px; margin-bottom: 20px;">Order Made!</h1>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <p style="margin: 5px 0; font-size: 18px;"><strong>Apt:</strong> ${orderData.apartment}</p>
            <p style="margin: 5px 0; font-size: 18px;"><strong>Name:</strong> ${orderData.name}</p>
            <p style="margin: 5px 0; font-size: 18px;"><strong>Email:</strong> ${orderData.email}</p>
          </div>
          
          <h2 style="color: #1f2937; font-size: 24px; margin: 30px 0 15px 0;">Items Ordered:</h2>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 15px 0;">
            ${cart.map((item: any) => 
              `<p style="font-size: 20px; font-weight: bold; margin: 10px 0; color: #1f2937;">${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</p>`
            ).join('')}
          </div>
          
          <h2 style="color: #1f2937; font-size: 24px; margin: 30px 0 15px 0;">Total:</h2>
          <div style="background-color: #10b981; color: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
            <p style="font-size: 32px; font-weight: bold; margin: 0;">$${totalAmount.toFixed(2)}</p>
          </div>
          ${rewardsHtml}
        </div>
      `,
    };

    // Send emails
    await transporter.sendMail(customerMailOptions);
    await transporter.sendMail(adminMailOptions);

    return NextResponse.json({ success: true, message: 'Confirmation emails sent successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send confirmation email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
