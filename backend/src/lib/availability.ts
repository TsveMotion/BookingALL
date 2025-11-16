import prisma from './prisma';

interface TimeSlot {
  time: string;
  available: boolean;
  staffId?: string;
  staffName?: string;
}

interface AvailabilityOptions {
  businessId: string;
  serviceId: string;
  date: Date;
  staffId?: string;
}

/**
 * Calculate available time slots for a service on a specific date
 * Uses real business hours, staff availability, existing bookings, and service duration
 */
export async function calculateAvailability(
  options: AvailabilityOptions
): Promise<TimeSlot[]> {
  const { businessId, serviceId, date, staffId } = options;

  try {
    // Get service details
    const service: any = await prisma.service.findUnique({
      where: { id: serviceId, businessId },
    });

    if (!service) {
      throw new Error('Service not found');
    }

    // Get business settings
    const business: any = await prisma.business.findUnique({
      where: { id: businessId },
    });

    // Default business hours: 9 AM - 6 PM
    const businessStartHour = 9;
    const businessEndHour = 18;

    // Get staff members qualified for this service
    let qualifiedStaff;
    if (staffId) {
      // Specific staff member requested
      qualifiedStaff = await prisma.staff.findMany({
        where: {
          id: staffId,
          businessId,
          active: true,
        },
        select: {
          id: true,
          name: true,
          availability: true,
        } as any,
      });
    } else {
      // Get all staff qualified for this service
      qualifiedStaff = await prisma.staff.findMany({
        where: {
          businessId,
          active: true,
          id: service.staffIds && service.staffIds.length > 0 
            ? { in: service.staffIds }
            : undefined,
        },
        select: {
          id: true,
          name: true,
          availability: true,
        } as any,
      });
    }

    if (qualifiedStaff.length === 0) {
      console.warn('No qualified staff found for service:', serviceId);
      return [];
    }

    // Get existing bookings for this day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await prisma.booking.findMany({
      where: {
        businessId,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        staffId: true,
      },
    });

    // Generate time slots
    const slots: TimeSlot[] = [];
    const slotInterval = 30; // 30-minute intervals
    const serviceDuration = service.duration || 60;

    for (let hour = businessStartHour; hour < businessEndHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotInterval) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);
        
        const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000);

        // Don't show past time slots
        const now = new Date();
        if (slotStart <= now) {
          continue;
        }

        // Check if slot extends beyond business hours
        if (slotEnd.getHours() > businessEndHour || 
           (slotEnd.getHours() === businessEndHour && slotEnd.getMinutes() > 0)) {
          continue;
        }

        // Check if any staff member is available for this slot
        let availableStaff = null;

        for (const staff of qualifiedStaff) {
          // Check if this staff member has a conflicting booking
          const hasConflict = existingBookings.some(booking => {
            if (booking.staffId !== staff.id) return false;
            
            return (
              (slotStart >= booking.startTime && slotStart < booking.endTime) ||
              (slotEnd > booking.startTime && slotEnd <= booking.endTime) ||
              (slotStart <= booking.startTime && slotEnd >= booking.endTime)
            );
          });

          if (!hasConflict) {
            availableStaff = staff;
            break; // Found an available staff member
          }
        }

        slots.push({
          time: slotStart.toISOString(),
          available: availableStaff !== null,
          staffId: availableStaff?.id,
          staffName: availableStaff?.name,
        });
      }
    }

    return slots;
  } catch (error) {
    console.error('Error calculating availability:', error);
    throw error;
  }
}

/**
 * Get available dates for a service (next 30 days)
 */
export async function getAvailableDates(
  businessId: string,
  serviceId: string
): Promise<string[]> {
  const availableDates: string[] = [];
  const today = new Date();
  
  // Check next 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);

    const slots = await calculateAvailability({
      businessId,
      serviceId,
      date,
    });

    // If there's at least one available slot, mark this date as available
    if (slots.some(slot => slot.available)) {
      availableDates.push(date.toISOString().split('T')[0]);
    }
  }

  return availableDates;
}
