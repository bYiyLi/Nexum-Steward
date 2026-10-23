import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { resolve, dirname, relative, isAbsolute } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('manifest 是有效的最小插件声明', () => {
  const manifest = JSON.parse(read('.codex-plugin/plugin.json'));
  assert.equal(manifest.name, 'nexum-steward');
  assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
  assert.ok(manifest.description?.trim());
  assert.equal(manifest.skills, './skills/');
  assert.equal(manifest.interface?.displayName, 'Nexum Steward');

  for (const field of ['skills', 'mcpServers', 'apps']) {
    if (manifest[field] === undefined) continue;
    const raw = manifest[field];
    assert.match(raw, /^\.\/[^.]/, field);
    const absolute = resolve(root, raw);
    const rel = relative(root, absolute);
    assert.ok(!isAbsolute(rel) && rel !== '..' && !rel.startsWith('../'), field);
    assert.ok(existsSync(absolute), field);
  }
});

test('Skill 名称、触发说明与核心约束存在', () => {
  const skill = read('skills/nexum-steward/SKILL.md');
  const frontmatter = skill.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(frontmatter, 'missing Skill YAML frontmatter');
  assert.match(frontmatter[1], /^name: nexum-steward$/m);
  assert.match(frontmatter[1], /^description: .{30,}$/m);
  for (const token of ['project.list', 'project.open', 'process.exec', 'Docker Compose', 'Agent ID', '授权']) {
    assert.ok(skill.includes(token), 'Skill missing ' + token);
  }
  assert.ok(skill.length > frontmatter[0].length + 100);
});

test('工程真源与 ChatGPT Project 指令源存在', () => {
  for (const path of [
    'README.md',
    'AGENTS.md',
    'docs/requirements.md',
    'docs/design.md',
    'docs/development/01-initialization.md',
    'docs/chatgpt-project.md'
  ]) {
    assert.ok(read(path).trim(), path + ' is empty');
  }
  assert.match(read('docs/chatgpt-project.md'), /Nexum Steward/);
});
