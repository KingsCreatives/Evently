import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

type ClerkEventData = {
  id: string;
  email_addresses?: { email_address: string }[];
  image_url?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
};

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Missing WEBHOOK_SECRET in environment variables");
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id") || "";
  const svixTimestamp = headerPayload.get("svix-timestamp") || "";
  const svixSignature = headerPayload.get("svix-signature") || "";

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing required Svix headers", { status: 400 });
  }

  const payload = await req.json();
  const webhook = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = webhook.verify(JSON.stringify(payload), {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (error) {
    console.error("Webhook verification failed:", error);
    return new Response("Invalid webhook signature", { status: 400 });
  }

  const { id, email_addresses, image_url, first_name, last_name, username } =
    (evt.data as ClerkEventData) || {};

  if (!id) {
    return new Response("Invalid event data: Missing `id`", { status: 400 });
  }

  const user = {
    clerkId: id,
    email: email_addresses?.[0]?.email_address || "",
    username: username || "",
    firstName: first_name || "N/A",
    lastName: last_name || "N/A",
    photo: image_url || "",
  };

  try {
    switch (evt.type) {
      case "user.created":
        const newUser = await createUser(user);
        if (newUser) {
          await clerkClient.users.updateUserMetadata(id, {
            publicMetadata: {
              userId: newUser._id,
            },
          });
        }
        return NextResponse.json({ message: "User created", user: newUser });

      case "user.updated":
        const updatedUser = await updateUser(id, user);
        return NextResponse.json({
          message: "User updated",
          user: updatedUser,
        });

      case "user.deleted":
        const deletedUser = await deleteUser(id);
        return NextResponse.json({
          message: "User deleted",
          user: deletedUser,
        });

      default:
        return new Response("Unhandled event type", { status: 400 });
    }
  } catch (error) {
    console.error(`Error handling event type ${evt.type}:`, error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
