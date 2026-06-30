import datetime
import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_pdf_report(filename: str, profile: dict, insights: dict, forecast: dict = None, output_path: str = None):
    """
    Creates a highly polished business intelligence report in PDF format.
    """
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40
    )
    
    # Custom color palette
    primary_color = colors.HexColor("#1E1B4B")  # Deep Indigo
    accent_color = colors.HexColor("#4F46E5")   # Violet Accent
    text_color = colors.HexColor("#334155")     # Slate Gray
    bg_light = colors.HexColor("#F8FAFC")       # Off-white
    border_color = colors.HexColor("#E2E8F0")   # Light gray
    
    styles = getSampleStyleSheet()
    
    # Custom typography styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=primary_color,
        alignment=0 # Left aligned
    )
    
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=16,
        textColor=accent_color,
        spaceAfter=15
    )
    
    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=primary_color,
        spaceBefore=15,
        spaceAfter=10,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'ReportBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10.5,
        leading=14.5,
        textColor=text_color,
        spaceAfter=8
    )
    
    bullet_style = ParagraphStyle(
        'ReportBullet',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=6
    )

    story = []
    
    # --- PAGE 1: COVER ---
    story.append(Spacer(1, 30))
    story.append(Paragraph("Lakshmi Steels AI", subtitle_style))
    story.append(Paragraph("AUTOMATED BUSINESS INTELLIGENCE REPORT", title_style))
    story.append(Spacer(1, 8))
    
    # Horizontal line
    line_table = Table([[""]], colWidths=[532])
    line_table.setStyle(TableStyle([
        ('LINEBELOW', (0,0), (-1,-1), 3, accent_color),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(line_table)
    story.append(Spacer(1, 20))
    
    # Date & Filename Details
    meta_data = [
        [Paragraph("<b>Source File:</b>", body_style), Paragraph(filename, body_style)],
        [Paragraph("<b>Generated:</b>", body_style), Paragraph(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"), body_style)],
        [Paragraph("<b>Data Quality Score:</b>", body_style), Paragraph(f"{profile['data_quality_score']}/100", body_style)],
    ]
    meta_table = Table(meta_data, colWidths=[120, 412])
    meta_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 30))
    
    # Cover page KPI Grid (Revenue/Row Count representation)
    kpi_data = [
        [
            Paragraph(f"<font color='white'><b>{profile['total_rows']:,}</b><br/>Total Rows</font>", body_style),
            Paragraph(f"<font color='white'><b>{profile['total_columns']}</b><br/>Columns</font>", body_style),
            Paragraph(f"<font color='white'><b>{profile['duplicate_rows']}</b><br/>Duplicates</font>", body_style)
        ]
    ]
    kpi_table = Table(kpi_data, colWidths=[177, 177, 177])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), primary_color),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 15),
        ('BOTTOMPADDING', (0,0), (-1,-1), 15),
        ('INNERGRID', (0,0), (-1,-1), 1, colors.HexColor("#312E81")),
    ]))
    story.append(kpi_table)
    story.append(Spacer(1, 30))
    
    # --- EXECUTIVE SUMMARY ---
    story.append(Paragraph("Executive Summary", h1_style))
    summary_text = insights.get("executive_summary", "This report contains statistical summaries and insights automatically compiled from the uploaded dataset.")
    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 20))
    
    # --- KEY INSIGHTS & RECOMMENDATIONS ---
    story.append(Paragraph("Key Insights & Trends", h1_style))
    for insight in insights.get("key_insights", []):
        story.append(Paragraph(f"• {insight}", bullet_style))
    story.append(Spacer(1, 25))
    
    story.append(PageBreak())
    
    # --- PAGE 2: SCHEMA & PROFILE ---
    story.append(Paragraph("Dataset Column Schema & Quality Profile", h1_style))
    story.append(Paragraph("Detailed mapping of the dataset columns, data types, completeness, and outlier rates:", body_style))
    story.append(Spacer(1, 10))
    
    # Table headers
    headers = [
        Paragraph("<b>Column Name</b>", body_style),
        Paragraph("<b>Type</b>", body_style),
        Paragraph("<b>Missing %</b>", body_style),
        Paragraph("<b>Outliers</b>", body_style),
        Paragraph("<b>Unique Count</b>", body_style)
    ]
    
    table_rows = [headers]
    for col in profile.get("columns", []):
        table_rows.append([
            Paragraph(col["name"], body_style),
            Paragraph(col["type"], body_style),
            Paragraph(f"{col['null_percentage']:.1f}%", body_style),
            Paragraph(str(col["outlier_count"]), body_style),
            Paragraph(str(col["unique_count"]), body_style),
        ])
        
    schema_table = Table(table_rows, colWidths=[172, 90, 90, 90, 90])
    schema_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), bg_light),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, border_color),
        ('LINEBELOW', (0,0), (-1,0), 1.5, primary_color),
    ]))
    story.append(schema_table)
    story.append(Spacer(1, 20))
    
    # --- ANOMALIES SECTION ---
    anoms = insights.get("anomalies", [])
    if anoms:
        story.append(Paragraph("Data Anomalies & Action Recommendations", h1_style))
        for anom in anoms:
            story.append(Paragraph(f"<font color='#B91C1C'><b>!</b></font> {anom}", bullet_style))
        story.append(Spacer(1, 20))
        
    # --- FORECAST SECTION ---
    if forecast and "error" not in forecast:
        story.append(Paragraph(f"Predictive Analytics: {forecast['target_column']} Forecast", h1_style))
        metrics = forecast.get("metrics", {})
        forecast_intro = (
            f"Using an automated predictive regression model (R-squared: {metrics.get('r2', 0):.2f}, "
            f"historical standard deviation: {metrics.get('std_error', 0):.2f}), the system calculated the following "
            f"trend outlook over the next {len(forecast['forecast'])} periods:"
        )
        story.append(Paragraph(forecast_intro, body_style))
        story.append(Spacer(1, 10))
        
        # Forecast columns
        f_headers = [
            Paragraph("<b>Future Period</b>", body_style),
            Paragraph("<b>Predicted Value</b>", body_style),
            Paragraph("<b>Lower Bound (95%)</b>", body_style),
            Paragraph("<b>Upper Bound (95%)</b>", body_style)
        ]
        f_rows = [f_headers]
        for f_point in forecast.get("forecast", [])[:6]:  # Show top 6 forecasted steps
            f_rows.append([
                Paragraph(f_point["date"], body_style),
                Paragraph(f"{f_point['value']:.2f}", body_style),
                Paragraph(f"{f_point['lower']:.2f}", body_style),
                Paragraph(f"{f_point['upper']:.2f}", body_style)
            ])
            
        f_table = Table(f_rows, colWidths=[133, 133, 133, 133])
        f_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), bg_light),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('LINEBELOW', (0,0), (-1,-1), 0.5, border_color),
            ('LINEBELOW', (0,0), (-1,0), 1.5, primary_color),
        ]))
        story.append(f_table)
        
    doc.build(story)

def generate_excel_export(df: pd.DataFrame, output_path: str):
    """
    Exports a styled spreadsheet containing the clean DataFrame.
    """
    writer = pd.ExcelWriter(output_path, engine='xlsxwriter')
    df.to_excel(writer, index=False, sheet_name='CleanedData')
    
    workbook = writer.book
    worksheet = writer.sheets['CleanedData']
    
    # Theme settings
    header_format = workbook.add_format({
        'bold': True,
        'text_wrap': True,
        'valign': 'top',
        'fg_color': '#1E1B4B',
        'font_color': '#FFFFFF',
        'border': 1
    })
    
    # Write the headers manually with format
    for col_num, value in enumerate(df.columns.values):
        worksheet.write(0, col_num, value, header_format)
        
    # Auto-fit column widths
    for i, col in enumerate(df.columns):
      series = df[col]
      max_len = max([len(str(val)) for val in series.dropna()] + [len(str(col))]) + 3
      worksheet.set_column(i, i, min(50, max_len))
        
    writer.close()
