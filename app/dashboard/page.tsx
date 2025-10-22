"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

interface Project {
  id: string;
  name: string;
  createdAt?: Timestamp;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [user, setUser] = useState<User | null>(null);

  // 🔹 Track auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // 🔹 Load projects
  useEffect(() => {
    async function loadProjects() {
      const snapshot = await getDocs(collection(db, "projects"));
      const items = snapshot.docs.map((doc) => {
        const data = doc.data() as { name: string; createdAt?: Timestamp };
        return { id: doc.id, name: data.name, createdAt: data.createdAt };
      });
      setProjects(items);
    }
    loadProjects();
  }, []);

  // 🔹 Add a new project (only if logged in)
  async function addProject() {
    if (!user) {
      alert("Please sign in first.");
      return;
    }
    if (!newProjectName.trim()) return;
    const createdAt = Timestamp.now();
    const docRef = await addDoc(collection(db, "projects"), {
      name: newProjectName,
      createdAt,
      uid: user.uid, // store which user created it
    });
    setProjects((prev) => [
      ...prev,
      { id: docRef.id, name: newProjectName, createdAt },
    ]);
    setNewProjectName("");
  }

  // 🔹 Auth actions
  async function handleLogin() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  async function handleLogout() {
    await signOut(auth);
  }

  return (
    <main className="p-8">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Projects</h1>
        {user ? (
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Sign out
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Sign in with Google
          </button>
        )}
      </div>

      {user && (
        <p className="mb-4 text-gray-600">
          Signed in as <strong>{user.displayName}</strong>
        </p>
      )}

      <div className="flex gap-2 mb-6">
        <input
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          placeholder="New Project Name"
          className="border p-2 rounded flex-1"
          disabled={!user}
        />
        <button
          onClick={addProject}
          className={`px-4 py-2 rounded ${
            user
              ? "bg-blue-600 text-white"
              : "bg-gray-400 text-gray-100 cursor-not-allowed"
          }`}
          disabled={!user}
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {projects.map((p) => (
          <li key={p.id} className="border p-3 rounded">
            {p.name}
          </li>
        ))}
      </ul>
    </main>
  );
}
