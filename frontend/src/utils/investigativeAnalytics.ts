import type {
  EnhancedMineData,
  AnalyticsData,
  CrossBorderAnalysis,
} from "../types/investigative";

export class InvestigativeAnalytics {
  // Generate comprehensive analytics for all mines
  static generateAnalytics(mines: EnhancedMineData[]): AnalyticsData {
    const totalMines = mines.length;
    const activeMines = mines.filter((m) => m.status === "active").length;
    const closedMines = mines.filter((m) => m.status === "closed").length;
    const suspendedMines = mines.filter((m) => m.status === "suspended").length;

    // Mines by mineral type
    const minesByMineral = mines.reduce(
      (acc, mine) => {
        acc[mine.mineral] = (acc[mine.mineral] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Mines by country
    const minesByCountry = mines.reduce(
      (acc, mine) => {
        acc[mine.country] = (acc[mine.country] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Mines by decade
    const minesByDecade = mines.reduce(
      (acc, mine) => {
        const decade = Math.floor(mine.year_opened / 10) * 10;
        const decadeLabel = `${decade}s`;
        acc[decadeLabel] = (acc[decadeLabel] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Companies with most mines
    const companyCounts = mines.reduce(
      (acc, mine) => {
        acc[mine.company] = (acc[mine.company] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const companiesWithMostMines = Object.entries(companyCounts)
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Risk analysis
    const highRiskMines = mines.filter(
      (m) =>
        m.contamination_risk === "high" || m.contamination_risk === "severe"
    ).length;

    const minesNearWater = mines.filter(
      (m) => m.proximity_to_water !== undefined && m.proximity_to_water < 1000
    ).length;

    const minesNearSchools = mines.filter(
      (m) =>
        m.proximity_to_schools !== undefined && m.proximity_to_schools < 2000
    ).length;

    // Timeline data for trend analysis
    const timelineData = this.generateTimelineData(mines);

    return {
      totalMines,
      activeMines,
      closedMines,
      suspendedMines,
      minesByMineral,
      minesByCountry,
      minesByDecade,
      companiesWithMostMines,
      highRiskMines,
      minesNearWater,
      minesNearSchools,
      timelineData,
    };
  }

  // Generate timeline data showing mine openings and closures over time
  static generateTimelineData(mines: EnhancedMineData[]): Array<{
    year: number;
    opened: number;
    closed: number;
    cumulative: number;
  }> {
    const years = new Set<number>();

    mines.forEach((mine) => {
      years.add(mine.year_opened);
      if (mine.year_closed) {
        years.add(mine.year_closed);
      }
    });

    const sortedYears = Array.from(years).sort();
    const timeline = [];
    let cumulative = 0;

    for (const year of sortedYears) {
      const opened = mines.filter((m) => m.year_opened === year).length;
      const closed = mines.filter((m) => m.year_closed === year).length;

      cumulative += opened - closed;

      timeline.push({
        year,
        opened,
        closed,
        cumulative: Math.max(0, cumulative),
      });
    }

    return timeline;
  }

  // Analyze cross-border mining patterns
  static analyzeCrossBorderPatterns(
    mines: EnhancedMineData[]
  ): CrossBorderAnalysis {
    // Identify mines near borders (within 50km)
    const borderMines = mines.filter((mine) => {
      // Simplified logic - in real implementation, this would use actual border data
      const { lat, lng } = mine.location;

      // Check proximity to Thailand-Myanmar border (rough approximation)
      const nearMyanmarBorder = lng < 99.5 && lat > 15.5 && lat < 20.5;

      // Check proximity to Thailand-Laos border (rough approximation)
      const nearLaosBorder = lng > 101.5 && lat > 15.0 && lat < 18.0;

      return nearMyanmarBorder || nearLaosBorder;
    });

    // Identify transboundary risks
    const transboundaryRisks = borderMines
      .filter(
        (mine) =>
          mine.contamination_risk === "high" ||
          mine.contamination_risk === "severe"
      )
      .map((mine) => ({
        mineId: mine.id,
        riskType: "water_contamination",
        affectedCountries: this.getAffectedCountries(mine),
        description: `High-risk mine ${mine.name} may affect cross-border water sources`,
      }));

    // Identify shared water sources
    const sharedWaterSources = this.identifySharedWaterSources(borderMines);

    return {
      borderMines,
      transboundaryRisks,
      sharedWaterSources,
    };
  }

  // Helper function to determine affected countries
  private static getAffectedCountries(mine: EnhancedMineData): string[] {
    const { lat, lng } = mine.location;
    const countries = [mine.country];

    // Add neighboring countries based on proximity (simplified logic)
    if (lng < 99.5 && lat > 15.5) {
      countries.push("myanmar");
    }
    if (lng > 101.5 && lat > 15.0) {
      countries.push("laos");
    }

    return [...new Set(countries)];
  }

  // Identify shared water sources that could be affected by multiple mines
  private static identifySharedWaterSources(mines: EnhancedMineData[]): Array<{
    waterSourceName: string;
    affectedMines: number[];
    countries: string[];
  }> {
    // Simplified implementation - in real app, this would use actual watershed data
    const waterSources = [
      {
        waterSourceName: "Mekong River Basin",
        affectedMines: mines
          .filter((m) => m.location.lng > 99.0 && m.location.lng < 105.0)
          .map((m) => m.id),
        countries: ["thailand", "laos", "myanmar"],
      },
      {
        waterSourceName: "Salween River Basin",
        affectedMines: mines
          .filter((m) => m.location.lng < 99.0 && m.location.lat > 16.0)
          .map((m) => m.id),
        countries: ["thailand", "myanmar"],
      },
    ];

    return waterSources.filter((ws) => ws.affectedMines.length > 0);
  }

  // Calculate proximity-based risks
  static calculateProximityRisks(mine: EnhancedMineData): {
    waterRisk: "low" | "medium" | "high";
    communityRisk: "low" | "medium" | "high";
    overallRisk: "low" | "medium" | "high";
  } {
    let waterRisk: "low" | "medium" | "high" = "low";
    let communityRisk: "low" | "medium" | "high" = "low";

    // Water proximity risk
    if (mine.proximity_to_water !== undefined) {
      if (mine.proximity_to_water < 500) waterRisk = "high";
      else if (mine.proximity_to_water < 1500) waterRisk = "medium";
    }

    // Community proximity risk
    if (
      mine.proximity_to_schools !== undefined ||
      mine.proximity_to_hospitals !== undefined
    ) {
      const minSchoolDistance = mine.proximity_to_schools || Infinity;
      const minHospitalDistance = mine.proximity_to_hospitals || Infinity;
      const minCommunityDistance = Math.min(
        minSchoolDistance,
        minHospitalDistance
      );

      if (minCommunityDistance < 1000) communityRisk = "high";
      else if (minCommunityDistance < 3000) communityRisk = "medium";
    }

    // Overall risk assessment
    const riskScores = { low: 1, medium: 2, high: 3 };
    const avgScore = (riskScores[waterRisk] + riskScores[communityRisk]) / 2;

    let overallRisk: "low" | "medium" | "high" = "low";
    if (avgScore >= 2.5) overallRisk = "high";
    else if (avgScore >= 1.5) overallRisk = "medium";

    return { waterRisk, communityRisk, overallRisk };
  }

  // Advanced search functionality with boolean operators
  static performAdvancedSearch(
    mines: EnhancedMineData[],
    query: string
  ): EnhancedMineData[] {
    if (!query.trim()) return mines;

    // Parse boolean operators (simplified implementation)
    const terms = query.toLowerCase().split(/\s+(?:and|or)\s+/);
    const operators = query.toLowerCase().match(/\s+(and|or)\s+/g) || [];

    return mines.filter((mine) => {
      const searchableText = [
        mine.name,
        mine.company,
        mine.mineral,
        mine.country,
        mine.description || "",
        mine.permit_number || "",
      ]
        .join(" ")
        .toLowerCase();

      // Simple boolean logic implementation
      let result = searchableText.includes(terms[0]);

      for (let i = 0; i < operators.length && i + 1 < terms.length; i++) {
        const operator = operators[i].trim();
        const termMatch = searchableText.includes(terms[i + 1]);

        if (operator === "and") {
          result = result && termMatch;
        } else if (operator === "or") {
          result = result || termMatch;
        }
      }

      return result;
    });
  }

  // Generate temporal trend analysis
  static generateTrendAnalysis(
    mines: EnhancedMineData[],
    startYear: number,
    endYear: number
  ): {
    openingTrend: Array<{ year: number; count: number }>;
    closingTrend: Array<{ year: number; count: number }>;
    netChange: Array<{ year: number; net: number }>;
    mineralTrends: Record<string, Array<{ year: number; count: number }>>;
  } {
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }

    const openingTrend = years.map((year) => ({
      year,
      count: mines.filter((m) => m.year_opened === year).length,
    }));

    const closingTrend = years.map((year) => ({
      year,
      count: mines.filter((m) => m.year_closed === year).length,
    }));

    const netChange = years.map((year) => {
      const opened = mines.filter((m) => m.year_opened === year).length;
      const closed = mines.filter((m) => m.year_closed === year).length;
      return { year, net: opened - closed };
    });

    // Mineral-specific trends
    const minerals = [...new Set(mines.map((m) => m.mineral))];
    const mineralTrends: Record<
      string,
      Array<{ year: number; count: number }>
    > = {};

    minerals.forEach((mineral) => {
      mineralTrends[mineral] = years.map((year) => ({
        year,
        count: mines.filter(
          (m) => m.mineral === mineral && m.year_opened === year
        ).length,
      }));
    });

    return {
      openingTrend,
      closingTrend,
      netChange,
      mineralTrends,
    };
  }
}
