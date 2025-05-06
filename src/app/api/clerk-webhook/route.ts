import { NextResponse } from "next/server";
import { createUserCredits } from "@/utils/supabaseService";
import { supabase } from "@/utils/supabaseClient";

// Verify Clerk webhook signature (for production use)
const verifyClerkWebhook = async (req: Request) => {
  // In production, you should verify the webhook signature
  // using the Clerk SDK or manual verification
  // For now, we'll just return true for development
  return true;
};

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

  // Verify the webhook (in production)
  const isValid = await verifyClerkWebhook(req);
  if (!isValid) {
    return new NextResponse("Invalid webhook signature", {
      status: 401,
    });
  }

  // Get the body
  const payload = await req.json();
  console.log(`Received Clerk webhook: ${payload.type}`);

  try {
    // Handle different webhook events
    switch (payload.type) {
      case "user.created": {
        // Extract user data from the payload
        const { id, email_addresses, first_name, last_name } = payload.data;
        
        // Get the primary email
        const primaryEmail = email_addresses?.length > 0 ? 
          email_addresses[0].email_address : null;
        
        // Create display name from first and last name
        let displayName = null;
        if (first_name || last_name) {
          displayName = [first_name, last_name].filter(Boolean).join(' ');
        }
        
        console.log(`New user created: ${id}, Email: ${primaryEmail}, Name: ${displayName}`);
        
        // Create user credits with email and display name
        try {
          // First, check if user already exists in user_usage
          const { data: existingUser } = await supabase
            .from('user_usage')
            .select('*')
            .eq('user_id', id)
            .single();
          
          if (existingUser) {
            // Update existing user with email and display name
            const { error: updateError } = await supabase
              .from('user_usage')
              .update({ 
                email: primaryEmail || existingUser.email,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', id);
            
            if (updateError) {
              throw updateError;
            }
            
            console.log(`Updated existing user: ${id}`);
          } else {
            // Create new user with default credits
            const { error: createError } = await supabase
              .from('user_usage')
              .insert([
                {
                  user_id: id,
                  email: primaryEmail,
                  photos_used: 0,
                  photos_limit: 3, // Default free credits
                  plan_type: 'Trial',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              ]);
            
            if (createError) {
              throw createError;
            }
            
            console.log(`Created new user credits: ${id}`);
          }
          
          // Now update or create entry in consolidated_users
          const { data: existingConsolidated } = await supabase
            .from('consolidated_users')
            .select('*')
            .eq('user_id', id)
            .single();
          
          if (existingConsolidated) {
            // Update existing consolidated user
            const { error: updateError } = await supabase
              .from('consolidated_users')
              .update({ 
                email: primaryEmail || existingConsolidated.email,
                display_name: displayName || existingConsolidated.display_name,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', id);
            
            if (updateError) {
              throw updateError;
            }
            
            console.log(`Updated existing consolidated user: ${id}`);
          } else {
            // The trigger should handle this automatically, but just in case
            // we'll explicitly create the consolidated user
            const { error: createError } = await supabase
              .from('consolidated_users')
              .insert([
                {
                  user_id: id,
                  email: primaryEmail,
                  display_name: displayName,
                  photos_used: 0,
                  photos_limit: 3,
                  plan_type: 'Trial',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              ]);
            
            if (createError) {
              throw createError;
            }
            
            console.log(`Created new consolidated user: ${id}`);
          }
        } catch (error) {
          console.error("Error handling user creation:", error);
          throw error;
        }
        break;
      }
      
      case "user.updated": {
        // Extract user data from the payload
        const { id, email_addresses, first_name, last_name } = payload.data;
        
        // Get the primary email
        const primaryEmail = email_addresses?.length > 0 ? 
          email_addresses[0].email_address : null;
        
        // Create display name from first and last name
        let displayName = null;
        if (first_name || last_name) {
          displayName = [first_name, last_name].filter(Boolean).join(' ');
        }
        
        console.log(`User updated: ${id}, Email: ${primaryEmail}, Name: ${displayName}`);
        
        // Update user in both tables
        if (primaryEmail) {
          // Update email in user_usage
          const { error: updateError } = await supabase
            .from('user_usage')
            .update({ 
              email: primaryEmail,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', id);
          
          if (updateError) {
            console.error("Error updating user_usage email:", updateError);
          }
          
          // Update email and display name in consolidated_users
          const { error: consolidatedError } = await supabase
            .from('consolidated_users')
            .update({ 
              email: primaryEmail,
              display_name: displayName,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', id);
          
          if (consolidatedError) {
            console.error("Error updating consolidated_users:", consolidatedError);
          }
        }
        break;
      }
      
      case "user.deleted": {
        const { id } = payload.data;
        console.log(`User deleted: ${id}`);
        
        // You may want to handle user deletion differently
        // For now, we'll just log it
        break;
      }
    }
    
    return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
