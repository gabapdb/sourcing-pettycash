"use client";

import { useState } from "react";
import { useFirebaseAuth } from "@/lib/hooks/useFirebaseAuth";
import { useProjects } from "@/lib/hooks/useProjects";

export default function ProjectsPage() {
  const [newProjectName, setNewProjectName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    user,
    isAuthenticating,
    isProcessingAuthAction,
    authError,
    signInWithGoogle,
    signOutUser,
  } = useFirebaseAuth();

  const {
    projects,
    isLoading,
    loadError,
    isAdding,
    addError,
    addProject,
    refresh,
  } = useProjects();

  const handleAddProject = async () => {
    if (!user) {
      setFormError("Please sign in before adding a project.");
      return;
    }

    if (!newProjectName.trim()) {
      setFormError("Project name is required.");
      return;
    }

    setFormError(null);
    const wasAdded = await addProject(newProjectName, user);
    if (wasAdded) {
      setNewProjectName("");
    }
  };

  return (
    <main className="space-y-6 p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          {authError && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {authError.message}
            </p>
          )}
        </div>
        {user ? (
          <button
            onClick={signOutUser}
            disabled={isProcessingAuthAction}
            className="rounded bg-red-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-red-400"
          >
            {isProcessingAuthAction ? "Signing out…" : "Sign out"}
          </button>
        ) : (
          <button
            onClick={signInWithGoogle}
            disabled={isProcessingAuthAction || isAuthenticating}
            className="rounded bg-green-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-green-400"
          >
            {isProcessingAuthAction ? "Signing in…" : "Sign in with Google"}
          </button>
        )}
      </header>

      {user ? (
        <p className="text-gray-600">
          Signed in as <strong>{user.displayName ?? user.email}</strong>
        </p>
      ) : (
        !isAuthenticating && (
          <p className="text-gray-600">Sign in to manage your project list.</p>
        )
      )}

      <section className="space-y-2">
        <div className="flex flex-wrap items-start gap-3">
          <input
            value={newProjectName}
            onChange={(event) => {
              setNewProjectName(event.target.value);
              if (formError) {
                setFormError(null);
              }
            }}
            placeholder="New Project Name"
            className="flex-1 min-w-[220px] rounded border p-2"
            disabled={!user || isAdding}
            aria-invalid={Boolean(formError || addError)}
          />
          <button
            onClick={handleAddProject}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-blue-400"
            disabled={!user || isAdding}
          >
            {isAdding ? "Adding…" : "Add"}
          </button>
          <button
            onClick={() => refresh()}
            className="rounded border border-gray-300 px-4 py-2 text-gray-700 disabled:cursor-not-allowed disabled:text-gray-400"
            disabled={isLoading}
          >
            {isLoading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
        {(formError || addError) && (
          <p className="text-sm text-red-600" role="alert">
            {formError ?? addError?.message}
          </p>
        )}
      </section>

      <section className="space-y-4">
        {isLoading ? (
          <p className="text-gray-500">Loading projects…</p>
        ) : loadError ? (
          <div className="space-y-2 rounded border border-red-200 bg-red-50 p-4" role="alert">
            <p className="font-semibold text-red-700">We couldn’t load your projects.</p>
            <p className="text-sm text-red-600">{loadError.message}</p>
            <button
              onClick={() => refresh()}
              className="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-red-400"
              disabled={isLoading}
            >
              Try again
            </button>
          </div>
        ) : projects.length === 0 ? (
          <p className="text-gray-500">No projects yet. Start by adding one above.</p>
        ) : (
          <ul className="space-y-2">
            {projects.map((project) => (
              <li key={project.id} className="rounded border p-3">
                <p className="font-medium">{project.name}</p>
                {project.createdAt && (
                  <p className="text-xs text-gray-500">
                    Created {project.createdAt.toDate().toLocaleString()}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
