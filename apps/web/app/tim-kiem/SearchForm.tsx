"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface SearchFormProps {
    initialQuery: string;
}

export default function SearchForm({ initialQuery }: SearchFormProps) {
    const router = useRouter();
    const [query, setQuery] = useState(initialQuery);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/tim-kiem?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mb-8">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm kiếm phim, diễn viên..."
                    className="w-full pl-12 pr-4 py-3 bg-background-secondary rounded-xl border border-border focus:border-primary focus:outline-none transition-colors"
                />
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors"
                >
                    Tìm kiếm
                </button>
            </div>
        </form>
    );
}
