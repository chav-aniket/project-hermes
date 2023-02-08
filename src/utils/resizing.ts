const calcSize = (base: number, scale: number) => {
  const x = typeof window === "undefined" ? 769 : window.innerWidth;
  switch (true) {
    // case x <= 640:
    //   return 20;
    case x <= 768:
      return base;
    case x > 769 && x <= 1024:
      return base + scale;
    case x > 1025 && x <= 1280:
      return base + scale * 2;
    default:
      return base + scale * 3;
  }
};

export { calcSize };
