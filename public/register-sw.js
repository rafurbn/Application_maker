// আলাদা ফাইলে রাখা হয়েছে যাতে Content-Security-Policy-তে 'unsafe-inline' না লাগে।
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.log('SW registration note:', err);
    });
  });
}
