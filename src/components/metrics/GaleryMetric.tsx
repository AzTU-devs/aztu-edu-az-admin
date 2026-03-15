import { useEffect, useState } from "react";
import CollectionsIcon from '@mui/icons-material/Collections';
import { Link } from "react-router";

export default function GaleryMetric() {
    const targetNumber = 567;
    const [count, setCount] = useState(0);

    useEffect(() => {
        let current = 0;
        const duration = 1200;
        const steps = 60;
        const increment = targetNumber / steps;
        const stepTime = duration / steps;

        const interval = setInterval(() => {
            current += increment;
            if (current >= targetNumber) {
                setCount(targetNumber);
                clearInterval(interval);
            } else {
                setCount(Math.floor(current));
            }
        }, stepTime);

        return () => clearInterval(interval);
    }, []);

    return (
        <Link to="/galery" className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 dark:border-gray-800 dark:bg-gray-900 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 block">
            {/* Top accent bar */}
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-amber-500 to-amber-400 rounded-t-2xl" />

            {/* Icon */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-900/20">
                    <CollectionsIcon style={{ fontSize: 20 }} className="text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                    Aktiv
                </span>
            </div>

            {/* Count */}
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                {count.toLocaleString()}
            </h4>

            {/* Label */}
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                Qalereya
            </p>
        </Link>
    );
}
