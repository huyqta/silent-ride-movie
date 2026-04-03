import Link from "next/link";
import { Film, Github, Heart } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t border-border bg-background-secondary mt-auto">
            <div className="container mx-auto px-4 py-8">
                <div className="text-center text-sm text-foreground-muted">
                    <p>
                        © {new Date().getFullYear()} SilentRide. Website chỉ dành cho mục đích cá nhân, KHÔNG chia sẻ ra cộng đồng.
                    </p>
                </div>
            </div>
        </footer>
    );
}
