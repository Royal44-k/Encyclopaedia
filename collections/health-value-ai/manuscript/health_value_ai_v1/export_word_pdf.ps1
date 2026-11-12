$ErrorActionPreference = 'Stop'
$taskDir = $PSScriptRoot
$docxPath = [System.IO.Path]::GetFullPath((Join-Path $taskDir 'Health_value_AI_Perspective.docx'))
$pdfPath = [System.IO.Path]::GetFullPath((Join-Path $taskDir 'Health_value_AI_Perspective.pdf'))
$wordTask = $null
$documentTask = $null
try {
    $wordTask = New-Object -ComObject Word.Application
    $wordTask.Visible = $false
    $wordTask.DisplayAlerts = 0
    $documentTask = $wordTask.Documents.Open($docxPath, $false, $true)
    $documentTask.Repaginate()
    $documentTask.ExportAsFixedFormat($pdfPath, 17)
    Write-Output ('Exported: ' + $pdfPath)
    Write-Output ('Pages: ' + $documentTask.ComputeStatistics(2))
} finally {
    if ($null -ne $documentTask) { $documentTask.Close(0); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($documentTask) }
    if ($null -ne $wordTask) { $wordTask.Quit(); [void][Runtime.InteropServices.Marshal]::ReleaseComObject($wordTask) }
}
