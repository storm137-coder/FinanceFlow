importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
const firebaseConfig = {
  apiKey: "AIzaSyDqog9ygy062tzgtwYT2yrK9VmTMGCFw3Y",
  authDomain: "financeflow-web.firebaseapp.com",
  projectId: "financeflow-web",
  storageBucket: "financeflow-web.firebasestorage.app",
  messagingSenderId: "415866546378",
  appId: "1:415866546378:web:4f2ae36de8ab128d30ac33",
  measurementId: "G-11R7GG1PEK"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification?.title || 'FinanceFlow';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification.',
    icon: '/icon512_maskable.png', // Assuming this exists from next-pwa
    badge: '/icon512_maskable.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
