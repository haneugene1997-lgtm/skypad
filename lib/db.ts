/**
 * lib/db.ts
 * IndexedDB wrapper — all offline data lives here.
 * Uses `idb` for a Promise-based API over the raw IndexedDB.
 */
import { openDB, DBSchema, IDBPDatabase } from "idb";

// ── Types ────────────────────────────────────────────

export interface Article {
  id: string;
  title: string;
  author: string;
  tag: string;           // e.g. "Productivity"
  readingTimeMin: number;
  content: string;       // Full HTML/markdown content cached offline
  progressPct: number;   // 0-100
  savedAt: number;       // timestamp
}

export interface Deck {
  id: string;
  title: string;
  cardCount: number;
  masteredCount: number;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;         // e.g. Korean word
  reading?: string;      // phonetic reading
  back: string;          // e.g. English meaning
  example?: string;
  dueAt: number;         // timestamp for SRS scheduling
  interval: number;      // days until next review
  ease: number;          // ease factor (SRS)
}

export interface JournalEntry {
  id: string;
  title: string;
  body: string;
  mood: string;          // emoji
  location?: string;     // e.g. "ICN → SFO"
  createdAt: number;
  updatedAt: number;
  isDraft: boolean;
}

// ── Schema ───────────────────────────────────────────

interface SkyPadDB extends DBSchema {
  articles: {
    key: string;
    value: Article;
    indexes: { "by-saved": number };
  };
  decks: {
    key: string;
    value: Deck;
  };
  flashcards: {
    key: string;
    value: Flashcard;
    indexes: { "by-deck": string; "by-due": number };
  };
  journal: {
    key: string;
    value: JournalEntry;
    indexes: { "by-updated": number };
  };
}

// ── Singleton connection ─────────────────────────────

let _db: IDBPDatabase<SkyPadDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<SkyPadDB>> {
  if (_db) return _db;

  _db = await openDB<SkyPadDB>("skypad-db", 1, {
    upgrade(db) {
      // Articles
      const articleStore = db.createObjectStore("articles", { keyPath: "id" });
      articleStore.createIndex("by-saved", "savedAt");

      // Decks
      db.createObjectStore("decks", { keyPath: "id" });

      // Flashcards
      const cardStore = db.createObjectStore("flashcards", { keyPath: "id" });
      cardStore.createIndex("by-deck", "deckId");
      cardStore.createIndex("by-due", "dueAt");

      // Journal
      const journalStore = db.createObjectStore("journal", { keyPath: "id" });
      journalStore.createIndex("by-updated", "updatedAt");
    },
  });

  await seedIfEmptyWithDb(_db);

  return _db;
}

// ── Articles ─────────────────────────────────────────

export async function getArticles(): Promise<Article[]> {
  const db = await getDB();
  return db.getAllFromIndex("articles", "by-saved");
}

export async function getArticle(id: string): Promise<Article | undefined> {
  const db = await getDB();
  return db.get("articles", id);
}

export async function saveArticle(article: Article): Promise<void> {
  const db = await getDB();
  await db.put("articles", article);
}

export async function updateArticleProgress(id: string, progressPct: number): Promise<void> {
  const db = await getDB();
  const article = await db.get("articles", id);
  if (!article) return;
  await db.put("articles", { ...article, progressPct });
}

export async function deleteArticle(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("articles", id);
}

// ── Decks ────────────────────────────────────────────

export async function getDecks(): Promise<Deck[]> {
  const db = await getDB();
  return db.getAll("decks");
}

export async function getDeck(id: string): Promise<Deck | undefined> {
  const db = await getDB();
  return db.get("decks", id);
}

export async function saveDeck(deck: Deck): Promise<void> {
  const db = await getDB();
  await db.put("decks", deck);
}

// ── Flashcards ───────────────────────────────────────

export async function getCardsByDeck(deckId: string): Promise<Flashcard[]> {
  const db = await getDB();
  return db.getAllFromIndex("flashcards", "by-deck", deckId);
}

export async function getDueCards(deckId: string): Promise<Flashcard[]> {
  const now = Date.now();
  const cards = await getCardsByDeck(deckId);
  return cards.filter((c) => c.dueAt <= now);
}

export async function saveCard(card: Flashcard): Promise<void> {
  const db = await getDB();
  await db.put("flashcards", card);
}

/**
 * Simple SRS scheduler — updates interval + ease based on rating.
 * rating: 0 = Again, 1 = Good, 2 = Easy
 */
export async function reviewCard(card: Flashcard, rating: 0 | 1 | 2): Promise<void> {
  const db = await getDB();
  const EASE_FACTOR = [0.5, 1, 2.5];
  const newInterval = Math.max(1, Math.round(card.interval * (card.ease * EASE_FACTOR[rating])));
  const newEase = Math.max(1.3, card.ease + (rating === 0 ? -0.2 : rating === 2 ? 0.15 : 0));
  await db.put("flashcards", {
    ...card,
    interval: newInterval,
    ease: newEase,
    dueAt: Date.now() + newInterval * 24 * 60 * 60 * 1000,
  });
}

// ── Journal ──────────────────────────────────────────

export async function getJournalEntries(): Promise<JournalEntry[]> {
  const db = await getDB();
  const entries = await db.getAllFromIndex("journal", "by-updated");
  return entries.reverse(); // newest first
}

export async function getJournalEntry(id: string): Promise<JournalEntry | undefined> {
  const db = await getDB();
  return db.get("journal", id);
}

export async function saveJournalEntry(entry: JournalEntry): Promise<void> {
  const db = await getDB();
  await db.put("journal", { ...entry, updatedAt: Date.now() });
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("journal", id);
}

// ── Seed data (dev / first-run) ──────────────────────

