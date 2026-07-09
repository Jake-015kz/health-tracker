export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;

  if (Notification.permission === "granted") return true;

  const result = await Notification.requestPermission();
  return result === "granted";
}

export function sendMedicationReminder(medName: string, dosage: string, time: string) {
  if (Notification.permission !== "granted") return;

  const timeLabels: Record<string, string> = {
    morning: "утром",
    afternoon: "днём",
    evening: "вечером",
  };

  new Notification("Время принять лекарство", {
    body: `${medName} ${dosage} — ${timeLabels[time] || time}`,
    icon: "/icon.svg",
    badge: "/icon.svg",
    tag: `med-${medName}-${time}`,
    renotify: true,
  } as NotificationOptions);
}

export function scheduleMedicationReminders(
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string[];
    isConditional?: boolean;
  }>,
) {
  if (Notification.permission !== "granted") return;

  const now = new Date();
  const currentHour = now.getHours();

  const timeToHour: Record<string, number> = {
    morning: 8,
    afternoon: 13,
    evening: 20,
  };

  medications.forEach((med) => {
    if (med.isConditional) return;

    med.frequency.forEach((time) => {
      const targetHour = timeToHour[time];
      if (!targetHour) return;

      const diffMs = (targetHour - currentHour) * 60 * 60 * 1000;
      if (diffMs > 0 && diffMs < 12 * 60 * 60 * 1000) {
        setTimeout(() => {
          sendMedicationReminder(med.name, med.dosage, time);
        }, diffMs);
      }
    });
  });
}
