export type ChatUserRole =
  | "guest"
  | "patient"
  | "doctor";

export type ChatIntent =
  | "login"
  | "logout"
  | "signup"
  | "doctor_registration"
  | "find_doctor"
  | "doctor_details"
  | "book_appointment"
  | "appointment_slots"
  | "reschedule_appointment"
  | "cancel_appointment"
  | "view_appointments"
  | "appointment_status"
  | "completed_appointment"
  | "missed_appointment"
  | "prescription"
  | "review_doctor"
  | "rebook_appointment"
  | "patient_profile"
  | "notifications"
  | "doctor_dashboard"
  | "doctor_appointments"
  | "doctor_calendar"
  | "doctor_availability"
  | "doctor_profile"
  | "doctor_prescriptions"
  | "how_schedula_works"
  | "out_of_scope"
  | "unknown";

export type ChatAction = {
  label: string;
  href: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  action?: ChatAction;
};

export type ChatResponse = {
  content: string;
  action?: ChatAction;
};

export type ChatSuggestion = {
  label: string;
  message: string;
};

export type IntentMatch = {
  intent: ChatIntent;
  isActionRequest: boolean;
};

export type ChatConversationMap = Record<
  string,
  ChatMessage[]
>;