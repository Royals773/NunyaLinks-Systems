"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { Loader2, CheckCircle2, AlertCircle, Mail } from "lucide-react";
import {
  INDUSTRY_OPTIONS,
  EMPLOYEE_OPTIONS,
  HOURS_OPTIONS,
  CONTACT_METHOD_OPTIONS,
  EMAIL_REGEX,
  HONEYPOT_FIELD_NAME,
  type AuditRequestPayload,
} from "@/lib/audit";
import { ENQUIRIES_EMAIL, ENQUIRIES_MAILTO } from "@/lib/site";
import Reveal from "./Reveal";

const INITIAL_FORM: Omit<AuditRequestPayload, "submissionId"> = {
  fullName: "",
  businessName: "",
  email: "",
  phone: "",
  location: "",
  industry: "",
  employees: "",
  process: "",
  hoursPerWeek: "",
  contactMethod: "",
};

type FormFields = typeof INITIAL_FORM;
type FormErrors = Partial<Record<keyof FormFields, string>>;
type SubmitStatus = "idle" | "submitting" | "success" | "error";

const REQUIRED_FIELD_LABELS: Partial<Record<keyof FormFields, string>> = {
  fullName: "Please enter your full name.",
  businessName: "Please enter your business name.",
  email: "Please enter your email address.",
  location: "Please enter your business location.",
  industry: "Please select your industry.",
  employees: "Please select your number of employees.",
  process: "Please tell us what task or process wastes the most time.",
  hoursPerWeek: "Please select roughly how many hours a week it takes.",
  contactMethod: "Please select a preferred contact method.",
};

// Two-step grouping: contact/business details first, then the
// qualification detail that determines fit. Both steps feed the same
// formData object and the same final payload — nothing about the
// request shape changes, only how the fields are presented.
const STEP_1_FIELDS: (keyof FormFields)[] = [
  "fullName",
  "businessName",
  "email",
  "phone",
  "location",
  "contactMethod",
];
const STEP_2_FIELDS: (keyof FormFields)[] = [
  "industry",
  "employees",
  "process",
  "hoursPerWeek",
];

/** contactMethod has no single input of its own — its first radio stands in for focus purposes. */
function focusTargetId(field: keyof FormFields): string {
  return field === "contactMethod"
    ? `contactMethod-${CONTACT_METHOD_OPTIONS[0]}`
    : field;
}

// Focus indication is handled site-wide by the global :focus-visible
// ring in globals.css, so inputs only need to suppress the browser's
// default outline here rather than defining their own ring.
const inputBaseClasses =
  "block w-full rounded-md border bg-white px-4 py-3 text-base text-navy shadow-sm transition-colors focus:outline-none";

function fieldClasses(hasError: boolean) {
  return `${inputBaseClasses} ${
    hasError ? "border-red-500" : "border-slate-300 focus:border-accent"
  }`;
}

