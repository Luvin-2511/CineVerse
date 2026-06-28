const toggleTheme = (e) => {
  const x = e.clientX;
  const y = e.clientY;

  document.documentElement.style.setProperty('--x', `${x}px`);
  document.documentElement.style.setProperty('--y', `${y}px`);

  document.startViewTransition(() => {
    document.documentElement.classList.toggle('light-theme');
  });
};


export default toggleTheme