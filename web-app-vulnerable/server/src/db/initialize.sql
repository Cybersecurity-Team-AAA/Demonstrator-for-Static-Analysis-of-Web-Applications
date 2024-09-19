DROP TABLE IF EXISTS "users";
DROP TABLE IF EXISTS "transactions";

CREATE TABLE "users" (
    "id"        INTEGER PRIMARY KEY NOT NULL,
    "username"  TEXT NOT NULL UNIQUE,
    "password"  TEXT NOT NULL,
    "role"      TEXT NOT NULL,
    "balance"   REAL,
    "pending_registration" TEXT NOT NULL,
    "address"   TEXT,
    "filename"  TEXT,
    "document"  BLOB
);

CREATE TABLE "transactions" (
    "id" INTEGER PRIMARY KEY NOT NULL,
    "user_id" INTEGER NOT NULL,
    "seller_id" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "pending_state" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (seller_id) REFERENCES users (id)
);

INSERT INTO "users" ("username", "password", "role", "pending_registration") VALUES('admin', 'admin', 'admin', 'false');

/* For debugging */
INSERT INTO "users" ("username", "password", "role", "balance", "pending_registration") VALUES('user', 'user', 'user', 10.0, 'false');
INSERT INTO "users" ("username", "password", "role", "pending_registration", "address") VALUES('seller', 'seller', 'seller', 'false', 'Via Roma 12');
