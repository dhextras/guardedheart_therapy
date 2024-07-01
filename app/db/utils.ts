import { supabase } from "./auth";

import type {
  User,
  Therapist,
  PendingUser,
  OnlineTherapist,
  ActiveConversation,
} from "~/types/db.types";

// FUNCTION SET 1 - User related Db functions

/**
 * Creates a new user record in the database.
 * @returns The created User object, or null if an error occurred.
 */
export const createUser = async (): Promise<User | null> => {
  const { data, error } = await supabase.from("users").insert([{}]).select();
  if (error || !data) {
    return null;
  }
  return data[0] as User;
};

/**
 * Creates a new pending user record with the provided name and initial message.
 * @param name - The name of the pending user.
 * @param initialMessage - The initial message from the pending user.
 * @returns The created PendingUser object, or null if an error occurred.
 */
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

/**
 * Removes a pending user record from the database based on the provided user ID.
 * @param id - The ID of the user to remove.
 * @returns True if the removal was successful, false otherwise.
 */
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

/**
 * Retrieves a pending user record from the database based on the provided user ID.
 * @param id - The ID of the user to retrieve.
 * @returns The PendingUser object, or null if not found or an error occurred.
 */
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

/**
 * Retrieves all pending user records from the database.
 * @returns An array of PendingUser objects, or null if an error occurred.
 */
export const getAllPendingUsers = async (): Promise<PendingUser[] | null> => {
  const { data, error } = await supabase.from("pending_users").select("*");
  if (error || !data) {
    return null;
  }
  return data as PendingUser[];
};

// FUNCTION SET 2 - Therapist related Db functions

/**
 * Retrieves a therapist record from the database based on the provided code.
 * @param code - The code of the therapist to retrieve.
 * @returns The Therapist object, or null if not found or an error occurred.
 */
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

/**
 * Creates a new online therapist record with the provided therapist ID.
 * @param therapistId - The ID of the therapist.
 * @returns The created OnlineTherapist object, or null if an error occurred.
 */
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

/**
 * Removes an online therapist record from the database based on the provided therapist ID.
 * @param therapistId - The ID of the therapist to remove.
 * @returns True if the removal was successful, false otherwise.
 */
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

/**
 * Retrieves the total count of online therapists from the database.
 * @returns The total count of online therapists.
 */
export const getTotalOnlineTherapist = async (): Promise<number> => {
  const { data, error } = await supabase.from("online_therapists").select("*");
  if (error || !data) {
    return 0;
  }
  return data.length;
};

/**
 * Updates the total conversations count for the given therapist ID.
 * @param therapistId - The ID of the therapist.
 * @returns True if the update was successful, false otherwise.
 */
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

  const { error: updateError } = await supabase
    .from("therapists")
    .update({ total_conversations: currentTotal + 1 })
    .eq("id", therapistId)
    .select();

  if (updateError) {
    return false;
  }

  return true;
};

/**
 * Updates the last login time for the given therapist ID.
 * @param therapistId - The ID of the therapist.
 * @returns True if the update was successful, false otherwise.
 */
export const updateLastLogin = async (
  therapistId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from("therapists")
    .update({ last_login: "now()" })
    .eq("id", therapistId)
    .select();

  if (error || !data) {
    return false;
  }

  return true;
};

// FUNCTION SET 3 - Conversation related Db functions

/**
 * Creates a new active conversation record in the database.
 * @param conversationId - The ID of the conversation.
 * @param therapistId - The ID of the therapist.
 * @param userName - The name of the user.
 * @param userMessage - The initial message from the user.
 * @param therapistName - The name of the therapist.
 * @returns The created ActiveConversation object, or null if an error occurred.
 */
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

/**
 * Removes an active conversation record from the database based on the provided conversation ID.
 * @param conversationId - The ID of the conversation to remove.
 * @returns True if the removal was successful, false otherwise.
 */
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

/**
 * Retrieves an active conversation record from the database based on the provided conversation ID.
 * @param conversationId - The ID of the conversation to retrieve.
 * @returns The ActiveConversation object, or null if not found or an error occurred.
 */
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

/**
 * Retrieves the total count of active conversations from the database.
 * @returns The total count of active conversations.
 */
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
