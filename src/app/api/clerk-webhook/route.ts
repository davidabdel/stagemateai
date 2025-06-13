import { NextResponse } from "next/server";
import { createUserCredits } from "@/utils/supabaseService";

export async function POST(req: Request) {
  // Get the headers
  const headersList = req.headers;
  const svix_id = headersList.get("svix-id");
  const svix_timestamp = headersList.get("svix-timestamp");
  const svix_signature = headersList.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();

  // Create a new user with default credits when a user signs up
  if (payload.type === "user.created") {
    const { id } = payload.data;
    
    try {
      await createUserCredits(id);
      console.log(`Created credits for new user: ${id}`);
    } catch (error) {
      console.error("Error creating user credits:", error);
    }
  }

  return NextResponse.json({ message: "Webhook received" }, { status: 200 });
}
