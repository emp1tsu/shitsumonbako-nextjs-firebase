import * as firebase from "firebase/app";
import { useEffect } from "react";
import { atom, useRecoilState } from "recoil";

import { User } from "../models/User";

const userState = atom<User>({
  key: "user",
  default: null,
});

async function createUserIfNotFound(user: User) {
  const userRef = firebase.firestore().collection("users").doc(user.uid);
  const doc = await userRef.get();
  if (doc.exists) return;

  await userRef.set({
    name: "taro" + new Date().getTime(),
  });
}

export function useAuthenticate() {
  const [user, setUser] = useRecoilState(userState);

  useEffect(() => {
    console.log("Start useEffect");
    if (user !== null) return;

    firebase
      .auth()
      .signInAnonymously()
      .catch(function (error) {
        console.error(error);
      });

    firebase.auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        console.log("Set user");
        const loginUser: User = {
          uid: firebaseUser.uid,
          isAnonymous: firebaseUser.isAnonymous,
          name: "",
        };
        setUser(loginUser);
        createUserIfNotFound(loginUser);
      } else {
        // サインアウト
        setUser(null);
      }
    });
  }, []);

  return { user };
}
