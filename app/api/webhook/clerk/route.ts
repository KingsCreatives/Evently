import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server"; 
import { clerkClient } from "@clerk/clerk-sdk-node";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  const headerPayload = headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing required Svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const webhook = new Webhook(WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = webhook.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (error) {
    console.error("Error verifying webhook:", error);
    return new Response("Webhook verification failed", { status: 400 });
  }

  const { id } = event.data;
  const eventType = event.type;

  try {
    switch (eventType) {
      case "user.created": {
        const { email_addresses, image_url, first_name, last_name, username } =
          event.data;

        const user = {
          clerkId: id,
          email: email_addresses[0]?.email_address,
          username: username || null,
          firstName: first_name || null,
          lastName: last_name || null,
          photo: image_url || null,
        };

        const newUser = await createUser(user);

        if (newUser) {
          // Update Clerk's public metadata with your app's user ID
          try {
            await clerkClient.users.updateUserMetadata(id, {
              publicMetadata: {
                userId: newUser._id, // Use the `_id` or equivalent from your database
              },
            });
          } catch (error) {
            console.error("Failed to update Clerk metadata:", error);
            throw new Error("Error updating Clerk metadata.");
          }
        }

        return NextResponse.json({ message: "User created", user: newUser });
      }

      case "user.updated": {
        const { image_url, first_name, last_name, username } = event.data;

        const updatedUser = await updateUser(id, {
          firstName: first_name || null,
          lastName: last_name || null,
          username: username || null,
          photo: image_url || null,
        });

        return NextResponse.json({
          message: "User updated",
          user: updatedUser,
        });
      }

      case "user.deleted": {
        const deletedUser = await deleteUser(id as string);
        return NextResponse.json({
          message: "User deleted",
          user: deletedUser,
        });
      }

      default:
        return new Response("Unhandled event type", { status: 400 });
    }
  } catch (error) {
    console.error(`Error handling event type ${eventType}:`, error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
