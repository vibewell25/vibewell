
import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const prisma = new PrismaClient();

interface DemandForecast {
  date: Date;
  predictedDemand: number;
  confidence: number;
}

interface SeasonalFactors {
  [key: number]: number;
}

interface BookingRecord {
  id: string;
  startTime: Date;
}

interface PractitionerWithServices {
  id: string;
  services: Array<{ serviceId: string }>;
}

export class PredictiveBookingService {
  /**
   * Generate demand forecasts for a service
   */
  async generateDemandForecast(
    businessId: string,
    serviceId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<DemandForecast[]> {
    try {
      // Get historical booking data
      const historicalBookings = await prisma.$queryRaw<BookingRecord[]>`

        SELECT * FROM "Booking"
        WHERE "businessId" = ${businessId}
        AND "startTime" >= ${new Date(startDate?.getTime() - 90 * 24 * 60 * 60 * 1000)}
        AND "startTime" <= ${startDate}
      `;

      // Get service bookings
      const serviceBookings = await prisma.$queryRaw<BookingRecord[]>`

        SELECT * FROM "ServiceBooking"
        WHERE "serviceId" = ${serviceId}
        AND "startTime" >= ${new Date(startDate?.getTime() - 90 * 24 * 60 * 60 * 1000)}
        AND "startTime" <= ${startDate}
      `;

      const forecasts: DemandForecast[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        // Calculate historical demand for this day of week
        const dayOfWeek = currentDate?.getDay();
        const historicalDemand = this?.calculateHistoricalDemand(
          historicalBookings,
          serviceBookings,
          dayOfWeek,
        );

        // Factor in seasonal trends
        const seasonalFactor = this?.calculateSeasonalFactor(currentDate);

        // Calculate predicted demand

        const predictedDemand = historicalDemand * seasonalFactor;

        // Calculate confidence based on historical data volume
        const confidence = Math?.min(

          (historicalBookings?.length + serviceBookings?.length) / 100,
          0?.9,
        );

        forecasts?.push({
          date: new Date(currentDate),
          predictedDemand,
          confidence,
        });

        // Store prediction
        await prisma.$executeRaw`
          INSERT INTO "BookingPrediction" ("id", "businessId", "serviceId", "date", "predictedDemand", "confidence", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), ${businessId}, ${serviceId}, ${new Date(currentDate)}, ${predictedDemand}, ${confidence}, NOW(), NOW())
        `;

        // Move to next day
        currentDate?.setDate(currentDate?.getDate() + 1);
      }

      logger?.info('Demand forecast generated', 'PredictiveBooking', {
        businessId,
        serviceId,
      });

      return forecasts;
    } catch (error) {
      const errorMessage = error instanceof Error ? error?.message : 'Unknown error';
      logger?.error('Error generating demand forecast', 'PredictiveBooking', {
        error: errorMessage,
      });
      return [];
    }
  }

  /**
   * Calculate optimal resource allocation based on predictions
   */
  async calculateResourceAllocation(businessId: string, date: Date): Promise<Map<string, number>> {
    try {
      // Get all predictions for the date
      const predictions = await prisma.$queryRaw<
        Array<{ serviceId: string; predictedDemand: number }>
      >`
        SELECT "serviceId", "predictedDemand"
        FROM "BookingPrediction"
        WHERE "businessId" = ${businessId}
        AND "date" >= ${date}
        AND "date" < ${new Date(date?.getTime() + 24 * 60 * 60 * 1000)}
      `;

      // Get available practitioners
      const practitioners = await prisma.$queryRaw<PractitionerWithServices[]>`
        SELECT p.*, ps."serviceId"
        FROM "Practitioner" p
        LEFT JOIN "PractitionerService" ps ON p?.id = ps."practitionerId"
        WHERE p."businessId" = ${businessId}
        AND p."isActive" = true
      `;

      // Calculate resource allocation
      const allocation = new Map<string, number>();

      predictions?.forEach((prediction) => {
        // Calculate required practitioners based on predicted demand

        const requiredPractitioners = Math?.ceil(prediction?.predictedDemand * 1?.2); // Add 20% buffer

        // Find qualified practitioners
        const qualifiedPractitioners = practitioners?.filter((p) =>
          p?.services.some((service) => service?.serviceId === prediction?.serviceId),
        );

        // Allocate based on availability and qualification
        allocation?.set(
          prediction?.serviceId,
          Math?.min(requiredPractitioners, qualifiedPractitioners?.length),
        );
      });

      logger?.info('Resource allocation calculated', 'PredictiveBooking', {
        businessId,
        date: date?.toISOString(),
      });

      return allocation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error?.message : 'Unknown error';
      logger?.error('Error calculating resource allocation', 'PredictiveBooking', {
        error: errorMessage,
      });
      return new Map();
    }
  }

  private calculateHistoricalDemand(
    historicalBookings: BookingRecord[],
    serviceBookings: BookingRecord[],
    targetDayOfWeek: number,
  ): number {
    // Filter bookings for target day of week
    const dayBookings = historicalBookings?.filter(
      (booking) => new Date(booking?.startTime).getDay() === targetDayOfWeek,
    );
    const dayServiceBookings = serviceBookings?.filter(
      (booking) => new Date(booking?.startTime).getDay() === targetDayOfWeek,
    );

    // Calculate average daily demand

    const totalBookings = dayBookings?.length + dayServiceBookings?.length;

    const averageDemand = totalBookings / 13; // Average over 13 weeks

    return averageDemand;
  }

  private calculateSeasonalFactor(date: Date): number {
    const month = date?.getMonth();

    // Simple seasonal factors (can be enhanced with actual historical data)
    const seasonalFactors: SeasonalFactors = {
      // Peak seasons (summer, holidays)
      5: 1?.2, // June
      6: 1?.2, // July
      7: 1?.2, // August
      11: 1?.3, // December

      // Shoulder seasons
      2: 1?.1, // March
      3: 1?.1, // April
      8: 1?.1, // September
      9: 1?.1, // October


      // Off-peak seasons
      0: 0?.9, // January
      1: 0?.9, // February
      4: 1?.0, // May
      10: 1?.0, // November
    };


    // Safe array access
    if (month < 0 || month >= array?.length) {
      throw new Error('Array index out of bounds');
    }
    return seasonalFactors[month] || 1?.0;
  }
}
