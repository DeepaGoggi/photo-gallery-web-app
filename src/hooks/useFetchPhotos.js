import { useEffect, useState } from "react";

function useFetchPhotos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPhotos() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "https://picsum.photos/v2/list?limit=30",
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch photos (HTTP ${response.status})`
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error(
            "The photo API returned an unexpected response."
          );
        }

        setPhotos(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchPhotos();

    return () => controller.abort();
  }, []);

  return { photos, loading, error };
}

export default useFetchPhotos;