import { jest } from "@jest/globals";

const readFileMock =
  jest.fn<(filePath: string, encoding: string) => Promise<string>>();

jest.unstable_mockModule("node:fs/promises", () => ({
  default: {
    readFile: readFileMock,
  },
}));

const databaseService = await import("./database.service.js");

describe("database.service", () => {
  beforeEach(() => {
    readFileMock.mockReset();
  });

  it("preloads and parses all three YAML databases", async () => {
    readFileMock
      .mockResolvedValueOnce(
        "Header:\n  Type: ITEM_DB\n  Version: 3\nBody:\n  - Id: 1\n    Name: ITEM_DB",
      )
      .mockResolvedValueOnce(
        "Header:\n  Type: MOB_DB\n  Version: 2\nBody:\n  - Id: 2\n    Name: MOB_DB\n    Modes:\n      Mvp: true",
      )
      .mockResolvedValueOnce(
        "Header:\n  Type: SKILL_DB\n  Version: 1\nBody:\n  - Id: 3\n    Name: SKILL_DB\n    Description: SKILL_DESCRIPTION",
      );

    await databaseService.preloadDatabases();

    expect(readFileMock).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(/[\\/]yaml[\\/]item_db\.yml$/),
      "utf8",
    );
    expect(readFileMock).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(/[\\/]yaml[\\/]mob_db\.yml$/),
      "utf8",
    );
    expect(readFileMock).toHaveBeenNthCalledWith(
      3,
      expect.stringMatching(/[\\/]yaml[\\/]skill_db\.yml$/),
      "utf8",
    );
    expect(databaseService.getItemDB()).toEqual({
      Header: { Type: "ITEM_DB", Version: 3 },
      Body: [{ Id: 1, Name: "ITEM_DB" }],
    });
    expect(databaseService.getMobDB()).toEqual({
      Header: { Type: "MOB_DB", Version: 2 },
      Body: [{ Id: 2, Name: "MOB_DB", Modes: { Mvp: true } }],
    });
    expect(databaseService.getSkillDB()).toEqual({
      Header: { Type: "SKILL_DB", Version: 1 },
      Body: [{ Id: 3, Name: "SKILL_DB", Description: "SKILL_DESCRIPTION" }],
    });
  });

  it("rejects when a YAML database cannot be read", async () => {
    const error = new Error("Database file missing");
    readFileMock.mockRejectedValueOnce(error);
    readFileMock.mockResolvedValue("");

    await expect(databaseService.preloadDatabases()).rejects.toBe(error);
  });

  it("enriches nested replay IDs with database names", () => {
    expect(
      databaseService.enrichOutput({
        skillId: "3",
        itemId: 1,
        jobId: "1",
        monsterId: "2",
        maxDamageMonsterId: "2",
        nested: [{ skillId: "unknown" }, { monsterId: "unknown" }],
      }),
    ).toEqual({
      skillId: "3",
      skillName: "SKILL_DESCRIPTION",
      itemId: 1,
      itemName: "ITEM_DB",
      jobId: "1",
      jobName: "Swordman",
      monsterId: "2",
      monsterName: "MOB_DB",
      isMvp: true,
      maxDamageMonsterId: "2",
      maxDamageMonsterName: "MOB_DB",
      maxDamageMonsterIsMvp: true,
      nested: [
        { skillId: "unknown", skillName: "" },
        { monsterId: "unknown", monsterName: "", isMvp: false },
      ],
    });
  });

  it("uses an empty job name when a job ID is unknown", () => {
    expect(databaseService.enrichOutput({ jobId: 999999 })).toEqual({
      jobId: 999999,
      jobName: "",
    });
  });
});
