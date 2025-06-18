import { useEffect, useState } from "react";
import { db } from "../firebase";
import { onSnapshot, collection } from "firebase/firestore";

export default function ActiveUsersList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "activeUsers"), (snap) => {
      setUsers(snap.docs.map(doc => doc.data()));
    });
    return () => unsub();
  }, []);

  return (
    <div className="absolute right-4 top-4 bg-white rounded p-2 shadow w-48">
      <h4 className="font-bold mb-2">Active Users</h4>
      <ul>
        {users.map((user, idx) => <li key={idx}>{user.nickname}</li>)}
      </ul>
    </div>
  );
}