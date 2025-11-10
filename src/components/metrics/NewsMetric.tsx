import { useEffect, useState } from "react";
import NewspaperIcon from '@mui/icons-material/Newspaper';

export default function NewsMetric() {
    const targetNumber = 1475;
    const [count, setCount] = useState(0);

    useEffect(() => {
        let current = 10;
        const stepTime = 50;
        const incrementValue = 50;

        const increment = () => {
            current += incrementValue;
            if (current > targetNumber) {
                setCount(targetNumber);
                clearInterval(interval);
            } else {
                setCount(current);
            }
        };

        const interval = setInterval(increment, stepTime);

        return () => clearInterval(interval);
    }, [targetNumber]);

    return (
        <div className="flex justify-between items-center rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 w-[23%] min-w-[23%]">
            <div className="flex flex-col justify-center items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 mb-[20px]">
                    Xəbərlər
                </span>
                <div className="flex flex-col items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                    <NewspaperIcon className="text-gray-800 size-6 dark:text-white/90" />
                </div>
            </div>

            <div className="flex justify-center items-center">
                <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                    {count}
                </h4>
            </div>
        </div>
    );
}