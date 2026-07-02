-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "payment_status" VARCHAR(20) DEFAULT 'pending',
ADD COLUMN     "payment_token" VARCHAR(255);
