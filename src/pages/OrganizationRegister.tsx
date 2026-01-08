import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganizationStore } from "../store/organization-store";

export default function OrganizationRegister() {
  const { registerOrg, loading, error } = useOrganizationStore();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerOrg(name, email);

    if (!error) {
      alert("Organization registered successfully! Now you can signup.");
      navigate("/signup");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 sm:p-6 rounded-xl shadow-md w-full max-w-md mx-4 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">
          Register Organization
        </h2>

        <input
          type="text"
          placeholder="Organization Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="email"
          placeholder="Organization Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register Organization"}
        </button>

        <p className="text-center text-sm">
          Already have an organization?{" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="text-blue-500 hover:underline"
          >
            Go to Signup
          </button>
        </p>
      </form>
    </div>
  );
}
