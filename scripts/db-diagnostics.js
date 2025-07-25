const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function runDiagnostics() {
  try {
    console.log('🔍 Running database diagnostics...\n')
    
    // Check database connection
    console.log('1. Testing database connection...')
    await prisma.$queryRaw`SELECT version()`
    console.log('✅ Database connection successful\n')
    
    // Check table counts
    console.log('2. Checking table counts...')
    const userCount = await prisma.user.count()
    const pageCount = await prisma.cheatsheetPage.count()
    const entryCount = await prisma.cheatsheetEntry.count()
    
    console.log(`   Users: ${userCount}`)
    console.log(`   Pages: ${pageCount}`)
    console.log(`   Entries: ${entryCount}\n`)
    
    // Check array fields
    console.log('3. Testing array field handling...')
    const sampleEntries = await prisma.cheatsheetEntry.findMany({
      take: 3,
      select: {
        id: true,
        title: true,
        tags: true
      }
    })
    
    console.log('   Sample entries with tags:')
    sampleEntries.forEach(entry => {
      console.log(`   - ${entry.title}: [${entry.tags.join(', ')}] (${typeof entry.tags})`)
    })
    
    // Test array operations
    console.log('\n4. Testing array operations...')
    
    if (sampleEntries.length === 0) {
      console.log('   ⚠️  No entries found to test against')
      return
    }
    
    // Get the first page ID
    const firstPage = await prisma.cheatsheetPage.findFirst({
      select: { id: true }
    })
    
    if (!firstPage) {
      console.log('   ⚠️  No pages found to test against')
      return
    }
    
    const testEntry = await prisma.cheatsheetEntry.create({
      data: {
        title: 'Array Test Entry',
        content: 'Testing array functionality',
        type: 'NOTE',
        tags: ['test', 'array', 'diagnostic'],
        order: 999,
        pageId: firstPage.id
      }
    })
    
    console.log(`   ✅ Created test entry with tags: [${testEntry.tags.join(', ')}]`)
    
    // Clean up test entry
    await prisma.cheatsheetEntry.delete({
      where: { id: testEntry.id }
    })
    console.log('   ✅ Cleaned up test entry\n')
    
    console.log('🎉 All diagnostics passed!')
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error)
    
    if (error.message.includes('array dimensions')) {
      console.log('\n🔧 Array dimension error detected!')
      console.log('This usually happens when:')
      console.log('1. Corrupted data exists in the database')
      console.log('2. Array fields contain invalid data types')
      console.log('3. Migration issues with array columns')
      console.log('\nSuggested fixes:')
      console.log('- Run: npm run db:reset')
      console.log('- Check your array data format')
      console.log('- Ensure tags are proper string arrays')
    }
    
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

runDiagnostics()
  .catch(console.error)