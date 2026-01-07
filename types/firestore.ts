// firestoreにおけるuserの型
// const userRef = doc(db, "users", user.id)
export interface UserDocument {
  email: string;
  createdAt: string;
}
