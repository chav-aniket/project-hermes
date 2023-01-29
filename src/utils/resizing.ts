const calcSize = () => {
  const x = typeof window === "undefined" ? 769 : window.innerWidth;
  switch (true) {
    case x <= 640:
      return 20;
    case x <= 768:
      return 30;
    case x <= 1024:
      return 30;
    default:
      return 30;
  }
};

export { calcSize };
