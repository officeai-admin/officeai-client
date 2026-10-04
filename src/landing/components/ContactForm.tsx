import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { isStaticFormsConfigured, submitStaticForm } from "@/services/staticFormsService";
import { contact, site } from "../content";

type Field = "name" | "email" | "message";
type Values = Record<Field, string> & { topic: string };
type Errors = Partial<Record<Field, string>>;
type Status = "idle" | "sending" | "sent" | "failed" | "not-connected";

const EMPTY: Values = { name: "", email: "", topic: contact.topics[0], message: "" };
const REQUIRED: Field[] = ["name", "email", "message"];
const STATUS_TEXT: Record<Status, string> = {
  idle: "",
  sending: "",
  sent: contact.sent,
  failed: contact.failed,
  "not-connected": contact.notConnected,
};

function validate(values: Values): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Enter your name.";
  if (!values.email.trim()) errors.email = "Enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (!values.message.trim()) errors.message = "Write a short message.";
  return errors;
}

/** The contact form checks its fields in the browser, then sends them through StaticForms. */
export function ContactForm() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  // A field people never see. Scripts that fill in every input give themselves away here.
  const [trap, setTrap] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const refs = { name: nameRef, email: emailRef, message: messageRef };

  const update =
    (field: Field | "topic") =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const next = { ...values, [field]: event.target.value };
      setValues(next);
      if (status !== "sending") setStatus("idle");
      // A field that is showing an error is re-checked as it is corrected.
      if (field !== "topic" && errors[field]) setErrors({ ...errors, [field]: validate(next)[field] });
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;

    const found = validate(values);
    setErrors(found);
    const firstInvalid = REQUIRED.find((field) => found[field]);
    if (firstInvalid) {
      setStatus("idle");
      refs[firstInvalid].current?.focus();
      return;
    }

    if (trap) {
      // Filled in by a script, not a person: say thanks and send nothing.
      setValues(EMPTY);
      setStatus("sent");
      return;
    }

    if (!isStaticFormsConfigured) {
      setStatus("not-connected");
      return;
    }

    setStatus("sending");
    try {
      await submitStaticForm({
        name: values.name.trim(),
        email: values.email.trim(),
        subject: `${site.formTitle} Contact request: ${values.name}`,
        // The topic leads the message so it reaches the inbox whatever the email template shows.
        message: `Topic: ${values.topic}\n\n${values.message.trim()}`,
      });
      setValues(EMPTY);
      setStatus("sent");
    } catch (error) {
      console.error("Contact form:", error instanceof Error ? error.message : error);
      setStatus("failed");
    }
  };

  const fieldClass = (field: Field) => (errors[field] ? "field has-error" : "field");
  const sending = status === "sending";
  const problem = status === "failed" || status === "not-connected";

  return (
    <form className="form" noValidate onSubmit={handleSubmit}>
      <div className={fieldClass("name")}>
        <label htmlFor="name">Name</label>
        <input
          ref={nameRef}
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={values.name}
          onChange={update("name")}
          aria-invalid={Boolean(errors.name)}
          aria-describedby="name-error"
        />
        <p className="error" id="name-error" aria-live="polite">
          {errors.name}
        </p>
      </div>

      <div className={fieldClass("email")}>
        <label htmlFor="email">Email</label>
        <input
          ref={emailRef}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={values.email}
          onChange={update("email")}
          aria-invalid={Boolean(errors.email)}
          aria-describedby="email-error"
        />
        <p className="error" id="email-error" aria-live="polite">
          {errors.email}
        </p>
      </div>

      <div className="field">
        <label htmlFor="topic">Topic</label>
        <select id="topic" name="topic" value={values.topic} onChange={update("topic")}>
          {contact.topics.map((topic) => (
            <option key={topic}>{topic}</option>
          ))}
        </select>
      </div>

      <div className={fieldClass("message")}>
        <label htmlFor="message">Message</label>
        <textarea
          ref={messageRef}
          id="message"
          name="message"
          rows={5}
          required
          value={values.message}
          onChange={update("message")}
          aria-invalid={Boolean(errors.message)}
          aria-describedby="message-help message-error"
        />
        <p className="help" id="message-help">
          A few sentences is plenty.
        </p>
        <p className="error" id="message-error" aria-live="polite">
          {errors.message}
        </p>
      </div>

      <div className="sr-only" aria-hidden="true">
        <label htmlFor="contact-extra">Leave this field empty</label>
        <input
          id="contact-extra"
          name="contact-extra"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={trap}
          onChange={(event) => setTrap(event.target.value)}
        />
      </div>

      <button className="btn btn-coral" type="submit" disabled={sending}>
        {sending ? contact.sending : contact.submit}
        <ArrowRight className="ic" size={18} strokeWidth={1.75} aria-hidden="true" />
      </button>
      <p
        className={`form-status${status === "sent" ? " is-visible" : ""}${problem ? " is-visible is-problem" : ""}`}
        role={problem ? "alert" : "status"}
      >
        {STATUS_TEXT[status]}
        {problem && (
          <>
            {" "}
            <a className="text-link" href={`mailto:${contact.details[0].value}`}>
              {contact.details[0].value}
            </a>
          </>
        )}
      </p>
    </form>
  );
}
