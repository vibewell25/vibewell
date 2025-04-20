declare module 'react-native' {
  interface NativeModulesStatic {
    AppleCalendarModule: {
      requestAccess(): Promise<boolean>;
      addEvent(
        title: string,
        startDate: Date,
        endDate: Date,
        description?: string,
        location?: string
      ): Promise<{ eventId: string }>;
      updateEvent(
        eventId: string,
        title: string,
        startDate: Date,
        endDate: Date,
        description?: string,
        location?: string
      ): Promise<boolean>;
      deleteEvent(eventId: string): Promise<boolean>;
    };
  }
} 