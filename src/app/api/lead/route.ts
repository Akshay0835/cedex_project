import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

const supabaseUrl = process.env.SUPABASE_URL;
const resendKey = process.env.RESEND_API_KEY;
const resend = resendKey && !resendKey.startsWith('re_123456789') ? new Resend(resendKey) : null;

// In-memory rate limiter: Maps IP to array of request timestamps
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_COUNT = 3;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export async function POST(request: NextRequest) {
  // 1. IP Rate Limiting
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];

  // Filter out timestamps outside the current window
  const activeTimestamps = timestamps.filter(
    (time) => now - time < RATE_LIMIT_WINDOW_MS
  );

  if (activeTimestamps.length >= RATE_LIMIT_COUNT) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a few minutes.' },
      { status: 429 }
    );
  }

  // Update timestamps
  activeTimestamps.push(now);
  rateLimitMap.set(ip, activeTimestamps);

  try {
    const body = await request.json();
    const {
      email,
      companyName,
      teamSize,
      role,
      monthlySavings,
      auditUrl,
      website_confirm_field, // Honeypot field
    } = body;

    // 2. Honeypot check
    // If the hidden field is filled, treat it as a spam bot,
    // log silently, and return a fake successful response (200 OK)
    // so the bot thinks it succeeded without consuming further resources.
    if (website_confirm_field) {
      console.warn(
        `Spam bot detected via Honeypot. IP: ${ip}, Email: ${email}, Honeypot value: ${website_confirm_field}`
      );
      return NextResponse.json({ success: true, message: 'Lead recorded' });
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'A valid work email is required.' },
        { status: 400 }
      );
    }

    // 3. Store in Supabase if configured and not a placeholder
    const isSupabasePlaceholder = !supabaseUrl || supabaseUrl.includes('your-supabase-project-id');
    
    if (supabase && !isSupabasePlaceholder) {
      try {
        const { error: dbError } = await supabase.from('leads').insert({
          email,
          company_name: companyName || null,
          team_size: teamSize ? parseInt(teamSize, 10) : null,
          role: role || null,
          monthly_savings: monthlySavings || 0,
          audit_url: auditUrl || null,
        });

        if (dbError) {
          console.error('Supabase DB error:', dbError);
          console.warn('Proceeding with lead capture process despite database error.');
        }
      } catch (err) {
        console.error('Failed to communicate with Supabase:', err);
        console.warn('Proceeding with lead capture process despite network/configuration failure.');
      }
    } else {
      console.warn('Supabase not configured or has placeholder credentials. Skipping database write.');
    }

    // 4. Send Transactional Email via Resend if configured and not a placeholder
    if (resend) {
      const annualSavings = (monthlySavings || 0) * 12;
      const isHighSavings = monthlySavings > 500;

      // Premium HTML Email template
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>SaaSlytics Spend Audit Report</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background-color: #f4f4f7;
              color: #51545e;
              margin: 0;
              padding: 0;
              -webkit-text-size-adjust: none;
            }
            .wrapper {
              width: 100%;
              table-layout: fixed;
              background-color: #f4f4f7;
              padding: 40px 0;
            }
            .content {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
              border: 1px solid #e8ebf0;
            }
            .header {
              background-color: #09090b;
              padding: 32px;
              text-align: center;
            }
            .logo {
              color: #ffffff;
              font-size: 24px;
              font-weight: 800;
              letter-spacing: -0.5px;
              text-decoration: none;
            }
            .logo-s {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: #09090b;
              padding: 4px 10px;
              border-radius: 6px;
              font-weight: bold;
              margin-right: 6px;
            }
            .body-content {
              padding: 32px;
            }
            .title {
              font-size: 22px;
              font-weight: 700;
              color: #09090b;
              margin-top: 0;
              margin-bottom: 16px;
            }
            .savings-box {
              background-color: #09090b;
              border-left: 4px solid #10b981;
              padding: 24px;
              border-radius: 6px;
              margin: 24px 0;
              color: #ffffff;
            }
            .savings-label {
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #a1a1aa;
              margin: 0 0 4px 0;
            }
            .savings-value {
              font-size: 36px;
              font-weight: 800;
              color: #10b981;
              margin: 0;
              line-height: 1;
            }
            .savings-sub {
              font-size: 13px;
              color: #a1a1aa;
              margin: 8px 0 0 0;
            }
            .btn-container {
              text-align: center;
              margin: 32px 0;
            }
            .btn {
              background-color: #10b981;
              color: #09090b !important;
              text-decoration: none;
              padding: 12px 28px;
              border-radius: 6px;
              font-weight: 700;
              font-size: 14px;
              display: inline-block;
              box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);
            }
            .details-table {
              width: 100%;
              border-collapse: collapse;
              margin: 24px 0;
              font-size: 14px;
            }
            .details-table th, .details-table td {
              padding: 10px;
              text-align: left;
              border-bottom: 1px solid #e8ebf0;
            }
            .details-table th {
              color: #71717a;
              font-weight: 600;
            }
            .footer {
              background-color: #f4f4f7;
              padding: 24px 32px;
              text-align: center;
              font-size: 12px;
              color: #71717a;
              border-top: 1px solid #e8ebf0;
            }
            .text-highlight {
              color: #10b981;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="content">
              <div class="header">
                <a href="${auditUrl || '#'}" class="logo">
                  <span class="logo-s">S</span>SaaSlytics
                </a>
              </div>
              <div class="body-content">
                <h1 class="title">Your AI Spend Audit Report is Ready</h1>
                <p>Hello,</p>
                <p>Thank you for using the <strong>SaaSlytics Spend Auditor</strong>. We analyzed your AI tool subscriptions and identified redundant licenses and optimization opportunities.</p>
                
                <div class="savings-box">
                  <p class="savings-label">Total Identified Waste</p>
                  <p class="savings-value">$${monthlySavings.toLocaleString()}/mo</p>
                  <p class="savings-sub">Annualized Savings Potential: <strong>$${annualSavings.toLocaleString()}/yr</strong></p>
                </div>

                ${
                  isHighSavings
                    ? `
                  <p style="font-weight: 600; color: #09090b;">⚡ Critical Action Recommended</p>
                  <p>Because your team has over <span class="text-highlight">$500/mo</span> in waste, a Cedex Spend Architect will reach out to you within 24 hours to schedule a deep-dive audit and assist you with seat consolidations and contract negotiations.</p>
                `
                    : `
                  <p>Your team's AI subscriptions have moderate to minimal optimization opportunities. We recommend reviewing duplicate seats across your Cursor, ChatGPT, and Claude subscriptions.</p>
                `
                }

                <div class="btn-container">
                  <a href="${auditUrl || '#'}" class="btn" target="_blank">View Live Interactive Report</a>
                </div>

                <h3 style="font-size: 16px; color: #09090b; margin-top: 32px;">Audit Summary Details:</h3>
                <table class="details-table">
                  <tr>
                    <th>Company Name</th>
                    <td>${companyName || 'Not specified'}</td>
                  </tr>
                  <tr>
                    <th>Team Size</th>
                    <td>${teamSize || 'Not specified'}</td>
                  </tr>
                  <tr>
                    <th>Your Role</th>
                    <td>${role || 'Not specified'}</td>
                  </tr>
                </table>

                <p style="font-size: 13px; line-height: 1.5; color: #71717a; margin-top: 32px;">
                  If you have any questions or want to fast-track your optimization plan, feel free to reply directly to this email or book an appointment on our website.
                </p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} SaaSlytics Spend Auditor, powered by Cedex.</p>
                <p>Confidential SaaS Spend Audit. Do not forward without authorization.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const fromEmail = process.env.RESEND_FROM_EMAIL || 'SaaSlytics Spend Audit <onboarding@resend.dev>';
      
      try {
        await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: `SaaSlytics Spend Audit: Save $${annualSavings.toLocaleString()}/yr`,
          html: emailHtml,
        });
      } catch (emailError) {
        console.error('Resend dispatch failed:', emailError);
      }
    } else {
      console.warn('Resend not configured or has placeholder API key. Skipping email dispatch.');
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Lead capture internal error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
