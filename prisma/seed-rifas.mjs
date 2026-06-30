import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const numeros = Array.from({ length: 1000 }, (_, index) => ({
    numero: index + 1,
  }));

  const resultado = await prisma.rifaNumero.createMany({
    data: numeros,
    skipDuplicates: true,
  });

  console.log(`${resultado.count} numeros da rifa foram criados.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
