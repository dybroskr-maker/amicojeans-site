#!/usr/bin/env node
// AMILOOM 게이트 — 의존성 없는 정적 검사
// ① 인라인 <script> 문법  ② 내부 링크 존재  ③ 금지 문구
// 실패하면 종료코드 1. 판정당 증거 1개만 출력한다.

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdtempSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const fails = [];

// 금지 문구 — 대표 확정 사항·표기 규칙 위반을 병합 전에 잡는다.
const BANNED = [
  ['구파발', '사무실 소재지가 아니다 — 경기 고양시 덕양구'],
  ['DIY Bros', '회사명 오표기'],
  ['DYLOOM', '다른 저장소의 자동화 명칭 — 이 저장소는 AMILOOM'],
];

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const p = join(dir, e.name);
    e.isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}

const files = walk(ROOT);
const htmls = files.filter((f) => f.endsWith('.html'));
const texts = files.filter((f) => /\.(html|md|ya?ml|mjs|js|json)$/.test(f));

// ① 인라인 스크립트 문법
const tmp = mkdtempSync(join(tmpdir(), 'gate-'));
for (const f of htmls) {
  const src = readFileSync(f, 'utf8');
  const blocks = [...src.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
  blocks.forEach((m, i) => {
    const code = m[1];
    if (!code.trim()) return;
    const p = join(tmp, `${f.replace(/[^a-z0-9]/gi, '_')}_${i}.mjs`);
    writeFileSync(p, code);
    try {
      execFileSync(process.execPath, ['--check', p], { stdio: 'pipe' });
    } catch (e) {
      fails.push(`문법 오류: ${f} 의 ${i + 1}번째 <script>\n${String(e.stderr || e).slice(0, 400)}`);
    }
  });
}

// ② 내부 링크 존재
for (const f of htmls) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(/(?:href|src)="(\.\/[^"#?]+)"/g)) {
    const target = resolve(dirname(f), m[1]);
    if (!existsSync(target) && !existsSync(join(target, 'index.html'))) {
      fails.push(`깨진 링크: ${f} → ${m[1]}`);
    }
  }
}

// ③ 금지 문구 (이 스크립트 자신과 배치 지시 문서는 제외)
const SKIP = /scripts\/gate\.mjs$|docs\/코드세션_배치지시|docs\/전체구성_셋업절차/;
for (const f of texts) {
  if (SKIP.test(f)) continue;
  const src = readFileSync(f, 'utf8');
  for (const [word, why] of BANNED) {
    if (src.includes(word)) fails.push(`금지 문구 "${word}" — ${f} (${why})`);
  }
}

if (fails.length) {
  console.error('❌ 게이트 실패\n' + fails.map((x) => ' · ' + x).join('\n'));
  process.exit(1);
}
console.log(`✅ 게이트 통과 — HTML ${htmls.length}개 검사`);
