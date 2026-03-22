const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Adding recurring expenses to all budgets...');
  
  const budgets = await prisma.budget.findMany({
    include: {
      debts: {
        where: {
          type: 'recurring'
        }
      }
    }
  });

  for (const budget of budgets) {
    const existingCategories = budget.debts.map(d => d.category);
    const toCreate = [];

    if (!existingCategories.includes('food')) {
      toCreate.push({
        budgetId: budget.id,
        name: 'Food',
        type: 'recurring',
        category: 'food',
        monthlyPayment: 0,
        source: 'default',
        includeInAnalysis: true,
      });
    }

    if (!existingCategories.includes('gasoline')) {
      toCreate.push({
        budgetId: budget.id,
        name: 'Gasoline',
        type: 'recurring',
        category: 'gasoline',
        monthlyPayment: 0,
        source: 'default',
        includeInAnalysis: true,
      });
    }

    if (!existingCategories.includes('entertainment')) {
      toCreate.push({
        budgetId: budget.id,
        name: 'Entertainment',
        type: 'recurring',
        category: 'entertainment',
        monthlyPayment: 0,
        source: 'default',
        includeInAnalysis: true,
      });
    }

    if (toCreate.length > 0) {
      await prisma.debtItem.createMany({
        data: toCreate
      });
      console.log(`Added ${toCreate.length} recurring expenses to budget ${budget.id}`);
    }
  }

  console.log('Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
