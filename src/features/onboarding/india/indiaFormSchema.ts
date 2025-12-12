import { z } from "zod";
import {
  EEducationLevel,
  EGender,
  type IIndiaOnboardingFormData,
} from "@/types/onboarding.types";

/**
 * Minimal file-asset schema for uploaded docs.
 * Mirrors IFileAsset from shared.types in a validation-friendly way.
 */
const fileAssetSchema = z.object({
  url: z.string().url("File URL is required."),
  s3Key: z.string().min(1, "File key is required."),
  mimeType: z.string().min(1, "File type is required."),
  originalName: z.string().optional(),
  sizeBytes: z.number().int().nonnegative().optional(),
});

/* ------------------------------------------------------------------ */
/* Personal Info (IPersonalInfo)                                      */
/* ------------------------------------------------------------------ */

const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  gender: z
    .string()
    .refine(
      (val): val is EGender => val === EGender.MALE || val === EGender.FEMALE,
      {
        message: "Gender is required.",
      }
    ),

  dateOfBirth: z.string().min(1, "Date of birth is required."),
  canProvideProofOfAge: z.boolean().refine((v) => v === true, {
    message: "You must confirm that you can provide proof of age.",
  }),
  residentialAddress: z.object({
    addressLine1: z.string().min(1, "Address line 1 is required."),
    city: z.string().min(1, "City is required."),
    state: z.string().min(1, "State / Province is required."),
    postalCode: z.string().min(1, "Postal code is required."),
    fromDate: z.string().min(1, "From date is required."),
    toDate: z.string().min(1, "Until date is required."),
  }),
  phoneHome: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{10}$/.test(val),
      "Enter a valid 10-digit phone number."
    ),

  phoneMobile: z
    .string()
    .min(1, "Mobile number is required.")
    .regex(/^\d{10}$/, {
      message: "Enter a valid 10-digit mobile number.",
    }),

  emergencyContactName: z
    .string()
    .min(1, "Emergency contact name is required."),
  emergencyContactNumber: z
    .string()
    .min(1, "Emergency contact number is required.")
    .regex(/^\d{10}$/, {
      message: "Enter a valid 10-digit emergency contact number.",
    }),
});

/* ------------------------------------------------------------------ */
/* Government IDs (IIndiaGovernmentIds)                               */
/* ------------------------------------------------------------------ */

const indiaAadhaarSchema = z.object({
  aadhaarNumber: z
    .string()
    .min(1, "Aadhaar number is required.")
    .max(32, "Aadhaar number is too long."),
  file: fileAssetSchema,
});

const indiaPanSchema = z.object({
  file: fileAssetSchema,
});

const indiaPassportSchema = z.object({
  frontFile: fileAssetSchema,
  backFile: fileAssetSchema,
});

const indiaDriversLicenseSchema = z
  .object({
    frontFile: fileAssetSchema.optional(),
    backFile: fileAssetSchema.optional(),
  })
  .superRefine((val, ctx) => {
    const hasAny = !!val.frontFile || !!val.backFile;
    if (hasAny && !val.frontFile) {
      ctx.addIssue({
        path: ["frontFile"],
        code: z.ZodIssueCode.custom,
        message: "Front of driver's license is required.",
      });
    }
    if (hasAny && !val.backFile) {
      ctx.addIssue({
        path: ["backFile"],
        code: z.ZodIssueCode.custom,
        message: "Back of driver's license is required.",
      });
    }
  });

const indiaGovernmentIdsSchema = z.object({
  aadhaar: indiaAadhaarSchema,
  panCard: indiaPanSchema,
  passport: indiaPassportSchema,
  driversLicense: indiaDriversLicenseSchema.optional(),
});

/* ------------------------------------------------------------------ */
/* Education (IEducationDetails[])                                    */
/* ------------------------------------------------------------------ */

const educationEntrySchemaBase = z.object({
  highestLevel: z
    .nativeEnum(EEducationLevel)
    .or(z.literal("")) // allow empty string from <select>
    .refine((val) => Object.values(EEducationLevel).includes(val as any), {
      message: "Please select your highest level of education.",
    }),

  // Primary
  schoolName: z.string().optional(),
  schoolLocation: z.string().optional(),
  primaryYearCompleted: z
    .number()
    .int()
    .min(1900, "Enter a valid 4-digit year.")
    .max(2100, "Enter a valid 4-digit year.")
    .optional(),

  // High school
  highSchoolInstitutionName: z.string().optional(),
  highSchoolBoard: z.string().optional(),
  highSchoolStream: z.string().optional(),
  highSchoolYearCompleted: z
    .number()
    .int()
    .min(1900, "Enter a valid 4-digit year.")
    .max(2100, "Enter a valid 4-digit year.")
    .optional(),
  highSchoolGradeOrPercentage: z.string().optional(),

  // Diploma / Bachelor / Master / PhD / Other
  institutionName: z.string().optional(),
  universityOrBoard: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  startYear: z
    .number()
    .int()
    .min(1900, "Enter a valid 4-digit year.")
    .max(2100, "Enter a valid 4-digit year.")
    .optional(),
  endYear: z
    .number()
    .int()
    .min(1900, "Enter a valid 4-digit year.")
    .max(2100, "Enter a valid 4-digit year.")
    .optional(),
  gradeOrCgpa: z.string().optional(),
});

