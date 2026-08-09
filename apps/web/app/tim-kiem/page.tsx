"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { searchMovies } from "@/lib/api/unified";
import MovieGrid from "@/components/movie/MovieGrid";
import Pagination from "@/components/ui/Pagination";
import SearchForm from "./SearchForm";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [movies, setMovies] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) {
      setMovies([]);
      return;
    }
    setLoading(true);
    searchMovies(q, page)
      .then((data) => {
        const items = data?.data?.items || [];
        const pagination = data?.data?.params?.pagination || {};
        const total = pagination.totalItems || items.length;
        setMovies(items);
        setTotalItems(total);
        setTotalPages(Math.ceil(total / 24) || 1);
        setCurrentPage(pagination.currentPage || page);
      })
      .catch((err) => {
        console.error("Failed to search movies:", err);
      })
      .finally(() => setLoading(false));
  }, [q, page]);

  useEffect(() => {
    document.title = q ? `Tìm kiếm: ${q} | Silent Ride` : "Tìm kiếm phim | Silent Ride";
  }, [q]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Tìm kiếm phim</h1>

      <SearchForm initialQuery={q} />

      {q ? (
        loading ? (
          <p className="text-foreground-muted text-center py-12">Đang tìm kiếm...</p>
        ) : (
          <>
            <p className="text-foreground-secondary mb-6">
              {movies.length > 0
                ? `Tìm thấy ${totalItems} kết quả cho "${q}"`
                : `Không tìm thấy kết quả cho "${q}"`}
            </p>
            {movies.length > 0 && (
              <>
                <MovieGrid movies={movies} />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  baseUrl={`/tim-kiem?q=${encodeURIComponent(q)}`}
                />
              </>
            )}
          </>
        )
      ) : (
        <p className="text-foreground-muted text-center py-12">
          Nhập tên phim để tìm kiếm
        </p>
      )}
    </div>
  );
}
