import type {
  EnhancedMineData,
  ExportOptions,
  CitationData,
  AnalyticsData,
} from "../types/investigative";

export class DataExportService {
  // Export data to CSV format
  static exportToCSV(
    mines: EnhancedMineData[],
    options: ExportOptions,
    analytics?: AnalyticsData
  ): void {
    const headers = [
      "ID",
      "Name",
      "Mineral",
      "Country",
      "Company",
      "Status",
      "Year_Opened",
      "Year_Closed",
      "Latitude",
      "Longitude",
      "Production",
      "Permit_Number",
      "Contamination_Risk",
      "Proximity_To_Water_M",
      "Proximity_To_Schools_M",
      "Proximity_To_Hospitals_M",
      "Environmental_Impact",
      "Community_Impact",
      "Description",
    ];

    // Filter data based on date range if specified
    let filteredMines = mines;
    if (options.dateRange) {
      const [startDate, endDate] = options.dateRange;
      filteredMines = mines.filter((mine) => {
        const mineDate = new Date(mine.year_opened, 0, 1);
        return mineDate >= startDate && mineDate <= endDate;
      });
    }

    // Filter by selected mines if specified
    if (options.selectedMines && options.selectedMines.length > 0) {
      filteredMines = filteredMines.filter((mine) =>
        options.selectedMines!.includes(mine.id)
      );
    }

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...filteredMines.map((mine) =>
        [
          mine.id,
          `"${mine.name}"`,
          `"${mine.mineral}"`,
          `"${mine.country}"`,
          `"${mine.company}"`,
          `"${mine.status}"`,
          mine.year_opened,
          mine.year_closed || "",
          mine.location.lat,
          mine.location.lng,
          `"${mine.production || ""}"`,
          `"${mine.permit_number || ""}"`,
          `"${mine.contamination_risk || ""}"`,
          mine.proximity_to_water || "",
          mine.proximity_to_schools || "",
          mine.proximity_to_hospitals || "",
          `"${mine.environmental_impact || ""}"`,
          `"${mine.community_impact || ""}"`,
          `"${mine.description || ""}"`,
        ].join(",")
      ),
    ].join("\n");

    // Add analytics data if requested
    let finalContent = csvContent;
    if (options.includeAnalytics && analytics) {
      finalContent += "\n\n# Analytics Summary\n";
      finalContent += `Total Mines,${analytics.totalMines}\n`;
      finalContent += `Active Mines,${analytics.activeMines}\n`;
      finalContent += `High Risk Mines,${analytics.highRiskMines}\n`;
      finalContent += `Mines Near Water,${analytics.minesNearWater}\n`;
    }

    // Add citations if requested
    if (options.includeCitations) {
      finalContent += "\n\n# Data Sources and Citations\n";
      finalContent += this.generateCitations();
    }

