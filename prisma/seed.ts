import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🌱 Starting database seed...')
    
    // Clear existing data first
    console.log('🧹 Cleaning existing data...')
    await prisma.cheatsheetEntry.deleteMany()
    await prisma.cheatsheetPage.deleteMany()
    await prisma.user.deleteMany()
    
    console.log('👤 Creating users...')
    
    // Create users with hashed passwords using Promise.all
    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: 'admin@cheatsheet.com',
          name: 'Admin User',
          password: await bcrypt.hash('admin123', 10),
          isAdmin: true,
        },
      }),
      prisma.user.create({
        data: {
          email: 'user@cheatsheet.com',
          name: 'Regular User',
          password: await bcrypt.hash('user123', 10),
          isAdmin: false,
        },
      }),
      prisma.user.create({
        data: {
          email: 'alice@cheatsheet.com',
          name: 'Alice Developer',
          password: await bcrypt.hash('alice123', 10),
          isAdmin: false,
        },
      }),
      prisma.user.create({
        data: {
          email: 'bob@cheatsheet.com',
          name: 'Bob Designer',
          password: await bcrypt.hash('bob123', 10),
          isAdmin: false,
        },
      }),
    ])

    const userIdMapping = {
      admin: users[0].id,
      user: users[1].id,
      alice: users[2].id,
      bob: users[3].id,
    }

    console.log('📚 Creating cheatsheet pages...')

    // Create cheatsheet pages
    const pages = await Promise.all([
      prisma.cheatsheetPage.create({
        data: {
          title: 'JavaScript Essentials',
          description: 'Core JavaScript concepts and syntax',
          topic: 'Programming',
          color: '#f7df1e',
          order: 1,
          authorId: userIdMapping.admin,
        },
      }),
      prisma.cheatsheetPage.create({
        data: {
          title: 'Python Quick Reference',
          description: 'Essential Python syntax and concepts',
          topic: 'Programming',
          color: '#3776ab',
          order: 2,
          authorId: userIdMapping.alice,
        },
      }),
      prisma.cheatsheetPage.create({
        data: {
          title: 'Mathematics Formulas',
          description: 'Essential mathematical formulas and concepts',
          topic: 'Mathematics',
          color: '#ff6b35',
          order: 3,
          authorId: userIdMapping.user,
        },
      }),
      prisma.cheatsheetPage.create({
        data: {
          title: 'CSS Layout Guide',
          description: 'Modern CSS layout techniques and properties',
          topic: 'Web Development',
          color: '#1572b6',
          order: 4,
          authorId: userIdMapping.bob,
        },
      }),
      prisma.cheatsheetPage.create({
        data: {
          title: 'SQL Commands',
          description: 'Essential SQL queries and database operations',
          topic: 'Database',
          color: '#336791',
          order: 5,
          authorId: userIdMapping.admin,
        },
      }),
    ])

    const pageIdMapping = {
      javascript: pages[0].id,
      python: pages[1].id,
      math: pages[2].id,
      css: pages[3].id,
      sql: pages[4].id,
    }

    console.log('📝 Creating cheatsheet entries...')

    // Create cheatsheet entries using createMany for better performance
    await prisma.cheatsheetEntry.createMany({
      data: [
        // JavaScript entries
        {
          title: 'Variable Declaration',
          content: 'let name = "John";\nconst age = 25;\nvar oldStyle = "deprecated";',
          type: 'CODE_SNIPPET',
          language: 'javascript',
          order: 1,
          isCodeSnippet: true,
          tags: ['variables', 'syntax'],
          pageId: pageIdMapping.javascript,
        },
        {
          title: 'Arrow Functions',
          content: 'const add = (a, b) => a + b;\nconst multiply = (x, y) => {\n  return x * y;\n};',
          type: 'CODE_SNIPPET',
          language: 'javascript',
          order: 2,
          isCodeSnippet: true,
          tags: ['functions', 'es6'],
          pageId: pageIdMapping.javascript,
        },
        {
          title: 'Hoisting',
          content: 'A JavaScript mechanism where variables and function declarations are moved to the top of their containing scope during compilation.',
          type: 'TERMINOLOGY',
          order: 3,
          tags: ['concepts', 'scope'],
          pageId: pageIdMapping.javascript,
        },
        {
          title: 'Array Methods',
          content: 'map(), filter(), reduce(), forEach(), find(), some(), every()',
          type: 'REFERENCE',
          order: 4,
          tags: ['arrays', 'methods'],
          pageId: pageIdMapping.javascript,
        },
        {
          title: 'Destructuring Assignment',
          content: 'const {name, age} = person;\nconst [first, second] = array;',
          type: 'CODE_SNIPPET',
          language: 'javascript',
          order: 5,
          isCodeSnippet: true,
          tags: ['destructuring', 'es6'],
          pageId: pageIdMapping.javascript,
        },

        // Python entries
        {
          title: 'List Comprehension',
          content: 'squares = [x**2 for x in range(10)]\neven_squares = [x**2 for x in range(10) if x % 2 == 0]',
          type: 'CODE_SNIPPET',
          language: 'python',
          order: 1,
          isCodeSnippet: true,
          tags: ['lists', 'comprehension'],
          pageId: pageIdMapping.python,
        },
        {
          title: 'Dictionary Methods',
          content: 'get(), keys(), values(), items(), pop(), update(), setdefault()',
          type: 'REFERENCE',
          order: 2,
          tags: ['dictionary', 'methods'],
          pageId: pageIdMapping.python,
        },
        {
          title: 'Lambda Functions',
          content: 'lambda x: x * 2\nsorted(students, key=lambda s: s.grade)',
          type: 'CODE_SNIPPET',
          language: 'python',
          order: 3,
          isCodeSnippet: true,
          tags: ['functions', 'lambda'],
          pageId: pageIdMapping.python,
        },
        {
          title: 'PEP 8',
          content: 'Python Enhancement Proposal 8 - Style Guide for Python Code. Defines coding conventions for Python.',
          type: 'TERMINOLOGY',
          order: 4,
          tags: ['style', 'conventions'],
          pageId: pageIdMapping.python,
        },

        // Math entries
        {
          title: 'Quadratic Formula',
          content: 'x = (-b ± √(b² - 4ac)) / 2a',
          type: 'FORMULA',
          order: 1,
          tags: ['algebra', 'equations'],
          pageId: pageIdMapping.math,
        },
        {
          title: 'Pythagorean Theorem',
          content: 'a² + b² = c²',
          type: 'FORMULA',
          order: 2,
          tags: ['geometry', 'triangles'],
          pageId: pageIdMapping.math,
        },
        {
          title: 'Area of Circle',
          content: 'A = πr²',
          type: 'FORMULA',
          order: 3,
          tags: ['geometry', 'area'],
          pageId: pageIdMapping.math,
        },
        {
          title: 'Derivative',
          content: 'The rate of change of a function with respect to its variable. d/dx[f(x)]',
          type: 'TERMINOLOGY',
          order: 4,
          tags: ['calculus', 'derivatives'],
          pageId: pageIdMapping.math,
        },
        {
          title: 'Integration by Parts',
          content: '∫u dv = uv - ∫v du',
          type: 'FORMULA',
          order: 5,
          tags: ['calculus', 'integration'],
          pageId: pageIdMapping.math,
        },

        // CSS entries
        {
          title: 'Flexbox Container',
          content: '.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 1rem;\n}',
          type: 'CODE_SNIPPET',
          language: 'css',
          order: 1,
          isCodeSnippet: true,
          tags: ['layout', 'flexbox'],
          pageId: pageIdMapping.css,
        },
        {
          title: 'Grid Layout',
          content: '.grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 1rem;\n}',
          type: 'CODE_SNIPPET',
          language: 'css',
          order: 2,
          isCodeSnippet: true,
          tags: ['layout', 'grid'],
          pageId: pageIdMapping.css,
        },
        {
          title: 'Box Model',
          content: 'Content → Padding → Border → Margin (from inside out)',
          type: 'TERMINOLOGY',
          order: 3,
          tags: ['layout', 'box-model'],
          pageId: pageIdMapping.css,
        },
        {
          title: 'Media Queries',
          content: '@media (max-width: 768px) {\n  .container { width: 100%; }\n}',
          type: 'CODE_SNIPPET',
          language: 'css',
          order: 4,
          isCodeSnippet: true,
          tags: ['responsive', 'media-queries'],
          pageId: pageIdMapping.css,
        },

        // SQL entries
        {
          title: 'Basic SELECT',
          content: 'SELECT column1, column2 FROM table_name WHERE condition ORDER BY column1;',
          type: 'CODE_SNIPPET',
          language: 'sql',
          order: 1,
          isCodeSnippet: true,
          tags: ['query', 'select'],
          pageId: pageIdMapping.sql,
        },
        {
          title: 'JOIN Types',
          content: 'INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN',
          type: 'REFERENCE',
          order: 2,
          tags: ['joins', 'relationships'],
          pageId: pageIdMapping.sql,
        },
        {
          title: 'Aggregate Functions',
          content: 'COUNT(), SUM(), AVG(), MIN(), MAX(), GROUP BY, HAVING',
          type: 'REFERENCE',
          order: 3,
          tags: ['functions', 'aggregation'],
          pageId: pageIdMapping.sql,
        },
        {
          title: 'ACID Properties',
          content: 'Atomicity, Consistency, Isolation, Durability - fundamental properties of database transactions',
          type: 'TERMINOLOGY',
          order: 4,
          tags: ['database', 'transactions'],
          pageId: pageIdMapping.sql,
        },
      ],
    })

    console.log('✅ Database seeded successfully!')
    console.log('Created 4 users, 5 cheatsheet pages, and 21 entries')
    console.log('')
    console.log('👤 User credentials:')
    console.log('Admin: admin@cheatsheet.com / admin123')
    console.log('User: user@cheatsheet.com / user123')
    console.log('Alice: alice@cheatsheet.com / alice123')
    console.log('Bob: bob@cheatsheet.com / bob123')
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('💥 Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
