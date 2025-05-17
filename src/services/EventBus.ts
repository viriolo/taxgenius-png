
/**
 * Event Bus for Wantok.ai
 * Simple event system for emitting and subscribing to events
 */

type EventCallback = (data: any) => void;

export class EventBus {
  private static instance: EventBus;
  private listeners: Record<string, EventCallback[]> = {};
  
  private constructor() {}
  
  /**
   * Get the singleton instance of EventBus
   */
  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }
  
  /**
   * Subscribe to an event
   */
  public on(event: string, callback: EventCallback): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    
    this.listeners[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }
  
  /**
   * Emit an event
   */
  public emit(event: string, data?: any): void {
    if (!this.listeners[event]) {
      return;
    }
    
    for (const callback of this.listeners[event]) {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    }
  }
  
  /**
   * Remove all listeners for an event
   */
  public off(event: string): void {
    delete this.listeners[event];
  }
  
  /**
   * Clear all event listeners
   */
  public clear(): void {
    this.listeners = {};
  }
}
