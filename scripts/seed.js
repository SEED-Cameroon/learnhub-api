/**
 * Seeds demo tutors, a demo student and published courses so a fresh
 * database shows real content. Safe to re-run: existing accounts (matched
 * by email) and tutors who already have courses are skipped; nothing is
 * deleted.
 *
 *   npm run seed                 # uses MONGO_URI from .env
 *   npm run seed -- --production # required when NODE_ENV=production
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Course from '../src/models/Course.js';

if (process.env.NODE_ENV === 'production' && !process.argv.includes('--production')) {
  console.error('Refusing to seed a production database. Re-run with --production if you mean it.');
  process.exit(1);
}

const DEMO_PASSWORD = process.env.SEED_PASSWORD || 'learnhub-demo';

const TUTORS = [
  {
    name: 'Dr. Emmanuel Foning',
    email: 'foning@demo.learnhub.cm',
    headline: 'Advanced Mathematics',
    city: 'Yaoundé',
    subjectTags: ['Mathematics', 'Exam Prep'],
    bio: 'Lecturer at the University of Yaoundé I. I teach calculus and linear algebra with worked examples and past GCE and Baccalauréat papers.',
    courses: [
      ['Calculus for GCE A Level: limits to integration', 'Mathematics', 0, 'Every calculus topic on the A Level syllabus, with past-paper questions after each lesson.'],
      ['Linear algebra for first-year university', 'Mathematics', 5000, 'Vectors, matrices and systems of equations, following the first-year programme.'],
      ['Baccalauréat C maths: probability and statistics', 'Exam Prep', 0, 'Every probability and statistics exercise type from the last ten Bac C papers, solved step by step.'],
    ],
  },
  {
    name: 'Mbah Junior',
    email: 'mbah@demo.learnhub.cm',
    headline: 'Web Development',
    city: 'Buea',
    subjectTags: ['Computer Science'],
    bio: 'Full-stack developer at a Silicon Mountain startup. From your first HTML page to a deployed React app.',
    courses: [
      ['Build your first website with HTML and CSS', 'Computer Science', 0, 'No experience needed. Finish with a portfolio site you can share with employers.'],
      ['React from zero: build a market price tracker', 'Computer Science', 7500, 'Components, state and data fetching, by building an app that tracks Douala market prices.'],
    ],
  },
  {
    name: 'Amina Bello',
    email: 'amina@demo.learnhub.cm',
    headline: 'Business Studies',
    city: 'Garoua',
    subjectTags: ['Business & Finance'],
    bio: 'Chartered accountant helping small-business owners understand bookkeeping, OHADA accounting and tax.',
    courses: [
      ['OHADA bookkeeping for small businesses', 'Business & Finance', 5000, 'Record sales, expenses and stock the way the OHADA system expects.'],
      ['Marketing on WhatsApp and Facebook', 'Business & Finance', 0, 'Sell more from your phone: catalogues, status updates and small-budget ads.'],
    ],
  },
  {
    name: 'Mme. Christelle Essomba',
    email: 'essomba@demo.learnhub.cm',
    headline: 'French & English Bilingualism',
    city: 'Douala',
    subjectTags: ['Languages'],
    bio: 'Language teacher preparing candidates for the bilingualism tests in public-service exams.',
    courses: [
      ['Pass the bilingualism test: spoken French', 'Languages', 0, 'Short daily lessons on the phrases and grammar that come up most in oral exams.'],
      ['Business English for interviews', 'Languages', 0, 'Answer common interview questions confidently in English.'],
    ],
  },
  {
    name: 'Ngwa Eric',
    email: 'ngwa@demo.learnhub.cm',
    headline: 'Physics & Mechanics',
    city: 'Bamenda',
    subjectTags: ['Sciences', 'Exam Prep'],
    bio: 'Physics teacher preparing students for GCE A Level, with lab demonstrations you can do at home.',
    courses: [
      ['GCE Physics practicals you can do at home', 'Sciences', 0, 'Recreate the practical exam experiments with household items.'],
    ],
  },
];

const STUDENT = { name: 'Awa Ndzi', email: 'awa@demo.learnhub.cm' };

async function upsertUser(fields, role) {
  const existing = await User.findOne({ email: fields.email });
  if (existing) return { user: existing, created: false };
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const user = await User.create({ ...fields, role, passwordHash });
  return { user, created: true };
}

async function main() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set.');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);

  let usersCreated = 0;
  let coursesCreated = 0;

  for (const { courses, ...profile } of TUTORS) {
    const { user, created } = await upsertUser(profile, 'tutor');
    usersCreated += created ? 1 : 0;

    if (await Course.exists({ tutor: user._id })) continue;
    for (const [title, category, price, description] of courses) {
      await Course.create({ tutor: user._id, title, category, price, description, status: 'published' });
      coursesCreated += 1;
    }
  }

  const { created } = await upsertUser(STUDENT, 'student');
  usersCreated += created ? 1 : 0;

  console.log(`Seed complete: ${usersCreated} accounts and ${coursesCreated} courses created.`);
  console.log(`Demo accounts use the password "${DEMO_PASSWORD}" (set SEED_PASSWORD to change it):`);
  console.log(`  student  ${STUDENT.email}`);
  console.log(`  tutor    ${TUTORS[0].email}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
