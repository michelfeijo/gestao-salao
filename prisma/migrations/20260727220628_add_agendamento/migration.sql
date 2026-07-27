-- CreateTable
CREATE TABLE "agendamentos" (
    "id" TEXT NOT NULL,
    "idSalao" TEXT NOT NULL,
    "idCliente" TEXT NOT NULL,
    "idProfissional" TEXT NOT NULL,
    "idServico" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fim" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'agendado',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agendamentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agendamentos_idSalao_idx" ON "agendamentos"("idSalao");

-- CreateIndex
CREATE INDEX "agendamentos_idProfissional_inicio_idx" ON "agendamentos"("idProfissional", "inicio");

-- CreateIndex
CREATE INDEX "agendamentos_idCliente_idx" ON "agendamentos"("idCliente");

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_idSalao_fkey" FOREIGN KEY ("idSalao") REFERENCES "saloes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_idCliente_fkey" FOREIGN KEY ("idCliente") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_idProfissional_fkey" FOREIGN KEY ("idProfissional") REFERENCES "profissionais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_idServico_fkey" FOREIGN KEY ("idServico") REFERENCES "servicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
