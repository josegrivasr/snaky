import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { orderData, cart, totalAmount } = await request.json();

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
        </div>
      `,
    };

    // Send emails
    await transporter.sendMail(customerMailOptions);
    await transporter.sendMail(adminMailOptions);

    return NextResponse.json({ success: true, message: 'Confirmation emails sent successfully' });
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return NextResponse.json(
      { error: 'Failed to send confirmation email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
