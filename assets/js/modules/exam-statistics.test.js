import { describe, it, expect } from 'vitest';
import {
    MAX_WRONG_QUESTIONS,
    MIN_ANSWERS_FOR_RANKING,
    addRunToTopicStats,
    parseTopicStats,
    parseWrongQuestions,
    pickWeaknessQuestions,
    rankTopics,
    updateWrongQuestions,
} from './exam-statistics.js';
import { EXAM_QUESTIONS, EXAM_TOPICS } from './exam-questions.js';

const q = (id, topic, correct = 0) => ({ id, topic, correct, exam: 'ap1' });
const identity = (items) => [...items];

describe('parseTopicStats', () => {
    it('reads valid data and clamps impossible values', () => {
        expect(parseTopicStats('{"sql":{"total":4,"correct":3},"net":{"total":2,"correct":9}}')).toEqual({
            sql: { total: 4, correct: 3 },
            net: { total: 2, correct: 2 },
        });
    });

    it.each([null, undefined, '', 'kein json', '[]', '"text"', '42', 'null'])('returns {} for %s', (raw) => {
        expect(parseTopicStats(raw)).toEqual({});
    });

    it('skips entries with the wrong shape', () => {
        expect(parseTopicStats('{"a":{"total":"3","correct":1},"b":null,"c":{"total":1.5,"correct":1}}')).toEqual({});
    });
});

describe('parseWrongQuestions', () => {
    it('keeps strings only, without duplicates', () => {
        expect(parseWrongQuestions('["a","b",3,null,"a"]')).toEqual(['a', 'b']);
    });

    it.each([null, '', 'kaputt', '{}', '"a"'])('returns [] for %s', (raw) => {
        expect(parseWrongQuestions(raw)).toEqual([]);
    });

    it('keeps the most recent entries when the list is too long', () => {
        const ids = Array.from({ length: MAX_WRONG_QUESTIONS + 20 }, (_v, i) => `q${i}`);
        const result = parseWrongQuestions(JSON.stringify(ids));
        expect(result).toHaveLength(MAX_WRONG_QUESTIONS);
        expect(result.at(-1)).toBe(`q${MAX_WRONG_QUESTIONS + 19}`);
    });
});

describe('addRunToTopicStats', () => {
    const questions = [q('1', 'sql', 1), q('2', 'sql', 0), q('3', 'net', 2)];

    it('counts correct, wrong and unanswered questions per topic', () => {
        const result = addRunToTopicStats({}, questions, [1, 3, null]);
        expect(result).toEqual({ sql: { total: 2, correct: 1 }, net: { total: 1, correct: 0 } });
    });

    it('adds to existing numbers without changing its input', () => {
        const before = { sql: { total: 10, correct: 8 } };
        const result = addRunToTopicStats(before, questions, [1, 0, 2]);
        expect(result.sql).toEqual({ total: 12, correct: 10 });
        expect(before).toEqual({ sql: { total: 10, correct: 8 } });
    });

    it('handles an empty run', () => {
        expect(addRunToTopicStats({ a: { total: 1, correct: 1 } }, [], [])).toEqual({ a: { total: 1, correct: 1 } });
    });
});

describe('updateWrongQuestions', () => {
    const questions = [q('a', 't', 0), q('b', 't', 0), q('c', 't', 0)];

    it('adds new mistakes and counts unanswered questions as mistakes', () => {
        expect(updateWrongQuestions([], questions, [1, 0, null])).toEqual(['a', 'c']);
    });

    it('removes a question that is answered correctly now', () => {
        expect(updateWrongQuestions(['a', 'x'], questions, [0, 0, 0])).toEqual(['x']);
    });

    it('moves a repeated mistake to the end instead of duplicating it', () => {
        expect(updateWrongQuestions(['a', 'x'], questions, [1, 0, 0])).toEqual(['x', 'a']);
    });

    it('never grows beyond the limit and drops the oldest first', () => {
        const old = Array.from({ length: MAX_WRONG_QUESTIONS }, (_v, i) => `old${i}`);
        const result = updateWrongQuestions(old, questions, [1, 1, 1]);
        expect(result).toHaveLength(MAX_WRONG_QUESTIONS);
        expect(result.slice(-3)).toEqual(['a', 'b', 'c']);
        expect(result).not.toContain('old0');
    });
});

