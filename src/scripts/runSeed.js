import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { RESTAURANTS_DATA, MENU_ITEMS_DATA } from "./seedData.js";

const firebaseConfig = {
  apiKey: "AIzaSyBm-fj46eARiZcBEzQ4TQxgboyfYKJUXkU",
  authDomain: "project-29c01.firebaseapp.com",
  projectId: "project-29c01",
  storageBucket: "project-29c01.firebasestorage.app",
  messagingSenderId: "521147568836",
  appId: "1:521147568836:web:fe43779c1158609d176f91"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function seed() {
  console.log("Starting seed process...");
  
  const email = `admin_seed_${Date.now()}@example.com`;
  const password = "password123";
  let user;
  
  try {
    console.log("Creating temporary admin user...");
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    user = userCredential.user;
    console.log("User created:", user.uid);
    
    // Set user doc with admin role (possible due to lack of restrictions on create)
    await setDoc(doc(db, "users", user.uid), {
      name: "Seed Admin",
      email: email,
      role: "admin",
      createdAt: serverTimestamp()
    });
    console.log("User document created with role: admin");
  } catch (err) {
    console.error("Error creating user:", err.message);
    process.exit(1);
  }

  try {
    for (const rest of RESTAURANTS_DATA) {
      console.log("Adding restaurant:", rest.name);
      const restRef = await addDoc(collection(db, "restaurants"), {
        ...rest,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const restId = restRef.id;

      const items = MENU_ITEMS_DATA[rest.name] || [];
      let itemCount = 0;
      for (const item of items) {
        await addDoc(collection(db, "menuItems"), {
          ...item,
          restaurantId: restId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        itemCount++;
      }
      console.log(`Added ${itemCount} menu items for ${rest.name}`);
    }
    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Error seeding data:", err);
  }
  
  process.exit(0);
}

seed();
