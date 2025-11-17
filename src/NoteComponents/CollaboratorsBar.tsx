interface CollaborationUser {
    userId: string;
    user: {
        id: string;
        name: string;
        email: string;
        avatarUrl?: string
    };
}

interface CollaboratorsBarProps {
    onlineUsers: CollaborationUser[];
    typingUsers: CollaborationUser[];
    currentUser: any;
}

export default function CollaboratorsBar({ onlineUsers, typingUsers, currentUser }: CollaboratorsBarProps) {
    const getTypingText = () => {
        if (typingUsers.length === 0) return null;
        const userNames = typingUsers.map(user => user.user.name);
        if (userNames.length === 1) return `${userNames[0]} is typing...`;
        if (userNames.length === 2) return `${userNames[0]} and ${userNames[1]} are typing...`;
        return `${userNames.length} people are typing...`;
    };

    const typingText = getTypingText();

    return (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-6 py-3">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <div className="flex -space-x-2">

                                <div className="relative group">
                                    {currentUser?.avatarUrl ? (
                                        <img
                                            src={currentUser?.avatarUrl}
                                            alt={currentUser.name || 'You'}
                                            className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 shadow-sm object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full border-2 border-white dark:border-gray-800 shadow-sm flex items-center justify-center text-white text-xs font-medium">
                                            {currentUser?.name?.charAt(0) || 'U'}
                                        </div>
                                    )}

                                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 dark:bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-50">
                                        {currentUser?.name || 'You'} (You)
                                    </div>
                                </div>

                                {/* Other Online Users - ALSO WITH AVATARS */}
                                {onlineUsers.slice(0, 3).map((user) => (
                                    <div key={user.userId} className="relative group">
                                        {user.user.avatarUrl ? (
                                            <img
                                                src={user.user.avatarUrl}
                                                alt={user.user.name || 'User'}
                                                className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 shadow-sm object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-2 border-white dark:border-gray-800 shadow-sm flex items-center justify-center text-white text-xs font-medium">
                                                {user.user.name?.charAt(0) || user.user.email?.charAt(0) || 'U'}
                                            </div>
                                        )}

                                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 dark:bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-50">
                                            {user.user.name || user.user.email}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                    {onlineUsers.length + 1} are online
                                </span>

                                {onlineUsers.length > 3 && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                                        +{onlineUsers.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {typingText && (
                        <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="font-medium">{typingText}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}