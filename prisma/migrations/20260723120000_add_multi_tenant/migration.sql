-- CreateTable
CREATE TABLE "saloes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saloes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "idSalao" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_idSalao_idx" ON "usuarios"("idSalao");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_idSalao_fkey" FOREIGN KEY ("idSalao") REFERENCES "saloes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed default tenant (bootstrap salao for existing single-tenant data)
INSERT INTO "saloes" ("id", "nome", "createdAt", "updatedAt")
VALUES ('salao_default', 'Salão Principal', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AlterTable: add idSalao to clientes (nullable first, backfill, then required)
ALTER TABLE "clientes" ADD COLUMN "idSalao" TEXT;
UPDATE "clientes" SET "idSalao" = 'salao_default' WHERE "idSalao" IS NULL;
ALTER TABLE "clientes" ALTER COLUMN "idSalao" SET NOT NULL;

-- AlterTable: add idSalao to profissionais (nullable first, backfill, then required)
ALTER TABLE "profissionais" ADD COLUMN "idSalao" TEXT;
UPDATE "profissionais" SET "idSalao" = 'salao_default' WHERE "idSalao" IS NULL;
ALTER TABLE "profissionais" ALTER COLUMN "idSalao" SET NOT NULL;

-- DropIndex (replace global cpf uniqueness with per-tenant uniqueness)
DROP INDEX "clientes_cpf_key";
DROP INDEX "profissionais_cpf_key";

-- CreateIndex
CREATE UNIQUE INDEX "clientes_idSalao_cpf_key" ON "clientes"("idSalao", "cpf");
CREATE INDEX "clientes_idSalao_idx" ON "clientes"("idSalao");

-- CreateIndex
CREATE UNIQUE INDEX "profissionais_idSalao_cpf_key" ON "profissionais"("idSalao", "cpf");
CREATE INDEX "profissionais_idSalao_idx" ON "profissionais"("idSalao");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_idSalao_fkey" FOREIGN KEY ("idSalao") REFERENCES "saloes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "profissionais" ADD CONSTRAINT "profissionais_idSalao_fkey" FOREIGN KEY ("idSalao") REFERENCES "saloes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
