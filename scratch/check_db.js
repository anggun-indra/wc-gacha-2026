import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import fs from "fs";

const firebaseConfig = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf8"));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const gamesSnapshot = await getDocs(collection(db, "games"));
  console.log("=== GAMES ===");
  for (const docSnap of gamesSnapshot.docs) {
    const game = docSnap.data();
    console.log(`Game ID: ${docSnap.id}, Name: ${game.name}`);
    console.log(`syncedRealMatchIds:`, game.syncedRealMatchIds);
    console.log(`hasSimulationScores:`, game.hasSimulationScores);
    
    // Read teams
    const teamsSnapshot = await getDocs(collection(db, "games", docSnap.id, "teams"));
    console.log("Teams count:", teamsSnapshot.size);
    const korea = teamsSnapshot.docs.find(d => d.data().name.toLowerCase().includes("korea"));
    const czechia = teamsSnapshot.docs.find(d => d.data().name.toLowerCase().includes("czech"));
    if (korea) console.log("Korea team:", korea.data());
    if (czechia) console.log("Czechia team:", czechia.data());
  }
}

run().catch(console.error);
