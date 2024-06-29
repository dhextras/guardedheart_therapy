import { supabase } from "./auth";

import type {
  User,
  Therapist,
  PendingUser,
  OnlineTherapist,
  ActiveConversation,
} from "~/types/db.types";

// User related Db functions
export const createUser = async (): Promise<User | null> => {
  const { data, error } = await supabase.from("users").insert([{}]).select();
  if (error || !data) {
    return null;
  }
  return data[0] as User;
};

export const createPendingUser = async (
  name: string,
  initialMessage: string
): Promise<PendingUser | null> => {
  const userId = await createUser();
  if (!userId || userId.id === null) {
    return null;
  }

  const { data, error } = await supabase
    .from("pending_users")
    .insert([
      { user_id: userId.id, name: name, initial_message: initialMessage },
    ])
    .select();
  if (error || !data) {
    return null;
  }
  return data[0] as PendingUser;
};

export const removePendingUser = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from("pending_users")
    .delete()
    .eq("user_id", id);
  if (error) {
    return false;
  }
  return true;
};

export const getPendingUserById = async (
  id: string
): Promise<PendingUser | null> => {
  const { data, error } = await supabase
    .from("pending_users")
    .select("*")
    .eq("user_id", id)
    .single();
  if (error || !data) {
    return null;
  }
  return data as PendingUser;
};

export const getAllPendingUsers = async (): Promise<PendingUser[] | null> => {
  const { data, error } = await supabase.from("pending_users").select("*");
  if (error || !data) {
    return null;
  }
  return data as PendingUser[];
};

// Therapist related Db functions
export const getTherapistByCode = async (
  code: string
): Promise<Therapist | null> => {
  const { data, error } = await supabase
    .from("therapists")
    .select("*")
    .eq("code", code)
    .single();
  if (error || !data) {
    return null;
  }
  return data as Therapist;
};

export const createOnlineTherapist = async (
  therapistId: string
): Promise<OnlineTherapist | null> => {
  const { data, error } = await supabase
    .from("online_therapists")
    .insert([{ therapist_id: therapistId }])
    .select();
  if (error || !data) {
    return null;
  }
  return data[0] as OnlineTherapist;
};

export const deleteOnlineTherapist = async (
  therapistId: string
): Promise<boolean> => {
  const { error } = await supabase
    .from("online_therapists")
    .delete()
    .eq("therapist_id", therapistId);
  if (error) {
    return false;
  }
  return true;
};

export const getTotalOnlineTherapist = async (): Promise<number> => {
  const { data, error } = await supabase
    .from("online_therapists")
    .select("*");
  if (error || !data) {
    return 0;
  }
  return data.length;
};

export const updateTotalConversations = async (
  therapistId: string
): Promise<boolean> => {
  const { data: currentData, error: fetchError } = await supabase
    .from("therapists")
    .select("total_conversations")
    .eq("id", therapistId)
    .single();

  const currentTotal = currentData?.total_conversations;

  if (fetchError || !currentData || typeof currentTotal !== "number") {
    return false;
  }

  const { data: updateData, error: updateError } = await supabase
    .from("therapists")
    .update({ total_conversations: currentTotal + 1 })
    .eq("id", therapistId)
    .select();

  if (updateError || !!updateData) {
    return false;
  }

  return true;
};

// Conversation related Db functions
export const createActiveConversation = async (
  conversationId: string,
  therapistId: string,
  userName: string,
  userMessage: string,
  therapistName: string
): Promise<ActiveConversation | null> => {
  const { data, error } = await supabase
    .from("active_conversations")
    .insert([
      {
        id: conversationId,
        user_name: userName,
        user_message: userMessage,
        therapist_id: therapistId,
        therapist_name: therapistName,
      },
    ])
    .select();
  if (error || !data) {
    return null;
  }
  return data[0] as ActiveConversation;
};

export const deleteActiveConversation = async (
  conversationId: string
): Promise<boolean> => {
  const { error } = await supabase
    .from("active_conversations")
    .delete()
    .eq("id", conversationId);
  if (error) {
    return false;
  }
  return true;
};

export const getActiveConversationById = async (
  conversationId: string
): Promise<ActiveConversation | null> => {
  const { data, error } = await supabase
    .from("active_conversations")
    .select("*")
    .eq("id", conversationId)
    .single();
  if (error || !data) {
    return null;
  }
  return data as ActiveConversation;
};

export const getTotalActiveConversations = async (): Promise<number> => {
  const { data, error } = await supabase
    .from("active_conversations")
    .select("*");
  if (error || !data) {
    return 0;
  }
  return data.length;
};

// Functions that are not yet been for any usages... will do later..

// // TODO: Real time change listener Db functions
// export const listenToPendingUsers = (
//   callback: (pendingusers: PendingUser[] | null) => void
// ) => {
//   const channel = supabase
//     .channel("pending_users")
//     .on(
//       "postgres_changes",
//       { event: "*", schema: "public", table: "pending_users" },
//       async (payload) => {
//         const { data, error } = await supabase
//           .from("pending_users")
//           .select("*");
//         if (error) {
//           callback(null);
//         } else {
//           callback(data as PendingUser[]);
//         }
//       }
//     )
//     .subscribe();

//   return () => {
//     supabase.removeChannel(channel);
//   };
// };
