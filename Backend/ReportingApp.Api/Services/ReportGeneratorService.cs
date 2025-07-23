using OfficeOpenXml;
using OfficeOpenXml.Drawing.Chart;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using ReportingApp.Api.Models;

namespace ReportingApp.Api.Services
{
    public class ReportGeneratorService
    {
        private readonly ILogger<ReportGeneratorService> _logger;

        public ReportGeneratorService(ILogger<ReportGeneratorService> logger)
        {
            _logger = logger;
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        }

        public byte[] GenerateExcelReport(ReportRequest request)
        {
            try
            {
                using var package = new ExcelPackage();
                var worksheet = package.Workbook.Worksheets.Add(request.Configuration.Title ?? "Report");

                // Style the header
                worksheet.Row(1).Height = 25;
                worksheet.Row(1).Style.Font.Bold = true;
                worksheet.Row(1).Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                worksheet.Row(1).Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightBlue);

                // Add headers
                var colIndex = 1;
                foreach (var field in request.SelectedFields)
                {
                    var displayName = request.Configuration.FieldMappings?.ContainsKey(field) == true 
                        ? request.Configuration.FieldMappings[field] 
                        : field;
                    
                    worksheet.Cells[1, colIndex].Value = displayName;
                    colIndex++;
                }

                // Add data
                var rowIndex = 2;
                foreach (var row in request.Data)
                {
                    colIndex = 1;
                    foreach (var field in request.SelectedFields)
                    {
                        if (row.ContainsKey(field))
                        {
                            var value = row[field]?.ToString();
                            worksheet.Cells[rowIndex, colIndex].Value = value;
                            
                            // Try to parse as number for proper Excel formatting
                            if (double.TryParse(value, out double numValue))
                            {
                                worksheet.Cells[rowIndex, colIndex].Value = numValue;
                            }
                        }
                        colIndex++;
                    }
                    rowIndex++;
                }

                // Auto-fit columns
                worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

                // Add charts if configured
                if (request.Configuration.Charts?.Any() == true)
                {
                    var chartRow = rowIndex + 2;
                    foreach (var chartConfig in request.Configuration.Charts)
                    {
                        AddExcelChart(worksheet, chartConfig, request, chartRow);
                        chartRow += 15; // Space between charts
                    }
                }

                return package.GetAsByteArray();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating Excel report");
                throw;
            }
        }

        private void AddExcelChart(ExcelWorksheet worksheet, ChartConfiguration chartConfig, 
            ReportRequest request, int startRow)
        {
            var xIndex = request.SelectedFields.IndexOf(chartConfig.XAxis) + 1;
            var yIndex = request.SelectedFields.IndexOf(chartConfig.YAxis) + 1;

            if (xIndex == 0 || yIndex == 0) return;

            var chart = worksheet.Drawings.AddChart(chartConfig.Title, eChartType.ColumnClustered);
            chart.Title.Text = chartConfig.Title;
            chart.SetPosition(startRow, 0, 1, 0);
            chart.SetSize(600, 400);

            var dataRange = worksheet.Cells[2, yIndex, request.Data.Count + 1, yIndex];
            var xRange = worksheet.Cells[2, xIndex, request.Data.Count + 1, xIndex];

            var series = chart.Series.Add(dataRange, xRange);
            series.Header = chartConfig.YAxis;
        }

        public byte[] GenerateWordReport(ReportRequest request)
        {
            try
            {
                using var stream = new MemoryStream();
                using (var wordDocument = WordprocessingDocument.Create(stream, WordprocessingDocumentType.Document))
                {
                    var mainPart = wordDocument.AddMainDocumentPart();
                    mainPart.Document = new Document();
                    var body = mainPart.Document.AppendChild(new Body());

                    // Add title
                    var titleParagraph = body.AppendChild(new Paragraph());
                    var titleRun = titleParagraph.AppendChild(new Run());
                    titleRun.AppendChild(new Text(request.Configuration.Title ?? "Report"));
                    
                    // Style the title
                    var runProperties = titleRun.PrependChild(new RunProperties());
                    runProperties.AppendChild(new Bold());
                    runProperties.AppendChild(new DocumentFormat.OpenXml.Wordprocessing.FontSize() { Val = "32" });

                    // Add space
                    body.AppendChild(new Paragraph());

                    // Create table
                    var table = new Table();
                    
                    // Create table properties
                    var tableProperties = new TableProperties();
                    var tableBorders = new TableBorders();
                    tableBorders.AppendChild(new TopBorder() { Val = BorderValues.Single });
                    tableBorders.AppendChild(new BottomBorder() { Val = BorderValues.Single });
                    tableBorders.AppendChild(new LeftBorder() { Val = BorderValues.Single });
                    tableBorders.AppendChild(new RightBorder() { Val = BorderValues.Single });
                    tableBorders.AppendChild(new InsideHorizontalBorder() { Val = BorderValues.Single });
                    tableBorders.AppendChild(new InsideVerticalBorder() { Val = BorderValues.Single });
                    tableProperties.AppendChild(tableBorders);
                    table.AppendChild(tableProperties);

                    // Add headers
                    var headerRow = new TableRow();
                    foreach (var field in request.SelectedFields)
                    {
                        var displayName = request.Configuration.FieldMappings?.ContainsKey(field) == true 
                            ? request.Configuration.FieldMappings[field] 
                            : field;
                        
                        var cell = new TableCell();
                        var paragraph = new Paragraph();
                        var run = new Run();
                        var runProps = new RunProperties();
                        runProps.AppendChild(new Bold());
                        run.AppendChild(runProps);
                        run.AppendChild(new Text(displayName));
                        paragraph.AppendChild(run);
                        cell.AppendChild(paragraph);
                        headerRow.AppendChild(cell);
                    }
                    table.AppendChild(headerRow);

                    // Add data rows
                    foreach (var row in request.Data)
                    {
                        var dataRow = new TableRow();
                        foreach (var field in request.SelectedFields)
                        {
                            var cell = new TableCell();
                            var value = row.ContainsKey(field) ? row[field]?.ToString() ?? "" : "";
                            cell.AppendChild(new Paragraph(new Run(new Text(value))));
                            dataRow.AppendChild(cell);
                        }
                        table.AppendChild(dataRow);
                    }

                    body.AppendChild(table);
                }

                return stream.ToArray();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating Word report");
                throw;
            }
        }
    }
}