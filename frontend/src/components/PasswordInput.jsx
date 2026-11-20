import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// Password box with a show/hide eye button
export default function PasswordInput(props) {
  const [show, setShow] = useState(false);
  return (
    <span className="vf-password">
      <input {...props} type={show ? "text" : "password"} />
      <button
        type="button"
        className="vf-password-toggle"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        title={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </span>
  );
}
