export type UserProfile = {
  userId: string;

  dateOfBirth: string;

  gender: string;

  phone: string;

  address: string;

  bloodGroup: string;

  height: string;

  weight: string;

  medicalConditions: string;

  allergies: string;

  currentMedications: string;

  insuranceProvider: string;

  insurancePolicyNumber: string;

  emergencyContactName: string;

  emergencyContactRelationship: string;

  emergencyContactPhone: string;

  updatedAt: string;
};

export const emptyUserProfile = (
  userId: string,
): UserProfile => ({
  userId,

  dateOfBirth: "",

  gender: "",

  phone: "",

  address: "",

  bloodGroup: "",

  height: "",

  weight: "",

  medicalConditions: "",

  allergies: "",

  currentMedications: "",

  insuranceProvider: "",

  insurancePolicyNumber: "",

  emergencyContactName: "",

  emergencyContactRelationship: "",

  emergencyContactPhone: "",

  updatedAt: "",
});