const calcSize = () => {
  const x = typeof window === "undefined" ? 769 : window.innerWidth;
  switch (true) {
    // case x <= 640:
    //   return 20;
    case x <= 768:
      return 20;
    case x > 769 && x <= 1024:
      return 25;
    case x > 1025 && x <= 1280:
      return 30;
    default:
      return 35;
  }
};

export { calcSize };
