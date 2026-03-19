export async function requestPermission(): Promise<boolean> {
if (!('Notification' in globalThis)) return false;
const p = await Notification.requestPermission();
return p === 'granted';
}

export function sendNotification(title: string, body: string): void {
if (Notification.permission !== 'granted') return;
new Notification(title, { body, icon: '/icon.png' });
}

// Check alarms every 30 seconds
type Medicine = {
id: string;
name: string;
dosage: string;
times: string[];
};

export function startAlarmChecker(
getMedicines: () => Promise<Medicine[]>,
getTakenToday: () => Record<string, string[]>
): void {
const check = async () => {
    const meds    = await getMedicines();
    const taken   = getTakenToday();
    const nowTime = new Date().toTimeString().slice(0, 5);

    for (const med of meds) {
    for (const t of med.times) {
        const alreadyTaken = taken[med.id]?.includes(t);
        if (t === nowTime && !alreadyTaken) {
        sendNotification(
            `Time for ${med.name}`,
            `Take your ${med.dosage} dose now.`
        );
        playAlarmBeep();
        }
    }
    }
};

check();
setInterval(check, 30_000);
}

function playAlarmBeep(): void {
const ctx = new AudioContext();
[0, 200, 400].forEach(delay => {
    setTimeout(() => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(); osc.stop(ctx.currentTime + 0.3);
    }, delay);
});
}