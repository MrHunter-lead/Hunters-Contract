const { Connection, Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction, sendAndConfirmTransaction } = require("@solana/web3.js");
const fs = require("fs");
require("dotenv").config();

const connection = new Connection(process.env.RPC_URL, "confirmed");

function loadOrCreateWallet() {
  const walletFile = "wallet.json";
  if (fs.existsSync(walletFile) && fs.readFileSync(walletFile).length > 0) {
    const secret = JSON.parse(fs.readFileSync(walletFile));
    return Keypair.fromSecretKey(Uint8Array.from(secret));
  } else {
    const wallet = Keypair.generate();
    fs.writeFileSync(walletFile, JSON.stringify(Array.from(wallet.secretKey)));
    console.log("Новый кошелёк создан и сохранён!");
    return wallet;
  }
}

async function main() {
  const wallet = loadOrCreateWallet();
  console.log("Адрес кошелька:", wallet.publicKey.toString());

  const balance = await connection.getBalance(wallet.publicKey);
  console.log("Баланс:", balance / LAMPORTS_PER_SOL, "SOL");

  if (balance < 0.1 * LAMPORTS_PER_SOL) {
    console.log("Мало SOL! Пополни на faucet.solana.com");
    return;
  }

  const receiver = Keypair.generate();
  console.log("Получатель:", receiver.publicKey.toString());

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: receiver.publicKey,
      lamports: 0.1 * LAMPORTS_PER_SOL,
    })
  );

  const signature = await sendAndConfirmTransaction(connection, transaction, [wallet]);
  console.log("Транзакция успешна!");
  console.log("Смотри на: https://explorer.solana.com/tx/" + signature + "?cluster=devnet");
}

main().catch(console.error);