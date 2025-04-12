import { addMinutes, format, parse } from "date-fns";

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  serviceId?: string;
}

export interface Availability {
  date: string;
  slots: TimeSlot[];
  services: Service[];
}

export interface Service {
  id: string;
  name: string;
  duration: string;
  price: string;
}

export class AvailabilityService {
  private static instance: AvailabilityService;
  private subscribers: Map<string, (date: string) => void> = new Map();

  private constructor() {}

  public static getInstance(): AvailabilityService {
    if (!AvailabilityService.instance) {
      AvailabilityService.instance = new AvailabilityService();
    }
    return AvailabilityService.instance;
  }

  public subscribe(callback: (date: string) => void): string {
    const subscriberId = Math.random().toString(36).substring(7);
    this.subscribers.set(subscriberId, callback);
    return subscriberId;
  }

  public unsubscribe(subscriberId: string): void {
    this.subscribers.delete(subscriberId);
  }

  public notifySubscribers(date: string): void {
    this.subscribers.forEach(callback => callback(date));
  }

  public async getAvailability(
    providerId: string,
    date: string
  ): Promise<TimeSlot[]> {
    try {
      const response = await fetch(
        `/api/availability?providerId=${providerId}&date=${date}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch availability");
      }

      const availability = await response.json();
      this.notifySubscribers(date);
      return availability.slots;
    } catch (error) {
      console.error("Error fetching availability:", error);
      throw error;
    }
  }

  public async updateAvailability(
    providerId: string,
    date: string,
    timeSlot: TimeSlot
  ): Promise<void> {
    try {
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          providerId,
          date,
          time: timeSlot.time,
          serviceId: timeSlot.serviceId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update availability");
      }

      this.notifySubscribers(date);
    } catch (error) {
      console.error("Error updating availability:", error);
      throw error;
    }
  }

  public async checkSlotAvailability(
    providerId: string,
    date: string,
    time: string,
    service: Service
  ): Promise<boolean> {
    try {
      const availability = await this.getAvailability(providerId, date);
      const slot = availability.find((s) => s.time === time);

      if (!slot || !slot.available) return false;

      // Check if the slot duration fits within the service duration
      const slotTime = parse(time, "HH:mm", new Date(date));
      const serviceDuration = parseInt(service.duration);
      const endTime = addMinutes(slotTime, serviceDuration);

      // Check if any slots in the service duration are unavailable
      let currentTime = slotTime;
      while (currentTime < endTime) {
        const currentSlot = availability.find(
          (s) => s.time === format(currentTime, "HH:mm")
        );
        if (!currentSlot || !currentSlot.available) return false;
        currentTime = addMinutes(currentTime, 30);
      }

      return true;
    } catch (error) {
      console.error("Error checking slot availability:", error);
      return false;
    }
  }

  public async bookSlot(
    providerId: string,
    date: string,
    time: string,
    service: Service
  ): Promise<boolean> {
    try {
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          providerId,
          date,
          time,
          serviceId: service.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to book slot");
      }

      this.notifySubscribers(date);
      return true;
    } catch (error) {
      console.error("Error booking slot:", error);
      return false;
    }
  }

  public async cancelBooking(
    providerId: string,
    date: string,
    time: string
  ): Promise<boolean> {
    try {
      const response = await fetch("/api/availability/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          providerId,
          date,
          time,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel booking");
      }

      this.notifySubscribers(date);
      return true;
    } catch (error) {
      console.error("Error canceling booking:", error);
      return false;
    }
  }
} 