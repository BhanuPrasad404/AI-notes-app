// lib/logger/index.ts
export interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  timestamp: string;
  component?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

class FrontendLogger {
  private shouldLogToConsole(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  private shouldSendToBackend(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  private async sendToBackend(entry: LogEntry): Promise<void> {
    try {
      // Batch this later - for now simple POST
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
        // Don't block the main thread
        keepalive: true
      });
    } catch (error) {
      // Fallback to console if backend logging fails
      console.error('Failed to send log to backend:', error);
    }
  }

  private log(level: LogEntry['level'], message: string, metadata?: any): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata
    };

    // Development: Rich console logging
    if (this.shouldLogToConsole()) {
      const styles = {
        error: 'color: red; font-weight: bold;',
        warn: 'color: orange; font-weight: bold;', 
        info: 'color: blue; font-weight: bold;',
        debug: 'color: gray;'
      };
      
      console.group(`🪵 [${level.toUpperCase()}] ${message}`);
      console.log('%cTimestamp:', 'color: gray;', entry.timestamp);
      if (metadata) console.log('Metadata:', metadata);
      console.groupEnd();
    }

    // Production: Send to backend
    if (this.shouldSendToBackend()) {
      this.sendToBackend(entry);
    }
  }

  // Public API - matches Winston style
  public error(message: string, metadata?: any, p0?: { taskId: string; targetEmail: string; permission: "VIEW" | "EDIT"; }): void {
    this.log('error', message, metadata);
  }

  public warn(message: string, metadata?: any): void {
    this.log('warn', message, metadata);
  }

  public info(message: string, metadata?: any): void {
    this.log('info', message, metadata);
  }

  public debug(message: string, metadata?: any): void {
    this.log('debug', message, metadata);
  }
}

// Singleton instance
export const logger = new FrontendLogger();