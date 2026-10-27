import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import useFetchPhotos from "./hooks/useFetchPhotos";

function getInitialFavourites() {
  try {
    const savedFavourites = localStorage.getItem("favourites");
    const parsedFavourites = savedFavourites
      ? JSON.parse(savedFavourites)
      : [];

    return Array.isArray(parsedFavourites)
      ? parsedFavourites
      : [];
  } catch {
    return [];
  }
}

function favouritesReducer(state, action) {
  switch (action.type) {
    case "TOGGLE_FAVOURITE": {
      const photo = action.payload;

      const alreadyFavourite = state.some(
        (item) => item.id === photo.id
      );

      if (alreadyFavourite) {
        return state.filter(
          (item) => item.id !== photo.id
        );
      }

      return [...state, photo];
    }

    default:
      return state;
  }
}

function App() {
  const { photos, loading, error } = useFetchPhotos();

  const [search, setSearch] = useState("");

  const [favourites, dispatch] = useReducer(
    favouritesReducer,
    undefined,
    getInitialFavourites
  );

  // Save favourites whenever the list changes.
  useEffect(() => {
    try {
      localStorage.setItem(
        "favourites",
        JSON.stringify(favourites)
      );
    } catch {
      console.error(
        "Unable to save favourites to localStorage."
      );
    }
  }, [favourites]);

  // useCallback keeps the handler reference stable.
  const handleSearch = useCallback((event) => {
    setSearch(event.target.value);
  }, []);

  // useMemo filters existing photos without another API call.
  const filteredPhotos = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return photos.filter((photo) =>
      photo.author.toLowerCase().includes(searchTerm)
    );
  }, [photos, search]);

  const toggleFavourite = (photo) => {
    dispatch({
      type: "TOGGLE_FAVOURITE",
      payload: photo,
    });
  };

  const isFavourite = (id) =>
    favourites.some((photo) => photo.id === id);

  // Loading state
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <div
          className="flex flex-col items-center gap-3"
          role="status"
          aria-live="polite"
        >
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
          <p className="text-gray-700">
            Loading photos...
          </p>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <p
          className="rounded-lg bg-white p-6 text-center text-red-600"
          role="alert"
        >
          Error loading photos: {error}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">
          Photo Gallery
        </h1>

        {/* Search */}
        <div className="mb-8">
          <label
            htmlFor="author-search"
            className="sr-only"
          >
            Search photos by author name
          </label>

          <input
            id="author-search"
            type="search"
            placeholder="Search by author name..."
            value={search}
            onChange={handleSearch}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Empty search results */}
        {filteredPhotos.length === 0 ? (
          <p className="rounded-lg bg-white px-4 py-10 text-center text-gray-500">
            No photos found. Try another author name.
          </p>
        ) : (
          /* Responsive photo grid */
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {filteredPhotos.map((photo) => {
              const favourite = isFavourite(photo.id);

              return (
                <article
                  key={photo.id}
                  className="overflow-hidden rounded-lg bg-white shadow transition-shadow hover:shadow-lg"
                >
                  <img
                    src={photo.download_url}
                    alt={`Photo by ${photo.author}`}
                    loading="lazy"
                    className="h-64 w-full object-cover"
                  />

                  <div className="flex items-center justify-between gap-3 p-4">
                    <p className="font-medium text-gray-800">
                      {photo.author}
                    </p>

                    <button
                      type="button"
                      onClick={() => toggleFavourite(photo)}
                      className={`rounded-full p-1 text-2xl transition-colors focus:outline-none focus:ring-0 focus:ring-0 ${
                        favourite
                          ? "text-red-500"
                          : "text-gray-400 hover:text-red-500"
                      }`}
                      aria-label={
                        favourite
                          ? `Remove ${photo.author}'s photo from favourites`
                          : `Add ${photo.author}'s photo to favourites`
                      }
                      aria-pressed={favourite}
                    >
                      {favourite ? "♥" : "♡"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default App;