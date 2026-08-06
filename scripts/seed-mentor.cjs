require("dotenv").config();
const { PrismaClient } = require("../app/generated/prisma/client.js");
const { PrismaPg } = require("@prisma/adapter-pg");
const pg = require("pg");

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const p = new PrismaClient({ adapter });

p.mentor
  .upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "رضا کمالی",
      title: "مدرس زبان انگلیسی",
      photoUrl: "/me.png",
      certifications: ["TTC"],
      experience: "۳ سال سابقه",
      education: "دانشگاه بجنورد",
    },
  })
  .then((m) => {
    console.log("seeded mentor id=" + m.id);
    return p.$disconnect();
  })
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
