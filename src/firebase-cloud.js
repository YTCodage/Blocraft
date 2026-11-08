import {initializeApp} from 'firebase/app';
import {getAuth,signInAnonymously} from 'firebase/auth';
import {getFirestore,doc,getDocFromServer,setDoc,runTransaction,onSnapshot} from 'firebase/firestore';
import {RoomStore} from './cloud-store.mjs';
// Public web configuration, not an administrator credential. Analytics deliberately not enabled.
const config={apiKey:'AIzaSyDziZ1glD8wTid7d1E96nBrKXx0byvzIIo',authDomain:'blocraft.firebaseapp.com',projectId:'blocraft',storageBucket:'blocraft.firebasestorage.app',messagingSenderId:'40003957520',appId:'1:40003957520:web:51470b8376e7916d556b95'};
let ready;
export async function connect(options){
 if(!ready)ready=(async()=>{const app=initializeApp(config),auth=getAuth(app);await auth.authStateReady();const user=auth.currentUser||(await signInAnonymously(auth)).user;return {firestore:getFirestore(app),uid:user.uid};})().catch(e=>{ready=null;throw e;});
 const {firestore,uid}=await ready;
 const db={get:async path=>(await getDocFromServer(doc(firestore,path))).data()||null,transaction:fn=>runTransaction(firestore,tx=>fn({get:async path=>(await tx.get(doc(firestore,path))).data()||null,set:(path,value)=>tx.set(doc(firestore,path),value)}))};
 await setDoc(doc(firestore,'adminProfiles',uid),{nickname:options.nickname,updatedAt:Date.now()});
 const store=new RoomStore(db,{...options,uid});
 return {open:type=>store.open(type),renew:type=>store.renew(type),release:type=>store.release(type),load:type=>store.load(type),save:(type,data)=>store.save(type,data),watch:(type,callback,error)=>onSnapshot(doc(firestore,store.path(type)),snapshot=>{if(!snapshot.metadata.fromCache)callback(snapshot.data()||null);},error)};
}
