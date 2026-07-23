-- CreateTable
CREATE TABLE "categorias_servico" (
    "id" TEXT NOT NULL,
    "idSalao" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_servico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicos" (
    "id" TEXT NOT NULL,
    "idSalao" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "idCategoria" TEXT NOT NULL,
    "duracaoMinutos" INTEGER NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "servicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProfissionalToServico" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProfissionalToServico_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "categorias_servico_idSalao_idx" ON "categorias_servico"("idSalao");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_servico_idSalao_nome_key" ON "categorias_servico"("idSalao", "nome");

-- CreateIndex
CREATE INDEX "servicos_idSalao_idx" ON "servicos"("idSalao");

-- CreateIndex
CREATE INDEX "servicos_idCategoria_idx" ON "servicos"("idCategoria");

-- CreateIndex
CREATE UNIQUE INDEX "servicos_idSalao_nome_key" ON "servicos"("idSalao", "nome");

-- CreateIndex
CREATE INDEX "_ProfissionalToServico_B_index" ON "_ProfissionalToServico"("B");

-- AddForeignKey
ALTER TABLE "categorias_servico" ADD CONSTRAINT "categorias_servico_idSalao_fkey" FOREIGN KEY ("idSalao") REFERENCES "saloes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicos" ADD CONSTRAINT "servicos_idSalao_fkey" FOREIGN KEY ("idSalao") REFERENCES "saloes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicos" ADD CONSTRAINT "servicos_idCategoria_fkey" FOREIGN KEY ("idCategoria") REFERENCES "categorias_servico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfissionalToServico" ADD CONSTRAINT "_ProfissionalToServico_A_fkey" FOREIGN KEY ("A") REFERENCES "profissionais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfissionalToServico" ADD CONSTRAINT "_ProfissionalToServico_B_fkey" FOREIGN KEY ("B") REFERENCES "servicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
