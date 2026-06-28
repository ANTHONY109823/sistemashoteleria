// Skeleton Card Component for loading states with shimmer effect
const SkeletonCard = () => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center gap-4 animate-pulse">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded w-24"></div>
                    <div className="h-6 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer rounded w-16"></div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonCard;
