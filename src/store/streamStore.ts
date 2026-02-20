type Listener = (content: string) => void;

class StreamStore {
  private content = '';
  private listeners: Set<Listener> = new Set();

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    listener(this.content);
    return () => this.listeners.delete(listener);
  };

  getContent = () => this.content;

  setContent = (content: string) => {
    this.content = content;
    this.notify();
  };
  
  append = (token: string) => {
    this.content += token;
    this.notify();
  };

  private notify() {
    for (const listener of this.listeners) {
      listener(this.content);
    }
  }
}

export const streamStore = new StreamStore();
