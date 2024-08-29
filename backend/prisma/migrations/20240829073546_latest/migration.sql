-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "title" SET DEFAULT 'Select the best one';
