import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
  .$extends(withAccelerate())

// A `main` function so that we can use async/await
async function main() {
  console.log('🌱 Starting database seed...')
  
  // Clear existing data first
  console.log('🧹 Cleaning existing data...')
  await prisma.cheatsheetEntry.deleteMany()
  await prisma.cheatsheetPage.deleteMany()
  await prisma.user.deleteMany()
  
  console.log('👤 Creating users with cheatsheet pages...')
  
  // Generate unique emails with timestamps
  const adminEmail = `admin${Date.now()}@cheatsheet.com`
  const userEmail = `user${Date.now()}@cheatsheet.com`
  const aliceEmail = `alice${Date.now()}@cheatsheet.com`
  const bobEmail = `bob${Date.now()}@cheatsheet.com`

  // Create admin user with JavaScript and SQL cheatsheets
  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      name: 'Admin User',
      password: await bcrypt.hash('admin123', 10),
      isAdmin: true,
      cheatsheetPages: {
        create: [
          {
            title: 'JavaScript Essentials',
            description: 'Core JavaScript concepts and syntax',
            topic: 'Programming',
            color: '#f7df1e',
            order: 1,
            entries: {
              create: [
                {
                  title: 'Variable Declaration',
                  content: 'let name = "John";\nconst age = 25;\nvar oldStyle = "deprecated";',
                  type: 'CODE_SNIPPET',
                  language: 'javascript',
                  order: 1,
                  isCodeSnippet: true,
                  tags: ['variables', 'syntax'],
                },
                {
                  title: 'Arrow Functions',
                  content: 'const add = (a, b) => a + b;\nconst multiply = (x, y) => {\n  return x * y;\n};',
                  type: 'CODE_SNIPPET',
                  language: 'javascript',
                  order: 2,
                  isCodeSnippet: true,
                  tags: ['functions', 'es6'],
                },
                {
                  title: 'Hoisting',
                  content: 'A JavaScript mechanism where variables and function declarations are moved to the top of their containing scope during compilation.',
                  type: 'TERMINOLOGY',
                  order: 3,
                  tags: ['concepts', 'scope'],
                },
                {
                  title: 'Array Methods',
                  content: 'map(), filter(), reduce(), forEach(), find(), some(), every()',
                  type: 'REFERENCE',
                  order: 4,
                  tags: ['arrays', 'methods'],
                },
                {
                  title: 'Destructuring Assignment',
                  content: 'const {name, age} = person;\nconst [first, second] = array;',
                  type: 'CODE_SNIPPET',
                  language: 'javascript',
                  order: 5,
                  isCodeSnippet: true,
                  tags: ['destructuring', 'es6'],
                },
              ],
            },
          },
          {
            title: 'SQL Commands',
            description: 'Essential SQL queries and database operations',
            topic: 'Database',
            color: '#336791',
            order: 5,
            entries: {
              create: [
                {
                  title: 'Basic SELECT',
                  content: 'SELECT column1, column2 FROM table_name WHERE condition ORDER BY column1;',
                  type: 'CODE_SNIPPET',
                  language: 'sql',
                  order: 1,
                  isCodeSnippet: true,
                  tags: ['query', 'select'],
                },
                {
                  title: 'JOIN Types',
                  content: 'INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN',
                  type: 'REFERENCE',
                  order: 2,
                  tags: ['joins', 'relationships'],
                },
                {
                  title: 'Aggregate Functions',
                  content: 'COUNT(), SUM(), AVG(), MIN(), MAX(), GROUP BY, HAVING',
                  type: 'REFERENCE',
                  order: 3,
                  tags: ['functions', 'aggregation'],
                },
                {
                  title: 'ACID Properties',
                  content: 'Atomicity, Consistency, Isolation, Durability - fundamental properties of database transactions',
                  type: 'TERMINOLOGY',
                  order: 4,
                  tags: ['database', 'transactions'],
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      cheatsheetPages: {
        include: {
          entries: true,
        },
      },
    },
  })

  // Create Alice with Python cheatsheet
  const aliceUser = await prisma.user.create({
    data: {
      email: aliceEmail,
      name: 'Alice Developer',
      password: await bcrypt.hash('alice123', 10),
      isAdmin: false,
      cheatsheetPages: {
        create: {
          title: 'Python Quick Reference',
          description: 'Essential Python syntax and concepts',
          topic: 'Programming',
          color: '#3776ab',
          order: 2,
          entries: {
            create: [
              {
                title: 'List Comprehension',
                content: 'squares = [x**2 for x in range(10)]\neven_squares = [x**2 for x in range(10) if x % 2 == 0]',
                type: 'CODE_SNIPPET',
                language: 'python',
                order: 1,
                isCodeSnippet: true,
                tags: ['lists', 'comprehension'],
              },
              {
                title: 'Dictionary Methods',
                content: 'get(), keys(), values(), items(), pop(), update(), setdefault()',
                type: 'REFERENCE',
                order: 2,
                tags: ['dictionary', 'methods'],
              },
              {
                title: 'Lambda Functions',
                content: 'lambda x: x * 2\nsorted(students, key=lambda s: s.grade)',
                type: 'CODE_SNIPPET',
                language: 'python',
                order: 3,
                isCodeSnippet: true,
                tags: ['functions', 'lambda'],
              },
              {
                title: 'PEP 8',
                content: 'Python Enhancement Proposal 8 - Style Guide for Python Code. Defines coding conventions for Python.',
                type: 'TERMINOLOGY',
                order: 4,
                tags: ['style', 'conventions'],
              },
            ],
          },
        },
      },
    },
    include: {
      cheatsheetPages: {
        include: {
          entries: true,
        },
      },
    },
  })

  // Create regular user with Math cheatsheet
  const regularUser = await prisma.user.create({
    data: {
      email: userEmail,
      name: 'Regular User',
      password: await bcrypt.hash('user123', 10),
      isAdmin: false,
      cheatsheetPages: {
        create: {
          title: 'Mathematics Formulas',
          description: 'Essential mathematical formulas and concepts',
          topic: 'Mathematics',
          color: '#ff6b35',
          order: 3,
          entries: {
            create: [
              {
                title: 'Quadratic Formula',
                content: 'x = (-b ± √(b² - 4ac)) / 2a',
                type: 'FORMULA',
                order: 1,
                tags: ['algebra', 'equations'],
              },
              {
                title: 'Pythagorean Theorem',
                content: 'a² + b² = c²',
                type: 'FORMULA',
                order: 2,
                tags: ['geometry', 'triangles'],
              },
              {
                title: 'Area of Circle',
                content: 'A = πr²',
                type: 'FORMULA',
                order: 3,
                tags: ['geometry', 'area'],
              },
              {
                title: 'Derivative',
                content: 'The rate of change of a function with respect to its variable. d/dx[f(x)]',
                type: 'TERMINOLOGY',
                order: 4,
                tags: ['calculus', 'derivatives'],
              },
              {
                title: 'Integration by Parts',
                content: '∫u dv = uv - ∫v du',
                type: 'FORMULA',
                order: 5,
                tags: ['calculus', 'integration'],
              },
            ],
          },
        },
      },
    },
    include: {
      cheatsheetPages: {
        include: {
          entries: true,
        },
      },
    },
  })

  // Create Bob with CSS cheatsheet
  const bobUser = await prisma.user.create({
    data: {
      email: bobEmail,
      name: 'Bob Designer',
      password: await bcrypt.hash('bob123', 10),
      isAdmin: false,
      cheatsheetPages: {
        create: {
          title: 'CSS Layout Guide',
          description: 'Modern CSS layout techniques and properties',
          topic: 'Web Development',
          color: '#1572b6',
          order: 4,
          entries: {
            create: [
              {
                title: 'Flexbox Container',
                content: '.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 1rem;\n}',
                type: 'CODE_SNIPPET',
                language: 'css',
                order: 1,
                isCodeSnippet: true,
                tags: ['layout', 'flexbox'],
              },
              {
                title: 'Grid Layout',
                content: '.grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 1rem;\n}',
                type: 'CODE_SNIPPET',
                language: 'css',
                order: 2,
                isCodeSnippet: true,
                tags: ['layout', 'grid'],
              },
              {
                title: 'Box Model',
                content: 'Content → Padding → Border → Margin (from inside out)',
                type: 'TERMINOLOGY',
                order: 3,
                tags: ['layout', 'box-model'],
              },
              {
                title: 'Media Queries',
                content: '@media (max-width: 768px) {\n  .container { width: 100%; }\n}',
                type: 'CODE_SNIPPET',
                language: 'css',
                order: 4,
                isCodeSnippet: true,
                tags: ['responsive', 'media-queries'],
              },
            ],
          },
        },
      },
    },
    include: {
      cheatsheetPages: {
        include: {
          entries: true,
        },
      },
    },
  })

  console.log(`Created users: ${adminUser.name} (${adminUser.cheatsheetPages.length} pages), ${aliceUser.name} (${aliceUser.cheatsheetPages.length} page), ${regularUser.name} (${regularUser.cheatsheetPages.length} page), and ${bobUser.name} (${bobUser.cheatsheetPages.length} page)`)

  // Retrieve all published cheatsheet pages
  const allPages = await prisma.cheatsheetPage.findMany({
    where: { isPublic: true },
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          entries: true,
        },
      },
    },
  })
  console.log(`Retrieved all public cheatsheet pages: ${allPages.length} pages found`)
  allPages.forEach(page => {
    console.log(`  - ${page.title} by ${page.author.name} (${page._count.entries} entries)`)
  })

  // Create a new entry for Alice's Python page (using connect)
  const newPythonEntry = await prisma.cheatsheetEntry.create({
    data: {
      title: 'F-Strings',
      content: 'name = "Alice"\nage = 30\nprint(f"Hello, {name}! You are {age} years old.")',
      type: 'CODE_SNIPPET',
      language: 'python',
      order: 5,
      isCodeSnippet: true,
      tags: ['strings', 'formatting'],
      page: {
        connect: {
          id: aliceUser.cheatsheetPages[0].id,
        },
      },
    },
  })
  console.log(`Created a new entry: ${JSON.stringify(newPythonEntry, null, 2)}`)

  // Update the new entry to add more tags
  const updatedEntry = await prisma.cheatsheetEntry.update({
    where: {
      id: newPythonEntry.id,
    },
    data: {
      tags: ['strings', 'formatting', 'python3'],
    },
  })
  console.log(`Updated the newly created entry with more tags: ${JSON.stringify(updatedEntry.tags)}`)

  // Retrieve all entries by Alice
  const entriesByAlice = await prisma.cheatsheetEntry.findMany({
    where: {
      page: {
        author: {
          email: aliceEmail,
        },
      },
    },
    include: {
      page: {
        select: {
          title: true,
        },
      },
    },
  })
  console.log(`Retrieved all entries from Alice: ${entriesByAlice.length} entries found`)
  entriesByAlice.forEach(entry => {
    console.log(`  - ${entry.title} (${entry.page.title})`)
  })

  // Get comprehensive stats
  const stats = {
    totalUsers: await prisma.user.count(),
    totalPages: await prisma.cheatsheetPage.count(),
    totalEntries: await prisma.cheatsheetEntry.count(),
    adminUsers: await prisma.user.count({ where: { isAdmin: true } }),
    publicPages: await prisma.cheatsheetPage.count({ where: { isPublic: true } }),
  }

  console.log('')
  console.log('✅ Database seeded successfully!')
  console.log(`📊 Final stats: ${stats.totalUsers} users, ${stats.totalPages} pages, ${stats.totalEntries} entries`)
  console.log(`👑 Admin users: ${stats.adminUsers}, 🌍 Public pages: ${stats.publicPages}`)
  console.log('')
  console.log('👤 User credentials:')
  console.log(`Admin: ${adminEmail} / admin123`)
  console.log(`User: ${userEmail} / user123`)
  console.log(`Alice: ${aliceEmail} / alice123`)
  console.log(`Bob: ${bobEmail} / bob123`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
