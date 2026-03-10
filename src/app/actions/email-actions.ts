
'use server';

import nodemailer from 'nodemailer';
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, get, child } from 'firebase/database';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';

/**
 * @fileOverview Server Action for secure email delivery using Realtime Database.
 */

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const rtdb = getDatabase(app);
const auth = getAuth(app);

const EMAIL_TEMPLATE = (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;900&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #000; font-family: 'Poppins', sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 80px 40px; text-align: center; border: 1px solid #222;">
    <h1 style="font-size: 42px; font-weight: 900; letter-spacing: 12px; margin: 0 0 40px; text-transform: uppercase; font-style: italic; color: #fff;">STYLE MAVERIK</h1>
    
    <div style="height: 2px; width: 60px; background-color: #55D6F7; margin: 0 auto 40px;"></div>
    
    <p style="font-size: 14px; font-weight: 900; letter-spacing: 6px; color: #55D6F7; margin: 0 0 20px; text-transform: uppercase;">THE WAIT IS OVER, ${name.toUpperCase()}</p>
    
    <p style="font-size: 16px; font-weight: 400; line-height: 1.8; letter-spacing: 2px; color: #ccc; margin: 0 0 60px; max-width: 480px; margin-left: auto; margin-right: auto;">
      The orbit has aligned. Your access to the new world of design is finally here. Step inside and explore the future of premium style.
    </p>
    
    <a href="https://stylemaverik.com" style="display: inline-block; background-color: #fff; color: #000; padding: 22px 45px; text-decoration: none; font-weight: 900; letter-spacing: 6px; text-transform: uppercase; font-size: 12px; transition: all 0.3s;">
      ENTER STYLE MAVERIK
    </a>
    
    <p style="font-size: 10px; font-weight: 400; letter-spacing: 4px; color: #444; margin-top: 80px; text-transform: uppercase;">
      THANK YOU FOR BEING PART OF THE ORBIT.
    </p>
    
    <p style="font-size: 8px; letter-spacing: 2px; color: #222; margin-top: 20px;">
      &copy; 2026 STYLE MAVERIK | DESIGNING THE NEW WORLD
    </p>
  </div>
</body>
</html>
`;

export async function sendLaunchEmails(adminEmail: string) {
  const gmailUser = process.env.GMAIL_EMAIL;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const adminSecret = process.env.ADMIN_PASSWORD;

  if (!gmailUser || !gmailPass) {
    throw new Error('Email credentials not configured.');
  }

  try {
    if (adminSecret) {
      await signInWithEmailAndPassword(auth, adminEmail, adminSecret);
    }

    const waitlistRef = ref(rtdb, 'waitlist');
    const snapshot = await get(waitlistRef);
    
    if (!snapshot.exists()) {
      return { total: 0, sent: 0, errors: 0, message: "No pioneers in registry." };
    }

    const val = snapshot.val();
    const entries = Object.entries(val).map(([id, data]: [string, any]) => ({ id, ...data }));

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass
      }
    });

    let sent = 0;
    let errors = 0;

    const batchSize = 50;
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (entry: any) => {
        try {
          await transporter.sendMail({
            from: '"Style Maverik" <noreply@stylemaverik.com>',
            to: entry.email,
            subject: "Your Access to Style Maverik Has Arrived",
            html: EMAIL_TEMPLATE(entry.name || 'Pioneer')
          });
          sent++;
        } catch (err) {
          errors++;
        }
      }));

      if (i + batchSize < entries.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return { total: entries.length, sent, errors, success: true };

  } catch (error: any) {
    throw new Error(error.message || 'Transmission failed.');
  }
}
