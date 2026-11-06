import { temporaryOutput } from "../scripts/benchmarks/temporary-output.mjs";
import { dirname } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  existsSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import {
  safePath,
  sameDirectory,
  readExplicit,
  outputDirectory,
} from "../scripts/benchmarks/offline-files.mjs";
import { portable } from "../scripts/benchmarks/public-bundle.mjs";
import { withSymlink } from "./platform-fixture.mjs";

test("native paths preserve traversal, sensitive-component and symlink boundaries", () => {
  const root = mkdtempSync(join(tmpdir(), "mimir-native-path-"));
  try {
    const parent = join(root, "directory with spaces");
    mkdirSync(parent);
    const file = join(parent, "public.json");
    writeFileSync(file, '{"public":true}');
    assert.equal(readExplicit(file), '{"public":true}');
    for (const component of [
      "..",
      ".",
      ".env",
      ".env.local",
      ".aws",
      ".ssh",
      "auth",
      "credentials",
      "secret.pem",
      "a:b",
      "bad\x00name",
    ]) {
      // Concatenate intentionally: join() would erase dot traversal before validation.
      assert.throws(() =>
        safePath(parent + sep + component + sep + "public.json"),
      );
    }
    assert.throws(() => safePath("relative/public.json"));
    assert.throws(() => portable("src\\core\\service.ts"));
    assert.throws(() => portable("src/../README.md"));
    withSymlink(parent, join(root, "redirect"), () => {
      assert.throws(() => readExplicit(join(root, "redirect", "public.json")));
      assert.throws(() =>
        outputDirectory(join(root, "redirect", "out"), "bundle.json", {}),
      );
      assert.equal(existsSync(join(parent, "out")), false);
    });
    assert.throws(() =>
      temporaryOutput(
        join(dirname(tmpdir()), "mimir-temp-sibling", "out"),
        "unused-",
      ),
    );
    const tempOut = temporaryOutput(
      join(parent, "temporary-output"),
      "unused-",
    );
    assert.equal(tempOut, join(parent, "temporary-output"));
    assert.throws(() => temporaryOutput(tempOut, "unused-"));
    const out = join(parent, "new-output");
    outputDirectory(out, "bundle.json", { public: true });
    assert.throws(() => outputDirectory(out, "bundle.json", {}));
    assert.deepEqual(JSON.parse(readExplicit(join(out, "bundle.json"))), {
      public: true,
    });
    if (process.platform === "win32") {
      for (const path of [
        "C:relative",
        "\\\\server\\share\\file",
        "\\\\?\\C:\\file",
        parent + "\\..\\public.json",
      ])
        assert.throws(() => safePath(path));
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("directory identity preserves exact scope and validates both spellings", () => {
  const root = mkdtempSync(join(tmpdir(), "mimir-directory-identity-"));
  try {
    const a = join(root, "repo");
    const b = join(root, "repo-other");
    mkdirSync(a);
    mkdirSync(b);
    assert.equal(sameDirectory(a, a), true);
    assert.equal(sameDirectory(a, b), false);
    assert.equal(sameDirectory(a, root), false);
    for (const component of ["..", ".", ".env", "credentials", "secret.pem"]) {
      const unsafe = a + sep + component;
      assert.throws(() => sameDirectory(a, unsafe));
      assert.throws(() => sameDirectory(unsafe, a));
    }
    if (process.platform === "win32") {
      const junction = join(root, "junction");
      symlinkSync(a, junction, "junction");
      assert.throws(() => sameDirectory(a, junction));
      assert.throws(() => sameDirectory(junction, a));
    }
    const file = join(root, "public.json");
    writeFileSync(file, "{}");
    assert.equal(sameDirectory(file, file), false);
    withSymlink(a, join(root, "redirect"), () => {
      assert.throws(() => sameDirectory(a, join(root, "redirect")));
      assert.throws(() => sameDirectory(join(root, "redirect"), a));
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
