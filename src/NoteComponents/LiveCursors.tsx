interface CursorData {
    userId: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    position: {
        x: number;
        y: number;
    };
    lastUpdated: number;
    color: string;
}

interface LiveCursorsProps {
    cursors: CursorData[];
}

export default function LiveCursors({ cursors }: LiveCursorsProps) {
    return (
        <div className="absolute inset-0 pointer-events-none z-10">
            {cursors.map((cursor) => (
                <div
                    key={cursor.userId}
                    className="absolute transition-all duration-100 ease-linear"
                    style={{
                        left: `${cursor.position.x}px`,
                        top: `${cursor.position.y}px`,
                    }}
                >
                    <div
                        className="w-3 h-3 rounded-full border-2 border-white shadow-lg"
                        style={{ backgroundColor: cursor.color }}
                    />
                    <div
                        className="absolute top-4 left-1 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap shadow-lg"
                        style={{ backgroundColor: cursor.color }}
                    >
                        {cursor.user.name}
                    </div>
                    <div
                        className="absolute top-3 left-1.5 w-0.5 h-1"
                        style={{ backgroundColor: cursor.color }}
                    />
                </div>
            ))}
        </div>
    );
}