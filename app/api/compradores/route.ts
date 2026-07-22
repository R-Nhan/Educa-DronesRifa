import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type CompradorBody = {
  numeroRifa?: number | string;
  numerosRifa?: Array<number | string> | string;
  numero?: number | string;
  comprador?: string;
  cpfComprador?: string;
  telefoneComprador?: string;
  cidadeComprador?: string;
  vendedorId?: number | string | null;
  vendedorNome?: string;
};

const vendedoresPermitidos = ["Ian", "Leandro", "Gabriel", "Heloisa"];

function getNumero(body: CompradorBody) {
  const rawNumero = body.numeroRifa ?? body.numero;
  const numero = Number(rawNumero);

  if (!Number.isInteger(numero) || numero <= 0) {
    return null;
  }

  return numero;
}

function parseNumeroItem(item: string) {
  const intervalo = item.match(/^(\d+)\s*-\s*(\d+)$/);

  if (intervalo) {
    const inicio = Number(intervalo[1]);
    const fim = Number(intervalo[2]);

    if (!Number.isInteger(inicio) || !Number.isInteger(fim) || inicio <= 0 || fim < inicio) {
      return [];
    }

    return Array.from({ length: fim - inicio + 1 }, (_, index) => inicio + index);
  }

  const numero = Number(item);

  if (!Number.isInteger(numero) || numero <= 0) {
    return [];
  }

  return [numero];
}

function getNumeros(body: CompradorBody) {
  const rawNumeros = body.numerosRifa ?? body.numeroRifa ?? body.numero;
  const itens = Array.isArray(rawNumeros)
    ? rawNumeros.map(String)
    : String(rawNumeros ?? "")
        .split(/[,\s;]+/)
        .filter(Boolean);

  const numeros = itens.flatMap((item) => parseNumeroItem(item.trim()));

  return [...new Set(numeros)].sort((a, b) => a - b);
}

function normalizeText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();
  return text.length > 0 ? text : null;
}

function getVendedorId(value: CompradorBody["vendedorId"]) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const vendedorId = Number(value);
  return Number.isInteger(vendedorId) && vendedorId > 0 ? vendedorId : null;
}

