import { describe, expect, it } from "vitest";

import { STACK_GROUP_IDS } from "../types";
import { stackEn } from "./en";
import { stackEs } from "./es";
import { stackFacts } from "./facts";

describe("stack facts", () => {
  it("RAM-AC01: holds the eight groups in order with their technologies", () => {
    expect(stackFacts.groups.map((group) => group.id)).toEqual([...STACK_GROUP_IDS]);
    expect(stackFacts.groups.map((group) => group.items.length)).toEqual([
      5, 6, 4, 7, 10, 10, 6, 9,
    ]);
    expect(stackFacts.groups[0].items).toEqual(["Python", "Java", "TypeScript", "SQL", "Dart"]);
    expect(stackFacts.groups[1].items).toEqual([
      "Next.js",
      "React",
      "Angular",
      "Flutter",
      "Tailwind CSS",
      "Swing",
    ]);
    expect(stackFacts.groups[2].items).toEqual(["FastAPI", "Spring", "Django", "Flask"]);
    expect(stackFacts.groups[3].items).toEqual([
      "Cloud Run",
      "Compute Engine",
      "Cloud SQL",
      "Cloud Storage",
      "IAM",
      "Artifact Registry",
      "BigQuery",
    ]);
    expect(stackFacts.groups[4].items).toEqual([
      "EC2",
      "ECS/Fargate",
      "Elastic Beanstalk",
      "S3",
      "RDS/Aurora",
      "ELB",
      "Secrets Manager",
      "CloudWatch",
      "CodeBuild",
      "CodePipeline",
    ]);
    expect(stackFacts.groups[5].items).toEqual([
      "Git",
      "GitHub Actions",
      "CI/CD",
      "Docker",
      "Docker Compose",
      "Linux",
      "Nginx",
      "Jenkins",
      "SonarQube",
      "SSH",
    ]);
    expect(stackFacts.groups[6].items).toEqual([
      "PostgreSQL",
      "MySQL",
      "MongoDB",
      "pandas",
      "scikit-learn",
      "Keras",
    ]);
    expect(stackFacts.groups[7].items).toEqual([
      "AES",
      "RSA",
      "TLS",
      "JWT",
      "Argon2id",
      "HMAC",
      "ZKP/LWE",
      "Kyber",
      "ECDSA",
    ]);
  });

  it("RAM-AC02: repeats no technology within a group or between groups", () => {
    const items = stackFacts.groups.flatMap((group): readonly string[] => group.items);
    expect(items).toHaveLength(57);
    expect(new Set(items).size).toBe(57);
  });
});

describe("stack texts", () => {
  it("RAM-AC03: each language has a title per group, two notes and nine methods", () => {
    for (const text of [stackEs, stackEn]) {
      expect(Object.keys(text.groups)).toEqual([...STACK_GROUP_IDS]);
      const withNote = Object.entries(text.groups)
        .filter(([, group]) => "note" in group)
        .map(([id]) => id);
      expect(withNote).toEqual(["backend", "data"]);
      expect(text.methods).toHaveLength(9);
    }
  });

  it("RAM-AC03: uses the section and hardware names of VSN §4", () => {
    expect([stackEs.meta.title, stackEs.meta.hardwareName]).toEqual([
      "Stack tecnológico",
      "Memoria RAM",
    ]);
    expect([stackEn.meta.title, stackEn.meta.hardwareName]).toEqual(["Tech stack", "RAM"]);
  });
});
