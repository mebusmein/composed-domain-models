
// =============================================================================
// Base Post Model
// =============================================================================

import { combine } from "./utils";

const postBase = ((source: { id: string; title?: string; body: string; slug: string; published: boolean }) => ({
    id: source.id,
    title: source.title ?? "Untitled", // defaults can be provided
    body: source.body,
    slug: source.slug,
    published: source.published,

    get excerpt() {
        return source.body.length > 280
            ? source.body.slice(0, 280) + "..."
            : source.body;
    },

    get url() {
        return `/posts/${source.slug}`;
    },

    get isDraft() {
        return !source.published;
    },
}));

type BasePost = ReturnType<typeof postBase>;

// =============================================================================
// Timestamps Extractor
// =============================================================================

// the source can be a discriminated union of two objects this will force the source to be one or the other
// this can be used when different apis have different keys for the same field. but internaly we want to have one abstraction
type TimestampedSource = {
    createdAt: string | number | Date;
    updatedAt: string | number | Date;
} | {
    created_at: string | number | Date;
    updated_at: string | number | Date;
};

const withTimestamps = (source: TimestampedSource) => {
    let createdAtRaw: string | number | Date | undefined;
    let updatedAtRaw: string | number | Date | undefined;

    if ("createdAt" in source && "updatedAt" in source) {
        createdAtRaw = source.createdAt;
        updatedAtRaw = source.updatedAt;
    } else if ("created_at" in source && "updated_at" in source) {
        createdAtRaw = source.created_at;
        updatedAtRaw = source.updated_at;
    } else {
        throw new Error("Source does not contain recognizable timestamp fields.");
    }

    return {
        createdAt: new Date(createdAtRaw),
        updatedAt: new Date(updatedAtRaw),
    };
};

type Timestamped = ReturnType<typeof withTimestamps>;

const isTimestamped = (obj: unknown): obj is Timestamped => {
    return typeof obj === "object" && obj !== null && "createdAt" in obj && "updatedAt" in obj && obj.createdAt instanceof Date && obj.updatedAt instanceof Date;
};

// =============================================================================
// example of use
// =============================================================================

const apiV1Data = {
    id: "1",
    title: "Test",
    body: "Test",
    slug: "test",
    published: true,
    createdAt: "2021-01-01",
    updatedAt: "2021-01-01",
}

const apiV2Data = {
    id: "1",
    title: "Test",
    body: "Test",
    slug: "test",
    published: true,
    created_at: "2021-01-01",
    updated_at: "2021-01-01",
}

const brokenData = {
    id: "1",
    title: "Test",
    body: "Test",
    slug: "test",
    published: true,
    createdAt: "2021-01-01",
    updated_at: "2021-01-01",
}

const mapPost = combine(
    postBase,
    withTimestamps,
);
type Post = ReturnType<typeof mapPost>;

const v1Post = mapPost(apiV1Data);
const v2Post = mapPost(apiV2Data);
const brokenPost = mapPost(brokenData);