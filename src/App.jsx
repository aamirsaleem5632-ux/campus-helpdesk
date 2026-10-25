import React, { useState, useEffect } from 'react';

function App() {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  );

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={theme === 'dark' ? 'bg-gray-900 text-white min-h-screen' : 'bg-white text-gray-900 min-h-screen'}>
      <header className="p-4 flex justify-between items-center border-b">
        <h1 className="text-xl font-bold">Campus Helpdesk Portal</h1>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          Switch to {theme === 'light' ? '🌙 Dark' : '☀️ Light'} Mode
        </button>
      </header>
      <main className="p-6">
        <p>Welcome to the Campus Helpdesk Dashboard!</p>
      </main>
    </div>
  );
}

export default App;