import firebaseExport, {
  app,
  auth,
  db,
  storage,
  googleProvider,
  analytics,
  firebaseConfig
} from '../lib/firebase';

export { app, auth, db, storage, googleProvider, analytics, firebaseConfig };
export default firebaseExport;
