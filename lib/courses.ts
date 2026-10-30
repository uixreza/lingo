export type CourseKey = "general" | "ielts" | "business" | "german";

export type Course = {
  key: CourseKey;
  price: number;
  oldPrice: number;
  lessons: number;
  weeks: number;
  level: string;
  hot: boolean;
};

export const courses: readonly Course[] = [
  {
    key: "general",
    price: 1490000,
    oldPrice: 1900000,
    lessons: 24,
    weeks: 8,
    level: "A1–B1",
    hot: true,
  },
  {
    key: "ielts",
    price: 2950000,
    oldPrice: 3600000,
    lessons: 36,
    weeks: 10,
    level: "B1–C1",
    hot: false,
  },
  {
    key: "business",
    price: 1850000,
    oldPrice: 0,
    lessons: 20,
    weeks: 6,
    level: "B1–B2",
    hot: false,
  },
  {
    key: "german",
    price: 1250000,
    oldPrice: 1600000,
    lessons: 18,
    weeks: 8,
    level: "A1–A2",
    hot: false,
  },
];

export function getCourse(key: string): Course | undefined {
  return courses.find((course) => course.key === key);
}

export function courseDiscount(course: Course): number {
  if (course.oldPrice <= 0) return 0;
  return Math.round(((course.oldPrice - course.price) / course.oldPrice) * 100);
}