async function seedIfEmptyWithDb(db: IDBPDatabase<SkyPadDB>): Promise<void> {
  const existing = await db.count("articles");
  if (existing > 0) return;

  const now = Date.now();

  // Seed articles
  const articles: Article[] = [
    {
      id: "article-1",
      title: "The Deep Work Revolution",
      author: "Cal Newport",
      tag: "Productivity",
      readingTimeMin: 8,
      progressPct: 68,
      savedAt: now - 1000 * 60 * 60 * 24 * 5,
      content: `
        <p>In an age where the average knowledge worker checks their email 77 times per day, the ability to concentrate without distraction on cognitively demanding work is becoming increasingly rare — and increasingly valuable.</p>
        <p>Cal Newport calls this state <strong>deep work</strong>: professional activities performed in a state of distraction-free concentration that push your cognitive capabilities to their limit.</p>
        <p>The contrast is shallow work — non-cognitively demanding, logistical-style tasks, often performed while distracted. This includes most email, most meetings, and most administrative tasks.</p>
        <p>The thesis is simple but radical: in today's economy, those who can perform deep work will thrive. Everyone else will struggle to keep up.</p>
        <p>Newport outlines four philosophies for integrating deep work into your schedule. The key insight: your ability to perform deep work is a skill, not a character trait. It can be trained.</p>
      `,
    },
    {
      id: "article-2",
      title: "Building Products That Last",
      author: "First Round Review",
      tag: "Strategy",
      readingTimeMin: 12,
      progressPct: 0,
      savedAt: now - 1000 * 60 * 60 * 24 * 3,
      content: `
        <p>The most durable companies share a counterintuitive trait: they obsess over the problem, not the solution. The product changes; the problem they're solving rarely does.</p>
        <p>After interviewing 200+ founders whose companies have stood the test of time, a clear pattern emerges around how they think about product longevity.</p>
        <p>First: they resist the urge to over-engineer. The best products do fewer things, but do them remarkably well. Complexity is the enemy of longevity.</p>
        <p>Second: they invest heavily in feedback loops. Not just NPS scores, but deep qualitative conversations with the customers who almost churned.</p>
      `,
    },
    {
      id: "article-3",
      title: "Why Most Financial Models Fail",
      author: "Aswath Damodaran",
      tag: "Finance",
      readingTimeMin: 6,
      progressPct: 20,
      savedAt: now - 1000 * 60 * 60 * 24 * 2,
      content: `
        <p>Financial models are seductive. They give the illusion of precision in a world of uncertainty. But most models fail because they confuse complexity with accuracy.</p>
        <p>The first sin: garbage in, garbage out. A model built on heroic assumptions will produce heroic — and wrong — outputs, no matter how sophisticated the mechanics.</p>
        <p>The second sin: narrative-free numbers. Numbers without a story to anchor them are just arithmetic. The best analysts use models to test narratives, not to generate them.</p>
      `,
    },
  ];

  for (const a of articles) {
    await db.put("articles", a);
  }

  // Seed decks + cards
  const deck: Deck = {
    id: "deck-korean-biz",
    title: "Korean Business Vocab",
    cardCount: 30,
    masteredCount: 12,
  };
  await db.put("decks", deck);

  const cards: Flashcard[] = [
    { id: "c1", deckId: "deck-korean-biz", front: "회의", reading: "hoe-ui", back: "Meeting / Conference", example: "내일 오전에 회의가 있어요.", dueAt: now, interval: 1, ease: 2.5 },
    { id: "c2", deckId: "deck-korean-biz", front: "계약", reading: "gye-yak", back: "Contract / Agreement", example: "계약서를 검토해 주세요.", dueAt: now, interval: 1, ease: 2.5 },
    { id: "c3", deckId: "deck-korean-biz", front: "제안", reading: "je-an", back: "Proposal / Suggestion", example: "좋은 제안이네요.", dueAt: now, interval: 1, ease: 2.5 },
    { id: "c4", deckId: "deck-korean-biz", front: "매출", reading: "mae-chul", back: "Sales / Revenue", example: "이번 분기 매출이 증가했어요.", dueAt: now, interval: 1, ease: 2.5 },
    { id: "c5", deckId: "deck-korean-biz", front: "투자", reading: "tu-ja", back: "Investment", example: "이 프로젝트에 투자하고 싶어요.", dueAt: now, interval: 1, ease: 2.5 },
  ];
  for (const c of cards) {
    await db.put("flashcards", c);
  }

  // Seed journal
  const entries: JournalEntry[] = [
    {
      id: "journal-1",
      title: "Mid-year reflection — what am I building?",
      body: "The flight to SFO is a good time to think about where I want this side project to go.\n\nI've been working on SkyPad for a few months now. The core idea is simple: business travelers waste 10+ hours per long-haul flight because they didn't plan offline content. Reading, learning, writing — all possible without Wi-Fi.\n\nNext steps I want to figure out on this flight:",
      mood: "😌",
      location: "ICN → SFO",
      createdAt: now,
      updatedAt: now,
      isDraft: true,
    },
    {
      id: "journal-2",
      title: "Feature ideas dump",
      body: "Offline sync, TTS for articles, spaced repetition scheduler, collaborative decks shared via QR code...",
      mood: "🔥",
      location: "Seoul",
      createdAt: now - 1000 * 60 * 60 * 24 * 16,
      updatedAt: now - 1000 * 60 * 60 * 24 * 16,
      isDraft: false,
    },
  ];
  for (const e of entries) {
    await db.put("journal", e);
  }
}

/** Await to ensure DB is open and sample data exists (no-op if already seeded). */
export async function seedIfEmpty(): Promise<void> {
  await getDB();
}