export default function AuditForm() {
  const [formData, setFormData] = useState<FormFields>(INITIAL_FORM);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);

  // Stable across retries of the same submission: a failed request keeps
  // this ID so a resubmit reuses it, and it's only rotated after a
  // genuine success. A ref (not state) so re-renders never regenerate it,
  // and lazily initialised so it's only ever generated once per mount.
  const submissionIdRef = useRef<string | null>(null);
  if (submissionIdRef.current === null) {
    submissionIdRef.current = crypto.randomUUID();
  }

  function updateField<K extends keyof FormFields>(
    field: K,
    value: FormFields[K]
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  /** Validates only the given fields; omit to validate the whole form. */
  function validate(fields?: (keyof FormFields)[]): FormErrors {
    const nextErrors: FormErrors = {};
    const fieldsToCheck = (
      fields ??
      (Object.keys(REQUIRED_FIELD_LABELS) as (keyof FormFields)[])
    ).filter((field) => field in REQUIRED_FIELD_LABELS);

    for (const field of fieldsToCheck) {
      if (!formData[field].trim()) {
        nextErrors[field] = REQUIRED_FIELD_LABELS[field];
      }
    }

    if (
      fieldsToCheck.includes("email") &&
      formData.email.trim() &&
      !EMAIL_REGEX.test(formData.email.trim())
    ) {
      nextErrors.email = "Please enter a valid email address.";
    }

    return nextErrors;
  }

  function focusFirstError(fieldErrors: FormErrors, fields: (keyof FormFields)[]) {
    const firstInvalid = fields.find((field) => fieldErrors[field]);
    if (!firstInvalid) return;
    requestAnimationFrame(() => {
      document.getElementById(focusTargetId(firstInvalid))?.focus();
    });
  }

  function goToStep(nextStep: 1 | 2) {
    setErrors({});
    setStep(nextStep);
    requestAnimationFrame(() => stepHeadingRef.current?.focus());
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    if (step === 1) {
      const step1Errors = validate(STEP_1_FIELDS);
      setErrors(step1Errors);
      if (Object.keys(step1Errors).length > 0) {
        focusFirstError(step1Errors, STEP_1_FIELDS);
        return;
      }
      goToStep(2);
      return;
    }

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      focusFirstError(validationErrors, STEP_2_FIELDS);
      return;
    }

    setStatus("submitting");
    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          submissionId: submissionIdRef.current,
          [HONEYPOT_FIELD_NAME]: honeypot,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        setServerError(
          result.error ??
            "Something went wrong sending your request. Please try again."
        );
        setStatus("error");
        return;
      }

      // Success: rotate the ID so the next genuine enquiry gets a new one.
      submissionIdRef.current = crypto.randomUUID();
      setStatus("success");
    } catch {
      setServerError(
        "Something went wrong sending your request. Please try again."
      );
      setStatus("error");
    }
  }

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="bg-white py-14 sm:py-20"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-10 text-center">
          <h2
            id="contact-heading"
            className="font-display text-3xl font-semibold tracking-tight text-navy sm:text-4xl"
          >
            Book your free Automation Opportunity Review
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
            Tell us what&rsquo;s eating your week and we&rsquo;ll identify
            the one process worth investigating first — no cost, no
            obligation.
          </p>
          <a
            href={ENQUIRIES_MAILTO}
            className="mt-4 inline-flex flex-wrap items-center justify-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-dark"
          >
            <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
            Prefer email? Reach us at {ENQUIRIES_EMAIL}
          </a>
        </Reveal>

        <Reveal>
          {status === "success" ? (
            <div
              role="status"
              className="mx-auto flex max-w-xl flex-col items-center rounded-lg border border-slate-200 bg-slate-50 p-10 text-center shadow-sm"
            >
              <CheckCircle2
                className="h-12 w-12 text-accent"
                aria-hidden="true"
              />
              <p className="mt-4 text-lg font-semibold text-navy">
                Thanks — we&rsquo;ve got it. We&rsquo;ll be in touch within
                one working day to book your free Automation Opportunity
                Review.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="mx-auto max-w-xl space-y-6 rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm sm:p-8"
            >
              {/* Honeypot: hidden from real users, catches simple bots. */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "-9999px",
                  width: 1,
                  height: 1,
                  overflow: "hidden",
                }}
              >
                <label htmlFor={HONEYPOT_FIELD_NAME}>
                  Leave this field blank
                </label>
                <input
                  id={HONEYPOT_FIELD_NAME}
                  name={HONEYPOT_FIELD_NAME}
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {serverError && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  <AlertCircle
                    className="mt-0.5 h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{serverError}</span>
                </div>
              )}

              <div>
                <div className="flex gap-1.5" aria-hidden="true">
                  <span
                    className={`h-1 flex-1 rounded-full ${
                      step >= 1 ? "bg-accent" : "bg-slate-200"
                    }`}
                  />
                  <span
                    className={`h-1 flex-1 rounded-full ${
                      step >= 2 ? "bg-accent" : "bg-slate-200"
                    }`}
                  />
                </div>
                <h3
                  ref={stepHeadingRef}
                  tabIndex={-1}
                  className="mt-3 text-sm font-semibold text-navy focus:outline-none"
                >
                  Step {step} of 2 —{" "}
                  {step === 1 ? "About you" : "About the process"}
                </h3>
              </div>

              {step === 1 && (
              <>
              <Field
                id="fullName"
                label="Full name"
                required
                error={errors.fullName}
              >
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  className={fieldClasses(!!errors.fullName)}
                  aria-invalid={!!errors.fullName}
                  aria-describedby={
                    errors.fullName ? "fullName-error" : undefined
                  }
                />
              </Field>

              <Field
                id="businessName"
                label="Business name"
                required
                error={errors.businessName}
              >
                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  autoComplete="organization"
                  value={formData.businessName}
                  onChange={(e) =>
                    updateField("businessName", e.target.value)
                  }
                  className={fieldClasses(!!errors.businessName)}
                  aria-invalid={!!errors.businessName}
                  aria-describedby={
                    errors.businessName ? "businessName-error" : undefined
                  }
                />
              </Field>

              <Field
                id="email"
                label="Email address"
                required
                error={errors.email}
              >
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={fieldClasses(!!errors.email)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </Field>

              <Field id="phone" label="Phone number">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className={fieldClasses(false)}
                />
              </Field>

              <Field
                id="location"
                label="Business location"
                required
                error={errors.location}
              >
                <input
                  id="location"
                  name="location"
                  type="text"
                  autoComplete="address-level2"
                  required
                  value={formData.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  className={fieldClasses(!!errors.location)}
                  aria-invalid={!!errors.location}
                  aria-describedby={
                    errors.location ? "location-error" : undefined
                  }
                />
              </Field>

              <fieldset>
                <legend className="mb-2 block text-sm font-semibold text-navy">
                  Preferred contact method
                  <span className="ml-1 text-red-500" aria-hidden="true">
                    *
                  </span>
                  <span className="sr-only"> (required)</span>
                </legend>
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                  {CONTACT_METHOD_OPTIONS.map((option) => (
                    <label
                      key={option}
                      htmlFor={`contactMethod-${option}`}
                      className="flex items-center gap-2 text-base text-slate-700"
                    >
                      <input
                        id={`contactMethod-${option}`}
                        type="radio"
                        name="contactMethod"
                        value={option}
                        required
                        checked={formData.contactMethod === option}
                        onChange={(e) =>
                          updateField("contactMethod", e.target.value)
                        }
                        className="h-4 w-4 text-accent"
                        aria-describedby={
                          errors.contactMethod
                            ? "contactMethod-error"
                            : undefined
                        }
                      />
                      {option}
                    </label>
                  ))}
                </div>
                {errors.contactMethod && (
                  <p
                    id="contactMethod-error"
                    role="alert"
                    className="mt-1.5 text-sm text-red-600"
                  >
                    {errors.contactMethod}
                  </p>
                )}
              </fieldset>
              </>
              )}

              {step === 2 && (
              <>
              <Field
                id="industry"
                label="Industry"
                required
                error={errors.industry}
              >
                <select
                  id="industry"
                  name="industry"
                  required
                  value={formData.industry}
                  onChange={(e) => updateField("industry", e.target.value)}
                  className={fieldClasses(!!errors.industry)}
                  aria-invalid={!!errors.industry}
                  aria-describedby={
                    errors.industry ? "industry-error" : undefined
                  }
                >
                  <option value="">Select an industry</option>
                  {INDUSTRY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                id="employees"
                label="Number of employees"
                required
                error={errors.employees}
              >
                <select
                  id="employees"
                  name="employees"
                  required
                  value={formData.employees}
                  onChange={(e) => updateField("employees", e.target.value)}
                  className={fieldClasses(!!errors.employees)}
                  aria-invalid={!!errors.employees}
                  aria-describedby={
                    errors.employees ? "employees-error" : undefined
                  }
                >
                  <option value="">Select a range</option>
                  {EMPLOYEE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                id="process"
                label="The task or process that wastes the most time"
                required
                error={errors.process}
              >
                <textarea
                  id="process"
                  name="process"
                  rows={4}
                  value={formData.process}
                  onChange={(e) => updateField("process", e.target.value)}
                  className={fieldClasses(!!errors.process)}
                  aria-invalid={!!errors.process}
                  aria-describedby={
                    errors.process ? "process-error" : undefined
                  }
                />
              </Field>

              <Field
                id="hoursPerWeek"
                label="Roughly how many hours a week it takes"
                required
                error={errors.hoursPerWeek}
              >
                <select
                  id="hoursPerWeek"
                  name="hoursPerWeek"
                  required
                  value={formData.hoursPerWeek}
                  onChange={(e) =>
                    updateField("hoursPerWeek", e.target.value)
                  }
                  className={fieldClasses(!!errors.hoursPerWeek)}
                  aria-invalid={!!errors.hoursPerWeek}
                  aria-describedby={
                    errors.hoursPerWeek ? "hoursPerWeek-error" : undefined
                  }
                >
                  <option value="">Select an estimate</option>
                  {HOURS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>
              </>
              )}

              <div className="flex gap-3">
                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="rounded-md border border-slate-300 px-6 py-3.5 text-base font-semibold text-navy transition-colors hover:bg-slate-100"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-ink px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-navy disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === "submitting" && (
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  )}
                  {status === "submitting"
                    ? "Sending your request…"
                    : step === 1
                      ? "Continue"
                      : "Book My Free Opportunity Review"}
                </button>
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

function Field({ id, label, required, error, children }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-navy"
      >
        {label}
        {required && (
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {children}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-sm text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
