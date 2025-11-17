import { api } from "@/lib/api";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { Note } from "@/types";
import { useState } from "react";

const Icons = {
    Star: () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
    StarOutline: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
    Tag: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,

}

export const TagManager = ({ note, onTagsUpdate }: { note: Note; onTagsUpdate: (tags: string[]) => void }) => {
    const [tagInput, setTagInput] = useState('');
    const currentTags = note.userPreferences?.[0]?.personalTags || [];

    const handleAddTag = async (tagText: string) => {
        const cleanTag = tagText.trim().toLowerCase();
        if (!cleanTag || currentTags.includes(cleanTag) || currentTags.length >= 3) return;

        try {
            const token = auth.getToken();
            if (!token) return;

            const response = await api.addPersonalTag(token, note.id, cleanTag);
            if (response.success) {
                onTagsUpdate(response.preference.personalTags);
                setTagInput('');
            }
        } catch (error) {
           logger.error('Failed to add tag:', { error });
        }
    };

    const handleRemoveTag = async (tagToRemove: string) => {
        try {
            const token = auth.getToken();
            if (!token) return;

            const response = await api.removePersonalTag(token, note.id, tagToRemove);
            if (response.success) {
                onTagsUpdate(response.preference.personalTags);
            }
        } catch (error) {
            logger.error('Failed to remove tag:', { error });
        }
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Favorite Status - Read Only */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${note.userPreferences?.[0]?.isFavorite
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                {note.userPreferences?.[0]?.isFavorite ? (
                    <>
                        <Icons.Star />
                        <span className="text-sm font-medium">Favorited</span>
                    </>
                ) : (
                    <>
                        <Icons.StarOutline />
                        <span className="text-sm font-medium">Not in Favorites</span>
                    </>
                )}
            </div>

            {/* Tag Management */}
            <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <Icons.Tag />
                        Tags:
                    </span>

                    {/* Current Tags */}
                    <div className="flex flex-wrap gap-2">
                        {currentTags.map(tag => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1 bg-blue-700 text-white px-3 py-1 rounded-full text-sm"
                            >
                                #{tag}
                                <button
                                    onClick={() => handleRemoveTag(tag)}
                                    className="hover:text-blue-200 text-xs transition-colors"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>

                    {/* Add Tag Input */}
                    {currentTags.length < 3 && (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                placeholder="Add tag..."
                                className="flex-1 min-w-[120px] border border-gray-300 dark:border-gray-600 px-3 py-1 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAddTag(tagInput);
                                    }
                                }}
                            />
                            <button
                                onClick={() => handleAddTag(tagInput)}
                                disabled={!tagInput.trim()}
                                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    )}
                </div>

                {/* Tag Limit Info */}
                {currentTags.length >= 3 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Maximum 3 tags reached
                    </p>
                )}
            </div>
        </div>
    );
};