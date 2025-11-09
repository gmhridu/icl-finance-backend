DROP INDEX "uq_bank_cards_user_account";--> statement-breakpoint
CREATE INDEX "idx_bank_cards_user_bank" ON "bank_cards" USING btree ("user_id","bank_name",lower("account_number"));