async function getVendedorIdFromBody(body: CompradorBody) {
  const vendedorId = getVendedorId(body.vendedorId);

  if (vendedorId) {
    return vendedorId;
  }

  const vendedorNome = normalizeText(body.vendedorNome);

  if (!vendedorNome) {
    return null;
  }

  const vendedorPermitido = vendedoresPermitidos.find(
    (vendedor) => vendedor.toLowerCase() === vendedorNome.toLowerCase()
  );

  if (!vendedorPermitido) {
    return null;
  }

  const vendedorExistente = await prisma.vendedor.findFirst({
    where: { nome: vendedorPermitido },
    select: { id: true },
  });

  if (vendedorExistente) {
    return vendedorExistente.id;
  }

  const vendedor = await prisma.vendedor.create({
    data: { nome: vendedorPermitido },
    select: { id: true },
  });

  return vendedor.id;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const numero = Number(searchParams.get("numero"));
  const disponivel = searchParams.get("disponivel");
  const vendido = searchParams.get("vendido");

  if (disponivel === "true") {
    const rifas = await prisma.rifaNumero.findMany({
      where: { vendido: false },
      orderBy: { numero: "asc" },
      select: { numero: true },
    });

    return NextResponse.json(rifas);
  }

  if (vendido === "true") {
    const rifas = await prisma.rifaNumero.findMany({
      where: { vendido: true },
      orderBy: { numero: "asc" },
      include: { vendedor: true },
    });

    return NextResponse.json(rifas);
  }

  if (Number.isInteger(numero) && numero > 0) {
    const rifa = await prisma.rifaNumero.findUnique({
      where: { numero },
      include: { vendedor: true },
    });

    if (!rifa) {
      return NextResponse.json(
        { message: "Numero da rifa nao encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(rifa);
  }

  const rifas = await prisma.rifaNumero.findMany({
    orderBy: { numero: "asc" },
    include: { vendedor: true },
  });

  return NextResponse.json(rifas);
}

export async function POST(request: Request) {
  const body = (await request.json()) as CompradorBody;
  const numeros = getNumeros(body);
  const comprador = normalizeText(body.comprador);
  const cpfComprador = normalizeText(body.cpfComprador);
  const telefoneComprador = normalizeText(body.telefoneComprador);
  const cidadeComprador = normalizeText(body.cidadeComprador);
  const vendedorId = await getVendedorIdFromBody(body);

  if (
    numeros.length === 0 ||
    !comprador ||
    !cpfComprador ||
    !telefoneComprador ||
    !cidadeComprador ||
    !vendedorId
  ) {
    return NextResponse.json(
      {
        message:
          "Preencha numeros da rifa, nome, CPF, telefone, cidade e vendedor.",
      },
      { status: 400 }
    );
  }

  const rifasVendidas = await prisma.rifaNumero.findMany({
    where: {
      numero: { in: numeros },
      vendido: true,
    },
    select: { numero: true },
    orderBy: { numero: "asc" },
  });

  if (rifasVendidas.length > 0) {
    const numerosVendidos = rifasVendidas.map((rifa) => rifa.numero).join(", ");

    return NextResponse.json(
      {
        message:
          rifasVendidas.length === 1
            ? `O numero ${numerosVendidos} ja foi vendido.`
            : `Os numeros ${numerosVendidos} ja foram vendidos.`,
      },
      { status: 409 }
    );
  }

  const rifasExistentes = await prisma.rifaNumero.findMany({
    where: {
      numero: { in: numeros },
    },
    select: { numero: true },
  });
  const numerosExistentes = new Set(rifasExistentes.map((rifa) => rifa.numero));
  const numerosInexistentes = numeros.filter(
    (numero) => !numerosExistentes.has(numero)
  );

  if (numerosInexistentes.length > 0) {
    return NextResponse.json(
      {
        message:
          numerosInexistentes.length === 1
            ? `O numero ${numerosInexistentes[0]} nao existe na rifa.`
            : `Os numeros ${numerosInexistentes.join(", ")} nao existem na rifa.`,
      },
      { status: 404 }
    );
  }

  const dataVenda = new Date();
  const rifas = await prisma.$transaction(
    numeros.map((numero) =>
      prisma.rifaNumero.update({
        where: { numero },
        data: {
          vendido: true,
          comprador,
          cpfComprador,
          telefoneComprador,
          cidadeComprador,
          vendedorId,
          dataVenda,
        },
      })
    )
  );

  return NextResponse.json(
    {
      message:
        rifas.length === 1
          ? "Numero cadastrado com sucesso."
          : `${rifas.length} numeros cadastrados com sucesso.`,
      rifas,
    },
    { status: 201 }
  );
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as CompradorBody;
  const numero = getNumero(body);

  if (!numero) {
    return NextResponse.json(
      { message: "Informe um numero da rifa valido." },
      { status: 400 }
    );
  }

  const rifaExiste = await prisma.rifaNumero.findUnique({
    where: { numero },
    select: { id: true },
  });

  if (!rifaExiste) {
    return NextResponse.json(
      { message: "Numero da rifa nao encontrado." },
      { status: 404 }
    );
  }

  const rifa = await prisma.rifaNumero.update({
    where: { numero },
    data: {
      comprador: normalizeText(body.comprador) ?? undefined,
      cpfComprador: normalizeText(body.cpfComprador) ?? undefined,
      telefoneComprador: normalizeText(body.telefoneComprador) ?? undefined,
      cidadeComprador: normalizeText(body.cidadeComprador) ?? undefined,
      vendedorId:
        body.vendedorId === undefined && body.vendedorNome === undefined
          ? undefined
          : await getVendedorIdFromBody(body),
      vendido: true,
      dataVenda: new Date(),
    },
  });

  return NextResponse.json(rifa);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const numero = Number(searchParams.get("numero"));
  const numerosParam = searchParams.get("numeros");

  const numeros = numerosParam
    ? Array.from(
        new Set(
          numerosParam
            .split(",")
            .map((item) => Number(item.trim()))
            .filter((value) => Number.isInteger(value) && value > 0)
        )
      )
    : Number.isInteger(numero) && numero > 0
    ? [numero]
    : [];

  if (numeros.length === 0) {
    return NextResponse.json(
      { message: "Informe um ou mais numeros da rifa validos." },
      { status: 400 }
    );
  }

  const rifasExistentes = await prisma.rifaNumero.findMany({
    where: { numero: { in: numeros } },
    select: { numero: true },
  });

  const existentesSet = new Set(rifasExistentes.map((rifa) => rifa.numero));
  const numerosInexistentes = numeros.filter((numero) => !existentesSet.has(numero));

  if (numerosInexistentes.length > 0) {
    return NextResponse.json(
      {
        message:
          numerosInexistentes.length === 1
            ? `O numero ${numerosInexistentes[0]} nao existe na rifa.`
            : `Os numeros ${numerosInexistentes.join(", ")} nao existem na rifa.`,
      },
      { status: 404 }
    );
  }

  await prisma.rifaNumero.updateMany({
    where: { numero: { in: numeros } },
    data: {
      vendido: false,
      comprador: null,
      cpfComprador: null,
      telefoneComprador: null,
      cidadeComprador: null,
      vendedorId: null,
      dataVenda: null,
    },
  });

  return NextResponse.json({
    message:
      numeros.length === 1
        ? `Numero ${numeros[0]} cancelado com sucesso.`
        : `${numeros.length} numeros cancelados com sucesso.`,
    numeros,
  });
}
