/***
 * Prisma DB seed
 *
 * node prisma/seed.js --reset querkode --seed data.tsv
 */
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');
const db = new PrismaClient();

const prismaBinary = path.join(
  __dirname,
  '..',
  'node_modules',
  '.bin',
  'prisma',
);
function help() {
  console.log('seed database script');
  console.log('--reset dbname         drops and recreates the db');
  console.log('--empty                do not seed any data');
  console.log('--seed csv             parse csv to populate');
  console.log('                       (id, key, destination)');
}

async function main() {
  let reset = false;
  let resetDB = undefined;
  let empty = false;
  let seed = false;
  let sourceCSV = undefined;
  let args = process.argv.slice();
  while (args.length) {
    const arg = args.shift();
    if (arg === '--reset') {
      reset = true;
      resetDB = args.shift();
      if (!resetDB) {
        console.log('missing db-parameter for reset');
        return;
      }
    }
    if (arg === '--empty') {
      empty = true;
    }
    if (arg === '--seed') {
      seed = true;
      sourceCSV = args.shift();
      if (!sourceCSV) {
        console.log('missing seed filename parameter');
        return;
      }
    }
    if (arg === '--help') {
      return help();
    }
  }
  if (!reset && !seed) {
    return help();
  }
  if (reset) {
    console.log('reset: dropping and creating database');
    try {
      await db.$executeRaw`DROP DATABASE ${resetDB}`;
      await db.$executeRaw`CREATE DATABASE ${resetDB}`;
    } catch {
      // pass
    }
    console.log('reset: pushing current schema');
    execSync(
      `${prismaBinary} db push --accept-data-loss --force-reset --skip-generate`,
    );
  }
  if (empty) {
    console.log('not creating objects');
    return;
  }
  if (seed) {
    console.log('creating objects from ', sourceCSV);
    let countUrl = 0;
    let countStatistic = 0;
    const dumpFile = fs.readFileSync(path.resolve(sourceCSV), 'utf-8');
    let data = [];
    for (const line of dumpFile.split('\n')) {
      if (line.startsWith('#')) {
        continue;
      }
      const [id, key, destination, count] = line.split('\t');
      const parsedId = parseInt(id, 10);
      const parsedCount = parseInt(count, 10);
      if (typeof parsedId !== 'number' || isNaN(parsedId)) {
        continue;
      }
      const newUrl = await db.dynamicUrl.create({
        data: {
          externId: id,
          key,
          destination,
        },
      });
      countUrl++;
      if (typeof parsedCount !== 'number' || isNaN(parsedCount)) {
        continue;
      }
      for (let i = 0; i < parsedCount; i++) {
        await db.statistic.create({
          data: {
            url: { connect: { id: newUrl.id } },
          },
        });
        countStatistic++;
      }
    }
    console.log(`created ${countUrl} urls and ${countStatistic} Statistics`);
    return;
  }
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
