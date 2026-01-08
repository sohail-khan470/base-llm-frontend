import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/auth-store";
import { useOrganizationStore } from "../store/organization-store";

export default function Signup() {
  const { signup, loading, error } = useAuthStore();
  const { organizations, fetchAllOrgs } = useOrganizationStore();
  console.log(organizations);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllOrgs();
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedOrg, setSelectedOrg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) {
      alert("Please select an organization");
      return;
    }

    await signup(email, password, selectedOrg);

    if (!error) {
      alert("Signup successful! Please login.");
      navigate("/login"); // redirect to login page after signup
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 sm:p-6 rounded-xl shadow-md w-full max-w-md mx-4 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Signup</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />

        {/* 👇 Dropdown for organizations */}
        <select
          value={selectedOrg}
          onChange={(e) => setSelectedOrg(e.target.value)}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Organization</option>
          {organizations.map((org) => (
            <option key={org._id} value={org._id}>
              {org.name}
            </option>
          ))}
        </select>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "Signing up..." : "Signup"}
        </button>

        <p className="text-center text-sm">
          Don't have an organization?{" "}
          <Link to="/register-org" className="text-blue-500 hover:underline">
            Register Organization
          </Link>
        </p>
      </form>
    </div>
  );
}
