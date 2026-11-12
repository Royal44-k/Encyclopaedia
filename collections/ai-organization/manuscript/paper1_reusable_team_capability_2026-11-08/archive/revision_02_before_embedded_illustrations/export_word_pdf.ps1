$ErrorActionPreference = 'Stop'
$taskDir = $PSScriptRoot
$docDir = Join-Path $taskDir 'deliverables'
$wordApp = $null
try {
    $wordApp = New-Object -ComObject Word.Application
    $wordApp.Visible = $false
    $wordApp.DisplayAlerts = 0
    foreach ($lang in @('en','zh')) {
        $docPath = Join-Path $docDir "paper1_$lang.docx"
        $pdfPath = Join-Path $docDir "paper1_$lang.pdf"
        if (-not (Test-Path -LiteralPath $docPath)) { continue }
        $taskDoc = $null
        try {
            $taskDoc = $wordApp.Documents.Open($docPath, $false, $true)
            $taskDoc.Repaginate()
            $taskDoc.ExportAsFixedFormat($pdfPath, 17)
            Write-Output "Exported $lang PDF with $($taskDoc.ComputeStatistics(2)) pages"
        } finally {
            if ($null -ne $taskDoc) { $taskDoc.Close(0); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($taskDoc) }
        }
    }
} finally {
    if ($null -ne $wordApp) { $wordApp.Quit(); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($wordApp) }
}
