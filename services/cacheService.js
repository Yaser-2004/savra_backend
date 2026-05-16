const cache = new Map();

export function generateCacheKey(
    topic,
    grade,
    slides
) {
    return `${topic}-${grade}-${slides}`
        .toLowerCase()
        .trim();
}

export function getCachedPPT(key) {

    if (cache.has(key)) {
        console.log("CACHE HIT");
        return cache.get(key);
    }

    console.log("CACHE MISS");

    return null;
}

export function saveToCache(key, value) {

    cache.set(key, value);

    console.log("Saved to cache");
}