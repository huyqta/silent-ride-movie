"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
    // Ensure values are numbers
    const _totalPages = Number(totalPages) || 1;
    const _currentPage = Number(currentPage) || 1;

    if (_totalPages <= 1) return null;

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const showEllipsis = _totalPages > 7;

        if (!showEllipsis) {
            for (let i = 1; i <= _totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (_currentPage > 3) {
                pages.push("...");
            }

            // Show pages around current
            const start = Math.max(2, _currentPage - 1);
            const end = Math.min(_totalPages - 1, _currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (_currentPage < _totalPages - 2) {
                pages.push("...");
            }

            // Always show last page
            if (_totalPages > 1) {
                pages.push(_totalPages);
            }
        }

        return pages;
    };

    // Simple URL builder that handles both path-based and search params
    const getPageUrl = (page: number) => {
        // Check if baseUrl already has query params
        if (baseUrl.includes("?")) {
            return `${baseUrl}&page=${page}`;
        }
        return `${baseUrl}?page=${page}`;
    };

    return (
        <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
            {/* Previous button */}
            {_currentPage > 1 ? (
                <Link
                    href={getPageUrl(_currentPage - 1)}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-foreground-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Trước</span>
                </Link>
            ) : (
                <span className="flex items-center gap-1 px-3 py-2 text-sm text-foreground-muted cursor-not-allowed">
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Trước</span>
                </span>
            )}

            {/* Page numbers */}
            <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) =>
                    typeof page === "number" ? (
                        <Link
                            key={index}
                            href={getPageUrl(page)}
                            className={`min-w-[40px] h-10 flex items-center justify-center text-sm rounded-lg transition-colors ${page === _currentPage
                                ? "bg-primary text-white font-medium"
                                : "text-foreground-secondary hover:text-white hover:bg-white/5"
                                }`}
                        >
                            {page}
                        </Link>
                    ) : (
                        <span key={index} className="px-2 text-foreground-muted">
                            {page}
                        </span>
                    )
                )}
            </div>

            {/* Next button */}
            {_currentPage < _totalPages ? (
                <Link
                    href={getPageUrl(_currentPage + 1)}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-foreground-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                    <span className="hidden sm:inline">Sau</span>
                    <ChevronRight className="w-4 h-4" />
                </Link>
            ) : (
                <span className="flex items-center gap-1 px-3 py-2 text-sm text-foreground-muted cursor-not-allowed">
                    <span className="hidden sm:inline">Sau</span>
                    <ChevronRight className="w-4 h-4" />
                </span>
            )}
        </nav>
    );
}
