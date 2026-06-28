import { RoomStatus } from '../types';

/**
 * Validates if a room status transition is allowed
 */
export const canTransitionStatus = (
    currentStatus: RoomStatus,
    targetStatus: RoomStatus
): boolean => {
    // Define valid transitions
    const validTransitions: Record<RoomStatus, RoomStatus[]> = {
        [RoomStatus.Available]: [
            RoomStatus.Occupied,      // Check-in
            RoomStatus.Maintenance,   // Manual maintenance
        ],
        [RoomStatus.Occupied]: [
            RoomStatus.Cleaning,      // Check-out or request cleaning
            RoomStatus.Maintenance,   // Emergency maintenance
        ],
        [RoomStatus.Cleaning]: [
            RoomStatus.Available,     // Mark as clean
            RoomStatus.Occupied,      // Return to occupied after cleaning during stay
            RoomStatus.Maintenance,   // Found issues during cleaning
        ],
        [RoomStatus.Maintenance]: [
            RoomStatus.Available,     // Mark as clean after maintenance
            RoomStatus.Cleaning,      // Needs cleaning after maintenance
        ],
    };

    return validTransitions[currentStatus]?.includes(targetStatus) ?? false;
};

/**
 * Gets a user-friendly error message for invalid transitions
 */
export const getTransitionError = (
    currentStatus: RoomStatus,
    targetStatus: RoomStatus,
    t: (key: string) => string
): string => {
    // Check-in validations
    if (targetStatus === RoomStatus.Occupied) {
        if (currentStatus === RoomStatus.Occupied) {
            return t('validations.room.alreadyOccupied');
        }
        if (currentStatus === RoomStatus.Cleaning) {
            return t('validations.room.needsCleaning');
        }
        if (currentStatus === RoomStatus.Maintenance) {
            return t('validations.room.inMaintenance');
        }
    }

    // Check-out validations
    if (targetStatus === RoomStatus.Cleaning && currentStatus !== RoomStatus.Occupied) {
        return t('validations.room.notOccupied');
    }

    // Mark as clean validations
    if (targetStatus === RoomStatus.Available) {
        if (currentStatus === RoomStatus.Available) {
            return t('validations.room.alreadyClean');
        }
        if (currentStatus === RoomStatus.Occupied) {
            return t('validations.room.stillOccupied');
        }
    }

    return t('validations.room.invalidTransition');
};

/**
 * Checks if check-in is allowed for a room
 */
export const canCheckIn = (roomStatus: RoomStatus): boolean => {
    return roomStatus === RoomStatus.Available;
};

/**
 * Checks if check-out is allowed for a room
 */
export const canCheckOut = (roomStatus: RoomStatus): boolean => {
    return roomStatus === RoomStatus.Occupied;
};

/**
 * Checks if mark as clean is allowed
 */
export const canMarkAsClean = (roomStatus: RoomStatus): boolean => {
    return roomStatus === RoomStatus.Cleaning || roomStatus === RoomStatus.Maintenance;
};

/**
 * Checks if request cleaning is allowed
 */
export const canRequestCleaning = (roomStatus: RoomStatus): boolean => {
    return roomStatus === RoomStatus.Occupied;
};

/**
 * Gets tooltip text explaining why an action is disabled
 */
export const getDisabledReasonTooltip = (
    action: 'checkin' | 'checkout' | 'markclean' | 'requestcleaning',
    currentStatus: RoomStatus,
    t: (key: string) => string
): string => {
    switch (action) {
        case 'checkin':
            if (currentStatus === RoomStatus.Occupied) {
                return t('validations.tooltip.alreadyOccupied');
            }
            if (currentStatus === RoomStatus.Cleaning) {
                return t('validations.tooltip.needsCleaning');
            }
            if (currentStatus === RoomStatus.Maintenance) {
                return t('validations.tooltip.inMaintenance');
            }
            break;

        case 'checkout':
            return t('validations.tooltip.notOccupied');

        case 'markclean':
            if (currentStatus === RoomStatus.Available) {
                return t('validations.tooltip.alreadyClean');
            }
            if (currentStatus === RoomStatus.Occupied) {
                return t('validations.tooltip.stillOccupied');
            }
            break;

        case 'requestcleaning':
            return t('validations.tooltip.notOccupied');
    }

    return t('validations.tooltip.notAvailable');
};

/**
 * Gets the required status for an action
 */
export const getRequiredStatus = (action: string): string => {
    switch (action) {
        case 'checkin':
            return 'Available';
        case 'checkout':
            return 'Occupied';
        case 'markclean':
            return 'Cleaning or Maintenance';
        case 'requestcleaning':
            return 'Occupied';
        default:
            return '';
    }
};
