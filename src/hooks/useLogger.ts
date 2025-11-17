
import { useRef } from 'react';
import { logger } from '@/lib/logger';

export const useLogger = (componentName: string) => {
    const componentRef = useRef(componentName);

    return {
        error: (message: string, metadata?: any) =>
            logger.error(message, { ...metadata, component: componentRef.current }),
        warn: (message: string, metadata?: any) =>
            logger.warn(message, { ...metadata, component: componentRef.current }),
        info: (message: string, metadata?: any) =>
            logger.info(message, { ...metadata, component: componentRef.current }),
        debug: (message: string, metadata?: any) =>
            logger.debug(message, { ...metadata, component: componentRef.current })
    };
};