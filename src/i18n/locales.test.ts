import { describe, it, expect } from 'vitest';
import { translations, getLevelDisplayName, Language } from './locales';
import { BUILTIN_LEVELS } from '../engine/levels';
import { BLOCKS_8 } from '../engine/polyominoes';

describe('i18n Locales', () => {
  const languages: Language[] = ['en', 'zh'];

  it('contains all required blocks in translations for both en and zh', () => {
    for (const lang of languages) {
      const t = translations[lang];
      for (const id of Object.keys(BLOCKS_8)) {
        expect(t.blocks[id as keyof typeof t.blocks]).toBeDefined();
        expect(t.blocks[id as keyof typeof t.blocks].length).toBeGreaterThan(0);
      }
    }
  });

  it('contains translations for all 5 difficulty levels', () => {
    const difficulties = ['novice', 'apprentice', 'adept', 'master', 'grandmaster'] as const;
    for (const lang of languages) {
      const t = translations[lang];
      for (const diff of difficulties) {
        expect(t.difficulties[diff]).toBeDefined();
      }
    }
  });

  it('formats level display name appropriately', () => {
    const level1 = BUILTIN_LEVELS[0];
    expect(getLevelDisplayName(level1.id, level1.name, level1.difficulty, 'zh')).toBe(level1.name);
    expect(getLevelDisplayName(level1.id, level1.name, level1.difficulty, 'en')).toBe('Ladder (001)');

    const level25 = BUILTIN_LEVELS[24];
    expect(getLevelDisplayName(level25.id, level25.name, level25.difficulty, 'zh')).toBe(level25.name);
    expect(getLevelDisplayName(level25.id, level25.name, level25.difficulty, 'en')).toBe('Easy 025');
  });

  it('toast message functions execute without error', () => {
    for (const lang of languages) {
      const t = translations[lang];
      expect(t.toasts.removedBlock('Test')).toContain('Test');
      expect(t.toasts.hintToast('Test')).toContain('Test');
      expect(t.toasts.levelSwitched('Easy', 1)).toContain('1');
    }
  });
});
