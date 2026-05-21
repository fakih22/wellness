// Date helpers
export function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getStartOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfWeek(date: Date = new Date()): Date {
  const d = getStartOfWeek(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getStartOfMonth(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfMonth(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getDaysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Calculate streak
export function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const sortedDates = dates
    .map(d => getStartOfDay(new Date(d)).getTime())
    .sort((a, b) => b - a);

  let streak = 1;
  const today = getStartOfDay(new Date()).getTime();
  const yesterday = getStartOfDay(new Date(Date.now() - 86400000)).getTime();

  // Check if the most recent date is today or yesterday
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0;
  }

  for (let i = 0; i < sortedDates.length - 1; i++) {
    const diff = sortedDates[i] - sortedDates[i + 1];
    const daysDiff = diff / 86400000;

    if (daysDiff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// Format date
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Calculate sleep hours
export function calculateSleepHours(sleepTime: Date, wakeUpTime: Date): number {
  const diff = new Date(wakeUpTime).getTime() - new Date(sleepTime).getTime();
  return Math.round((diff / (1000 * 60 * 60)) * 10) / 10;
}

// Calculate BMI
export function calculateBMI(weight: number, height: number): number {
  // weight in kg, height in cm
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
}

// Get BMI category
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

// Calculate calories burned (simple estimation)
export function calculateCalories(type: string, duration: number, weight: number = 70): number {
  const MET: { [key: string]: number } = {
    walking: 3.5,
    running: 9.8,
    gym: 6.0,
    yoga: 2.5,
    cycling: 7.5,
    other: 4.0,
  };

  const met = MET[type] || 4.0;
  return Math.round((met * weight * duration) / 60);
}

// Generate avatar initial from name
export function generateAvatarInitial(name: string): string {
  if (!name) return 'U';
  
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

// Response helpers
export function successResponse(data: any, message: string = 'Success') {
  return Response.json({
    success: true,
    message,
    data,
  });
}

export function errorResponse(message: string, status: number = 400) {
  return Response.json(
    {
      success: false,
      message,
    },
    { status }
  );
}
