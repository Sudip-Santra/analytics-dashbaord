import { subDays, format, addDays } from "date-fns";

export interface ClickRecord {
  id: number;
  userId: number;
  featureName: string;
  timestamp: string;
  userAge: number;
  userGender: "Male" | "Female" | "Other";
}

const featureNames = [
  "date_picker",
  "filter_age",
  "filter_gender",
  "chart_bar",
  "chart_line",
];

const genders: ("Male" | "Female" | "Other")[] = ["Male", "Female", "Other"];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMockData(): ClickRecord[] {
  const records: ClickRecord[] = [];
  const startDate = subDays(new Date(), 120);
  let id = 1;

  for (let day = 0; day < 120; day++) {
    const date = addDays(startDate, day);
    const clicksToday = randomInt(8, 25);

    for (let i = 0; i < clicksToday; i++) {
      const hour = randomInt(8, 22);
      const minute = randomInt(0, 59);
      const timestamp = new Date(date);
      timestamp.setHours(hour, minute, randomInt(0, 59));

      records.push({
        id: id++,
        userId: randomInt(1, 20),
        featureName:
          featureNames[randomInt(0, featureNames.length - 1)],
        timestamp: timestamp.toISOString(),
        userAge: randomInt(14, 65),
        userGender: genders[randomInt(0, 2)],
      });
    }
  }

  return records;
}

export const mockData = generateMockData();

export function getFilteredData(
  data: ClickRecord[],
  filters: {
    dateRange: { from: Date; to: Date };
    age: string;
    gender: string;
  }
) {
  return data.filter((record) => {
    const recordDate = new Date(record.timestamp);
    const endOfTo = new Date(filters.dateRange.to);
    endOfTo.setHours(23, 59, 59, 999);

    if (recordDate < filters.dateRange.from || recordDate > endOfTo) {
      return false;
    }

    if (filters.age && filters.age !== "all") {
      if (filters.age === "<18" && record.userAge >= 18) return false;
      if (filters.age === "18-40" && (record.userAge < 18 || record.userAge > 40))
        return false;
      if (filters.age === ">40" && record.userAge <= 40) return false;
    }

    if (filters.gender && filters.gender !== "all") {
      if (record.userGender !== filters.gender) return false;
    }

    return true;
  });
}

export function aggregateByFeature(data: ClickRecord[]) {
  const map = new Map<string, number>();
  data.forEach((r) => {
    map.set(r.featureName, (map.get(r.featureName) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(([feature, clicks]) => ({ feature, clicks }))
    .sort((a, b) => b.clicks - a.clicks);
}

export function aggregateByDay(data: ClickRecord[], featureName?: string) {
  const filtered = featureName
    ? data.filter((r) => r.featureName === featureName)
    : data;

  const map = new Map<string, { label: string; clicks: number; sortKey: string }>();
  filtered.forEach((r) => {
    const d = new Date(r.timestamp);
    const sortKey = format(d, "yyyy-MM-dd");
    const label = format(d, "MMM dd");
    const existing = map.get(sortKey);
    if (existing) {
      existing.clicks += 1;
    } else {
      map.set(sortKey, { label, clicks: 1, sortKey });
    }
  });

  return Array.from(map.values())
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map(({ label, clicks }) => ({ date: label, clicks }));
}
