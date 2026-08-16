import { DeliberationResult } from './types.js';

export interface CriterionDiff {
  criterion: string;
  scoreA: number;
  scoreB: number;
  delta: number;
  rationaleA: string;
  rationaleB: string;
}

export interface BlueprintDiffResult {
  titleA: string;
  titleB: string;
  overallScoreA: number;
  overallScoreB: number;
  overallScoreDelta: number;
  criteriaDiffs: CriterionDiff[];
  invariantsAdded: string[];
  invariantsRemoved: string[];
  invariantsRetained: string[];
  summary: string;
}

export class BlueprintDiffer {
  /**
   * Semantically compares two deliberation blueprints and calculates score/invariant deltas
   */
  static diff(a: DeliberationResult, b: DeliberationResult): BlueprintDiffResult {
    const bpA = a.blueprint;
    const bpB = b.blueprint;

    const winA = bpA.winningArchitecture;
    const winB = bpB.winningArchitecture;

    const scoreDelta = parseFloat((winB.overallScore - winA.overallScore).toFixed(1));

    const mapA = new Map(winA.scores?.map((s) => [s.criterion, s]) || []);
    const mapB = new Map(winB.scores?.map((s) => [s.criterion, s]) || []);

    const allCriteria = Array.from(new Set([...mapA.keys(), ...mapB.keys()]));
    const criteriaDiffs: CriterionDiff[] = allCriteria.map((crit) => {
      const itemA = mapA.get(crit) || { score: 0, rationale: 'N/A' };
      const itemB = mapB.get(crit) || { score: 0, rationale: 'N/A' };
      return {
        criterion: crit,
        scoreA: itemA.score,
        scoreB: itemB.score,
        delta: parseFloat((itemB.score - itemA.score).toFixed(1)),
        rationaleA: itemA.rationale,
        rationaleB: itemB.rationale,
      };
    });

    const setA = new Set(bpA.coreInvariants || []);
    const setB = new Set(bpB.coreInvariants || []);

    const invariantsAdded = Array.from(setB).filter((x) => !setA.has(x));
    const invariantsRemoved = Array.from(setA).filter((x) => !setB.has(x));
    const invariantsRetained = Array.from(setA).filter((x) => setB.has(x));

    let summary = `Architecture evolution from "${winA.title}" to "${winB.title}": `;
    if (scoreDelta > 0) {
      summary += `Overall Pareto score increased by +${scoreDelta} points. `;
    } else if (scoreDelta < 0) {
      summary += `Overall Pareto score decreased by ${scoreDelta} points. `;
    } else {
      summary += `Overall Pareto score remained balanced at ${winA.overallScore}/10. `;
    }
    summary += `Added ${invariantsAdded.length} new invariant(s), removed ${invariantsRemoved.length}.`;

    return {
      titleA: bpA.title,
      titleB: bpB.title,
      overallScoreA: winA.overallScore,
      overallScoreB: winB.overallScore,
      overallScoreDelta: scoreDelta,
      criteriaDiffs,
      invariantsAdded,
      invariantsRemoved,
      invariantsRetained,
      summary,
    };
  }
}
