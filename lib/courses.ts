export type CourseKey = "general" | "grammar";

export type Course = {
  key: CourseKey;
  price: number;
  oldPrice: number;
  lessons: number;
  weeks: number;
  level: string;
  hot: boolean;
  thumbnail: string;
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
    thumbnail: "/assets/img/Courses/GeneralEN.webp",
  },
  {
    key: "grammar",
    price: 1250000,
    oldPrice: 1600000,
    lessons: 18,
    weeks: 8,
    level: "A1–B1",
    hot: false,
    thumbnail: "/assets/img/Courses/GrammarEN.webp",
  },
];

export function getCourse(key: string): Course | undefined {
  return courses.find((course) => course.key === key);
}

export function courseDiscount(course: Course): number {
  if (course.oldPrice <= 0) return 0;
  return Math.round(((course.oldPrice - course.price) / course.oldPrice) * 100);
}

export const purchasedCourses: readonly { key: CourseKey; progress: number }[] = [];

export function getPurchasedCourses(): { course: Course; progress: number }[] {
  return purchasedCourses
    .map(({ key, progress }) => {
      const course = getCourse(key);
      return course ? { course, progress } : null;
    })
    .filter(
      (entry): entry is { course: Course; progress: number } => entry !== null,
    );
}
