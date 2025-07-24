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
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.create({
      data: {
        email: 'admin@cheatsheet.com',
        name: 'Admin User',
        password: adminPassword,
        isAdmin: true,
      },
    })

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 10)
    const user = await prisma.user.create({
      data: {
        email: 'user@cheatsheet.com',
        name: 'Regular User',
        password: userPassword,
        isAdmin: false,
      },
    })

    console.log('📚 Creating cheatsheet pages...')

    // Create JavaScript cheatsheet page
    const jsPage = await prisma.cheatsheetPage.create({
      data: {
        title: 'JavaScript Essentials',
        description: 'Core JavaScript concepts and syntax',
        topic: 'Programming',
        color: '#f7df1e',
        order: 1,
        authorId: admin.id,
        entries: {
          create: [
            {
              title: 'Variable Declaration',
              content: 'let name = "John";\nconst age = 25;\nvar oldStyle = "deprecated";',
              type: 'CODE_SNIPPET',
              language: 'javascript',
              order: 1,
              isCodeSnippet: true,
              tags: ['variables', 'syntax']
            },
            {
              title: 'Arrow Functions',
              content: 'const add = (a, b) => a + b;\nconst multiply = (x, y) => {\n  return x * y;\n};',
              type: 'CODE_SNIPPET',
              language: 'javascript',
              order: 2,
              isCodeSnippet: true,
              tags: ['functions', 'es6']
            },
            {
              title: 'Hoisting',
              content: 'A JavaScript mechanism where variables and function declarations are moved to the top of their containing scope during compilation.',
              type: 'TERMINOLOGY',
              order: 3,
              tags: ['concepts', 'scope']
            },
            {
              title: 'Array Methods',
              content: 'map(), filter(), reduce(), forEach(), find(), some(), every()',
              type: 'REFERENCE',
              order: 4,
              tags: ['arrays', 'methods']
            }
          ]
        }
      }
    })

    // Create Python cheatsheet page
    const pythonPage = await prisma.cheatsheetPage.create({
      data: {
        title: 'Python Quick Reference',
        description: 'Essential Python syntax and concepts',
        topic: 'Programming',
        color: '#3776ab',
        order: 2,
        authorId: admin.id,
        entries: {
          create: [
            {
              title: 'List Comprehension',
              content: 'squares = [x**2 for x in range(10)]\neven_squares = [x**2 for x in range(10) if x % 2 == 0]',
              type: 'CODE_SNIPPET',
              language: 'python',
              order: 1,
              isCodeSnippet: true,
              tags: ['lists', 'comprehension']
            },
            {
              title: 'Dictionary Methods',
              content: 'get(), keys(), values(), items(), pop(), update(), setdefault()',
              type: 'REFERENCE',
              order: 2,
              tags: ['dictionary', 'methods']
            },
            {
              title: 'Lambda Functions',
              content: 'lambda x: x * 2\nsorted(students, key=lambda s: s.grade)',
              type: 'CODE_SNIPPET',
              language: 'python',
              order: 3,
              isCodeSnippet: true,
              tags: ['functions', 'lambda']
            },
            {
              title: 'PEP 8',
              content: 'Python Enhancement Proposal 8 - Style Guide for Python Code. Defines coding conventions for Python.',
              type: 'TERMINOLOGY',
              order: 4,
              tags: ['style', 'conventions']
            }
          ]
        }
      }
    })

    // Create Math cheatsheet page
    const mathPage = await prisma.cheatsheetPage.create({
      data: {
        title: 'Mathematics Formulas',
        description: 'Essential mathematical formulas and concepts',
        topic: 'Mathematics',
        color: '#ff6b35',
        order: 3,
        authorId: user.id,
        entries: {
          create: [
            {
              title: 'Quadratic Formula',
              content: 'x = (-b ± √(b² - 4ac)) / 2a',
              type: 'FORMULA',
              order: 1,
              tags: ['algebra', 'equations']
            },
            {
              title: 'Pythagorean Theorem',
              content: 'a² + b² = c²',
              type: 'FORMULA',
              order: 2,
              tags: ['geometry', 'triangles']
            },
            {
              title: 'Area of Circle',
              content: 'A = πr²',
              type: 'FORMULA',
              order: 3,
              tags: ['geometry', 'area']
            },
            {
              title: 'Derivative',
              content: 'The rate of change of a function with respect to its variable. d/dx[f(x)]',
              type: 'TERMINOLOGY',
              order: 4,
              tags: ['calculus', 'derivatives']
            },
            {
              title: 'Integration by Parts',
              content: '∫u dv = uv - ∫v du',
              type: 'FORMULA',
              order: 5,
              tags: ['calculus', 'integration']
            }
          ]
        }
      }
    })

    // Create CSS cheatsheet page
    const cssPage = await prisma.cheatsheetPage.create({
      data: {
        title: 'CSS Layout Guide',
        description: 'Modern CSS layout techniques and properties',
        topic: 'Web Development',
        color: '#1572b6',
        order: 4,
        authorId: user.id,
        entries: {
          create: [
            {
              title: 'Flexbox Container',
              content: '.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 1rem;\n}',
              type: 'CODE_SNIPPET',
              language: 'css',
              order: 1,
              isCodeSnippet: true,
              tags: ['layout', 'flexbox']
            },
            {
              title: 'Grid Layout',
              content: '.grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 1rem;\n}',
              type: 'CODE_SNIPPET',
              language: 'css',
              order: 2,
              isCodeSnippet: true,
              tags: ['layout', 'grid']
            },
            {
              title: 'Box Model',
              content: 'Content → Padding → Border → Margin (from inside out)',
              type: 'TERMINOLOGY',
              order: 3,
              tags: ['layout', 'box-model']
            },
            {
              title: 'Media Queries',
              content: '@media (max-width: 768px) {\n  .container { width: 100%; }\n}',
              type: 'CODE_SNIPPET',
              language: 'css',
              order: 4,
              isCodeSnippet: true,
              tags: ['responsive', 'media-queries']
            }
          ]
        }
      }
    })

    // Create SQL cheatsheet page
    const sqlPage = await prisma.cheatsheetPage.create({
      data: {
        title: 'SQL Commands',
        description: 'Essential SQL queries and database operations',
        topic: 'Database',
        color: '#336791',
        order: 5,
        authorId: admin.id,
        entries: {
          create: [
            {
              title: 'Basic SELECT',
              content: 'SELECT column1, column2 FROM table_name WHERE condition ORDER BY column1;',
              type: 'CODE_SNIPPET',
              language: 'sql',
              order: 1,
              isCodeSnippet: true,
              tags: ['query', 'select']
            },
            {
              title: 'JOIN Types',
              content: 'INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN',
              type: 'REFERENCE',
              order: 2,
              tags: ['joins', 'relationships']
            },
            {
              title: 'Aggregate Functions',
              content: 'COUNT(), SUM(), AVG(), MIN(), MAX(), GROUP BY, HAVING',
              type: 'REFERENCE',
              order: 3,
              tags: ['functions', 'aggregation']
            },
            {
              title: 'ACID Properties',
              content: 'Atomicity, Consistency, Isolation, Durability - fundamental properties of database transactions',
              type: 'TERMINOLOGY',
              order: 4,
              tags: ['database', 'transactions']
            }
          ]
        }
      }
    })

    console.log('✅ Database seeded successfully!')
    console.log('Created 5 cheatsheet pages with entries')
    console.log('Admin user: admin@cheatsheet.com / admin123')
    console.log('Regular user: user@cheatsheet.com / user123')
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('💥 Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
