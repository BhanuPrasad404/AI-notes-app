import React from 'react';

interface ProjectBadgeProps {
    project: { name: string; color: string } | null;
}

const ProjectBadge: React.FC<ProjectBadgeProps> = ({ project }) => {
    if (!project) {
        return (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs border bg-gray-500/20 text-gray-400 border-gray-500/30">
                No Project
            </span>
        );
    }

    return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs border bg-blue-500/20 text-blue-400 border-blue-500/30">
            {project.name}
        </span>
    );
};

export default ProjectBadge;