describe('rankTopics', () => {
    it('sorts the weakest topic first and rounds the rate', () => {
        const ranked = rankTopics({
            good: { total: 10, correct: 9 },
            weak: { total: 6, correct: 2 },
            mid: { total: 3, correct: 2 },
        });
        expect(ranked.map((entry) => entry.topic)).toEqual(['weak', 'mid', 'good']);
        expect(ranked.map((entry) => entry.percent)).toEqual([33, 67, 90]);
    });

    it('ignores topics with too few answers', () => {
        const few = MIN_ANSWERS_FOR_RANKING - 1;
        expect(rankTopics({ a: { total: few, correct: 0 } })).toEqual([]);
    });

    it('puts the topic with more data first on equal rates', () => {
        const ranked = rankTopics({ small: { total: 4, correct: 2 }, big: { total: 8, correct: 4 } });
        expect(ranked.map((entry) => entry.topic)).toEqual(['big', 'small']);
    });
});

describe('pickWeaknessQuestions', () => {
    const pool = [q('s1', 'sql'), q('s2', 'sql'), q('s3', 'sql'), q('n1', 'net'), q('n2', 'net'), q('o1', 'oop')];
    const stats = { sql: { total: 10, correct: 2 }, net: { total: 10, correct: 9 }, oop: { total: 10, correct: 3 } };
    const ids = (picked) => picked.map((question) => question.id);

    it('returns nothing when nothing is known yet', () => {
        expect(pickWeaknessQuestions(pool, [], {}, 5, identity)).toEqual([]);
    });

    it('starts with the questions still answered wrongly, most recent first', () => {
        expect(ids(pickWeaknessQuestions(pool, ['n1', 'o1'], {}, 5, identity)).slice(0, 2)).toEqual(['o1', 'n1']);
    });

    it('fills up with fresh questions of the weakest topics only', () => {
        const picked = pickWeaknessQuestions(pool, ['o1'], stats, 4, identity);
        expect(ids(picked)).toEqual(['o1', 's1', 's2', 's3']);
        expect(picked.some((question) => question.topic === 'net')).toBe(false);
    });

    it('takes questions of stronger topics once the weak ones are used up', () => {
        const picked = pickWeaknessQuestions(pool, [], stats, 6, identity);
        expect(ids(picked).slice(0, 3)).toEqual(['s1', 's2', 's3']);
        expect(ids(picked).sort()).toEqual(pool.map((question) => question.id).sort());
    });

    it('never repeats a question and respects the count', () => {
        expect(pickWeaknessQuestions(pool, ['s1', 's2', 's3'], stats, 2, identity)).toHaveLength(2);
        const filled = ids(pickWeaknessQuestions(pool, ['s1'], stats, 5, identity));
        expect(new Set(filled).size).toBe(filled.length);
    });

    it('skips ids that no longer exist in the pool', () => {
        expect(ids(pickWeaknessQuestions(pool, ['gone', 's1'], {}, 5, identity))[0]).toBe('s1');
    });

    it('works with the real question pool', () => {
        const topic = Object.keys(EXAM_TOPICS)[0];
        const wrong = EXAM_QUESTIONS.slice(0, 3).map((question) => question.id);
        const picked = pickWeaknessQuestions(
            EXAM_QUESTIONS,
            wrong,
            { [topic]: { total: 5, correct: 0 } },
            10,
            identity
        );
        expect(picked).toHaveLength(10);
        expect(new Set(ids(picked)).size).toBe(10);
    });
});