const educationEntrySchema = educationEntrySchemaBase.superRefine(
  (entry, ctx) => {
    const level = entry.highestLevel;

    if (level === EEducationLevel.PRIMARY_SCHOOL) {
      if (!entry.schoolName) {
        ctx.addIssue({
          path: ["schoolName"],
          code: z.ZodIssueCode.custom,
          message: "School name is required for primary education.",
        });
      }
      if (entry.primaryYearCompleted == null) {
        ctx.addIssue({
          path: ["primaryYearCompleted"],
          code: z.ZodIssueCode.custom,
          message: "Year completed is required for primary education.",
        });
      }
    } else if (level === EEducationLevel.HIGH_SCHOOL) {
      if (!entry.highSchoolInstitutionName) {
        ctx.addIssue({
          path: ["highSchoolInstitutionName"],
          code: z.ZodIssueCode.custom,
          message: "Institution name is required for high school.",
        });
      }
      if (entry.highSchoolYearCompleted == null) {
        ctx.addIssue({
          path: ["highSchoolYearCompleted"],
          code: z.ZodIssueCode.custom,
          message: "Year completed is required for high school.",
        });
      }
    } else {
      // Diploma / Bachelors / Masters / Doctorate / Other
      if (!entry.institutionName) {
        ctx.addIssue({
          path: ["institutionName"],
          code: z.ZodIssueCode.custom,
          message: "Institution name is required.",
        });
      }
      if (!entry.fieldOfStudy) {
        ctx.addIssue({
          path: ["fieldOfStudy"],
          code: z.ZodIssueCode.custom,
          message: "Field of study is required.",
        });
      }
      if (entry.endYear == null) {
        ctx.addIssue({
          path: ["endYear"],
          code: z.ZodIssueCode.custom,
          message: "End year is required.",
        });
      }
    }
  }
);

const educationArraySchema = z
  .array(educationEntrySchema)
  .min(1, "At least one education entry is required.")
  .max(1, "You can only enter up to 1 education entry.");

/* ------------------------------------------------------------------ */
/* Employment (IEmploymentHistoryEntry[])                             */
/* ------------------------------------------------------------------ */

const employmentHistoryEntrySchema = z.object({
  organizationName: z.string().min(1, "Organization name is required."),
  designation: z.string().min(1, "Designation is required."),
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string().min(1, "End date is required."),
  reasonForLeaving: z.string().min(1, "Reason for leaving is required."),
  experienceCertificateFile: fileAssetSchema.nullable().optional(),
});

const employmentHistoryArraySchema = z
  .array(employmentHistoryEntrySchema)
  .max(3, "You can only enter up to 3 employment history entries.");

/* ------------------------------------------------------------------ */
/* Bank Details (IIndiaBankDetails)                                   */
/* ------------------------------------------------------------------ */

const indiaBankDetailsSchema = z.object({
  bankName: z.string().min(1, "Bank name is required."),
  branchName: z.string().min(1, "Branch name is required."),
  accountHolderName: z.string().min(1, "Account holder name is required."),
  accountNumber: z
    .string()
    .min(1, "Account number is required.")
    .regex(/^\d{6,18}$/, { message: "Enter a valid account number." }),
  ifscCode: z
    .string()
    .min(1, "IFSC code is required.")
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/i, {
      message: "Enter a valid IFSC code (e.g. HDFC0001234).",
    })
    .transform((v) => v.toUpperCase()),
  upiId: z
    .string()
    .optional()
    .refine((v) => !v || /^[a-z0-9.\-_]{2,256}@[a-z0-9.\-_]{2,64}$/i.test(v), {
      message: "Enter a valid UPI ID (e.g. name@bank).",
    }),

  // optional, no errors when empty
  voidCheque: fileAssetSchema.optional(),
});

/* ------------------------------------------------------------------ */
/* Declaration (IDeclarationAndSignature)                             */
/* ------------------------------------------------------------------ */

const declarationSchema = z
  .object({
    hasAcceptedDeclaration: z.boolean(),
    signature: z.object({
      file: fileAssetSchema,
      signedAt: z.string().min(1, "Signature date is required."),
    }),
    declarationDate: z.string().min(1, "Declaration date is required."),
  })
  .superRefine((value, ctx) => {
    if (!value.hasAcceptedDeclaration) {
      ctx.addIssue({
        path: ["hasAcceptedDeclaration"],
        code: z.ZodIssueCode.custom,
        message: "You must accept the declaration before submitting.",
      });
    }
  });

/* ------------------------------------------------------------------ */
/* Root India Onboarding Form schema                                  */
/* ------------------------------------------------------------------ */

export const indiaOnboardingFormSchema = z
  .object({
    personalInfo: personalInfoSchema,
    governmentIds: indiaGovernmentIdsSchema,
    education: educationArraySchema,

    hasPreviousEmployment: z
      .preprocess((val) => {
        if (val === "" || val == null) return undefined;
        if (val === "true") return true;
        if (val === "false") return false;
        return val;
      }, z.boolean().optional())
      .refine((v) => typeof v === "boolean", {
        message: "A selection is required.",
      })
      .transform((v) => v as boolean),

    employmentHistory: employmentHistoryArraySchema,
    bankDetails: indiaBankDetailsSchema,
    declaration: declarationSchema,
  })
  .superRefine((data, ctx) => {
    // We cannot detect "unset" after transform because it becomes false,
    // so we validate earlier via raw field state in UI.
    if (data.hasPreviousEmployment && data.employmentHistory.length === 0) {
      ctx.addIssue({
        path: ["employmentHistory"],
        code: z.ZodIssueCode.custom,
        message:
          "At least one employment history entry is required when you have previous employment.",
      });
    }
  });

/**
 * Strongly-typed form values used in React Hook Form.
 * Shape is intentionally aligned with IIndiaOnboardingFormData.
 */
export type IndiaOnboardingFormInput = z.input<
  typeof indiaOnboardingFormSchema
>;
export type IndiaOnboardingFormValues = z.output<
  typeof indiaOnboardingFormSchema
>;

// Explicit alias to highlight alignment with backend type
export type IndiaFormDataT = IIndiaOnboardingFormData;
