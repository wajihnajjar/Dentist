/**
 * Normalizes dentist slot API responses to a sorted unique list of "HH:mm" strings.
 */
export const normalizeSlotsResponse = (payload) => {
  const source = Array.isArray(payload)
    ? payload
    : payload?.slots || payload?.available_slots || payload?.data || [];

  if (!Array.isArray(source)) return [];

  const normalized = source
    .map((slot) => {
      if (typeof slot === 'string') return slot.substring(0, 5);
      if (slot?.start_time) return String(slot.start_time).substring(0, 5);
      if (slot?.slot) return String(slot.slot).substring(0, 5);
      if (slot?.time) return String(slot.time).substring(0, 5);
      return null;
    })
    .filter(Boolean);

  return Array.from(new Set(normalized)).sort();
};

const addDaysIso = (isoDate, days) => {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const nowHHmm = (d = new Date()) => {
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

/**
 * Finds the first day in the next `maxDays` with at least one available slot.
 * @param {(id: string, date: string) => Promise<any>} getSlots - e.g. api.getSlots
 * @returns {Promise<{ date: string, time: string } | null>}
 */
export const findNextAvailableSlot = async (getSlots, dentistId, maxDays = 14) => {
  const start = new Date();
  const startIso = start.toISOString().split('T')[0];
  const minTimeToday = nowHHmm(start);

  for (let i = 0; i < maxDays; i += 1) {
    const dateIso = i === 0 ? startIso : addDaysIso(startIso, i);
    try {
      const payload = await getSlots(dentistId, dateIso);
      const slots = normalizeSlotsResponse(payload);
      const futureSlots =
        dateIso === startIso ? slots.filter((t) => t >= minTimeToday) : slots;
      if (futureSlots.length > 0) {
        return { date: dateIso, time: futureSlots[0] };
      }
    } catch {
      /* skip day */
    }
  }
  return null;
};

/**
 * Finds the first slot on a specific day at/after `minTime` ("HH:mm").
 * @returns {Promise<string|null>} time "HH:mm" or null
 */
export const findFirstSlotOnDate = async (getSlots, dentistId, isoDate, minTime = '00:00') => {
  try {
    const payload = await getSlots(dentistId, isoDate);
    const slots = normalizeSlotsResponse(payload);
    const filtered = slots.filter((t) => t >= (minTime || '00:00'));
    return filtered.length > 0 ? filtered[0] : null;
  } catch {
    return null;
  }
};
