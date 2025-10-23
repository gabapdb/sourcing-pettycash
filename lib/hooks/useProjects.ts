import { useCallback, useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  Timestamp,
  addDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import type { User } from "firebase/auth";

export interface Project {
  id: string;
  name: string;
  createdAt?: Timestamp;
}

const sortProjects = (items: Project[]) =>
  [...items].sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0;
    const bTime = b.createdAt?.toMillis?.() ?? 0;
    return bTime - aTime;
  });

interface UseProjectsResult {
  projects: Project[];
  isLoading: boolean;
  loadError: Error | null;
  isAdding: boolean;
  addError: Error | null;
  addProject: (name: string, user: User) => Promise<boolean>;
  refresh: () => Promise<void>;
}

function toError(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error : new Error(fallbackMessage);
}

export function useProjects(): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<Error | null>(null);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const snapshot = await getDocs(collection(db, "projects"));
      const items = snapshot.docs.map((doc) => {
        const data = doc.data() as { name: string; createdAt?: Timestamp };
        return { id: doc.id, name: data.name, createdAt: data.createdAt };
      });
      setProjects(sortProjects(items));
    } catch (error) {
      setLoadError(toError(error, "Unable to load projects."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const addProject = useCallback(
    async (name: string, user: User) => {
      const trimmedName = name.trim();
      if (!trimmedName) {
        setAddError(new Error("Project name is required."));
        return false;
      }

      setAddError(null);
      setIsAdding(true);

      const createdAt = Timestamp.now();
      const optimisticProject: Project = {
        id: `temp-${Date.now()}`,
        name: trimmedName,
        createdAt,
      };

      setProjects((prev) => sortProjects([...prev, optimisticProject]));

      try {
        const docRef = await addDoc(collection(db, "projects"), {
          name: trimmedName,
          createdAt,
          uid: user.uid,
        });

        setProjects((prev) =>
          sortProjects(
            prev.map((project) =>
              project.id === optimisticProject.id
                ? { ...project, id: docRef.id }
                : project,
            ),
          ),
        );

        return true;
      } catch (error) {
        setProjects((prev) =>
          sortProjects(
            prev.filter((project) => project.id !== optimisticProject.id),
          ),
        );
        setAddError(toError(error, "Unable to add project."));
        return false;
      } finally {
        setIsAdding(false);
      }
    },
    [],
  );

  const refresh = useCallback(async () => {
    await loadProjects();
  }, [loadProjects]);

  return {
    projects,
    isLoading,
    loadError,
    isAdding,
    addError,
    addProject,
    refresh,
  };
}
