export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(n, max));

export const fmt = (n: number) =>
    n >= 1e12 ? (n / 1e12).toFixed(2) + "T" :
        n >= 1e9 ? (n / 1e9).toFixed(2) + "B" :
            n >= 1e6 ? (n / 1e6).toFixed(2) + "M" :
                n >= 1e3 ? (n / 1e3).toFixed(2) + "K" :
                    n < 1000 && n % 1 !== 0 ? n.toFixed(1) :
                        Math.floor(n).toString();
