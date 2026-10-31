import { describe, it, expect } from 'vitest';
import { TOPICS, TOPIC_LEVELS, TOPIC_CONTENT_IDS, loadTopicContent } from './topicsData';
import { TOPIC_IMAGE_NAMES } from './topicImages';
import { LAB_REGISTRY } from './labRegistry';
import { parseMarkdown, collectImageSources, estimateReadMinutes } from '../utils/markdownEngine';

const registryTabs = new Set(LAB_REGISTRY.flatMap((e) => e.tabs));
const contents = await Promise.all(TOPICS.map(async (t) => [t, await loadTopicContent(t.id)]));

describe('Wissensartikel (topicsData + topics/*.js)', () => {
  it('hat eindeutige IDs, und jede ID hat genau eine Inhaltsdatei', () => {
    const ids = TOPICS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...TOPIC_CONTENT_IDS].sort()).toEqual([...ids].sort());
  });

  it('nutzt nur Stufen, die der Filter kennt', () => {
    for (const t of TOPICS) expect(TOPIC_LEVELS, t.id).toContain(t.difficultyLevel);
  });

  it('liefert für unbekannte IDs null', async () => {
    expect(await loadTopicContent('gibt_es_nicht')).toBeNull();
  });

  for (const [topic, data] of contents) {
    describe(topic.id, () => {
      it('hat Lernziele, Text, mindestens 3 Übungen und 5 Quizfragen', () => {
        expect(data.learningGoals.length).toBeGreaterThanOrEqual(3);
        expect(data.content.length).toBeGreaterThan(3000);
        expect(data.exercises.length).toBeGreaterThanOrEqual(3);
        expect(data.quiz.length).toBeGreaterThanOrEqual(5);
      });

      it('hat gültige Quizfragen', () => {
        for (const q of data.quiz) {
          expect(q.options.length, q.question).toBeGreaterThanOrEqual(3);
          expect(q.correct, q.question).toBeGreaterThanOrEqual(0);
          expect(q.correct, q.question).toBeLessThan(q.options.length);
          expect(new Set(q.options).size, q.question).toBe(q.options.length);
          expect(q.explanation.length, q.question).toBeGreaterThan(20);
        }
      });

      it('hat Übungen mit eindeutiger ID, Aufgabe und Lösung', () => {
        const ids = data.exercises.map((e) => e.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const e of data.exercises) {
          expect(e.id).toMatch(/^[a-z0-9-]+$/);
          expect(e.prompt.length, e.id).toBeGreaterThan(30);
          expect(e.solution.length, e.id).toBeGreaterThan(30);
        }
      });

      it('verweist nur auf vorhandene Abbildungen', () => {
        const images = collectImageSources(parseMarkdown(data.content));
        expect(images.length, 'mindestens eine Abbildung').toBeGreaterThanOrEqual(1);
        for (const src of images) expect(TOPIC_IMAGE_NAMES, src).toContain(src);
      });

      it('verweist nur auf existierende Labs (labRegistry.js)', () => {
        for (const lab of data.relatedLabs || []) {
          expect(registryTabs.has(lab.id), lab.id).toBe(true);
          expect(lab.label.length).toBeGreaterThan(3);
        }
      });

      it('nennt Quellen mit HTTPS-Adresse und Prüfdatum', () => {
        expect(data.sources.length).toBeGreaterThanOrEqual(3);
        for (const s of data.sources) {
          if (s.url) expect(s.url, s.title).toMatch(/^https:\/\//);
        }
        expect(data.sourcesCheckedOn).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
      });

      it('gibt eine Lesezeit an, die zum Umfang passt (±50 %)', () => {
        const all = [data.content, ...data.exercises.map((e) => e.prompt)].join(' ');
        const estimated = estimateReadMinutes(all);
        const stated = Number.parseInt(topic.readTime, 10);
        expect(stated).toBeGreaterThanOrEqual(Math.floor(estimated * 0.5));
        expect(stated).toBeLessThanOrEqual(Math.ceil(estimated * 1.5));
      });

      it('enthält kein rohes LaTeX (die App rendert keins)', () => {
        expect(data.content).not.toMatch(/\$\\|\$\d+\^/);
      });
    });
  }
});
