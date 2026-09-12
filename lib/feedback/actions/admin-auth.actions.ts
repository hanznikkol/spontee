"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { deleteAdminFeedbackItem } from "../services/admin-feedback.service";

const ADMIN_COOKIE_NAME = "spontee_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

function getSecretKey(): string {
  return process.env.ADMIN_FEEDBACK_SECRET || "spontee-admin-2026";
}

function createSessionToken(): string {
  const secret = getSecretKey();
  const timestamp = Date.now().toString();
  const signature = crypto.createHmac("sha256", secret).update(timestamp).digest("hex");
  return `${timestamp}.${signature}`;
}

export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) return false;

  const [timestampStr, signature] = token.split(".");
  if (!timestampStr || !signature) return false;

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Check expiration (7 days)
  if (Date.now() - timestamp > SESSION_MAX_AGE * 1000) {
    return false;
  }

  const secret = getSecretKey();
  const expectedSignature = crypto.createHmac("sha256", secret).update(timestampStr).digest("hex");

  try {
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (sigBuffer.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

export async function loginAdminAction(passcode: string): Promise<{ success: boolean; error?: string }> {
  if (!passcode || typeof passcode !== "string") {
    return { success: false, error: "Please enter the admin passcode." };
  }

  const expectedSecret = getSecretKey();

  const enteredBuf = Buffer.from(passcode.trim());
  const expectedBuf = Buffer.from(expectedSecret.trim());

  let isMatch = false;
  if (enteredBuf.length === expectedBuf.length) {
    isMatch = crypto.timingSafeEqual(enteredBuf, expectedBuf);
  }

  if (!isMatch) {
    // Artificial small delay to mitigate timing / brute force
    await new Promise((res) => setTimeout(res, 400));
    return { success: false, error: "Invalid admin passcode." };
  }

  const sessionToken = createSessionToken();
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  revalidatePath("/admin/feedback");
  return { success: true };
}

export async function logoutAdminAction(): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  revalidatePath("/admin/feedback");
  return { success: true };
}

export async function deleteFeedbackAction(feedbackId: string): Promise<{ success: boolean; error?: string }> {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await deleteAdminFeedbackItem(feedbackId);
    revalidatePath("/admin/feedback");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete feedback";
    return { success: false, error: msg };
  }
}
