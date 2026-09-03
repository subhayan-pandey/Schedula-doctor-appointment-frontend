export type ChatRole =
  | "user"
  | "assistant";

export type ChatAction = {
  label: string;
  href: string;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  action?: ChatAction;
};

export type ChatConversationMap = Record<
  string,
  ChatMessage[]
>;

export type ChatUserRole =
  | "guest"
  | "patient"
  | "doctor";

export type ChatIntent =
  | "book_appointment"
  | "reschedule_appointment"
  | "cancel_appointment"
  | "appointment_status"
  | "view_appointments"
  | "completed_appointment"
  | "prescription"
  | "review_doctor"
  | "rebook_appointment"
  | "patient_profile"
  | "find_doctor"
  | "doctor_dashboard"
  | "doctor_appointments"
  | "doctor_calendar"
  | "doctor_availability"
  | "doctor_profile"
  | "doctor_prescriptions"
  | "doctor_registration"
  | "login"
  | "how_schedula_works"
  | "out_of_scope"
  | "unknown";

export type IntentMatch = {
  intent: ChatIntent;
  isActionRequest: boolean;
};

export type ChatSuggestion = {
  label: string;
  message: string;
};

export type ChatResponse = {
  content: string;
  action?: ChatAction;
};