    // Download the file
    this.downloadFile(
      finalContent,
      `mining_data_${this.getTimestamp()}.csv`,
      "text/csv"
    );
  }

  // Export to GeoJSON format
  static exportToGeoJSON(
    mines: EnhancedMineData[],
    options: ExportOptions
  ): void {
    let filteredMines = mines;

    // Apply filters
    if (options.selectedMines && options.selectedMines.length > 0) {
      filteredMines = filteredMines.filter((mine) =>
        options.selectedMines!.includes(mine.id)
      );
    }

    const geoJsonData = {
      type: "FeatureCollection",
      metadata: {
        title: "Mining Data Export",
        description: "Mining sites data exported for investigative journalism",
        exportDate: new Date().toISOString(),
        totalFeatures: filteredMines.length,
        ...(options.includeCitations && {
          citations: this.getCitationMetadata(),
        }),
      },
      features: filteredMines.map((mine) => ({
        type: "Feature",
        properties: {
          id: mine.id,
          name: mine.name,
          mineral: mine.mineral,
          country: mine.country,
          company: mine.company,
          status: mine.status,
          year_opened: mine.year_opened,
          year_closed: mine.year_closed,
          production: mine.production,
          permit_number: mine.permit_number,
          contamination_risk: mine.contamination_risk,
          proximity_to_water: mine.proximity_to_water,
          proximity_to_schools: mine.proximity_to_schools,
          proximity_to_hospitals: mine.proximity_to_hospitals,
          environmental_impact: mine.environmental_impact,
          community_impact: mine.community_impact,
          description: mine.description,
        },
        geometry: {
          type: "Point",
          coordinates: [mine.location.lng, mine.location.lat],
        },
      })),
    };

    const geoJsonString = JSON.stringify(geoJsonData, null, 2);
    this.downloadFile(
      geoJsonString,
      `mining_data_${this.getTimestamp()}.geojson`,
      "application/geo+json"
    );
  }

  // Generate investigative report
  static generateInvestigativeReport(
    mines: EnhancedMineData[],
    analytics: AnalyticsData,
    options: ExportOptions
  ): void {
    const reportContent = this.createInvestigativeReportContent(
      mines,
      analytics,
      options
    );

    // For now, export as text file (in real implementation, would generate PDF)
    this.downloadFile(
      reportContent,
      `investigative_report_${this.getTimestamp()}.txt`,
      "text/plain"
    );
  }

  // Create investigative report content
  private static createInvestigativeReportContent(
    mines: EnhancedMineData[],
    analytics: AnalyticsData,
    options: ExportOptions
  ): string {
    const timestamp = new Date().toLocaleDateString("th-TH");

    let report = `
รายงานการวิเคราะห์ข้อมูลเหมืองแร่
สำหรับการข่าวเชิงสืบสวน

วันที่จัดทำ: ${timestamp}
จำนวนเหมืองที่วิเคราะห์: ${mines.length}

=== สรุปผลการวิเคราะห์ ===

จำนวนเหมืองทั้งหมด: ${analytics.totalMines}
เหมืองที่เปิดใช้งาน: ${analytics.activeMines} (${Math.round((analytics.activeMines / analytics.totalMines) * 100)}%)
เหมืองที่ปิดแล้ว: ${analytics.closedMines} (${Math.round((analytics.closedMines / analytics.totalMines) * 100)}%)
เหมืองเสี่ยงสูง: ${analytics.highRiskMines} (${Math.round((analytics.highRiskMines / analytics.totalMines) * 100)}%)

=== การกระจายตามประเทศ ===
${Object.entries(analytics.minesByCountry)
  .map(([country, count]) => `${country}: ${count} เหมือง`)
  .join("\n")}

=== การกระจายตามประเภทแร่ ===
${Object.entries(analytics.minesByMineral)
  .sort(([, a], [, b]) => b - a)
  .map(
    ([mineral, count]) =>
      `${mineral}: ${count} เหมือง (${Math.round((count / analytics.totalMines) * 100)}%)`
  )
  .join("\n")}

=== บริษัทที่มีเหมืองมากที่สุด ===
${analytics.companiesWithMostMines
  .slice(0, 10)
  .map(
    (company, index) =>
      `${index + 1}. ${company.company}: ${company.count} เหมือง`
  )
  .join("\n")}

=== การวิเคราะห์ความเสี่ยง ===

เหมืองใกล้แหล่งน้ำ (< 1 กม.): ${analytics.minesNearWater}
เหมืองใกล้โรงเรียน (< 2 กม.): ${analytics.minesNearSchools}

=== รายละเอียดเหมืองเสี่ยงสูง ===
${mines
  .filter(
    (m) => m.contamination_risk === "high" || m.contamination_risk === "severe"
  )
  .map(
    (mine) => `
- ${mine.name}
  บริษัท: ${mine.company}
  ประเทศ: ${mine.country}
  ระดับความเสี่ยง: ${mine.contamination_risk}
  ระยะห่างจากแหล่งน้ำ: ${mine.proximity_to_water ? mine.proximity_to_water + " เมตร" : "ไม่ระบุ"}
  ระยะห่างจากโรงเรียน: ${mine.proximity_to_schools ? mine.proximity_to_schools + " เมตร" : "ไม่ระบุ"}
`
  )
  .join("\n")}

=== คำแนะนำสำหรับการสืบสวน ===

1. ตรวจสอบข้อมูลใบอนุญาต
2. สัมภาษณ์ชุมชนใกล้เคียง
3. วิเคราะห์ข้อมูลสิ่งแวดล้อม
4. ติดตามผลกระทบด้านสุขภาพ
5. ตรวจสอบการดำเนินการตามกฎหมาย

`;

    if (options.includeCitations) {
      report += `
=== แหล่งอ้างอิงและข้อมูลอ้างอิง ===
${this.generateCitations()}
`;
    }

    return report;
  }

  // Generate citations for journalistic use
  private static generateCitations(): string {
    return `
1. ข้อมูลเหมืองแร่ประเทศไทย - กรมทรัพยากรธรณี
   ความน่าเชื่อถือ: สูง
   อัปเดตล่าสุด: ${new Date().toLocaleDateString("th-TH")}

2. ข้อมูลเหมืองแร่เมียนมาร์ - Myanmar Mining Database
   ความน่าเชื่อถือ: ปานกลาง
   แหล่งที่มา: สถาบันวิจัยอิสระ

3. ข้อมูลผลกระทบสิ่งแวดล้อม - องค์กรเฝ้าระวังสิ่งแวดล้อม
   ความน่าเชื่อถือ: สูง
   วิธีการเก็บข้อมูล: การสำรวจภาคสนาม

หมายเหตุ: ข้อมูลเหล่านี้ควรได้รับการตรวจสอบข้ามแหล่ง
และยืนยันจากแหล่งข้อมูลอิสระก่อนนำไปใช้ในการรายงานข่าว
`;
  }

  // Get citation metadata
  private static getCitationMetadata(): CitationData[] {
    return [
      {
        dataSource: "Department of Mineral Resources, Thailand",
        lastUpdated: new Date(),
        methodology: "Official government mining permits database",
        reliability: "high",
        url: "https://www.dmr.go.th",
      },
      {
        dataSource: "Myanmar Mining Watch",
        lastUpdated: new Date(),
        methodology: "Independent research and field surveys",
        reliability: "medium",
      },
      {
        dataSource: "Environmental Impact Assessment Reports",
        lastUpdated: new Date(),
        methodology: "Government and company EIA documents",
        reliability: "high",
      },
    ];
  }

  // Utility function to download file
  private static downloadFile(
    content: string,
    filename: string,
    mimeType: string
  ): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  // Generate timestamp for filenames
  private static getTimestamp(): string {
    return new Date().toISOString().split("T")[0];
  }

  // Export specific mines based on research notes
  static exportResearchFindings(
    mines: EnhancedMineData[],
    selectedMineIds: number[],
    researchNotes?: string
  ): void {
    const selectedMines = mines.filter((mine) =>
      selectedMineIds.includes(mine.id)
    );

    let content = `การวิจัยเฉพาะเจาะจง - เหมืองแร่ที่เลือก

วันที่: ${new Date().toLocaleDateString("th-TH")}
จำนวนเหมืองที่เลือก: ${selectedMines.length}

`;

    if (researchNotes) {
      content += `บันทึกการวิจัย:
${researchNotes}

`;
    }

    content += `รายละเอียดเหมืองที่เลือก:

`;

    selectedMines.forEach((mine, index) => {
      content += `${index + 1}. ${mine.name}
   บริษัท: ${mine.company}
   ประเทศ: ${mine.country}
   แร่: ${mine.mineral}
   สถานะ: ${mine.status}
   เปิดดำเนินการ: ${mine.year_opened}
   ความเสี่ยง: ${mine.contamination_risk || "ไม่ระบุ"}
   ผลกระทบสิ่งแวดล้อม: ${mine.environmental_impact || "ไม่ระบุ"}
   ผลกระทบชุมชน: ${mine.community_impact || "ไม่ระบุ"}
   พิกัด: ${mine.location.lat}, ${mine.location.lng}

`;
    });

    this.downloadFile(
      content,
      `research_findings_${this.getTimestamp()}.txt`,
      "text/plain"
    );
  }

  // Generate summary statistics for quick reference
  static generateQuickStats(mines: EnhancedMineData[]): string {
    const totalMines = mines.length;
    const activeMines = mines.filter((m) => m.status === "active").length;
    const countries = [...new Set(mines.map((m) => m.country))];
    const minerals = [...new Set(mines.map((m) => m.mineral))];
    const companies = [...new Set(mines.map((m) => m.company))];

    return `📊 สถิติด่วน:
🏭 เหมืองทั้งหมด: ${totalMines}
✅ เปิดใช้งาน: ${activeMines} (${Math.round((activeMines / totalMines) * 100)}%)
🌍 ประเทศ: ${countries.length}
⚡ ประเภทแร่: ${minerals.length}
🏢 บริษัท: ${companies.length}`;
  }
}
